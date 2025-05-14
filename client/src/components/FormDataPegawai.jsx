import React, { useEffect } from "react";
import { useFormikContext, Form, Field, ErrorMessage } from "formik";
import {
	pangkatToGolongan,
	golonganToPangkat,
} from "../schemas/formPegawaiSchema";
import { FaUser, FaSchoolFlag } from "react-icons/fa6";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { MdManageAccounts } from "react-icons/md";

const Label = ({ htmlFor, children }) => (
	<label
		htmlFor={htmlFor}
		className="block text-sm font-semibold text-gray-700 mb-1">
		{children}
	</label>
);

const InputGroup = ({ icon, title, children }) => (
	<div className="bg-gray-50 rounded-md shadow border border-gray-200 mb-6">
		<h2 className="text-lg font-bold flex items-center text-white bg-gradient-to-r from-gray-500 to-[#133138] px-6 py-4 rounded-t-md border-b border-gray-200">
			<span className="text-2xl mr-3">{icon}</span>
			{title}
		</h2>
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">{children}</div>
	</div>
);

const TextInput = ({
	name,
	label,
	type = "text",
	isReadOnly,
	password = false,
	placeholder, // tambahkan props ini
}) => (
	<div>
		<Label htmlFor={name}>{label}</Label>
		{isReadOnly ? (
			<Field name={name}>
				{({ field }) => (
					<div
						className={`w-full border border-gray-300 px-3 py-2 rounded-md ${
							password ? "font-bold bg-gray-50" : "bg-gray-100"
						}`}>
						{field.value || "-"}
					</div>
				)}
			</Field>
		) : (
			<>
				<Field
					type={type}
					name={name}
					placeholder={placeholder || `Masukkan ${label}`}
					className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<ErrorMessage
					name={name}
					component="div"
					className="text-sm text-red-500 mt-1"
				/>
			</>
		)}
	</div>
);

