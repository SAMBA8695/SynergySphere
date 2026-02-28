import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '@prisma/client';

@ApiTags('Projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  // POST /projects
  @Post()
  @ApiOperation({ summary: 'Create a project (creator becomes owner)' })
  create(@Body() dto: CreateProjectDto, @GetUser() user: User) {
    return this.projectsService.create(dto, user.userId);
  }

  // GET /projects/:projectId
  @Get(':projectId')
  @ApiOperation({ summary: 'Get project details (members only)' })
  findOne(@Param('projectId', ParseIntPipe) projectId: number, @GetUser() user: User) {
    return this.projectsService.findById(projectId, user);
  }

  // PUT /projects/:projectId/update
  @Put(':projectId/update')
  @ApiOperation({ summary: 'Update project (owner/admin only)' })
  update(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: UpdateProjectDto,
    @GetUser() user: User,
  ) {
    return this.projectsService.update(projectId, dto, user);
  }

  // POST /projects/:projectId/members
  @Post(':projectId/members')
  @ApiOperation({ summary: 'Add member to project (owner/admin only)' })
  addMember(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: AddMemberDto,
    @GetUser() user: User,
  ) {
    return this.projectsService.addMember(projectId, dto, user);
  }

  // GET /projects/:projectId/tasks
  @Get(':projectId/tasks')
  @ApiOperation({ summary: 'Get all tasks in a project (members only)' })
  async getProjectTasks(
    @Param('projectId', ParseIntPipe) projectId: number,
    @GetUser() user: User,
  ) {
    const membership = await this.projectsService.getMembership(projectId, user.userId);
    if (!membership) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('Not authorized to view tasks');
    }
    // Delegate to prisma directly via service — kept lean
    return (this.projectsService as any).prisma.task.findMany({ where: { projectId } });
  }

  @Get(':projectId/members')
@ApiOperation({ summary: 'Get all members of a project' })
getMembers(
  @Param('projectId', ParseIntPipe) projectId: number,
  @GetUser() user: User,
) {
  return this.projectsService.getMembers(projectId, user);
}

@Delete(':projectId/members/:userId')
@ApiOperation({ summary: 'Remove a member from a project (owner/admin only)' })
removeMember(
  @Param('projectId', ParseIntPipe) projectId: number,
  @Param('userId', ParseIntPipe) userId: number,
  @GetUser() user: User,
) {
  return this.projectsService.removeMember(projectId, userId, user);
}
}
