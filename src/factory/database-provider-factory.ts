import { IDataBaseProvider } from "../interfaces/database-provider-interface";
import { PrismaProvider } from "../providers/database/prisma/prisma-provider";
import { SequelizeProvider } from "../providers/database/sequelize/sequelize-provider";

export class DatabaseFactory {
  static create(type: "sequelize" | "prisma", config: any): IDataBaseProvider {
    switch (type) {
      case "sequelize":
        return new SequelizeProvider(config);
      case "prisma":
        return new PrismaProvider(config);
      default:
        throw new Error(`Provider ${type} doesn't support.`);
    }
  }
}
