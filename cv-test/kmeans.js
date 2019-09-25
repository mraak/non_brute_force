var streaming = true;

var video;
function init() {
  video.removeEventListener("playing", tryInit);

  let cap = new cv.VideoCapture(video);

  let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);

  const FPS = 1; // 30;
  function processVideo() {
    try {
      cap.read(frame);

      let mat = frame;

      let sample = new cv.Mat(mat.rows * mat.cols, 3, cv.CV_32F);
      for (var y = 0; y < mat.rows; y++)
        for (var x = 0; x < mat.cols; x++)
          for (var z = 0; z < 3; z++)
            sample.floatPtr(y + x * mat.rows)[z] = mat.ucharPtr(y, x)[z];

      var clusterCount = 8;
      var labels = new cv.Mat();
      var attempts = 5;
      var centers = new cv.Mat();

      var crite = new cv.TermCriteria(cv.TermCriteria_EPS + cv.TermCriteria_MAX_ITER, 10000, 0.0001);
      // var criteria = [1, 10, 0.0001];

      cv.kmeans(sample, clusterCount, labels, crite, attempts, cv.KMEANS_RANDOM_CENTERS, centers);

      var newImage = new cv.Mat(mat.size(), mat.type());
      for (var y = 0; y < mat.rows; y++) {
        for (var x = 0; x < mat.cols; x++) {
          var cluster_idx = labels.intAt(y + x * mat.rows, 0);
          var redChan = new Uint8Array(1);
          var greenChan = new Uint8Array(1);
          var blueChan = new Uint8Array(1);
          var alphaChan = new Uint8Array(1);
          redChan[0] = centers.floatAt(cluster_idx, 0);
          greenChan[0] = centers.floatAt(cluster_idx, 1);
          blueChan[0] = centers.floatAt(cluster_idx, 2);
          alphaChan[0] = 255;
          newImage.ucharPtr(y, x)[0] = redChan;
          newImage.ucharPtr(y, x)[1] = greenChan;
          newImage.ucharPtr(y, x)[2] = blueChan;
          newImage.ucharPtr(y, x)[3] = alphaChan;
        }
      }
      cv.imshow('canvasOutput', newImage);

      // schedule the next one.
      let delay = 1000 / FPS - (Date.now() - begin);
      setTimeout(processVideo, delay);
    } catch (err) {
      console.log(err);
      // utils.printError(err);
    }
  };

  // schedule the first one.
  setTimeout(processVideo, 0);
}

var loaded = 0;
function tryInit() {
  ++loaded;

  if (loaded < 3)
    return;

  init();
}

window.onOpenCvReady = () => {
  tryInit();

  document.getElementById("status").innerHTML = "OpenCV.js is ready.";

  cv.onRuntimeInitialized = () => {
    tryInit();

    try {
      video = document.getElementById("videoInput");
      video.addEventListener("playing", tryInit);
      // video.play();
    } catch (err) {
      console.error("onRuntimeInitialized", err);
    }
  };
};
