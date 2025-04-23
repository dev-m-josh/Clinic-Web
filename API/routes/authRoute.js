const { userLogin } = require("../controllers/usersController");

const authRouter = require("express").Router();

authRouter.post('/login', userLogin);

module.exports = { authRouter }