import fs from "fs";
import path from "path";
import matter from "gray-matter";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const CONTENT_DIR = "./src/content/insights";
const OUTPUT_DIR = "./public/heroes";
const FONT_PATH = "./assets/fonts/Inter_18pt-Regular.ttf";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

if (!fs.existsSync(CONTENT_DIR)) {
  console.log("Insights directory not found:", CONTENT_DIR);
  process.exit(0);
}

if (!fs.existsSync(FONT_PATH)) {
  console.log("Font not found:", FONT_PATH);
  process.exit(1);
}

const fontData = fs.readFileSync(FONT_PATH);

const files = fs
  .readdirSync(CONTENT_DIR)
  .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

async function generate() {

  for (const file of files) {

    const filepath = path.join(CONTENT_DIR, file);
    const content = fs.readFileSync(filepath, "utf8");

    const parsed = matter(content);
    const title = parsed.data.title;
    const topic = parsed.data.topic || "Perspectives";

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
            display: "flex",
            flexDirection: "row",
            background: "#f5f5f5",
            fontFamily: "Inter"
          },
          children: [

            // Andersen accent bar
            {
              type: "div",
              props: {
                style: {
                  width: "14px",
                  height: "100%",
                  background: "#c8102e"
                }
              }
            },

            // Content area
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  paddingLeft: "100px",
                  paddingRight: "80px",
                  paddingTop: "80px",
                  paddingBottom: "80px",
                  flex: 1
                },
                children: [

                  {
                    type: "div",
                    props: {
                      style: {
                        fontSize: 18,
                        letterSpacing: 3,
                        textTransform: "uppercase",
                        color: "#777",
                        marginBottom: 30
                      },
                      children: topic
                    }
                  },

                  {
                    type: "div",
                    props: {
                      style: {
                        fontSize: 64,
                        lineHeight: 1.15,
                        fontWeight: 600,
                        color: "#222",
                        maxWidth: 880
                      },
                      children: title
                    }
                  },

                  {
                    type: "div",
                    props: {
                      style: {
                        display: "flex",
                        flexDirection: "column",
                        marginTop: 40,
                        fontSize: 26,
                        color: "#555"
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
            }

          ]
        }
      },
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter",
            data: fontData,
            style: "normal"
          }
        ]
      }
    );

    const resvg = new Resvg(svg);
    const png = resvg.render().asPng();

    fs.writeFileSync(heroPath, png);

    console.log("Hero generated:", slug);

  }

}

generate();
