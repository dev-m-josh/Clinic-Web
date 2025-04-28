import { newAppointmentSchema } from '../validators/validators';



async function createAppointment(req, res) {
    let pool = req.pool;
    let newAppointment = req.body;

    const { error, value } = newAppointmentSchema.validate(newAppointment, { 
        abortEarly: false 
    });

    if (error) {
        return res.status(400).json({
        success: false,
        errors: error.details,
        });
    }

    pool.query(
        `INSERT INTO Appointments (PatientId, AppointmentDate, Reason)
        VALUES ('${PatientId}', '${AppointmentDate}', '${Reason}')`, (err, result) =>{
            if (err) {
                console.log("Error occured in query.", err.details);
                res.json({
                  success: false,
                  message: err.message
                });
            } else {
                res.json({
                    success: true,
                    message: "Appointment created   successfully",
                    addedUser,
                    token
                });
            };
        }
    );     
};

async function deleteAppointment(req, res) {
    const pool = req.pool;
    const { appointmentId } = req.params;

    // Validate if the appointmentId is a valid number
    if (!appointmentId || isNaN(appointmentId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Appointment ID"
        });
    }

    pool.query(
        `DELETE FROM Appointments WHERE AppointmentId = '${appointmentId}`, (err, result) => {
            if (err) {
                console.error("Error occurred while deleting appointment:", err);
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Appointment not found"
                });
            } else {
                res.json({
                    success: true,
                    message: "Appointment deleted successfully"
                });
            };
        }
    );
};

async function markAppointmentAsCompleted(req, res) {
    const { appointmentId } = req.params;

    // Validate the appointmentId
    if (!appointmentId || isNaN(appointmentId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Appointment ID"
        });
    }

    // Update the appointment to completed
    pool.query(
        `UPDATE Appointments SET isCompleted = 1 WHERE AppointmentId = '${appointmentId}'`,
        (err, result) => {
            if (err) {
                console.error("Error occurred while updating appointment status:", err);
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Appointment not found"
                });
            }

            res.json({
                success: true,
                message: "Appointment marked as completed successfully"
            });
        }
    );
};

async function getAllAppointments(req, res) {
    try {
        const query = `
            SELECT 
                a.AppointmentId,
                a.PatientId,
                a.AppointmentDate,
                a.Reason,
                a.isCompleted,
                d.UserId AS DoctorId,
                d.FirstName AS DoctorFirstName,
                d.LastName AS DoctorLastName,
                d.Email AS DoctorEmail,
                d.PhoneNumber AS DoctorPhoneNumber
            FROM 
                Appointments a
            JOIN 
                DoctorAppointments da ON a.AppointmentId = da.AppointmentId
            JOIN 
                Users d ON da.DoctorId = d.UserId
            ORDER BY 
                a.AppointmentDate DESC;
        `;

        const [appointments] = await pool.query(query);

        // If no appointments are found
        if (appointments.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No appointments found"
            });
        }

        res.json({
            success: true,
            appointments: appointments
        });

    } catch (err) {
        console.error("Error fetching appointments:", err);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching appointments"
        });
    };
};


module.exports = {
    createAppointment,
    deleteAppointment,
    markAppointmentAsCompleted,
    getAllAppointments
}