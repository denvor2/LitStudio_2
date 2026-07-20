import { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export async function sceneRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  // Get scene
  app.get('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const scene = await prisma.scene.findUnique({
      where: { id },
      include: { chapter: true },
    });
    if (!scene) return reply.code(404).send({ error: 'Scene not found' });
    return scene;
  });

  // Create scene
  app.post('/', { preHandler: [auth] }, async (request) => {
    const { chapterId, title, sortOrder } = request.body as {
      chapterId: string;
      title?: string;
      sortOrder?: number;
    };

    let order = sortOrder;
    if (order === undefined) {
      const last = await prisma.scene.findFirst({
        where: { chapterId },
        orderBy: { sortOrder: 'desc' },
      });
      order = (last?.sortOrder ?? -1) + 1;
    }

    return prisma.scene.create({
      data: { chapterId, title, sortOrder: order },
    });
  });

  // Update scene (content, status, etc.)
  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      title?: string;
      content?: Prisma.InputJsonValue;
      contentPlaintext?: string;
      status?: string;
      tensionScore?: number;
    };

    const data: Prisma.SceneUpdateInput = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.content !== undefined) data.content = body.content;
    if (body.status !== undefined) data.status = body.status;
    if (body.tensionScore !== undefined) data.tensionScore = body.tensionScore;

    if (body.contentPlaintext !== undefined) {
      data.contentPlaintext = body.contentPlaintext;
      data.charCount = body.contentPlaintext.length;
      data.wordCount = body.contentPlaintext.split(/\s+/).filter(Boolean).length;
    }

    try {
      return await prisma.scene.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Scene not found' });
    }
  });

  // Delete scene
  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.scene.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Scene not found' });
    }
  });

  // Reorder scenes within chapter
  app.put('/reorder', { preHandler: [auth] }, async (request) => {
    const { sceneIds } = request.body as { sceneIds: string[] };
    const updates = sceneIds.map((id, index) =>
      prisma.scene.update({ where: { id }, data: { sortOrder: index } })
    );
    await prisma.$transaction(updates);
    return { ok: true };
  });
}
