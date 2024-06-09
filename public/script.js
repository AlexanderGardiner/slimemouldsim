let moulds = [];
let xResolution = 1000;
let yResolution = 1000;

let sensorDistance = 10;
let sensorSize = 1; // Side of square
let sensorAngle = Math.PI / 10;
let angleAdjustmentAfterSensorReading = Math.PI / 10;
let amountGreaterForAngleAdjustement = 0;

let viewCanvas = document.getElementById("viewCanvas");
let viewCTX = viewCanvas.getContext("2d");
let rawCanvasData = new Uint8ClampedArray(xResolution * yResolution * 4);

viewCanvas.width = xResolution;
viewCanvas.height = yResolution;

// Defines the initial parameters for a mould cell
class mouldCell {
  constructor() {
    this.cellType = "mould";
    this.angle = Math.random() * 2 * Math.PI;
    this.x =
      xResolution / 2 +
      Math.cos(this.angle) * (Math.random() - 0.5) * 10 +
      (Math.random() - 0.5) * 50;
    this.y =
      yResolution / 2 +
      Math.sin(this.angle) * (Math.random() - 0.5) * 10 +
      (Math.random() - 0.5) * 50;

    this.speed = 1; //Math.random() * 10 + 1;
  }
}

// Initializes moulds
function initalizeMoulds() {
  for (let y = 0; y < yResolution; y++) {
    for (let x = 0; x < xResolution; x++) {
      if (Math.random() > 0.8) {
        let mould = new mouldCell();
        moulds.push(mould);
      }
    }
  }
}

// Draws moulds to the canvas efficiently
function drawMouldsWithImageData() {
  // Create a copy of the existing canvas data
  const imageData = viewCTX.getImageData(0, 0, xResolution, yResolution);
  rawCanvasData = imageData.data;
  const canvasDataArray = new Uint8ClampedArray(imageData.data.buffer);

  for (let i = 0; i < moulds.length; i++) {
    const mould = moulds[i];
    const index = (Math.floor(mould.y) * xResolution + Math.floor(mould.x)) * 4;

    // Modify the canvas data to change the color where the mold cell is located
    canvasDataArray[index] += 10; //(9-mould.speed)* 255/9; // Red
    canvasDataArray[index + 1] += 20; // Green
    canvasDataArray[index + 2] = 255; // Blue
    canvasDataArray[index + 3] = 255; // Alpha
  }

  // Put the modified canvas data back on the canvas
  viewCTX.putImageData(imageData, 0, 0);
}

// Gets the value of the left sensor
function getLeftSensorValue(mould) {
  let leftSensorX = ~~(
    mould.x +
    Math.cos(mould.angle - sensorAngle) * sensorDistance
  );
  let leftSensorY = ~~(
    mould.y +
    Math.sin(mould.angle - sensorAngle) * sensorDistance
  );
  // viewCTX.fillStyle = "rgb(255, 0, 0)";
  // viewCTX.fillRect(leftSensorX-sensorSize/2,leftSensorY-sensorSize/2,sensorSize,sensorSize);
  return sensorValueCalculation(leftSensorX, leftSensorY);
}

// Computes the locations of the sensors
function sensorValueCalculation(sensorX, sensorY) {
  let sensorValue = 0;
  const maxY = Math.min(sensorY + sensorSize, yResolution);
  const maxX = Math.min(sensorX + sensorSize, xResolution);

  for (let y = Math.max(sensorY, 0); y < maxY; y++) {
    for (let x = Math.max(sensorX, 0); x < maxX; x++) {
      sensorValue += rawCanvasData[(y * xResolution + x) * 4];
      sensorValue += rawCanvasData[(y * xResolution + x) * 4 + 1];
      sensorValue += rawCanvasData[(y * xResolution + x) * 4 + 2];
    }
  }

  return sensorValue;
}

// Gets the value of the right sensor
function getRightSensorValue(mould) {
  let rightSensorX = ~~(
    mould.x +
    Math.cos(mould.angle + sensorAngle) * sensorDistance
  );
  let rightSensorY = ~~(
    mould.y +
    Math.sin(mould.angle + sensorAngle) * sensorDistance
  );
  // viewCTX.fillStyle = "rgb(0, 0, 255)";
  // viewCTX.fillRect(rightSensorX-sensorSize/2,rightSensorY-sensorSize/2,sensorSize,sensorSize);
  return sensorValueCalculation(rightSensorX, rightSensorY);
}

// Changes direction based on sensor
function detect(mould) {
  let leftSensorValue = getLeftSensorValue(mould);
  let rightSensorValue = getRightSensorValue(mould);
  if (leftSensorValue - amountGreaterForAngleAdjustement > rightSensorValue) {
    mould.angle -= angleAdjustmentAfterSensorReading;
  } else if (
    leftSensorValue <
    rightSensorValue - amountGreaterForAngleAdjustement
  ) {
    mould.angle += angleAdjustmentAfterSensorReading;
  }
}

function updateMouldPositions() {
  for (let i = 0; i < moulds.length; i++) {
    updateMouldPosition(moulds[i]);
  }
}

// Updates the mould's position
function updateMouldPosition(mould) {
  let mouldXSpeed = Math.cos(mould.angle) * mould.speed;
  let mouldYSpeed = Math.sin(mould.angle) * mould.speed;

  if (mould.x + mouldXSpeed > xResolution - 1 || mould.x + mouldXSpeed < 0) {
    // Reflect the mold at the canvas boundaries
    mouldXSpeed = mouldXSpeed * -1;
    mould.angle = Math.PI - mould.angle;
  }

  if (mould.y + mouldYSpeed > yResolution - 1 || mould.y + mouldYSpeed < 0) {
    // Reflect the mold at the canvas boundaries
    mouldYSpeed = mouldYSpeed * -1;
    mould.angle = -mould.angle;
  }

  mould.x += mouldXSpeed;
  mould.y += mouldYSpeed;
}

let previousTickTime = performance.now();
let currentTickTime = performance.now();
let running = false;

// Updates
function tick() {
  if (running) {
    currentTickTime = performance.now();
    document.getElementById("FPS").innerHTML =
      "FPS: " + (1000 / (currentTickTime - previousTickTime)).toFixed(2);

    viewCTX.fillStyle = "rgb(0, 0, 0)";

    viewCTX.fillRect(0, 0, viewCanvas.width, viewCanvas.height);

    drawMouldsWithImageData();

    for (let i = 0; i < moulds.length; i++) {
      detect(moulds[i]);
    }
    updateMouldPositions();

    previousTickTime = currentTickTime;
  }

  requestAnimationFrame(tick);
}
// Toggle paused
function toggleRunning() {
  // setInterval(tick, 100);
  // running = true;
  running = !running;
}
viewCTX.fillStyle = "rgb(0, 0, 0)";
viewCTX.globalAlpha = 1;
viewCTX.fillRect(0, 0, viewCanvas.width, viewCanvas.height);
viewCTX.globalAlpha = 0.02;

// Starts running
initalizeMoulds();
drawMouldsWithImageData();
tick();
