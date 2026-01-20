import express from 'express';
import { getTransactions, addTransaction, getMonthlyStats, getTransactionsByMonth, deleteTransaction, updateTransaction } from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getTransactions)
    .post(addTransaction);

router.route('/stats/:year/:month').get(protect, getMonthlyStats);

router.route('/:id')
    .delete(protect, deleteTransaction)
    .put(protect, updateTransaction);

export default router;
