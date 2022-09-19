const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nickname");
const messageForm = document.querySelector("#message");
var socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

// 소켓 연결은 ws://로 한다.
socket.addEventListener("open", () => {
  console.log("connected to Server");
});
socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerHTML = message.data;
  messageList.append(li);
});
// 서버에서 받은 데이터 표기
socket.addEventListener("close", () => {
  console.log("서버와 연결이 끊어졌습니다.");
});
function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message", input.value));
  input.value = "";
}
function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
  input.value = "";
}
messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
