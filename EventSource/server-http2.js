// Require needed modules and initialize Express app
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(express.static("public"));

// Middleware for GET /events endpoint
function eventsHandler(req, res, next) {
  // Mandatory headers and http status to keep connection open
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  res.writeHead(200, headers);
  // After client opens connection send all nests as string
  const data = `data: ${JSON.stringify(currentThemeState)}\n\n`;
  // const data = JSON.stringify(currentThemeState);
  res.write(data);
  // Generate an id based on timestamp and save res
  // object of client connection on clients list
  // Later we'll iterate it and send updates to each client
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res,
  };
  clients.push(newClient);
  // When client closes connection we update the clients list
  // avoiding the disconnected one
  req.on("close", () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter((c) => c.id !== clientId);
  });
}
// Iterate clients list and use write res object method to send new nest
function sendEventsToAll(newTheme) {
  clients.forEach((c) => c.res.write(`data: ${JSON.stringify(newTheme)}\n\n`));
}
// Middleware for POST /nest endpoint
async function changeTheme(req, res, next) {
  currentThemeState = req.body;
  // const newTheme = req.body;
  // nests.push(newTheme);
  // Send recently added nest as POST result
  res.json(currentThemeState);
  // Invoke iterate and send function
  return sendEventsToAll(currentThemeState);
}
// Set cors and bodyParser middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// Define endpoints
app.post("/change-theme", changeTheme);
app.get("/events", eventsHandler);

const PORT = 3000;
let clients = [];

let currentThemeState = {
  theme: "light",
};

app.listen(PORT, () => {
  console.log("server in port: " + PORT);
});
