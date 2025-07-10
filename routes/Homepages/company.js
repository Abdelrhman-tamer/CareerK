const express = require('express'); 
const router = express.Router();
const { authenticateUser, authorize } = require('../../middleware/authMiddleware');
const companyHomeController = require('../../controllers/Homepages/company');

// ✅ GET company homepage (title, industry, available & recent developers)
router.get('/homepage', authenticateUser, companyHomeController.getCompanyHomepage);

// ✅ GET uploaded and generated CV for a developer
router.get('/:developerId/cv', authenticateUser, companyHomeController.getDeveloperCvController);

// ✅ GET detailed job application info for a specific application
router.get('/application/:applicationId', authenticateUser, companyHomeController.getApplicationDetailsController);

module.exports = router;
