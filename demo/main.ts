// demo/main.ts
/// <reference types="node" />
require("dotenv").config({ path: "demo/.env" });
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import { DatabaseFactory } from "../src/factory/database-provider-factory";
import { IDataBaseProvider } from "../src/interfaces/database-provider-interface";
import { CustomerModel } from "./sequelize/customer.model";
async function runDemo() {
  console.log("DB_PROVIDER do env: ", process.env.DB_PROVIDER);
  const providerType = (
    process.env.DB_PROVIDER || "sequelize"
  ).toLowerCase() as "sequelize" | "prisma";

  console.log(
    `\n🚀 Initializing environment using provider: [${providerType.toUpperCase()}]`,
  );

  let dbProvider: IDataBaseProvider;

  const dbUser = process.env.DB_USER || "root";
    const dbPassword =
      process.env.DB_PASSWORD === "''" || process.env.DB_PASSWORD === '""'
        ? ""
        : process.env.DB_PASSWORD || "";
    const dbHost = process.env.DB_HOST || "127.0.0.1";
    const dbPort = process.env.DB_PORT || 3306;
    const dbName = process.env.DB_NAME || "sdk_demo_db";

  // 2. Conditional initialization for technology infrastructure
  if (providerType === "prisma") {
    

    const connectionUrl =
      process.env.DATABASE_URL ||
      `mysql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

    const adapter = new PrismaMariaDb({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      port: 3306,
      database: dbName,
      connectionLimit: 5,
    });

    // 4. Construtor 100% limpo padrão Prisma v7. Sem propriedades fantasmas!
    const prismaInstance = new PrismaClient({ adapter });

    dbProvider = DatabaseFactory.create("prisma", {
      clientInstance: prismaInstance,
    });
  } else {
    dbProvider = DatabaseFactory.create("sequelize", {
      dialect: "mysql",
      host: dbHost,
      port: 3306,
      username: dbUser,
      password: dbPassword,
      database: dbName,
      models: [CustomerModel],
      logging: false,
    });
  }

  try {
    // 1. Connect to database
    await dbProvider.connect();
    console.log("✅ Conexão estabelecida com sucesso!");

    // 4. Demo code (100% abstract for both!)
    // We need send 'customer' (table name) parameter string that used by universal token for both ORM's
    const customerRepo = dbProvider.getRepository<{ id: number; name: string }>(
      "customer",
    );

    // 🧼 Example to clean table (only for demo). It does'n matter for ORM!
    await customerRepo.clear();
    console.log("🧹 Tabela customer resetada com sucesso via SDK.");

    // Testing insert by SDK
    const createdUser = await customerRepo.create({
      name: "NameUser Lastname (Via SDK)",
    });
    console.log("📦 Object have saved on database:", createdUser);

    // Testing find by id using SDK
    const foundUser = await customerRepo.findById(createdUser.id);
    console.log("🔍 Object have got on database by identifier:", foundUser);

    console.log("\n🧪 Executing custom find using custom types...");

    // Here we need build filter rules basead on active ORM
    // In real world, your api knows what ORM is using.
    const queryOptions =
      providerType === "prisma"
        ? {
            where: { name: { contains: "NameUser" } },
            select: { id: true, name: true },
          }
        : {
            where: { name: "NameUser Lastname (Via SDK)" },
            attributes: ["id", "name"],
          };

    // We need call the metod passing it interface CustomerClientModel on Generics<>.
    const customList = await customerRepo.findCustom<CustomerClientModel>(
      "fetchFilteredCustomers",
      queryOptions,
    );

    console.log("✨ Result of findCustom (Total:", customList.length, "):");
    console.log(customList);

    if (customList.length > 0) {
      console.log(
        `🔒 Get result model -> Name: ${customList[0].name}`,
      );
    }
    // =========================================================================
  } catch (error) {
    console.error("❌ Failed on execution demo app:", error);
  } finally {
    
    await dbProvider.disconnect();
    console.log("🔌 Connection closed.\n");
  }
}

runDemo();
