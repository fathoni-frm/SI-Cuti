import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import { Formik } from "formik";
import { toast } from "react-toastify";
import MainLayout from "../Layouts/MainLayout";
import BackgroundItem from "../components/BackgroundItem";
import FormProfilUser from "../components/FormProfilUser";
import Spinner from "../components/Spinner";
import { FaUserEdit, FaPrint } from "react-icons/fa";

const PengaturanProfil = () => {
	const { user } = useAuthStore();
	const [initialData, setInitialData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isDownloading, setIsDownloading] = useState(false);

	useEffect(() => {
		const fetchPegawai = async () => {
			try {
				const res = await axios.get(`/pegawai/${user.id}`);
				const pegawaiData = res.data;
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
					password: "Password tidak ditampilkan",
				});
			} catch (error) {
				console.error("Gagal mengambil data pegawai:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchPegawai();
	}, [user]);

	const handleCetak = async (id) => {
		try {
			setIsDownloading(true);
			const response = await axios.get(`/pegawai/cetak/${id}`, {
				responseType: "blob",
			});
			const blob = new Blob([response.data], { type: "application/pdf" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `profil-${id}.pdf`;
			a.click();
		} catch (error) {
			console.error("Gagal mencetak PDF:", error);
			toast.error("Gagal mencetak data diri");
		} finally {
			setIsDownloading(false);
		}
	};

	if (loading) return <Spinner />;

	return (
		<MainLayout role={user.role}>
			<div className="p-6 w-full bg-gray-100">
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
					<h1 className="text-left text-xl lg:text-2xl font-bold text-gray-800">
						Profil Saya
					</h1>
					<div className="flex justify-around gap-2">
						<Link
							onClick={() => handleCetak(user.id)}
							className={`flex justify-center items-center w-full gap-2 px-3 py-2 rounded-md ${
								isDownloading
									? "bg-blue-600 cursor-not-allowed"
									: "bg-blue-500 hover:bg-blue-600 text-white"
							}`}
							disabled={isDownloading}>
							{isDownloading ? (
								<>
									<div className="w-4 h-4 border-2 border-white border-dashed rounded-full animate-spin"></div>
									<p className="whitespace-nowrap text-white font-semibold">Mengunduh...</p>
								</>
							) : (
								<>
									<FaPrint />{" "}
									<p className="whitespace-nowrap">Cetak Data Diri</p>
								</>
							)}
						</Link>
						<Link
							to={`/pengaturan-profil/edit`}
							className="flex justify-center items-center w-full gap-1 bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded-md">
							<FaUserEdit /> <p className="whitespace-nowrap">Edit Data Diri</p>
						</Link>
					</div>
				</div>

				<BackgroundItem>
					<div className="p-4 sm:p-6">
						<Formik initialValues={initialData} enableReinitialize>
							{(formik) => <FormProfilUser formik={formik} isReadOnly={true} />}
						</Formik>
					</div>
				</BackgroundItem>
			</div>
		</MainLayout>
	);
};

export default PengaturanProfil;
