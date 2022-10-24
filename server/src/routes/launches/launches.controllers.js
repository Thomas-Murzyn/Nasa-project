const {
  getAllLaunches,
  addNewLaunch,
  isLaunchExist,
  abortLaunchById,
} = require("../../models/launches.model");

const getPagination = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const { limit, skip } = getPagination(req.query);
  return res.status(200).json(await getAllLaunches(limit, skip));
}

async function httpAddLaunches(req, res) {
  if (
    req.body.mission &&
    req.body.rocket &&
    req.body.target &&
    req.body.launchDate
  ) {
    const newLaunch = req.body;
    newLaunch.launchDate = new Date(newLaunch.launchDate);
    if (isNaN(newLaunch.launchDate)) {
      return res.status(400).json({
        error: "Bad launch date format.",
      });
    }
    const response = await addNewLaunch(newLaunch);
    return res.status(201).json(response);
  } else {
    return res.status(400).json({ error: "Missing required launch data." });
  }
}

async function httpAbortLaunches(req, res) {
  const launchId = Number(req.params.id);

  if (await isLaunchExist(launchId)) {
    const response = await abortLaunchById(launchId);

    if (!response) {
      return res.status(400).json({ error: "Launch not aborted." });
    }

    return res.status(200).json(response);
  } else {
    return res.status(404).json({ error: "Launch not found." });
  }
}

module.exports = {
  httpGetAllLaunches,
  httpAddLaunches,
  httpAbortLaunches,
};
