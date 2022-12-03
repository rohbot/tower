// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */

let video;
let poseNet;
let poses = [];
let rawVal = 0;
let val = 0;
let midX;
let midY;

let port;
let writer;
let reader;

let started = false;
let sentVal = 0;

let scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5'];

let masterVolume = -9; // in decibel.

let ready = false;

let synth;

let maxVal = 0;
let minVal = 9999;

let outVal = 10;

let currentVal = 0;

async function init() {
  if ('serial' in navigator) {
    try {
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 }); // `baudRate` was `baudrate` in previous versions.


      reader = port.readable.getReader();

      const signals = await port.getSignals();
      console.log(signals);
    } catch (err) {
      console.error('There was an error opening the serial port:', err);
    }
  } else {
    console.error('Web serial doesn\'t seem to be enabled in your browser. Check https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API#browser_compatibility for more info.')
  }
}

function modelReady() {
  select("#status").html("");
}


function setup() {
  createCanvas(640, 480);
  // createCanvas(windowWidth, windowHeight);

  // text("Click to Start", 100, 30)

  video = createCapture(VIDEO);
  video.size(width, height);
  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on("pose", function (results) {
    poses = results;
  });
  video.hide();

  midX = width / 2;
  midY = height / 2;
  textSize(64);
}


function initalizeAudio() {
  // Create the Synth
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      partials: [0, 2, 3, 4],
    }
  }).toDestination();

  // note that the first parameter to Loop() is an anonymous function,
  // ie a function defined "on the fly"

  Tone.Master.volume.value = masterVolume;
  Tone.Transport.start();
  ready = true;
}


async function mousePressed() {
  if (!started) {
    // fullscreen(true);
    await init();
    initalizeAudio();
    started = true;
    background(255);
  }
}

let curNote = scale[0];

function writeVal(value) {
  // if (value > outVal) {
  //   value = outVal
  // }
  if (port && port.writable) {
    const bytes = new Uint8Array([value, '\n']);
    writer = port.writable.getWriter();

    writer.write(bytes);
    writer.releaseLock();
    console.log(value, typeof (value))
  }

  if (ready) {
    releaseSynth();

    if (value > 1) {
      let note = scale[value - 1];
      console.log("note:", note)
      synth.triggerAttack(note);
      curNote = note;
    }
  }

}

function mouseMoved() {
  if (!started) {
    return
  }
  ellipse(mouseX, mouseY, 10, 10);
  let val = int(map(mouseX, 0, width, 1, 12));
  if (val < 1)
    val = 1
  if (val > outVal) {
    val = outVal
  }
  if (val != sentVal) {
    sentVal = val;
    console.log(val);
    background(255);
    writeVal(val + 1)
    currentVal = val
  }
}
let last_moved = 0;

function releaseSynth() {
  if (ready) {
    for (let i = 0; i < scale.length; i++) {
      synth.triggerRelease(scale[i])
    }
  }
}

function draw() {

  image(video, 0, 0, 640, 480);
  drawRightHand();

  if (last_moved - millis() > 5000 && ready) {
    releaseSynth();

  }

}



function drawRightHand() {
  if (poses.length < 1) {
    return;
  }
  const pose = poses[0].pose;
  const hand = pose.rightWrist;
  const shoulder = pose.rightShoulder;
  if (hand.confidence > 0.5 && shoulder.confidence > 0.5) {
    fill(100, 255, 0);
    ellipse(hand.x, hand.y, 10, 10);
    ellipse(shoulder.x, shoulder.y, 10, 10);
    line(hand.x, hand.y, shoulder.x, shoulder.y);
    rawVal = shoulder.y - hand.y;
    if (rawVal > maxVal) {
      maxVal = rawVal;
    }
    if (rawVal < minVal) {
      minVal = rawVal;
    }
    // console.log(rawVal, minVal, maxVal);

    let val = int(map(rawVal, 50, -150, outVal, 0))
    if (val < 0) {
      val = 0
    }
    if (val > outVal) {
      val = outVal
    }

    if (currentVal != val) {
      currentVal = val;
      writeVal(currentVal + 1);
    }


    last_moved = millis();

  } else {
    if (millis() - last_moved > 1000 && currentVal > 0) {
      currentVal -= 1
      last_moved = millis();
      writeVal(currentVal + 1);
    }
  }
  fill(255, 0, 0);
  text(currentVal, midX, midY);

}