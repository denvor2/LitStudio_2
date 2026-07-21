import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function codexRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  // List codex entries with optional type filter
  app.get('/by-project/:projectId', { preHandler: [auth] }, async (request) => {
    const { projectId } = request.params as { projectId: string };
    const { type } = request.query as { type?: string };
    return prisma.codexEntry.findMany({
      where: { projectId, ...(type ? { type } : {}) },
      orderBy: { name: 'asc' },
    });
  });

  app.post('/', { preHandler: [auth] }, async (request) => {
    const data = request.body as {
      projectId: string; type: string; name: string;
      attributes?: Record<string, unknown>; scope?: string;
    };
    return prisma.codexEntry.create({
      data: {
        projectId: data.projectId,
        type: data.type,
        name: data.name,
        attributes: (data.attributes || {}) as any,
        scope: data.scope || 'series',
      },
    });
  });

  app.get('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const entry = await prisma.codexEntry.findUnique({
      where: { id },
      include: {
        sourceRelationships: { include: { targetEntry: true } },
        targetRelationships: { include: { sourceEntry: true } },
        sceneLinks: { include: { scene: true } },
      },
    });
    if (!entry) return reply.code(404).send({ error: 'Codex entry not found' });
    return entry;
  });

  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Record<string, unknown>;
    try {
      return await prisma.codexEntry.update({ where: { id }, data: data as any });
    } catch {
      return reply.code(404).send({ error: 'Codex entry not found' });
    }
  });

  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.codexEntry.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Codex entry not found' });
    }
  });

  // Relationships
  app.post('/relationships', { preHandler: [auth] }, async (request) => {
    const data = request.body as {
      projectId: string; sourceEntryId: string; targetEntryId: string;
      label?: string; description?: string;
    };
    return prisma.relationship.create({ data });
  });

  app.delete('/relationships/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.relationship.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Relationship not found' });
    }
  });

  // Scene entity links
  app.post('/scene-links', { preHandler: [auth] }, async (request) => {
    const { sceneId, entryId, linkType } = request.body as {
      sceneId: string; entryId: string; linkType: string;
    };
    return prisma.sceneEntityLink.create({ data: { sceneId, entryId, linkType } });
  });

  app.delete('/scene-links/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.sceneEntityLink.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Scene link not found' });
    }
  });
}
