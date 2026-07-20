import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function seriesRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  // List series
  app.get('/', { preHandler: [auth] }, async (request) => {
    const userId = (request as any).user.sub;
    return prisma.series.findMany({
      where: { ownerId: userId },
      include: { _count: { select: { books: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  });

  // Create series
  app.post('/', { preHandler: [auth] }, async (request) => {
    const userId = (request as any).user.sub;
    const { title, description } = request.body as { title: string; description?: string };
    return prisma.series.create({
      data: { ownerId: userId, title, description },
    });
  });

  // Get series by id
  app.get('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const series = await prisma.series.findUnique({
      where: { id },
      include: {
        books: { orderBy: { createdAt: 'asc' } },
        authorStyle: true,
        _count: { select: { characters: true, locations: true, organizations: true } },
      },
    });
    if (!series) return reply.code(404).send({ error: 'Series not found' });
    return series;
  });

  // Update series
  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as { title?: string; description?: string };
    try {
      return await prisma.series.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Series not found' });
    }
  });

  // Delete series
  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.series.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Series not found' });
    }
  });
}
