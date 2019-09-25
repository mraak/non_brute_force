import "tracking";
import chroma from "chroma-js";

function euclidean(v1, v2) {
  let d = 0;

  // for(let i = 0, n = v1.length; i < n; ++i)
  for(let i = 0, n = 3; i < n; ++i)
    d += (v1[i] - v2[i]) * (v1[i] - v2[i]);

  return Math.sqrt(d);
}

var targetColor = chroma.hex("#a5b291").hsv();

var streaming = true;

var video, task;
function init() {
  var canvas = document.getElementById("canvasOutput");
  var context = canvas.getContext("2d");

  tracking.ColorTracker.registerColor("green", function(r, g, b) {
    // console.log(euclidean(targetColor, chroma.rgb(r, g, b).hsv()));

    return euclidean(targetColor, chroma.rgb(r, g, b).hsv()) < 2;

    // const distance = chroma.distance(targetColor, chroma.rgb(r, g, b));
    // const distance = chroma.deltaE(targetColor, chroma.rgb(r, g, b));

    // return distance < 10;
  });

  var tracker = new tracking.ColorTracker("green");
  tracker.setMinDimension(1);
  // tracker.setMinDimension(5);
  task = tracking.track("#videoInput", tracker);
  tracker.on("track", function(event) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    event.data.forEach(function(rect) {
      context.strokeStyle = rect.color;
      context.strokeRect(rect.x, rect.y, rect.width, rect.height);
      // context.font = "11px Helvetica";
      // context.fillStyle = "#fff";
      // context.fillText("x: " + rect.x + "px", rect.x + rect.width + 5, rect.y + 11);
      // context.fillText("y: " + rect.y + "px", rect.x + rect.width + 5, rect.y + 22);
    });
  });
}

var loaded = 0;
var initialized = false;
function tryInit() {
  if(!initialized)
    ++loaded;

  // if(loaded < 2)
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
      video.addEventListener("pause", () => {
        streaming = false;

        if(task)
          task.stop();
      });
      // video.play();
    } catch(err) {
      console.error("onRuntimeInitialized", err);
    }
  };
};
