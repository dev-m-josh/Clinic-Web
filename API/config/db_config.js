require("dotenv").config();

module.exports = {
    config: {
        user: process.env.USER,
        password: process.env.PASSWORD,
        server: process.env.SERVER,
        database: process.env.DATABASE,
        pool:{
          max: 10,
          min: 1,
          idleTimeoutMillis: 30000
        },
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
    },
};