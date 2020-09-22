let currentTheme = "light";

const themeNameElement = document.querySelector("#themeName");
const framesContainer = document.querySelector(".frames");
const newTabBtn = document.querySelector("#newTabBtn");
const switchThemeBtn = document.querySelector("#switchThemeBtn");
const addIframeBtn = document.querySelector("#addIframeBtn");

changeTheme(currentTheme);

const themeChangeChannel = new BroadcastChannel("theme-change");

function changeTheme(theme) {
  if (theme === currentTheme) return;
  currentTheme = theme;
  document.body.className = currentTheme;
  themeNameElement.innerHTML = currentTheme;
}

newTabBtn.addEventListener("click", () => {
  const listenerWindow = window.open(window.location.href);
});

switchThemeBtn.addEventListener("click", () => {
  const newTheme = currentTheme === "light" ? "dark" : "light";
  changeTheme(newTheme);
  themeChangeChannel.postMessage(newTheme);
});

addIframeBtn.addEventListener("click", () => {
  const frame = document.createElement("iframe");
  frame.src = window.location.href;
  framesContainer.appendChild(frame);
});

// 监听主题的变化
themeChangeChannel.addEventListener("message", (e) => {
  changeTheme(e.data);
});
