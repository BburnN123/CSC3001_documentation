/**
 * File : ticket-body.test.ts
 * Testing the available routes that is inside /api/v1/ticket-bodies
 */
/* NODE MODULES */
import request from "supertest";
import { now } from "moment";

/* DB */
import {
    Priority, 
    TicketBody, 
    TicketStatus 
} from "@prisma/client";

/* SERVICES */
import BuyerOrganisationSvc from "../../../../src/services/buyer-organisation";
import PermissionSvc from "../../../../src/services/permission";
import PermissionInUserRoleSvc from "../../../../src/services/permissions-in-user-roles";
import TicketBodySvc, {
    EditableFields_TicketBody, EditableFields_TicketBody_GeneralDetails, EditableFields_TicketBody_Owner 
} from "../../../../src/services/ticket-body";
import TicketLineItemSvc from "../../../../src/services/ticket-line-item";
import UserInUserRoleSvc from "../../../../src/services/user-in-user-role";
import UserRoleSvc from "../../../../src//services/user-role";
import UserSvc from "../../../../src/services/user";

/* CONFIG & UTILS */
import server, { setupHttpServer } from "../../../../src/http-server";

/* TEST DATA */
import { sellerItemSeed } from "../../../../prisma/seedSellerItem";
import { seedTicketLineItem } from "../../../../prisma/seedTicketLineItem";
import { seedTicketBody } from "../../../../prisma/seedTicketBody";
import { seedBuyerOrganisation } from "../../../../prisma/seedBuyerOrganisation";
import { userRoleSeed } from "../../../../prisma/seedUserRole";
import { userSeed } from "../../../../prisma/seedUser";
import TicketLineItemInTicketBodySvc from "../../../../src/services/ticket-line-item-in-ticket-body";
import SellerItemInTicketLineItemSvc from "../../../../src/services/seller-item-in-ticket-line-item";

/* SETUP GLOBAL TEST VARIABLES */

const baseApiEndpoint = "/api/v1/ticket-bodies";

const RequestHeaders =  {
    BASE_API_ENDPOINT:  baseApiEndpoint,
    CSRF_TOKEN_FIELD:   "x-eezee-csrf",
    CSRF_TOKEN_VALUE:   "EEZEE",
    CONTENT_TYPE_FIELD: "Content-Type",
    CONTENT_TYPE_VALUE: "application/json"
};

beforeAll(async() => {

    await seedForTicketBodyRouteTest();

    //Initialize Server
    await setupHttpServer();
});

afterAll(async() => {

    // Disconnect the prisma
    await teardownSeedForTicketBody();
});

const seedForTicketBodyRouteTest = async (seedForAdmin = false) => {

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
        _userOne.id,
        _ticketBody.id
    );

    // Seed Permissions
    await PermissionSvc.createAllPermissions();
    const _permission = await PermissionSvc.getByValue("ticket:complete");
    const _permission2 = await PermissionSvc.getByValue("ticket:create");
    const _permission3 = await PermissionSvc.getByValue("ticket:startSourcing");
    const _permission4 = await PermissionSvc.getByValue("ticket:update");
    const _permission5 = await PermissionSvc.getByValue("ticket:void");
    const _permission6 = await PermissionSvc.getByValue("ticketOwner:update");
    const _permission7 = await PermissionSvc.getByValue("ticketDetails:update");
    
    // Seed User Role
    const _userRole = await UserRoleSvc.create(
        userRoleSeed[0],
        _userOne.id
    );

    // Link Permissions to User Role 
    await PermissionInUserRoleSvc.update(
        [ _permission.id, _permission2.id, _permission3.id, _permission4.id, _permission5.id, _permission6.id, _permission7.id ],
        _userRole.id,
        _userOne.id
    );
    
    // Link User Role to User
    await UserInUserRoleSvc.updateUserRolesInUser(
        [ _userRole.id ],
        _userOne.id,
        _userOne.id
    );

    if (seedForAdmin) {
        const _adminPermission = await PermissionSvc.getByValue("ticketing:admin");
        const _adminUserRole = await UserRoleSvc.create(
            userRoleSeed[1],
            _userOne.id
        );
        await PermissionInUserRoleSvc.update(
            [ _adminPermission.id ],
            _adminUserRole.id,
            _userOne.id
        );
        await UserInUserRoleSvc.updateUserRolesInUser(
            [ _adminUserRole.id ],
            _userOne.id,
            _userOne.id,
        );
    }

};

