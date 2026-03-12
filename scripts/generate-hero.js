import fs from "fs";
import path from "path";
import matter from "gray-matter";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const CONTENT_DIR = "./src/content/insights";
const TEMPLATE_PATH = "./templates/hero.html";
const OUTPUT_DIR = "./public/heroes";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

if (!fs.existsSync(CONTENT_DIR)) {
  console.log("Insights directory not found: " + CONTENT_DIR);
  process.exit(0);
}

const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

const files = fs
  .readdirSync(CONTENT_DIR)
  .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

async function generate() {

  for (const file of files) {

    const filepath = path.join(CONTENT_DIR, file);
    const content = fs.readFileSync(filepath, "utf8");

    const parsed = matter(content);
    const title = parsed.data.title;

    if (!title) {
      console.log("Skipping (no title): " + file);
      continue;
    }

    const slug = file.replace(/\.mdx?$/, "");
    const heroPath = path.join(OUTPUT_DIR, slug + ".png");

    if (fs.existsSync(heroPath)) {
      console.log("Hero already exists: " + slug);
      continue;
    }

    const html = template.replace("{{title}}", title);

    const svg = await satori(
      {
        type: "div",
        props: {
          dangerouslySetInnerHTML: {
            __html: html
          }
        }
      },
      {
        width: 1200,
        height: 630,
        fonts: []
      }
    );

    const resvg = new Resvg(svg);
    const png = resvg.render().asPng();

    fs.writeFileSync(heroPath, png);

    console.log("Hero generated: " + slug);

  }

}

generate();
