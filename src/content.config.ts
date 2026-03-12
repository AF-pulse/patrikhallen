import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const insights = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/insights" }),

  schema: z.object({
    title: z.string(),
    topic: z.string(),
    summary: z.string(),
    date: z.string()
  })
});

export const collections = {
  insights
};
