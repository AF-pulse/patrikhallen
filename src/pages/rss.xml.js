import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {

  const posts = (await getCollection("insights"))
    .sort((a, b) => b.data.date - a.data.date);

  return rss({

    title: "Perspectives — Patrik Hallén",

    description:
      "Ideas on structure, transformation and execution.",

    site: context.site,

    items: posts.map((post) => ({

      title: post.data.title,

      description: post.data.summary,

      pubDate: post.data.date,

      link: `/insights/${post.id}/`

    }))

  });

}
