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
import { AttendanceService } from './attendance.service';
import { CreateAttendanceBulkDto } from './dto/create-attendance-bulk.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.COACH, Role.ASSISTANT_COACH)
  async create(
    @Body() dto: CreateAttendanceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data: unknown = await this.attendanceService.create(dto, user);
    return {
      success: true,
      message: 'Attendance created successfully',
      data,
    };
  }

  @Post('bulk')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.COACH, Role.ASSISTANT_COACH)
  async createBulk(
    @Body() dto: CreateAttendanceBulkDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data: unknown = await this.attendanceService.createBulk(dto, user);
    return {
      success: true,
      message: 'Attendance bulk upsert successful',
      data,
    };
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
    const data: unknown = await this.attendanceService.findAll(user);
    return {
      success: true,
      message: 'Attendance records retrieved successfully',
      data,
    };
  }

  @Get('session/:sessionId')
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
    const data: unknown = await this.attendanceService.findBySession(
      sessionId,
      user,
    );
    return {
      success: true,
      message: 'Session attendance retrieved successfully',
      data,
    };
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
    const data: unknown = await this.attendanceService.findOne(id, user);
    return {
      success: true,
      message: 'Attendance record retrieved successfully',
      data,
    };
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.COACH, Role.ASSISTANT_COACH)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAttendanceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data: unknown = await this.attendanceService.update(id, dto, user);
    return {
      success: true,
      message: 'Attendance record updated successfully',
      data,
    };
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data: unknown = await this.attendanceService.remove(id, user);
    return {
      success: true,
      message: 'Attendance record deleted successfully',
      data,
    };
  }
}
