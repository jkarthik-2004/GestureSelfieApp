const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("canvas");
const ctx = canvasElement.getContext("2d");
const countdownElement = document.getElementById("countdown");
const selfieImg = document.getElementById("selfieImg");
let mediaPipeModel;

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });
  videoElement.srcObject = stream;
  videoElement.play();
}

async function setupModel() {
  mediaPipeModel = new Holistic({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
  });
  mediaPipeModel.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: true,
    smoothSegmentation: true,
  });
  mediaPipeModel.onResults(onResults);
}

function onResults(results) {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
  
    if (results.poseLandmarks) {
      const leftWrist = results.poseLandmarks[15]; // Left wrist landmark index
      const rightWrist = results.poseLandmarks[16]; // Right wrist landmark index
  
      if (detectGesture(leftWrist, rightWrist)) {
        console.log('Gesture detected, taking selfie');
        takeSelfie();
      } else {
        console.log('Incorrect Gesture');
        displayIncorrectGesture(); // Display incorrect gesture message
      }
    }
  }
  
  function displayIncorrectGesture() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("Incorrect Gesture", canvasElement.width / 2 - 150, canvasElement.height / 2);
  }
  
function detectGesture(leftWrist, rightWrist) {
    // Updated condition to check if wrists are close together (adjusted threshold)
    if (Math.abs(leftWrist.x - rightWrist.x) < 0.5) {  // Increased the threshold from 0.1 to 0.5
      return true;  // Gesture detected when wrists are close horizontally
    }
    return false;
  }
  

  function takeSelfie() {
    // Capture the image from the canvas
    const selfieDataURL = canvasElement.toDataURL();
    
    // Set the captured image as the src for the <img> tag
    selfieImg.src = selfieDataURL;
  
    // Clear canvas so no video is drawn after the selfie
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  }

// Set up camera and model
setupCamera();
setupModel();

let countdownTimer;
let countdownValue = 3;
document.getElementById("startBtn").addEventListener("click", startCountdown);

function startCountdown() {
  // Clear the previous selfie image
  selfieImg.src = '';

  // Reset countdown value and display it
  countdownValue = 3;
  countdownElement.innerText = countdownValue;

  // Start the countdown timer
  countdownTimer = setInterval(updateCountdown, 1000);
}
function updateCountdown() {
  countdownValue--;
  countdownElement.innerText = countdownValue;
  if (countdownValue <= 0) {
    clearInterval(countdownTimer);
    countdownElement.innerText = "Smile!";
    // After countdown, trigger gesture recognition
    mediaPipeModel.send({ image: videoElement });
  }
}
