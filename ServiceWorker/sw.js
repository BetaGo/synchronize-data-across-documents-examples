addEventListener("message", async (e) => {
  if ("broadcast" in e.data) {
    const allClient = await clients.matchAll();
    for (const client of allClient) {
      client.postMessage(e.data.broadcast);
    }
  }
});
