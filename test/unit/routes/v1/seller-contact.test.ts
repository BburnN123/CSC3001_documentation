/**
 * File : seller-contact.test.ts
 * Testing the available routes that is inside routes/v1/seller-contact.ts
 */
/* NODE MODULES */
import request from "supertest";

/* DB */
import {
    SellerContact,
    Status
} from "@prisma/client";

/* SERVICES */
import SellerOrganisationSvc from "../../../../src/services/seller-organisation";
import SellerContactSvc, {
    EditableFields_SellerContact
} from "../../../../src/services/seller-contact";

/* CONFIG & UTILS */
import server, {
    setupHttpServer
} from "../../../../src/http-server";

/* TYPES */

/* TEST DATA */
import {
    testSellerContact1,
    testSellerContact2,
    testSellerContact3,
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

/* TEST POST API */
describe("Seller Contact API POST", () => {

    it("POST /api/v1/seller-organisations/{id}/seller-contacts - Create a Seller Contact", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const sellerContactTestData = testSellerContact1;

        // Act
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-contacts`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(sellerContactTestData)
            .expect(200);

        // Assert
        const {
            name: actualSellerContactName,
            email: actualSellerContactEmail
        } = response.body as EditableFields_SellerContact;

        expect(actualSellerContactName).toEqual(sellerContactTestData.name);
        expect(actualSellerContactEmail).toEqual(sellerContactTestData.email);
    });

    it("POST /api/v1/seller-organisations/{id}/seller-contacts - Duplicate a seller contact in other organisation", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const sellerContactTestData = testSellerContact1;

        // Act and Assert
        await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-contacts`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(sellerContactTestData)
            .expect(500);
    });

    it("POST /api/v1/seller-organisations/{id}/seller-contacts/status/delete - Set the status to delete", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const sellerContactId = testSellerContact1.id;

        // Act
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-contacts/status/delete`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send({
                id: sellerContactId
            })
            .expect(200);

        // Assert
        const {
            status: actualStatus,
        } = response.body as EditableFields_SellerContact;

        expect(actualStatus).toEqual(Status.DELETED);
    });

    it("POST /api/v1/seller-organisations/{id}/seller-contacts/status/active - Set the status to active", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const sellerContactId = testSellerContact1.id;

        // Act
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-contacts/status/active`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send({
                id: sellerContactId
            })
            .expect(200);

        // Assert
        const {
            status: actualStatus,
        } = response.body as EditableFields_SellerContact;

        expect(actualStatus).toEqual(Status.ACTIVE);
    });
});

