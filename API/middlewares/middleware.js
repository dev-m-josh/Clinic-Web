const jwt = require("jsonwebtoken");

//token verification
function verifyToken(req, res, next) {
    try {
        const bearerToken = req.headers["authorization"];
        if (bearerToken) {
            const token = bearerToken.split(' ')[1];
            let verification = jwt.verify(token, 'impossibletoguessright');
            req.user = verification;
            next();

        } else {
            const error = new Error("No token found!");
            error.status = 401;
            next(error)
        }

    } catch (error) {
        error.status = 400;
        error.message = "Token is invalid or expired!";
        next(error);
    };
};

//undefined routes
function undefinedRouteHandler(req, res, next) {
    const error = new Error("Route not defined!");
    error.status = 404;
    next(error);
};

//handle all errors
function allErrorsHandler(err, req, res, next) {
    console.error(err);

    if (err.status) {
        return res.status(err.status).send(err.message || 'Something went wrong');
    }

    return res.status(500).send('Internal server error');
};

module.exports = { verifyToken, undefinedRouteHandler, allErrorsHandler};