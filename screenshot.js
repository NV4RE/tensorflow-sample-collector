const FfmpegCommand = require("fluent-ffmpeg");

// Video length in second
const OFFSET = 0;
const VIDEO_LENGTH = 81;

new FfmpegCommand("./video.mp4")
  .setFfmpegPath("C:\\ffmpeg\\bin\\ffmpeg.exe")
  .takeScreenshots({
    size: "960x540",
    folder: "./samples",
    filename: "%i.png",
    timemarks: new Array(VIDEO_LENGTH)
      .fill()
      .map((_v, index) => index + 1 + OFFSET),
    fastSeek: true
  });
