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

// GET /events 的中间件
function eventsHandler(req, res, next) {
  /**
   * 发送事件流时，服务器端发送的响应内容应该使用值为 `text/event-stream` 的 MIME 类型。
   */
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  res.writeHead(200, headers);
  res.write(
    serverSentEvents("theme-change", JSON.stringify(currentThemeState))
  );

  // 记录下创建了链接的客户端，稍后进行遍历，将更新发送给每个客户端。
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res,
  };
  clients.push(newClient);

  // 当客户端断开连接时，将其从记录中移除
  req.on("close", () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter((c) => c.id !== clientId);
  });
}

// 将 `theme-change` 事件发送给所有建立了持久化连接的客户端
function sendEventsToAll(newTheme) {
  clients.forEach((c) =>
    c.res.write(serverSentEvents("theme-change", JSON.stringify(newTheme)))
  );
}

// POST /change-theme 的中间件
function changeTheme(req, res, next) {
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
  console.log("请在浏览器访问：\n", `http://localhost:${PORT}`);
});
