import sharp from "sharp";
import fs from "fs";
import path from "path";

const IMAGE_SETS = [
  {
    input: "./public/fursona-art",
    output: "./public/thumbs/fursona-art"
  },
  {
    input: "./public/vrchat-pics",
    output: "./public/thumbs/vrchat-pics"
  }
];

const WIDTH = 400; // grid thumbnail size

async function generateForSet(set) {
  fs.mkdirSync(set.output, { recursive: true });

  const files = fs.readdirSync(set.input);

  for (const file of files) {
    const inputPath = path.join(set.input, file);
    const outputPath = path.join(set.output, file.replace(/\.(webp|jpg|png)$/, ".webp"));

    // skip non-images
    if (!file.match(/\.(webp|jpg|jpeg|png)$/)) continue;

    try {
      await sharp(inputPath)
        .resize(WIDTH, null, {
          withoutEnlargement: true
        })
        .webp({ quality: 70 })
        .toFile(outputPath);

      console.log("✔ thumb:", outputPath);
    } catch (err) {
      console.warn("✖ failed:", file, err.message);
    }
  }
}

async function run() {
  for (const set of IMAGE_SETS) {
    await generateForSet(set);
  }
}

run();