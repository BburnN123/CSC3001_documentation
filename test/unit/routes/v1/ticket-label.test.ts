import request from "supertest";

import server, { 
    setupHttpServer
} from "../../../../src/http-server";

import {
    seedTicketLabel
} from "../../../../prisma/seedTicketLabel";

/* SETUP GLOBAL TEST VARIABLES */

const baseApiEndpoint = "/api/v1/ticket-label";

const RequestHeaders =  {
    BASE_API_ENDPOINT:  baseApiEndpoint,
    CSRF_TOKEN_FIELD:   "x-eezee-csrf",
    CSRF_TOKEN_VALUE:   "EEZEE",
    CONTENT_TYPE_FIELD: "Content-Type",
    CONTENT_TYPE_VALUE: "application/json"
};

beforeAll(async() => {

    //Initialize Server
    await setupHttpServer();
});

afterAll(async() => {

    //Clear the DB
});

/* TEST TICKET LABEL */
describe("TICKET LABEL - POST", () => {
    it("POST /api/v1/ticket-label - Create Ticket Label", async () => {

        /* Arrange */
        const _ticketLabelData = {
            title:       seedTicketLabel[1].title,
            description: seedTicketLabel[1].description
        };

        const _expectedResult = _ticketLabelData;

        /* Act */
        const _response = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                _ticketLabelData,
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _actualResult = _response.body;

        /* Assert */
        expect(_actualResult.title).toBe(_expectedResult.title);
        expect(_actualResult.description).toBe(_expectedResult.description);
    });

    it("POST /api/v1/ticket-label/:ticketLabelId - Update Ticket Label Information", async () => {

        /* Arrange */
        const _ticketLabelData = {
            title:       "LTA",
            description: "LTA Related Projects"
        };

        const _expectedResult = _ticketLabelData;

        /* Act */
        const _response = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT + "/ckx04t1y3000109leg5233sct")
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                _ticketLabelData,
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _actualResult = _response.body;

        /* Assert */
        expect(_actualResult.title).toBe(_expectedResult.title);
        expect(_actualResult.description).toBe(_expectedResult.description);
    });
}); 

describe("TICKET LABEL - GET", () => {
    it("GET /api/v1/ticket-label/ - Get all Ticket Labels", async () => {

        /* Arrange */
        const expectedResult = 4;

        /* Act */
        const _response = await request(server)
            .get(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .expect(200)
            .expect("Content-Type", /json/);
        
        const _actualResult = _response.body;

        /* Assert */
        expect(_actualResult.length).toBe(expectedResult);
    } );
});