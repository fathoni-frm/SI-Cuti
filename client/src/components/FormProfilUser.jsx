import { useEffect } from "react";
import { useFormikContext, Form, Field, ErrorMessage } from "formik";
import { FaUser, FaSchoolFlag } from "react-icons/fa6";
import { HiBuildingOffice2 } from "react-icons/hi2";

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
	placeholder,
}) => (
	<div>
		<Label htmlFor={name}>{label}</Label>
		{isReadOnly ? (
			<Field name={name}>
				{({ field }) => (
					<div
						className={`w-full border border-gray-300 px-3 py-2 rounded-md cursor-not-allowed ${
							password ? "font-bold bg-gray-50" : "bg-gray-200"
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
					<div className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-200 cursor-not-allowed">
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

const FormProfilUser = ({ isReadOnly = false, children }) => {
	const { values, setFieldValue } = useFormikContext();
	const pendidikan = values.pendidikanTerakhir;
	const isSekolah = [
		"SD / Sederajat",
		"SMP / Sederajat",
		"SMA / Sederajat",
	].includes(pendidikan);

	return (
		<Form>
			{/* Informasi Pribadi */}
			<InputGroup title="Informasi Pribadi" icon={<FaUser />}>
				<TextInput name="nama" label="Nama Lengkap" isReadOnly={true} />
				<TextInput name="nip" label="NIP" isReadOnly={true} />
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
				<TextInput name="noHp" label="Nomor HP" isReadOnly={isReadOnly} />
				<TextInput
					name="emailPribadi"
					label="Email Pribadi"
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
					isReadOnly={true}
				/>

				{pendidikan && isSekolah && (
					<TextInput
						name="namaSekolah"
						label="Nama Sekolah"
						isReadOnly={true}
					/>
				)}

				{pendidikan && !isSekolah && (
					<>
						<TextInput
							name="namaUniversitas"
							label="Nama Institusi / Universitas"
							isReadOnly={true}
						/>
						<TextInput
							name="namaFakultas"
							label="Nama Fakultas"
							isReadOnly={true}
							placeholder="Masukkan Nama Fakultas"
						/>
						<TextInput
							name="namaJurusan"
							label="Nama Jurusan"
							isReadOnly={true}
						/>
						<TextInput
							name="namaProgramStudi"
							label="Nama Program Studi"
							isReadOnly={true}
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
					isReadOnly={true}
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
					isReadOnly={true}
				/>
				<SelectInput
					name="pangkat"
					label="Pangkat"
					options={[
						"Juru Muda",
						"Juru Muda Tingkat I",
						"Juru",
						"Juru Tingkat I",
						"Pengatur Muda",
						"Pengatur Muda Tingkat I",
						"Pengatur",
						"Pengatur Tingkat I",
						"Penata Muda",
						"Penata Muda Tingkat I",
						"Penata",
						"Penata Tingkat I",
						"Pembina",
						"Pembina Tingkat I",
						"Pembina Utama Muda",
						"Pembina Utama Madya",
						"Pembina Utama",
					]}
					isReadOnly={true}
				/>
				<SelectInput
					name="golongan"
					label="Golongan"
					options={[
						"I/a",
						"I/b",
						"I/c",
						"I/d",
						"II/a",
						"II/b",
						"II/c",
						"II/d",
						"III/a",
						"III/b",
						"III/c",
						"III/d",
						"IV/a",
						"IV/b",
						"IV/c",
						"IV/d",
						"IV/e",
					]}
					isReadOnly={true}
				/>
				<SelectInput
					name="jabatanStruktural"
					label="Jabatan Struktural"
					options={[
						"Kepala Balai Besar",
						"Kepala Bagian Umum",
						"Ketua Tim",
						"Kepala Satuan Pelayanan",
						"Lainnya",
					]}
					isReadOnly={true}
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
					isReadOnly={true}
				/>
				<TextInput
					name="alamatKantor"
					label="Alamat Kantor"
					isReadOnly={true}
				/>
				<TextInput name="emailKantor" label="Email Kantor" isReadOnly={true} />
			</InputGroup>

			<div className="text-right mt-6">{children}</div>
		</Form>
	);
};

export default FormProfilUser;
