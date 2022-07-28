/**
 * File : ticket-line-item.test.ts
 * Testing the available routes that is inside /api/v1/ticket-line-items
 */
/* NODE MODULES */
import request from "supertest";

/* DB */
import {
    LineItemStatus, prisma, TicketLineItem 
} from "@prisma/client";

/* SERVICES */
import BuyerOrganisationSvc from "../../../../src/services/buyer-organisation";
import PermissionSvc from "../../../../src/services/permission";
import PermissionInUserRoleSvc from "../../../../src/services/permissions-in-user-roles";
import UserInUserRoleSvc from "../../../../src/services/user-in-user-role";
import UserRoleSvc from "../../../../src//services/user-role";
import UserSvc from "../../../../src/services/user";
import TicketLineItemSvc, {
    EditableFields_TicketLineItem, EditableFields_TicketLineItem_GeneralDetails, EditableFields_TicketLineItem_Owner 
} from "../../../../src/services/ticket-line-item";
import TicketBodySvc from "../../../../src/services/ticket-body";
import TicketLineItemInTicketBodySvc from "../../../../src/services/ticket-line-item-in-ticket-body";
import SellerItemSvc from "../../../../src/services/seller-item";
import SellerItemInTicketLineItemSvc from "../../../../src/services/seller-item-in-ticket-line-item";
import SellerOrganisationSvc from "../../../../src/services/seller-organisation";

/* CONFIG & UTILS */
import server, { setupHttpServer } from "../../../../src/http-server";

/* TEST DATA */
import { seedTicketBody } from "../../../../prisma/seedTicketBody";
import { seedBuyerOrganisation } from "../../../../prisma/seedBuyerOrganisation";
import { seedTicketLineItem } from "../../../../prisma/seedTicketLineItem";
import { userRoleSeed } from "../../../../prisma/seedUserRole";
import { userSeed } from "../../../../prisma/seedUser";
import { sellerItemSeed } from "../../../../prisma/seedSellerItem";


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

    //Initialize Server
    await setupHttpServer();
    await seedForTicketLineItemRouteTest();
});

afterAll(async() => {

    //Clear the DB
    await teardownSeedForTicketLineItemRoute();
});

