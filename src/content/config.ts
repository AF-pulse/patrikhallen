import { defineCollection, z } from "astro:content";

const insights = defineCollection({
  type: "content",
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
