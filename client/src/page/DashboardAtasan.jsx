import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import MainLayout from "../Layouts/MainLayout";
import SummaryCards from "../components/SummaryCards";
import BackgroundItem from "../components/BackgroundItem";
import TabelKuotaCuti from "../components/TabelKuotaCuti";
import TabelPermohonan from "../components/TabelPermohonan";
import TabelRiwayat from "../components/TabelRiwayat";
import NationalHolidays from "../components/NationalHolidays";
import Spinner from "../components/Spinner";
import {
	FaCheckCircle,
	FaClock,
	FaTimesCircle,
	FaSpinner,
} from "react-icons/fa";

const DashboardAtasan = () => {
	const { user, isLoading } = useAuthStore();
	const [dataPermohonan, setDataPermohonan] = useState([]);
	const [disetujui, setDisetujui] = useState(0);
	const [ditolak, setDitolak] = useState(0);
	const [dataKuotaCuti, setDataKuotaCuti] = useState([]);
	const [dataRiwayatCuti, setDataRiwayatCuti] = useState([]);

	const dataPermohonanPegawai = [
		{
			label: "Belum Anda Proses",
			count: dataPermohonan.length,
			unit: "Permohonan",
			icon: <FaClock />,
			bgColor: "bg-amber-500",
		},
		{
			label: "Anda Setujui",
			count: disetujui,
			unit: "Permohonan",
			icon: <FaCheckCircle />,
			bgColor: "bg-green-600",
		},
		{
			label: "Anda Tolak",
			count: ditolak,
			unit: "Permohonan",
			icon: <FaTimesCircle />,
			bgColor: "bg-red-600",
		},
	];

	const dataPengajuanAnda = [
		{
			label: "Disetujui",
			count: dataRiwayatCuti.filter((item) => item.status === "Disetujui")
				.length,
			unit: "Pengajuan",
			icon: <FaCheckCircle />,
			bgColor: "bg-green-600",
		},
		{
			label: "Sedang Diproses",
			count: dataRiwayatCuti.filter((item) => item.status === "Diproses")
				.length,
			unit: "Pengajuan",
			icon: <FaSpinner />,
			bgColor: "bg-blue-600",
		},
		{
			label: "Tidak Disetujui / Dibatalkan",
			count: dataRiwayatCuti.filter(
				(item) => item.status === "Ditolak" || item.status === "Dibatalkan"
			).length,
			unit: "Pengajuan",
			icon: <FaTimesCircle />,
			bgColor: "bg-red-600",
		},
	];

	useEffect(() => {
		const fetchVerifikasi = async () => {
			try {
				const res = await axios.get("/permohonan-cuti");

				const disetujui = res.data.disetujui.length;
				const ditolak = res.data.ditolak.length;

				const permohonanCuti = res.data.permohonanCuti;
				const hasil = permohonanCuti
					.map((item) => ({
						idVerifikasi: item.id,
						idPengajuan: item.idPengajuan,
						tanggalPengajuan: item.PengajuanCuti.tanggalPengajuan,
						jenisCuti: item.PengajuanCuti.jenisCuti,
						tanggalMulai: item.PengajuanCuti.tanggalMulai,
						tanggalSelesai: item.PengajuanCuti.tanggalSelesai,
						totalKuota: item.PengajuanCuti.totalKuota,
						sisaKuota: item.PengajuanCuti.sisaKuota,
						status: item.PengajuanCuti.status,
						statusVerifikasi: item.statusVerifikasi,
						Pegawai: { nama: item.PengajuanCuti.Pegawai.nama },
					}))
					.sort(
						(a, b) =>
							new Date(b.tanggalPengajuan) - new Date(a.tanggalPengajuan)
					)
					.slice(0, 5);

				setDisetujui(disetujui);
				setDitolak(ditolak);
				setDataPermohonan(hasil);
			} catch (err) {
				console.error("Gagal ambil data permohonan:", err);
			}
		};

		const fetchKuotaCuti = async () => {
			try {
				const kuotaRes = await axios.get(`/kuota-cuti/${user.idPegawai}`);
				setDataKuotaCuti(kuotaRes.data);
			} catch (err) {
				console.error("Gagal ambil kuota cuti:", err);
			}
		};

		const fetchRiwayat = async () => {
			try {
				const res = await axios.get(
					`/pengajuan-cuti/riwayat/${user.idPegawai}`
				);
				const hasil = res.data
					.sort(
						(a, b) =>
							new Date(b.tanggalPengajuan) - new Date(a.tanggalPengajuan)
					)
					.slice(0, 5);
				setDataRiwayatCuti(hasil);
			} catch (err) {
				console.error(err);
			}
		};

		fetchVerifikasi();
		fetchKuotaCuti();
		fetchRiwayat();
	}, []);

	if (isLoading) return <Spinner />;

	return (
		<MainLayout role="Atasan">
			<div className="flex flex-col lg:flex-row flex-grow">
				<div className="lg:flex-grow bg-gray-100 p-4 sm:p-6 w-full lg:w-auto space-y-5">
					<h1 className="text-2xl font-bold">Dashboard</h1>

					{/* Rekap Permohonan Cuti Pegawai */}
					<SummaryCards
						title="Rekap Permohonan Cuti Pegawai"
						data={dataPermohonanPegawai}
					/>

					{/* Permohonan Cuti Belum Diproses */}
					<BackgroundItem title="Permohonan Cuti Yang Belum Anda Proses">
						<TabelPermohonan
							data={dataPermohonan}
							isDashboard={true}
							showQuota={false}
							showPagination={false}
							lihat={true}
						/>
					</BackgroundItem>

					<hr className="border-2 border-gray-900 w-full my-5" />

					{/* Rekap Pengajuan Cuti Anda */}
					<SummaryCards
						title="Rekap Pengajuan Cuti Anda"
						data={dataPengajuanAnda}
					/>

					{/* Kuota Cuti */}
					<BackgroundItem title="Sisa Kuota Cuti Anda">
						<TabelKuotaCuti data={dataKuotaCuti} />
					</BackgroundItem>

					{/* Riwayat Pengajuan Cuti Anda */}
					<BackgroundItem title="Riwayat Pengajuan Cuti Anda">
						<TabelRiwayat
							data={dataRiwayatCuti}
							showPagination={false}
							isDashboard={true}
						/>
					</BackgroundItem>
				</div>

				{/* Hari Libur */}
				<NationalHolidays />
			</div>
		</MainLayout>
	);
};

export default DashboardAtasan;
