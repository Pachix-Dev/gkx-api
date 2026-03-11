import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-tenant')
  async registerTenant(@Body() dto: RegisterTenantDto) {
    const data = await this.authService.registerTenant(dto);

    return {
      success: true,
      message: 'Tenant registered successfully',
      data,
    };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);

    return {
      success: true,
      message: 'Login successful',
      data,
    };
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    const data = await this.authService.refresh(dto);

    return {
      success: true,
      message: 'Token refreshed successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.authService.logout(user);

    return {
      success: true,
      message: 'Logout successful',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.authService.me(user);

    return {
      success: true,
      message: 'Current user retrieved successfully',
      data,
    };
  }
}
