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
import { CreateSessionExerciseDto } from './dto/create-session-exercise.dto';
import { UpdateSessionExerciseDto } from './dto/update-session-exercise.dto';
import { SessionExercisesService } from './session-exercises.service';

@Controller('session-exercises')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionExercisesController {
  constructor(private readonly sessionExercisesService: SessionExercisesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.COACH, Role.ASSISTANT_COACH)
  async create(
    @Body() dto: CreateSessionExerciseDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.sessionExercisesService.create(dto, user);
    return { success: true, message: 'Session exercise created successfully', data };
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
    const data = await this.sessionExercisesService.findAll(user);
    return { success: true, message: 'Session exercises retrieved successfully', data };
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
    const data = await this.sessionExercisesService.findOne(id, user);
    return { success: true, message: 'Session exercise retrieved successfully', data };
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.COACH, Role.ASSISTANT_COACH)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSessionExerciseDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.sessionExercisesService.update(id, dto, user);
    return { success: true, message: 'Session exercise updated successfully', data };
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.sessionExercisesService.remove(id, user);
    return { success: true, message: 'Session exercise deleted successfully', data };
  }
}
