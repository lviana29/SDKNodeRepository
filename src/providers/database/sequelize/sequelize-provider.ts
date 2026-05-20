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
        } else if (typeof model.init === "function") {
          // Caso contrário, tenta rodar o init nativo do Sequelize
          // Para o Sequelize puro funcionar aqui com os decorators, ele precisaria do mapeamento básico.
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
