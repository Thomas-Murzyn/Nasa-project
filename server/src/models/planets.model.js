const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const planets = require("./planets.mongo");

const isHabitablePlanets = (planet) => {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
};

const isLoadingPlanets = () => {
  return new Promise((resolve, rejects) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", (data) => {
        if (isHabitablePlanets(data)) {
          savePlanet(data);
        }
      })
      .on("error", (error) => {
        console.log(error);
        rejects(error);
      })
      .on("end", async () => {
        const numberOfPlanetsFound = (await getAllPlanets()).length;
        console.log(`${numberOfPlanetsFound} planets found`);
        resolve();
      });
  });
};

async function savePlanet(planet) {
  try {
    await planets.updateOne(
      {
        kepler_name: planet.kepler_name,
      },
      {
        kepler_name: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (error) {
    console.error(`Failed to save planet : ${error}`);
  }
}

async function getAllPlanets() {
  return await planets.find({});
}

module.exports = {
  isLoadingPlanets,
  getAllPlanets,
};
