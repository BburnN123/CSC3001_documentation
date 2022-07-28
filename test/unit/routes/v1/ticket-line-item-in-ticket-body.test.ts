/**
 * File : ticket-line-item-in-ticket-body.test.ts
 * Testing the available routes that is inside /api/v1/ticket-line-item-in-ticket-body.ts
 */
/* NODE MODULES */
import request from "supertest";

/* DB */

/* SERVICES */
import TicketLineItemInTicketBodySvc from "../../../../src/services/ticket-line-item-in-ticket-body";
import TicketLineItemSvc from "../../../../src/services/ticket-line-item";
import TicketBodySvc from "../../../../src/services/ticket-body";
import UserSvc from "../../../../src/services/user";

/* CONFIG & UTILS */
import server, { setupHttpServer } from "../../../../src/http-server";

/* TEST DATA */
import { seedTicketLineItem } from "../../../../prisma/seedTicketLineItem";
import { seedTicketBody } from "../../../../prisma/seedTicketBody";
import { seedBuyerOrganisation } from "../../../../prisma/seedBuyerOrganisation";
import { seedTicketLineItem } from "../../../../prisma/seedTicketLineItem";
import { userSeed } from "../../../../prisma/seedUser";

/* SETUP GLOBAL TEST VARIABLES */

const baseApiEndpoint = "/api/v1/ticket-line-items-in-ticket-bodies";

const RequestHeaders =  {
    BASE_API_ENDPOINT:  baseApiEndpoint,
    CSRF_TOKEN_FIELD:   "x-eezee-csrf",
    CSRF_TOKEN_VALUE:   "EEZEE",
    CONTENT_TYPE_FIELD: "Content-Type",
    CONTENT_TYPE_VALUE: "application/json"
};

beforeAll(async() => {

    await seedForTicketLineItemsInTicketBodyRouteTest();

    //Initialize Server
    await setupHttpServer();
});

afterAll(async() => {

    // Disconnect the prisma
    await teardownSeedForTicketLineItemsInTicketBodyRouteTest();
});

const seedForTicketLineItemsInTicketBodyRouteTest = async () => {

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
    const _ticketBody = await TicketBodySvc.create(
        _buyerOrganisation.id,
        seedTicketBody[2],
        _userOne.id
    );

    // Seed Ticket Line Item
    const _ticketLineItem = await TicketLineItemSvc.create(
        seedTicketLineItem[0],
        _userOne.id
    );
    
};

const teardownSeedForTicketLineItemsInTicketBodyRouteTest = async () => {
    
    await TicketLineItemInTicketBodySvc.deleteAll();
    await TicketLineItemSvc.deleteAll();
    await TicketBodySvc.deleteAll();
    await UserSvc.deleteAll();
};

describe("Ticket Line Item in Ticket Body API POST", () => {
    

    it("POST /api/v1/ticket-line-items-in-ticket-bodies/actions/update - Link a ticket line item to a ticket body", async () => {

        await teardownSeedForTicketLineItemsInTicketBodyRouteTest();
        await seedForTicketLineItemsInTicketBodyRouteTest();

        // Arrange
        const _user = await UserSvc.getByEmail(userSeed[0].email);
        const _ticketLineItems = await TicketLineItemSvc.getAll();
        const _ticketLineItem = _ticketLineItems[0];
        const _ticketBodies = await TicketBodySvc.getAll();
        const _ticketBody = _ticketBodies[0];

        // Act
        await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/actions/update`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                _expectedResult
            )
            .query(_expectedBuyerOrganisationQuery)
            .expect(200)
            .expect("Content-Type", /json/);
    });
});