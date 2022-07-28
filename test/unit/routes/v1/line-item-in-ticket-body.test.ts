/* NODE MODULES */
import request from "supertest";

/* DB  IMPORTS*/

/* TEST FRAMEWORK IMPORTS */
import {
    setupHttpServer
} from "../../../../src/http-server";

import server from "../../../../src/http-server";
import LineItemInTicketBodySvc from "../../../../src/services/line-item-in-ticket-body";

/* SETUP GLOBAL TEST VARIABLES */

const baseApiEndpoint = "/api/v1/line-item-in-ticket-body";

const RequestHeaders =  {
    BASE_API_ENDPOINT:  baseApiEndpoint,
    CSRF_TOKEN_FIELD:   "x-eezee-csrf",
    CSRF_TOKEN_VALUE:   "EEZEE",
    CONTENT_TYPE_FIELD: "Content-Type",
    CONTENT_TYPE_VALUE: "application/json"
};

beforeAll(async () => {

    //Initialize Server
    await setupHttpServer();

    await LineItemInTicketBodySvc.link(
        "ckwyr2dq6000108l0amea9nlt",
        "ckwyp5m14000009if58sp3qxg",
        "ckxh0qdxn000008mle356dh7w"
    );

    await LineItemInTicketBodySvc.link(
        "ckxg2doj6000007jv4qn49zv8",
        "ckwyp64n8000109if8pox42n7",
        "ckxoe4kjp000009l90q9h6ecw"
    );

});

afterAll(async () => {

    //Clean the DB
});

/* TEST LINE ITEM IN TICKET BODY */
describe("LINE ITEM IN TICKET BODY - POST", () => {
    it("POST /api/v1/line-item-in-ticket-body/ - Link Item To Ticket Body", async () => {

        /* Arrange */
        const _expectedResult = {
            lineItemId:   "ckwzzqhre000009m74qqz0043",
            ticketBodyId: "ckwyp5m14000009if58sp3qxg"
        };

        /* Act */
        const _response = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                _expectedResult
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _actualResult = _response.body;

        /* Assert */
        expect(_actualResult.ticketLineItemId).toBe(_expectedResult.lineItemId);
        expect(_actualResult.ticketBodyId).toBe(_expectedResult.ticketBodyId);

    });

    it("POST /api/v1/line-item-in-ticket-body/actions/unlink - Unlink Line Item From Ticket Body", async () => {

        /* Arrange */
        const _lineItemInTicketBodyData = {
            lineItemId:   "ckwzzqhre000009m74qqz0043",
            ticketBodyId: "ckwyp5m14000009if58sp3qxg"
        };
        
        /* Act */
        const _response = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT + "/actions/unlink")
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                _lineItemInTicketBodyData
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _actualResult = _response.body;

        /* Assert */
        expect(_actualResult).toBeNull;

    });

    // it("POST /api/v1/line-item-in-ticket-body/actions/unlink-by-ticket-body-id - Unlink Line Item From Ticket Body By Ticket Body Id", async () => {

    //     /* Arrange */
    //     const _lineItemInTicketBodyData = {
    //         ticketBodyId: "ckwyp5m14000009if58sp3qxg"
    //     };
        
    //     /* Act */
    //     const _response = await request(server)
    //         .post("/api/v1/line-item-in-ticket-body/actions/unlink-by-ticket-body-id")
    //         .set("Content-Type", "application/json")
    //         .set("x-eezee-csrf", csrf_token)
    //         .send(
    //             _lineItemInTicketBodyData
    //         )
    //         .expect(200)
    //         .expect("Content-Type", /json/);

    //     const _actualResult = _response.body;

    //     console.log(_actualResult);

    //     /* Assert */
    //     expect(_actualResult).toBeNull;

    // });
});

describe("LINE ITEM IN TICKET BODY = GET", () => {
    it("GET /api/v1/line-item-in-ticket-body/:ticketBodyId - Get Line Item By Ticket Body", async () => {

        /* Arrange */
        const expectedResult = 1;

        /* Act */
        const _response = await request(server)
            .get(RequestHeaders.BASE_API_ENDPOINT + "/ckwyp5m14000009if58sp3qxg")
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .expect(200)
            .expect("Content-Type", /json/);

        const _actualResult = _response.body;

        /* Assert */
        expect(_actualResult.length).toBe(expectedResult);

    });
});