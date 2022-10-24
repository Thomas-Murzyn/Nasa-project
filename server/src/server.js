const http = require("http");
require("dotenv").config();

const app = require("./app");
const { mongoConnect } = require("./services/mongo");

const { isLoadingPlanets } = require("./models/planets.model");
const { loadLaunchData } = require("./models/launches.model");

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

const startServer = async () => {
  await mongoConnect();
  await isLoadingPlanets();
  await loadLaunchData();
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
};

startServer();
