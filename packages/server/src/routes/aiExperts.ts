import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

// Built-in expert roles
const BUILTIN_EXPERTS = [
  {
    name: 'Соавтор',
    prompt: 'Ты — талантливый соавтор. Помогаешь с продолжением текста, генерацией идей и вариантов развития сцены. Пиши в стиле автора, учитывая контекст книги.',
    quickActions: [
      { id: 'continue', label: 'Продолжить', prompt: 'Продолжи эту сцену далее, развивая сюжет естественным образом.' },
      { id: 'rewrite', label: 'Переписать', prompt: 'Перепиши этот фрагмент, сохранив смысл, но улучшив стиль и читаемость.' },
      { id: 'variant', label: 'Предложи вариант', prompt: 'Предложи альтернативный вариант развития этой сцены.' },
    ],
  },
  {
    name: 'Редактор',
    prompt: 'Ты — опытный литературный редактор. Проверяешь текст на грамматику, стиль, структуру, темп повествования и логику сюжета. Даёшь конкретные замечания с указанием места в тексте.',
    quickActions: [
      { id: 'grammar', label: 'Грамматика', prompt: 'Проверь текст на грамматические ошибки, опечатки и пунктуацию.' },
      { id: 'style', label: 'Стиль', prompt: 'Оцени стиль текста: читаемость, ритм, длина предложений, повторы.' },
      { id: 'pace', label: 'Темп', prompt: 'Проанализируй темп повествования: нет ли затянутых мест, провисаний.' },
    ],
  },
  {
    name: 'Критик',
    prompt: 'Ты — строгий литературный критик. Даёшь честную, местами жёсткую оценку с точки зрения будущего читателя. Указываешь на слабые места, клише, вторичность.',
    quickActions: [
      { id: 'weak', label: 'Слабые места', prompt: 'Укажи на слабые места в тексте: что не работает, почему.' },
      { id: 'cliche', label: 'Клише', prompt: 'Найди клише и штампы в тексте, предложи оригинальные замены.' },
      { id: 'impact', label: 'Впечатление', prompt: 'Оцени общее впечатление от текста: что запоминается, что забывается.' },
    ],
  },
  {
    name: 'Читатель',
    prompt: 'Ты — обычный читатель жанровой прозы. Реагируешь на текст как реальный человек: что интересно, что скучно, кому будешь сопереживать, где потеряешь внимание.',
    quickActions: [
      { id: 'engage', label: 'Вовлечение', prompt: 'Оцени вовлечённость: где интересно, где теряешь внимание?' },
      { id: 'sympathy', label: 'Сопереживание', prompt: 'К каким персонажам возникает сопереживание, к каким — нет? Почему?' },
      { id: 'page', label: 'Страница за страницей', prompt: 'Хочется ли продолжать читать? Что зацепило, что оттолкнуло?' },
    ],
  },
];

export async function aiExpertRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  // Get all experts for a project (builtin + custom)
  app.get('/by-project/:projectId', { preHandler: [auth] }, async (request) => {
    const { projectId } = request.params as { projectId: string };
    const custom = await prisma.aIExpertRole.findMany({
      where: { projectId, isBuiltin: false },
    });
    return [
      ...BUILTIN_EXPERTS.map((e, i) => ({
        id: `builtin-${i}`,
        ...e,
        isBuiltin: true,
        projectId: null,
      })),
      ...custom.map((c) => ({
        ...c,
        quickActions: c.quickActions as any[],
      })),
    ];
  });

  // Create custom expert
  app.post('/', { preHandler: [auth] }, async (request) => {
    const data = request.body as {
      projectId: string; name: string; prompt: string;
      quickActions?: { id: string; label: string; prompt: string }[];
    };
    return prisma.aIExpertRole.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        prompt: data.prompt,
        quickActions: data.quickActions || [],
      },
    });
  });

  // Update expert
  app.put('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as { name?: string; prompt?: string; quickActions?: unknown };
    try {
      return await prisma.aIExpertRole.update({ where: { id }, data: data as any });
    } catch {
      return reply.code(404).send({ error: 'Expert not found' });
    }
  });

  // Delete expert
  app.delete('/:id', { preHandler: [auth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.aIExpertRole.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Expert not found' });
    }
  });

  // Invoke AI expert
  app.post('/invoke', { preHandler: [auth] }, async (request, reply) => {
    const { expertPrompt, text, context } = request.body as {
      expertPrompt: string;
      text: string;
      context?: string;
    };

    // In production, this would call OpenAI/Anthropic API
    // For now, return a mock response
    const response = {
      content: `[AI-эксперт]: Этот функционал требует подключения к LLM API (OpenAI/Anthropic).\n\nЗапрос:\n- Эксперт: ${expertPrompt.substring(0, 100)}...\n- Длина текста: ${text.length} символов\n- Контекст: ${context ? 'предоставлен' : 'отсутствует'}\n\nДля работы необходимо добавить API_KEY в .env файл.`,
      timestamp: new Date().toISOString(),
    };

    return response;
  });
}
