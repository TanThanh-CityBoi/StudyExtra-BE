const express = require('express');
const router = express.Router();

const typeCategoryController = require('../controllers/typeCategoryController');

router.get('/', typeCategoryController.getAllTypeCategory);
router.post('/', typeCategoryController.addNewTypeCategory);
router.post('/:id', typeCategoryController.addNewTypeCategoryID);
router.put('/', typeCategoryController.editTypeCategory);
router.delete('/', typeCategoryController.deleteTypeCategory);

module.exports = router;