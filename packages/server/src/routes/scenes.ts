import { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export async function sceneRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const scene = await prisma.scene.findUnique({
      where: { id },
      include: { chapter: true, beats: { orderBy: { sortOrder: 'asc' } }, entityLinks: { include: { entry: true } } },
    });
    if (!scene) return reply.code(404).send({ error: 'Scene not found' });
    return scene;
  });

  app.post('/', { preHandler: [auth] }, async (request) => {
    const { chapterId, title, sortOrder } = request.body as { chapterId: string; title?: string; sortOrder?: number };
    let order = sortOrder;
    if (order === undefined) {
      const last = await prisma.scene.findFirst({ where: { chapterId }, orderBy: { sortOrder: 'desc' } });
      order = (last?.sortOrder ?? -1) + 1;
    }
    return prisma.scene.create({ data: { chapterId, title, sortOrder: order } });
  });

  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    const data: Prisma.SceneUpdateInput = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.content !== undefined) data.content = body.content as Prisma.InputJsonValue;
    if (body.status !== undefined) data.status = body.status as string;
    if (body.povCharacterId !== undefined) data.povCharacterId = body.povCharacterId as string;
    if (body.locationId !== undefined) data.locationId = body.locationId as string;
    if (body.colorTag !== undefined) data.colorTag = body.colorTag as string;
    if (body.contentPlaintext !== undefined) {
      const text = body.contentPlaintext as string;
      data.wordCount = text.split(/\s+/).filter(Boolean).length;
      data.charCount = text.length;
    }
    try {
      return await prisma.scene.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Scene not found' });
    }
  });

  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.scene.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Scene not found' });
    }
  });
}
