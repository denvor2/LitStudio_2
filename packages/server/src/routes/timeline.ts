import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function timelineRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/by-book/:bookId', { preHandler: [auth] }, async (request) => {
    const { bookId } = request.params as { bookId: string };
    return prisma.timelineEvent.findMany({
      where: { bookId },
      orderBy: { sortOrder: 'asc' },
      include: { scene: { select: { id: true, title: true } } },
    });
  });

  app.post('/', { preHandler: [auth] }, async (request) => {
    const data = request.body as {
      bookId: string; title: string; description?: string;
      eventDate?: string; relativeTime?: string; sceneId?: string; sortOrder?: number;
    };
    let order = data.sortOrder;
    if (order === undefined) {
      const last = await prisma.timelineEvent.findFirst({ where: { bookId: data.bookId }, orderBy: { sortOrder: 'desc' } });
      order = (last?.sortOrder ?? -1) + 1;
    }
    return prisma.timelineEvent.create({ data: { ...data, sortOrder: order } });
  });

  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Record<string, unknown>;
    try {
      return await prisma.timelineEvent.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Timeline event not found' });
    }
  });

  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.timelineEvent.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Timeline event not found' });
    }
  });
}
