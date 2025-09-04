const { create } = require("handlebars");
const { getDataPermohonanCutiAdmin, getDataPermohonanCutiAtasan, updateStatusToDiproses, verifikasiCuti, batalCutiOlehAdmin } = require("../controllers/verifikasiCutiController");
const { VerifikasiCuti, PengajuanCuti, PelimpahanTugas, Pegawai, KuotaCuti, Notifikasi } = require('../models');
const { generateSuratCuti } = require("../controllers/cetakSuratCutiController");
const { Op } = require('sequelize');

jest.mock("../models", () => ({
    VerifikasiCuti: {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
    },
    PengajuanCuti: { 
        findAll: jest.fn(),
        findByPk: jest.fn(),
        update: jest.fn(),
    },
    Pegawai: {
        findByPk: jest.fn(),
    },
    PelimpahanTugas: {},
    KuotaCuti: {
        findOne: jest.fn(),
    },
    Notifikasi: {
        create: jest.fn(),
    }
}));

jest.mock("../controllers/cetakSuratCutiController", () => ({
  generateSuratCuti: jest.fn()
}));


describe("verifikasiCutiController.getDataPermohonanCutiAdmin", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  test("WT-VC-01-01: Berhasil mengambil seluruh data permohonan cuti beserta data pegawai, diurutkan berdasarkan tanggal pengajuan terbaru", async () => {
    const mockData = [
      {
        id: 2,
        tanggalPengajuan: "2025-01-02",
        pegawai: { nama: "Ani", nip: "456" }
      },
      {
        id: 1,
        tanggalPengajuan: "2025-01-01",
        pegawai: { nama: "Budi", nip: "123" }
      }
    ];

    PengajuanCuti.findAll.mockResolvedValue(mockData);

    await getDataPermohonanCutiAdmin(req, res);

    expect(PengajuanCuti.findAll).toHaveBeenCalledWith({
      include: [{ model: Pegawai, as: "pegawai" }],
      order: [["tanggalPengajuan", "DESC"]]
    });
    expect(res.json).toHaveBeenCalledWith(mockData);
  });
});

describe("verifikasiCutiController.getDataPermohonanCutiAtasan", () => {
  let req, res;

  beforeEach(() => {
    req = { user: { idPegawai: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  test("WT-VC-02-01: Berhasil mengambil daftar permohonan cuti untuk atasan yang login", async () => {
    const mockData = [
      {
        PengajuanCuti: {
          id: 1,
          tanggalPengajuan: "2025-08-01",
          PelimpahanTuga: { status: "Disetujui" },
          VerifikasiCutis: [
            { idPimpinan: 1, statusVerifikasi: "Belum Diverifikasi", urutanVerifikasi: 1 }
          ],
          Pegawai: { id: 99, nama: "Test Pegawai", nip: "123456" }
        }
      }
    ];

    VerifikasiCuti.findAll.mockResolvedValue(mockData);

    await getDataPermohonanCutiAtasan(req, res);

    expect(VerifikasiCuti.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { idPimpinan: req.user.idPegawai }
      })
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        permohonanCuti: expect.any(Array),
        disetujui: expect.any(Array),
        ditolak: expect.any(Array)
      })
    );
    expect(res.json.mock.calls[0][0].permohonanCuti).toHaveLength(1);
  });

  test("WT-VC-02-02: Tidak ada permohonan cuti yang memenuhi kriteria", async () => {
    VerifikasiCuti.findAll.mockResolvedValue([]);
    await getDataPermohonanCutiAtasan(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      permohonanCuti: [],
      disetujui: [],
      ditolak: []
    });
  });
});

