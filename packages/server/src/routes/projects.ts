import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function projectRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/', { preHandler: [auth] }, async (request) => {
    const userId = (request as any).user.sub;
    return prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { collaborators: { some: { userId } } },
        ],
      },
      include: { _count: { select: { books: true, codexEntries: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  });

  app.post('/', { preHandler: [auth] }, async (request) => {
    const userId = (request as any).user.sub;
    const { title, description } = request.body as { title: string; description?: string };
    return prisma.project.create({
      data: { ownerId: userId, title, description },
    });
  });

  app.get('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const project = await prisma.project.findUnique({
      where: { id },
      include: { books: true, _count: { select: { codexEntries: true, collaborators: true } } },
    });
    if (!project) return reply.code(404).send({ error: 'Project not found' });
    return project;
  });

  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as { title?: string; description?: string; settings?: unknown };
    try {
      return await prisma.project.update({ where: { id }, data: data as any });
    } catch {
      return reply.code(404).send({ error: 'Project not found' });
    }
  });

  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.project.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Project not found' });
    }
  });

  // Collaborators
  app.get('/:id/collaborators', { preHandler: [auth] }, async (request) => {
    const { id } = request.params as { id: string };
    return prisma.collaborator.findMany({
      where: { projectId: id },
      include: { user: { select: { id: true, email: true, displayName: true } } },
    });
  });

  app.post('/:id/collaborators', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { email, role } = request.body as { email: string; role: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return reply.code(404).send({ error: 'User not found' });
    return prisma.collaborator.create({
      data: { projectId: id, userId: user.id, role },
    });
  });

  app.delete('/:id/collaborators/:collaboratorId', { preHandler: [auth] }, async (request, reply) => {
    const { collaboratorId } = request.params as { collaboratorId: string };
    try {
      await prisma.collaborator.delete({ where: { id: collaboratorId } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Collaborator not found' });
    }
  });
}
