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
import { CreateSessionContentDto } from './dto/create-session-content.dto';
import { UpdateSessionContentDto } from './dto/update-session-content.dto';
import { SessionContentsService } from './session-contents.service';

@Controller('session-contents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionContentsController {
  constructor(private readonly sessionContentsService: SessionContentsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.COACH, Role.ASSISTANT_COACH)
  async create(
    @Body() dto: CreateSessionContentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.sessionContentsService.create(dto, user);
    return { success: true, message: 'Session content created successfully', data };
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
    const data = await this.sessionContentsService.findAll(user);
    return { success: true, message: 'Session contents retrieved successfully', data };
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
    const data = await this.sessionContentsService.findOne(id, user);
    return { success: true, message: 'Session content retrieved successfully', data };
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.COACH, Role.ASSISTANT_COACH)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSessionContentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.sessionContentsService.update(id, dto, user);
    return { success: true, message: 'Session content updated successfully', data };
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.sessionContentsService.remove(id, user);
    return { success: true, message: 'Session content deleted successfully', data };
  }
}
