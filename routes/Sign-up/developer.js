const express = require('express');
const { registerDeveloper } = require('../../controllers/Sign-up/developer');
const handleUploads = require('../../middleware/upload');

const router = express.Router();




// router.post('/register', handleUploads, registerDeveloper);
// router.post('/register',upload.single('profile_picture'), registerDeveloper);
router.post(
    '/register',
    handleUploads.fields([
      { name: 'profile_picture', maxCount: 1 },
      { name: 'uploaded_cv', maxCount: 1 }
    ]),
    registerDeveloper
  );

// router.post('/register/developer', upload.single('profile_picture'), developerRegister);

module.exports = router;
