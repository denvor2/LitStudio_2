import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function ideaRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/by-book/:bookId', { preHandler: [auth] }, async (request) => {
    const { bookId } = request.params as { bookId: string };
    return prisma.idea.findMany({ where: { bookId }, orderBy: { createdAt: 'desc' } });
  });

  app.post('/', { preHandler: [auth] }, async (request) => {
    const data = request.body as {
      bookId: string; title?: string; content?: string; tags?: string[];
    };
    return prisma.idea.create({ data: { ...data, tags: data.tags || [] } });
  });

  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as { title?: string; content?: string; tags?: string[] };
    try {
      return await prisma.idea.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Idea not found' });
    }
  });

  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.idea.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Idea not found' });
    }
  });
}
