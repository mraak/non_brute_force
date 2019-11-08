
const FPS = 30;

var video;

var state;
function initState(video) {
  const state = {
    cap: new cv.VideoCapture(video),

    frame: new cv.Mat(video.height, video.width, cv.CV_8UC4),
    fgmask: new cv.Mat(video.height, video.width, cv.CV_8UC1),
    fgbg: new cv.BackgroundSubtractorMOG2(100, 32, true),
    // fgbg: new cv.BackgroundSubtractorMOG2(1000, 128, true),
    trackWindow: new cv.Rect(0, 0, video.width, video.height),

    // Setup the termination criteria, either 10 iteration or move by atleast 1 pt
    termCrit: new cv.TermCriteria(cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT, 0, 0),
  };

  return {
    ...state,

    destroy: () => {
      clearTimeout(state.timeoutId);

      // state.cap.delete();

      // clean and stop.
      state.frame.delete();
      state.fgmask.delete();
      state.fgbg.delete();

      // state.trackWindow.delete();
      // state.termCrit.delete();
    },
  }
}

function processVideo() {
  if(!state)
    return;

  try {
    const { cap, frame, fgmask, fgbg, trackWindow, termCrit } = state;

    let begin = Date.now();
    // start processing.
    cap.read(frame);
    fgbg.apply(frame, fgmask);

    let ksize = new cv.Size(3, 3);
    let anchor = new cv.Point(-1, -1);
    // You can try more different parameters
    cv.blur(fgmask, fgmask, ksize, anchor, cv.BORDER_DEFAULT);
    // cv.boxFilter(fgmask, fgmask, -1, ksize, anchor, true, cv.BORDER_DEFAULT);

    cv.threshold(fgmask, fgmask, 201, 255, cv.THRESH_BINARY);

    // apply camshift to get the new location
    [ trackBox, newTrackWindow ] = cv.CamShift(fgmask, trackWindow, termCrit);
    state.trackWindow = newTrackWindow;

    // let output = fgmask;
    let output = frame;

    // Draw it on image
    let pts = cv.rotatedRectPoints(trackBox);
    cv.line(output, pts[0], pts[1], [255, 0, 0, 255], 3);
    cv.line(output, pts[1], pts[2], [255, 0, 0, 255], 3);
    cv.line(output, pts[2], pts[3], [255, 0, 0, 255], 3);
    cv.line(output, pts[3], pts[0], [255, 0, 0, 255], 3);
    cv.imshow("canvasOutput", output);

    // console.log(pts);

    // schedule the next one.
    let delay = 1000 / FPS - (Date.now() - begin);
    state.timeoutId = setTimeout(processVideo, delay);
  } catch (err) {
    // console.log(err);
  }
}

function stop() {
  if(!state)
    return;

  state.destroy();
  state = null;
}

var loaded = 0;
var initialized = false;
function tryInit() {
  if(!initialized)
    ++loaded;

  if(loaded < 3)
    return;

  initialized = true;

  stop();
  state = initState(video);

  // schedule the first one.
  state.timeoutId = setTimeout(processVideo, 0);
}

window.onOpenCvReady = () => {
  tryInit();

  document.getElementById("status").innerHTML = "OpenCV.js is ready.";

  cv.onRuntimeInitialized = () => {
    tryInit();

    try {
      video = document.getElementById("videoInput");
      video.addEventListener("playing", tryInit);
      video.addEventListener("pause", stop);
    } catch(err) {
      console.error("onRuntimeInitialized", err);
    }
  };
};


const button = document.getElementById('button');
const select = document.getElementById('select');
let currentStream;

function stopMediaTracks(stream) {
  stream.getTracks().forEach(track => {
    track.stop();
  });
}

function gotDevices(mediaDevices) {
  select.innerHTML = '';
  select.appendChild(document.createElement('option'));
  let count = 1;
  mediaDevices.forEach(mediaDevice => {
    if (mediaDevice.kind === 'videoinput') {
      const option = document.createElement('option');
      option.value = mediaDevice.deviceId;
      const label = mediaDevice.label || `Camera ${count++}`;
      const textNode = document.createTextNode(label);
      option.appendChild(textNode);
      select.appendChild(option);
    }
  });
}

button.addEventListener('click', event => {
  if (typeof currentStream !== 'undefined') {
    stopMediaTracks(currentStream);
  }
  const videoConstraints = {};
  if (select.value === '') {
    videoConstraints.facingMode = 'environment';
  } else {
    videoConstraints.deviceId = { exact: select.value };
  }
  const constraints = {
    video: videoConstraints,
    audio: false
  };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
      currentStream = stream;
      video.srcObject = stream;
      // tryInit
      return navigator.mediaDevices.enumerateDevices();
    })
    .then(gotDevices)
    .catch(error => {
      console.error(error);
    });
});

navigator.mediaDevices.enumerateDevices().then(gotDevices);