import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '@prisma/client';

@ApiTags('Tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  // POST /tasks
  @Post()
  @ApiOperation({ summary: 'Create a task in a project' })
  create(@Body() dto: CreateTaskDto, @GetUser() user: User) {
  return this.tasksService.create(dto, user);
}

  // PUT /tasks/:taskId/update
  @Put(':taskId/update')
  @ApiOperation({ summary: 'Update a task (owner/admin only)' })
  update(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: UpdateTaskDto,
    @GetUser() user: User,
  ) {
    return this.tasksService.update(taskId, dto, user);
  }

  // DELETE /tasks/:taskId/delete
  @Delete(':taskId/delete')
  @ApiOperation({ summary: 'Delete a task (owner/admin only)' })
  delete(@Param('taskId', ParseIntPipe) taskId: number, @GetUser() user: User) {
    return this.tasksService.delete(taskId, user);
  }
}
