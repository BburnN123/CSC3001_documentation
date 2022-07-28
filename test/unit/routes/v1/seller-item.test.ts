/**
 * File : seller-item.test.ts
 * Testing the available routes that is inside routes/v1/seller-item.ts
 */
/* STANDARD NODE MODULES */
import request from "supertest";

/* DB */
import {
    SellerItem,
    SellerItemInCategories,
    Status
} from "@prisma/client";

/* SERVICES */
import MainCategorySvc from "../../../../src/services/category-main";
import SellerItemSvc from "../../../../src/services/seller-item";
import SellerItemInCategoriesSvc from "../../../../src/services/seller-item-in-categories";
import SellerOrganisationSvc from "../../../../src/services/seller-organisation";

/* CONFIG & UTILS */
import server, {
    setupHttpServer
} from "../../../../src/http-server";

/* TEST DATA */
import {
    testSellerOrganisationBasicInformation1,
    testSellerOrganisationBasicInformation2
} from "../../seller-testdata";
import {
    testSellerItemData1,
    testSellerItemData2,
    testSellerItemData3
} from "../../seller-item-testdata";
import {
    categorySeed
} from "../../../../prisma/seedCategory";

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

beforeAll(async () => {

    await SellerOrganisationSvc.create(
        testSellerOrganisationBasicInformation1,
        userId,
        userId
    );

    // Create a test categories
    await Promise.all(categorySeed.map(async (_categoryList) => {
        await MainCategorySvc.updateFromSellerAdmin(
            _categoryList.mainCategory,
            _categoryList.subCategory
        );
    }));

    // Initialize Server
    await setupHttpServer();
});

afterAll(async () => {

    const listOfSellerOrganisationId = [
        testSellerOrganisationBasicInformation1.id
    ];

    const listOfSellerItem = [
        testSellerItemData1.id,
        testSellerItemData2.id,
        testSellerItemData3.id
    ];

    await SellerItemInCategoriesSvc.deleteAll();
    await MainCategorySvc.deleteAll();

    await SellerItemSvc.deleteByListOfId(
        listOfSellerItem
    );

    await SellerOrganisationSvc.deleteByListOfId(
        listOfSellerOrganisationId
    );
});