const SelectInput = ({ name, label, options, isReadOnly }) => (
	<div>
		<Label htmlFor={name}>{label}</Label>
		{isReadOnly ? (
			<Field name={name}>
				{({ field }) => (
					<div className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-100">
						{field.value || "-"}
					</div>
				)}
			</Field>
		) : (
			<>
				<Field
					as="select"
					name={name}
					className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
					<option hidden value="">
						Pilih {label}
					</option>
					{options.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</Field>
				<ErrorMessage
					name={name}
					component="div"
					className="text-sm text-red-500 mt-1"
				/>
			</>
		)}
	</div>
);

const FormDataPegawai = ({ isReadOnly = false, children }) => {
	const { values, setFieldValue } = useFormikContext();
	const pendidikan = values.pendidikanTerakhir;
	const isSekolah = [
		"SD / Sederajat",
		"SMP / Sederajat",
		"SMA / Sederajat",
	].includes(pendidikan);
	
	useEffect(() => {
		const gol = pangkatToGolongan[values.pangkat];
		if (gol && values.golongan !== gol) {
			setFieldValue("golongan", gol);
		}
	}, [values.pangkat]);

	useEffect(() => {
		const pang = golonganToPangkat[values.golongan];
		if (pang && values.pangkat !== pang) {
			setFieldValue("pangkat", pang);
		}
	}, [values.golongan]);

	return (
		<Form>
			{/* Informasi Pribadi */}
			<InputGroup title="Informasi Pribadi" icon={<FaUser />}>
				<TextInput name="nama" label="Nama Lengkap" isReadOnly={isReadOnly} />
				<TextInput name="nip" label="NIP" isReadOnly={isReadOnly} />
				<TextInput name="karpeg" label="Nomor Karpeg" isReadOnly={isReadOnly} />
				<TextInput
					name="karisKarsu"
					label="Nomor Karis / Karsu"
					isReadOnly={isReadOnly}
				/>
				<TextInput name="npwp" label="Nomor NPWP" isReadOnly={isReadOnly} />
				<SelectInput
					name="jenisKelamin"
					label="Jenis Kelamin"
					options={["Laki-laki", "Perempuan"]}
					isReadOnly={isReadOnly}
				/>
				<TextInput
					name="tempatLahir"
					label="Tempat Lahir"
					isReadOnly={isReadOnly}
				/>
				<TextInput
					name="tanggalLahir"
					label="Tanggal Lahir"
					type="date"
					isReadOnly={isReadOnly}
				/>
				<SelectInput
					name="agama"
					label="Agama"
					options={[
						"Islam",
						"Kristen",
						"Katolik",
						"Hindu",
						"Buddha",
						"Konghucu",
					]}
					isReadOnly={isReadOnly}
				/>
				<SelectInput
					name="statusKeluarga"
					label="Status Keluarga"
					options={["Menikah", "Belum Menikah", "Duda / Janda"]}
					isReadOnly={isReadOnly}
				/>
			</InputGroup>

			{/* Informasi Pendidikan */}
			<InputGroup title="Informasi Pendidikan" icon={<FaSchoolFlag />}>
				<SelectInput
					name="pendidikanTerakhir"
					label="Pendidikan Terakhir"
					options={[
						"SD / Sederajat",
						"SMP / Sederajat",
						"SMA / Sederajat",
						"D1 / D2",
						"D3",
						"S1",
						"S2",
						"S3",
					]}
					isReadOnly={isReadOnly}
				/>

				{pendidikan && isSekolah && (
					<TextInput
						name="namaSekolah"
						label="Nama Sekolah"
						isReadOnly={isReadOnly}
					/>
				)}

				{pendidikan && !isSekolah && (
					<>
						<TextInput
							name="namaUniversitas"
							label="Nama Institusi / Universitas"
							isReadOnly={isReadOnly}
						/>
						<TextInput
							name="namaFakultas"
							label="Nama Fakultas (Opsional)"
							isReadOnly={isReadOnly}
							placeholder="Masukkan Nama Fakultas"
						/>
						<TextInput
							name="namaJurusan"
							label="Nama Jurusan"
							isReadOnly={isReadOnly}
						/>
						<TextInput
							name="namaProgramStudi"
							label="Nama Program Studi"
							isReadOnly={isReadOnly}
						/>
					</>
				)}
			</InputGroup>

			{/* Informasi Kepegawaian */}
			<InputGroup title="Informasi Kepegawaian" icon={<HiBuildingOffice2 />}>
				<SelectInput
					name="unitKerja"
					label="Unit Kerja"
					options={[
						"Karantina Hewan",
						"Karantina Ikan",
						"Karantina Tumbuhan",
						"Tata Usaha",
					]}
					isReadOnly={isReadOnly}
				/>
				<SelectInput
					name="satuanKerja"
					label="Satuan Kerja"
					options={[
						"UPT Induk BBKHIT Kalimantan Timur",
						"Bandara Internasional SAMS",
						"Bandara APT Pranoto",
						"Pelabuhan Laut Semayang",
						"Pelabuhan Laut Kariangau",
						"Pelabuhan Sungai Samarinda",
						"Pelabuhan Laut Loktuan",
						"Pelabuhan Berau",
					]}
					isReadOnly={isReadOnly}
				/>
				<SelectInput
					name="pangkat"
					label="Pangkat"
					options={Object.keys(pangkatToGolongan)}
					isReadOnly={isReadOnly}
				/>
				<SelectInput
					name="golongan"
					label="Golongan"
					options={Object.values(pangkatToGolongan)}
					isReadOnly={isReadOnly}
				/>
				<SelectInput
					name="jabatanStruktural"
					label="Jabatan Struktural"
					options={["Kepala Balai Besar", "Kepala Sub Bagian Umum", "Staf"]}
					isReadOnly={isReadOnly}
				/>
				<SelectInput
					name="jabatanFungsional"
					label="Jabatan Fungsional"
					options={[
						"Analis Pengelolaan Keuangan APBN Ahli Muda",
						"Analis Perkarantinaan Tumbuhan Ahli Madya",
						"Analis Perkarantinaan Tumbuhan Ahli Muda",
						"Analis Perkarantinaan Tumbuhan Ahli Pertama",
						"Analis Sumber Daya Manusia Aparatur Ahli Muda",
						"Arsiparis Terampil",
						"Calon Analis Perkarantinaan Tumbuhan Ahli Pertama",
						"Dokter Hewan Karantina Ahli Madya",
						"Dokter Hewan Karantina Ahli Muda",
						"Dokter Hewan Karantina Ahli Pertama",
						"Paramedik Karantina Hewan Mahir",
						"Paramedik Karantina Hewan Pemula",
						"Paramedik Karantina Hewan Penyelia",
						"Paramedik Karantina Hewan Terampil",
						"Pemeriksa Karantina Tumbuhan Mahir",
						"Pemeriksa Karantina Tumbuhan Pemula",
						"Pemeriksa Karantina Tumbuhan Penyelia",
						"Pemeriksa Karantina Tumbuhan Terampil",
						"Penelaah Teknis Kebijakan",
						"Pengadministrasi Perkantoran",
						"Pengendali Hama dan Penyakit Ikan Ahli Muda",
						"Pengendali Hama Dan Penyakit Ikan Ahli Pertama",
						"Pranata Hubungan Masyarakat Ahli Pertama",
						"Pranata Keuangan APBN Mahir",
						"Pranata Keuangan APBN Penyelia",
						"Pranata Keuangan APBN Terampil",
						"Pranata Komputer Ahli Muda",
						"Pranata Komputer Ahli Pertama",
						"Pranata Sumber Daya Manusia Aparatur Terampil",
						"Teknisi Pengendali Hama dan Penyakit Ikan Mahir",
						"Teknisi Pengendali Hama dan Penyakit Ikan Penyelia",
						"Teknisi Pengendali Hama dan Penyakit Ikan Terampil",
						"Lainnya",
					]}
					isReadOnly={isReadOnly}
				/>
				<TextInput
					name="alamatKantor"
					label="Alamat Kantor"
					isReadOnly={isReadOnly}
				/>
				<TextInput name="noHp" label="Nomor HP" isReadOnly={isReadOnly} />
				<TextInput
					name="emailKantor"
					label="Email Kantor"
					isReadOnly={isReadOnly}
				/>
				<TextInput
					name="emailPribadi"
					label="Email Pribadi"
					isReadOnly={isReadOnly}
				/>
			</InputGroup>

			{/* Akun Sistem */}
			<InputGroup title="Akun Sistem" icon={<MdManageAccounts />}>
				<TextInput name="username" label="Username" isReadOnly={isReadOnly} />
				<TextInput
					name="password"
					label="Password"
					type="password"
					isReadOnly={isReadOnly}
					password={true}
				/>
				<SelectInput
					name="role"
					label="Role"
					options={["Pegawai", "Atasan", "Admin"]}
					isReadOnly={isReadOnly}
				/>
			</InputGroup>

			<div className="text-right mt-6">{children}</div>
		</Form>
	);
};

export default FormDataPegawai;
