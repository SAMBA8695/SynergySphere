import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { User, TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTaskDto, currentUser: User) {
    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: dto.projectId, userId: currentUser.userId } },
    });
    if (!membership) throw new ForbiddenException('You are not part of this project');

    // Members can only self-assign
    if (membership.role === 'member') {
      if (!dto.assigneeId || dto.assigneeId !== currentUser.userId) {
        throw new ForbiddenException('Members can only assign tasks to themselves');
      }
    } else {
      // admin/owner: assignee must be project member
      if (dto.assigneeId) {
        const assigneeMembership = await this.prisma.projectMember.findUnique({
          where: { projectId_userId: { projectId: dto.projectId, userId: dto.assigneeId } },
        });
        if (!assigneeMembership) {
          throw new BadRequestException('Assignee must be a member of the project');
        }
      }
    }

     return this.prisma.task.create({
    data: {
      projectId: dto.projectId,
      title: dto.title,
      description: dto.description,
      assigneeId: dto.assigneeId ?? currentUser.userId, // ← default to self
      status: dto.status ?? TaskStatus.TODO,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });
  }

  async update(taskId: number, dto: UpdateTaskDto, currentUser: User) {
    const task = await this.prisma.task.findUnique({ where: { taskId } });
    if (!task) throw new NotFoundException('Task not found');

    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: currentUser.userId } },
    });
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new ForbiddenException('Not authorized to update this task');
    }

    return this.prisma.task.update({
      where: { taskId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.assigneeId && { assigneeId: dto.assigneeId }),
        ...(dto.status && { status: dto.status as TaskStatus }),
        ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
      },
    });
  }

  async delete(taskId: number, currentUser: User) {
    const task = await this.prisma.task.findUnique({ where: { taskId } });
    if (!task) throw new NotFoundException('Task not found');

    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: currentUser.userId } },
    });
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new ForbiddenException('Not authorized to delete this task');
    }

    await this.prisma.task.delete({ where: { taskId } });
    return { detail: 'Task deleted successfully' };
  }
}
