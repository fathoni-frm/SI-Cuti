const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({
      where: { username },
    });

    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ msg: "Password salah" });

    const payload = {
      id: user.id,
      idPegawai :user.idPegawai,
      username: user.username,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "1 day"
    });

    await User.update({ refreshToken }, {
      where: {
        id: user.id
      }
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, //ganti true kalau menggunakan https
      sameSite: "lax", //ganti 'none' kalau secure = true
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      msg: "Login berhasil",
      accessToken,
      user: payload,
    });

  } catch (error) {
    res.status(500).json({ msg: "Server error", error });
  }
};

const register = async (req, res) => {
  try {
    const { idPegawai, username, password, role } = req.body;

    if (!idPegawai || !username || !password || !role) {
      return res.status(400).json({ msg: 'Semua field wajib diisi' });
    }

    // Cek apakah username sudah dipakai
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        msg: 'Username sudah terdaftar', errors: {
          username: "Username ini sudah terdaftar"
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const newUser = await User.create({
      idPegawai,
      username,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      msg: 'User berhasil didaftarkan',
      user: {
        id: newUser.id,
        idPegawai: newUser.idPegawai,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Gagal mendaftarkan user', error: error.message });
  }
};

const refreshToken = async (req, res) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;
  if (!refreshTokenFromCookie) {
    console.log("No refresh token in cookie");
    return res.sendStatus(401);
  }

  try {
    const user = await User.findOne({ where: { refreshToken: refreshTokenFromCookie } });
    if (!user) return res.sendStatus(403);

    const decoded = jwt.verify(refreshTokenFromCookie, process.env.REFRESH_TOKEN_SECRET);
    const payload = {
      id: user.id,
      idPegawai :user.idPegawai,
      username: user.username,
      role: user.role
    };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

    return res.json({
      accessToken,
      user: payload,
    });
  } catch (err) {
    res.status(403).json({ msg: 'Token tidak valid' });
  }
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ msg: "Kamu belum login!" });
  }

  const user = await User.findOne({ where: { refreshToken } });
  if (!user) {
    return res.status(403).json({ msg: "Token login tidak valid atau user sudah logout" });
  }

  await User.update({ refreshToken: null }, { where: { id: user.id } });

  res.clearCookie("refreshToken", { httpOnly: true, sameSite: 'strict' });
  res.json({ msg: "Logout berhasil!" });
};


module.exports = {
  login, register, refreshToken, logout
};
