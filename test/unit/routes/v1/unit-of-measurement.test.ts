import {
    UOMReference
} from "@prisma/client";
import request from "supertest";

import server, {
    setupHttpServer
} from "../../../../src/http-server";

beforeAll(async () => {

    // Initialize Server
    await setupHttpServer();
});

afterAll((done) => {
    done();
});

/* SETUP GLOBAL TEST VARIABLES */
const baseApiEndpoint = "/api/v1/unit-of-measurement";

const RequestHeaders = {
    BASE_API_ENDPOINT:  baseApiEndpoint,
    CSRF_TOKEN_FIELD:   "x-eezee-csrf",
    CSRF_TOKEN_VALUE:   "EEZEE",
    CONTENT_TYPE_FIELD: "Content-Type",
    CONTENT_TYPE_VALUE: "application/json"
};

/* TEST CREATE API */
describe.only("UOM API POST", () => {

    it.skip("POST /api/v1/unit-of-measurement - Create Unit Of Measurement", async () => {

        // Arrange
        const testUomReferences = [ {
            uomCode:     "SGL",
            description: "Singlez",

        },
        {
            uomCode:     "YD",
            description: "SheetSSSSSSSSSSSSSSS",
        } ];

        // Act
        const response = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(testUomReferences)
            .expect(200);

        // Assert
        const uomReferences = response.body as UOMReference[];
        const uomReferencesLength = uomReferences.length;
        expect(uomReferencesLength).toBe(2);
    });


    it("POST /api/v1/unit-of-measurementactions/download-uom-excel -Download Unit Of Measurement Excel", async () => {

        // Arrange
        const CONTENT_EXCEL_TYPE_VALUE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        // Act
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/actions/download-uom-excel`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, CONTENT_EXCEL_TYPE_VALUE)
            .set("Content-Disposition", "attachment; filename=" + "uom-references.xlsx")
            .expect(200);

        // Assert
        // const uomReferences = response.body;
        console.log(response);

    });
});


/* TEST GET API */
describe("UOM API GET", () => {

    it("GET /api/v1/unit-of-measurement - Get Unit Of Measurement", async () => {

        // Arrange

        // Act
        const response = await request(server)
            .get(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .expect(200);

        // Assert
        const uomReferences = response.body as UOMReference[];
        const uomReferencesLength = uomReferences.length;
        expect(uomReferencesLength).toBe(2);
    });
});



