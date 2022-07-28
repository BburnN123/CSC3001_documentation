/**
 * File : seller-seller-payment-term.test.ts
 * Testing the available routes that is inside routes/v1/seller-seller-payment-term.ts
 */

/* NODE MODULES */
import request from "supertest";

/* DB */

/* SERVICES */
import SellerPaymentTermSvc from "../../../../src/services/seller-payment-term";
import SellerOrganisationSvc from "../../../../src/services/seller-organisation";

/* CONFIG & UTILS */
import server, {
    setupHttpServer
} from "../../../../src/http-server";

/* TYPES */

/* TEST DATA */
import {
    testSellerOrganisationBasicInformation1,
    testSellerOrganisationBasicInformation2,
    testSellerPaymentTerm1,
    testSellerPaymentTerm2,
    testSellerPaymentTerm3
} from "../../seller-testdata";
import {
    SellerPaymentTerm
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

const userId = "eezee_test_user";

afterAll(async () => {

    // Clear DB
    const listOfSellerOrganisationIds = [
        testSellerOrganisationBasicInformation1.id,
        testSellerOrganisationBasicInformation2.id
    ];

    await SellerPaymentTermSvc.deleteByListOfSellerOrganisationIds(
        listOfSellerOrganisationIds
    );

    await SellerOrganisationSvc.deleteByListOfId(
        listOfSellerOrganisationIds
    );
});

beforeAll(async () => {

    // Create Seller Organisation Test Data
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

/* TESTING POST API */
describe("Seller Payment Term API POST", () => {

    it("POST /api/v1/seller-organisations/{id}/seller-payment-term - Create Seller Payment Term with Seller Organisation", async () => {

        // Arrange 
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const sellerPaymentTerm = testSellerPaymentTerm1;

        // Act
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-payment-term`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(sellerPaymentTerm)
            .expect(200);

        // Assert
        const {
            bankName: actualBankName
        } = response.body as SellerPaymentTerm;

        expect(actualBankName).toEqual(sellerPaymentTerm.bankName);

    });

    it("POST /api/v1/seller-organisations/{id}/seller-payment-term - Create Another Seller Payment Term for the same organisation - 500", async () => {

        // Arrange 
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const sellerPaymentTerm = testSellerPaymentTerm2;

        // Act and Assert
        await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-payment-term`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(sellerPaymentTerm)
            .expect(500);
    });

    it("POST /api/v1/seller-organisations/{id}/seller-payment-term - Create Seller Payment Term without Bank Name/Bank Account Holder/Bank Account Number", async () => {

        // Arrange 
        const sellerOrganisationId = testSellerOrganisationBasicInformation2.id;
        const sellerPaymentTerm = testSellerPaymentTerm3;

        // Act
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-payment-term`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(sellerPaymentTerm)
            .expect(200);

        // Assert
        const {
            bankName: actualBankName,
            bankAccountHolder: actualBankAccountHolder,
            bankAccountNumber: actualBankAccountNumber,
        } = response.body as SellerPaymentTerm;

        expect(actualBankName).toBeNull();
        expect(actualBankAccountHolder).toBeNull();
        expect(actualBankAccountNumber).toBeNull();
    });

    it("POST /api/v1/seller-organisations/{id}/seller-payment-term - Create Seller Payment Term with unknown Seller Organisation - 500", async () => {

        // Arrange 
        const sellerOrganisationId = "ckvabzxge00000ai746kgf0px";

        // Act and Assert
        await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-payment-term`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(testSellerPaymentTerm1)
            .expect(500);
    });
});

/* TESTING GET API */
describe("Seller Payment Term API GET", () => {
    it("GET /api/v1/seller-organisations/{id}/seller-payment-term - Get the Specific Seller Organisation Payment Terms", async () => {

        // Arrange 
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;
        const sellerPaymentTerm = testSellerPaymentTerm1;

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-payment-term`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .expect(200);


        // Assert
        const {
            bankName: actualBankName,
            paymentMethod: actualPaymentMethod
        } = response.body as SellerPaymentTerm;

        expect(actualBankName).toEqual(sellerPaymentTerm.bankName);
        expect(actualPaymentMethod).toEqual(sellerPaymentTerm.paymentMethod);
    });
});

/* TESTING PUT API */
describe("Seller Payment Term API PUT", () => {
    it("PUT /api/v1/seller-organisations/{id}/seller-payment-term - Update Bank Account Number to 234567", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation2.id;

        // Act
        const response = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-payment-term`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send({
                ...testSellerPaymentTerm2,
                bankAccountNumber: "234567",
            })
            .expect(200);

        // Assert
        const {
            bankAccountNumber: actualBankAccountNumber
        } = response.body as SellerPaymentTerm;

        expect(actualBankAccountNumber).toEqual("234567");
    });

    it("PUT /api/v1/seller-organisations/{id}/seller-payment-term - Update bank acocunt to exisiting bank account - 500 ", async () => {

        // Arrange
        const sellerOrganisationId = testSellerOrganisationBasicInformation1.id;

        // Assert and Act
        await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerOrganisationId}/seller-payment-term`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send({
                ...testSellerPaymentTerm1,
                bankAccountNumber: "234567",
            })
            .expect(500);
    });
});