const express = require('express');
const router = express.Router();
const {register, login, verifyLoginToken, getuserInfo, getUsers, deleteUser, updateUserStatus} = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth_middleware');

router.get('/users', getUsers);
router.post('/register', register);
router.delete('/delete/:id', deleteUser);
router.put('/statusUpdate', updateUserStatus);
router.post('/login', login);
router.get("/checkToken", verifyLoginToken);
router.post("/userData", getuserInfo);

module.exports = router;
