let currentTheme = "light";

/**
 * 在当前页面通过 `window.open` 打开的标签页
 */
const openedWindows = [];

/**
 * 通知当前页面中的 `iframe` 元素, 以及在当前页面通过 `window.open` 打开的标签页切换主题。
 *
 */
function emitThemeChangeEvent() {
  // 当前页面下的 iframe 元素
  const frameWindows = [];
  for (let i = 0; i < window.frames.length; i++) {
    frameWindows.push(window.frames[i]);
  }

  // 过滤掉已经关闭的标签页
  const allListenerWindows = [...openedWindows, ...frameWindows].filter(
    (w) => w && !w.closed
  );

  const message = {
    messageSource: "SWITCH_THEME",
    theme: currentTheme,
  };

  allListenerWindows.forEach((w) => {
    w.postMessage(message);
  });
}

/**
 * 在当前页面是嵌在 `iframe` 里面的，或者是通过 `window.open` 打开的页面时。
 * 通知当前页面的 “父元素” 切换主题。
 */
function emitThemeChangeEventToParent() {
  const message = {
    messageSource: "WISH_TO_SWITCH_THEME",
    theme: currentTheme,
  };
  const listeners = [window.opener, window.parent].filter(
    (w) => w && !w.closed && w !== window
  );

  listeners.forEach((w) => w.postMessage(message));
}

const themeNameElement = document.querySelector("#themeName");
const framesContainer = document.querySelector(".frames");
const newTabBtn = document.querySelector("#newTabBtn");
const switchThemeBtn = document.querySelector("#switchThemeBtn");
const addIframeBtn = document.querySelector("#addIframeBtn");

function changeTheme(theme) {
  if (theme === currentTheme) return;
  currentTheme = theme;
  document.body.className = currentTheme;
  themeNameElement.innerHTML = currentTheme;
  emitThemeChangeEvent();
}

newTabBtn.addEventListener("click", () => {
  const listenerWindow = window.open(window.location.href);
  openedWindows.push(listenerWindow);
});

switchThemeBtn.addEventListener("click", () => {
  const newTheme = currentTheme === "light" ? "dark" : "light";
  changeTheme(newTheme);
  emitThemeChangeEventToParent();
});

addIframeBtn.addEventListener("click", () => {
  const frame = document.createElement("iframe");
  frame.src = window.location.href;
  framesContainer.appendChild(frame);
});

// 监听主题的变化
window.addEventListener("message", (e) => {
  if (e.data && e.data.messageSource === "SWITCH_THEME") {
    changeTheme(e.data.theme);
  }
  if (e.data && e.data.messageSource === "WISH_TO_SWITCH_THEME") {
    changeTheme(e.data.theme);
    const hasParent = window.parent !== window || window.opener;
    if (hasParent) {
      emitThemeChangeEventToParent();
    }
  }
});