/* TEST GET API */
describe("Seller Contact API GET", () => {

    beforeAll(async () => {
        await SellerContactSvc.create(
            testSellerOrganisationBasicInformation2.id,
            testSellerContact2,
            userId,
            userId
        );

        await SellerContactSvc.create(
            testSellerOrganisationBasicInformation2.id,
            testSellerContact3,
            userId,
            userId
        );
    });

    it("GET /api/v1/seller-organisations/{id}/seller-contacts/{id} - Get all Seller Contact related to the SellerOrganisation", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const sellerContactId = testSellerContact1.id;
        const expectedSellerContact = testSellerContact1;

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-contacts/${sellerContactId}`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .expect(200);

        // Assert
        const {
            name: acutalSellerContactName,
            email: actualSellerContactEmail
        } = response.body as EditableFields_SellerContact;

        expect(acutalSellerContactName).toEqual(expectedSellerContact.name);
        expect(actualSellerContactEmail).toEqual(expectedSellerContact.email);
    });

    it("GET /api/v1/seller-organisations/{id}/seller-contacts/actions/filter - search for name, phone, email, department, role", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const searchQuery = {
            search: encodeURIComponent("oh")
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-contacts/actions/filter`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(searchQuery)
            .expect(200);

        // Assert
        const actualResult = response.body as SellerContact[];
        console.log(actualResult);
        expect(actualResult.length).toEqual(1);
    });

    it("GET /api/v1/seller-organisations/{id}/seller-contacts/actions/paginate - Get the 1st page", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const paginationOptions = {
            columnkey: "name",
            sortby:    "asc",
            page:      1,
            pagesize:  5
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-contacts/actions/paginate`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(paginationOptions)
            .expect(200);

        // Assert
        const responseBody = response.body as {
            data: SellerContact[],
            totalRecordCount: number,
        };

        const actualTotalRecordCount = responseBody.totalRecordCount;
        const actualData = responseBody.data;

        expect(actualData.length).toEqual(1);
        expect(actualTotalRecordCount).toEqual(1);
    });

    it("GET /api/v1/seller-organisations/{id}/seller-contacts/check/email - Email exists", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const checkCompanyEmail = {
            search: "john@general.com"
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-contacts/check/email`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(checkCompanyEmail)
            .expect(200);

        // Assert
        const actualResponseBody = response.body as {
            email: string
        };

        expect(actualResponseBody.email).toEqual("Email already exists");
    });

    it("GET /api/v1/seller-organisations/{id}/seller-contacts/check/email - Email does not exists", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const checkCompanyEmail = {
            search: "joh@test.com.sg"
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-contacts/check/email`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(checkCompanyEmail)
            .expect(200);

        // Assert
        const actualResponseBody = response.body;
        expect(actualResponseBody).not.toBeTruthy();
    });

    it("GET /api/v1/seller-organisations/{id}/seller-contacts/check/phone - Phone does exists", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const checkPhoneQuery = {
            search: "87205586"
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-contacts/check/phone`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(checkPhoneQuery)
            .expect(200);

        // Assert
        const actualResponseBody = response.body as {
            phone: string
        };

        expect(actualResponseBody.phone).toEqual("Phone already exists");
    });

    it("GET /api/v1/seller-organisations/{id}/seller-contacts/check/phone - Phone does not exists", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const checkPhoneQuery = {
            search: "123512"
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-contacts/check/phone`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(checkPhoneQuery)
            .expect(200);

        // Assert
        const actualResponseBody = response.body;
        expect(actualResponseBody).not.toBeTruthy();
    });
});

/* TEST PUT API */
describe("Seller Contact API PUT", () => {

    it("PUT /api/v1/seller-organisations/{id}/seller-contacts/{contactid} - Update Seller Contact Email", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const sellerContactId = testSellerContact1.id;

        const updateBody = {
            ...testSellerContact1,
            email: "hernandez@eezee.com"
        };

        // Act
        const response = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-contacts/${sellerContactId}`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(updateBody)
            .expect(200);

        // Assert
        const {
            email: actualContactEmail
        } = response.body as EditableFields_SellerContact;
        expect(actualContactEmail).toEqual("hernandez@eezee.com");
    });

    it("PUT /api/v1/seller-organisations/{id}/seller-contacts/{contactid} - No Unqiue Constraints Email", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const sellerContactId = testSellerContact1.id;

        const updateBody = {
            ...testSellerContact1,
            email: "hernandez@eezee.com"
        };

        // Act
        const response = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-contacts/${sellerContactId}`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(updateBody)
            .expect(200);

        // Assert
        const {
            email: actualContactEmail
        } = response.body as EditableFields_SellerContact;
        expect(actualContactEmail).toEqual("hernandez@eezee.com");
    });

    it("PUT /api/v1/seller-organisations/{id}/seller-contacts/{contactid} - Wrong fields JSON", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const sellerContactId = testSellerContact1.id;

        const updateBody = {
            ...testSellerContact1,
            emails: "hernandez@eezee.com"
        };

        // Act and Assert
        await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-contacts/${sellerContactId}`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(updateBody)
            .expect(500);
    });

    it("PUT /api/v1/seller-organisations/{id}/seller-contacts/{contactid} - No Unqiue Constraints Phone", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const sellerContactId = testSellerContact1.id;

        const updateBody = {
            ...testSellerContact1,
            phone: "87205586"
        };

        // Act
        const response = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-contacts/${sellerContactId}`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(updateBody)
            .expect(200);

        // Assert
        const {
            phone: actualContactPhone
        } = response.body as EditableFields_SellerContact;
        expect(actualContactPhone).toEqual("87205586");
    });
});


