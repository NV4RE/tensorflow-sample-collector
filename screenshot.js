const fs = require("fs");
const FfmpegCommand = require("fluent-ffmpeg");

// Video length in second
const OFFSET = 0;
const VIDEO_LENGTH = 81;

const files = fs
  .readdirSync("./videos", {
    withFileTypes: true
  })
  .filter(file => file.isFile() && /.(flv|mp4|mkv|avi)$/i.test(file.name));

for (const file of files) {
  new FfmpegCommand(`./videos/${file.name}`)
    .setFfmpegPath("C:\\ffmpeg\\bin\\ffmpeg.exe")
    .takeScreenshots({
      size: "1920x1080",
      folder: "./samples",
      filename: "%f-%i.png",
      timemarks: new Array(VIDEO_LENGTH)
        .fill()
        .map((_v, index) => index + 1 + OFFSET),
      fastSeek: true
    });
}
