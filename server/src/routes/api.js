const express = require("express");

const api = express.Router();

const planetsRouter = require("./planets/planets.routers");
const launchesRouter = require("./launches/launches.routers");

api.use("/planets", planetsRouter);
api.use("/launches", launchesRouter);

module.exports = api;
