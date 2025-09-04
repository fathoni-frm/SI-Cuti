const { getPengajuanCutiById, getRiwayatCutiByPegawai, getDraftCutiByPegawai, getDraftById, createPengajuanCuti, updatePengajuanCuti, deletePengajuanCuti } = require("../controllers/pengajuanCutiController");
const { PengajuanCuti, VerifikasiCuti, Pegawai, PelimpahanTugas, Notifikasi } = require("../models");
const { Op } = require("sequelize");

jest.mock("../models", () => ({
    PengajuanCuti: { 
        findAll: jest.fn(),
        findByPk: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
    },
    VerifikasiCuti: {
        findOne: jest.fn(),
        create: jest.fn(),
        destroy: jest.fn(),
    },
    Pegawai: {
        findByPk: jest.fn(),
        findOne: jest.fn(),
    },
    PelimpahanTugas: {
        findOne: jest.fn(),
        create: jest.fn(),
    },
    Notifikasi: {
        create: jest.fn(),
    },
}));

describe("pengajuanCutiController.getPengajuanCutiById", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("WT-PC-01-01: Mengembalikan data pengajuan cuti lengkap dengan relasi jika ditemukan", async () => {
    req.params.id = 1;

    const mockData = {
      id: 1,
      alasan: "Cuti tahunan",
      pegawai: { id: 10, nama: "Fathoni" },
      VerifikasiCutis: [
        { id: 100, status: "disetujui", verifikator: { id: 20, nama: "Atasan A" } },
      ],
      PelimpahanTugas: [
        { id: 200, deskripsi: "Tugas A", penerima: { id: 30, nama: "Pegawai B" } },
      ],
    };

    PengajuanCuti.findByPk.mockResolvedValue(mockData);

    await getPengajuanCutiById(req, res);

    expect(PengajuanCuti.findByPk).toHaveBeenCalledWith(1, {
      include: [
        { model: VerifikasiCuti, include: [{ model: Pegawai, as: "verifikator" }] },
        { model: Pegawai, as: "pegawai" },
        { model: PelimpahanTugas, include: [{ model: Pegawai, as: "penerima" }] },
      ],
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  test("WT-PC-01-02: Mengembalikan 404 jika data pengajuan cuti tidak ditemukan", async () => {
    req.params.id = 999;

    PengajuanCuti.findByPk.mockResolvedValue(null);

    await getPengajuanCutiById(req, res);

    expect(PengajuanCuti.findByPk).toHaveBeenCalledWith(999, {
      include: [
        { model: VerifikasiCuti, include: [{ model: Pegawai, as: "verifikator" }] },
        { model: Pegawai, as: "pegawai" },
        { model: PelimpahanTugas, include: [{ model: Pegawai, as: "penerima" }] },
      ],
    });

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: "Data tidak ditemukan" });
  });
});

describe("pengajuanCutiController.getRiwayatCutiByPegawai", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { idPegawai: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("WT-PC-02-01: Mengembalikan semua pengajuan cuti (selain Draft) untuk pegawai tertentu, urut updatedAt descending", async () => {
    const mockData = [
      { id: 2, status: "Disetujui", updatedAt: "2025-08-19T10:00:00Z" },
      { id: 1, status: "Diajukan", updatedAt: "2025-08-18T09:00:00Z" },
    ];

    PengajuanCuti.findAll.mockResolvedValue(mockData);

    await getRiwayatCutiByPegawai(req, res);

    expect(PengajuanCuti.findAll).toHaveBeenCalledWith({
      where: {
        status: { [Op.ne]: "Draft" },
        idPegawai: 1,
      },
      order: [["updatedAt", "DESC"]],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  test("WT-PC-02-02: Mengembalikan array kosong jika pegawai tidak memiliki riwayat cuti selain Draft", async () => {
    req.params.idPegawai = 2;
    PengajuanCuti.findAll.mockResolvedValue([]);

    await getRiwayatCutiByPegawai(req, res);

    expect(PengajuanCuti.findAll).toHaveBeenCalledWith({
      where: {
        status: { [Op.ne]: "Draft" },
        idPegawai: 2,
      },
      order: [["updatedAt", "DESC"]],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});

describe("pengajuanCutiController.getDraftCutiByPegawai", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { idPegawai: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("WT-PC-03-01: Mengembalikan semua pengajuan cuti draft untuk pegawai tertentu", async () => {
    const mockData = [
      { id: 1, status: "Draft", idPegawai: 1, updatedAt: "2025-08-19T10:00:00Z" },
      { id: 2, status: "Draft", idPegawai: 1, updatedAt: "2025-08-18T10:00:00Z" },
    ];

    PengajuanCuti.findAll.mockResolvedValue(mockData);

    await getDraftCutiByPegawai(req, res);

    expect(PengajuanCuti.findAll).toHaveBeenCalledWith({
      where: { status: "Draft", idPegawai: 1 },
      order: [["updatedAt", "DESC"]],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  test("WT-PC-03-02: Mengembalikan array kosong jika tidak ada pengajuan cuti draft", async () => {
    req.params.idPegawai = 2;
    PengajuanCuti.findAll.mockResolvedValue([]);

    await getDraftCutiByPegawai(req, res);

    expect(PengajuanCuti.findAll).toHaveBeenCalledWith({
      where: { status: "Draft", idPegawai: 2 },
      order: [["updatedAt", "DESC"]],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});

describe("pengajuanCutiController.getDraftById", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  test("WT-PC-04-01: Mengembalikan detail draft cuti sesuai id jika statusnya 'Draft'", async () => {
    const mockDraft = {
      id: 1,
      status: "Draft",
      alasan: "Cuti tahunan",
      VerifikasiCutis: [{ id: 1, status: "Pending" }],
      PelimpahanTugas: [{ id: 1, nama: "Tugas A" }]
    };

    PengajuanCuti.findOne.mockResolvedValue(mockDraft);

    await getDraftById(req, res);

    expect(PengajuanCuti.findOne).toHaveBeenCalledWith({
      where: { id: 1, status: "Draft" },
      include: [VerifikasiCuti, PelimpahanTugas]
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockDraft);
  });

  test("WT-PC-04-02: Mengembalikan 404 jika draft tidak ditemukan atau statusnya bukan 'Draft'", async () => {
    req.params.id = 2;
    PengajuanCuti.findOne.mockResolvedValue(null);

    await getDraftById(req, res);

    expect(PengajuanCuti.findOne).toHaveBeenCalledWith({
      where: { id: 2, status: "Draft" },
      include: [VerifikasiCuti, PelimpahanTugas]
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: "Draft tidak ditemukan" });
  });
});

describe("pengajuanCutiController.getDraftCutiByPegawai", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { idPegawai: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("WT-PC-03-01: Mengembalikan semua pengajuan cuti draft untuk pegawai tertentu", async () => {
    const mockData = [
      { id: 1, status: "Draft", idPegawai: 1, updatedAt: "2025-08-19T10:00:00Z" },
      { id: 2, status: "Draft", idPegawai: 1, updatedAt: "2025-08-18T10:00:00Z" },
    ];

    PengajuanCuti.findAll.mockResolvedValue(mockData);

    await getDraftCutiByPegawai(req, res);

    expect(PengajuanCuti.findAll).toHaveBeenCalledWith({
      where: { status: "Draft", idPegawai: 1 },
      order: [["updatedAt", "DESC"]],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  test("WT-PC-03-02: Mengembalikan array kosong jika tidak ada pengajuan cuti draft", async () => {
    req.params.idPegawai = 2;
    PengajuanCuti.findAll.mockResolvedValue([]);

    await getDraftCutiByPegawai(req, res);

    expect(PengajuanCuti.findAll).toHaveBeenCalledWith({
      where: { status: "Draft", idPegawai: 2 },
      order: [["updatedAt", "DESC"]],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});

describe("pengajuanCutiController.createPengajuanCuti", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        idPegawai: 1,
        jenisCuti: "Tahunan",
        tanggalPengajuan: "2025-08-19",
        totalKuota: 12,
        sisaKuota: 10,
        tanggalMulai: "2025-09-01",
        tanggalSelesai: "2025-09-05",
        durasi: 5,
        isDraft: "false",
        daftarAtasan: JSON.stringify([{ id: 99, jenis: "Atasan Langsung" }]),
      },
      file: { filename: "lampiran.pdf" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("WT-PC-05-01: Membuat pengajuan cuti baru bukan draft tanpa pelimpahan tugas, notifikasi ke verifikator pertama", async () => {
    const mockPengajuan = { id: 1, idPegawai: 1, jenisCuti: "Tahunan", status: "Diproses" };
    const mockVerifikator = { idPimpinan: 99 };

    PengajuanCuti.create.mockResolvedValue(mockPengajuan);
    VerifikasiCuti.create.mockResolvedValue({});
    Pegawai.findOne.mockResolvedValue(null); 
    VerifikasiCuti.findOne.mockResolvedValue(mockVerifikator);
    Pegawai.findByPk.mockResolvedValue({ id: 1, nama: "Budi" });
    Notifikasi.create.mockResolvedValue({});

    await createPengajuanCuti(req, res);

    expect(PengajuanCuti.create).toHaveBeenCalled();
    expect(VerifikasiCuti.create).toHaveBeenCalled();
    expect(Notifikasi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        idPenerima: 99,
        judul: "Permohonan Cuti Baru",
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: "Pengajuan cuti berhasil dibuat",
        data: mockPengajuan,
      })
    );
  });

  test("WT-PC-05-02: Membuat pengajuan cuti draft tanpa pelimpahan tugas, tidak ada notifikasi dikirim", async () => {
    req.body.isDraft = "true";
    const mockPengajuan = { id: 2, idPegawai: 1, status: "Draft" };

    PengajuanCuti.create.mockResolvedValue(mockPengajuan);
    VerifikasiCuti.create.mockResolvedValue({});
    Pegawai.findOne.mockResolvedValue(null);

    await createPengajuanCuti(req, res);

    expect(PengajuanCuti.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: "Draft" })
    );
    expect(Notifikasi.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ msg: "Pengajuan cuti berhasil dibuat" })
    );
  });

  test("WT-PC-05-03: Membuat pengajuan cuti bukan draft dengan pelimpahan tugas, notifikasi dikirim ke penerima tugas", async () => {
    req.body.isDraft = "false";
    req.body.idPenerimaTugas = 55;
    req.body.daftarAtasan = "[]";

    const mockPengajuan = { id: 3, idPegawai: 1, status: "Diproses" };

    PengajuanCuti.create.mockResolvedValue(mockPengajuan);
    PelimpahanTugas.create.mockResolvedValue({});
    Pegawai.findByPk.mockResolvedValue({ id: 1, nama: "Budi" });
    Notifikasi.create.mockResolvedValue({});

    await createPengajuanCuti(req, res);

    expect(PelimpahanTugas.create).toHaveBeenCalledWith(
      expect.objectContaining({
        idPengajuan: 3,
        idPenerima: 55,
      })
    );
    expect(Notifikasi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        idPenerima: 55,
        judul: "Pelimpahan Tugas Baru",
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("WT-PC-05-04: Nilai alasanCuti, alamatCuti, idPenerimaTugas kosong/null diproses jadi null", async () => {
    req.body.alasanCuti = "null";
    req.body.alamatCuti = "";
    req.body.idPenerimaTugas = "null";

    const mockPengajuan = { id: 4, idPegawai: 1, status: "Diproses" };
    PengajuanCuti.create.mockResolvedValue(mockPengajuan);

    await createPengajuanCuti(req, res);

    expect(PengajuanCuti.create).toHaveBeenCalledWith(
      expect.objectContaining({
        alasanCuti: null,
        alamatCuti: null,
        status: "Diproses",
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe("pengajuanCutiController.updatePengajuanCuti", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { id: 1 },
      body: {
        tanggalMulai: "2025-08-20",
        tanggalSelesai: "2025-08-25",
        durasi: 5,
        isDraft: "true",
        daftarAtasan: JSON.stringify([{ id: 10, jenis: "Atasan" }])
      },
      file: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  test("WT-PC-06-01: Berhasil memperbarui draft tanpa pelimpahan tugas (tidak ada notifikasi)", async () => {
    PengajuanCuti.findByPk.mockResolvedValue({ id: 1, status: "Draft", update: jest.fn().mockResolvedValue(true) });
    PelimpahanTugas.findOne.mockResolvedValue(null);
    VerifikasiCuti.destroy.mockResolvedValue(1);
    VerifikasiCuti.create.mockResolvedValue(true);
    Pegawai.findOne.mockResolvedValue(null);

    await updatePengajuanCuti(req, res);

    expect(PengajuanCuti.findByPk).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: "Pengajuan cuti berhasil diperbarui / diajukan"
    }));
    expect(Notifikasi.create).not.toHaveBeenCalled();
  });

  test("WT-PC-06-02: Berhasil memperbarui non-draft tanpa pelimpahan tugas (notifikasi ke verifikator pertama)", async () => {
    req.body.isDraft = "false";
    PengajuanCuti.findByPk.mockResolvedValue({ id: 1, status: "Draft", jenisCuti: "Tahunan", idPegawai: 99, update: jest.fn().mockResolvedValue(true) });
    PelimpahanTugas.findOne.mockResolvedValue(null);
    VerifikasiCuti.destroy.mockResolvedValue(1);
    VerifikasiCuti.create.mockResolvedValue(true);
    VerifikasiCuti.findOne.mockResolvedValue({ idPimpinan: 10 });
    Pegawai.findByPk.mockResolvedValue({ id: 99, nama: "Budi" });

    await updatePengajuanCuti(req, res);

    expect(Notifikasi.create).toHaveBeenCalledWith(expect.objectContaining({
      idPenerima: 10,
      judul: "Permohonan Cuti Baru"
    }));
  });

  test("WT-PC-06-03: Berhasil memperbarui non-draft dengan pelimpahan tugas baru", async () => {
    req.body.isDraft = "false";
    req.body.idPenerimaTugas = 77;
    req.body.daftarAtasan = "[]";

    PengajuanCuti.findByPk.mockResolvedValue({ id: 1, status: "Draft", idPegawai: 99, jenisCuti: "Tahunan", update: jest.fn().mockResolvedValue(true) });
    PelimpahanTugas.findOne.mockResolvedValue(null);
    PelimpahanTugas.create.mockResolvedValue(true);
    VerifikasiCuti.destroy.mockResolvedValue(1);
    VerifikasiCuti.create.mockResolvedValue(true);
    Pegawai.findByPk.mockResolvedValue({ id: 99, nama: "Budi" });

    await updatePengajuanCuti(req, res);

    expect(PelimpahanTugas.create).toHaveBeenCalled();
    expect(Notifikasi.create).toHaveBeenCalledWith(expect.objectContaining({
      idPenerima: 77,
      judul: "Pelimpahan Tugas Baru"
    }));
  });

  test("WT-PC-06-04: Berhasil memperbarui non-draft dengan memperbarui pelimpahan tugas yang ada", async () => {
    req.body.isDraft = "false";
    req.body.idPenerimaTugas = 55;

    PengajuanCuti.findByPk.mockResolvedValue({ id: 1, status: "Draft", idPegawai: 99, update: jest.fn().mockResolvedValue(true) });
    PelimpahanTugas.findOne.mockResolvedValue({ update: jest.fn().mockResolvedValue(true) });
    VerifikasiCuti.destroy.mockResolvedValue(1);
    VerifikasiCuti.create.mockResolvedValue(true);
    Pegawai.findByPk.mockResolvedValue({ id: 99, nama: "Budi" });

    await updatePengajuanCuti(req, res);

    expect(Notifikasi.create).toHaveBeenCalledWith(expect.objectContaining({
      idPenerima: 55
    }));
  });

  test("WT-PC-06-05: Berhasil memperbarui non-draft dengan menghapus pelimpahan tugas yang ada", async () => {
    req.body.isDraft = "false";
    req.body.idPenerimaTugas = null;

    PengajuanCuti.findByPk.mockResolvedValue({ id: 1, status: "Draft", idPegawai: 99, update: jest.fn().mockResolvedValue(true) });
    PelimpahanTugas.findOne.mockResolvedValue({ destroy: jest.fn().mockResolvedValue(true) });
    VerifikasiCuti.destroy.mockResolvedValue(1);
    VerifikasiCuti.create.mockResolvedValue(true);
    VerifikasiCuti.findOne.mockResolvedValue({ idPimpinan: 123 });
    Pegawai.findByPk.mockResolvedValue({ id: 99, nama: "Budi" });

    await updatePengajuanCuti(req, res);

    expect(Notifikasi.create).toHaveBeenCalledWith(expect.objectContaining({
      idPenerima: 123,
      judul: "Permohonan Cuti Baru"
    }));
  });

  test("WT-PC-06-06: Nilai alasanCuti, alamatCuti, idPenerimaTugas kosong menjadi null", async () => {
    req.body.alasanCuti = "null";
    req.body.alamatCuti = "";
    req.body.idPenerimaTugas = "null";

    PengajuanCuti.findByPk.mockResolvedValue({ id: 1, status: "Draft", update: jest.fn().mockResolvedValue(true) });
    PelimpahanTugas.findOne.mockResolvedValue(null);
    VerifikasiCuti.destroy.mockResolvedValue(1);
    VerifikasiCuti.create.mockResolvedValue(true);

    await updatePengajuanCuti(req, res);

    expect(PengajuanCuti.findByPk).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("WT-PC-06-07: Gagal memperbarui karena status bukan Draft", async () => {
    PengajuanCuti.findByPk.mockResolvedValue({ id: 1, status: "Diproses" });

    await updatePengajuanCuti(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: "Pengajuan cuti tidak dapat diubah karena sudah diajukan" });
  });
});

describe("pengajuanCutiController.deletePengajuanCuti", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: "1" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  test("WT-PC-07-01: Menghapus pengajuan cuti dengan status Draft", async () => {
    const mockPengajuan = { 
      id: 1, 
      status: "Draft", 
      destroy: jest.fn()
    };

    PengajuanCuti.findByPk.mockResolvedValue(mockPengajuan);

    await deletePengajuanCuti(req, res);

    expect(PengajuanCuti.findByPk).toHaveBeenCalledWith("1");
    expect(mockPengajuan.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: "Pengajuan cuti berhasil dihapus" });
  });

  test("WT-PC-07-02: Gagal menghapus pengajuan cuti karena data tidak ditemukan", async () => {
    PengajuanCuti.findByPk.mockResolvedValue(null);

    await deletePengajuanCuti(req, res);

    expect(PengajuanCuti.findByPk).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: "Pengajuan cuti tidak ditemukan" });
  });
});