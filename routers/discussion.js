const express = require('express');
const router = express.Router();

const DiscussionController = require('../controllers/DiscussionController');

router.get('/', DiscussionController.getAllArticles);
router.get('/:id', DiscussionController.getCurrentDiscussionByID);
router.post('/', DiscussionController.addArticles);

router.post('/comment', DiscussionController.addBigComment);
router.delete('/comment', DiscussionController.deleteBigComment);
router.put('/comment', DiscussionController.editBigComment);

router.post('/comment/hide', DiscussionController.hideBigComment);
router.post('/comment/show', DiscussionController.showBigComment);
router.post('/comment/interaction', DiscussionController.interactBigComment);
router.delete('/comment/interaction', DiscussionController.unLikeBigComment);

router.post('/comment/reply', DiscussionController.addReplyComment);
router.delete('/comment/reply', DiscussionController.deleteReplyComment);
router.put('/comment/reply', DiscussionController.editReplyComment);

router.post('/comment/reply/interaction', DiscussionController.likeReplyComment);
router.delete('/comment/reply/interaction', DiscussionController.unlikeReplyComment);
router.post('/comment/reply/hide', DiscussionController.hideReplyComment);
router.post('/comment/reply/show', DiscussionController.showReplyComment);

router.post('/interaction', DiscussionController.interactArticle);
router.delete('/interaction', DiscussionController.unlikeArticle);

router.post('/interaction-list', DiscussionController.getArticleInteractionList);
router.post('/comment/interaction-list', DiscussionController.getCommentInteractionList);

module.exports = router;