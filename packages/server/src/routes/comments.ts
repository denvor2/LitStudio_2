import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function commentRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  // Get comments for a scene
  app.get('/by-scene/:sceneId', { preHandler: [auth] }, async (request) => {
    const { sceneId } = request.params as { sceneId: string };
    return prisma.comment.findMany({
      where: { sceneId },
      include: { author: { select: { id: true, displayName: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
  });

  // Get comments for a codex entry
  app.get('/by-entry/:entryId', { preHandler: [auth] }, async (request) => {
    const { entryId } = request.params as { entryId: string };
    return prisma.comment.findMany({
      where: { entryId },
      include: { author: { select: { id: true, displayName: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
  });

  // Create comment
  app.post('/', { preHandler: [auth] }, async (request) => {
    const authorId = (request as any).user.sub;
    const { sceneId, entryId, content, position } = request.body as {
      sceneId?: string; entryId?: string; content: string; position?: unknown;
    };
    return prisma.comment.create({
      data: {
        sceneId: sceneId || null,
        entryId: entryId || null,
        authorId,
        content,
        position: (position || {}) as any,
      },
      include: { author: { select: { id: true, displayName: true, email: true } } },
    });
  });

  // Update comment (resolve/unresolve)
  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as { resolved?: boolean; content?: string };
    try {
      return await prisma.comment.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Comment not found' });
    }
  });

  // Delete comment
  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.comment.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Comment not found' });
    }
  });
}
