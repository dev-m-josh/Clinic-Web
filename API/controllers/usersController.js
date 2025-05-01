const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { newUserSchema, loginSchema, editUserRoleSchema } = require("../validators/validators");

//get all users
function getAllUsers(req, res) {
    let pool = req.pool;
    let { page, pageSize, activeUsers } = req.query;
    let offset = (Number(page) - 1) * Number(pageSize);
    pool.query(
        `SELECT *
        FROM users
        WHERE isActive = ${activeUsers}
        ORDER BY UserId ASC OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`, (err, result) => {
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

//get all users
function getAllPatients(req, res) {
  let pool = req.pool;
  let { activeUsers } = req.query;
  pool.query(
      `SELECT *
      FROM users
      WHERE isActive = ${activeUsers} AND UserRole = 'Patient'
      ORDER BY UserId`, (err, result) => {
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

//get user profile
function getUserProfile(req, res) {
  let pool = req.pool;
  let reqUser = req.params.userId;
  pool.query(
    `SELECT UserId, FirstName, LastName, Gender, Email, PhoneNumber, UserRole, created_at
    FROM users
    WHERE UserId = ${reqUser}`, (err, result) =>{
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

async function addNewUser(req, res) {
  let pool = req.pool;
  let addedUser = req.body;

  const { error, value } = newUserSchema.validate(addedUser, {
      abortEarly: false
  });

  if (error) {
      console.log(error);
      return res.status(400).json({ errors: error.details });
  }

  try {
      const hashedPassword = await bcrypt.hash(value.UserPassword, 5);

      const query = `
          INSERT INTO users 
          (FirstName, LastName, Gender, Email, PhoneNumber, UserPassword)
          OUTPUT INSERTED.*
          VALUES (@FirstName, @LastName, @Gender, @Email, @PhoneNumber, @UserPassword)`;

      const request = pool.request();
      request.input('FirstName', value.FirstName);
      request.input('LastName', value.LastName);
      request.input('Gender', value.Gender);
      request.input('Email', value.Email);
      request.input('PhoneNumber', value.PhoneNumber);
      request.input('UserPassword', hashedPassword);

      request.query(query, async (err, result) => {
          if (err) {
              console.error("SQL Error:", err);
              return res.status(500).json({ success: false, message: err.message });
          }

          const fullUser = result.recordset[0];
          delete fullUser.UserPassword;

          const token = jwt.sign(
              { UserId: fullUser.UserId, UserRole: fullUser.UserRole },
              "impossibletoguessright"
          );

          res.status(201).json({
              success: true,
              message: "User added successfully",
              addedUser: fullUser,
              token
          });
      });
  } catch (e) {
      console.error("Unexpected error:", e);
      res.status(500).json({
          success: false,
          message: "Internal server error"
      });
  }
}


//delete a user compeletely
function deleteUser(req, res) {
    let pool = req.pool;
    let requestedId = req.params.userId;
    pool.query(`DELETE FROM users WHERE UserId = ${requestedId}`, (err, result) =>{
        if (err) {
            res.status(500).json({
              success: false,
              message: "Internal server error.",
            });
            console.log("Error occured in query", err);
          }

        if (result.rowsAffected[0] === 0) {
            res.status(400).json({
            success: false,
            message: "User not found!",
            });
            return;
        }
        res.json({
            success: true,
            message: "Account deleted successfully!",
            result: result.rowsAffected,
        });
    });
};

//deactivate or restore user account
function deactivateUser(req, res) {
    let pool = req.pool;
    let { isActive } = req.query;
    let requestedId = req.params.userId;
    pool.query(`UPDATE users SET isActive = ${isActive} WHERE UserId = ${requestedId}`, (err, result) =>{
        if (err) {
            res.status(500).json({
              success: false,
              message: "Internal server error.",
            });
            console.log("Error occured in query", err);
          }

        //CHECK IF REQUESTED USER IS AVAILABLE
        if (result.rowsAffected[0] === 0) {
            res.status(400).json({
            success: false,
            message: "User not found!",
            });
            return;
        }

        //RESPONSE
        res.json({
            success: true,
            message: "Logged out successfully!",
            result: result.rowsAffected,
        });
    });
};

async function userLogin(req, res) {
  let pool = req.pool;
  let userDetails = req.body;

  // Validation
  const { error, value } = loginSchema.validate(userDetails, {
    abortEarly: false,
  });

  if (error) {
    console.log(error);
    return res.status(400).json({ errors: error.details });
  }

  let requestedUser = await pool.query(
    `SELECT UserId, FirstName, LastName, Email, Gender, PhoneNumber, UserRole, UserPassword, isActive FROM users WHERE Email = '${value.Email}'`
  );
  let user = requestedUser.recordset[0];

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "You don't have an account yet!",
    });
  }

  try {
    let passwordComparison = await bcrypt.compare(
      userDetails.UserPassword,
      user.UserPassword
    );

    if (passwordComparison) {
      await pool.query(
        `UPDATE users SET isActive = 1 WHERE UserId = ${user.UserId}`
      );

      requestedUser = await pool.query(
        `SELECT UserId, FirstName, LastName, Gender, Email, PhoneNumber, UserRole, UserPassword, isActive FROM users WHERE UserId = ${user.UserId}`
      );
      user = requestedUser.recordset[0];

      const { UserPassword, ...userWithoutPassword } = user;

      let token = jwt.sign({ UserId: user.UserId }, "impossibletoguessright");

      if (user.isActive === true) { 
        return res.json({
          message: "Logged in successfully",
          token,
          user: userWithoutPassword,
        });
      } else {
        return res.status(500).json({
          message: "Failed to activate user.",
        });
      }
    } else {
      return res.status(401).json({
        message: "Incorrect credentials!",
      });
    }
  } catch (error) {
    console.error("Error during login process:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function updateUserPassword(req, res) {
    let pool = req.pool;
    let requestedId = req.params.userId;
    let currentPassword = req.body.currentPassword;
    let newPassword = req.body.newPassword;

    try {
        // Check if currentPassword and newPassword are provided
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Both current and new passwords are required."
            });
        }

        // Fetch the user's current password from the database
        const result = await pool.query(
            `SELECT UserPassword FROM users WHERE UserId = '${requestedId}'`
        );

        if (result.rowCount === 0) {
            return res.status(400).json({
                success: false,
                message: "User not found!"
            });
        }

        const storedPassword = result.recordset[0].UserPassword;

        // Compare the current password provided by the user with the stored password
        const isMatch = await bcrypt.compare(currentPassword, storedPassword);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Password don't match!."
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 5);

        // Update the user's password with the new hashed password
        await pool.query(
            `UPDATE users SET UserPassword = '${hashedPassword}' WHERE UserId = '${requestedId}'`
        );

        res.json({
            success: true,
            message: "Password updated successfully!"
        });

    } catch (err) {
        console.log("Error occurred:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}
  
  // EDIT USER ROLE
function updateUserRole(req, res) {
  let pool = req.pool;
  let requestedUserId = req.params.userId;
  let userEdits = req.body;

  // Validation
  const { error, value } = editUserRoleSchema.validate(userEdits, {
    abortEarly: false,
  });

  if (error) {
    console.log(error);
    return res.status(400).json({ errors: error.details });
  };

  pool.query(`
    UPDATE users
    SET UserRole = '${value.UserRole}'
    WHERE UserId = '${requestedUserId}'`,(err,result) =>{
        if (err) {
          res.status(500).json({
            success: false,
            message: "Internal server error.",
          });
          console.log("Error occured in query", err);
          return;
        }
        // Check if any rows were affected
        if (result.rowsAffected[0] === 0) {
          return res.status(404).json({
            success: false,
            message: `User with ID ${requestedUserId} not found.`
          });
        } else {
          res.json({
            success: true,
            message: "Update successfully done.",
            rowsAffected: result.rowsAffected,
            newUserDetails: userEdits,
          });
        }
      }
  )
}

module.exports = { 
  getAllUsers,
  getAllPatients,
  addNewUser, 
  deleteUser,
  deactivateUser,
  userLogin,
  updateUserPassword,
  updateUserRole,
  getUserProfile,
};