describe("verifikasiCutiController.updateStatusToDiproses", () => {
  let req, res;

  beforeEach(() => {
    req = { body: { idVerifikasi: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  test("WT-VC-03-01: Berhasil memperbarui status verifikasi cuti menjadi Diproses", async () => {
    const mockVerifikasi = {
      id: 1,
      statusVerifikasi: "Belum Diverifikasi",
      save: jest.fn().mockResolvedValue(true)
    };

    VerifikasiCuti.findByPk.mockResolvedValue(mockVerifikasi);

    await updateStatusToDiproses(req, res);

    expect(VerifikasiCuti.findByPk).toHaveBeenCalledWith(1);
    expect(mockVerifikasi.statusVerifikasi).toBe("Diproses");
    expect(mockVerifikasi.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Status verifikasi diperbarui",
      data: mockVerifikasi
    });
  });

  test("WT-VC-03-02: Gagal memperbarui karena data verifikasi tidak ditemukan", async () => {
    VerifikasiCuti.findByPk.mockResolvedValue(null);

    await updateStatusToDiproses(req, res);

    expect(VerifikasiCuti.findByPk).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Data tidak ditemukan" });
  });
});

describe("verifikasiCutiController.verifikasiCuti", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { id: 1, statusVerifikasi: "Ditolak", komentar: "Tidak bisa", tanggalVerifikasi: "2025-08-11" },
      user: { idPegawai: 10, role: "Atasan" }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  test("WT-VC-04-01: Berhasil menolak permohonan cuti", async () => {
    const mockVerifikasi = { id: 1, idPimpinan: 10, idPengajuan: 99, save: jest.fn() };
    VerifikasiCuti.findByPk.mockResolvedValue(mockVerifikasi);
    PengajuanCuti.update.mockResolvedValue([1]);
    const mockPengajuan = { id: 99, idPegawai: 77, jenisCuti: "Cuti Tahunan", Pegawai: { nama: "Budi" } };
    PengajuanCuti.findByPk.mockResolvedValue(mockPengajuan);
    Pegawai.findByPk.mockResolvedValue({ nama: "Atasan 1" });

    await verifikasiCuti(req, res);

    expect(VerifikasiCuti.findByPk).toHaveBeenCalledWith(1);
    expect(PengajuanCuti.update).toHaveBeenCalledWith({ status: "Ditolak" }, { where: { id: 99 } });
    expect(Notifikasi.create).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ msg: "Status verifikasi berhasil diperbarui" });
  });

  test("WT-VC-04-02: Berhasil menyetujui permohonan cuti dengan verifikator selanjutnya masih ada", async () => {
    req.body.statusVerifikasi = "Disetujui";
    req.body.komentar = "Setuju";

    const mockVerifikasi = { id: 1, idPimpinan: 10, idPengajuan: 99, urutanVerifikasi: 1, save: jest.fn() };
    VerifikasiCuti.findByPk.mockResolvedValue(mockVerifikasi);

    VerifikasiCuti.findOne.mockResolvedValue({ idPimpinan: 20 }); // verifikator selanjutnya
    PengajuanCuti.findByPk.mockResolvedValue({ id: 99, jenisCuti: "Cuti Tahunan", pegawai: { nama: "Andi" } });
    VerifikasiCuti.findAll.mockResolvedValue([{ statusVerifikasi: "Disetujui" }, { statusVerifikasi: "Belum Diverifikasi" }]);

    await verifikasiCuti(req, res);

    expect(Notifikasi.create).toHaveBeenCalledWith(expect.objectContaining({
      idPenerima: 20,
      judul: "Permohonan Cuti Baru"
    }));
    expect(res.json).toHaveBeenCalledWith({ msg: "Status verifikasi berhasil diperbarui" });
  });

  test("WT-VC-04-03: Berhasil menyetujui permohonan cuti dan semua verifikator sudah setuju", async () => {
    req.body.statusVerifikasi = "Disetujui";
    req.body.komentar = "Oke";

    const mockVerifikasi = { id: 1, idPimpinan: 10, idPengajuan: 99, urutanVerifikasi: 1, save: jest.fn() };
    VerifikasiCuti.findByPk.mockResolvedValue(mockVerifikasi);

    VerifikasiCuti.findOne.mockResolvedValue(null); // tidak ada verifikator selanjutnya
    VerifikasiCuti.findAll.mockResolvedValue([{ statusVerifikasi: "Disetujui" }]);
    const mockPengajuan = { id: 99, idPegawai: 77, jenisCuti: "Cuti Tahunan", durasi: 2, update: jest.fn() };
    PengajuanCuti.findByPk.mockResolvedValue(mockPengajuan);
    KuotaCuti.findOne.mockResolvedValue({ sisaKuota: 5, save: jest.fn() });
    generateSuratCuti.mockResolvedValue("surat.pdf");

    await verifikasiCuti(req, res);

    expect(mockPengajuan.update).toHaveBeenCalledWith({ status: "Disetujui" });
    expect(Notifikasi.create).toHaveBeenCalledWith(expect.objectContaining({
      idPenerima: 77,
      judul: "Permohonan Cuti Disetujui"
    }));
    expect(generateSuratCuti).toHaveBeenCalledWith(99);
    expect(res.json).toHaveBeenCalledWith({ msg: "Status verifikasi berhasil diperbarui" });
  });

  test("WT-VC-04-04: Gagal verifikasi karena data verifikasi tidak ditemukan", async () => {
    VerifikasiCuti.findByPk.mockResolvedValue(null);

    await verifikasiCuti(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: "Data verifikasi tidak ditemukan" });
  });

  test("WT-VC-04-05: Gagal verifikasi karena user bukan atasan yang berhak", async () => {
    req.user = { idPegawai: 99, role: "Pegawai" };
    VerifikasiCuti.findByPk.mockResolvedValue({ id: 1, idPimpinan: 10 });

    await verifikasiCuti(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ msg: "Anda tidak memiliki akses" });
  });
});

