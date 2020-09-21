const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const serve = require("koa-static");
const Router = require("@koa/router");
const PassThrough = require("stream").PassThrough;
const cors = require("@koa/cors");
const http2 = require("http2");
const path = require("path");
const fs = require("fs");

const app = new Koa();
const router = new Router();

app.use(cors());
app.use(serve("public"));
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

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

function eventsHandler(ctx, next) {
  /**
   * 发送事件流时，服务器端发送的响应内容应该使用值为 `text/event-stream` 的MIME类型。
   */
  ctx.type = "text/event-stream";

  /**
   * 返回的数据也应该是流
   */
  const stream = new PassThrough();
  stream.write(
    serverSentEvents("theme-change", JSON.stringify(currentThemeState))
  );
  ctx.body = stream;

  // 记录下创建了链接的客户端，稍后进行遍历，将更新发送给每个客户端。
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    ctx,
    stream,
  };
  clients.push(newClient);

  // 当客户端断开连接时，将其从记录中移除
  ctx.req.on("close", () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter((c) => c.id !== clientId);
  });
}

async function changeTheme(ctx, next) {
  currentThemeState = ctx.request.body;
  ctx.body = currentThemeState;
  return sendEventsToAll(currentThemeState);
}

function sendEventsToAll(themeState) {
  clients.forEach((c) =>
    c.stream.write(serverSentEvents("theme-change", JSON.stringify(themeState)))
  );
}

/**
 * `EventSource` 接口
 *
 * 客户端可以通过 `const evtSource = new EventSource("//localhost:3000/events")` 监听事件流
 */
router.get("/events", eventsHandler);

/**
 * 修改主题接口
 *
 * 请求的 `body` 示例：
 * ```json
 * {
 *  "theme": "light"
 * }
 * ```
 */
router.post("/change-theme", changeTheme);

const PORT = 3000;
let clients = [];

let currentThemeState = {
  theme: "light",
};

const options = {
  key: fs.readFileSync(path.resolve(__dirname, "certificate", "server.key")),
  cert: fs.readFileSync(path.resolve(__dirname, "certificate", "server.crt")),
};

// 启用 HTTP/2
http2.createSecureServer(options, app.callback()).listen(PORT, (err) => {
  if (err) {
    throw new Error(err);
  }

  console.log("Listening on port: " + PORT);
  console.log("请在浏览器访问：\n", `https://localhost:${PORT}`);
});
