const joi = require("joi");

//sign-up schema
const newUserSchema = joi.object({
    FirstName: joi.string().min(2).max(50).required(),
    LastName: joi.string().min(2).max(50).required(),
    Gender: joi.string().min(2).max(10).required(),
    Email: joi.string().email().required(),
    PhoneNumber: joi.string().pattern(/^07\d{8}$/).required(),
    UserPassword: joi.string().min(6).required(),
});

//USER LOGIN SCHEMA
const loginSchema = joi.object({
    Email: joi.string().email().required(),
    UserPassword: joi.string().min(8).max(64).required(),
  });

//USER ROLE UPDATE SCHEMA
const editUserRoleSchema = joi.object({
  UserRole: joi.string()
      .valid('Admin', 'Doctor')
      .required()
});

//APPOINTMENT SCHEMA
const newAppointmentSchema = joi.object({
  PatientId: joi.number().integer().required(),
  AppointmentDate: joi.date().iso().greater('now').required(),
  Reason: joi.string().min(5).max(255).required(),
});


module.exports = { 
  newUserSchema,
  loginSchema,
  editUserRoleSchema,
  newAppointmentSchema
};