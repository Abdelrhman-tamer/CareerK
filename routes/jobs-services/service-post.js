const express = require('express');
const router = express.Router();

const {
    createServicePost,
    getAllServicePosts,
    getServicePostById,
    updateServicePost,
    deleteServicePost,
    getRecentlyPostedServices
} = require('../../controllers/jobs-services/service-post');

const servicePostsController = require('../../controllers/jobs-services/service-post');

// Auth middlewares (adjust paths based on your setup)
const { authenticateUser } = require('../../middleware/authMiddleware');

// 🔹 Create a new service post (customer only)
router.post('/create', authenticateUser, createServicePost);

// 🔹 Get all service posts (public)
router.get('/get-service-posts', getAllServicePosts);

// 🔹 Get single service post by ID (public)
router.get('/:id', getServicePostById);

// 🔹 Update a service post (customer only)
router.put('/:id', authenticateUser, updateServicePost);

// 🔹 Delete a service post (customer only)
router.delete('/:id', authenticateUser, deleteServicePost);

// Get recently posted services
router.get('/filter/recently-posted', getRecentlyPostedServices);

module.exports = router;
