import express from 'express';
import { getAccounts, getAccountById, createAccount, updateAccount, deleteAccount, transferBetweenAccounts } from '../controllers/accountController.js';

const router = express.Router();

router.get('/', getAccounts)
router.get('/:id', getAccountById)
router.post('/', createAccount)
router.put('/:id', updateAccount)
router.delete('/:id', deleteAccount)
router.post('/transfer', transferBetweenAccounts)

export default router;