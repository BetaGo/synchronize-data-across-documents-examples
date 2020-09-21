let currentTheme = "light";

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
}

// 点击后，新打开一个浏览器窗口
newTabBtn.addEventListener("click", () => {
  window.open(window.location.href);
});

// 点击后，切换主题
switchThemeBtn.addEventListener("click", () => {
  const newTheme = currentTheme === "light" ? "dark" : "light";
  fetch("//localhost:3000/change-theme", {
    method: "post",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      theme: newTheme,
    }),
  });
});

// 点击后，给页面嵌入一个 iframe
addIframeBtn.addEventListener("click", () => {
  const frame = document.createElement("iframe");
  frame.src = window.location.href;
  framesContainer.appendChild(frame);
});

// 监听主题的变化
const evtSource = new EventSource("//localhost:3000/events");
evtSource.addEventListener("theme-change", (e) => {
  console.log(e);
  try {
    const themeState = JSON.parse(e.data);
    changeTheme(themeState.theme);
  } catch (error) {
    console.error(error);
  }
});
