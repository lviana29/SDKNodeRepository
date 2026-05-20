# @lviana29-solution/sdk-node-repository

An agnostic, type-safe Database Repository SDK built for Node.js applications. 

This SDK abstracts data persistence layers, allowing your application to seamlessly switch between **Prisma v7+** and **Sequelize v6+** without changing a single line of your core business logic or application use cases.

---

## 🚀 Features

* **100% Agnostic Core:** Your services talk to interfaces, not to specific ORMs.
* **Type-Safe Projections:** Perform complex joins and custom queries returning exactly the types your client API needs via `findCustom<T>()`.
* **Zero In-SDK Database Coupling:** Database drivers and ORMs are treated as peer dependencies, keeping the SDK ultra-lightweight.

---

## 📦 Installation

Install the SDK along with the ORM/Provider you plan to use in your client application. Since the SDK treats ORMs as peer dependencies, your application controls the installed versions.


### Install the core SDK
```bash
npm install @lviana29-solution/sdk-node-repository
```
### Install Peer Dependencies based on your target setup:

#### Option A: For Prisma Provider setup
```bash
npm install @prisma/client @prisma/adapter-mariadb
````

#### Option B: For Sequelize Provider setup
```
npm install sequelize mysql2
```
## 🛠️ Exposed Interfaces

The SDK exposes two main contracts that your application should rely on. These abstractions decouple your core business code from infrastructure specificities.

### 1. `IGenericRepository<TEntity>`
Handles standard CRUD data manipulation, custom client-driven query projections, and utility cleanup routines.

```typescript
export interface IGenericRepository<TEntity> {
  findById(id: string | number): Promise<TEntity null |>; [cite: 4]
  create(data: Partial<TEntity>): Promise<TEntity>; [cite: 4]
  update(id: string | number, data: Partial<TEntity>): Promise<TEntity>; [cite: 5]
  findCustom<TData TEntity>(queryName: string, options?: any): Promise<TData[]>; [cite: 5]
  clear(): Promise<void>; [cite: 5]
}
````

### 2. IDataBaseProvider

Manages the infrastructure connection lifecycles and controls repository instantiation.

```typescript
export interface IDataBaseProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getRepository<TEntity>(modelName: string): IGenericRepository<TEntity>;
}
```

## 💻 Usage Example

The following examples show how easily you can initialize the provider using the DatabaseFactory and perform agnostic database mutations.

### 1. Initializing the Provider Dynamically

You can alternate between ORMs dynamically using an environment variable or application configuration.

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { DatabaseFactory, IDataBaseProvider } from "@lviana29-solution/sdk-node-repository";
import { CustomerModel } from "./sequelize/customer.model"; // Your native Sequelize model

const providerType = (process.env.DB_PROVIDER || "sequelize").toLowerCase();
let dbProvider: IDataBaseProvider;

if (providerType === "prisma") {
  const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "production_db",
    port: 3306,
  });
  
  const prismaInstance = new PrismaClient({ adapter });

  dbProvider = DatabaseFactory.create("prisma", {
    clientInstance: prismaInstance,
  });
} else {
  dbProvider = DatabaseFactory.create("sequelize", {
    dialect: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "production_db",
    models: [CustomerModel],
    logging: false,
  });
}

// Establish the database infrastructure connection
await dbProvider.connect();
```

### 2. Standard CRUD Operations

```typescript
// Fetch the repository using a universal lowercase token string
const customerRepo = dbProvider.getRepository<{ id: number; name: string }>("customer");

// Create a record safely
const newCustomer = await customerRepo.create({ name: "User LastName" });
console.log("Saved object:", newCustomer);

// Find a record by its unique Identifier
const customer = await customerRepo.findById(newCustomer.id);
```

### 3. Advanced Custom Queries (findCustom)

The core architectural benefit is that business rules and projection types stay with the client API, while the repository execution remains decoupled.

```typescript
// Define your specific context view model interface in your client API
interface CustomerClientModel {
  id: number;
  name: string;
}

// Build native ORM filter parameters based on the active provider
const queryOptions = process.env.DB_PROVIDER === "prisma"
  ? {
      where: { name: { contains: "User" } },
      select: { id: true, name: true } // Native Prisma Selection object
    }
  : {
      where: { name: "User LastName" },
      attributes: ["id", "name"] // Native Sequelize Selection array
    };

// Execute findCustom passing your targeted interface type via Generics <>
const customList = await customerRepo.findCustom<CustomerClientModel>(
  "fetchFilteredCustomers",
  queryOptions
);

// Fully typed autocomplete directly accessible via your IDE
if (customList.length > 0) {
  console.log(`Type-safe client API access -> Name: ${customList[0].name}`);
}
```

## 🧼 Cleaning up data (Testing/Demo environments)

To wipe table rows during test runs without breaking database foreign key constraints or triggering destructive drop/re-creation table events, call the built-in abstraction:

```typescript
// Safely executes a non-destructive DML delete under the hood for both ORMs
await customerRepo.clear();
```

## 🧪 Running the Demo Environment Local Build

If you are developing or evaluating the project layout locally inside the repository structure, follow these execution commands:

### 1. Setting up Environment Variables
Create a .env configuration file inside the demo/ folder structure to control the execution provider targets:

```
# demo/.env
DB_PROVIDER=prisma
DB_HOST=yourDBHost
DB_PORT=3306
DB_USER=yourUserDB
DB_PASSWORD=yourPassword
DB_NAME=yourDBName
```

### 2. Execution Command Pipelines
Run the build script commands via terminal to compile dependencies and trigger the sandbox execution script:

```bash
# Generate the necessary Prisma local client definitions
npx prisma generate

# Compile the TypeScript SDK module exports
npm run build

# Execute the self-contained demo runner script using ts-node
npm run demo
```

## 📄 License

Distributed under the MIT License. See LICENSE for more information.