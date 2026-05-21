import { Sequelize } from "sequelize";
import { IDataBaseProvider } from "../../../interfaces/database-provider-interface";
import { IGenericRepository } from "../../../interfaces/generic-repository-interface";
import { SequelizeGenericRepository } from "./sequelize-generic-repository";

export class SequelizeProvider implements IDataBaseProvider {
  private instance: Sequelize;

  constructor(config: any) {
    const { models, ...sequelizeOptions } = config;
    this.instance = new Sequelize(sequelizeOptions);

    if (models && Array.isArray(models)) {
      for (const model of models) {
        if (typeof model.initialize === "function") {
          model.initialize(this.instance);
        } 
      }

      // associate
      for (const model of models) {
        if (typeof model.associate === "function") {
          model.associate(this.instance.models);
        }
      }
    }
  }

  async connect(): Promise<void> {
    await this.instance.authenticate();
    await this.instance.sync({ alter: true });
  }

  async disconnect(): Promise<void> {
    await this.instance.close();
  }

  getRepository<TEntity>(modelName: string): IGenericRepository<TEntity> {
    const key = Object.keys(this.instance.models).find(
      (m) => m.toLowerCase() === modelName.toLowerCase(),
    );

    const model = key ? this.instance.models[key] : null;

    return new SequelizeGenericRepository<TEntity>(model);
  }
}
