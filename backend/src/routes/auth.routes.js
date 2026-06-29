const express = require('express');
const AuthController = require('../controllers/auth.controller');
const { registerValidator, loginValidator, tokenValidator } = require('../validators/auth.validator');
const validate = require('../middlewares/validate.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');

const router = express.Router();

router.post('/register', authLimiter, registerValidator, validate, AuthController.register);
router.post('/login', authLimiter, loginValidator, validate, AuthController.login);
router.post('/refresh', tokenValidator, validate, AuthController.refresh);
router.post('/logout', tokenValidator, validate, AuthController.logout);

module.exports = router;
