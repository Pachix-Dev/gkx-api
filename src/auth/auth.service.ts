import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  REFRESH_TOKEN_EXPIRES_IN_SECONDS,
} from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthSessionEntity } from './entities/auth-session.entity';
import { Role } from './roles.enum';
import { TenantEntity, TenantPlan, TenantStatus } from '../tenants/tenant.entity';
import { UserEntity, UserStatus } from '../users/user.entity';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(TenantEntity)
    private readonly tenantsRepository: Repository<TenantEntity>,
    @InjectRepository(AuthSessionEntity)
    private readonly sessionsRepository: Repository<AuthSessionEntity>,
  ) {}

  async registerTenant(dto: RegisterTenantDto) {
    const email = dto.email.toLowerCase();
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const slug = dto.tenantSlug ?? this.slugify(dto.tenantName);
    const existingTenant = await this.tenantsRepository.findOne({ where: { slug } });
    if (existingTenant) {
      throw new ConflictException('Tenant slug already in use');
    }

    const tenant = this.tenantsRepository.create({
      name: dto.tenantName,
      slug,
      plan: TenantPlan.FREE,
      status: TenantStatus.ACTIVE,
    });

    const savedTenant = await this.tenantsRepository.save(tenant);

    const user = this.usersRepository.create({
      tenantId: savedTenant.id,
      fullName: dto.fullName,
      email,
      passwordHash: await bcrypt.hash(dto.password, 10),
      role: Role.TENANT_ADMIN,
      status: UserStatus.ACTIVE,
    });

    const savedUser = await this.usersRepository.save(user);

    const tokens = await this.generateAndStoreTokens(savedUser);

    return {
      tenant: this.toPublicTenant(savedTenant),
      user: this.toPublicUser(savedUser),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tenant = await this.tenantsRepository.findOne({
      where: { id: user.tenantId },
    });
    const tokens = await this.generateAndStoreTokens(user);

    return {
      tenant: tenant ? this.toPublicTenant(tenant) : null,
      user: this.toPublicUser(user),
      ...tokens,
    };
  }

  async refresh(dto: RefreshTokenDto) {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(dto.refreshToken, {
        secret: JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!payload.sid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.sessionsRepository.findOne({
      where: { id: payload.sid },
    });
    if (!session || session.revokedAt || session.userId !== payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const refreshTokenMatches = await bcrypt.compare(
      dto.refreshToken,
      session.refreshTokenHash,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    session.revokedAt = new Date();
    await this.sessionsRepository.save(session);

    const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    const tenant = await this.tenantsRepository.findOne({
      where: { id: user.tenantId },
    });

    const tokens = await this.generateAndStoreTokens(user);

    return {
      user: this.toPublicUser(user),
      tenant: tenant ? this.toPublicTenant(tenant) : null,
      ...tokens,
    };
  }

  async logout(user: AuthenticatedUser) {
    await this.sessionsRepository
      .createQueryBuilder()
      .update(AuthSessionEntity)
      .set({ revokedAt: new Date() })
      .where('userId = :userId', { userId: user.userId })
      .andWhere('revokedAt IS NULL')
      .execute();

    return { revoked: true };
  }

  async me(user: AuthenticatedUser) {
    const existingUser = await this.usersRepository.findOne({
      where: { id: user.userId },
    });
    if (!existingUser) {
      throw new UnauthorizedException('User no longer exists');
    }

    const tenant = await this.tenantsRepository.findOne({
      where: { id: existingUser.tenantId },
    });

    return {
      user: this.toPublicUser(existingUser),
      tenant: tenant ? this.toPublicTenant(tenant) : null,
    };
  }

  private async generateAndStoreTokens(user: UserEntity): Promise<AuthTokens> {
    const sessionId = uuidv4();
    const payload: Omit<JwtPayload, 'type'> = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, type: 'access' },
        {
          secret: JWT_ACCESS_SECRET,
          expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
        },
      ),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh', sid: sessionId },
        {
          secret: JWT_REFRESH_SECRET,
          expiresIn: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
        },
      ),
    ]);

    const session = this.sessionsRepository.create({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: await bcrypt.hash(refreshToken, 10),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000),
      revokedAt: null,
    });
    await this.sessionsRepository.save(session);

    return {
      accessToken,
      refreshToken,
    };
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private toPublicUser(user: UserEntity) {
    return {
      id: user.id,
      tenantId: user.tenantId,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  private toPublicTenant(tenant: TenantEntity) {
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      status: tenant.status,
      createdAt: tenant.createdAt,
    };
  }
}
