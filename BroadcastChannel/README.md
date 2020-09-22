# 用 BroadcastChannel 来同步多个标签页之间的数据

BroadcastChannel 接口代理了一个命名频道。它允许同源的不同浏览器窗口，Tab 页，frame 或者 iframe 下的不同文档之间相互通信。通过触发一个 message 事件，消息可以广播到所有监听了该频道的 BroadcastChannel 对象。

## 示例

```javascript
const themeChangeChannel = new BroadcastChannel("theme-change");

themeChangeChannel.postMessage("light");

themeChangeChannel.addEventListener("message", (e) => {
  console.log(e.data); // light
});
```
