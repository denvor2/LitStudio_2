import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function plotBoardRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  // Get full plot board for a book
  app.get('/by-book/:bookId', { preHandler: [auth] }, async (request) => {
    const { bookId } = request.params as { bookId: string };
    const [arcs, cards] = await Promise.all([
      prisma.plotArc.findMany({ where: { bookId }, orderBy: { sortOrder: 'asc' } }),
      prisma.plotCard.findMany({
        where: { arc: { bookId } },
        orderBy: { sortOrder: 'asc' },
        include: { scene: { select: { id: true, title: true, status: true } } },
      }),
    ]);
    return { arcs, cards };
  });

  // Plot Arcs (columns)
  app.post('/arcs', { preHandler: [auth] }, async (request) => {
    const { bookId, title, color, sortOrder } = request.body as {
      bookId: string; title: string; color?: string; sortOrder?: number;
    };
    let order = sortOrder;
    if (order === undefined) {
      const last = await prisma.plotArc.findFirst({ where: { bookId }, orderBy: { sortOrder: 'desc' } });
      order = (last?.sortOrder ?? -1) + 1;
    }
    return prisma.plotArc.create({ data: { bookId, title, color, sortOrder: order } });
  });

  app.put('/arcs/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as { title?: string; color?: string; sortOrder?: number };
    try {
      return await prisma.plotArc.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Plot arc not found' });
    }
  });

  app.delete('/arcs/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.plotArc.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Plot arc not found' });
    }
  });

  // Plot Cards (cards)
  app.post('/cards', { preHandler: [auth] }, async (request) => {
    const data = request.body as {
      arcId: string; sceneId?: string; title: string; description?: string;
      sortOrder?: number; color?: string;
    };
    let order = data.sortOrder;
    if (order === undefined) {
      const last = await prisma.plotCard.findFirst({ where: { arcId: data.arcId }, orderBy: { sortOrder: 'desc' } });
      order = (last?.sortOrder ?? -1) + 1;
    }
    return prisma.plotCard.create({ data: { ...data, sortOrder: order } });
  });

  app.put('/cards/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Record<string, unknown>;
    try {
      return await prisma.plotCard.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Plot card not found' });
    }
  });

  app.put('/cards/reorder', { preHandler: [auth] }, async (request) => {
    const { cardIds, arcId } = request.body as { cardIds: string[]; arcId: string };
    const updates = cardIds.map((id, index) =>
      prisma.plotCard.update({ where: { id }, data: { sortOrder: index, arcId } })
    );
    await prisma.$transaction(updates);
    return { ok: true };
  });

  app.delete('/cards/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.plotCard.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Plot card not found' });
    }
  });
}
