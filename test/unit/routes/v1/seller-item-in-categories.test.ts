/**
 * File : seller-item-in-categories.test.ts
 * Testing the available routes that is inside routes/v1/seller-item-in-categories.ts
 */

/* NODE MODULES */
import request from "supertest";

/* DB */
import {
    SellerItemInCategories
} from "@prisma/client";

/* SERVICES */
import {
    T_SubCategory
} from "../../../../src/services/category-sub";
import SellerItemSvc from "../../../../src/services/seller-item";
import SellerItemInCategoriesSvc from "../../../../src/services/seller-item-in-categories";
import SellerOrganisationSvc from "../../../../src/services/seller-organisation";

/* CONFIG & UTILS */
import server, {
    setupHttpServer
} from "../../../../src/http-server";

/* TYPES */

/* TEST DATA */
import {
    testSellerOrganisationBasicInformation1
} from "../../seller-testdata";
import {
    testSellerItemData1
} from "../../seller-item-testdata";
import {
    categorySeed
} from "../../../../prisma/seedCategory";
import MainCategorySvc from "../../../../src/services/category-main";

/* SETUP GLOBAL TEST VARIABLES */
const baseApiEndpoint = "/api/v1/seller-items";

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
    const listOfSellerItemId = [
        testSellerOrganisationBasicInformation1.id
    ];

    const listOfSellerItem = [
        testSellerItemData1.id
    ];

    await SellerItemInCategoriesSvc.deleteAll();

    await SellerItemSvc.deleteByListOfId(
        listOfSellerItem
    );

    await SellerOrganisationSvc.deleteByListOfId(
        listOfSellerItemId
    );
});

beforeAll(async () => {

    // Create a test categories
    await Promise.all(categorySeed.map(async (_categoryList) => {
        await MainCategorySvc.updateFromSellerAdmin(
            _categoryList.mainCategory,
            _categoryList.subCategory
        );
    }));

    await SellerOrganisationSvc.create(
        testSellerOrganisationBasicInformation1,
        userId,
        userId
    );

    await SellerItemSvc.create(
        testSellerItemData1,
        userId,
        userId
    );

    // Initialize Server
    await setupHttpServer();
});

/* TEST POST API */
describe("Seller Item In Catergories API POST", () => {

    it("POST /api/v1/seller-items/{id}/categories/actions/link - Create Seller Item in Categories", async () => {

        // Arrange
        const sellerItemTestId = testSellerItemData1.id;
        const subCategoryTest = categorySeed[0].subCategory[0];

        const sellerItemInCategoriesBody = {
            subCategoryId: subCategoryTest.id
        };

        // Act
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerItemTestId}/categories/actions/link`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(sellerItemInCategoriesBody)
            .expect(200);

        // Assert
        const reqBody = response.body as {
            id: string,
            sellerItemId: string,
            subCategoryId: string,
            SubCategory: T_SubCategory
        };

        const {
            title: actualSubCategoryTitle
        } = reqBody.SubCategory;

        expect(actualSubCategoryTitle).toEqual("Abrasives Grinders");
    });

    it("POST /api/v1/seller-items/{id}/categories/actions/link - Link another Categories with Same Seller", async () => {

        // Arrange
        const sellerItemTestId = testSellerItemData1.id;
        const subCategoryTest = categorySeed[0].subCategory[1];

        const sellerItemInCategoriesBody = {
            subCategoryId: subCategoryTest.id
        };

        // Act
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerItemTestId}/categories/actions/link`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(sellerItemInCategoriesBody)
            .expect(200);

        // Assert
        const reqBody = response.body as {
            id: string,
            sellerItemId: string,
            subCategoryId: string,
            SubCategory: T_SubCategory
        };

        const {
            title: actualSubCategoryTitle
        } = reqBody.SubCategory;

        expect(actualSubCategoryTitle).toEqual("Power Saws");
    });

    it("POST /api/v1/seller-items/{id}/categories/actions/unlink - Unlink Categories", async () => {

        // Arrange
        const sellerItemTestId = testSellerItemData1.id;
        const subCategoryTest = categorySeed[0].subCategory[0];

        const sellerItemInCategoriesBody = {
            subCategoryId: subCategoryTest.id
        };

        // Act
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerItemTestId}/categories/actions/unlink`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(sellerItemInCategoriesBody)
            .expect(200);

        // Assert
        const reqBody = response.body as {
            id: string,
            sellerItemId: string,
            subCategoryId: string,
            SubCategory: T_SubCategory,
        };

        const {
            title: actualSubCategoryTitle
        } = reqBody.SubCategory;

        expect(actualSubCategoryTitle).toEqual("Abrasives Grinders");
    });

    it("POST /api/v1/seller-items/{id}/categories/actions/link - Link With Main Categories - Forgien Constraints", async () => {

        // Arrange
        const sellerItemTestId = testSellerItemData1.id;
        const mainCategoryTest = categorySeed[0].mainCategory;

        const sellerItemInCategoriesBody = {
            subCategoryId: mainCategoryTest.id
        };

        // Act and Assert
        await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerItemTestId}/categories/actions/unlink`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(sellerItemInCategoriesBody)
            .expect(500);
    });

    it("POST /api/v1/seller-items/{id}/categories/actions/link - Duplicate Seller Item in Categories - \"Unique Constraints\"", async () => {

        // Arrange
        const sellerItemTestId = testSellerItemData1.id;
        const subCategoryTest = categorySeed[0].subCategory[1];

        const sellerItemInCategoriesBody = {
            subCategoryId: subCategoryTest.id
        };

        // Act and Assert
        await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerItemTestId}/categories/actions/link`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(sellerItemInCategoriesBody)
            .expect(500);
    });
});

/* TEST GET API */
describe("Seller Item In Catergories API GET", () => {
    it("GET /api/v1/seller-items/{id}/categories - Create Seller Item in Categories", async () => {

        // Arrange
        const sellerItemTestId = testSellerItemData1.id;

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerItemTestId}/categories`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .expect(200);

        // Assert
        const sellerItemInCategories = response.body as SellerItemInCategories[];

        expect(sellerItemInCategories.length).toEqual(1);
    });

});