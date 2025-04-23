const freeRouter = require("express").Router();

const { 
    addNewUser
} = require("../controllers/usersController");


freeRouter.post('/users', addNewUser);

module.exports = { freeRouter };