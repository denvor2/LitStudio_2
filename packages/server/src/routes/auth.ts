import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const { email, password, displayName } = request.body as {
      email: string; password: string; displayName?: string;
    };
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return reply.code(409).send({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, displayName, authProvider: 'local' },
      select: { id: true, email: true, displayName: true, createdAt: true },
    });
    const token = app.jwt.sign({ sub: user.id }, { expiresIn: '15m' });
    const refresh = app.jwt.sign({ sub: user.id }, { expiresIn: '7d' });
    return { user, token, refreshToken: refresh };
  });

  app.post('/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return reply.code(401).send({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return reply.code(401).send({ error: 'Invalid credentials' });
    const token = app.jwt.sign({ sub: user.id }, { expiresIn: '15m' });
    const refresh = app.jwt.sign({ sub: user.id }, { expiresIn: '7d' });
    return { user: { id: user.id, email: user.email, displayName: user.displayName }, token, refreshToken: refresh };
  });

  app.post('/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string };
    try {
      const decoded = app.jwt.verify<{ sub: string }>(refreshToken);
      const token = app.jwt.sign({ sub: decoded.sub }, { expiresIn: '15m' });
      const newRefresh = app.jwt.sign({ sub: decoded.sub }, { expiresIn: '7d' });
      return { token, refreshToken: newRefresh };
    } catch {
      return reply.code(401).send({ error: 'Invalid refresh token' });
    }
  });

  app.get('/me', { preHandler: [(app as any).authenticate] }, async (request) => {
    return prisma.user.findUnique({
      where: { id: (request as any).user.sub },
      select: { id: true, email: true, displayName: true, avatarUrl: true, createdAt: true },
    });
  });
}
