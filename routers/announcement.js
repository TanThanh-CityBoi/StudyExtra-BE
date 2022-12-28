
const express = require('express');
const router = express.Router();
const AnnouncementController = require('../controllers/AnnouncementController');
const { AuthMiddleware } = require('../helper/JWT');
router.get('/getAllAnnouncement', AuthMiddleware ,AnnouncementController.getAllAnnouncement);
router.post('/add-new-announcement', AnnouncementController.createAnnouncement)
router.post('/delete-announcement', AnnouncementController.deleteAnnouncement)
router.post('/update-announcement', AnnouncementController.updateAnnouncement)
router.get('/:slug', AnnouncementController.getOneAnnoucement)

module.exports = router;