const seedForTicketLineItemRouteTest = async (seedForAdmin = false) => {
    
    // Seed Users
    let _userOne = await UserSvc.getByEmail(userSeed[0].email);
    if (!_userOne) {
        _userOne = await UserSvc.create(userSeed[0].name, userSeed[0].email);
    }
    await UserSvc.create(userSeed[1].name, userSeed[1].email);

    // Seed Permissions
    await PermissionSvc.createAllPermissions();
    const _permission = await PermissionSvc.getByValue("lineItem:sourced");
    const _permission2 = await PermissionSvc.getByValue("lineItem:create");
    const _permission3 = await PermissionSvc.getByValue("lineItem:startSourcing");
    const _permission4 = await PermissionSvc.getByValue("lineItem:update");
    const _permission5 = await PermissionSvc.getByValue("lineItem:unableToSource");
    const _permission6 = await PermissionSvc.getByValue("lineItemDetails:update");
    const _permission7 = await PermissionSvc.getByValue("lineItemOwner:update");

    // Seed User Role
    const _userRole = await UserRoleSvc.create(
        userRoleSeed[0],
        _userOne.id
    );

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

    // Link Permissions to User Role 
    await PermissionInUserRoleSvc.updatePermissionsInUserRole(
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

const teardownSeedForTicketLineItemRoute = async () => {

    /* DELETE JOIN TABLES */
    await PermissionInUserRoleSvc.deleteAll();
    await UserInUserRoleSvc.deleteAll();
    await TicketLineItemInTicketBodySvc.deleteAll();
    await SellerItemInTicketLineItemSvc.deleteAll();
    
    /* DELETE OTHER TABLES */
    await PermissionSvc.deleteAll();
    await UserRoleSvc.deleteAll();
    await TicketLineItemSvc.deleteAll();
    await TicketBodySvc.deleteAll();
    await BuyerOrganisationSvc.deleteAll();
    await UserSvc.deleteAll();
};

/* TEST TICKET LINE ITEM */
describe("Ticket Line ITEM - Item", () => {

    it("POST /api/v1/ticket-bodies/{ticketBodyId}/ticket-line-item - Create Ticket Line Item without assigning an User", async () => {

        await teardownSeedForTicketLineItemRoute();
        await seedForTicketLineItemRouteTest();

        /* Arrange */
        const _expectedTicketLineItemData = seedTicketLineItem[0];
        const _ticketBodies = await TicketBodySvc.getAll();
        const { id: _ticketBodyId } = _ticketBodies[0];

        /* Act */
        const _response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketBodyId}/ticket-line-items`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                _expectedTicketLineItemData,
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _actualResult = _response.body as TicketLineItem;

        /* Assert */
        expect(_actualResult.sourcingRemarks).toEqual(_expectedTicketLineItemData.sourcingRemarks);
        expect(_actualResult.ticketLineItemOwnerId).toEqual(null);
        expect(_actualResult.sourcingStatus).toEqual(LineItemStatus.OPEN);
    });

    it("POST /api/v1/ticket-bodies/{ticketBodyId}/ticket-line-item - Create Ticket Line Item while assigning an User", async () => {

        await teardownSeedForTicketLineItemRoute();
        await seedForTicketLineItemRouteTest();

        /* Arrange */
        const _user = await UserSvc.getByEmail(userSeed[0].email);
        const _expectedTicketLineItemData = {
            ...seedTicketLineItem[0],
            ticketLineItemOwnerId: _user.id
        } as EditableFields_TicketLineItem;
        const _ticketBodies = await TicketBodySvc.getAll();
        const { id: _ticketBodyId } = _ticketBodies[0];

        /* Act */
        const _response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketBodyId}/ticket-line-items`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                _expectedTicketLineItemData,
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _actualResult = _response.body as TicketLineItem;

        /* Assert */
        expect(_actualResult.sourcingRemarks).toEqual(_expectedTicketLineItemData.sourcingRemarks);
        expect(_actualResult.ticketLineItemOwnerId).toEqual(_user.id);
        expect(_actualResult.sourcingStatus).toEqual(LineItemStatus.CLAIMED);
    });

    it("POST /api/v1/ticket-bodies/{ticketBodyId}/ticket-line-item/actions/status/unable-to-source - Create Ticket Line Item while assigning an User", async () => {

        await teardownSeedForTicketLineItemRoute();
        await seedForTicketLineItemRouteTest();

        /* Arrange */
        const _user = await UserSvc.getByEmail(userSeed[0].email);
        const _expectedTicketLineItemData = {
            ...seedTicketLineItem[0],
            ticketLineItemOwnerId: _user.id
        } as EditableFields_TicketLineItem;
        const _ticketBodies = await TicketBodySvc.getAll();
        const { id: _ticketBodyId } = _ticketBodies[0];
        const _response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketBodyId}/ticket-line-items`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                _expectedTicketLineItemData,
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _claimedTicketLineItem = _response.body as TicketLineItem;

        /* Act */
        const _unableToSourceResponse = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketBodyId}/ticket-line-items/actions/status/unable-to-source`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                {
                    id:             _claimedTicketLineItem.id,
                    resourceItemId: _claimedTicketLineItem.id,
                },
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _unableToSourceTicketLineItem = _unableToSourceResponse.body as TicketLineItem;

        /* Assert */
        expect(_unableToSourceTicketLineItem.sourcingRemarks).toEqual(_expectedTicketLineItemData.sourcingRemarks);
        expect(_unableToSourceTicketLineItem.ticketLineItemOwnerId).toEqual(_user.id);
        expect(_unableToSourceTicketLineItem.sourcingStatus).toEqual(LineItemStatus.UNABLE_TO_SOURCE);
    });

    it("POST /api/v1/ticket-bodies/{ticketBodyId}/ticket-line-item/actions/status/sourcing - Updates Ticket Status to sourcing", async () => {

        await teardownSeedForTicketLineItemRoute();
        await seedForTicketLineItemRouteTest();

        /* Arrange */
        const _user = await UserSvc.getByEmail(userSeed[0].email);
        const _expectedTicketLineItemData = {
            ...seedTicketLineItem[0],
            ticketLineItemOwnerId: _user.id
        } as EditableFields_TicketLineItem;
        const _ticketBodies = await TicketBodySvc.getAll();
        const { id: _ticketBodyId } = _ticketBodies[0];
        const _response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketBodyId}/ticket-line-items`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                _expectedTicketLineItemData,
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _createdTicketLineItem = _response.body as TicketLineItem;

        /* Act */
        const _actualResponse = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketBodyId}/ticket-line-items/actions/status/sourcing`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                {
                    id:             _createdTicketLineItem.id,
                    resourceItemId: _createdTicketLineItem.id,
                }
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _actualTicketLineItem = _actualResponse.body as TicketLineItem;
        

        /* Assert */
        expect(_actualTicketLineItem.sourcingRemarks).toEqual(_expectedTicketLineItemData.sourcingRemarks);
        expect(_actualTicketLineItem.ticketLineItemOwnerId).toEqual(_user.id);
        expect(_actualTicketLineItem.sourcingStatus).toEqual(LineItemStatus.SOURCING);
    });


    it("POST /api/v1/ticket-bodies/{ticketBodyId}/ticket-line-item/actions/status/complete - Updates Ticket Status to COMPLETE", async () => {

        await teardownSeedForTicketLineItemRoute();
        await seedForTicketLineItemRouteTest();

        /* Arrange */
        const _user = await UserSvc.getByEmail(userSeed[0].email);
        const _expectedTicketLineItemData = {
            ...seedTicketLineItem[0],
            ticketLineItemOwnerId: _user.id
        } as EditableFields_TicketLineItem;
        const _ticketBodies = await TicketBodySvc.getAll();
        const { id: _ticketBodyId } = _ticketBodies[0];
        const _response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketBodyId}/ticket-line-items`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                _expectedTicketLineItemData,
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _createdTicketLineItem = _response.body as TicketLineItem;
        const _sourcingResponse = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketBodyId}/ticket-line-items/actions/status/sourcing`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                {
                    id:             _createdTicketLineItem.id,
                    resourceItemId: _createdTicketLineItem.id,
                }
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _sourcingTicketLineItem = _sourcingResponse.body as TicketLineItem;

        // Link Seller Item to Ticket Line Item
        
        await SellerItemInTicketLineItemSvc.updateSellerItemsInTicketLineItem(
            [ sellerItemSeed[0].id ],
            _sourcingTicketLineItem.id,
            _user.id
        );

        /* Act */
        const _completedResponse = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketBodyId}/ticket-line-items/actions/status/sourced`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                {
                    id:             _createdTicketLineItem.id,
                    resourceItemId: _createdTicketLineItem.id,
                }
            )
            .expect(200)
            .expect("Content-Type", /json/);

        
        const _completedTicketLineItem = _completedResponse.body as TicketLineItem;

        /* Assert */
        expect(_completedTicketLineItem.sourcingRemarks).toEqual(_expectedTicketLineItemData.sourcingRemarks);
        expect(_completedTicketLineItem.ticketLineItemOwnerId).toEqual(_user.id);
        expect(_completedTicketLineItem.sourcingStatus).toEqual(LineItemStatus.SOURCED);
    });
});

describe("Ticket Body API PUT", () => {
    
    it("PUT /api/v1/ticket-bodies/{ticketBodyId}/ticket-line-item/:ticketLineItemId - Updates Ticket Line Item Owner and General Details", async () => {

        await teardownSeedForTicketLineItemRoute();
        await seedForTicketLineItemRouteTest();

        // Arrange
        const _user = await UserSvc.getByEmail(userSeed[0].email);
        const _userTwo = await UserSvc.getByEmail(userSeed[1].email);
        const createdTicketLineItemData = {
            ...seedTicketLineItem[0],
            ticketLineItemOwnerId: _user.id
        };
        const _ticketBodies = await TicketBodySvc.getAll();
        const { id: _ticketBodyId } = _ticketBodies[0];
        const _response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketBodyId}/ticket-line-items`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                createdTicketLineItemData,
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _createdTicketLineItem = _response.body as TicketLineItem;
        const updatedTicketLineItemData = {
            ...seedTicketLineItem[1],
            ticketLineItemOwnerId: _userTwo.id
        } as EditableFields_TicketLineItem;

        // Act
        const _actualResponse = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketBodyId}/ticket-line-items/${_createdTicketLineItem.id}`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                updatedTicketLineItemData
            )
            .send({
                resourceItemId: _createdTicketLineItem.id
            })
            .expect(200)
            .expect("Content-Type", /json/);

        const _actualTicketLineItem = _actualResponse.body as TicketLineItem;
        
        // Assert
        expect(_actualTicketLineItem.ticketLineItemOwnerId).toEqual(_userTwo.id);
        expect(_actualTicketLineItem.id).toEqual(_createdTicketLineItem.id);
        expect(_actualTicketLineItem.sourcingStatus).toEqual(LineItemStatus.CLAIMED);
    });

    it("PUT /api/v1/ticket-bodies/{ticketBodyId}/ticket-line-item/:ticketLineItemId/line-item-owner - Updates Ticket Line Item Owner only", async () => {

        await teardownSeedForTicketLineItemRoute();
        await seedForTicketLineItemRouteTest();

        // Arrange
        const _user = await UserSvc.getByEmail(userSeed[0].email);
        const _userTwo = await UserSvc.getByEmail(userSeed[1].email);
        const createdTicketLineItemData = {
            ...seedTicketLineItem[0],
            ticketLineItemOwnerId: _user.id
        };
        const _ticketBodies = await TicketBodySvc.getAll();
        const { id: _ticketBodyId } = _ticketBodies[0];
        const _response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketBodyId}/ticket-line-items`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                createdTicketLineItemData,
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _createdTicketLineItem = _response.body as TicketLineItem;
        const updatedTicketLineItemOwnerData = {
            ticketLineItemOwnerId: _userTwo.id
        } as EditableFields_TicketLineItem_Owner;

        // Act
        const _actualResponse = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketBodyId}/ticket-line-items/${_createdTicketLineItem.id}/line-item-owner`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                updatedTicketLineItemOwnerData
            )
            .send({
                resourceItemId: _createdTicketLineItem.id
            })
            .expect(200)
            .expect("Content-Type", /json/);

        const _actualTicketLineItem = _actualResponse.body as TicketLineItem;
        
        // Assert
        expect(_actualTicketLineItem.ticketLineItemOwnerId).toEqual(_userTwo.id);
        expect(_actualTicketLineItem.id).toEqual(_createdTicketLineItem.id);
        expect(_actualTicketLineItem.sourcingStatus).toEqual(LineItemStatus.CLAIMED);
    });

    it("PUT /api/v1/ticket-bodies/{ticketBodyId}/ticket-line-item/:ticketLineItemId/general-details - Updates Ticket Line Item General Details only", async () => {

        await teardownSeedForTicketLineItemRoute();
        await seedForTicketLineItemRouteTest();

        // Arrange
        const _user = await UserSvc.getByEmail(userSeed[0].email);
        const createdTicketLineItemData = {
            ...seedTicketLineItem[0],
            ticketLineItemOwnerId: _user.id
        };
        const _ticketBodies = await TicketBodySvc.getAll();
        const { id: _ticketBodyId } = _ticketBodies[0];
        const _response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketBodyId}/ticket-line-items`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                createdTicketLineItemData,
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _createdTicketLineItem = _response.body as TicketLineItem;
        const updatedTicketLineItemOwnerData = {
            ...seedTicketLineItem[1],
        }; 
        delete updatedTicketLineItemOwnerData["ticketLineItemOwnerId"];

        // Act
        const _actualResponse = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${_ticketBodyId}/ticket-line-items/${_createdTicketLineItem.id}/general-details`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                updatedTicketLineItemOwnerData
            )
            .send({
                resourceItemId: _createdTicketLineItem.id
            })
            .expect(200)
            .expect("Content-Type", /json/);

        const _actualTicketLineItem = _actualResponse.body as TicketLineItem;
        
        // Assert
        expect(_actualTicketLineItem.ticketLineItemOwnerId).toEqual(_user.id);
        expect(_actualTicketLineItem.id).toEqual(_createdTicketLineItem.id);
        expect(_actualTicketLineItem.sourcingStatus).toEqual(LineItemStatus.CLAIMED);
    });
});

// describe("TICKET LINE ITEM - GET", () => {
//     it("GET /api/v1/ticket-line-item/:ticketLineItemId - Get Ticket Line Item By Id", async () => {

//         /* Arrange */
//         const _expectedResult = seedTicketLineItem[0];

//         /* Act */
//         const _response = await request(server)
//             .get(RequestHeaders.BASE_API_ENDPOINT + "/ckwyr2dq6000108l0amea9nlt")
//             .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
//             .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
//             .expect(200)
//             .expect("Content-Type", /json/);

//         const _actualResult = _response.body;

//         /* Assert */
//         expect(_actualResult.sourcingItemName).toBe(_expectedResult.sourcingItemName);
//         expect(_actualResult.sourcingStatus).toBe(_expectedResult.sourcingStatus);
//         expect(_actualResult.sourcingQuantity).toBe(_expectedResult.sourcingQuantity);
//         expect(_actualResult.sourcingBudget.toString()).toStrictEqual(_expectedResult.sourcingBudget.toString());
//         expect(new Date(_actualResult.sourcingDeadline)).toStrictEqual(_expectedResult.sourcingDeadline);

//     });
// });