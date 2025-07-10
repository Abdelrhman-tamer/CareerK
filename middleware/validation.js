// const { body } = require('express-validator');

// exports.validateRoadmap = [
//     body('title').notEmpty().withMessage('Title is required'),
//     body('slug').notEmpty().isSlug().withMessage('Valid slug is required'),
//     body('type').isIn(['standard', 'ai', 'community']).withMessage('Invalid roadmap type'),
//     body('steps').isArray().withMessage('Steps must be an array')
//   ];

// const validateRoadmapJSON = (data) => {
//     const schema = {
//       type: 'object',
//       properties: {
//         title: { type: 'string' },
//         slug: { type: 'string' },
//         // ... other fields
//       },
//       required: ['title', 'slug', 'steps']
//     };
//     const valid = ajv.validate(schema, data);
//     if (!valid) throw new Error(`Invalid roadmap: ${ajv.errorsText()}`);
//   };