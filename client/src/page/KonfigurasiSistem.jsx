import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Select from "react-select";
import Swal from "sweetalert2";
import MainLayout from "../Layouts/MainLayout";
import useAuthStore from "../store/authStore";
import Spinner from "../components/Spinner";
import { FaUserCog, FaSave } from "react-icons/fa";

const KonfigurasiSistem = () => {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [kepalaBalaiList, setKepalaBalaiList] = useState([]);
    const [kepalaBagianList, setKepalaBagianList] = useState([]);
    const [konfigurasi, setKonfigurasi] = useState({
        idKepalaBalai: null,
        idKepalaBagianUmum: null,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resKonfig, resBalai, resBagian] = await Promise.all([
                    axios.get("/konfigurasi-sistem"),
                    axios.get("/list/kepala-balai"),
                    axios.get("/list/kepala-bagian-umum"),
                ]);
                setKonfigurasi({
                    idKepalaBalai: resKonfig.data?.idKepalaBalai || null,
                    idKepalaBagianUmum: resKonfig.data?.idKepalaBagianUmum || null,
                });
                setKepalaBalaiList(resBalai.data);
                setKepalaBagianList(resBagian.data);
            } catch (error) {
                console.error("Gagal memuat data konfigurasi:", error);
                Swal.fire({
                    icon: "error",
                    title: "Gagal Memuat Data",
                    text: "Terjadi kesalahan saat mengambil data konfigurasi sistem.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSave = async () => {
        if (!konfigurasi.idKepalaBalai || !konfigurasi.idKepalaBagianUmum) {
            Swal.fire({
                icon: "warning",
                title: "Data Belum Lengkap",
                text: "Pastikan Kepala Balai dan Kepala Bagian Umum sudah dipilih.",
            });
            return;
        }

        try {
            setSaving(true);
            await axios.put("/konfigurasi-sistem", {
                idKepalaBalai: konfigurasi.idKepalaBalai,
                idKepalaBagianUmum: konfigurasi.idKepalaBagianUmum,
            });

            Swal.fire({
                icon: "success",
                title: "Berhasil Disimpan!",
                text: "Konfigurasi sistem berhasil diperbarui.",
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error("Gagal menyimpan konfigurasi:", error);
            Swal.fire({
                icon: "error",
                title: "Gagal Menyimpan",
                text: "Terjadi kesalahan saat memperbarui konfigurasi.",
            });
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) return <Spinner />;

    const optionBalai = kepalaBalaiList.map((p) => ({
        value: p.id,
        label: `${p.nama} (${p.nip})`,
    }));

    const optionBagian = kepalaBagianList.map((p) => ({
        value: p.id,
        label: `${p.nama} (${p.nip})`,
    }));

    const selectedBalai = optionBalai.find(
        (opt) => opt.value === konfigurasi.idKepalaBalai
    );
    const selectedBagian = optionBagian.find(
        (opt) => opt.value === konfigurasi.idKepalaBagianUmum
    );

    return (
        <MainLayout role={user.role}>
            <div className="w-full p-6 bg-gray-100 min-h-screen">
                <div className="flex items-center gap-3 mb-6">
                    <FaUserCog className="text-blue-500 text-2xl" />
                    <h1 className="text-2xl font-bold text-gray-800">
                        Konfigurasi Sistem
                    </h1>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
                    {/* Kepala Balai */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Kepala Balai
                        </label>
                        <Select
                            options={optionBalai}
                            value={selectedBalai || null}
                            placeholder="Pilih Kepala Balai..."
                            onChange={(opt) =>
                                setKonfigurasi((prev) => ({
                                    ...prev,
                                    idKepalaBalai: opt ? opt.value : null,
                                }))
                            }
                            isClearable
                            className="w-full"
                            classNamePrefix="react-select"
                        />
                    </div>

                    {/* Kepala Bagian Umum */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Kepala Bagian Umum
                        </label>
                        <Select
                            options={optionBagian}
                            value={selectedBagian || null}
                            placeholder="Pilih Kepala Bagian Umum..."
                            onChange={(opt) =>
                                setKonfigurasi((prev) => ({
                                    ...prev,
                                    idKepalaBagianUmum: opt ? opt.value : null,
                                }))
                            }
                            isClearable
                            className="w-full"
                            classNamePrefix="react-select"
                        />
                    </div>

                    {/* Tombol Simpan */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-white transition-all ${saving
                                    ? "bg-blue-300 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                                }`}
                        >
                            {saving ? (
                                <>
                                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <FaSave /> Simpan Perubahan
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default KonfigurasiSistem;