# 通过 EventSource 来同步数据

一个 EventSource 实例会对 HTTP 服务开启一个持久化的连接，可以让服务器推送数据到客户端，与 WebSocket 不同的是，服务端推送是单向的，只能接收服务端的推送，不能向服务端推送数据。

## 示例

**假如有这样一个场景：**

我们有一个网站有切换主题的功能；  
用户可能同时在多个标签页打开了我们的网站；  
当用户切换了主题后，我们期望 _用户打开的所有标签页都能切换到最新的主题_ 。

借助 EventSource 我们可以比较容易地实现：

完整的实现可以参考：[EventSource Example](https://github.com/BetaGo/synchronize-data-across-documents-examples/tree/master/EventSource)

### 客户端

```javascript
// 创建一个持久化连接，用于接收推送
const evtSource = new EventSource("//localhost:3000/events");
// 监听服务端推送过来的 `theme-change` 事件，
evtSource.addEventListener("theme-change", (e) => {
  // 收到推送后，切换主题
  changeTheme(e.data);
});

// 假定我们有个切换主题的按钮 `switchThemeBtn`
// 点击后告诉服务器我们要切换的主题
switchThemeBtn.addEventListener("click", () => {
  fetch("//localhost:3000/change-theme", {
    method: "post",
    data: JSON.stringify({ theme: "light" }),
  });
});
```

### 服务端

以 `nodejs` 中最为知名的 `express` 框架为例

```javascript
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
});
```

## 注意事项

在没有使用 HTTP/2 的情况下，浏览器会限制同一域名下同时打开的连接数，默认是 6 个；也就意味着最多只能有 6 个 EventSource 实例生效，所以本方案有很大的局限性。

使用 HTTP / 2 时，服务器和客户端之间协商同时开启的 HTTP 流的最大数量（默认为 100）。

这里提供了一个本示例的 HTTP/2 实现: [koa-http2-example](https://github.com/BetaGo/synchronize-data-across-documents-examples/blob/master/EventSource/koa-http2-example.js) 可以用于参考对比

## 参考文章

- [nodejs-server-sent-events-build-realtime-app](https://www.digitalocean.com/community/tutorials/nodejs-server-sent-events-build-realtime-app)
- [Running Express, Koa And Hapi On HTTP/2](https://ivanjov.com/running-express-koa-and-hapi-on-http-2/)
