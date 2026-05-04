const request = require("supertest");
const app = require("../src/app");

const weatherRepository = require("../src/repositories/weather.repository");

jest.mock("../src/repositories/weather.repository");

describe("Weather API with mocked database", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("getAllWeather_whenWeatherExists_returnsWeatherArray", async () => {
        weatherRepository.getAllWeather.mockResolvedValue([
            {
                id: 1,
                location: "New York",
                temperature: "22.5",
                humidity: "65",
                weather_condition: "sunny",
            },
        ]);

        const response = await request(app).get("/api/weather");

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].location).toBe("New York");
        expect(weatherRepository.getAllWeather).toHaveBeenCalledTimes(1);
    });

    it("getWeatherById_whenWeatherExists_returnsWeather", async () => {
        weatherRepository.getWeatherById.mockResolvedValue({
            id: 1,
            location: "New York",
            temperature: "22.5",
            humidity: "65",
            weather_condition: "sunny",
        });

        const response = await request(app).get("/api/weather/1");

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(1);
        expect(response.body.location).toBe("New York");
        expect(weatherRepository.getWeatherById).toHaveBeenCalledWith("1");
    });

    it("getWeatherById_whenWeatherDoesNotExist_returns404", async () => {
        weatherRepository.getWeatherById.mockResolvedValue(undefined);

        const response = await request(app).get("/api/weather/999");

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("Weather not found");
    });

    it("createWeather_whenValidDataProvided_returns201", async () => {
        const newWeather = {
            location: "Los Angeles",
            temperature: 28.5,
            humidity: 45,
            weather_condition: "cloudy",
        };

        weatherRepository.createWeather.mockResolvedValue({
            id: 2,
            ...newWeather,
        });

        const response = await request(app)
            .post("/api/weather")
            .send(newWeather);

        expect(response.statusCode).toBe(201);
        expect(response.body.id).toBe(2);
        expect(response.body.location).toBe("Los Angeles");
        expect(weatherRepository.createWeather).toHaveBeenCalledWith(newWeather);
    });

    it("createWeather_whenLocationIsEmpty_returns400", async () => {
        const response = await request(app)
            .post("/api/weather")
            .send({
                location: "",
                temperature: 20,
                humidity: 50,
                weather_condition: "rainy",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Invalid weather data");
        expect(weatherRepository.createWeather).not.toHaveBeenCalled();
    });

    it("createWeather_whenHumidityOutOfRange_returns400", async () => {
        const response = await request(app)
            .post("/api/weather")
            .send({
                location: "Chicago",
                temperature: 20,
                humidity: 150,
                weather_condition: "rainy",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Invalid weather data");
        expect(weatherRepository.createWeather).not.toHaveBeenCalled();
    });

    it("createWeather_whenConditionIsEmpty_returns400", async () => {
        const response = await request(app)
            .post("/api/weather")
            .send({
                location: "Miami",
                temperature: 32,
                humidity: 80,
                weather_condition: "",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Invalid weather data");
        expect(weatherRepository.createWeather).not.toHaveBeenCalled();
    });

    it("updateWeather_whenWeatherExists_returnsUpdatedWeather", async () => {
        const updatedWeather = {
            location: "Boston",
            temperature: 15.5,
            humidity: 75,
            weather_condition: "rainy",
        };

        weatherRepository.updateWeather.mockResolvedValue({
            id: 1,
            ...updatedWeather,
        });

        const response = await request(app)
            .put("/api/weather/1")
            .send(updatedWeather);

        expect(response.statusCode).toBe(200);
        expect(response.body.location).toBe("Boston");
        expect(response.body.weather_condition).toBe("rainy");
        expect(weatherRepository.updateWeather).toHaveBeenCalledWith("1", updatedWeather);
    });

    it("updateWeather_whenWeatherDoesNotExist_returns404", async () => {
        weatherRepository.updateWeather.mockResolvedValue(undefined);

        const response = await request(app)
            .put("/api/weather/999")
            .send({
                location: "Denver",
                temperature: 18.5,
                humidity: 40,
                weather_condition: "clear",
            });

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("Weather not found");
    });

    it("updateWeather_whenInvalidDataProvided_returns400", async () => {
        const response = await request(app)
            .put("/api/weather/1")
            .send({
                location: "",
                temperature: -400,
                humidity: 150,
                weather_condition: "",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Invalid weather data");
        expect(weatherRepository.updateWeather).not.toHaveBeenCalled();
    });

    it("deleteWeather_whenWeatherExists_returnsSuccessMessage", async () => {
        weatherRepository.deleteWeather.mockResolvedValue({
            id: 1,
            location: "New York",
            temperature: "22.5",
            humidity: "65",
            weather_condition: "sunny",
        });

        const response = await request(app).delete("/api/weather/1");

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Weather deleted successfully");
        expect(response.body.weather.id).toBe(1);
        expect(weatherRepository.deleteWeather).toHaveBeenCalledWith("1");
    });

    it("deleteWeather_whenWeatherDoesNotExist_returns404", async () => {
        weatherRepository.deleteWeather.mockResolvedValue(undefined);

        const response = await request(app).delete("/api/weather/999");

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("Weather not found");
    });

    it("healthCheck_whenCalled_returnsOK", async () => {
        const response = await request(app).get("/health");

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("OK");
    });
});