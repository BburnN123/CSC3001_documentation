import {
    SellerItemInTicketLineItem 
} from "@prisma/client";
import request from "supertest";

import server, { 
    setupHttpServer
} from "../../../../src/http-server";

import SellerItemInTicketLineItemSvc from "../../../../src/services/seller-item-in-ticket-line-item";

/* SETUP GLOBAL TEST VARIABLES */

const baseApiEndpoint = "/api/v1/seller-item-in-ticket-line-item";

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
    await SellerItemInTicketLineItemSvc.link(
        "ckuxewdpo000006l13b98cd62",
        "ckwyr2dq6000108l0amea9nlt",
        "ckxo8b833000008l50i922hjz");
});

afterAll(async() => {

    //Clear the DB
});

/* TEST SELLER ITEM IN TICKET LINE ITEM */
describe("SELLER ITEM IN TICKET LINE ITEM - POST", () => {
    it("POST /api/v1/seller-item-in-ticket-line-item - Create Seller Item In Ticket Line Item", async () => {

        /* Arrange */
        const _expectedResult: SellerItemInTicketLineItem = {
            id:               "ckxg2doj6000007jv4qn49zv8",
            sellerItemId:     "ckuxewke0000106l19dxsew6a",
            ticketLineItemId: "ckwyr2dq6000108l0amea9nlt"
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

        const _actualResult = _response.body as {
            sellerItemId: SellerItemInTicketLineItem["sellerItemId"];
            ticketLineItemId: SellerItemInTicketLineItem["ticketLineItemId"];
        };

        /* Assert */
        expect(_actualResult.sellerItemId).toBe(_expectedResult.sellerItemId);
        expect(_actualResult.ticketLineItemId).toBe(_expectedResult.ticketLineItemId);
    });

    it("POST /api/v1/seller-item-in-ticket-line-item/actions/unlink - Unlink Seller Item From Ticket Line Item", async () => {

        /* Arrange */
        const _sellerItemInTicketLineItem: SellerItemInTicketLineItem = {
            id:               "ckxg2doj6000007jv4qn49zv8",
            sellerItemId:     "ckuxewke0000106l19dxsew6a",
            ticketLineItemId: "ckwyr2dq6000108l0amea9nlt"
        };
    
        /* Act */
        const _response = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT + "/actions/unlink")
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(_sellerItemInTicketLineItem)
            .expect(200)
            .expect("Content-Type", /json/);
        
        const _actualResult = _response.body;

        /* Assert */
        expect(_actualResult).toBeNull;
    });
});

describe("SELLER ITEM IN TICKET LINE ITEM - GET", () => {
    it("GET /api/v1/seller-item-in-ticket-line-item/ticket-line-item/:ticketLineItemId - Get Seller Items By Ticket Line Id", async () => {
        
        /* Arrange */
        const expectedResult = 1;

        /* Act */
        const _response = await request(server)
            .get(RequestHeaders.BASE_API_ENDPOINT + "/ticket-line-item/ckwyr2dq6000108l0amea9nlt")
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .expect(200)
            .expect("Content-Type", /json/);

        const _actualResult = _response.body;

        /* Assert */
        expect(_actualResult.length).toBe(expectedResult);
    });
});