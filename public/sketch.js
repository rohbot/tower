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
function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on("pose", function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
  midX = width / 2;
  midY = height /2;
}

function modelReady() {
  select("#status").html("");
}

function draw() {
  image(video, 0, 0, width, height);

  // We can call both functions to draw all keypoints and the skeletons
//   drawKeypoints();  
//  drawSkeleton();
  drawRightHand();
}

let maxVal = 0;
let minVal = 9999;

function drawRightHand(){
    if(poses.length < 1){
        return;
    }
    const pose = poses[0].pose;
    const hand = pose.rightWrist;
    const shoulder = pose.rightShoulder;
    if(hand.confidence > 0.5 && shoulder.confidence > 0.5){
        ellipse(hand.x, hand.y, 10, 10);
        ellipse(shoulder.x, shoulder.y, 10, 10);
        line(hand.x, hand.y, shoulder.x, shoulder.y);
        rawVal = shoulder.y - hand.y;
        if(rawVal > maxVal){
            maxVal = rawVal;    
        }
        if(rawVal < minVal){
            minVal = rawVal;    
        }
        console.log(rawVal, minVal, maxVal);
        
        val = map(rawVal, -150, 300, height, 0)
        if(val < 0){
            val = 0
        }
        if(val > height){
            val = height
        }

        rect(midX + 10, val, 20, midY)
        

    }

    
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i += 1) {
    // For each pose detected, loop through all the keypoints
    const pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j += 1) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      const keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i += 1) {
    const skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j += 1) {
      const partA = skeleton[j][0];
      const partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}