const teardownSeedForTicketBody = async () => {

    //Clean Up Database
    /* DELETE JOIN TABLES */
    await PermissionInUserRoleSvc.deleteAll();
    await UserInUserRoleSvc.deleteAll();
    await TicketLineItemInTicketBodySvc.deleteAll();

    /* DELETE OTHER TABLES */
    await SellerItemInTicketLineItemSvc.deleteAll();
    await PermissionSvc.deleteAll();
    await UserRoleSvc.deleteAll();
    await UserSvc.deleteAll();
    await TicketLineItemSvc.deleteAll();
    await TicketBodySvc.deleteAll();
    await BuyerOrganisationSvc.deleteAll();
};

/* TEST POST REQUEST */
describe("Ticket Body API POST", () => {

    it("POST /api/v1/ticket-bodies - Create Ticket Body without assigning an User", async () => {

        await teardownSeedForTicketBody();
        await seedForTicketBodyRouteTest();

        /* Arrange */
        const _expectedResult = seedTicketBody[0];
        const _buyerOrganisations = await BuyerOrganisationSvc.getAll();
        const _expectedBuyerOrganisation = _buyerOrganisations[0];
        const _expectedBuyerOrganisationQuery = { buyerOrganisationId: _expectedBuyerOrganisation.id };

        /* Act */
        const _response = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                _expectedResult,
            )
            .query(_expectedBuyerOrganisationQuery)
            .expect(200)
            .expect("Content-Type", /json/);


        const _actualTicketBody = _response.body as TicketBody;

        /* Assert */
        expect(_actualTicketBody.title).toEqual(_expectedResult.title);
        expect(_actualTicketBody.ticketOwnerId).toEqual(null);
        expect(_actualTicketBody.status).toEqual(TicketStatus.OPEN);

    });

    it("POST /api/v1/ticket-bodies - Create Ticket Body while assigning an User", async() => {
        
        await teardownSeedForTicketBody();
        await seedForTicketBodyRouteTest();

        /* Arrange */
        const _user = await UserSvc.getByEmail(userSeed[0].email);
        const _expectedResult = {
            ...seedTicketBody[0],
            ticketOwnerId: _user.id
        };
        const _buyerOrganisations = await BuyerOrganisationSvc.getAll();
        const _expectedBuyerOrganisation = _buyerOrganisations[0];
        const _expectedBuyerOrganisationQuery = { buyerOrganisationId: _expectedBuyerOrganisation.id };

        /* Act */
        const _response = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                _expectedResult
            )
            .query(_expectedBuyerOrganisationQuery)
            .expect(200)
            .expect("Content-Type", /json/);


        const _actualTicketBody = _response.body as TicketBody;
        
        /* Assert */
        expect(_actualTicketBody.title).toEqual(_expectedResult.title);
        expect(_actualTicketBody.ticketOwnerId).toEqual(_user.id);
        expect(_actualTicketBody.status).toEqual(TicketStatus.CLAIMED);
    });
});

