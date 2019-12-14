require("@tensorflow/tfjs-node-gpu");
const cocoSsd = require("@tensorflow-models/coco-ssd");
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");

// https://github.com/tensorflow/tfjs-models/blob/master/coco-ssd/src/classes.ts
const INTERESTED_CLASSES = [
  "person",
  "bicycle",
  "car",
  "motorcycle",
  "bus",
  "truck"
];

const CROP_PADDING_RAIO = 1.5;

let counters = {};

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
    const predictions = await model.detect(canvas, 30);
    console.timeEnd("detect");
    console.time("write");
    const interestedPredictions = predictions.filter(prediction =>
      INTERESTED_CLASSES.includes(prediction.class)
    );
    for (const prediction of interestedPredictions) {
      bufferCanvas.width = prediction.bbox[2] * CROP_PADDING_RAIO;
      bufferCanvas.height = prediction.bbox[3] * CROP_PADDING_RAIO;

      BufferCtx.drawImage(
        canvas,
        prediction.bbox[0] -
          (prediction.bbox[2] * CROP_PADDING_RAIO - prediction.bbox[2]) / 2,
        prediction.bbox[1] -
          (prediction.bbox[3] * CROP_PADDING_RAIO - prediction.bbox[3]) / 2,
        prediction.bbox[2] +
          (prediction.bbox[2] * CROP_PADDING_RAIO - prediction.bbox[2]),
        prediction.bbox[3] +
          (prediction.bbox[3] * CROP_PADDING_RAIO - prediction.bbox[3]),
        0,
        0,
        prediction.bbox[2] * CROP_PADDING_RAIO,
        prediction.bbox[3] * CROP_PADDING_RAIO
      );

      const counter = counters[prediction.class]
        ? counters[prediction.class] + 1
        : 1;
      counters[prediction.class] = counter;

      fs.writeFileSync(
        `./detects/${prediction.class}-${counter}.jpg`,
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
