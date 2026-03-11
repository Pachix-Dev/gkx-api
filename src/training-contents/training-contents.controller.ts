import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Role } from '../auth/roles.enum';
import { CreateTrainingContentDto } from './dto/create-training-content.dto';
import { UpdateTrainingContentDto } from './dto/update-training-content.dto';
import { TrainingContentsService } from './training-contents.service';

@Controller('training-contents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrainingContentsController {
  constructor(private readonly contentsService: TrainingContentsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.COACH, Role.ASSISTANT_COACH)
  async create(
    @Body() dto: CreateTrainingContentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.contentsService.create(dto, user);
    return { success: true, message: 'Training content created successfully', data };
  }

  @Get()
  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.COACH,
    Role.ASSISTANT_COACH,
    Role.READONLY,
  )
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('trainingLineId') trainingLineId?: string,
    @Query('level') level?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.contentsService.findAll(user, {
      trainingLineId,
      level,
      search,
    });
    return { success: true, message: 'Training contents retrieved successfully', data };
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
    const data = await this.contentsService.findOne(id, user);
    return { success: true, message: 'Training content retrieved successfully', data };
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.COACH, Role.ASSISTANT_COACH)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTrainingContentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.contentsService.update(id, dto, user);
    return { success: true, message: 'Training content updated successfully', data };
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.contentsService.remove(id, user);
    return { success: true, message: 'Training content deleted successfully', data };
  }
}
