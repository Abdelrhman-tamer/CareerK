const express = require('express');
const router = express.Router();

const serviceApplicationsController = require('../../controllers/jobs-services/service-Application');
const { authenticateUser, authorize } = require('../../middleware/authMiddleware');
const upload = require('../../middleware/upload');

// 🔹 Developer applies to a service post
router.post('/apply', authenticateUser, authorize('developer'), upload.single('uploaded_cv'), serviceApplicationsController.applyToServicePost);

// 🔹 Customer views applications for a service post
router.get('/post/:service_post_id', authenticateUser, authorize('customer'), serviceApplicationsController.getApplicationsForServicePost);

// 🔹 Get single application (dev, customer, or admin)
router.get('/:id', authenticateUser, authorize('developer', 'customer'), serviceApplicationsController.getApplicationById);

// 🔹 Developer deletes an application
router.delete('/:id', authenticateUser, authorize('developer'), serviceApplicationsController.deleteApplication);

// 🔹 Update application status 
router.patch('/:id/status', authenticateUser, serviceApplicationsController.updateApplicationStatus);

module.exports = router;
