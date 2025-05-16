import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./page/Login";
import ValidasiPengajuanCuti from "./page/ValidasiPengajuanCuti";
import ValidasiVerifikator from "./page/ValidasiVerifikator";
import DashboardAdmin from "./page/DashboardAdmin";
import DashboardAtasan from "./page/DashboardAtasan";
import DashboardPegawai from "./page/DashboardPegawai";
import PermohonanCutiAdmin from "./page/PermohonanCutiAdmin";
import PermohonanCutiAtasan from "./page/PermohonanCutiAtasan";
import DetailCuti from "./page/DetailCuti";
import ManajemenCuti from "./page/ManajemenCuti";
import ManajemenPegawai from "./page/ManajemenPegawai";
import TambahPegawai from "./page/TambahPegawai";
import EditPegawai from "./page/EditPegawai";
import DetailPegawai from "./page/DetailPegawai";
import PengajuanCuti from "./page/PengajuanCuti";
import FormPengajuanCuti from "./page/FormPengajuanCuti";
import RiwayatPengajuanCuti from "./page/RiwayatPengajuanCuti";
import DraftPengajuan from "./page/DraftPengajuan";
import Spinner from "./components/Spinner";

const App = () => {
	const { refreshToken, isLoading, user } = useAuthStore();

	useEffect(() => {
		refreshToken();
	}, []);

	const ProtectedRoute = ({ children }) => {
		if (isLoading) {
			return <Spinner />;
		}
		if (!user) {
			return <Navigate to="/login" replace />;
		}
		return children;
	};

	const DashboardWrapper = () => {
		if (isLoading) {
			return <Spinner />;
		}
		if (!user) return <Navigate to="/login" />;
		if (user.role === "Admin") return <DashboardAdmin />;
		if (user.role === "Atasan") return <DashboardAtasan />;
		if (user.role === "Pegawai") return <DashboardPegawai />;
		return <div>Role tidak dikenali</div>;
	};

	const PermohonanWrapper = () => {
		if (isLoading) {
			return <Spinner />;
		}
		if (!user) return <Navigate to="/login" />;
		if (user.role === "Admin") return <PermohonanCutiAdmin />;
		if (user.role === "Atasan") return <PermohonanCutiAtasan />;
		return <div>Role tidak dikenali</div>;
	};

	return (
		<>
			<Router>
				<Routes>
					<Route
						path="/login"
						element={user ? <Navigate to="/dashboard" /> : <Login />}
					/>
					<Route
						path="/validasi/qr-code-pengajuan/:id"
						element={<ValidasiPengajuanCuti />}
					/>
					<Route
						path="/validasi/qr-code-verifikator/:id"
						element={<ValidasiVerifikator />}
					/>
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute>
								<DashboardWrapper />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/permohonan-cuti"
						element={
							<ProtectedRoute>
								<PermohonanWrapper />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/detail-cuti/:id"
						element={
							<ProtectedRoute>
								<DetailCuti />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/manajemen-cuti"
						element={
							<ProtectedRoute>
								<ManajemenCuti />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/manajemen-pegawai"
						element={
							<ProtectedRoute>
								<ManajemenPegawai />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/manajemen-pegawai/tambah"
						element={
							<ProtectedRoute>
								<TambahPegawai />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/manajemen-pegawai/edit/:id"
						element={
							<ProtectedRoute>
								<EditPegawai />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/detail-pegawai/:id"
						element={
							<ProtectedRoute>
								<DetailPegawai />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/pengajuan-cuti"
						element={
							<ProtectedRoute>
								<PengajuanCuti />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/pengajuan-cuti/form"
						element={
							<ProtectedRoute>
								<FormPengajuanCuti />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/pengajuan-cuti/edit/:id"
						element={
							<ProtectedRoute>
								<FormPengajuanCuti />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/riwayat-cuti"
						element={
							<ProtectedRoute>
								<RiwayatPengajuanCuti />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/draft-cuti"
						element={
							<ProtectedRoute>
								<DraftPengajuan />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</Router>
			<ToastContainer position="bottom-right" autoClose={5000} />
		</>
	);
};

export default App;
