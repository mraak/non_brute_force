var streaming = true;

var video;
function init() {
  video.removeEventListener("playing", tryInit);

  let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
  let cap = new cv.VideoCapture(video);

  var prev;

  const FPS = 30;
  function processVideo() {
    try {
      if (!streaming) {
        // clean and stop.
        src.delete();
        dst.delete();
        return;
      }
      let begin = Date.now();
      // start processing.
      cap.read(src);
      cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

      if(prev) {
        let color = new cv.Scalar(255, 0, 0);

        // let diff = new cv.Mat;
        // cv.absdiff(dst, prev, diff);

        // // cv.imshow("canvasOutput", diff);

        // // after getting the difference, we binarize it
        // let thresh = new cv.Mat;
        // cv.threshold(diff, thresh, 0, 255, cv.THRESH_BINARY_INV | cv.THRESH_OTSU);

        // diff.delete();


        // let circlesMat = new cv.Mat;
        // cv.HoughCircles(thresh, circlesMat, cv.HOUGH_GRADIENT, 1, 45, 75, 40, 0, 0);

        // let displayMat = dst.clone();

        // for (let i = 0; i < circlesMat.cols; ++i) {
        //   let x = circlesMat.data32F[i * 3];
        //   let y = circlesMat.data32F[i * 3 + 1];
        //   let radius = circlesMat.data32F[i * 3 + 2];

        //   // draw circles
        //   let center = new cv.Point(x, y);
        //   cv.circle(displayMat, center, radius, [0, 0, 0, 255], 3);

        //   // break;
        // }

        // cv.imshow("canvasOutput", displayMat);
        // displayMat.delete();
        // circlesMat.delete();


        // let contours = new cv.MatVector;
        // let hierarchy = new cv.Mat;
        // // extract the contours in the threshold image
        // cv.findContours(thresh, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

        // for (let i = 0; i < contours.size(); ++i) {
        //   cv.drawContours(dst, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
        // }

        // contours.delete();
        // hierarchy.delete();

        // thresh.delete();


        let canny = new cv.Mat;

        // cv.Canny(dst, canny, 50, 200, 3);
        cv.Canny(dst, canny, 30, 30, 3, false);

        cv.imshow("canvasOutput", canny);

        // let lines = new cv.Mat;
        // // You can try more different parameters
        // cv.HoughLinesP(canny, lines, 1, Math.PI / 180, 2, 0, 0);

        canny.delete();

        // draw lines
        // for (let i = 0; i < lines.rows; ++i) {
        //   let startPoint = new cv.Point(lines.data32S[i * 4], lines.data32S[i * 4 + 1]);
        //   let endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);
        //   cv.line(dst, startPoint, endPoint, color);
        // }

        // // cv.imshow("canvasOutput", lines);

        // lines.delete();


        // color.delete();

        // console.log(contours, hierarchy);

        prev.delete();
      }

      // cv.imshow("canvasOutput", dst);

      prev = dst.clone();

      // schedule the next one.
      const delay = 1000 / FPS - (Date.now() - begin);
      setTimeout(processVideo, delay);

    } catch (err) {
      console.error("processVideo", err);
    }
  };

  // schedule the first one.
  setTimeout(processVideo, 0);
}

var loaded = 0;
function tryInit() {
  ++loaded;

  if(loaded < 3)
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
    } catch(err) {
      console.error("onRuntimeInitialized", err);
    }
  };
};
