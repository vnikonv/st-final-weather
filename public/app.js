const API_URL = "/api/weather";

function clearForm() {
    $("#weather-id").val("");
    $("#location").val("");
    $("#temperature").val("");
    $("#humidity").val("");
    $("#weather-condition").val("");

    $("#form-title").text("Create Weather Entry");
    $("#cancel-edit-btn").hide();
}

function getWeatherFromForm() {
    return {
        location: $("#location").val().trim(),
        temperature: Number($("#temperature").val()),
        humidity: Number($("#humidity").val()),
        weather_condition: $("#weather-condition").val().trim(),
    };
}

function isValidWeather(weather) {
    return (
        weather.location !== "" &&
        weather.temperature >= -273.15 &&
        weather.humidity >= 0 &&
        weather.humidity <= 100 &&
        weather.weather_condition !== ""
    );
}

function renderWeatherRow(weather) {
    return `
        <tr>
            <td>${weather.id}</td>
            <td>${weather.location}</td>
            <td>${weather.temperature}</td>
            <td>${weather.humidity}</td>
            <td>${weather.weather_condition}</td>
            <td>
                <div class="actions">
                    <button class="edit-btn" data-id="${weather.id}">Edit</button>
                    <button class="delete-btn" data-id="${weather.id}">Delete</button>
                </div>
            </td>
        </tr>
    `;
}

function loadWeather() {
    $.ajax({
        url: API_URL,
        method: "GET",
        success: function (weatherList) {
            $("#weather-table-body").empty();

            weatherList.forEach(function (weather) {
                $("#weather-table-body").append(renderWeatherRow(weather));
            });
        },
        error: function () {
            alert("Failed to load weather");
        },
    });
}

function createWeather(weather) {
    $.ajax({
        url: API_URL,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(weather),
        success: function () {
            clearForm();
            loadWeather();
        },
        error: function () {
            alert("Failed to create weather entry");
        },
    });
}

function updateWeather(id, weather) {
    $.ajax({
        url: `${API_URL}/${id}`,
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify(weather),
        success: function () {
            clearForm();
            loadWeather();
        },
        error: function () {
            alert("Failed to update weather entry");
        },
    });
}

function deleteWeather(id) {
    $.ajax({
        url: `${API_URL}/${id}`,
        method: "DELETE",
        success: function () {
            loadWeather();
        },
        error: function () {
            alert("Failed to delete weather entry");
        },
    });
}

function loadWeatherForEdit(id) {
    $.ajax({
        url: `${API_URL}/${id}`,
        method: "GET",
        success: function (weather) {
            $("#weather-id").val(weather.id);
            $("#location").val(weather.location);
            $("#temperature").val(weather.temperature);
            $("#humidity").val(weather.humidity);
            $("#weather-condition").val(weather.weather_condition);

            $("#form-title").text("Edit Weather Entry");
            $("#cancel-edit-btn").show();
        },
        error: function () {
            alert("Failed to load weather entry for edit");
        },
    });
}

$(document).ready(function () {
    loadWeather();

    $("#save-btn").on("click", function () {
        const weather = getWeatherFromForm();

        if (!isValidWeather(weather)) {
            alert("Please enter valid weather data");
            return;
        }

        const weatherId = $("#weather-id").val();

        if (weatherId) {
            updateWeather(weatherId, weather);
        } else {
            createWeather(weather);
        }
    });

    $("#cancel-edit-btn").on("click", function () {
        clearForm();
    });

    $("#weather-table-body").on("click", ".edit-btn", function () {
        const id = $(this).data("id");
        loadWeatherForEdit(id);
    });

    $("#weather-table-body").on("click", ".delete-btn", function () {
        const id = $(this).data("id");
        deleteWeather(id);
    });
});