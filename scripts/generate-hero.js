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

/* read all insight markdown files */

const files = fs
.readdirSync(CONTENT_DIR)
.filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

async function generate() {

for (const file of files) {

```
const filepath = path.join(CONTENT_DIR, file);

const raw = fs.readFileSync(filepath, "utf8");

const { data } = matter(raw);

const title = data.title;

if (!title) {
  console.log("Skipping (no title):", file);
  continue;
}

const topic = data.topic || "Perspectives";

/* inject variables into template */

let html = template
  .replace("{{title}}", title)
  .replace("{{topic}}", topic);

/* render html -> svg */

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

/* svg -> png */

const resvg = new Resvg(svg);

const png = resvg.render().asPng();

/* slug */

const slug = file
  .replace(".md", "")
  .replace(".mdx", "");

const outputPath = path.join(
  OUTPUT_DIR,
  `${slug}.png`
);

fs.writeFileSync(outputPath, png);

console.log("Hero generated:", slug);
```

}
}

generate();
