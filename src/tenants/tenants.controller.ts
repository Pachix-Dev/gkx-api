import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Role } from '../auth/roles.enum';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantsService } from './tenants.service';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  async create(@Body() dto: CreateTenantDto) {
    const data = await this.tenantsService.create(dto);
    return { success: true, message: 'Tenant created successfully', data };
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.tenantsService.findAll(user);
    return { success: true, message: 'Tenants retrieved successfully', data };
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.tenantsService.findOne(id, user);
    return { success: true, message: 'Tenant retrieved successfully', data };
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.tenantsService.update(id, dto, user);
    return { success: true, message: 'Tenant updated successfully', data };
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.tenantsService.remove(id);
    return { success: true, message: 'Tenant deleted successfully', data };
  }
}
