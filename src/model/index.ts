import { ClientSession, Model as MongooseModel, UpdateQuery } from 'mongoose';
import { getFilterQuery, getSearchQuery } from '../util/query';

export class Model<T> {
  private readonly model: MongooseModel<T>;

  constructor(value: MongooseModel<T>) {
    this.model = value;
  }

  createOne = async (data: Omit<T, '_id'>, option?: { transaction?: ClientSession }): Promise<T> => {
    const [item] = await this.createMany([data], { transaction: option?.transaction });
    return item;
  };

  createMany = async (dataList: Omit<T, '_id'>[], option?: { transaction?: ClientSession }): Promise<T[]> => {
    return this.model.create(dataList, { session: option?.transaction });
  };

  readOne = async (condition: Partial<T>, option?: { transaction?: ClientSession }): Promise<T | null> => {
    return this.model.findOne(getFilterQuery(condition), null, { session: option?.transaction });
  };

  updateOne = async (
    condition: NotEmpty<T>,
    data: Partial<T>,
    option?: { transaction?: ClientSession },
  ): Promise<number> => {
    const result = await this.model.updateOne(getFilterQuery(condition), data as UpdateQuery<T>, {
      session: option?.transaction,
    });
    return result.nModified;
  };

  updateMany = async (
    condition: NotEmpty<T>,
    data: Partial<T>,
    option?: { transaction?: ClientSession },
  ): Promise<number> => {
    const result = await this.model.updateMany(getFilterQuery(condition), data as UpdateQuery<T>, {
      session: option?.transaction,
    });
    return result.nModified;
  };

  deleteOne = async (condition: NotEmpty<T>, option?: { transaction?: ClientSession }): Promise<number> => {
    const result = await this.model.deleteOne(getFilterQuery(condition), { session: option?.transaction });
    return result.deletedCount || 0;
  };

  deleteMany = async (condition: NotEmpty<T>, option?: { transaction?: ClientSession }): Promise<number> => {
    const result = await this.model.deleteMany(getFilterQuery(condition), { session: option?.transaction });
    return result.deletedCount || 0;
  };

  count = async (condition: Partial<T>, option?: { transaction?: ClientSession }): Promise<number> => {
    return this.model.countDocuments(getFilterQuery(condition)).session(option?.transaction || null);
  };

  list = async (
    condition: Partial<T>,
    option?: { transaction?: ClientSession; skip?: number; limit?: number },
  ): Promise<T[]> => {
    const { skip, limit, transaction } = option || {};

    return this.model.find(getFilterQuery(condition), null, { skip, limit, session: transaction });
  };

  listDetail = async (
    condition: SearchCondition,
    option?: { transaction?: ClientSession; skip?: number; limit?: number },
  ): Promise<T[]> => {
    const { skip, limit, transaction } = option || {};

    return this.model.find(getSearchQuery(condition), null, { skip, limit, session: transaction });
  };

  countDetail = async (condition: CountSearchCondition, option?: { transaction?: ClientSession }): Promise<number> => {
    return this.model.countDocuments(getSearchQuery(condition)).session(option?.transaction || null);
  };
}
