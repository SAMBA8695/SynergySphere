import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto } from './dto/project.dto';
import { User } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: number) {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        createdBy: userId,
        members: {
          create: { userId, role: 'owner' },
        },
      },
    });
    return project;
  }

  async findById(projectId: number, currentUser: User) {
    const project = await this.prisma.project.findUnique({ where: { projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const membership = await this.getMembership(projectId, currentUser.userId);
    if (!membership) throw new ForbiddenException('Not authorized to view this project');

    return project;
  }

  async update(projectId: number, dto: UpdateProjectDto, currentUser: User) {
    const membership = await this.getMembership(projectId, currentUser.userId);
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new ForbiddenException('Not authorized to update this project');
    }

    const project = await this.prisma.project.findUnique({ where: { projectId } });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.project.update({
      where: { projectId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
      },
    });
  }

  async addMember(projectId: number, dto: AddMemberDto, currentUser: User) {
    const membership = await this.getMembership(projectId, currentUser.userId);
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new ForbiddenException('Not authorized to add members');
    }

    const existing = await this.getMembership(projectId, dto.userId);
    if (existing) throw new BadRequestException('User already a member of this project');

    return this.prisma.projectMember.create({
      data: { projectId, userId: dto.userId, role: dto.role ?? 'member' },
    });
  }

  async getMembership(projectId: number, userId: number) {
    return this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
  }
  async getMembers(projectId: number, currentUser: User) {
  const membership = await this.getMembership(projectId, currentUser.userId);
  if (!membership) throw new ForbiddenException('Not a member of this project');

  return this.prisma.projectMember.findMany({
    where: { projectId },
    include: { user: { select: { userId: true, name: true, email: true } } },
  });
}

async removeMember(projectId: number, targetUserId: number, currentUser: User) {
  const membership = await this.getMembership(projectId, currentUser.userId);
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    throw new ForbiddenException('Not authorized to remove members');
  }
  if (targetUserId === currentUser.userId) {
    throw new BadRequestException('You cannot remove yourself');
  }
  return this.prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId: targetUserId } },
  });
}
}

