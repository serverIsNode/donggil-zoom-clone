const socket = io();
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camersSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;
let myStream;
let muted = false;
let cameraOff = false;
let roomName;

/** @type{RTCPeerConnection} */
let myPeerConnection;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks();
    cameras.forEach((cam) => {
      const option = document.createElement("option");
      option.value = cam.deviceId;
      option.innerText = cam.label;
      console.log(currentCamera);
      if (currentCamera[0].label == cam.label) {
        option.selected = true;
      }
      camersSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
async function getMedia(deviceID) {
  const initialConstraints = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: {
      deviceId: {
        exact: deviceID,
      },
    },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceID ? cameraConstraints : initialConstraints
    );
    myFace.srcObject = myStream;
    if (!deviceID) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}
async function handleCameraChange() {
  await getMedia(camerasSelect.value);
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

// welcomeForm에 관한 부분

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function startMedia() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConneciton();
}
async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await startMedia();
  socket.emit("join_room", input.value);
  input.value = "";
  roomName = input.value;
}
welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// socket
socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
});

socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  myPeerConnection.addIceCandidate(ice);
});
// RTC Code

function handleIce(data) {
  socket.emit("ice", data.candidate, roomName);
}
function makeConneciton() {
  mypeerConnection = new RTCPeerConnection();
  mypeerConnection.addEventListener("icecandidate", handleIce);
  mypeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleAddStream(data) {
  const peerStream = document.getElementById("peerStream");
  peerStream.srcObject = data.stream;
}
