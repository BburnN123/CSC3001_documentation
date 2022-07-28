/**
 * File : seller-branch-location.test.ts
 * Testing the available routes that is inside routes/seller-branch-location.ts
 */
/* NODE MODULES */
import request from "supertest";

/* DB */
import {
    SellerBranchLocation,
    Status
} from "@prisma/client";

/* SERVICES */
import SellerOrganisationSvc from "../../../../src/services/seller-organisation";
import SellerBranchLocationSvc, {
    EditableFields_SellerBranchLocation
} from "../../../../src/services/seller-branch-location";

/* CONFIG & UTILS */
import server, {
    setupHttpServer
} from "../../../../src/http-server";

/* TYPES */

/* TEST DATA */
import {
    testSellerBranchLocation1,
    testSellerBranchLocation2,
    testSellerOrganisationBasicInformation1,
    testSellerOrganisationBasicInformation2
} from "../../seller-testdata";

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

    await SellerOrganisationSvc.create(
        testSellerOrganisationBasicInformation2,
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
        testSellerOrganisationBasicInformation2.id
    ];

    await SellerOrganisationSvc.deleteByListOfId(
        listOfSellerOrganisationId
    );
});

/* TEST POST API */
describe("Seller Branch Location API POST", () => {

    it("POST /api/v1/seller-organisations/{id}/seller-branch-locations - Create a Seller Branch Location", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const sellerBranchLocationData = testSellerBranchLocation1;

        // Act
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-branch-locations`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(sellerBranchLocationData)
            .expect(200);

        // Assert
        const {
            branchName: actualBranchName,
            branchAddress: actualBranchAddress
        } = response.body as SellerBranchLocation;

        expect(actualBranchName).toEqual(sellerBranchLocationData.branchName);
        expect(actualBranchAddress).toEqual(sellerBranchLocationData.branchAddress);
    });

    it("POST /api/v1/seller-organisations/{id}/seller-branch-locations/status/delete - Set to Deleted", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const sellerBranchLocationDataId = testSellerBranchLocation1.id;

        // Act
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-branch-locations/status/delete`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send({
                id: sellerBranchLocationDataId
            })
            .expect(200);

        // Assert
        const {
            status: actualStatus,
        } = response.body as SellerBranchLocation;
        expect(actualStatus).toEqual(Status.DELETED);
    });

    it("POST /api/v1/seller-organisations/{id}/seller-branch-locations/status/active - Set to Deleted", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const sellerBranchLocationDataId = testSellerBranchLocation1.id;

        // Act
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-branch-locations/status/active`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send({
                id: sellerBranchLocationDataId
            })
            .expect(200);

        // Assert
        const {
            status: actualStatus,
        } = response.body as SellerBranchLocation;
        expect(actualStatus).toEqual(Status.ACTIVE);
    });

    it("POST /api/v1/seller-organisations/{id}/seller-branch-locations/status/inactive - Set to Deleted", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const sellerBranchLocationDataId = testSellerBranchLocation1.id;

        // Act
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-branch-locations/status/inactive`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send({
                id: sellerBranchLocationDataId
            })
            .expect(200);

        // Assert
        const {
            status: actualStatus,
        } = response.body as EditableFields_SellerBranchLocation;
        expect(actualStatus).toEqual(Status.INACTIVE);
    });
});

/* TEST GET API */
describe("Seller Branch Location API GET", () => {

    beforeAll(async () => {

        await SellerBranchLocationSvc.create(
            testSellerOrganisationBasicInformation1.id,
            testSellerBranchLocation2,
            userId,
            userId
        );
    });

    it("GET /api/v1/seller-organisations/{id}/seller-branch-locations/{id} - Get the specific branch location", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const sellerBranchLocationTest = testSellerBranchLocation1;

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-branch-locations/${sellerBranchLocationTest.id}`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .expect(200);

        // Assert
        const {
            branchName: actualBranchName,
            branchAddress: actualBranchAddress
        } = response.body as EditableFields_SellerBranchLocation;
        expect(actualBranchName).toEqual(sellerBranchLocationTest.branchName);
        expect(actualBranchAddress).toEqual(sellerBranchLocationTest.branchAddress);
    });

    it("GET /api/v1/seller-organisations/{id}/seller-branch-locations/actions/filter - Filter the branch location", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const searchQuery = {
            search: "an"
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-branch-locations/actions/filter`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .query(searchQuery)
            .expect(200);

        // Assert
        const actualResponseBody = response.body as SellerBranchLocation[];
        expect(actualResponseBody.length).toEqual(2);
    });

    it("GET /api/v1/seller-organisations/{id}/seller-branch-locations/actions/paginate - Paginate the branch location", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const paginationOptions = {
            columnkey: "branchName",
            sortby:    "asc",
            page:      1,
            pagesize:  5
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-branch-locations/actions/paginate`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .query(paginationOptions)
            .expect(200);

        // Assert
        const responseBody = response.body as {
            data: SellerBranchLocation[],
            totalRecordCount: number,
        };

        const actualTotalRecordCount = responseBody.totalRecordCount;
        const actualData = responseBody.data;

        expect(actualData.length).toEqual(2);
        expect(actualTotalRecordCount).toEqual(2);
    });

});

/* TEST PUT API */
describe("Seller Branch Location API PUT", () => {

    it("PUT /api/v1/seller-organisations/{id}/seller-branch-locations/{branchlocationid} - Update Seller Branch Location Email", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const sellerBranchLocationTest = testSellerBranchLocation1;
        const updateBody = {
            ...testSellerBranchLocation1,
            branchName: "Ang Mo Kio"
        };

        // Act
        const response = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-branch-locations/${sellerBranchLocationTest.id}`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(updateBody)
            .expect(200);

        // Assert
        const {
            branchName: actualBranchName
        } = response.body as SellerBranchLocation;

        expect(actualBranchName).toEqual("Ang Mo Kio");
    });

    it("PUT /api/v1/seller-organisations/{id}/seller-branch-locations/{branchlocationid} - Wrong fields JSON", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const sellerBranchLocationTest = testSellerBranchLocation1;
        const updateBody = {
            ...testSellerBranchLocation1,
            branchNames: "Ang Mo Kio"
        };

        // Act and Assert
        await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-branch-locations/${sellerBranchLocationTest.id}`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(updateBody)
            .expect(500);
    });
});


