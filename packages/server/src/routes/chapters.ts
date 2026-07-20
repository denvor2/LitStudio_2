import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function chapterRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  // List chapters in book
  app.get('/by-book/:bookId', { preHandler: [auth] }, async (request) => {
    const { bookId } = request.params as { bookId: string };
    return prisma.chapter.findMany({
      where: { bookId },
      include: { _count: { select: { scenes: true } } },
      orderBy: { sortOrder: 'asc' },
    });
  });

  // Create chapter
  app.post('/', { preHandler: [auth] }, async (request) => {
    const { bookId, title, sortOrder } = request.body as {
      bookId: string;
      title: string;
      sortOrder?: number;
    };

    // Auto-calculate sort order if not provided
    let order = sortOrder;
    if (order === undefined) {
      const last = await prisma.chapter.findFirst({
        where: { bookId },
        orderBy: { sortOrder: 'desc' },
      });
      order = (last?.sortOrder ?? -1) + 1;
    }

    return prisma.chapter.create({
      data: { bookId, title, sortOrder: order },
    });
  });

  // Update chapter
  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as { title?: string; sortOrder?: number };
    try {
      return await prisma.chapter.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Chapter not found' });
    }
  });

  // Delete chapter
  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.chapter.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Chapter not found' });
    }
  });

  // Reorder chapters
  app.put('/reorder', { preHandler: [auth] }, async (request) => {
    const { chapterIds } = request.body as { chapterIds: string[] };
    const updates = chapterIds.map((id, index) =>
      prisma.chapter.update({ where: { id }, data: { sortOrder: index } })
    );
    await prisma.$transaction(updates);
    return { ok: true };
  });
}
