import express from "express";
import http from "http";
import ws, { WebSocketServer } from "ws";
const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
// public 폴더를 유저에게 보여줌 -> 볼 수 있는 폴더 한정시킴
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));
// 어떤 url을 입력하든 home으로 리다이렉트시킴

const server = http.createServer(app); // requestListener가 필요함
const wss = new WebSocketServer({ server });
// 같은 서버에서 http, webSocket 둘다 작동(두개가 같은 포트에서 작동함)
// http서버 위에 wss를 만든 것

const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anon";
  // 소켓연결을 sockets에 보관
  console.log("연결됨");
  socket.send("hello!!");
  // hello라는 데이터를 소켓에 담아서 보내줌
  socket.on("close", () => {
    console.log("프론트 연결 끊김");
  });
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) => {
          aSocket.send(
            `${socket.nickname}:${message.payload.toString("utf8")}`
          );
        });
        // 연결된 소켓에서 메시지가 오는 경우, 모든 socket에 대해 메시지 전송해줌
        break;
      case "nickname":
        socket["nickname"] = message.payload;
        break;
    }
  });
  // 연결이 끊겼을때의 상황
});

server.listen(3000);
