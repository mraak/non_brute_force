window.onOpenCvReady = () => {
  document.getElementById("status").innerHTML = "OpenCV.js is ready.";

  let imgElement = document.getElementById("imageSrc");
  let inputElement = document.getElementById("fileInput");

  inputElement.addEventListener("change", (e) => {
    imgElement.src = URL.createObjectURL(e.target.files[0]);
  }, false);

  imgElement.onload = () => {
    let mat = cv.imread(imgElement);
    cv.imshow("canvasOutput", mat);
    mat.delete();
  };
};
