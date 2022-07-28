/* NODE MODULES */
import request from "supertest";

/* DB */
import { BuyerOrganisation } from "@prisma/client";

/* SERVICES */
import BuyerOrganisationSvc, { EditableFields_BuyerOrganisation } from "../../../../src/services/buyer-organisation";
import UserSvc from "../../../../src/services/user";


/* CONFIG & UTILS */
import server, { setupHttpServer } from "../../../../src/http-server";

/* TYPES */

/* TEST DATA */
import { seedBuyerOrganisation } from "../../../../prisma/seedBuyerOrganisation";


/* SETUP GLOBAL TEST VARIABLES */

const baseApiEndpoint = "/api/v1/buyer-organisation";

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
    
});

afterAll(async() => {

    //Clear the DB
    await teardownSeed();
});

const teardownSeed = async () => {
    await BuyerOrganisationSvc.deleteAll();
    await UserSvc.deleteAll();
};

/* TEST BUYER ORGANISATION */
describe("BUYER ORGANISATION POST", () => {
    it("POST /api/v1/buyer-organisation - Create Buyer Organisation", async () => {

        /* Arrange */
        const _buyerOrganisationData = {
            companyName: "JOSHUA BUYER ORGANISATION",
            remarks:     "JOSHUA BUYER ORGANISATION REMARK"
        } as EditableFields_BuyerOrganisation;

        const _expectedResult = _buyerOrganisationData;

        /* Act */
        const _response = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                _buyerOrganisationData,
            )
            .expect(200)
            .expect("Content-Type", /json/);

        const _buyerOrganisation = _response.body;
        const _actualResult = _buyerOrganisation;

        /* Assert */
        expect(_actualResult.companyName).toBe(_expectedResult.companyName);
        expect(_actualResult.remarks).toBe(_expectedResult.remarks);

    });
});

describe("BUYER ORGANISATION GET", () => {
    it("GET /api/v1/buyer-organisation/:buyerOrganisationId - Get Buyer Organisation by Id", async() => {

        await teardownSeed();

        /* Arrange */
        const _buyerOrganisationData = seedBuyerOrganisation[1];

        await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .send(
                _buyerOrganisationData,
            )
            .expect(200)
            .expect("Content-Type", /json/);
        
        const _expectedResult = _buyerOrganisationData;
        const _buyerOrganisations = await BuyerOrganisationSvc.getAll();
        const _expectedbuyerOrganisation = _buyerOrganisations[0];
        
        /* Act */
        const _response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/${_expectedbuyerOrganisation.id}`)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .expect(200);

        const _actualBuyerOrganisation = _response.body as BuyerOrganisation;
        
        /* Assert */
        expect(_actualBuyerOrganisation.companyName).toEqual(_expectedResult.companyName);
        expect(_actualBuyerOrganisation.remarks).toEqual(_expectedResult.remarks);
    });
});