const express = require('express');
const router = express.Router();
const dashboatrdController = require('../controllers/dashboardController');


router.get('/', dashboatrdController.dashboard);

module.exports = router;