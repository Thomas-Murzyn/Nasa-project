const launches = require("./launches.mongo");
const planets = require("./planets.mongo");
const axios = require("axios");

const DEFAULT_FLIGHT_NUMBER = 100;
const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function getAllLaunches(limit, skip) {
  return await launches
    .find({})
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
  await launches.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );

  return launch;
}

async function getLatestFlightNumber() {
  const latestFlightNumber = await launches.findOne().sort("-flightNumber");

  if (!latestFlightNumber) {
    return DEFAULT_FLIGHT_NUMBER;
  } else {
    latestFlightNumber.flightNumber = latestFlightNumber.flightNumber + 1;
    return latestFlightNumber.flightNumber;
  }
}

async function addNewLaunch(launch) {
  const planet = await planets.findOne({
    kepler_name: launch.target,
  });

  if (!planet) {
    // throw new Error("Planet not found.");
    console.error("Planet not found.");
    return { error: "Planet not found." };
  }
  const latestFlightNumber = await getLatestFlightNumber();

  const newLaunch = {
    ...launch,
    flightNumber: latestFlightNumber,
    customers: ["ZTM", "NASA"],
    upcoming: true,
    success: true,
  };

  const response = await saveLaunch(newLaunch);

  return response;
}
async function findLaunch(filter) {
  return await launches.findOne(filter);
}

async function isLaunchExist(flightNumber) {
  return await findLaunch({ flightNumber });
}

async function abortLaunchById(flightNumber) {
  const deletedLaunch = await launches.updateOne(
    {
      flightNumber,
    },
    {
      success: false,
      upcoming: false,
    }
  );

  return deletedLaunch.modifiedCount === 1;
}

async function populateLaunches() {
  try {
    const response = await axios.post(SPACEX_API_URL, {
      query: {},
      options: {
        pagination: false,
        populate: [
          {
            path: "rocket",
            select: {
              name: 1,
            },
          },
          {
            path: "payloads",
            select: {
              customers: 1,
            },
          },
        ],
      },
    });

    const launchesData = response.data.docs;
    console.log("Downloading data ...");
    for (const launchData of launchesData) {
      const customers = launchData["payloads"].flatMap((payload) => {
        return payload["customers"];
      });

      const launch = {
        flightNumber: launchData["flight_number"],
        mission: launchData["name"],
        rocket: launchData["rocket"]["name"],
        launchDate: launchData["date_local"],
        upcoming: launchData["upcoming"],
        success: launchData["success"],
        customers,
      };

      await saveLaunch(launch);
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    mission: "FalconSat",
    rocket: "Falcon 1",
  });

  if (firstLaunch) {
    console.log("Lauch Data already exist ");
  } else {
    await populateLaunches();
  }
}

module.exports = {
  getAllLaunches,
  addNewLaunch,
  isLaunchExist,
  abortLaunchById,
  loadLaunchData,
};