describe("verifikasiCutiController.batalCutiOlehAdmin", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: { idPegawai: 5 }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  test("WT-VC-05-01: Membatalkan cuti tahunan (3 hari) yang sudah disetujui oleh admin", async () => {
    req.params.id = 1;
    req.body = { komentar: "Pembatalan karena kebutuhan operasional", tanggalVerifikasi: "2025-08-12" };

    const pengajuanMock = {
      id: 1,
      idPegawai: 10,
      status: "Disetujui",
      jenisCuti: "Cuti Tahunan",
      durasi: 3,
      save: jest.fn(),
      pegawai: { nama: "Budi" }
    };
    PengajuanCuti.findByPk.mockResolvedValue(pengajuanMock);
    VerifikasiCuti.findAll.mockResolvedValue([]);
    VerifikasiCuti.create.mockResolvedValue({});
    KuotaCuti.findOne.mockResolvedValue({ totalKuota: 12, sisaKuota: 9, save: jest.fn() });
    Notifikasi.create.mockResolvedValue({});

    await batalCutiOlehAdmin(req, res);

    expect(res.json).toHaveBeenCalledWith({ msg: "Cuti berhasil dibatalkan oleh admin" });
    expect(pengajuanMock.save).toHaveBeenCalled();
  });

  test("WT-VC-05-02: Membatalkan cuti tahunan (5 hari) yang sudah disetujui oleh admin", async () => {
    req.params.id = 1;
    req.body = { komentar: "Pembatalan karena kebutuhan operasional", tanggalVerifikasi: "2025-08-12" };

    const pengajuanMock = {
      id: 1,
      idPegawai: 11,
      status: "Disetujui",
      jenisCuti: "Cuti Tahunan",
      durasi: 5,
      save: jest.fn()
    };
    PengajuanCuti.findByPk.mockResolvedValue(pengajuanMock);
    VerifikasiCuti.findAll.mockResolvedValue([]);
    VerifikasiCuti.create.mockResolvedValue({});
    KuotaCuti.findOne.mockResolvedValue({ totalKuota: 12, sisaKuota: 7, save: jest.fn() });
    Notifikasi.create.mockResolvedValue({});

    await batalCutiOlehAdmin(req, res);

    expect(res.json).toHaveBeenCalledWith({ msg: "Cuti berhasil dibatalkan oleh admin" });
  });

  test("WT-VC-05-03: Membatalkan cuti selain Cuti Tahunan (Cuti Sakit)", async () => {
    req.params.id = 3;
    req.body = { komentar: "", tanggalVerifikasi: "2025-08-12" };

    const pengajuanMock = {
      id: 3,
      idPegawai: 12,
      status: "Disetujui",
      jenisCuti: "Cuti Sakit",
      durasi: 2,
      save: jest.fn()
    };
    PengajuanCuti.findByPk.mockResolvedValue(pengajuanMock);
    VerifikasiCuti.findAll.mockResolvedValue([]);
    VerifikasiCuti.create.mockResolvedValue({});
    KuotaCuti.findOne.mockResolvedValue({ totalKuota: 6, sisaKuota: 4, save: jest.fn() });
    Notifikasi.create.mockResolvedValue({});

    await batalCutiOlehAdmin(req, res);

    expect(res.json).toHaveBeenCalledWith({ msg: "Cuti berhasil dibatalkan oleh admin" });
  });

  test("WT-VC-05-04: Gagal membatalkan cuti jika pengajuan tidak ditemukan", async () => {
    req.params.id = 99;
    PengajuanCuti.findByPk.mockResolvedValue(null);

    await batalCutiOlehAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: "Pengajuan tidak ditemukan" });
  });

  test("WT-VC-05-05: Gagal membatalkan cuti jika status bukan Disetujui", async () => {
    req.params.id = 2;
    const pengajuanMock = {
      id: 2,
      status: "Diproses",
      save: jest.fn()
    };
    PengajuanCuti.findByPk.mockResolvedValue(pengajuanMock);

    await batalCutiOlehAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: "Cuti hanya bisa dibatalkan jika statusnya Disetujui" });
  });
});
