describe("Weather Manager E2E tests", () => {
    function cleanupCypressWeather() {
        cy.request("GET", "/api/weather").then((response) => {
            const weatherList = response.body;

            weatherList
                .filter((weather) => {
                    return (
                        weather.location &&
                        (
                            weather.location.startsWith("CYPRESS_") ||
                            weather.location.startsWith("UPDATED_CYPRESS_")
                        )
                    );
                })
                .forEach((weather) => {
                    cy.request("DELETE", `/api/weather/${weather.id}`);
                });
        });
    }

    function fillWeatherForm(location, temperature, humidity, condition) {
        cy.get('[data-cy="location-input"]').clear().type(location);
        cy.get('[data-cy="temperature-input"]').clear().type(temperature);
        cy.get('[data-cy="humidity-input"]').clear().type(humidity);
        cy.get('[data-cy="weather-condition-input"]').clear().type(condition);
    }

    function createWeatherThroughUi(location, temperature, humidity, condition) {
        fillWeatherForm(location, temperature, humidity, condition);
        cy.get('[data-cy="save-btn"]').click();

        cy.contains("tr", location, { timeout: 10000 }).should("exist");
    }

    beforeEach(() => {
        cy.visit("/");
        cleanupCypressWeather();
        cy.reload();
    });

    afterEach(() => {
        cleanupCypressWeather();
    });

    it("page_whenOpened_displaysWeatherManagerTitle", () => {
        cy.get('[data-cy="page-title"]')
            .should("be.visible")
            .and("contain.text", "Weather Manager");
    });

    it("form_whenOpened_displaysCreateWeatherTitle", () => {
        cy.get('[data-cy="form-title"]')
            .should("be.visible")
            .and("contain.text", "Create Weather Entry");
    });

    it("weather_whenValidDataSubmitted_createsWeather", () => {
        const location = `CYPRESS_CREATE_${Date.now()}`;

        createWeatherThroughUi(location, "22.5", "65", "sunny");

        cy.contains("tr", location)
            .should("contain.text", "22.5")
            .and("contain.text", "65")
            .and("contain.text", location)
            .and("contain.text", "sunny");
    });

    it("weather_whenTemperatureIsInvalid_showsValidationAlert", () => {
        cy.on("window:alert", (text) => {
            expect(text).to.equal("Please enter valid weather data");
        });

        fillWeatherForm("CYPRESS_BAD_TEMP", "-400", "50", "cloudy");
        cy.get('[data-cy="save-btn"]').click();
    });

    it("weather_whenLocationIsEmpty_showsValidationAlert", () => {
        cy.on("window:alert", (text) => {
            expect(text).to.equal("Please enter valid weather data");
        });

        cy.get('[data-cy="location-input"]').clear();
        cy.get('[data-cy="temperature-input"]').clear().type("20");
        cy.get('[data-cy="humidity-input"]').clear().type("50");
        cy.get('[data-cy="weather-condition-input"]').clear().type("rainy");
        cy.get('[data-cy="save-btn"]').click();
    });

    it("weather_whenHumidityIsInvalid_showsValidationAlert", () => {
        cy.on("window:alert", (text) => {
            expect(text).to.equal("Please enter valid weather data");
        });

        cy.get('[data-cy="location-input"]').clear().type("CYPRESS_BAD_HUMIDITY");
        cy.get('[data-cy="temperature-input"]').clear().type("20");
        cy.get('[data-cy="humidity-input"]').clear().type("150");
        cy.get('[data-cy="weather-condition-input"]').clear().type("clear");
        cy.get('[data-cy="save-btn"]').click();
    });

    it("weather_whenEditButtonClicked_fillsFormAndShowsCancelEdit", () => {
        const location = `CYPRESS_EDIT_${Date.now()}`;

        createWeatherThroughUi(location, "18.5", "70", "cloudy");

        cy.contains("tr", location)
            .within(() => {
                cy.get(".edit-btn").click();
            });

        cy.get('[data-cy="form-title"]').should("contain.text", "Edit Weather Entry");
        cy.get('[data-cy="cancel-edit-btn"]').should("be.visible");
        cy.get('[data-cy="location-input"]').should("have.value", location);
        cy.get('[data-cy="weather-condition-input"]').should("have.value", "cloudy");
    });

    it("weather_whenEdited_updatesWeatherInTable", () => {
        const oldLocation = `CYPRESS_OLD_${Date.now()}`;
        const updatedLocation = `UPDATED_CYPRESS_${Date.now()}`;

        createWeatherThroughUi(oldLocation, "15.5", "60", "rainy");

        cy.contains("tr", oldLocation)
            .within(() => {
                cy.get(".edit-btn").click();
            });

        cy.get('[data-cy="temperature-input"]').clear().type("25.5");
        cy.get('[data-cy="location-input"]').clear().type(updatedLocation);
        cy.get('[data-cy="weather-condition-input"]').clear().type("sunny");
        cy.get('[data-cy="save-btn"]').click();

        cy.contains("tr", updatedLocation, { timeout: 10000 })
            .should("contain.text", "25.5")
            .and("contain.text", "sunny");

        cy.contains("tr", oldLocation).should("not.exist");
    });

    it("cancelEdit_whenClicked_returnsFormToCreateMode", () => {
        const location = `CYPRESS_CANCEL_${Date.now()}`;

        createWeatherThroughUi(location, "20.0", "75", "clear");

        cy.contains("tr", location)
            .within(() => {
                cy.get(".edit-btn").click();
            });

        cy.get('[data-cy="cancel-edit-btn"]').click();

        cy.get('[data-cy="form-title"]').should("contain.text", "Create Weather Entry");
        cy.get('[data-cy="location-input"]').should("have.value", "");
        cy.get('[data-cy="temperature-input"]').should("have.value", "");
        cy.get('[data-cy="humidity-input"]').should("have.value", "");
        cy.get('[data-cy="weather-condition-input"]').should("have.value", "");
        cy.get('[data-cy="cancel-edit-btn"]').should("not.be.visible");
    });

    it("weather_whenDeleteButtonClicked_deletesWeather", () => {
        const location = `CYPRESS_DELETE_${Date.now()}`;

        createWeatherThroughUi(location, "30.0", "80", "storm");

        cy.contains("tr", location)
            .within(() => {
                cy.get(".delete-btn").click();
            });

        cy.contains("tr", location, { timeout: 10000 }).should("not.exist");
    });
});