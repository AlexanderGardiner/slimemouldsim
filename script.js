let moulds = [];
let mouldTrails = [];
let cells = [];
let canvasResolutionMultiplier = 1;
let xResolution = 200;
let yResolution = 200;
let trailIncrement = 5;

let sensorDistance = 2;
let sensorSize = 3; // Side of square
let sensorAngle = Math.PI/6;
let angleAdjustmentAfterSensorReading = Math.PI/8;
let amountGreaterForAngleAdjustement = 1000;

let viewCanvas = document.getElementById("viewCanvas");
let viewCTX = viewCanvas.getContext("2d");


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


function initalizeMoulds() {
  for (let y = 0; y<yResolution; y++) {
    cells.push([]);
    for (let x = 0; x<xResolution; x++) {
      cells[y].push(new emptyCell()); 
    }
  }
  
  for (let y = 0; y<yResolution; y++) {
    for (let x = 0; x<xResolution; x++) {
      if (Math.random()>0.995) { 
        let mould = new mouldCell();
        moulds.push(mould);
        cells[mould.y][mould.x] = mould;
      }   
    } 
  }
}

function clearCanvas() {
  viewCTX.clearRect(0, 0, xResolution * canvasResolutionMultiplier, yResolution * canvasResolutionMultiplier);
}

function drawMoulds() {
  for (let i=0; i<moulds.length; i++) {
    viewCTX.fillStyle = "rgb("+moulds[i].brightness+", "+moulds[i].brightness+", "+moulds[i].brightness+")";
    viewCTX.fillRect(moulds[i].x * canvasResolutionMultiplier, moulds[i].y * canvasResolutionMultiplier, 1 * canvasResolutionMultiplier, 1 * canvasResolutionMultiplier);
  }
  
}

function drawMouldTrails() {
  for (let i=0; i<mouldTrails.length; i++) {
    viewCTX.fillStyle = "rgb("+mouldTrails[i].brightness+", "+mouldTrails[i].brightness+", "+mouldTrails[i].brightness+")";
    viewCTX.fillRect(mouldTrails[i].x * canvasResolutionMultiplier, mouldTrails[i].y * canvasResolutionMultiplier, 1*canvasResolutionMultiplier, 1*canvasResolutionMultiplier);
  }
  
}



function updateTrails() {
  for (let i=0; i<moulds.length; i++) {
    if (moulds[i].brightness+trailIncrement<255) {
      mouldTrails.push(new mouldTrailCell(moulds[i].x, moulds[i].y, moulds[i].brightness));
    }
  }

  for (let i=0; i<mouldTrails.length; i++) {
    if (mouldTrails[i].brightness+trailIncrement<255) {
      mouldTrails[i].brightness += trailIncrement;
    } else {
      mouldTrails.shift();
      i--;
    }
  }
  
    
    
}

function detect(mould) {
  let leftSensorX = mould.x;
  let leftSensorY = mould.y;
  leftSensorX += Math.cos(mould.angle - sensorAngle) * sensorDistance;
  leftSensorY += Math.sin(mould.angle - sensorAngle) * sensorDistance;
  
  let leftSensorData = viewCTX.getImageData(leftSensorX*canvasResolutionMultiplier, leftSensorY*canvasResolutionMultiplier, sensorSize*canvasResolutionMultiplier, sensorSize*canvasResolutionMultiplier).data;

  let leftMouldConcentration = 0;
  for (let i=0; i< leftSensorData.length; i++) {
    leftMouldConcentration += leftSensorData[i];
  }


  let rightSensorX = mould.x;
  let rightSensorY = mould.y;
  rightSensorX += Math.cos(mould.angle + sensorAngle) * sensorDistance;
  rightSensorY += Math.sin(mould.angle + sensorAngle) * sensorDistance;
  
  let rightSensorData = viewCTX.getImageData(rightSensorX*canvasResolutionMultiplier, rightSensorY*canvasResolutionMultiplier, sensorSize*canvasResolutionMultiplier, sensorSize*canvasResolutionMultiplier).data;

  let rightMouldConcentration = 0;
  for (let i=0; i< rightSensorData.length; i++) {
    rightMouldConcentration += rightSensorData[i];
  }


  let centerSensorX = mould.x;
  let centerSensorY = mould.y;
  centerSensorX += Math.cos(mould.angle) * sensorDistance;
  centerSensorY += Math.sin(mould.angle) * sensorDistance;
  
  let centerSensorData = viewCTX.getImageData(centerSensorX*canvasResolutionMultiplier, centerSensorY*canvasResolutionMultiplier, sensorSize*canvasResolutionMultiplier, sensorSize*canvasResolutionMultiplier).data;

  let centerMouldConcentration = 0;
  for (let i=0; i< centerSensorData.length; i++) {
    centerMouldConcentration += centerSensorData[i];
  }

  if (leftMouldConcentration+amountGreaterForAngleAdjustement<rightMouldConcentration) {
    mould.angle += angleAdjustmentAfterSensorReading;
  } else if (leftMouldConcentration>rightMouldConcentration+amountGreaterForAngleAdjustement) {
    mould.angle -= angleAdjustmentAfterSensorReading;
  }


  // viewCTX.fillStyle = "blue";
  // viewCTX.fillRect(leftSensorX*canvasResolutionMultiplier, leftSensorY*canvasResolutionMultiplier, sensorSize*canvasResolutionMultiplier, sensorSize*canvasResolutionMultiplier);
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
function tick() {
  currentTickTime = performance.now();
  document.getElementById("FPS").innerHTML = "FPS: " + 1000/(currentTickTime-previousTickTime)
  updateTrails();
  updateMouldPositions();

  if (currentTickTime-previousRenderTime>50) {
    clearCanvas();
    drawMoulds();
    drawMouldTrails();
    previousRenderTime = performance.now()
  }
  
  for (let i=0; i<moulds.length; i++) {
    detect(moulds[i]);
  }

  previousTickTime = currentTickTime;
  requestAnimationFrame(tick);
}
function startTicking() {
  tick();
}


initalizeMoulds();
drawMoulds();



