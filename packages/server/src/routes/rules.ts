import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function ruleRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/by-series/:seriesId', { preHandler: [auth] }, async (request) => {
    const { seriesId } = request.params as { seriesId: string };
    return prisma.rule.findMany({ where: { seriesId }, orderBy: { name: 'asc' } });
  });

  app.post('/', { preHandler: [auth] }, async (request) => {
    const data = request.body as {
      seriesId: string; scope?: string; bookId?: string;
      name: string; category?: string; formulation: string; exceptions?: string;
    };
    return prisma.rule.create({
      data: { ...data, scope: data.scope || 'series' },
    });
  });

  app.get('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const rule = await prisma.rule.findUnique({ where: { id } });
    if (!rule) return reply.code(404).send({ error: 'Rule not found' });
    return rule;
  });

  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<{
      name: string; category: string; formulation: string; exceptions: string;
      scope: string; status: string;
    }>;
    try {
      return await prisma.rule.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Rule not found' });
    }
  });

  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.rule.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Rule not found' });
    }
  });
}
