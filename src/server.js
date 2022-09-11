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
function handleConnection(socket) {
  console.log(socket);
}
wss.on("connection", handleConnection);

server.listen(3000);
