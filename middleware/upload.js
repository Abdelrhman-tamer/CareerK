const multer = require('multer');
const path = require('path');
const fs = require('fs');


const ensureFolderExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};


const MIME_TYPES = {
  profile_picture: ['image/jpeg', 'image/png', 'image/jpg'],
  uploaded_cv: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  chat_file: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4',
    'video/quicktime',
    'audio/mpeg',
    'audio/mp4',
    'audio/ogg'
  ]
};

const getUploadFolder = (fieldname) => {
  const folders = {
    profile_picture: 'uploads/profile_pictures',
    uploaded_cv: 'uploads/cvs',
    chat_file: 'uploads/chat_files'
  };
  return folders[fieldname];
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = getUploadFolder(file.fieldname);
    if (!folder) return cb(new Error('Invalid fieldname'), null);

    ensureFolderExists(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = MIME_TYPES[file.fieldname];
  if (allowedTypes && allowedTypes.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error(`Invalid file type for ${file.fieldname}`), false);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;









// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Ensure folder exists
// const ensureUploadFolderExists = (folderPath) => {
//   if (!fs.existsSync(folderPath)) {
//     fs.mkdirSync(folderPath, { recursive: true });
//   }
// };

// // === Define storage ===
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     let folder;
//     if (file.fieldname === 'profile_picture') {
//       folder = 'uploads/profile_pictures';
//     } else if (file.fieldname === 'uploaded_cv') {
//       folder = 'uploads/cvs';
//     } else {
//       return cb(new Error('Invalid fieldname'), null);
//     }

//     ensureUploadFolderExists(folder);
//     cb(null, folder);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   }
// });

// // === Define file filter ===
// const fileFilter = (req, file, cb) => {
//   if (file.fieldname === 'profile_picture') {
//     const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
//     if (allowedImageTypes.includes(file.mimetype)) return cb(null, true);
//     return cb(new Error('Only JPG and PNG images are allowed for profile picture'), false);
//   }

//   if (file.fieldname === 'uploaded_cv') {
//     const allowedCvTypes = [
//       'application/pdf',
//       'application/msword',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//     ];
//     if (allowedCvTypes.includes(file.mimetype)) return cb(null, true);
//     return cb(new Error('Only PDF or Word documents are allowed for CV'), false);
//   }

//   return cb(new Error('Unsupported field'), false);
// };

// const upload = multer({ storage, fileFilter });

// module.exports = upload;









