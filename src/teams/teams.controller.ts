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
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamsService } from './teams.service';

@Controller('teams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.COACH)
  async create(
    @Body() dto: CreateTeamDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.teamsService.create(dto, user);
    return { success: true, message: 'Team created successfully', data };
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
    const data = await this.teamsService.findAll(user);
    return { success: true, message: 'Teams retrieved successfully', data };
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
    const data = await this.teamsService.findOne(id, user);
    return { success: true, message: 'Team retrieved successfully', data };
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.COACH)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeamDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.teamsService.update(id, dto, user);
    return { success: true, message: 'Team updated successfully', data };
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.teamsService.remove(id, user);
    return { success: true, message: 'Team deleted successfully', data };
  }

  @Post(':id/goalkeepers/:goalkeeperId')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.COACH)
  async assignGoalkeeper(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('goalkeeperId', ParseUUIDPipe) goalkeeperId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.teamsService.assignGoalkeeper(id, goalkeeperId, user);
    return {
      success: true,
      message: 'Goalkeeper assigned to team successfully',
      data,
    };
  }
}
