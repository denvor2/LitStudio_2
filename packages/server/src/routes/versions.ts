import { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export async function versionRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  // Get versions for an entity
  app.get('/', { preHandler: [auth] }, async (request) => {
    const { entityType, entityId } = request.query as { entityType: string; entityId: string };
    return prisma.version.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  });

  // Create version (snapshot)
  app.post('/', { preHandler: [auth] }, async (request) => {
    const { entityType, entityId, snapshot, source } = request.body as {
      entityType: string; entityId: string; snapshot: Prisma.InputJsonValue; source: string;
    };
    return prisma.version.create({
      data: { entityType, entityId, snapshot, source },
    });
  });

  // Get diff between two versions
  app.get('/:id/diff', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const version = await prisma.version.findUnique({ where: { id } });
    if (!version) return reply.code(404).send({ error: 'Version not found' });

    // Get current state of entity
    let current: unknown = null;
    switch (version.entityType) {
      case 'scene':
        current = await prisma.scene.findUnique({ where: { id: version.entityId } });
        break;
      case 'character':
        current = await prisma.character.findUnique({ where: { id: version.entityId } });
        break;
      // Add more entity types as needed
    }

    return { version, current };
  });

  // Restore from version
  app.post('/:id/restore', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const version = await prisma.version.findUnique({ where: { id } });
    if (!version) return reply.code(404).send({ error: 'Version not found' });

    const snapshot = version.snapshot as Record<string, unknown>;

    switch (version.entityType) {
      case 'scene':
        await prisma.scene.update({
          where: { id: version.entityId },
          data: {
            content: snapshot.content as Prisma.InputJsonValue,
            title: snapshot.title as string,
          },
        });
        break;
      case 'character':
        await prisma.character.update({
          where: { id: version.entityId },
          data: { name: snapshot.name as string, description: snapshot.description as string },
        });
        break;
    }

    return { ok: true };
  });
}
