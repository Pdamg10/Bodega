const express = require("express");
const router = express.Router();
const miscController = require("../controllers/miscController");

router.get("/", miscController.getApiStatus);
router.get("/getThemeColors", miscController.getThemeColors);
router.get("/getLanguageText", miscController.getLanguageText);
router.get("/getWorkspacePath", miscController.getWorkspacePath);
router.post("/setIsSelect", miscController.setIsSelect);

module.exports = router;
