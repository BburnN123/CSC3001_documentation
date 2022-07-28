/**
 * File : seller-organisations.test.ts
 * Testing the available routes that is inside routes/v1/seller-organisations.ts
 */
/* NODE MODULES */
import request from "supertest";

/* DB */
import {
    SellerOrganisation
} from "@prisma/client";

/* SERVICES */
import SellerOrganisationSvc, {
    EditableFields_SellerOrganisationBasicInformation
} from "../../../../src/services/seller-organisation";

/* CONFIG & UTILS */
import server, {
    setupHttpServer
} from "../../../../src/http-server";

/* TYPES */

/* TEST DATA */
import {
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

beforeAll(async () => {

    // Initialize Server
    await setupHttpServer();
});

afterAll(async () => {

    // Clear DB
    const listOfSellerOrganisationId = [
        testSellerOrganisationBasicInformation1.id,
        testSellerOrganisationBasicInformation2.id
    ];

    await SellerOrganisationSvc.deleteByListOfId(
        listOfSellerOrganisationId
    );
});

/* TESTING POST API */
describe("Seller API POST", () => {

    it("POST /api/v1/seller-organisations - Create a SellerOrganisation only", async () => {

        // Arramge
        const sellerOrganisationTestData = testSellerOrganisationBasicInformation1;

        // Act
        const response = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(sellerOrganisationTestData)
            .expect(200);

        const {
            companyName: actualCompanyName,
            companyEmail: actualCompanyEmail,
            companyPhone: actualCompanyPhone
        } = response.body as EditableFields_SellerOrganisationBasicInformation;

        // Assert
        expect(actualCompanyName).toEqual(sellerOrganisationTestData.companyName);
        expect(actualCompanyEmail).toEqual(sellerOrganisationTestData.companyEmail);
        expect(actualCompanyPhone).toEqual(sellerOrganisationTestData.companyPhone);
    });

    it("POST /api/v1/seller-organisations - Show throw a response 500 (Duplicate Record)", async () => {

        // Arrange
        const sellerOrganisationTestData = testSellerOrganisationBasicInformation1;

        // Act and Assert
        await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(sellerOrganisationTestData)
            .expect(500);
    });

    it("POST /api/v1/seller-organisations - Create a SellerOrganisation with Contact and Branch Location", async () => {

        // Arrange
        const sellerOrganisationTestData = testSellerOrganisationBasicInformation2;

        // Act
        const response = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(sellerOrganisationTestData)
            .expect(200);

        const {
            companyName: actualCompanyName,
        } = response.body as EditableFields_SellerOrganisationBasicInformation;

        // Assert
        expect(actualCompanyName).toEqual(sellerOrganisationTestData.companyName);
    });

    it("POST /api/v1/seller-organisations/status/delete - Create a SellerOrganisation with Contact and Branch Location", async () => {

        // Arrange
        const sellerOrganisationTestData = testSellerOrganisationBasicInformation1;

        // Act
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/status/delete`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                {
                    id: sellerOrganisationTestData.id
                }
            )
            .expect(200);

        const {
            companyName: actualCompanyName,
        } = response.body as EditableFields_SellerOrganisationBasicInformation;

        // Assert
        expect(actualCompanyName).toEqual(sellerOrganisationTestData.companyName);
    });

    it("POST /api/v1/seller-organisations/status/active - Create a SellerOrganisation with Contact and Branch Location", async () => {

        // Arrange
        const sellerOrganisationTestData = testSellerOrganisationBasicInformation1;

        // Act
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/status/active`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                {
                    id: sellerOrganisationTestData.id
                }
            )
            .expect(200);

        const {
            companyName: actualCompanyName,
        } = response.body as EditableFields_SellerOrganisationBasicInformation;

        // Assert
        expect(actualCompanyName).toEqual(sellerOrganisationTestData.companyName);
    });

});

