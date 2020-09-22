# 用 localStorage 来同步多个标签页之间的数据

当前页面使用的 storage 被其他页面修改时会触发 StorageEvent 事件.

我们可以通过监听该事件来同步数据.

## 示例

```javascript
// 在 A 标签页设置主题
localStorage.setItem("theme", "light");

// 在 B 标签页就可以监听到此次改动
window.addEventListener("storage", (e) => {
  if (e.key === "theme" && e.newValue) {
    changeTheme(e.newValue);
  }
});
```

**注意事项** 在当前页面修改 localStorage 时, 当前页面的 StorageEvent 事件并不会被触发.
