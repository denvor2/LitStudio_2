import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { authRoutes } from './routes/auth.js';
import { projectRoutes } from './routes/projects.js';
import { bookRoutes } from './routes/books.js';
import { chapterRoutes } from './routes/chapters.js';
import { sceneRoutes } from './routes/scenes.js';
import { beatRoutes } from './routes/beats.js';
import { codexRoutes } from './routes/codex.js';
import { plotBoardRoutes } from './routes/plotBoard.js';
import { outlineRoutes } from './routes/outline.js';
import { goalRoutes } from './routes/goals.js';
import { timelineRoutes } from './routes/timeline.js';
import { commentRoutes } from './routes/comments.js';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(jwt, { secret: process.env.JWT_SECRET || 'dev-secret' });

app.decorate('authenticate', async (request: any, reply: any) => {
  try { await request.jwtVerify(); } catch { reply.code(401).send({ error: 'Unauthorized' }); }
});

await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(projectRoutes, { prefix: '/api/projects' });
await app.register(bookRoutes, { prefix: '/api/books' });
await app.register(chapterRoutes, { prefix: '/api/chapters' });
await app.register(sceneRoutes, { prefix: '/api/scenes' });
await app.register(beatRoutes, { prefix: '/api/beats' });
await app.register(codexRoutes, { prefix: '/api/codex' });
await app.register(plotBoardRoutes, { prefix: '/api/plot-board' });
await app.register(outlineRoutes, { prefix: '/api/outline' });
await app.register(goalRoutes, { prefix: '/api/goals' });
await app.register(timelineRoutes, { prefix: '/api/timeline' });
await app.register(commentRoutes, { prefix: '/api/comments' });

const port = Number(process.env.PORT) || 3001;
await app.listen({ port, host: '0.0.0.0' });
app.log.info(`Server running on http://localhost:${port}`);
