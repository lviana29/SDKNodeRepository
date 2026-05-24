import { PrismaClient } from "@prisma/client/extension";
import { IDataBaseProvider } from "../../../interfaces/database-provider-interface";
import { IGenericRepository } from "../../../interfaces/generic-repository-interface";
import { PrismaGenericRepository } from "./prisma-generic-repository";

export class PrismaProvider implements IDataBaseProvider {
  private prisma: PrismaClient;

  constructor(config: any) {
    if (!config.clientInstance) {
      throw new Error(
        "PrismaProvider needs to 'clientInstance' valid in options.",
      );
    }
    this.prisma = config.clientInstance;
  }

  async connect(): Promise<void> {
    await this.prisma.$connect();
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  getRepository<TEntity>(modelName: string): IGenericRepository<TEntity> {
    if (!this.prisma[modelName.toLowerCase()]) {
      throw new Error(`Model [${modelName}] not found on PrismaClient.`);
    }
    return new PrismaGenericRepository<TEntity>(this.prisma, modelName);
  }

  async transaction<T>(work: (t: any) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(async (tx: any) => {
      return await work(tx);
    });
  }
}
