import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { authRoutes } from './routes/auth.js';
import { seriesRoutes } from './routes/series.js';
import { bookRoutes } from './routes/books.js';
import { chapterRoutes } from './routes/chapters.js';
import { sceneRoutes } from './routes/scenes.js';
import { characterRoutes } from './routes/characters.js';
import { locationRoutes } from './routes/locations.js';
import { organizationRoutes } from './routes/organizations.js';
import { ruleRoutes } from './routes/rules.js';
import { termRoutes } from './routes/terms.js';
import { connectionRoutes } from './routes/connections.js';
import { matrixRoutes } from './routes/matrix.js';
import { timelineRoutes } from './routes/timeline.js';
import { styleRoutes } from './routes/style.js';
import { ideaRoutes } from './routes/ideas.js';
import { versionRoutes } from './routes/versions.js';
import { searchRoutes } from './routes/search.js';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(jwt, { secret: process.env.JWT_SECRET || 'dev-secret' });

// Auth middleware decorator
app.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

// Routes
await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(seriesRoutes, { prefix: '/api/series' });
await app.register(bookRoutes, { prefix: '/api/books' });
await app.register(chapterRoutes, { prefix: '/api/chapters' });
await app.register(sceneRoutes, { prefix: '/api/scenes' });
await app.register(characterRoutes, { prefix: '/api/characters' });
await app.register(locationRoutes, { prefix: '/api/locations' });
await app.register(organizationRoutes, { prefix: '/api/organizations' });
await app.register(ruleRoutes, { prefix: '/api/rules' });
await app.register(termRoutes, { prefix: '/api/terms' });
await app.register(connectionRoutes, { prefix: '/api/connections' });
await app.register(matrixRoutes, { prefix: '/api/matrix' });
await app.register(timelineRoutes, { prefix: '/api/timeline' });
await app.register(styleRoutes, { prefix: '/api/style' });
await app.register(ideaRoutes, { prefix: '/api/ideas' });
await app.register(versionRoutes, { prefix: '/api/versions' });
await app.register(searchRoutes, { prefix: '/api/search' });

const port = Number(process.env.PORT) || 3001;
await app.listen({ port, host: '0.0.0.0' });
app.log.info(`Server running on http://localhost:${port}`);
