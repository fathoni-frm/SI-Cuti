import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./page/Login";
import ValidasiQrCode from "./page/ValidasiQrCode";
import DashboardAdmin from "./page/DashboardAdmin";
import DashboardAtasan from "./page/DashboardAtasan";
import DashboardPegawai from "./page/DashboardPegawai";
import PermohonanCutiAdmin from "./page/PermohonanCutiAdmin";
import PermohonanCutiAtasan from "./page/PermohonanCutiAtasan";
import PermohonanPelimpahanTugas from "./page/PermohonanPelimpahanTugas";
import DetailCuti from "./page/DetailCuti";
import DetailPelimpahan from "./page/DetailPelimpahan";
import ManajemenCuti from "./page/ManajemenCuti";
import ManajemenPegawai from "./page/ManajemenPegawai";
import TambahPegawai from "./page/TambahPegawai";
import EditPegawai from "./page/EditPegawai";
import DetailPegawai from "./page/DetailPegawai";
import PengajuanCuti from "./page/PengajuanCuti";
import PengajuanCutiForm from "./page/PengajuanCutiForm";
import RiwayatPengajuanCuti from "./page/RiwayatPengajuanCuti";
import DraftPengajuan from "./page/DraftPengajuan";
import EditDraft from "./page/EditDraft";
import PengaturanProfil from "./page/PengaturanProfil";
import EditPengaturanProfil from "./page/EditPengaturanProfil";
import Spinner from "./components/Spinner";

const App = () => {
	const { refreshToken, isLoading, user } = useAuthStore();

	useEffect(() => {
		refreshToken();
	}, []);

	const ProtectedRoute = ({ children, allowedRoles }) => {
		if (isLoading) {
			return <Spinner />;
		}
		if (!user) {
			return <Navigate to="/login" replace />;
		}
		if (allowedRoles && !allowedRoles.includes(user.role)) {
			return <Navigate to="/dashboard" replace />;
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
		return <Navigate to="/dashboard" replace />;
	};

	const PermohonanWrapper = () => {
		if (isLoading) {
			return <Spinner />;
		}
		if (!user) return <Navigate to="/login" />;
		if (user.role === "Admin") return <PermohonanCutiAdmin />;
		if (user.role === "Atasan") return <PermohonanCutiAtasan />;
		return <Navigate to="/dashboard" replace />;
	};

	return (
		<>
			<Router>
				<Routes>
					<Route path="/" element={<Navigate to="/login" />} />
					<Route
						path="/login"
						element={user ? <Navigate to="/dashboard" /> : <Login />}
					/>
					<Route path="/v/:doc/:id/:role/:sig" element={<ValidasiQrCode />} />
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
							<ProtectedRoute allowedRoles={["Admin", "Atasan"]}>
								<PermohonanWrapper />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/permohonan-pelimpahan-tugas"
						element={
							<ProtectedRoute allowedRoles={["Atasan", "Pegawai"]}>
								<PermohonanPelimpahanTugas />
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
						path="/detail-pelimpahan/:id"
						element={
							<ProtectedRoute>
								<DetailPelimpahan />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/manajemen-cuti"
						element={
							<ProtectedRoute allowedRoles={["Admin"]}>
								<ManajemenCuti />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/manajemen-pegawai"
						element={
							<ProtectedRoute allowedRoles={["Admin"]}>
								<ManajemenPegawai />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/manajemen-pegawai/tambah"
						element={
							<ProtectedRoute allowedRoles={["Admin"]}>
								<TambahPegawai />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/manajemen-pegawai/edit/:id"
						element={
							<ProtectedRoute allowedRoles={["Admin"]}>
								<EditPegawai />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/detail-pegawai/:id"
						element={
							<ProtectedRoute allowedRoles={["Admin"]}>
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
								<PengajuanCutiForm />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/pengajuan-cuti/edit/:id"
						element={
							<ProtectedRoute>
								<EditDraft />
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
					<Route
						path="/pengaturan-profil"
						element={
							<ProtectedRoute>
								<PengaturanProfil />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/pengaturan-profil/edit"
						element={
							<ProtectedRoute>
								<EditPengaturanProfil />
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
