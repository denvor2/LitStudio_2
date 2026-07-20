import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function matrixRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  // Get full matrix for a book
  app.get('/by-book/:bookId', { preHandler: [auth] }, async (request) => {
    const { bookId } = request.params as { bookId: string };
    const [plotLines, cells] = await Promise.all([
      prisma.plotLine.findMany({ where: { bookId }, orderBy: { sortOrder: 'asc' } }),
      prisma.matrixCell.findMany({
        where: { bookId },
        orderBy: { sortOrder: 'asc' },
        include: { scene: { select: { id: true, title: true, status: true } } },
      }),
    ]);
    return { plotLines, cells };
  });

  // Add plot line
  app.post('/plot-lines', { preHandler: [auth] }, async (request) => {
    const { bookId, title, sortOrder } = request.body as {
      bookId: string; title: string; sortOrder?: number;
    };
    let order = sortOrder;
    if (order === undefined) {
      const last = await prisma.plotLine.findFirst({
        where: { bookId }, orderBy: { sortOrder: 'desc' },
      });
      order = (last?.sortOrder ?? -1) + 1;
    }
    return prisma.plotLine.create({ data: { bookId, title, sortOrder: order } });
  });

  // Update plot line
  app.put('/plot-lines/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as { title?: string; sortOrder?: number };
    try {
      return await prisma.plotLine.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Plot line not found' });
    }
  });

  // Delete plot line
  app.delete('/plot-lines/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.plotLine.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Plot line not found' });
    }
  });

  // Add matrix cell
  app.post('/cells', { preHandler: [auth] }, async (request) => {
    const data = request.body as {
      bookId: string; plotLineId: string; bitNumber: number;
      bitDescription?: string; sceneId?: string; sortOrder?: number;
    };
    return prisma.matrixCell.create({
      data: { ...data, status: data.sceneId ? 'linked' : 'pending' },
    });
  });

  // Update matrix cell
  app.put('/cells/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as {
      bitDescription?: string; sceneId?: string | null; status?: string;
    };
    try {
      return await prisma.matrixCell.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Matrix cell not found' });
    }
  });

  // Delete matrix cell
  app.delete('/cells/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.matrixCell.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Matrix cell not found' });
    }
  });
}
