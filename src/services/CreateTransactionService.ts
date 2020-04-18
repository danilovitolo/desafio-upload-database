import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);

    let findCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!findCategory) {
      findCategory = await categoryRepository.save({
        title: category,
      });
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome') {
      if (balance.total - value < 0) {
        throw new AppError('Balance error');
      }
    }

    const transaction = transactionsRepository.save({
      title,
      value,
      type,
      category_id: findCategory.id,
    });

    return transaction;
  }
}

export default CreateTransactionService;
