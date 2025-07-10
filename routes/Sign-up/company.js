const express = require('express');
const { registerCompany } = require('../../controllers/Sign-up/company');
const handleUploads = require('../../middleware/upload');

const router = express.Router();

// router.post('/register',upload.single('profile_picture'), registerCompany);
router.post(
    '/register',
    handleUploads.fields([
      { name: 'profile_picture', maxCount: 1 }
    ]),
    registerCompany
  );
// router.post('/register', registerCompany);

module.exports = router;