const usersRouter = require("express").Router();
const { getAllUsers, deactivateUser, updateUserPassword, updateUserRole, getUserProfile, getAllPatients } = require("../controllers/usersController");

usersRouter.get('/', getAllUsers);
usersRouter.get('/patients', getAllPatients);
usersRouter.get('/:userId', getUserProfile)
usersRouter.delete('/:userId');
usersRouter.put('/deactivate-user/:userId', deactivateUser);
usersRouter.put('/password/:userId', updateUserPassword);
usersRouter.put('/role/:userId', updateUserRole);

module.exports = { usersRouter };
