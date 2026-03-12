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

const topicColors = {
  "Enterprise Architecture": "#c8102e",
  "Strategy Execution": "#8a1538",
  "Operating Model": "#7c2d12"
};

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

    const accent = topicColors[topic] || "#c8102e";
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
            background: "linear-gradient(135deg,#f7f7f7 0%,#f2f2f2 45%,#ececec 100%)",
            fontFamily: "Inter",
            position: "relative"
          },

          children: [

            {
              type: "div",
              props: {
                style: {
                  width: "14px",
                  height: "100%",
                  background: accent
                }
              }
            },

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

                  {
                    type: "div",
                    props: {
                      style: {
                        fontSize: 18,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: accent,
                        marginBottom: 28,
                        fontWeight: 600
                      },
                      children: topic
                    }
                  },

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

                        {
                          type: "div",
                          props: {
                            children: "A perspective from Patrik Hallén"
                          }
                        },

                        {
                          type: "div",
                          props: {
                            style: {
                              display: "flex",
                              gap: 6
                            },
                            children: [
                              "Partner at ",
                              {
                                type: "span",
                                props: {
                                  style: {
                                    color: accent,
                                    fontWeight: 600
                                  },
                                  children: "Andersen Consulting"
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
              type: "div",
              props: {
                style: {
                  position: "absolute",
                  bottom: "28px",
                  right: "40px",
                  fontSize: 20,
                  color: "#888"
                },
                children: "patrikhallen.com"
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
