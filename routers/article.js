const express = require('express');
const router = express.Router();

const ArticleController = require('../controllers/ArticleController');

router.get('/', ArticleController.getAllArticles);
router.post('/', ArticleController.addArticles);
router.put('/', ArticleController.editArticle);
router.delete('/', ArticleController.deleteArticles);

router.post('/comment', ArticleController.addBigComment);
router.delete('/comment', ArticleController.deleteBigComment);
router.put('/comment', ArticleController.editBigComment);

router.post('/comment/hide', ArticleController.hideBigComment);
router.post('/comment/show', ArticleController.showBigComment);
router.post('/comment/interaction', ArticleController.interactBigComment);
router.delete('/comment/interaction', ArticleController.unLikeBigComment);

router.post('/comment/reply', ArticleController.addReplyComment);
router.delete('/comment/reply', ArticleController.deleteReplyComment);
router.put('/comment/reply', ArticleController.editReplyComment);

router.post('/comment/reply/interaction', ArticleController.likeReplyComment);
router.delete('/comment/reply/interaction', ArticleController.unlikeReplyComment);
router.post('/comment/reply/hide', ArticleController.hideReplyComment);
router.post('/comment/reply/show', ArticleController.showReplyComment);

router.post('/interaction', ArticleController.interactArticle);
router.delete('/interaction', ArticleController.unlikeArticle);

router.post('/interaction-list', ArticleController.getArticleInteractionList);
router.post('/comment/interaction-list', ArticleController.getCommentInteractionList);

module.exports = router;