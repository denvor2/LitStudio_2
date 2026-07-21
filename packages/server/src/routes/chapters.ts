import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function chapterRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/by-book/:bookId', { preHandler: [auth] }, async (request) => {
    const { bookId } = request.params as { bookId: string };
    return prisma.chapter.findMany({
      where: { bookId },
      include: { _count: { select: { scenes: true } } },
      orderBy: { sortOrder: 'asc' },
    });
  });

  app.post('/', { preHandler: [auth] }, async (request) => {
    const { bookId, title, sortOrder } = request.body as { bookId: string; title: string; sortOrder?: number };
    let order = sortOrder;
    if (order === undefined) {
      const last = await prisma.chapter.findFirst({ where: { bookId }, orderBy: { sortOrder: 'desc' } });
      order = (last?.sortOrder ?? -1) + 1;
    }
    return prisma.chapter.create({ data: { bookId, title, sortOrder: order } });
  });

  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as { title?: string; sortOrder?: number };
    try {
      return await prisma.chapter.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Chapter not found' });
    }
  });

  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.chapter.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Chapter not found' });
    }
  });
}
