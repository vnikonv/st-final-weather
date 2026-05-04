const express = require("express");
const router = express.Router();

const weatherRepository = require("../repositories/weather.repository");

function isValidWeatherBody(body) {
    return (
        body.location &&
        body.location.trim() !== "" &&
        body.temperature !== undefined &&
        Number(body.temperature) >= -273.15 &&
        body.humidity !== undefined &&
        Number(body.humidity) >= 0 &&
        Number(body.humidity) <= 100 &&
        body.weather_condition &&
        body.weather_condition.trim() !== ""
    );
}

router.get("/", async (req, res) => {
    try {
        const weather = await weatherRepository.getAllWeather();
        res.status(200).json(weather);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch weather" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const weather = await weatherRepository.getWeatherById(req.params.id);

        if (!weather) {
            return res.status(404).json({ error: "Weather not found" });
        }

        res.status(200).json(weather);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch weather" });
    }
});

router.post("/", async (req, res) => {
    try {
        if (!isValidWeatherBody(req.body)) {
            return res.status(400).json({ error: "Invalid weather data" });
        }

        const weather = await weatherRepository.createWeather(req.body);
        res.status(201).json(weather);
    } catch (error) {
        res.status(500).json({ error: `Failed to create weather: ${error}` });
    }
});

router.put("/:id", async (req, res) => {
    try {
        if (!isValidWeatherBody(req.body)) {
            return res.status(400).json({ error: "Invalid weather data" });
        }

        const weather = await weatherRepository.updateWeather(req.params.id, req.body);

        if (!weather) {
            return res.status(404).json({ error: "Weather not found" });
        }

        res.status(200).json(weather);
    } catch (error) {
        res.status(500).json({ error: "Failed to update weather" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const weather = await weatherRepository.deleteWeather(req.params.id);

        if (!weather) {
            return res.status(404).json({ error: "Weather not found" });
        }

        res.status(200).json({
            message: "Weather deleted successfully",
            weather,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete weather" });
    }
});

module.exports = router;
