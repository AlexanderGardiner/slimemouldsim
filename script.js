let moulds = []
let cells = []
let xResolution = 500;
let yResolution = 500;
let baseSpeed = 10;
let trailIncrement = 20;


let viewCanvas = document.getElementById("viewCanvas");
let viewCTX = viewCanvas.getContext("2d");


viewCanvas.width = xResolution;
viewCanvas.height = yResolution;
let xSpeeds=0;
let ySpeeds=0;
class mouldCell {
  constructor(brightness) {
    this.cellType = "mould";
    this.x = Math.floor(Math.random() * xResolution);
    this.y = Math.floor(Math.random() * xResolution);

    this.xSpeed = 0;
    this.ySpeed = 0;

    while (this.xSpeed==0 && this.ySpeed==0) {
      let randomX = Math.random();
      if (randomX<(1/3)) {
        this.xSpeed = 1;
      } else if (randomX<(2/3)){
        this.xSpeed = -1;
      } else {
        this.xSpeed = 0;
      }

      let randomY = Math.random();
      if (randomY<(1/3)) {
        this.ySpeed = 1;
      } else if (randomY<(2/3)){
        this.ySpeed = -1;
      } else {
        this.ySpeed = 0;
      }
    }

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
      if (Math.random()>0.5) { 
        let mould = new mouldCell(0);
        moulds.push(mould);
        cells[mould.y][mould.x] = mould;
      }   
    } 
  }
}


function drawMoulds() {
  viewCTX.clearRect(0, 0, xResolution, yResolution);
  for (let y = 0; y<yResolution; y++) {
    for (let x = 0; x<xResolution; x++) {
      if (cells[y][x].cellType == "mould") {
        viewCTX.fillStyle = "rgb("+cells[y][x].brightness+", "+cells[y][x].brightness+", "+cells[y][x].brightness+")";
        viewCTX.fillRect(x, y, 1, 1);
      }
    } 
  }
  
}

function clearCells() {
  cells = [];
  
  for (let y = 0; y<yResolution; y++) {
    cells.push([]);
    for (let x = 0; x<xResolution; x++) {
      cells[y].push(new emptyCell()); 
    }
  }
}

function updateTrails() {
  for (let y = 0; y<yResolution; y++) {
    for (let x = 0; x<xResolution; x++) {
      if (cells[y][x].brightness+trailIncrement<255) {
        cells[y][x] = new mouldCell(cells[y][x].brightness+trailIncrement);
      } else {
        cells[y][x] = new mouldCell(255);
      }
    }
  }
    
    
}


function updateMouldPositions() {
  for (let i = 0; i<moulds.length; i++) {
    if (moulds[i].x + moulds[i].xSpeed>xResolution-1 || 
       moulds[i].x + moulds[i].xSpeed<0) {
      moulds[i].xSpeed = moulds[i].xSpeed * -1;
    }

    if (moulds[i].y + moulds[i].ySpeed>yResolution-1 ||
       moulds[i].y + moulds[i].ySpeed<0) {
      moulds[i].ySpeed = moulds[i].ySpeed * -1;
    }

    moulds[i].x += moulds[i].xSpeed;
    moulds[i].y += moulds[i].ySpeed;

    moulds[i].brightness = 0;
    cells[moulds[i].y][moulds[i].x] = moulds[i];
  }
}

function updateSpeeds() {
  for (let i = 0; i<moulds.length; i++) {
    if (moulds[i].y+moulds[i].ySpeed<yResolution && moulds[i].x+moulds[i].xSpeed<xResolution && moulds[i].y+moulds[i].ySpeed>=0 && moulds[i].x+moulds[i].xSpeed>=0) {
      if (cells[moulds[i].y+moulds[i].ySpeed][moulds[i].x+moulds[i].xSpeed].cellType == "mould") {
        let cellInFrontX = moulds[i].x+moulds[i].xSpeed;
        let cellInFrontY = moulds[i].y+moulds[i].ySpeed;
  
        moulds[i].x = cellInFrontX;
        moulds[i].y = cellInFrontY;
  
        moulds[i].xSpeed = cells[cellInFrontY][cellInFrontX].xSpeed;
        moulds[i].ySpeed = cells[cellInFrontY][cellInFrontX].ySpeed;
  
        moulds[i].brightness -= cells[cellInFrontY][cellInFrontX].brightness;
      }
    }
    

  }
}

function tick() {
  updateTrails();
  updateMouldPositions();
  updateSpeeds();
  drawMoulds();
  requestAnimationFrame(tick);
}

initalizeMoulds();
drawMoulds();



