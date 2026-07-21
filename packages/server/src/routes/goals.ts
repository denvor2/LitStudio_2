import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function goalRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/by-project/:projectId', { preHandler: [auth] }, async (request) => {
    const { projectId } = request.params as { projectId: string };
    return prisma.goal.findMany({ where: { projectId } });
  });

  app.post('/', { preHandler: [auth] }, async (request) => {
    const data = request.body as {
      projectId: string; type: string; targetWords: number; deadline?: string;
    };
    return prisma.goal.create({
      data: {
        projectId: data.projectId,
        type: data.type,
        targetWords: data.targetWords,
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
    });
  });

  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as { targetWords?: number; deadline?: string; currentWords?: number };
    try {
      return await prisma.goal.update({ where: { id }, data: data as any });
    } catch {
      return reply.code(404).send({ error: 'Goal not found' });
    }
  });

  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.goal.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Goal not found' });
    }
  });

  // Update daily progress
  app.post('/:id/progress', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { words } = request.body as { words: number };
    try {
      const goal = await prisma.goal.findUnique({ where: { id } });
      if (!goal) return reply.code(404).send({ error: 'Goal not found' });
      const newCurrent = goal.currentWords + words;
      const streak = newCurrent >= goal.targetWords ? goal.streak + 1 : 0;
      return prisma.goal.update({
        where: { id },
        data: { currentWords: newCurrent, streak },
      });
    } catch {
      return reply.code(404).send({ error: 'Goal not found' });
    }
  });
}
