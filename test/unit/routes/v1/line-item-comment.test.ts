/**
 * File : line-item-comment.test.ts
 * Testing the available routes that is inside routes/v1/ticket-line-item/:ticketLineItemId/line-item-comment.ts
 */

/* NODE MODULES */
import request from "supertest";

/* DB IMPORTS*/
import prisma from "../../../../src/db";

/* CONFIG & UTILS */
import { setupHttpServer } from "../../../../src/http-server";
import server from "../../../../src/http-server";

/* SERVICES */
import LineItemCommentSvc, { EditableFields_LineItemComment } from "../../../../src/services/line-item-comment";
import TicketLineItemSvc from "../../../../src/services/ticket-line-item";
import UserSvc from "../../../../src/services/user";

/* TYPES */
import { LineItemComment } from "@prisma/client";

/* TEST DATA */
import { seedTicketLineItem } from "../../../../prisma/seedTicketLineItem";
import { seedLineItemComment } from "../../../../prisma/seedLineItemComment";
import { userSeed } from "../../../../prisma/seedUser";





beforeAll(async () => {
    

    // Initialize Server
    await setupHttpServer();

    // Seed
    await seedForLineItemCommentTest();
 
});

afterAll(async () => {

    // Clear DB - Teardown created dependencies and objects from test
    await teardownSeedForLineItemCommentTest();

});

const seedForLineItemCommentTest = async () => {
    
    // Seed Users
    let _userOne = await UserSvc.getByEmail(userSeed[0].email);
    if (!_userOne) {
        _userOne = await UserSvc.create(userSeed[0].name, userSeed[0].email);
    }

    // Seed Ticket Line Item
    await TicketLineItemSvc.create(
        seedTicketLineItem[0],
        _userOne.id
    );
};

const teardownSeedForLineItemCommentTest = async () => {

    await LineItemCommentSvc.deleteAll();
    await TicketLineItemSvc.deleteAll();
    await UserSvc.deleteAll();
};

/* SETUP GLOBAL TEST VARIABLES */

const baseApiEndpoint = "/api/v1/ticket-line-items";

const RequestHeaders =  {
    BASE_API_ENDPOINT:  baseApiEndpoint,
    CSRF_TOKEN_FIELD:   "x-eezee-csrf",
    CSRF_TOKEN_VALUE:   "EEZEE",
    CONTENT_TYPE_FIELD: "Content-Type",
    CONTENT_TYPE_VALUE: "application/json"
};


/* TESTING POST API */
describe("Line Item Comment API POST", () => {
    
    it("POST /api/v1/ticket-line-items/{ticketLineItemId}/line-item-comments - Create a Line Item Comment. ", async () => {

        await teardownSeedForLineItemCommentTest();
        await seedForLineItemCommentTest();

        /* Arrange */
        const _user = await UserSvc.getByEmail(userSeed[0].email); 
        const _ticketLineItems = await TicketLineItemSvc.getAll();
        const _ticketLineItem = _ticketLineItems[0];
        const expectedCommentResult = seedLineItemComment[0];

        /* Act */
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketLineItem.id}/line-item-comments`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                expectedCommentResult
            )
            .expect(200);

        const actualCommentResult = response.body as LineItemComment;

        /* Assert */
        expect(actualCommentResult.message).toEqual(expectedCommentResult.message);
    });
});

describe("Line Item Comment API PUT", () => {

    it("PUT /api/v1/ticket-line-items/{ticketLineItemId}/line-item-comments/:lineItemCommentId", async () => {

        await teardownSeedForLineItemCommentTest();
        await seedForLineItemCommentTest();

        /* Arrange */
        const _user = await UserSvc.getByEmail(userSeed[0].email); 
        const _ticketLineItems = await TicketLineItemSvc.getAll();
        const _ticketLineItem = _ticketLineItems[0];
        const commentToCreate = seedLineItemComment[0];
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketLineItem.id}/line-item-comments`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                commentToCreate
            )
            .expect(200);
        
        const _createdLineItemComment = response.body as LineItemComment;
        const commentToUpdate = {
            message: "UpDated C0mment"
        } as EditableFields_LineItemComment;

        /* Act */
        const _actualResponse = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketLineItem.id}/line-item-comments/${_createdLineItemComment.id}`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                commentToUpdate
            )
            .expect(200);

        const _actualLineItemComment = _actualResponse.body as LineItemComment;
        
        /* Assert */
        expect(_actualLineItemComment.id).toEqual(_createdLineItemComment.id);
        expect(_actualLineItemComment.message).toEqual(commentToUpdate.message);

    });
});

/* TESTING GET API */
describe("Line Item Comment API GET", () => {
    
    it("GET /api/v1/ticket-line-items/{ticketLineItemId}/line-item-comments - Retrieve all Line Item Comments by Ticket Line Item Id", async () => {

        await teardownSeedForLineItemCommentTest();
        await seedForLineItemCommentTest();

        /* Arrange */
        const _user = await UserSvc.getByEmail(userSeed[0].email); 
        const _ticketLineItems = await TicketLineItemSvc.getAll();
        const _ticketLineItem = _ticketLineItems[0];
        const commentToCreate = seedLineItemComment[0];
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketLineItem.id}/line-item-comments`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                commentToCreate
            )
            .expect(200);
        
        const _createdLineItemComment = response.body as LineItemComment;
        
        /* Act */
        const _actualResponse = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketLineItem.id}/line-item-comments`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .expect(200);

        const _actualLineItemComments = _actualResponse.body as LineItemComment[];

        expect(_actualLineItemComments[0].message).toEqual(_createdLineItemComment.message);
        expect(_actualLineItemComments[0].id).toEqual(_createdLineItemComment.id);

    });
});
