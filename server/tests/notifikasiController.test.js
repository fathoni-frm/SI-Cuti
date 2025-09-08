const { getNotifikasiByUser, tandaiSudahDibaca, hapusNotifikasi, } = require("../controllers/notifikasiController");
const { Notifikasi, PengajuanCuti, VerifikasiCuti, PelimpahanTugas } = require("../models");

jest.mock("../models", () => ({
  Notifikasi: { 
    findAll: jest.fn(),
    findByPk: jest.fn(),
   },
  PengajuanCuti: jest.fn(),
  PelimpahanTugas: { findOne: jest.fn() },
  VerifikasiCuti: { findOne: jest.fn() },
}));

describe("notifikasiController.getNotifikasiByUser", () => {
  let req, res;

  beforeEach(() => {
    req = { user: { idPegawai: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("WT-NS-01-01: Berhasil mengambil daftar notifikasi sesuai idPegawai user yang sedang login", async () => {
    const mockNotifikasi = [
      {
        id: 1,
        pesan: "Pengajuan cuti baru",
        createdAt: new Date("2025-08-19T10:00:00Z"),
        PengajuanCuti: { id: 10, alasan: "Cuti Tahunan" },
      },
      {
        id: 2,
        pesan: "Pengajuan cuti disetujui",
        createdAt: new Date("2025-08-18T10:00:00Z"),
        PengajuanCuti: { id: 11, alasan: "Cuti Sakit" },
      },
    ];

    Notifikasi.findAll.mockResolvedValue(mockNotifikasi);

    await getNotifikasiByUser(req, res);

    expect(Notifikasi.findAll).toHaveBeenCalledWith({
      where: { idPenerima: 1 },
      include: [{ model: PengajuanCuti }],
      order: [["createdAt", "DESC"]],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockNotifikasi);
  });

  test("WT-NS-01-02: Mengembalikan array kosong jika tidak ada notifikasi untuk user", async () => {
    req.user.idPegawai = 99;
    Notifikasi.findAll.mockResolvedValue([]);

    await getNotifikasiByUser(req, res);

    expect(Notifikasi.findAll).toHaveBeenCalledWith({
      where: { idPenerima: 99 },
      include: [{ model: PengajuanCuti }],
      order: [["createdAt", "DESC"]],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});

describe("notifikasiController.tandaiSudahDibaca", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("WT-NS-02-01: Berhasil menandai notifikasi tipe pelimpahan sebagai sudah dibaca dan update status pelimpahan", async () => {
    req.params.id = 1;
    req.body = { idPegawai: 10, idPengajuan: 5 };

    const mockNotifikasi = {
      id: 1,
      idPenerima: 10,
      judul: "Pelimpahan Tugas Baru",
      isRead: false,
      update: jest.fn().mockResolvedValue(true),
    };
    const mockPelimpahan = {
      id: 123,
      status: "Belum Diverifikasi",
      update: jest.fn().mockResolvedValue(true),
    };

    Notifikasi.findByPk.mockResolvedValue(mockNotifikasi);
    PelimpahanTugas.findOne.mockResolvedValue(mockPelimpahan);

    await tandaiSudahDibaca(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(Notifikasi.findByPk).toHaveBeenCalledWith(1);
    expect(mockNotifikasi.update).toHaveBeenCalledWith({ isRead: true });
    expect(PelimpahanTugas.findOne).toHaveBeenCalledWith({
      where: { idPengajuan: 5, idPenerima: 10 },
    });
    expect(mockPelimpahan.update).toHaveBeenCalledWith({ status: "Diproses" });
    expect(res.json).toHaveBeenCalledWith({
      msg: "Notifikasi ditandai sudah dibaca",
      tipe: "pelimpahan",
      idPelimpahan: mockPelimpahan.id,
    });
  });

  test("WT-NS-02-02: Berhasil menandai notifikasi tipe cuti sebagai sudah dibaca dan update status verifikasi cuti", async () => {
    req.params.id = 2;
    req.body = { idPegawai: 20, idPengajuan: 6 };

    const mockNotifikasi = {
      id: 2,
      idPenerima: 20,
      judul: "Pengajuan Cuti",
      isRead: false,
      update: jest.fn().mockResolvedValue(true),
    };
    const mockVerifikasi = {
      id: 200,
      statusVerifikasi: "Belum Diverifikasi",
      update: jest.fn().mockResolvedValue(true),
    };

    Notifikasi.findByPk.mockResolvedValue(mockNotifikasi);
    VerifikasiCuti.findOne.mockResolvedValue(mockVerifikasi);

    await tandaiSudahDibaca(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(Notifikasi.findByPk).toHaveBeenCalledWith(2);
    expect(mockNotifikasi.update).toHaveBeenCalledWith({ isRead: true });
    expect(VerifikasiCuti.findOne).toHaveBeenCalledWith({
      where: { idPengajuan: 6, idPimpinan: 20 },
    });
    expect(mockVerifikasi.update).toHaveBeenCalledWith({ statusVerifikasi: "Diproses" });
    expect(res.json).toHaveBeenCalledWith({
      msg: "Notifikasi ditandai sudah dibaca",
      tipe: "cuti",
    });
  });

  test("WT-NS-02-03: Mengembalikan 404 jika notifikasi tidak ditemukan", async () => {
    req.params.id = 999;
    req.body = { idPegawai: 1, idPengajuan: 1 };

    Notifikasi.findByPk.mockResolvedValue(null);

    await tandaiSudahDibaca(req, res);

    expect(Notifikasi.findByPk).toHaveBeenCalledWith(999);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: "Notifikasi tidak ditemukan" });
  });
});

describe("notifikasiController.hapusNotifikasi", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      user: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  test("WT-NS-03-01: Berhasil menghapus notifikasi jika ditemukan dan penerima sesuai dengan req.user.idPegawai", async () => {
    req.params.id = 1;
    req.user.idPegawai = 10;

    const mockNotifikasi = {
      id: 1,
      idPenerima: 10,
      destroy: jest.fn()
    };

    Notifikasi.findByPk.mockResolvedValue(mockNotifikasi);

    await hapusNotifikasi(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(Notifikasi.findByPk).toHaveBeenCalledWith(1);
    expect(mockNotifikasi.destroy).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ msg: 'Notifikasi berhasil dihapus' });
  });

  test("WT-NS-03-02: Mengembalikan 403 jika notifikasi tidak ditemukan", async () => {
    req.params.id = 999;
    req.user.idPegawai = 10;

    Notifikasi.findByPk.mockResolvedValue(null);

    await hapusNotifikasi(req, res);

    expect(Notifikasi.findByPk).toHaveBeenCalledWith(999);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Akses ditolak' });
  });
});
