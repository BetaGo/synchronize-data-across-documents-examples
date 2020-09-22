# 用 postMessage 来同步多个标签页之间的数据

我们可以通过 window.postMessage 方法来在不同的 window 之间发送数据.

**注意:** 这里有个前提是必须要知道目标 window 对象;
