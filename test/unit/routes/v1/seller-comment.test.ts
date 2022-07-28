/**
 * File : seller-comment.test.ts
 * Testing the available routes that is inside routes/seller-comment.ts
 */

/* NODE MODULES */
import request from "supertest";

/* DB */

/* SERVICES */
import SellerOrganisationSvc from "../../../../src/services/seller-organisation";
import SellerCommentSvc from "../../../../src/services/seller-comment";

/* CONFIG & UTILS */
import server, {
    setupHttpServer
} from "../../../../src/http-server";

/* TEST DATA */
import {
    testSellerOrganisationBasicInformation1
} from "../../seller-testdata";
import {
    sellerCommentSeed
} from "../../../../prisma/seedComment";
import {
    SellerComment
} from "@prisma/client";


/* SETUP GLOBAL TEST VARIABLES */
const baseApiEndpoint = "/api/v1/seller-organisations";

const RequestHeaders = {
    BASE_API_ENDPOINT:  baseApiEndpoint,
    CSRF_TOKEN_FIELD:   "x-eezee-csrf",
    CSRF_TOKEN_VALUE:   "EEZEE",
    CONTENT_TYPE_FIELD: "Content-Type",
    CONTENT_TYPE_VALUE: "application/json"
};

const userId = "ckvj9b12m0000hutgkrcel8s3";

beforeAll(async () => {

    await SellerOrganisationSvc.create(
        testSellerOrganisationBasicInformation1,
        userId,
        userId
    );

    // Initialize Server
    await setupHttpServer();
});

afterAll(async () => {

    // Clear the DB
    const listOfSellerOrganisationId = [
        testSellerOrganisationBasicInformation1.id,
    ];

    await SellerCommentSvc.deleteBySellerOrganisationId(
        testSellerOrganisationBasicInformation1.id
    );

    await SellerOrganisationSvc.deleteByListOfId(
        listOfSellerOrganisationId,
        userId
    );
});

/* TEST POST API */
describe("Seller Comment API POST", () => {


    it("POST /api/v1/seller-organisations/{id}/seller-comments - Create a Seller Comment", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const commentBody = {
            message: sellerCommentSeed[0].message
        };

        // Act
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-comments`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(commentBody)
            .expect(200);

        // Assert
        const {
            message: actualMessage
        } = response.body as SellerComment;

        expect(actualMessage).toBe(sellerCommentSeed[0].message);


    });
});

/* TEST PUT API */
describe("Seller Comment API PUT", () => {

    it("PUT /api/v1/seller-organisations/{id}/seller-comments/:id - Update a Seller Comment", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const commentBody = {
            message: "Testing a Message"
        };

        // Act
        const _sellerCommentTestData = await SellerCommentSvc.getBySellerOrganisationId(
            sellerOrganisationId
        );

        const response = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-comments/${_sellerCommentTestData[0].id}`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(commentBody)
            .expect(200);

        // Assert
        const {
            message: actualMessage
        } = response.body as SellerComment;

        expect(actualMessage).toBe("Testing a Message");
    });

    it("PUT /api/v1/seller-organisations/{id}/seller-comments/:id - Empty Message", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const commentBody = {
            message: "    "
        };

        // Act
        const _sellerCommentTestData = await SellerCommentSvc.getBySellerOrganisationId(
            sellerOrganisationId
        );

        const response = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-comments/${_sellerCommentTestData[0].id}`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(commentBody)
            .expect(200);

        // Assert
        const actualSellerComment = response.body as SellerComment;
        expect(actualSellerComment).toBeNull();
    });
});

/* TEST GET API */
describe("Seller Comment API GET", () => {

    it("GET /api/v1/seller-organisations/{id}/seller-comments - Get a Seller Comment", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;

        // Assert
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-comments`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .expect(200);

        // Act
        const sellerComment = response.body as SellerComment[];
        expect(sellerComment.length).toBe(1);
    });
});