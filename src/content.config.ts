import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const archiveCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/library" }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    type: z.enum(["Poetry", "Short Story", "Novel Sample"]),
    tags: z.array(z.string()),
    pubDate: z.coerce.date(),
    cover: z.string().optional(),
    pinned: z.boolean().optional(),
    draft: z.boolean().optional(),
    hideMeta: z.boolean().optional()
  }),
});

export const collections = {
  library: archiveCollection,
};