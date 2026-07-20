import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function bookRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  // List books in series
  app.get('/by-series/:seriesId', { preHandler: [auth] }, async (request) => {
    const { seriesId } = request.params as { seriesId: string };
    return prisma.book.findMany({
      where: { seriesId },
      include: { _count: { select: { chapters: true } } },
      orderBy: { createdAt: 'asc' },
    });
  });

  // Create book
  app.post('/', { preHandler: [auth] }, async (request) => {
    const { seriesId, title, subtitle, genre, tags, annotationShort, annotationFull, targetChars } =
      request.body as {
        seriesId: string;
        title: string;
        subtitle?: string;
        genre?: string;
        tags?: string[];
        annotationShort?: string;
        annotationFull?: string;
        targetChars?: number;
      };
    return prisma.book.create({
      data: { seriesId, title, subtitle, genre, tags: tags || [], annotationShort, annotationFull, targetChars },
    });
  });

  // Get book
  app.get('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        chapters: { orderBy: { sortOrder: 'asc' }, include: { scenes: { orderBy: { sortOrder: 'asc' } } } },
        _count: { select: { ideas: true } },
      },
    });
    if (!book) return reply.code(404).send({ error: 'Book not found' });
    return book;
  });

  // Update book
  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<{
      title: string;
      subtitle: string;
      genre: string;
      tags: string[];
      annotationShort: string;
      annotationFull: string;
      targetChars: number;
      status: string;
    }>;
    try {
      return await prisma.book.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Book not found' });
    }
  });

  // Delete book
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
