const express = require('express');
const router = express.Router();

const documentController = require('../controllers/DocumentController');

router.get('/', documentController.getAllDocument);
router.get('/:id', documentController.getDocumentByID);
router.post('/', documentController.addNewDocument);
router.post('/increasing-view', documentController.increasingViewDocument);
router.delete('/', documentController.deleteDocuments);
router.put('/', documentController.editDocument);
module.exports = router; 