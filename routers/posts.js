const express = require('express');
const router = express.Router();

const postsController = require('../controllers/PostsController');

router.get('/getAllPosts', postsController.getAllPosts);

module.exports = router;