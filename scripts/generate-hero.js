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

const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith(".md"));

async function generate() {

for (const file of files) {

```
const filepath = path.join(CONTENT_DIR, file);
const content = fs.readFileSync(filepath, "utf8");

const { data } = matter(content);

const title = data.title;

if (!title) continue;

const html = template.replace("{{title}}", title);

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

const resvg = new Resvg(svg);

const png = resvg.render().asPng();

const slug = file.replace(".md", "");

const outputPath = path.join(OUTPUT_DIR, `${slug}.png`);

fs.writeFileSync(outputPath, png);

console.log("Hero generated:", slug);
```

}

}

generate();

