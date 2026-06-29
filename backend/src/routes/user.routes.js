const express = require('express');
const UserController = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { updateProfileValidator, changePasswordValidator } = require('../validators/user.validator');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// All user routes require JWT Authentication
router.use(auth);

router.get('/profile', UserController.getProfile);
router.put('/profile', updateProfileValidator, validate, UserController.updateProfile);
router.put('/change-password', changePasswordValidator, validate, UserController.changePassword);
router.patch('/avatar', upload.single('avatar'), UserController.uploadAvatar);
router.delete('/account', UserController.deleteAccount);

module.exports = router;
