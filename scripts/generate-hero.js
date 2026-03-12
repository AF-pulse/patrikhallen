import fs from "fs";
import path from "path";
import matter from "gray-matter";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const CONTENT_DIR = "./src/content/insights";
const TEMPLATE_PATH = "./templates/hero.html";
const OUTPUT_DIR = "./public/heroes";

/* ensure hero directory exists */

if (!fs.existsSync(OUTPUT_DIR)) {
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/* load template */

const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

/* read insight files */

const files = fs
.readdirSync(CONTENT_DIR)
.filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

async function generate() {

for (const file of files) {

```
const filepath = path.join(CONTENT_DIR, file);

const slug = file
  .replace(".md", "")
  .replace(".mdx", "");

const heroPath = path.join(OUTPUT_DIR, slug + ".png");

/* skip if hero already exists AND article unchanged */

if (fs.existsSync(heroPath)) {

  const heroStat = fs.statSync(heroPath);
  const articleStat = fs.statSync(filepath);

  if (heroStat.mtime >= articleStat.mtime) {
    console.log("Hero up-to-date:", slug);
    continue;
  }

}

const raw = fs.readFileSync(filepath, "utf8");

const { data } = matter(raw);

const title = data.title;

if (!title) {
  console.log("Skipping (no title):", file);
  continue;
}

const topic = data.topic || "Perspectives";

/* inject values into template */

let html = template
  .replace("{{title}}", title)
  .replace("{{topic}}", topic);

/* render HTML -> SVG */

const svg = await satori(
  {
    type: "div",
    props: {
      dangerouslySetInnerHTML: { __html: html }
    }
  },
  {
    width: 1200,
    height: 630,
    fonts: []
  }
);

/* SVG -> PNG */

const resvg = new Resvg(svg);

const png = resvg.render().asPng();

fs.writeFileSync(heroPath, png);

console.log("Hero generated:", slug);
```

}

}

generate();
