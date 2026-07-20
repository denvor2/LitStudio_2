import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function characterRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/by-series/:seriesId', { preHandler: [auth] }, async (request) => {
    const { seriesId } = request.params as { seriesId: string };
    const { scope } = request.query as { scope?: string };
    return prisma.character.findMany({
      where: { seriesId, ...(scope ? { scope } : {}) },
      orderBy: { name: 'asc' },
    });
  });

  app.post('/', { preHandler: [auth] }, async (request) => {
    const data = request.body as {
      seriesId: string;
      scope?: string;
      bookId?: string;
      name: string;
      role?: string;
      description?: string;
      nameVariants?: Array<{ name: string; context: string }>;
    };
    return prisma.character.create({
      data: {
        seriesId: data.seriesId,
        scope: data.scope || 'series',
        bookId: data.bookId,
        name: data.name,
        role: data.role,
        description: data.description,
        nameVariants: data.nameVariants || [],
      },
    });
  });

  app.get('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const character = await prisma.character.findUnique({
      where: { id },
      include: { arcs: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!character) return reply.code(404).send({ error: 'Character not found' });
    return character;
  });

  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<{
      name: string;
      role: string;
      description: string;
      nameVariants: Array<{ name: string; context: string }>;
      scope: string;
      status: string;
    }>;
    try {
      return await prisma.character.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Character not found' });
    }
  });

  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.character.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Character not found' });
    }
  });
}
