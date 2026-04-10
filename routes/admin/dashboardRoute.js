const express = require('express');
const router = express.Router();
const dashboatrdController = require('../../controllers/admin/dashboardController');
const upload = require('../../utils/multer')


router.get('/dashboard', dashboatrdController.dashboard);
router.get('/profile', dashboatrdController.profile);
router.put('/profile', upload('admins').single('image'), dashboatrdController.updateProfile);


module.exports = router;