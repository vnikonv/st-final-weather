module.exports = {
    testEnvironment: "node",
    collectCoverage: true,
    coverageReporters: ["text", "html"],
    coveragePathIgnorePatterns: ["/node_modules/", "/src/server.js"],
};