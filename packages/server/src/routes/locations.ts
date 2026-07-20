import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function locationRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/by-series/:seriesId', { preHandler: [auth] }, async (request) => {
    const { seriesId } = request.params as { seriesId: string };
    return prisma.location.findMany({ where: { seriesId }, orderBy: { name: 'asc' } });
  });

  app.post('/', { preHandler: [auth] }, async (request) => {
    const data = request.body as {
      seriesId: string; scope?: string; bookId?: string;
      name: string; category?: string; description?: string;
    };
    return prisma.location.create({
      data: { ...data, scope: data.scope || 'series' },
    });
  });

  app.get('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const loc = await prisma.location.findUnique({ where: { id } });
    if (!loc) return reply.code(404).send({ error: 'Location not found' });
    return loc;
  });

  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<{
      name: string; category: string; description: string; scope: string; status: string;
    }>;
    try {
      return await prisma.location.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Location not found' });
    }
  });

  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.location.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Location not found' });
    }
  });
}
