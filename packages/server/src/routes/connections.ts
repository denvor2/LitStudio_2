import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function connectionRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/by-series/:seriesId', { preHandler: [auth] }, async (request) => {
    const { seriesId } = request.params as { seriesId: string };
    return prisma.connection.findMany({ where: { seriesId } });
  });

  app.post('/', { preHandler: [auth] }, async (request) => {
    const data = request.body as {
      seriesId: string;
      sourceType: string; sourceId: string;
      targetType: string; targetId: string;
      label?: string;
    };
    return prisma.connection.create({ data });
  });

  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as { label?: string };
    try {
      return await prisma.connection.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Connection not found' });
    }
  });

  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.connection.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Connection not found' });
    }
  });
}
