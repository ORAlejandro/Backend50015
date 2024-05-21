const jwt = require('jsonwebtoken');

const checkUserRole = (allowedRoles) => (req, res, next) => {
    const token = req.cookies.coderCookieToken;

    if (token) {
        jwt.verify(token, 'coderhouse', (err, decoded) => {
            if (err) {
                res.status(403).send("Acceso restringido: Token invalido");
            } else {
                const userRole = decoded.user.role;
                if (allowedRoles.includes(userRole)) {
                    next();
                } else {
                    res.status(403).send("Acceso restringido: No tenes permisos");
                }
            }
        });
    } else {
        res.redirect("/login");
    }
};

module.exports = checkUserRole;