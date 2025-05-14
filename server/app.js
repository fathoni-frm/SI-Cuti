const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cron = require('node-cron');
const { sequelize } = require("./models");
const authRoutes = require("./routes/authRoutes");
const dataPegawaiRoutes = require("./routes/dataPegawaiRoutes");
const kuotaCutiRoutes = require("./routes/kuotaCutiRoutes");
const pengajuanCutiRoutes = require("./routes/pengajuanCutiRoutes");
const verifikasiCutiRoutes = require("./routes/verifikasiCutiRoutes");

dotenv.config();
const app = express();
const PORT = 3000;

app.use(cors({
  origin: "http://localhost:5173", // GANTI SESUAI URL FRONTEND
  credentials: true
}));

//otomatis task
require('./tasks/autoCancelCuti');
require('./tasks/autoResetKuotaCuti');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api", dataPegawaiRoutes);
app.use("/api/kuota-cuti", kuotaCutiRoutes);
app.use("/api/pengajuan-cuti", pengajuanCutiRoutes);
app.use("/api", verifikasiCutiRoutes);

app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log("Koneksi database berhasil.");
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error("Koneksi database gagal:", error);
  }
});