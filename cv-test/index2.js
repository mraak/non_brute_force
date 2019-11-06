import p5 from "p5";

const sketch = (instance) => {
  //const cellSize = 5
  const columnCount = 11;
  const rowCount = 9;
  // const columnCount = 11;
  // const rowCount = 9;
  // const width = 854, height = 480;
  // const width = 500, height = 400;
  const canvasWidth = 854, canvasHeight = 480;
  const videoWidth = 620, videoHeight = 500;
  // const videoWidth = 640, videoHeight = 480;
  const cellWidth = videoWidth / columnCount;
  const cellHeight = videoHeight / rowCount;
  const x0 = videoWidth / 2;
  const y0 = videoHeight / 2;
  const centerLines = {
    x: [0, y0, videoWidth, y0 ],
    y: [x0, 0, x0, videoHeight],
  };

  const offsetX = (canvasWidth - videoWidth) / 2;
  const offsetY = (canvasHeight - videoHeight) / 2 + 30;


  // lines
  const yLines = []
  const xLines = []
  for(let i = 0; i <= columnCount; i++){
    yLines.push(
      [cellWidth * i, 0, cellWidth * i, videoHeight]
    )
  }

  for(let i = 0; i <= rowCount; i++){
    xLines.push(
      [0, cellHeight * i, videoWidth, cellHeight * i]
    )
  }

  // circles
  const fishFx = 40
  const rc = 8000000
  const yCircles = yLines.map((l, i) => {
    let dFromCenter = l[0] - x0
    if(dFromCenter === 0){
      dFromCenter = 0.001
    }
    let r = -rc / (dFromCenter * fishFx)
    let x = l[0] + r
    // if(dFromCenter === 0.001){
    //   x += 20
    //   //r = 700
    // }
    const c = {x, y: y0, r: Math.abs(r)}
    return c
  })

  const xCircles = xLines.map((l, i) => {
    let dFromCenter = l[1] - y0
    if(dFromCenter === 0){
      dFromCenter = 0.001
    }
    const r =  -rc / (dFromCenter * fishFx)
    const c = {x: x0, y: l[1] + r, r: Math.abs(r)}
    return c
  })

  instance.setup = function setup() {
    const c = instance.createCanvas(canvasWidth, canvasHeight);
    c.parent("out");
    // c.id("canvasOutput");
    c.id("lkajhskldahsd");

    instance.frameRate(4);
  }

  instance.draw = function draw() {
    instance.clear();

    instance.push();
    instance.translate(offsetX, offsetY);

    // instance.background(240);
    //console.log( "ASDADADDAWADADDADASD" + centerLines)
    instance.strokeWeight(1)
    instance.stroke(10)
    xLines.forEach(l => instance.line(...l))
    yLines.forEach(l => instance.line(...l))

    // coordinate lines
    instance.stroke(0, 256, 0)
    instance.line(...centerLines.x)
    instance.line(...centerLines.y)

      // vertical fisheye lines (circles)
    instance.stroke(256, 0, 0)
    instance.strokeWeight(4)
    instance.noFill()

    yCircles.forEach(({x, y, r}) => {
      instance.circle(x, y, r * 2)
    })

    xCircles.forEach(({x, y, r}) => {
      instance.circle(x, y, r * 2)
    })


    // point
    instance.stroke(0, 0, 256)

    const xp1 = instance.mouseX - offsetX;
    // const xp1 = 55
    // const xp1 = 345
    const yp1 = instance.mouseY - offsetY;
    // const yp1 = 45
    instance.circle(xp1, yp1, 3)


    const coord = getCoordinates({x: xp1, y:yp1}, xCircles, yCircles, x0, y0)


    instance.strokeWeight(1)
    instance.textSize(20)

    // instance.text(`x: ${instance.mouseX - offsetX}, y: ${instance.mouseY - offsetY}` , 30, 280)
    instance.text(`x: ${coord.x}, y: ${coord.y}` , 30, 280)

    instance.pop();
  }



  function getCoordinates(point, xCircles, yCircles, x0, y0){
    // console.log("===============================")
    let x
    let y
    const midYC = Math.floor(yCircles.length/2)
    const midXC = Math.floor(xCircles.length/2)

    yCircles.every((c, i) => {
      const pr = Math.sqrt(
        Math.pow(point.x - c.x, 2) + Math.pow(point.y - y0, 2)
      );
      // console.log(i, c.x, pr,  c.r)
      // console.log("midYC", midYC)
      if(point.x < x0 && pr > c.r && i <= midYC){
        // console.log("MATCH", i)
        x = i
        return false
      }
      if(point.x > x0 && pr < c.r && i > midYC){
        // console.log("MATCH R", i)
        x = i
        return false
      }
      return true
    })
    xCircles.every((c, i) => {
      const pr = Math.sqrt(
        Math.pow(point.y - c.y, 2) + Math.pow(point.x - y0, 2)
      );
      // console.log(i, c.x, pr,  c.r)

      if(point.y < y0 && pr > c.r && i <= midXC){
        // console.log("MATCH", i)
        y = i
        return false
      }
      if(point.y > y0 && pr < c.r && i > midXC){
        // console.log("MATCH R", i)
        y = i
        return false
      }
      return true
    })
    // console.log(x)
    return {x, y}
  }


  // 545 571 571
  // 731 764 714
};

const p = new p5(sketch);