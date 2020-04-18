import path from 'path';
import fs from 'fs';
import csv from 'csv-parse';
import Transaction from '../models/Transaction';

import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

interface TransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(csvFileName: string): Promise<Transaction[]> {
    const csvFile = path.join(uploadConfig.directory, csvFileName);
    const createTransactionService = new CreateTransactionService();

    const transactions: TransactionDTO[] = [];
    const transactionsCreated: Transaction[] = [];

    const stream = fs
      .createReadStream(csvFile)
      .pipe(csv({ columns: true, from_line: 1, trim: true }));

    stream.on('data', row => {
      transactions.push(row);
    });

    await new Promise(resolve => {
      stream.on('end', resolve);
    });

    // eslint-disable-next-line no-restricted-syntax
    for (const item of transactions) {
      // eslint-disable-next-line no-await-in-loop
      const transactionAdd = await createTransactionService.execute(item);
      transactionsCreated.push(transactionAdd);
    }

    return transactionsCreated;
  }
}

export default ImportTransactionsService;
