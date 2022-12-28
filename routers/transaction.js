const express = require('express');
const {AuthMiddleware} = require('../helper/JWT');
const router = express.Router();

const TransactionController = require('../controllers/TransactionController');

router.get('/getAllTransaction', TransactionController.getAllTransaction)
router.post('/createDepositRequest', AuthMiddleware,  TransactionController.createDepositRequest);
router.get('/getUserTransaction',  AuthMiddleware,   TransactionController.getUserTransaction);
router.get('/getDepositeGemRequest',   TransactionController.getDepositeGemRequest);
router.put('/delete/:id', TransactionController._delete)
router.put('/confirm/:id', TransactionController.confirm)
module.exports = router;