import request from "supertest";

import server, { 
    setupHttpServer
} from "../../../../src/http-server";

import TicketBodyInTicketLabelSvc from "../../../../src/services/ticket-body-in-ticket-label";

/* SETUP GLOBAL TEST VARIABLES */

const baseApiEndpoint = "/api/v1/ticket-body-in-ticket-label";

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

/* TEST TICKET BODY IN TICKET LABEL */
describe("TICKET BODY IN TICKET LABEL - POST", () => {
    it("POST /api/v1/ticket-body-in-ticket-label - Link Ticket Body To Ticket Label", async () => {

        /* Arrange */
        const _ticketBodyInTicketLabelData = {
            ticketBodyId:  "ckwyp5m14000009if58sp3qxg",
            ticketLabelId: "ckxh0qdxn000008mle356dh7w",
        };

        const _expectedResult = _ticketBodyInTicketLabelData;

        /* Act */
        const _response = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                _ticketBodyInTicketLabelData,
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _actualResult = _response.body;

        /* Assert */
        expect(_actualResult.ticketBodyId).toBe(_expectedResult.ticketBodyId);
        expect(_actualResult.ticketLabelId).toBe(_expectedResult.ticketLabelId);
    });

    it("POST /api/v1/ticket-body-in-ticket-label - Unlink Ticket Body From Ticket Label", async () => {

        /* Arrange */
        const _ticketBodyInTicketLabelData = {
            ticketBodyId:  "ckwyp5m14000009if58sp3qxg",
            ticketLabelId: "ckxh0qdxn000008mle356dh7w",
        };

        /* Act */
        const _response = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT + "/actions/unlink")
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                _ticketBodyInTicketLabelData,
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _actualResult = _response.body;

        /* Assert */
        expect(_actualResult).toBeNull;
    });
});

describe("TICKET BODY IN TICKET LABEL - GET", () => {
    it("GET /api/v1/ticket-body-ticket-label/label/:ticketLabelId - Get Ticket Bodies By Ticket Label", async () => {

        /* Arrange */
        await TicketBodyInTicketLabelSvc.link(
            "ckwyp5m14000009if58sp3qxg",
            "ckx04t1y3000109leg5233sct",
            "ckxpnqiuu000009mpgwe17hhy");
    
        await TicketBodyInTicketLabelSvc.link(
            "ckwyp64n8000109if8pox42n7",
            "ckx04t1y3000109leg5233sct",
            "ckxpnqiuu000009mpgwe17hhy");

        const expectedResult = 2;

        /* Act */
        const _response = await request(server)
            .get(RequestHeaders.BASE_API_ENDPOINT + "/label/ckx04t1y3000109leg5233sct")
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .expect(200)
            .expect("Content-Type", /json/);

        const _actualResult = _response.body;

        /* Assert */
        expect(_actualResult.length).toBe(expectedResult);
    });
});