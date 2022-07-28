/**
 * File : ticket-body.test.ts
 * Testing the available routes that is inside routes/v1/ticket-body-comment.ts
 */
/* NODE MODULES */
import request from "supertest";

/* DB */
import {  TicketBodyComment } from "@prisma/client";

/* SERVICES */
import BuyerOrganisationSvc from "../../../../src/services/buyer-organisation";
import TicketBodySvc from "../../../../src/services/ticket-body";
import TicketBodyCommentSvc from "../../../../src/services/ticket-body-comment";
import UserSvc from "../../../../src/services/user";

/* CONFIG & UTILS */
import server, { setupHttpServer } from "../../../../src/http-server";

/* TEST DATA */
import { seedBuyerOrganisation } from "../../../../prisma/seedBuyerOrganisation";
import { seedTicketBody } from "../../../../prisma/seedTicketBody";
import { seedTicketBodyComment } from "../../../../prisma/seedTicketBodyComment";
import { userSeed } from "../../../../prisma/seedUser";


/* SETUP GLOBAL TEST VARIABLES */

const baseApiEndpoint = "/api/v1/ticket-bodies";

// /ticket-bodies/:ticketBodyId/ticket-body-comments

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
    await seedForTicketBodyCommentRouteTest();
});

afterAll(async() => {

    //Clear the DB
    await teardownSeedForTicketBodyComment();
    
});

const seedForTicketBodyCommentRouteTest = async () => {
    
    // Seed Users
    let _userOne = await UserSvc.getByEmail(userSeed[0].email);
    if (!_userOne) {
        _userOne = await UserSvc.create(userSeed[0].name, userSeed[0].email);
    }

    // Seed Buyer Organisation
    const _buyerOrganisation = await BuyerOrganisationSvc.create(
        seedBuyerOrganisation[0],
        _userOne.id
    );

    // Seed Ticket Body with test data index 2
    await TicketBodySvc.create(
        _buyerOrganisation.id,
        seedTicketBody[2],
        _userOne.id
    );
};

const teardownSeedForTicketBodyComment = async () => {

    await TicketBodyCommentSvc.deleteAll();
    await TicketBodySvc.deleteAll();
    await BuyerOrganisationSvc.deleteAll();
    await UserSvc.deleteAll();
    
};

/* TEST BODY COMMENT */
describe("Ticket Body Comment - POST", () => {

    it("POST /api/v1/ticket-bodies/:ticketBodyId/ticket-body-comments - Create Ticket Body Comment", async() => {
        
        await teardownSeedForTicketBodyComment();
        await seedForTicketBodyCommentRouteTest();

        /* Arrange */
        const _expectedTicketBodyComment = seedTicketBodyComment[0];
        const _ticketBodies = await TicketBodySvc.getAll();
        const _expectedTicketBody = _ticketBodies[0];

        /* Act*/
        const _response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${_expectedTicketBody.id}/ticket-body-comments`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                _expectedTicketBodyComment,
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _actualResult = _response.body;

        /* Assert */
        expect(_actualResult.message).toBe(_expectedTicketBodyComment.message);
        expect(_actualResult.ticketBodyId).toBe(_expectedTicketBody.id);
    });

});

describe("Ticket Body Comment - PUT", () => {
    

    it("PUT /api/v1/ticket-bodies/{ticketBodyId}/ticket-body-comments/:id - Update a Ticket Body Comment", async () => {

        await teardownSeedForTicketBodyComment();
        await seedForTicketBodyCommentRouteTest();

        /* Arrange */
        const _ticketBodies = await TicketBodySvc.getAll();
        const { id: ticketBodyId } = _ticketBodies[0];
        const testTicketBodyComment = seedTicketBodyComment[0];
        const _response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${ticketBodyId}/ticket-body-comments`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                testTicketBodyComment,
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _expectedTicketBodyComment = _response.body as TicketBodyComment;

        /* Act */
        const _actualResponse = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${ticketBodyId}/ticket-body-comments/${_expectedTicketBodyComment.id}`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                testTicketBodyComment,
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _actualTicketBodyComment = _actualResponse.body as TicketBodyComment;

        /* Assert */
        expect(_actualTicketBodyComment.id).toEqual(_expectedTicketBodyComment.id);
        

    });
});

describe("TICKET BODY COMMENT - GET", () => {
    it("GET /api/v1/ticket-bodies/{ticketBodyId}/ticket-body-comments/ - Get All Ticket Body Comments for a Ticket Body", async() => {
        
        await teardownSeedForTicketBodyComment();
        await seedForTicketBodyCommentRouteTest();

        /* Arrange */
        const _ticketBodies = await TicketBodySvc.getAll();
        const { id: ticketBodyId } = _ticketBodies[0];
        const testTicketBodyComment = seedTicketBodyComment[0];
        const _response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${ticketBodyId}/ticket-body-comments`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                testTicketBodyComment,
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _expectedTicketBodyComment = _response.body as TicketBodyComment;

        /* Act*/
        const _actualResponse = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/${ticketBodyId}/ticket-body-comments`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .expect(200)
            .expect("Content-Type", /json/);

        const _actualTicketBodyComments = _actualResponse.body as TicketBodyComment[];
        const _actualTicketBodyComment = _actualTicketBodyComments[0];

        /* Assert */
        expect(_actualTicketBodyComment.id).toEqual(_expectedTicketBodyComment.id);
        expect(_actualTicketBodyComment.message).toEqual(_expectedTicketBodyComment.message);

    });
});