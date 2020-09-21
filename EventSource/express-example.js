const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * 对发送给客户端的数据进行格式化
 * @param {string} event 事件名称
 * @param {string} data 发送的数据
 */
function serverSentEvents(event, data) {
  /**
   * **注意**：每个通知以文本块形式发送，并以一对换行符结尾。
   *
   * 更多的格式相关信息可以查看下方链接
   * @see https://developer.mozilla.org/zh-CN/docs/Server-sent_events/Using_server-sent_events#%E4%BA%8B%E4%BB%B6%E6%B5%81%E6%A0%BC%E5%BC%8F
   */
  return `event:${event}\ndata: ${data}\n\n`;
}

function eventsHandler(req, res, next) {
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  res.writeHead(200, headers);
  res.write(
    serverSentEvents("theme-change", JSON.stringify(currentThemeState))
  );
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res,
  };
  clients.push(newClient);
  req.on("close", () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter((c) => c.id !== clientId);
  });
}

function sendEventsToAll(newTheme) {
  clients.forEach((c) =>
    c.res.write(serverSentEvents("theme-change", JSON.stringify(newTheme)))
  );
}

async function changeTheme(req, res, next) {
  currentThemeState = req.body;
  res.json(currentThemeState);
  return sendEventsToAll(currentThemeState);
}

app.post("/change-theme", changeTheme);
app.get("/events", eventsHandler);

const PORT = 3000;
let clients = [];

let currentThemeState = {
  theme: "light",
};

app.listen(PORT, () => {
  console.log("Listening on port: " + PORT);
});
