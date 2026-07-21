import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function outlineRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/by-book/:bookId', { preHandler: [auth] }, async (request) => {
    const { bookId } = request.params as { bookId: string };
    return prisma.outlineEntry.findMany({ where: { bookId }, orderBy: { sortOrder: 'asc' } });
  });

  app.post('/', { preHandler: [auth] }, async (request) => {
    const data = request.body as {
      bookId: string; chapterNumber?: number; sceneNumber?: number;
      summary: string; sortOrder?: number;
    };
    let order = data.sortOrder;
    if (order === undefined) {
      const last = await prisma.outlineEntry.findFirst({ where: { bookId: data.bookId }, orderBy: { sortOrder: 'desc' } });
      order = (last?.sortOrder ?? -1) + 1;
    }
    return prisma.outlineEntry.create({ data: { ...data, sortOrder: order } });
  });

  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as { summary?: string; sortOrder?: number };
    try {
      return await prisma.outlineEntry.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Outline entry not found' });
    }
  });

  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.outlineEntry.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Outline entry not found' });
    }
  });
}
