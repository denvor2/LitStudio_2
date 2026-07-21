import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function bookRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/by-project/:projectId', { preHandler: [auth] }, async (request) => {
    const { projectId } = request.params as { projectId: string };
    return prisma.book.findMany({
      where: { projectId },
      include: { _count: { select: { chapters: true } } },
      orderBy: { createdAt: 'asc' },
    });
  });

  app.post('/', { preHandler: [auth] }, async (request) => {
    const data = request.body as {
      projectId: string; title: string; subtitle?: string; genre?: string;
      tags?: string[]; annotationShort?: string; annotationFull?: string; targetChars?: number;
    };
    return prisma.book.create({
      data: { ...data, tags: data.tags || [] },
    });
  });

  app.get('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        chapters: { orderBy: { sortOrder: 'asc' }, include: { scenes: { orderBy: { sortOrder: 'asc' } } } },
      },
    });
    if (!book) return reply.code(404).send({ error: 'Book not found' });
    return book;
  });

  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Record<string, unknown>;
    try {
      return await prisma.book.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Book not found' });
    }
  });

  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.book.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Book not found' });
    }
  });
}
