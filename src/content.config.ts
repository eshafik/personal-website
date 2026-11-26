import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const research = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/research' }),
  schema: z.object({
    title: z.string(),
    abstract: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    topics: z.array(z.string()).min(1),
    /** Drafts render in `npm run dev` only. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { research };
