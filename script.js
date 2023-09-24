let moulds = [];
let canvasResolutionMultiplier = 1;
let xResolution = 300;
let yResolution = 300;

let sensorDistance = 15;
let sensorSize = 3; // Side of square
let sensorAngle = Math.PI/3;
let angleAdjustmentAfterSensorReading = Math.PI/8;
let amountGreaterForAngleAdjustement = 100;

let viewCanvas = document.getElementById("viewCanvas");
let viewCTX = viewCanvas.getContext("2d");
let canvasData = [];


viewCanvas.width = xResolution * canvasResolutionMultiplier;
viewCanvas.height = yResolution * canvasResolutionMultiplier;

class mouldCell {
  constructor() {
    this.cellType = "mould";
    this.x = Math.floor(Math.random() * xResolution);
    this.y = Math.floor(Math.random() * xResolution);

    this.angle = Math.random() * 2 * Math.PI;
    this.speed = 1;

    
  }
}

async function updateCanvasData() {
  const imageData = viewCTX.getImageData(
    0,
    0,
    xResolution * canvasResolutionMultiplier,
    yResolution * canvasResolutionMultiplier
  );

  const pixelData = new Uint8Array(imageData.data.buffer);

  const pixelArray = new Array(yResolution * canvasResolutionMultiplier);

  for (let y = 0; y < yResolution * canvasResolutionMultiplier; y++) {
    pixelArray[y] = new Array(xResolution * canvasResolutionMultiplier);

    for (let x = 0; x < xResolution * canvasResolutionMultiplier; x++) {
      const index = (y * xResolution * canvasResolutionMultiplier + x) * 4;

      const red = pixelData[index];
      const green = pixelData[index + 1];
      const blue = pixelData[index + 2];

      pixelArray[y][x] = red + green + blue;
    }
  }

  canvasData = pixelArray;
}

function initalizeMoulds() {
  for (let y = 0; y<yResolution; y++) {
    for (let x = 0; x<xResolution; x++) {
      if (Math.random()>0.1) { 
        let mould = new mouldCell();
        moulds.push(mould);
      }   
    } 
  }
}

async function drawMoulds() {
  moulds.forEach(mould => {
    drawMould(mould);
  });
  
}

async function drawMould(mould) {
  viewCTX.fillRect(mould.x, mould.y, 1 * canvasResolutionMultiplier, 1 * canvasResolutionMultiplier);
}
function detect(mould) {
  let leftSensorX = mould.x + Math.cos(mould.angle - sensorAngle) * sensorDistance;
  let leftSensorY = mould.y + Math.sin(mould.angle - sensorAngle) * sensorDistance;
  
  leftSensorX = Math.floor(leftSensorX) * canvasResolutionMultiplier;
  leftSensorY = Math.floor(leftSensorY) * canvasResolutionMultiplier;

  let leftSensorValue = 0;
  for (let y=0; y<sensorSize*canvasResolutionMultiplier; y++) {
    for (let x=0; x<sensorSize*canvasResolutionMultiplier; x++) {
      if (leftSensorY+y<canvasData.length && leftSensorY+y>=0) {
        if (leftSensorX+x<canvasData[leftSensorY+y].length && leftSensorX+x>=0) {
          leftSensorValue += canvasData[leftSensorY+y][leftSensorX+x];
          
        }
      }
      
    }
  }

  let rightSensorX = mould.x + Math.cos(mould.angle + sensorAngle) * sensorDistance;
  let rightSensorY = mould.y + Math.sin(mould.angle + sensorAngle) * sensorDistance;
  
  rightSensorX = Math.floor(rightSensorX) * canvasResolutionMultiplier;
  rightSensorY = Math.floor(rightSensorY) * canvasResolutionMultiplier;

  let rightSensorValue = 0;
  for (let y=0; y<sensorSize*canvasResolutionMultiplier; y++) {
    for (let x=0; x<sensorSize*canvasResolutionMultiplier; x++) {
      if (rightSensorY+y<canvasData.length && rightSensorY+y>=0) {
        if (rightSensorX+x<canvasData[rightSensorY+y].length && rightSensorX+x>=0) {
          rightSensorValue += canvasData[rightSensorY+y][rightSensorX+x];
          
        }
      }
      
    }
  }

  if (leftSensorValue+amountGreaterForAngleAdjustement>rightSensorValue) {
    mould.angle -= angleAdjustmentAfterSensorReading;
  } else if (leftSensorValue<rightSensorValue+amountGreaterForAngleAdjustement) {
    mould.angle += angleAdjustmentAfterSensorReading;
  }


}


async function updateMouldPositions() {
  for (let i = 0; i<moulds.length; i++) {
    updateMouldPosition(moulds[i]);

  }
}

async function updateMouldPosition(mould) {
  let mouldXSpeed = Math.cos(mould.angle) * mould.speed;
  let mouldYSpeed = Math.sin(mould.angle) * mould.speed;

  if (mould.x + mouldXSpeed>xResolution-1 || mould.x + mouldXSpeed<=0) {
    mouldXSpeed = mouldXSpeed * -1;
    mould.angle = Math.PI - mould.angle;
  }
  
  if (mould.y + mouldYSpeed>yResolution-1 || mould.y + mouldYSpeed<=0) {
    mouldYSpeed = mouldYSpeed * -1;
    mould.angle = -mould.angle;
  } 

  mould.x += mouldXSpeed
  mould.y += mouldYSpeed;
}


let previousTickTime = performance.now();
let currentTickTime = performance.now();
let running = false;

function tick() {

  if (running) {
    currentTickTime = performance.now();
    document.getElementById("FPS").innerHTML = "FPS: " + (1000/(currentTickTime-previousTickTime)).toFixed(2);;
    updateMouldPositions();

    viewCTX.fillStyle = "black";
    viewCTX.globalAlpha = 0.05;
    viewCTX.fillRect(0, 0, viewCanvas.width, viewCanvas.height)
    viewCTX.globalAlpha = 1;
    viewCTX.fillStyle = "rgb(10, 255, 255)";
    drawMoulds();
  
    updateCanvasData();

    for (let i=0; i<moulds.length; i++) {
      detect(moulds[i]);
    }

    previousTickTime = currentTickTime;
  }
  
  
  requestAnimationFrame(tick);
}
function toggleRunning() {
  running = !running;
}

viewCTX.fillStyle = "black";
viewCTX.fillRect(0, 0, viewCanvas.width, viewCanvas.height)
initalizeMoulds();
viewCTX.fillStyle = "rgb(10, 255, 255)";
drawMoulds();
updateCanvasData();
tick();



