import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function termRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/by-series/:seriesId', { preHandler: [auth] }, async (request) => {
    const { seriesId } = request.params as { seriesId: string };
    return prisma.term.findMany({ where: { seriesId }, orderBy: { term: 'asc' } });
  });

  app.post('/', { preHandler: [auth] }, async (request) => {
    const data = request.body as {
      seriesId: string; scope?: string; bookId?: string;
      term: string; definition: string; synonyms?: string[]; category?: string;
    };
    return prisma.term.create({
      data: { ...data, scope: data.scope || 'series', synonyms: data.synonyms || [] },
    });
  });

  app.get('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const term = await prisma.term.findUnique({ where: { id } });
    if (!term) return reply.code(404).send({ error: 'Term not found' });
    return term;
  });

  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<{
      term: string; definition: string; synonyms: string[];
      category: string; scope: string; status: string;
    }>;
    try {
      return await prisma.term.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Term not found' });
    }
  });

  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.term.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Term not found' });
    }
  });
}
