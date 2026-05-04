const express = require("express");
const path = require("path");

const weatherRoutes = require("./routes/weather.routes");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/weather", weatherRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});

module.exports = app;