const express = require('express');
const router = express.Router();

const searchController = require('../controllers/SearchController');

router.get('/getSearchData', searchController.getSearchData);
router.post('/raise-view-exam', searchController.raiseViewExam);

module.exports = router;