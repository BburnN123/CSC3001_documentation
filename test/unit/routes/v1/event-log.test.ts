/* NODE MODULES */
import request from "supertest";

/* DB */
import {
    EventLog,
} from "@prisma/client";

/* SERVICES */

/* CONFIG & UTILS */
import server, {
    setupHttpServer
} from "../../../../src/http-server";

/* TEST DATA */

/* SETUP GLOBAL TEST VARIABLES */
const baseApiEndpoint = "/api/v1/event-log";

const RequestHeaders = {
    BASE_API_ENDPOINT:  baseApiEndpoint,
    CSRF_TOKEN_FIELD:   "x-eezee-csrf",
    CSRF_TOKEN_VALUE:   "EEZEE",
    CONTENT_TYPE_FIELD: "Content-Type",
    CONTENT_TYPE_VALUE: "application/json"
};

const userId = "ckvj9b12m0000hutgkrcel8s3";

beforeAll(async () => {

    // Initialize Server
    await setupHttpServer();
});

afterAll(async () => {

});

/* TEST POST API */
describe("Event Log Categories GET API", () => {


    it("GET /api/v1/event-log/categories/last-refresh - Create a Seller Comment", async () => {

        // Arrange
       
        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/categories/last-refresh`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .expect(200);

        // Assert
        const {
           eventType : actualEventType
        } = response.body as EventLog;

        expect(actualEventType).toBe("FETCH");


    });
});