// Declare a "SerialPort" object
var serial;
var latestData = "waiting for data"; // you'll use this to write incoming data to the canvas
var sensorRight; // data for the right ultrasonic sensor
var sensorLeft; // data for the left ultrasonic sensor
var hit = false; // setting the collision as false initially
let lastX = []; // avg X axis
let lastY = []; // avg Y axis
let ypos = 0;
var cir;
var controller;

// function in order to calculate the average readings of the sensor, to prevent jitter
function avg(t) {
  let sum = 0;
  for (let item of t) {
    sum += item;
  }
  return sum / t.length;
}

function setup() {
  // create a canvas with the HTML id "game"
  var canvas = createCanvas(450, 450);
  canvas.parent('game');
  background(0,0,0);
  // randomly positioned circle
  cir = new circleObj(50);
  // controller via 2 ultrasonic sensors
  controller = new controllerObj(50);
  // instantiate our SerialPort object
  serial = new p5.SerialPort();
  // select the port to open and the baudRate
  serial.open("COM3", {baudRate: 115200});
  serial.on('data', gotData);
}

function gotData() {
  let currentString = serial.readLine();  // read the incoming data
  trim(currentString);                    // trim off trailing whitespace
  if (!currentString) return;             // if the incoming string is empty, do no more
  if (!isNaN(currentString)) {  // make sure the string is a number (i.e. NOT Not a Number (NaN))
    textXpos = currentString;   // save the currentString to use for the text position in draw()
  }
  // split the data by the comma added in the serial Arduino - allows us to read and translate the data using one Arduino
  sensorLeft = currentString.split(',')[0];
  sensorRight = currentString.split(',')[1];
}

function draw() {
  lastX.push(sensorLeft*50);
  lastY.push(sensorRight*50);
  background(0, 0, 0);
  cir.disp();
  controller.disp(avg(lastX),avg(lastY));
  controller.collide(cir);
  lastX = lastX.slice(lastX.length);
  lastY = lastY.slice(lastY.length);
}

// main ellipse that the user controls
function controllerObj(dia){
  this.dia = dia;
  this.color = color(255,255,255)
  this.x;
  this.y;

  this.hit = false;
  this.collide = function(obj){

    this.hit = collideCircleCircle(this.x, this.y, this.dia, obj.x, obj.y, obj.dia);

    if(this.hit){
      this.color = color(0,255,0);
      document.getElementById("score").innerHTML = "Success!";
      document.getElementById("score").style.color = "Chartreuse";
      noLoop();
    }
  }

  this.disp = function(x,y){
    this.x = y;
    this.y = x;
    noStroke();
    fill(this.color);
    ellipse(this.x,this.y,this.dia,this.dia);
  }
};

// ellipse that will be used for the "target" of collision
function circleObj(dia){
  this.dia = dia;
  this.color = color(255, 0, 0);
  this.x = random(450);
  this.y = random(450);

  this.disp = function(){
    noStroke();
    fill(this.color);
    ellipse(this.x,this.y,this.dia,this.dia);
  }
}
