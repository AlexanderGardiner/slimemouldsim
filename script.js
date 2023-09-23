let moulds = [];
let cells = [];
let canvasResolutionMultiplier = 1;
let xResolution = 1000;
let yResolution = 1000;

let sensorDistance = 4;
let sensorSize = 3; // Side of square
let sensorAngle = Math.PI/3;
let angleAdjustmentAfterSensorReading = Math.PI/8;
let amountGreaterForAngleAdjustement = 20;

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

    this.brightness = 0;
    
  }
}

class mouldTrailCell {
  constructor(x, y, brightness) {
    this.cellType = "mouldTrail";
    this.x = x;
    this.y = y;

    this.brightness = brightness;
    
  }
}

class emptyCell {
  constructor() {
    this.cellType = "empty";
  }
}

function updateCanvasData() {
  const imageData = viewCTX.getImageData(0, 0, xResolution * canvasResolutionMultiplier, yResolution * canvasResolutionMultiplier);

  const pixelData = imageData.data;

  const pixelArray = new Array(yResolution * canvasResolutionMultiplier);

  for (let y = 0; y < yResolution * canvasResolutionMultiplier; y++) {
    pixelArray[y] = new Array(xResolution * canvasResolutionMultiplier);
    
    for (let x = 0; x < xResolution * canvasResolutionMultiplier; x++) {
      const index = (y * xResolution * canvasResolutionMultiplier + x) * 4;
      
      const red = pixelData[index];
      const green = pixelData[index + 1];
      const blue = pixelData[index + 2];
      
      pixelArray[y][x] = red+green+blue;
    }
  }

  canvasData = pixelArray;
}

function initalizeMoulds() {
  for (let y = 0; y<yResolution; y++) {
    cells.push([]);
    for (let x = 0; x<xResolution; x++) {
      cells[y].push(new emptyCell()); 
    }
  }
  
  for (let y = 0; y<yResolution; y++) {
    for (let x = 0; x<xResolution; x++) {
      if (Math.random()>0.8) { 
        let mould = new mouldCell();
        moulds.push(mould);
        cells[mould.y][mould.x] = mould;
      }   
    } 
  }
}

function drawMoulds() {
  for (let i=0; i<moulds.length; i++) {
    viewCTX.fillStyle = "rgb("+moulds[i].brightness+", "+moulds[i].brightness+", "+moulds[i].brightness+")";
    viewCTX.fillRect(moulds[i].x * canvasResolutionMultiplier, moulds[i].y * canvasResolutionMultiplier, 1 * canvasResolutionMultiplier, 1 * canvasResolutionMultiplier);
  }
  
}

function detect(mould) {
  let leftSensorX = mould.x + Math.cos(mould.angle - sensorAngle) * sensorDistance;
  let leftSensorY = mould.y + Math.sin(mould.angle - sensorAngle) * sensorDistance;
  
  leftSensorX = Math.floor(leftSensorX);
  leftSensorY = Math.floor(leftSensorY);

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
  
  rightSensorX = Math.floor(rightSensorX);
  rightSensorY = Math.floor(rightSensorY);

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

  if (leftSensorValue+amountGreaterForAngleAdjustement<rightSensorValue) {
    mould.angle -= angleAdjustmentAfterSensorReading;
  } else if (leftSensorValue>rightSensorValue+amountGreaterForAngleAdjustement) {
    mould.angle += angleAdjustmentAfterSensorReading;
  }


}


function updateMouldPositions() {
  for (let i = 0; i<moulds.length; i++) {
    let mouldXSpeed = Math.cos(moulds[i].angle) * moulds[i].speed;
    let mouldYSpeed = Math.sin(moulds[i].angle) * moulds[i].speed;

    if (moulds[i].x + mouldXSpeed>xResolution-1 || moulds[i].x + mouldXSpeed<=0) {
      mouldXSpeed = mouldXSpeed * -1;
      moulds[i].angle = Math.PI - moulds[i].angle;
    }
    
    if (moulds[i].y + mouldYSpeed>yResolution-1 || moulds[i].y + mouldYSpeed<=0) {
      mouldYSpeed = mouldYSpeed * -1;
      moulds[i].angle = -moulds[i].angle;
    } 

    moulds[i].x += mouldXSpeed
    moulds[i].y += mouldYSpeed;

  }
}

function updateSpeeds() {
  for (let i = 0; i<moulds.length; i++) {
    let mouldXSpeed = Math.cos(moulds[i].angle) * moulds[i].speed;
    let mouldYSpeed = Math.sin(moulds[i].angle) * moulds[i].speed;

    if (moulds[i].y+mouldYSpeed<yResolution && moulds[i].x+mouldXSpeedxResolution && moulds[i].y+mouldYSpeed>=0 && moulds[i].x+mouldXSpeed>=0) {
      if (cells[moulds[i].y+mouldYSpeed][moulds[i].x+mouldXSpeed].cellType == "mould") {
        let cellInFrontX = moulds[i].x+mouldXSpeed;
        let cellInFrontY = moulds[i].y+mouldYSpeed;
  
        moulds[i].x = cellInFrontX;
        moulds[i].y = cellInFrontY;
  
        mouldXSpeed = cells[cellInFrontY][cellInFrontX].xSpeed;
        mouldYSpeed = cells[cellInFrontY][cellInFrontX].ySpeed;
  
        moulds[i].brightness -= cells[cellInFrontY][cellInFrontX].brightness;
      }
    }

  }
}

let previousRenderTime = 0;
let previousTickTime = performance.now();
let currentTickTime = performance.now();
let running = false;

function tick() {
  if (running) {
    currentTickTime = performance.now();
    document.getElementById("FPS").innerHTML = "FPS: " + (1000/(currentTickTime-previousTickTime)).toFixed(2);;
    updateMouldPositions();

    viewCTX.fillStyle = "white";
    viewCTX.globalAlpha = 0.05;
    viewCTX.fillRect(0, 0, viewCanvas.width, viewCanvas.height)
    viewCTX.globalAlpha = 1;
    drawMoulds();
    updateCanvasData();
    previousRenderTime = performance.now()

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


initalizeMoulds();
drawMoulds();
tick();



