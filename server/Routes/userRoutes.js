const express = require("express");
const router = express.Router();
const { registerUser, authUser,allUsers } = require("../Controllers/userControllers");
const { protect } = require("../Middleware/authMiddlware");


router.route("/").get(protect, allUsers);
router.route("/").post(registerUser);
router.post("/login", authUser);


module.exports = router;

