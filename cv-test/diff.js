var streaming = true;

var video;
function init() {
  // video.removeEventListener("play", tryInit);

  let cap = new cv.VideoCapture(video);

  let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  let fgmask = new cv.Mat(video.height, video.width, cv.CV_8UC1);
  let fgbg = new cv.BackgroundSubtractorMOG2(500, 16, true);
  // let fgbg = new cv.BackgroundSubtractorMOG2(1000, 128, true);

  const FPS = 30;
  function processVideo() {
      try {
          if (!streaming) {
              // clean and stop.
              frame.delete(); fgmask.delete(); fgbg.delete();
              return;
          }
          let begin = Date.now();
          // start processing.
          cap.read(frame);
          fgbg.apply(frame, fgmask);
          cv.imshow('canvasOutput', fgmask);
          // schedule the next one.
          let delay = 1000/FPS - (Date.now() - begin);
          setTimeout(processVideo, delay);
      } catch (err) {
          console.log(err);
      }
  };

  // schedule the first one.
  setTimeout(processVideo, 0);
}

var loaded = 0;
var initialized = false;
function tryInit() {
  if(!initialized)
    ++loaded;

  if(loaded < 3)
    return;

  initialized = true;
  streaming = true;

  init();
}

window.onOpenCvReady = () => {
  tryInit();

  document.getElementById("status").innerHTML = "OpenCV.js is ready.";

  cv.onRuntimeInitialized = () => {
    tryInit();

    try {
      video = document.getElementById("videoInput");
      video.addEventListener("play", tryInit);
      video.addEventListener("pause", () => streaming = false);
      // video.play();
    } catch(err) {
      console.error("onRuntimeInitialized", err);
    }
  };
};
