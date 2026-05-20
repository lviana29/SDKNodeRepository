import { IGenericRepository } from "../../../interfaces/generic-repository-interface";

export class PrismaGenericRepository<
  TEntity,
> implements IGenericRepository<TEntity> {
  constructor(
    private prismaClient: any,
    private modelName: string,
  ) {}

  private get dbModel() {
    return this.prismaClient[this.modelName.toLowerCase()];
  }

  async findById(id: string | number): Promise<TEntity | null> {
    const parsedId =
      typeof id === "string" && !isNaN(Number(id)) ? Number(id) : id;

    const record = await this.dbModel.findUnique({
      where: { id: parsedId },
    });

    return record as TEntity | null;
  }

  async create(data: Partial<TEntity>): Promise<TEntity> {
    const record = await this.dbModel.create({
      data: data,
    });
    return record as TEntity;
  }

  async update(id: string | number, data: Partial<TEntity>): Promise<TEntity> {
    const parsedId =
      typeof id === "string" && !isNaN(Number(id)) ? Number(id) : id;

    const record = await this.dbModel.update({
      where: { id: parsedId },
      data: data,
    });
    return record as TEntity;
  }

  async findCustom<TData = TEntity>(
    queryName: string,
    options?: any,
  ): Promise<TData[]> {
    const result = await this.dbModel.findMany({
      ...options,
    });

    return result as unknown as TData[];
  }

  async clear(): Promise<void> {
    await this.dbModel.deleteMany({});
  }

  async delete(id: string | number): Promise<void> {
    typeof id === "string" && !isNaN(Number(id)) ? Number(id) : id;

    await this.dbModel.delete({
      where: { id },
    });
  }
}
