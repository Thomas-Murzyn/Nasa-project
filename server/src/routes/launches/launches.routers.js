const express = require("express");

const launchesRouter = express.Router();
const {
  httpGetAllLaunches,
  httpAddLaunches,
  httpAbortLaunches,
} = require("./launches.controllers");

launchesRouter.get("/", httpGetAllLaunches);
launchesRouter.post("/", httpAddLaunches);
launchesRouter.delete("/:id", httpAbortLaunches);

module.exports = launchesRouter;
