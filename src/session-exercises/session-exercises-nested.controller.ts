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

@Controller('training-sessions/:sessionId/exercises')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionExercisesNestedController {
  constructor(private readonly sessionExercisesService: SessionExercisesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.COACH, Role.ASSISTANT_COACH)
  async create(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() dto: CreateSessionExerciseDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.sessionExercisesService.createForSession(
      sessionId,
      dto,
      user,
    );
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
  async findBySession(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.sessionExercisesService.findBySession(sessionId, user);
    return { success: true, message: 'Session exercises retrieved successfully', data };
  }

  @Patch(':sessionExerciseId')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.COACH, Role.ASSISTANT_COACH)
  async update(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Param('sessionExerciseId', ParseUUIDPipe) sessionExerciseId: string,
    @Body() dto: UpdateSessionExerciseDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.sessionExercisesService.updateWithinSession(
      sessionId,
      sessionExerciseId,
      dto,
      user,
    );
    return { success: true, message: 'Session exercise updated successfully', data };
  }

  @Delete(':sessionExerciseId')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async remove(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Param('sessionExerciseId', ParseUUIDPipe) sessionExerciseId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.sessionExercisesService.removeWithinSession(
      sessionId,
      sessionExerciseId,
      user,
    );
    return { success: true, message: 'Session exercise deleted successfully', data };
  }
}
