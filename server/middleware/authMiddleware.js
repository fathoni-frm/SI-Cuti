const jwt = require("jsonwebtoken");
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Token tidak ditemukan' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; 
    // console.log("Auth:", req.user);
    next();
  } catch (error) {
    return res.status(403).json({ msg: 'Token tidak valid' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Akses ditolak" });
    }
    next();
  };
};

const checkAlreadyLoggedIn = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      return res.status(400).json({ msg: 'Kamu sudah login!' });
    } catch (err) {
      next();
    }
  } else {
    next();
  }
};

const checkNotLoggedIn = (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ msg: "Kamu belum login!" });
  }

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ msg: "Token tidak valid" });
    req.user = decoded;
    next();
  });
};


module.exports = {
  verifyToken,
  authorizeRoles,
  checkAlreadyLoggedIn,
  checkNotLoggedIn
};
