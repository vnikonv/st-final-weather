const pool = require("../db");

async function getAllWeather() {
    const result = await pool.query("SELECT * FROM weather ORDER BY id ASC");
    return result.rows;
}

async function getWeatherById(id) {
    const result = await pool.query("SELECT * FROM weather WHERE id = $1", [id]);
    return result.rows[0];
}

async function createWeather(weather) {
    const { location, temperature, humidity, weather_condition } = weather;

    const result = await pool.query(
        `INSERT INTO weather (location, temperature, humidity, weather_condition, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *`,
        [location, temperature, humidity, weather_condition]
    );

    return result.rows[0];
}

async function updateWeather(id, weather) {
    const { location, temperature, humidity, weather_condition } = weather;

    const result = await pool.query(
        `UPDATE weather
     SET location = $1,
         temperature = $2,
         humidity = $3,
         weather_condition = $4,
         updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
        [location, temperature, humidity, weather_condition, id]
    );

    return result.rows[0];
}

async function deleteWeather(id) {
    const result = await pool.query(
        "DELETE FROM weather WHERE id = $1 RETURNING *",
        [id]
    );

    return result.rows[0];
}

module.exports = {
    getAllWeather,
    getWeatherById,
    createWeather,
    updateWeather,
    deleteWeather,
};
