import React from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  PrimaryNav
} from "mineral-ui";

export default () => {
  const buttonClicked = (event) => {
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
        return navigator.mediaDevices.enumerateDevices();
      })
      .then(gotDevices)
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <div>
      <button id="button" onClick={buttonClicked}>Get camera</button>
      <select id="select">
        <option />
      </select>
      <video id="video" autoplay playsinline />
    </div>
  );
};
