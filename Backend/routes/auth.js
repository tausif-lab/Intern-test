const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const {
  registerValidators,
  loginValidators,
  handleValidationErrors,
} = require("../utils/validators");


router.post("/register", registerValidators, handleValidationErrors, register);


router.post("/login", loginValidators, handleValidationErrors, login);

module.exports = router;
