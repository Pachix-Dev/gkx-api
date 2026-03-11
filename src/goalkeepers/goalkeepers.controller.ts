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
import { CreateGoalkeeperDto } from './dto/create-goalkeeper.dto';
import { UpdateGoalkeeperDto } from './dto/update-goalkeeper.dto';
import { GoalkeepersService } from './goalkeepers.service';

@Controller('goalkeepers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GoalkeepersController {
  constructor(private readonly goalkeepersService: GoalkeepersService) {}

  @Post()
  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.COACH,
    Role.ASSISTANT_COACH,
  )
  async create(
    @Body() dto: CreateGoalkeeperDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.goalkeepersService.create(dto, user);
    return { success: true, message: 'Goalkeeper profile created successfully', data };
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
    const data = await this.goalkeepersService.findAll(user);
    return { success: true, message: 'Goalkeeper profiles retrieved successfully', data };
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
    const data = await this.goalkeepersService.findOne(id, user);
    return { success: true, message: 'Goalkeeper profile retrieved successfully', data };
  }

  @Get(':id/progress')
  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.COACH,
    Role.ASSISTANT_COACH,
    Role.READONLY,
  )
  async getProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.goalkeepersService.getProgress(id, user);
    return { success: true, message: 'Goalkeeper progress retrieved successfully', data };
  }

  @Get(':id/evaluations')
  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.COACH,
    Role.ASSISTANT_COACH,
    Role.READONLY,
  )
  async getEvaluations(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.goalkeepersService.getEvaluations(id, user);
    return { success: true, message: 'Goalkeeper evaluations retrieved successfully', data };
  }

  @Get(':id/metrics')
  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.COACH,
    Role.ASSISTANT_COACH,
    Role.READONLY,
  )
  async getMetrics(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.goalkeepersService.getMetrics(id, user);
    return { success: true, message: 'Goalkeeper metrics retrieved successfully', data };
  }

  @Patch(':id')
  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.COACH,
    Role.ASSISTANT_COACH,
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGoalkeeperDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.goalkeepersService.update(id, dto, user);
    return { success: true, message: 'Goalkeeper profile updated successfully', data };
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.goalkeepersService.remove(id, user);
    return { success: true, message: 'Goalkeeper profile deleted successfully', data };
  }
}
