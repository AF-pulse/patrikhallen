import fs from "fs";
import path from "path";
import matter from "gray-matter";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const CONTENT_DIR = "./src/content/insights";
const OUTPUT_DIR = "./public/heroes";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

if (!fs.existsSync(CONTENT_DIR)) {
  console.log("Insights directory not found:", CONTENT_DIR);
  process.exit(0);
}

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
      console.log("Skipping (no title):", file);
      continue;
    }

    const slug = file.replace(/\.mdx?$/, "");
    const heroPath = path.join(OUTPUT_DIR, slug + ".png");

    if (fs.existsSync(heroPath)) {
      console.log("Hero already exists:", slug);
      continue;
    }

    const svg = await satori(
      {
        type: "div",
        props: {
          style: {
            width: "1200px",
            height: "630px",
            background: "#111",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "120px",
            fontFamily: "Arial"
          },
          children: [
            {
              type: "div",
              props: {
                style: {
                  fontSize: 72,
                  lineHeight: 1.1,
                  fontWeight: 600
                },
                children: title
              }
            },
            {
              type: "div",
              props: {
                style: {
                  marginTop: 40,
                  fontSize: 28,
                  opacity: 0.7
                },
                children: [
                  "A perspective from Patrik Hallén",
                  {
                    type: "div",
                    props: {
                      children: "Member of Andersen Consulting"
                    }
                  }
                ]
              }
            }
          ]
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

    console.log("Hero generated:", slug);

  }

}

generate();
