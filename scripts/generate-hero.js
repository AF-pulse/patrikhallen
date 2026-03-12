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

function wrapTitle(title, maxChars = 32) {

  const words = title.split(" ");
  let lines = [];
  let current = "";

  for (const word of words) {

    if ((current + word).length > maxChars) {
      lines.push(current.trim());
      current = word + " ";
    } else {
      current += word + " ";
    }

  }

  lines.push(current.trim());
  return lines;

}

async function generate() {

  for (const file of files) {

    const filepath = path.join(CONTENT_DIR, file);
    const content = fs.readFileSync(filepath, "utf8");

    const parsed = matter(content);

    const title = parsed.data.title;
    const topic = parsed.data.topic || "Perspective";

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

    const titleLines = wrapTitle(title);

    const svg = await satori(
      {
        type: "div",
        props: {

          style: {
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "row",
            background:
              "linear-gradient(135deg,#f6f6f6 0%,#f2f2f2 40%,#ededed 100%)",
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

            // Content container
            {
              type: "div",
              props: {

                style: {
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  paddingLeft: "90px",
                  paddingRight: "80px",
                  paddingTop: "80px",
                  paddingBottom: "80px",
                  flex: 1
                },

                children: [

                  // Topic badge
                  {
                    type: "div",
                    props: {

                      style: {
                        display: "inline-flex",
                        alignItems: "center",
                        fontSize: 18,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: "#c8102e",
                        marginBottom: 28,
                        fontWeight: 600
                      },

                      children: topic

                    }
                  },

                  // Title block
                  {
                    type: "div",
                    props: {

                      style: {
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        marginBottom: 40
                      },

                      children: titleLines.map((line) => ({
                        type: "div",
                        props: {
                          style: {
                            fontSize: 64,
                            fontWeight: 600,
                            lineHeight: 1.1,
                            color: "#222"
                          },
                          children: line
                        }
                      }))

                    }
                  },

                  // Author
                  {
                    type: "div",
                    props: {

                      style: {
                        fontSize: 26,
                        color: "#555",
                        display: "flex",
                        flexDirection: "column"
                      },

                      children: [
                        "A perspective from Patrik Hallén",
                        {
                          type: "div",
                          props: {
                            children: "Partner at Andersen Consulting"
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
