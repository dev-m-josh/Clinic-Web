const sql = require('mssql');

const { newAppointmentSchema } = require('../validators/validators');

async function createAppointment(req, res) {
  const pool = req.pool;
  const newAppointment = req.body;

  const { error, value } = newAppointmentSchema.validate(newAppointment, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      errors: error.details,
    });
  }

  try {
    const request = pool.request();
    request.input('PatientId', sql.Int, value.PatientId);
    request.input('AppointmentDate', sql.DateTime, value.AppointmentDate);
    request.input('Reason', sql.NVarChar(255), value.Reason);
    request.input('DoctorId', sql.Int, value.DoctorId);

    const result = await request.query(`
      INSERT INTO Appointments (PatientId, AppointmentDate, Reason, DoctorId)
      VALUES (@PatientId, @AppointmentDate, @Reason, @DoctorId)
    `);

    return res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      appointmentId: result.recordset?.insertId || null,
    });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

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
        `DELETE FROM Appointments WHERE AppointmentId = '${appointmentId}'`, (err, result) => {
            if (err) {
                console.error("Error occurred while deleting appointment:", err);
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (result.rowsAffected[0] === 0) {
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

async function updateAppointment(req, res) {
    let pool = req.pool;
    let appointmentId = req.params.appointmentId;
    let {isCompleted} = req.query;

    // Update the appointment to completed
    pool.query(
        `UPDATE Appointments SET isCompleted = ${isCompleted} WHERE AppointmentId = '${appointmentId}'`,
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
                message: "Appointment updated successfully"
            });
        }
    );
};

function getUserAppointments(req, res) {
    let userId = req.params.userId;
    let pool = req.pool;

    pool.query(
                `SELECT 
        A.AppointmentId,
        A.AppointmentDate,
        A.Reason,
        A.isCompleted,
        A.CreatedAt,
        U1.FirstName AS PatientFirstName,
        U1.LastName AS PatientLastName,
        U2.FirstName AS DoctorFirstName,
        U2.LastName AS DoctorLastName
        FROM Appointments A
        JOIN Users U1 ON A.PatientId = U1.UserId
        JOIN Users U2 ON A.DoctorId = U2.UserId
        WHERE A.PatientId = ${userId} OR A.DoctorId = ${userId}
        ORDER BY A.AppointmentDate DESC`, (err, result) => {
        if (err) {
            res.status(500).json({
                success: false,
                message: "Internal server error."
            });
            console.log("Error occured in query", err);
        } else {
            res.json(result.recordset);
        };
        }
    );
};

module.exports = {
    createAppointment,
    deleteAppointment,
    updateAppointment,
    getUserAppointments
}        