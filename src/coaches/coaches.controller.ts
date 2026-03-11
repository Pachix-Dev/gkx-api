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
import { CoachesService } from './coaches.service';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';

@Controller('coaches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async create(
    @Body() dto: CreateCoachDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.coachesService.create(dto, user);
    return { success: true, message: 'Coach profile created successfully', data };
  }

  @Get()
  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.COACH,
    Role.ASSISTANT_COACH,
    Role.READONLY,
  )
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.coachesService.findAll(user);
    return { success: true, message: 'Coach profiles retrieved successfully', data };
  }

  @Get(':id')
  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.COACH,
    Role.ASSISTANT_COACH,
    Role.READONLY,
  )
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.coachesService.findOne(id, user);
    return { success: true, message: 'Coach profile retrieved successfully', data };
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCoachDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.coachesService.update(id, dto, user);
    return { success: true, message: 'Coach profile updated successfully', data };
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.coachesService.remove(id, user);
    return { success: true, message: 'Coach profile deleted successfully', data };
  }
}
