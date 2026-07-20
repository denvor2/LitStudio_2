import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function searchRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/', { preHandler: [auth] }, async (request) => {
    const { q, seriesId } = request.query as { q: string; seriesId: string };

    if (!q || q.length < 2) {
      return { results: [] };
    }

    const term = q.toLowerCase();

    // Parallel search across entities
    const [scenes, characters, locations, organizations, ideas] = await Promise.all([
      // Search scenes by plaintext content
      prisma.scene.findMany({
        where: {
          chapter: { book: { seriesId } },
          contentPlaintext: { contains: term, mode: 'insensitive' },
        },
        take: 20,
        include: { chapter: { select: { id: true, title: true, bookId: true } } },
      }),

      // Search characters
      prisma.character.findMany({
        where: {
          seriesId,
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: 20,
      }),

      // Search locations
      prisma.location.findMany({
        where: {
          seriesId,
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: 20,
      }),

      // Search organizations
      prisma.organization.findMany({
        where: {
          seriesId,
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: 20,
      }),

      // Search ideas
      prisma.idea.findMany({
        where: {
          book: { seriesId },
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { content: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: 20,
      }),
    ]);

    return {
      scenes: scenes.map((s) => ({ type: 'scene', ...s })),
      characters: characters.map((c) => ({ type: 'character', ...c })),
      locations: locations.map((l) => ({ type: 'location', ...l })),
      organizations: organizations.map((o) => ({ type: 'organization', ...o })),
      ideas: ideas.map((i) => ({ type: 'idea', ...i })),
    };
  });
}
