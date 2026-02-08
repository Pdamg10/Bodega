const { THEME_COLORS, LANGUAGE_TEXT } = require("../config/constants");

let previewIsSelect = false;

const getApiStatus = (req, res) => {
  res.send("Bodega API is running");
};

const getThemeColors = (req, res) => {
  res.json(THEME_COLORS);
};

const getLanguageText = (req, res) => {
  const lang = (req.query.lang || "es").toLowerCase();
  res.json(LANGUAGE_TEXT[lang] || LANGUAGE_TEXT.es);
};

const getWorkspacePath = (req, res) => {
  res.json({ path: process.cwd() });
};

const setIsSelect = (req, res) => {
  const { isSelect } = req.body || {};
  previewIsSelect = !!isSelect;
  res.json({ isSelect: previewIsSelect });
};

module.exports = {
  getApiStatus,
  getThemeColors,
  getLanguageText,
  getWorkspacePath,
  setIsSelect,
};
