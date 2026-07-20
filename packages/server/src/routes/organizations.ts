import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function organizationRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/by-series/:seriesId', { preHandler: [auth] }, async (request) => {
    const { seriesId } = request.params as { seriesId: string };
    return prisma.organization.findMany({ where: { seriesId }, orderBy: { name: 'asc' } });
  });

  app.post('/', { preHandler: [auth] }, async (request) => {
    const data = request.body as {
      seriesId: string; scope?: string; bookId?: string;
      name: string; category?: string; description?: string;
    };
    return prisma.organization.create({
      data: { ...data, scope: data.scope || 'series' },
    });
  });

  app.get('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) return reply.code(404).send({ error: 'Organization not found' });
    return org;
  });

  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<{
      name: string; category: string; description: string; scope: string; status: string;
    }>;
    try {
      return await prisma.organization.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Organization not found' });
    }
  });

  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.organization.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Organization not found' });
    }
  });
}
