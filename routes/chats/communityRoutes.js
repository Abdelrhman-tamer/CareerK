// routes/communityRoutes.js

const express = require("express");
const router = express.Router();
const upload = require("../../middleware/upload");

const communityController = require("../../controllers/Chats-feature/communityController");
const { authenticateUser } = require("../../middleware/authMiddleware");

// ✅ Get all available community groups (for discovery)
router.get("/groups", authenticateUser, communityController.getAllGroups);

router.get(
    "/groups/by-interest/:tag",
    authenticateUser,
    communityController.getGroupsByTag
);

router.get("/groups/tags", authenticateUser, communityController.getAllTags);

router.get(
    "/groups/search",
    authenticateUser,
    communityController.searchGroups
);

// ✅ Get a specific group's info by ID
router.get(
    "/groups/:groupId",
    authenticateUser,
    communityController.getGroupById
);

// ✅ Join a group (user must be logged in)
router.post("/join/:groupId", authenticateUser, communityController.joinGroup);

// ✅ Leave a group
router.delete(
    "/leave/:groupId",
    authenticateUser,
    communityController.leaveGroup
);

// ✅ Get all groups that the current user has joined
router.get("/my-groups", authenticateUser, communityController.getMyGroups);

// ✅ Get group messages (with pagination)
router.get(
    "/:groupId/messages",
    authenticateUser,
    communityController.getGroupMessages
);

// ✅ Upload file for community message
router.post(
    "/upload-media",
    authenticateUser,
    upload.single("chat_file"), // key name must be "file" in form-data
    communityController.uploadCommunityMedia
);

module.exports = router;
