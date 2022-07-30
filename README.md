# EEZEE Internal Souring Tool Server  ![typescript](https://badges.frapsoft.com/typescript/code/typescript.png?v=101)

Services Testing 

![test-badges](/test/unit/services/coverage/badge-branches.svg)
![test-badges](/test/unit/services/coverage/badge-functions.svg)
![test-badges](/test/unit/services/coverage/badge-lines.svg)
![test-badges](/test/unit/services/coverage/badge-statements.svg)

![pernimg](https://www.freecodecamp.org/news/content/images/size/w2000/2020/03/PERN.png)

This project is the using the [PERN Stack](https://www.freecodecamp.org/news/learn-the-pern-stack-full-course/) to build the Web Application for the Eezee Internal Sourcing Tool. 
In this respository, Node.js and Express is used to build our RESTFul API

For Eezee Internal Souring Tool Frontend, please visit: https://github.com/jaspersorrio/eezee-internal-sourcing-tool-frontend

<b>[Table of Contents](https://ecotrust-canada.github.io/markdown-toc/)</b>
* [Project Installation](#project-installation)
	+ [Environment Configuration](#environment-configuration)
	+ [Postgres Setup](#postgres-setup)

This are some of the link that can be explore to be familiarise with the project

| Link                                                                                                                       | Description                                             |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
|  [Prisma Documentation](https://www.prisma.io/docs/)                                                                       | Prisma Documentation on their relations and history     |
|  [Prisma ERD](https://prisma-erd.simonknott.de/)                                                                           | Copy and Paste the model created to generate the ERD    |
|  [Prisma Modelling](https://www.prisma.io/blog/backend-prisma-typescript-orm-with-postgresql-data-modeling-tsjs1ps7kip1)   | Prisma Basic and Modelling                              |
|  [Postgres Documentation](https://www.postgresql.org/)                                                                     | Postgres Documentation on their query                   |

## Installation
Assuming you have downloaded all the application/extension, you can proceed to
* [Window Terminal, Postgres SQL, GitHubSSH and Node JS Setup](/docs/window-terminal-postgres-node-js-setup.md)

### IDE / Application Download 
Ensure that you have the following application downloaded
* [VS Code](https://code.visualstudio.com/) (Optional)
* [pgAdmin](https://www.pgadmin.org/) (Optional)
* [Postman](https://www.postman.com/) (API Testing)(Optional)
* [Docker](https://www.docker.com/)

### Environment Configuration Download
To setup our environment, download the following application/ extension

| Name                                                                              | Description                                                                                                                        |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
|  [Window Terminal](https://docs.microsoft.com/en-us/windows/terminal/install)     | To access our operating system in linux.                                                                                           |
|  [Ubuntu LTS](https://www.microsoft.com/store/productId/9N6SVWS3RX71)             | The operating system that we will be working on                                                                                    |
|  [WSL2](https://docs.microsoft.com/en-us/windows/wsl/install-win10)               | <ul><li>Follow the steps for the installation</li><li>If you have any issues of downloading, please reboot your computer</li></ul> |
|   VS Code Extension                                                               | <ul><li>WSL extension</li><li>Eslint</li><li>Prisma</li></ul>                                                                      |

## Prisma
Here are some commands that might be useful

Reset database with seeding
```bash
npx prisma migrate reset
```

Rest database without seeding
```bash
npx prisma migrate reset --skip-seed
```


## Testing

Jest will be used for doing Unit and API Testing

[Install jest packages](https://basarat.gitbook.io/typescript/intro-1/jest)

```bash
npm i jest @types/jest ts-jest typescript -D
```

Jest can find the following file in this format
* Files with .ts suffix in `__tests__` folders.
* Files with .test.ts suffix.
* Files with .spec.ts suffix.

However we will be creating a folder "test" with the filename as <filename>.test.ts

![jest_2](/docs/jest/test_1.PNG)![jest_2](/docs/jest/test_2.PNG)

| Normal File | Test File   |
| ----------- | ----------- |
| foo.ts      | foo.test.ts |

Update the `package.json` with the following configuration

`testPathIgrnorePatterns` is able to ignore the by specifying the folder/files path
```jsx
"jest": {
	"testPathIgnorePatterns": [
		"test/unit/routes"
	]
}
```
```jsx
"scripts": {
	"test": "jest -i"
}
```

### Unit Testing
Testing of individual function is important as it give the confidence and reliability of the code

To create a test case, you can either
```jsx
/* Create it as an individual test case*/
it("Delete Main and Sub Category", async () => {

	const promiseTransactionResults = await MainCategorySvc.deleteAll();
	expect(promiseTransactionResults)
		.toEqual(2);
});

/* Group the test case together into a test suite by `describe` */

describe("Delete Test Suite", () => {

    it("Delete Main and Sub Category", async () => {

        const promiseTransactionResults = await MainCategorySvc.deleteAll();
        expect(promiseTransactionResults)
            .toEqual(2);
    });
});
```

`expect` require the variables input while `toEqual` is the `matchers` to validate the input variable. More matchers validator can be found [here](https://jestjs.io/docs/expect)

Run `npm test` or `npm run test` to check all test files
![jest_3](/docs/jest/test_3.PNG)

Run the following command for individual file testing
```bash
npx jest test/unit/services/category-log.test.ts
```

You can read more on the [documentation](https://jestjs.io/docs/getting-started) to find out more.

### API Testing
[Documentation Link](https://dev.to/nedsoft/testing-nodejs-express-api-with-jest-and-supertest-1km6)

To test the server, "supertest" is used to test the API
```bash
npm install --save-dev supertest
```

In the test files, the server is required to be setup first before testing
```jsx
import server, {
    setupHttpServer
} from "../../../../src/http-server";
```

`setupHttpServer` will start the port server while `server` will be used to pinpoint to the server


### Testing Badges

	
## Code Convention 

- Please ensure that your naming convention is understandable by other user
	-	For instance, "updatedBy" should be "updatedByUserName"
	
	
## Pagination
The code fetches and return the data that is required for the pagination

### Configuration
Pagination is a standard features across the web development. For this development, we will be breaking it the different query,
and combine them at the end of the function

The mechanism that is required would be 

|   Options        |  Required  | Descriptions                                                                                                                                                         |
| ---------------- | ---------- |--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   page           |    Yes     | <ul><li>pageNumber : The current page </li><li> pageSize: The total records to display in the page </li></ul>                                                        |
|   sort           |    No      | <ul><li>columnKey : The key for the order to sort </li><li> sortOrder: The order is either in "asc" | "desc" </li></ul>                                              |
|   include        |    No      | Include query represent the additional information or join table that you are trying to retrieve from. This is more towards the returning of the data to the client  |
|   filter         |    No      | Filter query is the "where" query in prisma when the user is searching for a particular products                                                                     |
|   searchParam    |    No      | This is the search filter where it will be included inside the filter                                                                                                |

This is what should be inside the parameter
```jsx
  options: {
            filter?: Prisma.SellerItemWhereInput,
            include?: Prisma.SellerItemInclude,
            searchParam?: string,
            page: { pageNumber: string, pageSize: string },
            sort?: { columnKey: string, sortOrder: string }
        }
```
The setting of the code strucutre should be follow in this order:

- whereQuery - Prisma.WhereInput
```jsx
  /* SETUP WHERE QUERY */
        let whereQuery: Prisma.SellerItemWhereInput = {
            ...options.filter
        };
     
        /* IF SEARCH PARAM EXIST */
        if (options.searchParam) {
            whereQuery = {
                ...whereQuery,
                OR: [ {
                    productTitle: {
                        contains: options.searchParam,
                        mode:     "insensitive"
                    }
                },
                {
                    brandModel: {
                        contains: options.searchParam,
                        mode:     "insensitive"
                    }
                },
                {
                    modelNumber: {
                        contains: options.searchParam,
                        mode:     "insensitive"
                    }
                },
                {
                    SellerOrganisation: {
                        companyName: {
                            contains: options.searchParam,
                            mode:     "insensitive"
                        }
                    }
                }
                ]
            };
        }
```

- recordToSkip - The formula to calculate the page to skip would be (pageNumber - 1) * pageSize, "-1" is because the starting index for page one is 0
- prismaQuery - Prisma.FindManyArgs including the query to include
```jsx
const prismaQuery: Prisma.SellerItemFindManyArgs = {
	where: whereQuery,
	skip:  recordsToSkip,
	take:  pageSize,
};
```

- orderBy - To sort according to asc | desc. You can add conditional sorting if the parameter does not fit your sort
```jsx
if (options.sort && options.sort.columnKey && options.sort.sortOrder) {
	let _sellerItemKey = options.sort.columnKey as keyof T_SellerItem;

	switch (_sellerItemKey) {
	case "productTitle":
		_sellerItemKey = "productTitleUpperCase";
		break;
	case "modelNumber":
		_sellerItemKey = "modelNumberUpperCase";
		break;
	case "brandModel":
		_sellerItemKey = "brandModelUpperCase";
		break;
	}

	prismaQuery.orderBy = {
		[_sellerItemKey]: options.sort.sortOrder
	};
}
```
- include - To add the data that you want to include in your result
```jsx
if (options.include) {
	prismaQuery.include = options.include;
}
```

At the end of the query 
You should be returning
- dataset
- total count

|   Result      |   Descriptions                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
|   record      |  The records that was fetched from the database                                                              |
|   count       |  The total number that was fetched from the database. This is for the page number in the client side         |

```jsx
const [ _sellerItems, totalRecordCount ]: [SellerItem[], number] = await Promise.all([
	prisma.sellerItem.findMany(prismaQuery),
	prisma.sellerItem.count({
		where: whereQuery
	})
]);
```

### Routes/*.ts

The standard way of organising the the import
```jsx
/* STANDARD NODE MODULES */

/* DB */

/* ROUTES */

/* MIDDLEWARE */

/* SERVICES */

/* CONFIG & UTILS */

/* TYPES */
```

### Services/*.ts

The standard way of organising the the import

```jsx
/* NODE MODULES */

/* DB */

/* SERVICES */

/* CONFIG & UTILS */

/* TYPES */
```


# Design
Ant Design

[Documentation](https://ant.design/)
[Github Repository](https://github.com/ant-design/ant-design)

https://dev.to/burhanuday/using-ant-design-with-nextjs-custom-variables-for-ant-design-57m5
```bash
npm install --save antd@4.15.6
```

Version 4.15.6


# Ant Design 
Total coloumn span is 24


CSS
DO NOT USE FLEX

Pagination how it should work in the server side,
- Break down to different component and query it at the end of the line
- Understand the different options that the page need and set the configuration accordingly
- At the client side, do not try to hardcode the thing like the default sorting, page row/ page number
- Manipulate the state well

Client Side API
- Do not try to fetch multiple time
- Instead of fetching multiple time, remove any duplication and fetch
- Hashmap(map in js) is better than array because it doesn't need to tranverse the whole array

Pagination take what we need from the server
Why do we use server side pagination instead of client side pagination
- The client side table is using the google ram memory to store the data, this will cause the lag
- Instead of using the client side table, we will use the server and take what we needed
- This will be faster because this will depend on the latency instead of jamming the web browser (is this correct?)

Loading UX
- Purposely set a delay to prevent the shock from the user
- A human eye will take estimate 300 second to recover

## Naming Convention

- https://betterprogramming.pub/zen-naming-convention-5314aa0ab67a
- https://docs.microsoft.com/en-us/dynamicsax-2012/developer/naming-conventions-methods

Imperative naming is allowed when necessary

| Prefix     | Description                                                                                                                                                                                                                                                               | Examples                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| do         | Used when you are using a debounce for the function                                                                                                                                                                                                                       | doSearchSellerItem                     |
| set        | When we are trying to set the state of the components or data, else wise                                                                                                                                                                                                  | setSellerItemDataSource                |
| get        | When the data is required to retrieve from the server                                                                                                                                                                                                                     | getSellerItem                          |
| getAndSet  | The data is retrieved from the server, and the state is being set                                                                                                                                                                                                         | getAndSetSellerItemDataSource          |
| is         | <ul><li>Boolean naming convention should be positive</li><li>Instead of "isDisabled", it should become "isEnabled"</li><li>Instead of "isUndefined", it should become "isDefined"</li><ul>                                                                                | isPhoneNumberExists                    |
| handle     | <ul><li>When using react component event handlers, should append handle. E.g. handleOnClick, handleOnChange</li><li>To specify the different button to be used, please add handleOnClick\<Components\>\<Type\>Event, E.g. handleOnChangeDropDownCategoriesEvent</li></ul> | handleOnChangeDropDownCategoriesEvent  |
| validate   | When you are trying to validate an input or object                                                                                                                                                                                                                        | valiadteInputFields                    |

/* NODE MODULES */

/* CONTEXT */

/* UI COMPONENTS */

/* SERVICES */

/* UTILS & CONFIG */

/* TYPES */


