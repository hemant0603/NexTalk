const express = require("express");
const {
  allMessages,
  sendMessage,
} = require("../Controllers/MessageController");
const { protect } = require("../Middleware/authMiddlware");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);

module.exports = router;