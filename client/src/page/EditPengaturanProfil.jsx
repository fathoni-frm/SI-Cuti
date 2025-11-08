import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../api/axios";
import useAuthStore from "../store/authStore";
import { validationSchemaEditDataDiri } from "../schemas/formPegawaiSchema";
import { Formik } from "formik";
import Swal from "sweetalert2";
import MainLayout from "../Layouts/MainLayout";
import BackgroundItem from "../components/BackgroundItem";
import FormProfilUser from "../components/FormProfilUser";
import { FaInfoCircle } from "react-icons/fa";
import { MdEditSquare } from "react-icons/md";

const EditPengaturanProfil = () => {
	const { user, getValidToken, refreshToken } = useAuthStore();
	const navigate = useNavigate();
	const [initialData, setInitialData] = useState(null);
	const formikRef = useRef();
	const [loading, setLoading] = useState(true);

	const fetchPegawai = async () => {
		try {
			const currentToken = await getValidToken();
			const res = await axios.get(`/pegawai/${user.idPegawai}`, {
				headers: {
					Authorization: `Bearer ${currentToken}`,
				},
			});
			const pegawaiData = res.data;

			const [tempatLahir, tanggalLahir] = pegawaiData.ttl
				? pegawaiData.ttl.split(", ")
				: ["", ""];

			setInitialData({
				...pegawaiData,
				tempatLahir,
				tanggalLahir,
				password: "",
			});
		} catch (err) {
			console.error("Gagal mengambil data pegawai:", err);
			toast.error("Gagal memuat data pegawai");
			navigate("/manajemen-pegawai");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		let isMounted = true;

		const fetchData = async () => {
			try {
				await fetchPegawai();
			} catch (err) {
				if (isMounted) {
					console.error("Gagal mengambil data pegawai:", err);
					toast.error("Gagal memuat data pegawai");
					navigate("/pengaturan-profil");
				}
			}
		};

		fetchData();

		const interval = setInterval(async () => {
			try {
				await refreshToken();
			} catch (err) {
				console.error("Gagal memperbarui token:", err);
			}
		}, 14 * 60 * 1000);

		return () => {
			isMounted = false;
			clearInterval(interval);
		};
	}, [user.idPegawai, refreshToken, navigate]);

	const handleSubmit = async (values) => {
		Swal.fire({
			title: "Yakin ingin mengubah data?",
			text: "Data yang diubah tidak dapat dikembalikan!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#efb100",
			cancelButtonColor: "#3085d6",
			confirmButtonText: "Ya, ubah!",
			cancelButtonText: "Batal",
		}).then(async (result) => {
			if (result.isConfirmed) {
				try {
					const ttl = `${values.tempatLahir}, ${values.tanggalLahir}`;
					const updatedValues = {
						...values,
						ttl,
					};

					delete updatedValues.User;

					const token = await getValidToken();
					await axios.put(`/pegawai/${user.idPegawai}`, updatedValues, {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});

					toast.success("Data berhasil diperbarui");
					navigate("/pengaturan-profil");
				} catch (err) {
					console.error("Gagal mengubah data pegawai:", err);
					toast.error("Gagal mengubah data pegawai");
				}
			}
		});
	};

	return (
		<MainLayout role={user.role}>
			<div className="p-6 w-full bg-gray-100">
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
					<h1 className="text-left text-xl lg:text-2xl font-bold text-gray-800">
						<span className="text-gray-500">Profil Saya</span> / Edit Data Diri
					</h1>
				</div>

				<BackgroundItem>
					<div
						role="alert"
						className="flex items-start w-full p-4 text-sm border-l-4 rounded-t-md shadow-sm lg:max-w-7xl text-yellow-800 bg-yellow-50 border-yellow-400">
						<FaInfoCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
						<div className="text-justify">
							<p className="mb-2">
                                <span className="font-semibold">Perhatian :</span> Data yang diubah tidak dapat
                                dikembalikan! Harap periksa kembali sebelum menyimpan perubahan.
							</p>
							<p>
								Beberapa data tidak dapat di ubah oleh pegawai. Jika ingin mengubah data yang tidak
								dapat di ubah, silahkan hubungi administrator sistem.
							</p>
						</div>
					</div>
					<div className="p-4 sm:p-6">
						{!loading && initialData && (
							<Formik
								initialValues={initialData}
								validationSchema={validationSchemaEditDataDiri}
								onSubmit={handleSubmit}
								enableReinitialize
								innerRef={formikRef}>
								{(formik) => (
									<FormProfilUser formik={formik}>
										<button
											type="submit"
											className="flex justify-self-end items-center bg-yellow-500 text-white px-4 py-2 mt-4 gap-2 rounded-lg hover:bg-yellow-600 shadow cursor-pointer">
											<MdEditSquare className="text-lg" />
											Simpan Perubahan Data
										</button>
									</FormProfilUser>
								)}
							</Formik>
						)}
					</div>
				</BackgroundItem>
			</div>
		</MainLayout>
	);
};

export default EditPengaturanProfil;
