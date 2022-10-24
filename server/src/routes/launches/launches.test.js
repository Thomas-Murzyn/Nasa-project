const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");

describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  // GET All launches
  describe("GET all launches", () => {
    test("It should return 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  // CREATE launch test
  describe("POST create a new launch", () => {
    const expectedLaunchData = {
      mission: "Kepler 007",
      target: "Kepler-442 b",
      rocket: "Arianne 5",
      launchDate: "January 23, 2030",
    };

    const expectedLaunchDataWithoutDate = {
      mission: "Kepler 007",
      target: "Kepler-442 b",
      rocket: "Arianne 5",
    };

    const expectedLaunchDataWithBadDateFormat = {
      mission: "Kepler 007",
      target: "Kepler-442 b",
      rocket: "Arianne 5",
      launchDate: "toto",
    };

    test("It should return 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(expectedLaunchData)
        .expect(201)
        .expect("Content-Type", /json/);

      const requestDate = new Date(expectedLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject(expectedLaunchDataWithoutDate);

      testLaunchToDelete = response;
    });

    test("It should catch error and return 400 Missing required launch data.", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(expectedLaunchDataWithoutDate)
        .expect(400)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({
        error: "Missing required launch data.",
      });
    });

    test("It should return 400 Bad launch date format", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(expectedLaunchDataWithBadDateFormat)
        .expect(400)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({
        error: "Bad launch date format.",
      });
    });
  });

  // DELETE launch test
  // If you want to run this test you have to pass a valid flightNumber in the request
  // describe("DELETE delete launch", () => {
  //   test("It should return 200 success", async () => {
  //     const response = await request(app)
  //       .delete(`/v1/launches/PASS_A_VALID_FLIGHT_NUMBER_HERE`)
  //       .expect("Content-Type", /json/)
  //       .expect(200);
  //   });

  //   test("It should return 404 not found Launch not found.", async () => {
  //     const response = await request(app)
  //       .delete("/v1/launches/0")
  //       .expect("Content-Type", /json/)
  //       .expect(404);

  //     expect(response.body).toStrictEqual({ error: "Launch not found." });
  //   });
  // });
});
