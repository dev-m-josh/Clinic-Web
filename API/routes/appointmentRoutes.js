const appointRouter = require("express").Router();
const {
    createAppointment,
    getUserAppointments,
    updateAppointment
} = require ('../controllers/appointmentControllers')

appointRouter.post('/', createAppointment);
appointRouter.get('/:userId', getUserAppointments);
appointRouter.put('/update/:appointmentId', updateAppointment);
appointRouter.delete('/:appointmentId');

module.exports = {appointRouter};