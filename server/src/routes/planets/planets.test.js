const app = require("../../app");
const request = require("supertest");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");

describe("Planets API", () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("GET All planets", () => {
    test("It should return 200 success", async () => {
      const response = await request(app)
        .get("/v1/planets")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });
});
