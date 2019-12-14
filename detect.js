require("@tensorflow/tfjs-node-gpu");
const cocoSsd = require("@tensorflow-models/coco-ssd");
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");

const font = "12px helvetica";

// https://github.com/tensorflow/tfjs-models/blob/master/coco-ssd/src/classes.ts
const INTERESTED_CLASSES = [
  "person",
  "bicycle",
  "car",
  "motorcycle",
  "bus",
  "truck"
];

let counter = 0;

const main = async () => {
  console.time("canvas");
  const canvas = createCanvas(960, 540);
  const bufferCanvas = createCanvas(960, 540);

  const ctx = canvas.getContext("2d");
  const BufferCtx = bufferCanvas.getContext("2d");

  console.timeEnd("canvas");
  console.time("model");
  const model = await cocoSsd.load();
  console.timeEnd("model");

  const files = fs
    .readdirSync("./samples", {
      withFileTypes: true
    })
    .filter(file => file.isFile());

  for (const file of files) {
    console.time("jpeg");
    const image = await loadImage(`./samples/${file.name}`);
    ctx.drawImage(image, 0, 0, 960, 540);
    console.timeEnd("jpeg");
    console.time("detect");
    const predictions = await model.detect(canvas, 5);
    console.timeEnd("detect");
    console.time("write");
    for (const prediction of predictions) {
      bufferCanvas.width = prediction.bbox[2];
      bufferCanvas.height = prediction.bbox[3];
      BufferCtx.drawImage(
        canvas,
        prediction.bbox[0],
        prediction.bbox[1],
        prediction.bbox[2],
        prediction.bbox[3],
        0,
        0,
        prediction.bbox[2],
        prediction.bbox[3]
      );

      fs.writeFileSync(
        `./detects/${++counter}.jpg`,
        bufferCanvas
          .toDataURL("image/jpeg")
          .replace(/^data:image\/jpeg;base64,/, ""),
        "base64"
      );
    }
    console.timeEnd("write");
  }
};

main();
