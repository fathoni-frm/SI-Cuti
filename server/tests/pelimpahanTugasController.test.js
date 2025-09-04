const { getPermohonanPelimpahanById, getPermohonanPelimpahan, updateStatusToDiproses, verifikasiPelimpahan, } = require("../controllers/pelimpahanTugasController");
const { VerifikasiCuti, PelimpahanTugas, PengajuanCuti, Pegawai, Notifikasi } = require('../models');

jest.mock("../models", () => ({
    PelimpahanTugas: { 
        findAll: jest.fn(),
        findByPk: jest.fn() 
    },
    PengajuanCuti: { 
        update: jest.fn() 
    },
    VerifikasiCuti: { 
        findOne: jest.fn() 
    },
    Notifikasi: { 
        create: jest.fn() 
    },
    Pegawai: { 
        findByPk: jest.fn() 
    },
}));

describe("pelimpahanTugasController.getPermohonanPelimpahanById", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("WT-PT-01-01: Berhasil mengambil data pelimpahan tugas berdasarkan id yang valid", async () => {
    const mockData = {
      id: 1,
      tugas: "Menggantikan rapat",
      PengajuanCuti: { id: 10, alasan: "Cuti Tahunan", pegawai: { id: 5, nama: "Budi" } },
      penerima: { id: 7, nama: "Andi" },
    };

    PelimpahanTugas.findByPk.mockResolvedValue(mockData);

    await getPermohonanPelimpahanById(req, res);

    expect(PelimpahanTugas.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  test("WT-PT-01-02: Mengembalikan 404 jika id tidak ditemukan di database", async () => {
    req.params.id = 999;
    PelimpahanTugas.findByPk.mockResolvedValue(null);

    await getPermohonanPelimpahanById(req, res);

    expect(PelimpahanTugas.findByPk).toHaveBeenCalledWith(999, expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: "Data tidak ditemukan" });
  });
});

describe("pelimpahanTugasController.getPermohonanPelimpahan", () => {
  let req, res;

  beforeEach(() => {
    req = { user: { idPegawai: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("WT-PT-02-01: Berhasil mengambil semua pelimpahan tugas untuk pegawai penerima", async () => {
    const mockData = [
      { id: 1, status: "Belum Diverifikasi" },
      { id: 2, status: "Diproses" },
      { id: 3, status: "Disetujui" },
      { id: 4, status: "Ditolak" },
    ];
    PelimpahanTugas.findAll.mockResolvedValue(mockData);

    await getPermohonanPelimpahan(req, res);

    expect(PelimpahanTugas.findAll).toHaveBeenCalledWith({
      where: { idPenerima: 1 },
      include: expect.any(Array),
      order: [["createdAt", "DESC"]],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      permohonan: [mockData[0], mockData[1]],
      disetujui: [mockData[2]],
      ditolak: [mockData[3]],
    });
  });

  test("WT-PT-02-02: Mengembalikan list kosong jika tidak ada data pelimpahan untuk pegawai penerima", async () => {
    PelimpahanTugas.findAll.mockResolvedValue([]);

    await getPermohonanPelimpahan(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      permohonan: [],
      disetujui: [],
      ditolak: [],
    });
  });
});

describe("pelimpahanTugasController.updateStatusToDiproses", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("WT-PT-03-01: Berhasil memperbarui status pelimpahan tugas menjadi 'Diproses'", async () => {
    req.params.id = 1;

    const mockPelimpahan = {
      id: 1,
      status: "Belum Diverifikasi",
      save: jest.fn().mockResolvedValue(true),
    };

    PelimpahanTugas.findByPk.mockResolvedValue(mockPelimpahan);

    await updateStatusToDiproses(req, res);

    expect(PelimpahanTugas.findByPk).toHaveBeenCalledWith(1);
    expect(mockPelimpahan.status).toBe("Diproses");
    expect(mockPelimpahan.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Status pelimpahan diperbarui",
      data: mockPelimpahan,
    });
  });

  test("WT-PT-03-02: Mengembalikan 404 jika data pelimpahan tidak ditemukan", async () => {
    req.params.id = 99;

    PelimpahanTugas.findByPk.mockResolvedValue(null);

    await updateStatusToDiproses(req, res);

    expect(PelimpahanTugas.findByPk).toHaveBeenCalledWith(99);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Data tidak ditemukan" });
  });
});

describe("pelimpahanTugasController.verifikasiPelimpahan", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: { idPegawai: 10 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("WT-PT-04-01: Berhasil memverifikasi pelimpahan dengan status Disetujui, membuat notifikasi ke pengaju cuti dan verifikator pertama", async () => {
    req.params.id = 1;
    req.body = { status: "Disetujui", komentar: "Oke" };

    const mockPelimpahan = {
      id: 1,
      idPengajuan: 100,
      idPenerima: 10,
      status: "Belum Diverifikasi",
      komentar: null,
      PengajuanCuti: { id: 100, idPegawai: 20, jenisCuti: "Tahunan" },
      save: jest.fn().mockResolvedValue(true),
    };

    const mockPengaju = { id: 20, nama: "Budi" };
    const mockPenerima = { id: 10, nama: "Andi" };
    const mockVerifikator = { id: 1, idPengajuan: 100, urutanVerifikasi: 1, idPimpinan: 30 };

    PelimpahanTugas.findByPk.mockResolvedValue(mockPelimpahan);
    Pegawai.findByPk
      .mockResolvedValueOnce(mockPenerima) 
      .mockResolvedValueOnce(mockPengaju); 
    VerifikasiCuti.findOne.mockResolvedValue(mockVerifikator);
    Notifikasi.create.mockResolvedValue(true);

    await verifikasiPelimpahan(req, res);

    expect(PelimpahanTugas.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    expect(mockPelimpahan.status).toBe("Disetujui");
    expect(mockPelimpahan.komentar).toBe("Oke");
    expect(mockPelimpahan.save).toHaveBeenCalled();
    expect(Notifikasi.create).toHaveBeenCalledTimes(2); 
    expect(res.json).toHaveBeenCalledWith({
      msg: "Konfirmasi berhasil",
      data: mockPelimpahan,
    });
  });

  test("WT-PT-04-02: Berhasil memverifikasi pelimpahan dengan status Ditolak, mengubah status pengajuan cuti menjadi Ditolak dan membuat notifikasi ke pengaju cuti", async () => {
    req.params.id = 1;
    req.body = { status: "Ditolak", komentar: "Tidak bisa" };

    const mockPelimpahan = {
      id: 1,
      idPengajuan: 100,
      idPenerima: 10,
      status: "Belum Diverifikasi",
      komentar: null,
      PengajuanCuti: { id: 100, idPegawai: 20 },
      save: jest.fn().mockResolvedValue(true),
    };

    const mockPenerima = { id: 10, nama: "Andi" };

    PelimpahanTugas.findByPk.mockResolvedValue(mockPelimpahan);
    Pegawai.findByPk.mockResolvedValue(mockPenerima);
    Notifikasi.create.mockResolvedValue(true);
    PengajuanCuti.update.mockResolvedValue([1]);

    await verifikasiPelimpahan(req, res);

    expect(mockPelimpahan.status).toBe("Ditolak");
    expect(mockPelimpahan.komentar).toBe("Tidak bisa");
    expect(mockPelimpahan.save).toHaveBeenCalled();
    expect(PengajuanCuti.update).toHaveBeenCalledWith(
      { status: "Ditolak" },
      { where: { id: 100 } }
    );
    expect(Notifikasi.create).toHaveBeenCalledTimes(1); 
    expect(res.json).toHaveBeenCalledWith({
      msg: "Konfirmasi berhasil",
      data: mockPelimpahan,
    });
  });

  test("WT-PT-04-03: Mengembalikan 404 jika pelimpahan tidak ditemukan", async () => {
    req.params.id = 999;
    req.body = { status: "Disetujui", komentar: "Oke" };

    PelimpahanTugas.findByPk.mockResolvedValue(null);

    await verifikasiPelimpahan(req, res);

    expect(PelimpahanTugas.findByPk).toHaveBeenCalledWith(999, expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: "Pelimpahan tidak ditemukan" });
  });
});