/* TESTING GET API */
describe("Seller API GET", () => {

    it("GET /api/v1/seller-organisations - List of all Seller", async () => {

        // Arrange

        // Act
        const response = await request(server)
            .get(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .expect(200)
            .expect("Content-Type", /json/);

        // Assert
        const actualSellerOrganisationLength = response.body.length;
        expect(actualSellerOrganisationLength).toEqual(2);
    });

    it("GET /api/v1/seller-organisations/actions/paginate - Get the 2nd page", async () => {

        // Arrange
        const paginationOptions = {
            columnkey: "companyName",
            sortby:    "asc",
            page:      1,
            pagesize:  5
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/actions/paginate`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(paginationOptions)
            .expect(200)
            .expect("Content-Type", /json/);


        // Assert
        const responseBody = response.body as {
            data: SellerOrganisation[],
            totalRecordCount: number,
        };

        const actualTotalRecordCount = responseBody.totalRecordCount;
        const actualData = responseBody.data;

        expect(actualData.length).toEqual(2);
        expect(actualTotalRecordCount).toEqual(2);
    });

    it("GET /api/v1/seller-organisations/:id - Single Seller", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .expect(200)
            .expect("Content-Type", /json/);

        const {
            companyName: actualCompanyName
        } = response.body as EditableFields_SellerOrganisationBasicInformation;

        // Assert
        expect(actualCompanyName)
            .toEqual(testSellerOrganisationBasicInformation1.companyName);
    });

    it("GET /api/v1/seller-organisations/actions/filter?search - Search Seller with \"ee\" - getByCompanyNameOrPhoneOrEmail", async () => {

        // Arrange
        const searchCompanyNameOrPhoneOrEmail = {
            search: encodeURIComponent("pte")
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/actions/filter`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(searchCompanyNameOrPhoneOrEmail)
            .expect(200)
            .expect("Content-Type", /json/);

        // Assert
        const actualResponseBody = response.body;
        expect(actualResponseBody.length).toEqual(2);
    });

    it("GET /api/v1/seller-organisations/check/company-email?search - Search Seller Email with \"general@eezee.com.sg\"", async () => {

        // Arrange
        const checkCompanyEmail = {
            search: "general@vega.co.uk"
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/check/company-email`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(checkCompanyEmail)
            .expect(200)
            .expect("Content-Type", /json/);

        // Assert
        const actualResponseBody = response.body as {
            companyEmail: string
        };

        expect(actualResponseBody.companyEmail).toEqual("Email already exists");
    });

    it("GET /api/v1/seller-organisations/actions/check/company-email?search - Search Seller Email with \"general@unknown.com.sg\" - Does not exists", async () => {

        // Arrange
        const checkCompanyEmail = {
            search: "general@unknown.com.sg"
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/check/company-email`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(checkCompanyEmail)
            .expect(200)
            .expect("Content-Type", /json/);

        // Assert
        const actualResponseBody = response.body;
        expect(actualResponseBody).not.toBeTruthy();
    });

    it("GET /api/v1/seller-organisations/actions/check/company-name?search - Search Company Name with \"eezee\"", async () => {

        // Arrange
        const checkCompanyName = {
            search: encodeURIComponent("vega networks pte ltd")
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/check/company-name`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(checkCompanyName)
            .expect(200)
            .expect("Content-Type", /json/);

        // Assert
        const actualResponseBody = response.body;
        expect(actualResponseBody).toBeTruthy();
    });

    it("GET /api/v1/seller-organisations/actions/check/company-name?search - Search Company Name with \"eezee\" - Does not exists", async () => {

        // Arrange
        const checkCompanyName = {
            search: encodeURIComponent("unknown")
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/check/company-name`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(checkCompanyName)
            .expect(200)
            .expect("Content-Type", /json/);

        // Assert
        const actualResponseBody = response.body;
        expect(actualResponseBody).not.toBeTruthy();
    });

    it("GET /api/v1/seller-organisations/actions/check/company-phone?search - Search Company Phone with \"67979688\"", async () => {

        // Arrange
        const checkCompanyPhone = {
            search: "67492696"
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/check/company-phone`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(checkCompanyPhone)
            .expect(200)
            .expect("Content-Type", /json/);

        // Assert
        const actualResponseBody = response.body;
        expect(actualResponseBody).toBeTruthy();
    });

    it("GET /api/v1/seller-organisations/actions/check/company-phone?search - Search  Company Phone with \"unknown\" - Does not exists", async () => {

        // Arrange
        const checkCompanyPhone = {
            search: "unknown"
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/check/company-phone`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(checkCompanyPhone)
            .expect(200)
            .expect("Content-Type", /json/);

        // Assert
        const actualResponseBody = response.body;
        expect(actualResponseBody).not.toBeTruthy();
    });

    it("GET /api/v1/seller-organisations/actions/check/company-phone?search - Search Seller with \"\" - No contact can be found", async () => {

        // Arrange
        const checkCompanyPhone = {
            search: ""
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/check/company-phone`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(checkCompanyPhone)
            .expect(200)
            .expect("Content-Type", /json/);

        // Assert
        const actualResponseBody = response.body;
        expect(actualResponseBody).not.toBeTruthy();
    });
});

/* TESTING PUT API */
describe("Seller API PUT", () => {

    it("PUT /api/v1/seller-organisations/:id/company-details-information - Update a SellerOrganisation Email", async () => {

        // Arrange
        const sellerOrganisationIdTest = testSellerOrganisationBasicInformation1.id;
        const requestBody = {
            ...testSellerOrganisationBasicInformation1,
            companyEmail: "sample_api@sample.com.sg"
        };

        // Act
        const response = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationIdTest}/company-basic-information`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(requestBody)
            .expect(200);

        // Assert
        const {
            companyEmail: actualCompanyEmail
        } = response.body as SellerOrganisation;

        expect(actualCompanyEmail).toEqual("sample_api@sample.com.sg");
    });

    it("PUT /api/v1/seller-organisations/:id/company-basic-information - Update a SellerOrganisation with a Exisiting Email - Unique Contstraints ", async () => {

        // Arrange
        const sellerOrganisationIdTest = testSellerOrganisationBasicInformation2.id;
        const requestBody = {
            ...testSellerOrganisationBasicInformation1,
            companyEmail: "sample_api@sample.com.sg"
        };

        // Act and Assert
        await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationIdTest}/company-basic-information`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(requestBody)
            .expect(500);
    });

    it("PUT /api/v1/seller-organisations/:id/company-basic-information - Wrong Fields - 403", async () => {

        // Arrange
        const sellerOrganisationIdTest = testSellerOrganisationBasicInformation2.id;
        const requestBody = {
            ...testSellerOrganisationBasicInformation1,
            companyEmai: "sample_api@sample.com.sg"
        };

        // Act and Assert
        await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationIdTest}/company-basic-information`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(requestBody)
            .expect(500);
    });

    it("PUT /api/v1/seller-organisations/:id/company-basic-information - Wrong Fields - 403", async () => {

        // Arrange
        const sellerOrganisationIdTest = testSellerOrganisationBasicInformation2.id;
        const requestBody = {
            remarks: "Only open from 5pm"
        };

        // Act
        const response = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationIdTest}/company-details-information`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(requestBody)
            .expect(200);

        // Assert
        const {
            remarks: actualRemarks
        } = response.body as SellerOrganisation;

        expect(actualRemarks).toEqual("Only open from 5pm");
    });
});