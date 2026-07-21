import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function beatRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/by-scene/:sceneId', { preHandler: [auth] }, async (request) => {
    const { sceneId } = request.params as { sceneId: string };
    return prisma.beat.findMany({ where: { sceneId }, orderBy: { sortOrder: 'asc' } });
  });

  app.post('/', { preHandler: [auth] }, async (request) => {
    const { sceneId, title, description, sortOrder } = request.body as {
      sceneId: string; title?: string; description?: string; sortOrder?: number;
    };
    let order = sortOrder;
    if (order === undefined) {
      const last = await prisma.beat.findFirst({ where: { sceneId }, orderBy: { sortOrder: 'desc' } });
      order = (last?.sortOrder ?? -1) + 1;
    }
    return prisma.beat.create({ data: { sceneId, title, description, sortOrder: order } });
  });

  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as { title?: string; description?: string; sortOrder?: number };
    try {
      return await prisma.beat.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Beat not found' });
    }
  });

  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.beat.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Beat not found' });
    }
  });
}
