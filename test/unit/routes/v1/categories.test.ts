/**
 * File : category.test.ts
 * Testing the available routes that is in routes/v1/category.ts
 */
/* STANDARD NODE MODULES */
import {
    SubCategory
} from "@prisma/client";
import axios from "axios";
import request from "supertest";

/* ROUTES */

/* MIDDLEWARE */

/* SERVICES */

/* CONFIG & UTILS */
import server, {
    setupHttpServer
} from "../../../../src/http-server";
import {
    T_SellerAdminCategory
} from "../../../../src/services/category-selleradmin";
import {
    T_SubCategory
} from "../../../../src/services/category-sub";

/* TYPES */

/* SETUP GLOBAL TEST VARIABLES */
const baseApiEndpoint = "/api/v1/categories";

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

afterAll((done) => {
    done();
});

/* TEST FETCHING OF DATA FROM SELLER ADMIN */
describe("Functional Test", () => {

    it("Fetch category data from seller admin", async () => {

        // Arrange
        const SELLERADMIN_CATEGORY_API = "https://api.eezee.sg/api/v1.1/categories";

        // Act
        const response = await axios.get(SELLERADMIN_CATEGORY_API, {
            headers: {
                "X-EEZEE-API-KEY": "4e450517-23ed-4899-901d-aba534549ccc",
                "Content-Type":    "application/json",
                "Accept":          "application/json"
            }
        });

        const data = response.data as {

            /**
             * success show the repsonse status
             * categories will be in a form of json array
             */
            success: boolean
            categories: T_SellerAdminCategory[]
        };

        const parseJson = () => {
            const json = JSON.stringify(data.categories);
            JSON.parse(json);
        };

        // Assert
        expect(data.success).toBeTruthy();
        expect(parseJson).not.toThrow();
    });
});

/* TEST GET API */
describe("Category API GET", () => {

    it("GET /api/v1/categories/actions/refresh - Update the DB to the latest category from seller admin", async () => {

        // Arrange

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/actions/refresh`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .expect(200);

        // Assert
        const actualResponse = response.body as boolean;
        expect(actualResponse).toBeTruthy();
    });

    it("GET /api/v1/categories - Retrieve all categories (Current : 555)", async () => {

        // Arrange
        // Let the data import finish first
        await new Promise((r) => setTimeout(r, 1000));
        const paginationOptions = {
            columnkey: "title",
            sortby:    "asc",
            page:      2,
            pagesize:  10
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/actions/paginate`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .query(paginationOptions)
            .expect(200)
            .expect("Content-Type", /json/);

        // Assert
        const responseBody = response.body as {
            data: T_SubCategory[],
            totalRecordCount: number,
        };

        const actualTotalRecordCount = responseBody.totalRecordCount;
        const actualData = responseBody.data;

        expect(actualTotalRecordCount).toBe(555);
        expect(actualData.length).toBe(10);
    });

    it("GET /api/v1/categories/actions/filter - Retrieve the value that contain 'saf'", async () => {

        // Arrange
        const searchQuery = {
            search: "saf"
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/actions/filter`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(searchQuery)
            .expect(200)
            .expect("Content-Type", /json/);

        // Assert
        const subCateogries = response.body as SubCategory[];
        expect(subCateogries.length).toBe(25);
    });
});



