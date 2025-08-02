import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import { formatGMT8 } from "../schemas/timeFormatter";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import MainLayout from "../Layouts/MainLayout";
import TabelPermohonan from "../components/TabelPermohonan";
import BackgroundItem from "../components/BackgroundItem";
import { LuDownload } from "react-icons/lu";

const PermohonanCutiAdmin = () => {
	const { user, accessToken } = useAuthStore();
	const MySwal = withReactContent(Swal);
	const [data, setData] = useState([]);

	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(data.length / itemsPerPage);

	const exportToExcel = async () => {
		const { value: formValues } = await MySwal.fire({
			title: "Filter Ekspor Data Cuti",
			html: (
				<div className="space-y-4">
					<div className="flex gap-4">
						<div className="flex-1">
							<label
								htmlFor="bulan"
								className="block text-sm font-medium text-gray-700 mb-1">
								Bulan Pengajuan
							</label>
							<select
								id="bulan"
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
								<option hidden>Pilih Bulan</option>
								<option value="1">Januari</option>
								<option value="2">Februari</option>
								<option value="3">Maret</option>
								<option value="4">April</option>
								<option value="5">Mei</option>
								<option value="6">Juni</option>
								<option value="7">Juli</option>
								<option value="8">Agustus</option>
								<option value="9">September</option>
								<option value="10">Oktober</option>
								<option value="11">November</option>
								<option value="12">Desember</option>
							</select>
						</div>
						<div className="flex-1">
							<label
								htmlFor="tahun"
								className="block text-sm font-medium text-gray-700 mb-1">
								Tahun Pengajuan
							</label>
							<select
								id="tahun"
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
								<option hidden>Pilih Tahun</option>
								{Array.from({ length: 26 }, (_, i) => {
									const year = 2025 + i;
									return (
										<option key={year} value={year}>
											{year}
										</option>
									);
								})}
							</select>
						</div>
					</div>
					<div>
						<label
							htmlFor="status"
							className="block text-sm font-medium text-gray-700 mb-1">
							Status Pengajuan
						</label>
						<select
							id="status"
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
							<option hidden>Pilih Status</option>
							<option value="">Semua Status</option>
							<option value="Disetujui">Disetujui</option>
							<option value="Ditolak">Ditolak</option>
							<option value="Dibatalkan">Dibatalkan</option>
						</select>
					</div>
				</div>
			),
			focusConfirm: false,
			showCancelButton: true,
			confirmButtonText: "Ekspor",
			cancelButtonText: "Batal",
			preConfirm: () => {
				const tahun = document.getElementById("tahun").value;
				const bulan = document.getElementById("bulan").value;
				const status = document.getElementById("status").value;

				if (!bulan) {
					Swal.showValidationMessage("Pilih bulan pengajuan cuti");
					return false;
				}
				if (!tahun) {
					Swal.showValidationMessage("Pilih tahun pengajuan cuti");
					return false;
				}

				if (tahun) {
					const tahunNum = parseInt(tahun);
					if (isNaN(tahunNum) || tahunNum < 2025 || tahunNum > 2100) {
						Swal.showValidationMessage("Masukkan tahun mulai 2025");
						return false;
					}
				}

				if (
					status !== "" &&
					status !== "Disetujui" &&
					status !== "Ditolak" &&
					status !== "Dibatalkan"
				) {
					Swal.showValidationMessage("Pilih status pengajuan cuti");
					return false;
				}

				return { bulan, tahun, status };
			},
		});

		if (!formValues) return;

		try {
			const { bulan, tahun, status } = formValues;

			const filteredData = data.filter((item) => {
				const tanggal = item.tanggalPengajuan
					? new Date(item.tanggalPengajuan)
					: null;
				const month =
					tanggal instanceof Date && !isNaN(tanggal)
						? (tanggal.getMonth() + 1).toString()
						: "";
				const year =
					tanggal instanceof Date && !isNaN(tanggal)
						? tanggal.getFullYear().toString()
						: "";

				const monthMatch = bulan ? month === bulan : true;
				const yearMatch = tahun ? year === tahun : true;
				const statusMatch = status ? item.status === status : true;

				return yearMatch && monthMatch && statusMatch;
			});

			if (filteredData.length === 0) {
				return Swal.fire(
					"Tidak Ada Data",
					"Tidak terdapat data pada status dan periode yang anda pilih.",
					"warning"
				);
			}

			const dataCuti = filteredData.map((item, index) => ({
				No: index + 1,
				"Tanggal Pengajuan": formatGMT8(item.tanggalPengajuan),
				"Nama Pegawai": item.pegawai.nama,
				"NIP Pegawai": item.pegawai.nip,
				"Jenis Cuti": item.jenisCuti,
				"Tanggal Mulai": formatGMT8(item.tanggalMulai, { showTime: false }),
				"Tanggal Selesai": formatGMT8(item.tanggalSelesai, { showTime: false }),
				"Kuota Cuti": item.totalKuota,
				"Sisa Kuota Cuti": item.sisaKuota,
				"Status Cuti": item.status,
				"Alamat Cuti": item.alamatCuti,
				"Alasan Cuti": item.alasanCuti,
				"Nama Penerima Tugas": item.PenerimaTugas?.nama || "-",
				"NIP Penerima Tugas": item.PenerimaTugas?.nip || "-",
			}));

			const worksheet = XLSX.utils.json_to_sheet(dataCuti);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, "Data Cuti");

			const namaBulan = [
				"Januari",
				"Februari",
				"Maret",
				"April",
				"Mei",
				"Juni",
				"Juli",
				"Agustus",
				"September",
				"Oktober",
				"November",
				"Desember",
			];
			const bulanLabel = bulan ? namaBulan[parseInt(bulan, 10) - 1] : null;
			const tanggalDownload = formatGMT8(
				new Date().toISOString().slice(0, 10),
				{
					showTime: false,
				}
			);
			let fileName = "Data Cuti";
			if (["Disetujui", "Ditolak", "Dibatalkan"].includes(status)) {
				fileName += ` ${status}`;
			}
			fileName += ` Periode ${bulanLabel} ${tahun}`;
			fileName += ` - ${tanggalDownload}.xlsx`;
			XLSX.writeFile(workbook, fileName);
		} catch (error) {
			console.error(error);
			Swal.fire("Gagal", "Terjadi kesalahan saat mengekspor data.", "error");
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get("/permohonan-cuti/admin");
				const hasil = res.data.filter((item) => item.status !== "Draft");
				setData(hasil);
			} catch (err) {
				console.error("Gagal memuat data permohonan cuti:", err);
			}
		};

		fetchData();
	}, [accessToken]);

	return (
		<MainLayout role={user.role}>
			<div className="p-4 sm:p-6 w-full">
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
					<h1 className="text-center sm:text-left text-xl lg:text-2xl font-bold text-gray-800">
						Permohonan Cuti
					</h1>
					<button
						onClick={() => exportToExcel()}
						className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start gap-2 cursor-pointer transition-colors duration-150 w-full sm:w-auto text-sm sm:text-base">
						<LuDownload className="text-lg sm:text-xl text-white flex-shrink-0" />
						Ekspor Data
					</button>
				</div>
				<BackgroundItem>
					<div className="p-4 sm:p-6">
						<h2 className="text-xl sm:text-2xl font-bold mb-5 text-center">
							Daftar Permohonan Cuti
						</h2>
						<TabelPermohonan
							data={currentItems}
							showQuota={true}
							showPagination={true}
							lihat={false}
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
							indexOfLastItem={indexOfLastItem}
							itemsPerPage={itemsPerPage}
						/>
					</div>
				</BackgroundItem>
			</div>
		</MainLayout>
	);
};

export default PermohonanCutiAdmin;
