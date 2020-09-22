let currentTheme = "light";

const themeNameElement = document.querySelector("#themeName");
const framesContainer = document.querySelector(".frames");
const newTabBtn = document.querySelector("#newTabBtn");
const switchThemeBtn = document.querySelector("#switchThemeBtn");
const addIframeBtn = document.querySelector("#addIframeBtn");

changeTheme(localStorage.getItem("theme") || currentTheme);

function changeTheme(theme) {
  if (theme === currentTheme) return;
  currentTheme = theme;
  document.body.className = currentTheme;
  themeNameElement.innerHTML = currentTheme;
}

newTabBtn.addEventListener("click", () => {
  const listenerWindow = window.open(window.location.href);
  openedWindows.push(listenerWindow);
});

switchThemeBtn.addEventListener("click", () => {
  const newTheme = currentTheme === "light" ? "dark" : "light";
  changeTheme(newTheme);
  localStorage.setItem("theme", newTheme);
});

addIframeBtn.addEventListener("click", () => {
  const frame = document.createElement("iframe");
  frame.src = window.location.href;
  framesContainer.appendChild(frame);
});

// 监听主题的变化
window.addEventListener("storage", (e) => {
  if (e.key === "theme" && e.newValue) {
    changeTheme(e.newValue);
  }
});