describe("Ticket Body API PUT", () => {

    it("PUT /api/v1/ticket-bodies/:ticketBodyId - Updates Ticket Body Owner", async () => {

        await teardownSeedForTicketBody();
        await seedForTicketBodyRouteTest();

        // Arrange
        const _user = await UserSvc.getByEmail(userSeed[0].email);
        const expectedTicketBodyData = seedTicketBody[0] as EditableFields_TicketBody;
        const _buyerOrganisations = await BuyerOrganisationSvc.getAll();
        const _expectedBuyerOrganisation = _buyerOrganisations[0];
        const _expectedBuyerOrganisationQuery = { buyerOrganisationId: _expectedBuyerOrganisation.id };
        const _expectedTicketBodyReq = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                expectedTicketBodyData,
            )
            .query(_expectedBuyerOrganisationQuery)
            .expect(200)
            .expect("Content-Type", /json/);
        const _expectedTicketBody = _expectedTicketBodyReq.body as TicketBody;

        const expectedUpdatedTicketBody = {
            ...expectedTicketBodyData,
            ticketOwnerId: _user.id
        } as EditableFields_TicketBody;

        // Act
        const _actualTicketBodyReq = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${_expectedTicketBody.id}`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                expectedUpdatedTicketBody
            )
            .send({
                resourceItemId: _expectedTicketBody.id
            })
            .expect(200)
            .expect("Content-Type", /json/);
        
        const _actualTicketBody = _actualTicketBodyReq.body as TicketBody;


        // Assert
        expect(_expectedTicketBody.ticketOwnerId).toEqual(null);
        expect(_actualTicketBody.ticketOwnerId).toEqual(_user.id);
        expect(_actualTicketBody.status).toEqual(TicketStatus.CLAIMED);
    });

    it("PUT /api/v1/ticket-bodies/:ticketBodyId/ticket-owner - Updates Ticket Body Owner ", async () => {

        await teardownSeedForTicketBody();
        await seedForTicketBodyRouteTest();

        // Arrange
        const _user = await UserSvc.getByEmail(userSeed[0].email);
        const _buyerOrganisations = await BuyerOrganisationSvc.getAll();
        const _expectedBuyerOrganisation = _buyerOrganisations[0];
        const expectedUpdatedTicketBodyData = {
            ticketOwnerId: _user.id
        } as EditableFields_TicketBody_Owner;
        const _expectedBuyerOrganisationQuery = { buyerOrganisationId: _expectedBuyerOrganisation.id };
        const _expectedTicketBodyReq = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                seedTicketBody[0],
            )
            .query(_expectedBuyerOrganisationQuery)
            .expect(200)
            .expect("Content-Type", /json/);
        const _expectedTicketBody = _expectedTicketBodyReq.body as TicketBody;

        // Act
        const _actualTicketBodyReq = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${_expectedTicketBody.id}/ticket-owner`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                {
                    ...expectedUpdatedTicketBodyData,
                    resourceItemId: _expectedTicketBody.id
                } 
            )
            .expect(200)
            .expect("Content-Type", /json/);
        
        const _actualTicketBody = _actualTicketBodyReq.body as TicketBody;


        // Assert
        expect(_expectedTicketBody.ticketOwnerId).toEqual(null);
        expect(_actualTicketBody.ticketOwnerId).toEqual(_user.id);
        expect(_actualTicketBody.status).toEqual(TicketStatus.CLAIMED);
    });

    it("PUT /api/v1/ticket-bodies/:ticketBodyId/general-details - Updates Ticket General Details for a Ticket with no Owner ", async () => {

        await teardownSeedForTicketBody();
        await seedForTicketBodyRouteTest(true);

        // Arrange
        const _user = await UserSvc.getByEmail(userSeed[0].email);
        const _buyerOrganisations = await BuyerOrganisationSvc.getAll();
        const _expectedBuyerOrganisation = _buyerOrganisations[0];
        const _expectedBuyerOrganisationQuery = { buyerOrganisationId: _expectedBuyerOrganisation.id };
        const _expectedTicketBodyReq = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                seedTicketBody[0],
            )
            .query(_expectedBuyerOrganisationQuery)
            .expect(200)
            .expect("Content-Type", /json/);

        const _expectedTicketBody = _expectedTicketBodyReq.body as TicketBody;
        const expectedUpdatedTicketGeneralDetails = {
            deadline:   new Date(now()),
            priority:   Priority.NORMAL,
            title:      "New route title for ticket body",
            voidRemark: null
        } as EditableFields_TicketBody_GeneralDetails;

        // Act
        const _actualTicketBodyReq = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${_expectedTicketBody.id}/general-details`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                expectedUpdatedTicketGeneralDetails
            )
            .expect(200)
            .expect("Content-Type", /json/);
        
        const _actualTicketBody = _actualTicketBodyReq.body as TicketBody;


        // Assert
        expect(_expectedTicketBody.ticketOwnerId).toEqual(null);
        expect(_actualTicketBody.ticketOwnerId).toEqual(null);
        expect(_actualTicketBody.status).toEqual(TicketStatus.OPEN);
    });

    it("PUT /api/v1/ticket-bodies/:ticketBodyId/general-details - Updates Ticket General Details for a Ticket with an Owner ", async () => {

        await teardownSeedForTicketBody();
        await seedForTicketBodyRouteTest(true);

        // Arrange
        const _user = await UserSvc.getByEmail(userSeed[0].email);
        const _buyerOrganisations = await BuyerOrganisationSvc.getAll();
        const _expectedBuyerOrganisation = _buyerOrganisations[0];
        const _expectedBuyerOrganisationQuery = { buyerOrganisationId: _expectedBuyerOrganisation.id };
        const _expectedTicketBodyReq = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                {
                    ...seedTicketBody[0],
                    ticketOwnerId: _user.id
                },
            )
            .query(_expectedBuyerOrganisationQuery)
            .expect(200)
            .expect("Content-Type", /json/);
        
        const _expectedTicketBody = _expectedTicketBodyReq.body as TicketBody;
        const expectedUpdatedTicketGeneralDetails = {
            deadline:   new Date(now()),
            priority:   Priority.NORMAL,
            title:      "New route title for ticket body",
            voidRemark: null
        } as EditableFields_TicketBody_GeneralDetails;

        // Act
        const _actualTicketBodyReq = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${_expectedTicketBody.id}/general-details`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                expectedUpdatedTicketGeneralDetails
            )
            .expect(200)
            .expect("Content-Type", /json/);
        
        const _actualTicketBody = _actualTicketBodyReq.body as TicketBody;


        // Assert
        expect(_actualTicketBody.ticketOwnerId).toEqual(_user.id);
        expect(_actualTicketBody.status).toEqual(TicketStatus.CLAIMED);
    });

    it("PUT /api/v1/ticket-bodies/:ticketBodyId - Updates Ticket General Details and Owner ", async () => {

        await teardownSeedForTicketBody();
        await seedForTicketBodyRouteTest();

        // Arrange
        const _user = await UserSvc.getByEmail(userSeed[0].email);
        const _buyerOrganisations = await BuyerOrganisationSvc.getAll();
        const _expectedBuyerOrganisation = _buyerOrganisations[0];
        const _expectedBuyerOrganisationQuery = { buyerOrganisationId: _expectedBuyerOrganisation.id };
        const _expectedTicketBodyReq = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                seedTicketBody[0],
            )
            .query(_expectedBuyerOrganisationQuery)
            .expect(200)
            .expect("Content-Type", /json/);
        const _expectedTicketBody = _expectedTicketBodyReq.body as TicketBody;
        const expectedUpdatedTicketBody = {
            ...seedTicketBody[0],
            ticketOwnerId: _user.id,
            title:         `some random title for ticket body ${Math.random()}`
        } as EditableFields_TicketBody;

        // Act
        const _actualTicketBodyReq = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${_expectedTicketBody.id}`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                {
                    ...expectedUpdatedTicketBody,
                    resourceItemId: _expectedTicketBody.id
                } 
            )
            .query(_expectedBuyerOrganisationQuery)
            .expect(200)
            .expect("Content-Type", /json/);
        
        const _actualTicketBody = _actualTicketBodyReq.body as TicketBody;


        // Assert
        expect(_actualTicketBody.ticketOwnerId).toEqual(_user.id);
        expect(_actualTicketBody.title).toEqual(expectedUpdatedTicketBody.title);
        expect(_actualTicketBody.status).toEqual(TicketStatus.CLAIMED);
    });

    
});

describe("Ticket Body API POST", () => {

    it("POST /api/v1/ticket-bodies/actions/status/sourcing - Updates Ticket Status to SOURCING ", async () => {

        await teardownSeedForTicketBody();
        await seedForTicketBodyRouteTest();

        // Arrange
        const _user = await UserSvc.getByEmail(userSeed[0].email);
        const _buyerOrganisations = await BuyerOrganisationSvc.getAll();
        const _expectedBuyerOrganisation = _buyerOrganisations[0];
        const _expectedBuyerOrganisationQuery = { buyerOrganisationId: _expectedBuyerOrganisation.id };

        // Act
        const _expectedTicketBodyReq = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                {
                    ...seedTicketBody[0],
                    ticketOwnerId: _user.id
                }
            )
            .query(_expectedBuyerOrganisationQuery)
            .expect(200)
            .expect("Content-Type", /json/);
        const _expectedTicketBody = _expectedTicketBodyReq.body as TicketBody;           

        const _actualTicketBodyReq = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/actions/status/sourcing`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send({
                id:             _expectedTicketBody.id,
                resourceItemId: _expectedTicketBody.id,
            })
            .expect(200)
            .expect("Content-Type", /json/);
        
        const _actualTicketBody = _actualTicketBodyReq.body as TicketBody;

        // Assert
        expect(_actualTicketBody.ticketOwnerId).toEqual(_user.id);
        expect(_actualTicketBody.id).toEqual(_expectedTicketBody.id);
        expect(_actualTicketBody.status).toEqual(TicketStatus.SOURCING);
    });

    it("POST /api/v1/ticket-bodies/actions/status/complete - Updates Ticket Status to COMPLETED ", async () => {

        await teardownSeedForTicketBody();
        await seedForTicketBodyRouteTest();

        // Arrange
        const _user = await UserSvc.getByEmail(userSeed[0].email);
        const _buyerOrganisations = await BuyerOrganisationSvc.getAll();
        const _expectedBuyerOrganisation = _buyerOrganisations[0];
        const _expectedBuyerOrganisationQuery = { buyerOrganisationId: _expectedBuyerOrganisation.id };
        const _expectedTicketBodyReq = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                {
                    ...seedTicketBody[0],
                    ticketOwnerId: _user.id
                }
            )
            .query(_expectedBuyerOrganisationQuery)
            .expect(200)
            .expect("Content-Type", /json/);
        const _expectedTicketBody = _expectedTicketBodyReq.body as TicketBody; 
        
        // Link Seller Item to Ticket Line Item
        const _ticketLineItems = await TicketLineItemSvc.getAll();
        const _ticketLineItem = _ticketLineItems[0];
        await SellerItemInTicketLineItemSvc.updateSellerItemsInTicketLineItem(
            [ sellerItemSeed[0].id ],
            _ticketLineItem.id,
            _user.id
        );
        await TicketLineItemSvc.startSourcingTicketLineItem(
            _ticketLineItem.id,
            _user.id
        );
        await TicketLineItemSvc.completeTicketLineItem(
            _ticketLineItem.id,
            _user.id
        );

        // Link Ticket Line Item to Ticket Body
        await TicketLineItemInTicketBodySvc.updateTicketLineItemsInTicketBody(
            [ _ticketLineItem.id, ],
            _expectedTicketBody.id,
            _user.id
        );

        await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/actions/status/sourcing`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send({
                id:             _expectedTicketBody.id,
                resourceItemId: _expectedTicketBody.id,
            })
            .expect(200)
            .expect("Content-Type", /json/);

        const _actualTicketBodyReq = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/actions/status/complete`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send({
                id:             _expectedTicketBody.id,
                resourceItemId: _expectedTicketBody.id,
            })
            .expect(200)
            .expect("Content-Type", /json/);
        
        const _actualTicketBody = _actualTicketBodyReq.body as TicketBody;

        // Assert
        expect(_actualTicketBody.ticketOwnerId).toEqual(_user.id);
        expect(_actualTicketBody.id).toEqual(_expectedTicketBody.id);
        expect(_actualTicketBody.status).toEqual(TicketStatus.COMPLETED);
    });

});