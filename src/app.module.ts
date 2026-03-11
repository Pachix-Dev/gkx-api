import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthSessionEntity } from './auth/entities/auth-session.entity';
import { TenantEntity } from './tenants/tenant.entity';
import { TenantsModule } from './tenants/tenants.module';
import { UserEntity } from './users/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'gkx_user',
      password: process.env.DB_PASSWORD ?? 'gkx_pass',
      database: process.env.DB_NAME ?? 'gkx_db',
      entities: [TenantEntity, UserEntity, AuthSessionEntity],
      synchronize: (process.env.DB_SYNC ?? 'true') === 'true',
    }),
    AuthModule,
    UsersModule,
    TenantsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
