import { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import MainLayout from "../Layouts/MainLayout";
import TabelPelimpahan from "../components/TabelPelimpahan";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Spinner from "../components/Spinner";

const PermohonanPelimpahanTugas = () => {
	const { user, isLoading } = useAuthStore();
	const [showBelumDiproses, setShowBelumDiproses] = useState(true);
	const [showDisetujui, setShowDisetujui] = useState(true);
	const [showTidakDisetujui, setShowTidakDisetujui] = useState(true);
	const [permohonan, setPermohonan] = useState([]);
	const [disetujui, setDisetujui] = useState([]);
	const [ditolak, setDitolak] = useState([]);

	const itemsPerPage = 10;
	const [currentPageBelum, setCurrentPageBelum] = useState(1);
	const [currentPageDisetujui, setCurrentPageDisetujui] = useState(1);
	const [currentPageDitolak, setCurrentPageDitolak] = useState(1);

	const totalPagesBelum = Math.ceil(permohonan.length / itemsPerPage);
	const totalPagesDisetujui = Math.ceil(disetujui.length / itemsPerPage);
	const totalPagesDitolak = Math.ceil(ditolak.length / itemsPerPage);

	const paginate = (data, currentPage) => {
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		return {
			paginatedData: data.slice(start, end),
			endIndex: Math.min(end, data.length),
		};
	};

	const { paginatedData: belumDiprosesData, endIndex: belumDiprosesEnd } =
		paginate(permohonan, currentPageBelum);
	const { paginatedData: disetujuiData, endIndex: disetujuiEnd } = paginate(
		disetujui,
		currentPageDisetujui
	);
	const { paginatedData: ditolakData, endIndex: ditolakEnd } = paginate(
		ditolak,
		currentPageDitolak
	);

	useEffect(() => {
		const fetchPermohonan = async () => {
			try {
				const res = await axios.get("/permohonan-pelimpahan-tugas");

				const hasilPermohonan = res.data.permohonan;
				const hasilDisetujui = res.data.disetujui;
				const hasilditolak = res.data.ditolak;

				setPermohonan(
					hasilPermohonan.sort(
						(a, b) =>
							new Date(b.PengajuanCuti.tanggalPengajuan) -
							new Date(a.PengajuanCuti.tanggalPengajuan)
					)
				);
				setDisetujui(
					hasilDisetujui.sort(
						(a, b) =>
							new Date(b.PengajuanCuti.tanggalPengajuan) -
							new Date(a.PengajuanCuti.tanggalPengajuan)
					)
				);
				setDitolak(
					hasilditolak.sort(
						(a, b) =>
							new Date(b.PengajuanCuti.tanggalPengajuan) -
							new Date(a.PengajuanCuti.tanggalPengajuan)
					)
				);
			} catch (error) {
				console.error("Gagal mengambil data permohonan:", error);
			}
		};
		fetchPermohonan();
	}, []);

	if (isLoading) return <Spinner />;

	return (
		<MainLayout role={user.role}>
			<div className="p-4 sm:p-6 w-full">
				<h1 className="text-center sm:text-left text-xl lg:text-2xl font-bold text-gray-800 mb-6">
					Permohonan Pelimpahan Tugas
				</h1>

				<div className="bg-white rounded-md drop-shadow-sm shadow-inner p-4 sm:p-6 mb-6">
					<div
						className="flex justify-between items-center mb-2 cursor-pointer"
						onClick={() => setShowBelumDiproses(!showBelumDiproses)}>
						<h2 className="text-base sm:text-lg font-semibold">
							Permohonan Yang Belum Anda Proses
						</h2>
						{showBelumDiproses ? (
							<FaChevronUp className="text-gray-500" />
						) : (
							<FaChevronDown className="text-gray-500" />
						)}
					</div>
					{showBelumDiproses && (
						<TabelPelimpahan
							data={belumDiprosesData}
							lihat={true}
							currentPage={currentPageBelum}
							totalPages={totalPagesBelum}
							onPageChange={setCurrentPageBelum}
							indexOfLastItem={belumDiprosesEnd}
							itemsPerPage={itemsPerPage}
						/>
					)}
				</div>

				<div className="bg-white rounded-md drop-shadow-sm shadow-inner p-4 sm:p-6 mb-6">
					<div
						className="flex justify-between items-center mb-2 cursor-pointer"
						onClick={() => setShowDisetujui(!showDisetujui)}>
						<h2 className="text-base sm:text-lg font-semibold">
							Pelimpahan Tugas Yang Anda Setujui
						</h2>
						{showDisetujui ? (
							<FaChevronUp className="text-gray-500" />
						) : (
							<FaChevronDown className="text-gray-500" />
						)}
					</div>
					{showDisetujui && (
						<TabelPelimpahan
							data={disetujuiData}
							lihat={false}
							currentPage={currentPageDisetujui}
							totalPages={totalPagesDisetujui}
							onPageChange={setCurrentPageDisetujui}
							indexOfLastItem={disetujuiEnd}
							itemsPerPage={itemsPerPage}
						/>
					)}
				</div>

				<div className="bg-white rounded-md drop-shadow-sm shadow-inner p-4 sm:p-6 mb-6">
					<div
						className="flex justify-between items-center mb-2 cursor-pointer"
						onClick={() => setShowTidakDisetujui(!showTidakDisetujui)}>
						<h2 className="text-base sm:text-lg font-semibold">
							Pelimpahan Tugas Yang Anda Tolak
						</h2>
						{showTidakDisetujui ? (
							<FaChevronUp className="text-gray-500" />
						) : (
							<FaChevronDown className="text-gray-500" />
						)}
					</div>
					{showTidakDisetujui && (
						<TabelPelimpahan
							data={ditolakData}
							lihat={false}
							currentPage={currentPageDitolak}
							totalPages={totalPagesDitolak}
							onPageChange={setCurrentPageDitolak}
							indexOfLastItem={ditolakEnd}
							itemsPerPage={itemsPerPage}
						/>
					)}
				</div>
			</div>
		</MainLayout>
	);
};

export default PermohonanPelimpahanTugas;
