import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import { Formik } from "formik";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import MainLayout from "../Layouts/MainLayout";
import BackgroundItem from "../components/BackgroundItem";
import FormDataPegawai from "../components/FormDataPegawai";
import TabelKuotaCuti from "../components/TabelKuotaCuti";
import Spinner from "../components/Spinner";
import { FaTrash, FaEdit, FaCalendarAlt } from "react-icons/fa";

const DetailPegawai = () => {
	const { user } = useAuthStore();
	const { id } = useParams();
	const navigate = useNavigate();
	const token = useAuthStore((state) => state.accessToken);
	const [initialData, setInitialData] = useState(null);
	const [kuotaCuti, setKuotaCuti] = useState([]);
	const [loading, setLoading] = useState(true);

	const filteredKuotaCuti = kuotaCuti.filter((cuti) =>{
		if(initialData.jenisKelamin === "Laki-laki" && cuti.jenisCuti === "Cuti Melahirkan"){
			return false;
		}
		return true;
	});

	useEffect(() => {
		const fetchPegawai = async () => {
			try {
				const res = await axios.get(`/pegawai/${id}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				const pegawaiData = res.data;
				const akun = pegawaiData.User || {};
				const [tempatLahir, tanggalLahir] = pegawaiData.ttl
					? pegawaiData.ttl.split(", ")
					: ["", ""];

				const formattedDate = tanggalLahir
					? new Date(tanggalLahir)
							.toLocaleDateString("id-ID", {
								day: "2-digit",
								month: "2-digit",
								year: "numeric",
							})
							.replace(/\//g, "-")
					: "";

				setInitialData({
					...pegawaiData,
					tempatLahir,
					tanggalLahir: formattedDate,
					username: akun.username,
					role: akun.role,
					password: "Password tidak ditampilkan",
				});

				const kuotaRes = await axios.get(`/kuota-cuti/${id}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				setKuotaCuti(kuotaRes.data);
			} catch (error) {
				console.error("Gagal mengambil data pegawai:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchPegawai();
	}, [id]);

	const handleDelete = (id) => {
		Swal.fire({
			title: "Yakin ingin menghapus?",
			text: "Data pegawai yang dihapus tidak dapat dikembalikan!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#d33",
			cancelButtonColor: "#3085d6",
			confirmButtonText: "Ya, hapus!",
			cancelButtonText: "Batal",
		}).then(async (result) => {
			if (result.isConfirmed) {
				try {
					await axios.delete(`/pegawai/${id}`);
					toast.success("Data pegawai berhasil dihapus!");
					navigate("/manajemen-pegawai");
				} catch (error) {
					Swal.fire(
						"Gagal",
						error.response?.data?.msg || "Terjadi kesalahan",
						"error"
					);
				}
			}
		});
	};

	if (loading) return <Spinner />;

	return (
		<MainLayout role={user.role}>
			<div className="p-4 sm:p-6 w-full">
				{/* Title & Action Buttons */}
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
					<h1 className="text-left text-xl lg:text-2xl font-bold text-gray-800">
						<span className="text-gray-500">Manajemen Pegawai</span> / Detail
						Pegawai
					</h1>
					<div className="flex justify-around gap-2">
						<Link
							to={`/manajemen-pegawai/edit/${id}`}
							className="flex justify-center items-center w-full gap-1 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md">
							<FaEdit /> Edit
						</Link>
						<Link
							onClick={() => handleDelete(id)}
							className="flex justify-center items-center w-full gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">
							<FaTrash /> Hapus
						</Link>
					</div>
				</div>

				{/* Informasi Pegawai */}
				<BackgroundItem>
					<div className="p-4 sm:p-6">
						<Formik initialValues={initialData} enableReinitialize>
							{(formik) => (
								<FormDataPegawai formik={formik} isReadOnly={true} />
							)}
						</Formik>

						{/* Informasi Kuota Cuti Pegawai */}
						<BackgroundItem
							title="Informasi Kuota Cuti Pegawai"
							icon={<FaCalendarAlt />}>
							<TabelKuotaCuti data={filteredKuotaCuti} />
						</BackgroundItem>
					</div>
				</BackgroundItem>
			</div>
		</MainLayout>
	);
};

export default DetailPegawai;