/* TESTING POST API */
describe("Seller Item API POST", () => {

    it("POST /api/v1/seller-items/ - Create a Seller Item", async () => {

        // Arrange
        const sellerItemTestData = {
            sellerItem: testSellerItemData1
        };

        // Act
        const response = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(sellerItemTestData)
            .expect(200);

        // Assert
        const {
            productTitle: actualProductTitle,
            brandModel: actualBrandModel
        } = response.body as SellerItem;

        expect(actualProductTitle).toEqual(testSellerItemData1.productTitle);
        expect(actualBrandModel).toEqual(testSellerItemData1.brandModel);
    });

    it("POST /api/v1/seller-items/ - Create a Seller Item with category", async () => {

        // Arrange
        const subCategories = categorySeed[0].subCategory.map(subCategory => (
            subCategory.id
        ));

        const sellerItemTestData = {
            sellerItem:     testSellerItemData2,
            subCategoryIds: subCategories
        };

        // Act
        const response = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(sellerItemTestData)
            .expect(200);

        // Assert
        const {
            SellerItemInCategories: actualSubCategories,
            productTitle: actualProductTitle
        } = response.body as SellerItem & {
            SellerItemInCategories: SellerItemInCategories[];
        };

        expect(actualSubCategories.length).toEqual(2);
        expect(actualProductTitle).toEqual(testSellerItemData2.productTitle);
    });

    it("POST /api/v1/seller-items/ - Create a Seller Item without seller organisation", async () => {

        // Arrange
        const sellerItemTest = testSellerItemData3;
        delete sellerItemTest["sellerOrganisationId"];

        const sellerItemTestData = {
            sellerItem: sellerItemTest
        };

        // Act
        const response = await request(server)
            .post(RequestHeaders.BASE_API_ENDPOINT)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(sellerItemTestData)
            .expect(200);

        // Assert
        const {
            sellerOrganisationId
        } = response.body as SellerItem;

        expect(sellerOrganisationId).toBeNull();
    });

    it("POST /api/v1/seller-items/status/delete - Set Status to Delete ", async () => {

        // Arrange
        const sellerItemId = testSellerItemData1.id;

        // Act
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/status/delete`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send({
                id: sellerItemId
            })
            .expect(200);

        // Assert
        const {
            status: actualStatus
        } = response.body as SellerItem;

        expect(actualStatus).toEqual(Status.DELETED);
    });

    it("POST /api/v1/seller-items/status/inactive - Set Status to Inactive ", async () => {

        // Arrange
        const sellerItemId = testSellerItemData1.id;

        // Act
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/status/inactive`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send({
                id: sellerItemId
            })
            .expect(200);

        // Assert
        const {
            status: actualStatus
        } = response.body as SellerItem;

        expect(actualStatus).toEqual(Status.INACTIVE);
    });

    it("POST /api/v1/seller-items/status/active - Set Status to Active ", async () => {

        // Arrange
        const sellerItemId = testSellerItemData1.id;

        // Act
        const response = await request(server)
            .post(`${RequestHeaders.BASE_API_ENDPOINT}/status/active`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send({
                id: sellerItemId
            })
            .expect(200);

        // Assert
        const {
            status: actualStatus
        } = response.body as SellerItem;

        expect(actualStatus).toEqual(Status.ACTIVE);
    });
});

/* TESTING GET API */
describe("Seller Item API GET", () => {

    it("GET /api/v1/seller-items/actions/paginate - Get 1st Page", async () => {

        // Arrange
        const paginationOptions = {
            columnkey: "productTitle",
            sortby:    "asc",
            page:      1,
            pagesize:  5
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/actions/paginate`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .query(paginationOptions)
            .expect(200);

        // Assert
        const responseBody = response.body as {
            data: SellerItem[],
            totalRecordCount: number,
        };

        const actualTotalRecordCount = responseBody.totalRecordCount;
        const actualData = responseBody.data;

        expect(actualTotalRecordCount).toEqual(3);
        expect(actualData.length).toEqual(3);
    });

    it("GET /api/v1/seller-items/:id - Get a specific seller item", async () => {

        // Arrange
        const sellerItemId = testSellerItemData1.id;

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/${sellerItemId}`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .expect(200);

        const {
            productTitle: actualProductTitle
        } = response.body as SellerItem;

        // Assert
        expect(actualProductTitle).toEqual(testSellerItemData1.productTitle);
    });

    it("GET /api/v1/seller-items/actions/filter?search - Get a Seller Item from Product Title/Brand Model/Model Number", async () => {

        // Arrange
        const searchQuery = {
            search: "sa"
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/actions/filter`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(searchQuery)
            .expect(200);

        // Assert
        const actualSellerItems = response.body as SellerItem[];
        expect(actualSellerItems.length).toEqual(2);
    });

    it("GET /api/v1/seller-items/actions/filter/brand-model?search - Get a Seller Item by Model Number", async () => {

        // Arrange
        const searchQuery = {
            search: "SHOES"
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/actions/filter/brand-model`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(searchQuery)
            .expect(200);

        // Assert
        const actualSellerItems = response.body as SellerItem[];
        expect(actualSellerItems.length).toEqual(1);
    });

    it("GET /api/v1/seller-items/actions/filter/category-title?search - Get a Seller Item from category title", async () => {

        // Arrange
        const searchQuery = {
            search: "grinders"
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/actions/filter/category-title`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(searchQuery)
            .expect(200);

        // Assert
        const actualSellerItems = response.body as SellerItem[];
        expect(actualSellerItems.length).toEqual(1);
    });

    it("GET /api/v1/seller-items/actions/filter/model-number?search - Get a Seller Item from model number", async () => {

        // Arrange
        const searchQuery = {
            search: "94453"
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/actions/filter/model-number`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(searchQuery)
            .expect(200);

        // Assert
        const actualSellerItems = response.body as SellerItem[];
        expect(actualSellerItems.length).toEqual(1);
    });

    it("GET /api/v1/seller-items/actions/filter/product-title?search - Get a Seller Item from product title", async () => {

        // Arrange
        const searchQuery = {
            search: "lead"
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/actions/filter/product-title`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(searchQuery)
            .expect(200);

        // Assert
        const actualSellerItems = response.body as SellerItem[];
        expect(actualSellerItems.length).toEqual(1);
    });

    it("GET /api/v1/seller-items/actions/filter/seller-organisation?search - Get a Seller Item from Seller Organisation", async () => {

        // Arrange
        const searchQuery = {
            id: testSellerOrganisationBasicInformation1.id
        };

        // Act
        const response = await request(server)
            .get(`${RequestHeaders.BASE_API_ENDPOINT}/actions/filter/seller-organisation`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .query(searchQuery)
            .expect(200);

        // Assert
        const actualSellerItems = response.body as SellerItem[];
        expect(actualSellerItems.length).toEqual(2);
    });
});

/* TESTING PUT API */
describe("Seller Item API PUT", () => {

    it("PUT /api/v1/seller-items/:id - Update the seller item", async () => {

        // Arrange
        const updateBody = {
            sellerItem: {
                ...testSellerItemData1,
                productTitle: "Sample Product"
            }
        };

        // Act
        const response = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${testSellerItemData1.id}`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(updateBody)
            .expect(200);

        // Assert
        const {
            productTitle: actualProductTitle
        } = response.body as SellerItem;

        expect(actualProductTitle).toEqual("Sample Product");
    });

    it("PUT /api/v1/seller-items/:id - Add a Seller Organisation to the item", async () => {

        // Arrange
        const updateBody = {
            sellerItem: {
                ...testSellerItemData3,
                sellerOrganisationId: testSellerOrganisationBasicInformation1.id
            }
        };

        // Act
        const response = await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${testSellerItemData3.id}`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(updateBody)
            .expect(200);

        // Assert
        const {
            sellerOrganisationId: actualSellerOrganisationId
        } = response.body as SellerItem;

        // Get all item regardless of the status
        expect(actualSellerOrganisationId).toEqual(testSellerOrganisationBasicInformation1.id);
    });

    it("PUT /api/v1/seller-items/:id - Add unknown Seller Organisation to the item - FK constraint", async () => {

        // Arrange
        const updateBody = {
            sellerItem: {
                ...testSellerItemData3,
                sellerOrganisationId: testSellerOrganisationBasicInformation2.id
            }
        };

        // Act and Assert
        await request(server)
            .put(`${RequestHeaders.BASE_API_ENDPOINT}/${testSellerItemData3.id}`)
            .set(RequestHeaders.CSRF_TOKEN_FIELD, RequestHeaders.CSRF_TOKEN_VALUE)
            .set(RequestHeaders.CONTENT_TYPE_FIELD, RequestHeaders.CONTENT_TYPE_VALUE)
            .send(updateBody)
            .expect(500);
    });
});