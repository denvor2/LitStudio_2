import { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export async function styleRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  // Get author style for series
  app.get('/by-series/:seriesId', { preHandler: [auth] }, async (request) => {
    const { seriesId } = request.params as { seriesId: string };
    return prisma.authorStyle.findUnique({
      where: { seriesId },
      include: { stopList: { orderBy: { createdAt: 'asc' } } },
    });
  });

  // Upsert author style
  app.put('/by-series/:seriesId', { preHandler: [auth] }, async (request) => {
    const { seriesId } = request.params as { seriesId: string };
    const body = request.body as {
      pov?: string; tonality?: string; punctuationRules?: Prisma.InputJsonValue;
    };
    const createData: Prisma.AuthorStyleCreateInput = {
      series: { connect: { id: seriesId } },
      pov: body.pov,
      tonality: body.tonality,
      punctuationRules: body.punctuationRules ?? [],
    };
    const updateData: Prisma.AuthorStyleUpdateInput = {};
    if (body.pov !== undefined) updateData.pov = body.pov;
    if (body.tonality !== undefined) updateData.tonality = body.tonality;
    if (body.punctuationRules !== undefined) updateData.punctuationRules = body.punctuationRules;
    return prisma.authorStyle.upsert({
      where: { seriesId },
      create: createData,
      update: updateData,
    });
  });

  // Add stop list entry
  app.post('/stop-list', { preHandler: [auth] }, async (request) => {
    const { styleId, phrase, suggestion, example } = request.body as {
      styleId: string; phrase: string; suggestion?: string; example?: string;
    };
    return prisma.stopListEntry.create({
      data: { styleId, phrase, suggestion, example },
    });
  });

  // Update stop list entry
  app.put('/stop-list/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as { phrase?: string; suggestion?: string; example?: string };
    try {
      return await prisma.stopListEntry.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Stop list entry not found' });
    }
  });

  // Delete stop list entry
  app.delete('/stop-list/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.stopListEntry.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Stop list entry not found' });
    }
  });
}
