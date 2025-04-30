import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import '../Styles/Login.css';

export default function CreateAppointment() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [formData, setFormData] = useState({
    PatientId: '',
    AppointmentDate: '',
    Reason: '',
    DoctorId: null
  });
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [patients, setPatients] = useState([]);

  // Load user and token from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("myUser"));
    const storedToken = localStorage.getItem("myToken");

    if (!storedUser || !storedToken) {
      navigate('/login');
      return;
    }

    setUser(storedUser);
    setToken(storedToken);
  }, [navigate]);

  // Set DoctorId once user is loaded
  useEffect(() => {
    if (user?.UserId) {
      setFormData(prev => ({
        ...prev,
        DoctorId: user.UserId
      }));
    }
  }, [user]);

  console.log(user)

  // Fetch appointments
  useEffect(() => {
    if (!token || !user) return;

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const endpoint = `http://localhost:4500/appointments/${user.UserId}`;
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error(`${response.statusText}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Unexpected response format");
        setAppointments(data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token, user]);

  useEffect(() => {
    if (!token || !user) return;

    const fetchPatients = async () => {
      try {
        setLoading(true);
        const endpoint = `http://localhost:4500/users/patients?activeUsers=1`;
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error(`${response.statusText}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Unexpected response format");
        setPatients(data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [token, user]);

  const formatDateTime = (input) => {
    const date = new Date(input);
    const pad = n => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setErrors(null);

    const formattedData = {
      ...formData,
      AppointmentDate: formatDateTime(formData.AppointmentDate)
    };

    try {
      const response = await axios.post(
        "http://localhost:4500/appointments",
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMessage(response.data.message);
      setFormData(prev => ({
        PatientId: '',
        AppointmentDate: '',
        Reason: '',
        DoctorId: prev.DoctorId
      }));
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setMessage("An error occurred.");
      }
    }
  };

  const handleAppointmentUpdate = async (AppointmentId, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:4500/appointments/update/${AppointmentId}?isCompleted=${newStatus ? 1 : 0}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert(response.data.message);

      setAppointments(prev =>
        prev.map(appt =>
          appt.AppointmentId === AppointmentId
            ? { ...appt, isCompleted: newStatus }
            : appt
        )
      );
    } catch (err) {
      console.error("Update failed:", err);
      setMessage("Failed to update appointment.");
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this appointment?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:4500/appointments/${appointmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete appointment!");

      alert(data.message);
      setAppointments(prev => prev.filter(appt => appt.AppointmentId !== appointmentId));
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Failed to delete the appointment. Please try again later.");
    }
  };

  if (!user || !token) return null;
  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      {showForm && (
        <div onClick={() => setShowForm(false)} className="modal-overlay">
          <div onClick={(e) => e.stopPropagation()} className="modal-content">
            <h2>Create Appointment</h2>
            <form onSubmit={handleSubmit}>
              <div className="user-details">
                <label>Patient ID:</label>
                <select
                  name="PatientId"
                  value={formData.PatientId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map((patient) => (
                    <option key={patient.UserId} value={patient.UserId}>
                      {patient.FirstName} {patient.LastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="user-details">
                <label>Appointment Date:</label>
                <input
                  type="datetime-local"
                  name="AppointmentDate"
                  value={formData.AppointmentDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="user-details">
                <label>Reason:</label>
                <textarea
                  name="Reason"
                  value={formData.Reason}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="submit-btn appointment-submit">
                <button className='cancel' type="button" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit">Submit</button>
              </div>
              {errors && <div className="error-message">{errors}</div>}
            </form>
          </div>
        </div>
      )}

      <div className='users'>
        {message && <div className="message">{message}</div>}
        <div className="users-header">
          <h2>Appointments</h2>
          {user.UserRole === 'Doctor' && (
            <button onClick={() => setShowForm(true)}>New Appointment</button>
          )}
        </div>

        {appointments.length === 0 ? (
          <div>You have no appointments yet.</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient FirstName</th>
                <th>Patient LastName</th>
                <th>Doctor FirstName</th>
                <th>Doctor LastName</th>
                <th>Appointment Date</th>
                <th>Reason</th>
                <th>isCompleted</th>
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment, index) => (
                <tr key={appointment.AppointmentId}>
                  <td>{index + 1}</td>
                  <td>{appointment.PatientFirstName}</td>
                  <td>{appointment.PatientLastName}</td>
                  <td>{appointment.DoctorFirstName}</td>
                  <td>{appointment.DoctorLastName}</td>
                  <td>{new Date(appointment.AppointmentDate).toLocaleString()}</td>
                  <td>{appointment.Reason}</td>
                  <td>{appointment.isCompleted ? "Completed" : "Pending"}</td>
                  <td className="options">
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        const action = e.target.value;
                        e.target.selectedIndex = 0;
                        if (action === "toggle") {
                          handleAppointmentUpdate(appointment.AppointmentId, !appointment.isCompleted);
                        } else if (action === "delete") {
                          handleDeleteAppointment(appointment.AppointmentId);
                        }
                      }}
                    >
                      <option value="" disabled>Options</option>
                      <option value="toggle">
                        {appointment.isCompleted ? "Mark as Pending" : "Mark as Completed"}
                      </option>
                      <option value="delete">Delete</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </>
  )}
