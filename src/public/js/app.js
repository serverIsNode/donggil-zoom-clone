const socket = io();
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
let myStream;
let muted = false;
let cameraOff = false;
async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const camersSelect = document.getElementById("cameras");
    cameras.forEach((cam) => {
      const option = document.createElement("option");
      option.value = cam.deviceId;
      option.innerText = cam.label;
      camersSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    myFace.srcObject = myStream;
    await getCameras();
  } catch (e) {
    console.log(e);
  }
}
getMedia();
function handleCameraChange(){
  
}
function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  console.log(myStream.getAudioTracks());
  if (!muted) {
    muteBtn.innerHTML = "Unmute";
    muted = true;
  } else {
    muteBtn.innerHTML = "Mute";
    muted = false;
  }
}
function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerHTML = "Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerHTML = "Camera On";
    cameraOff = true;
  }
}
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camersSelect.addEventListener("input", handleCameraChange);