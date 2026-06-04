import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';

const archiveCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/library' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum(['Poetry', 'Short Story', 'Novel Sample']),
    tags: z.array(z.string()),
    pubDate: z.coerce.date(),
    cover: z.string().optional(),
  }),
});

export const collections = {
  library: archiveCollection,
};
