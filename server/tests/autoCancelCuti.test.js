const { cancelPengajuanCuti } = require("../tasks/autoCancelCuti");
const { PengajuanCuti, VerifikasiCuti, PelimpahanTugas, Notifikasi } = require("../models");
const { Op } = require("sequelize");

jest.mock("../models", () => ({
  PengajuanCuti: { findAll: jest.fn() },
  VerifikasiCuti: { update: jest.fn() },
  PelimpahanTugas: jest.fn(),
  Notifikasi: { create: jest.fn() },
}));

jest.mock("node-cron", () => ({
  schedule: jest.fn(),
}));

describe("autoCancelCuti.cancelPengajuanCuti", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test("WT-AC-01-01: Membatalkan pengajuan cuti yang sudah melewati batas waktu", async () => {
    const pengajuanMock = {
      id: 1,
      status: "Diproses",
      tanggalPengajuan: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 hari lalu
      idPegawai: 10,
      save: jest.fn(),
      PelimpahanTuga: { status: "Belum Diverifikasi", update: jest.fn() },
    };

    PengajuanCuti.findAll.mockResolvedValue([pengajuanMock]);
    VerifikasiCuti.update.mockResolvedValue([1]);
    Notifikasi.create.mockResolvedValue({});

    await cancelPengajuanCuti();

    expect(pengajuanMock.save).toHaveBeenCalled();
    expect(pengajuanMock.status).toBe("Dibatalkan");
    expect(pengajuanMock.PelimpahanTuga.update).toHaveBeenCalledWith(
      { status: "Dibatalkan" },
      { where: { status: { [Op.in]: ["Belum Diverifikasi", "Diproses"] } } }
    );
    expect(VerifikasiCuti.update).toHaveBeenCalledWith(
      { statusVerifikasi: "Dibatalkan" },
      expect.any(Object)
    );
    expect(Notifikasi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        idPenerima: pengajuanMock.idPegawai,
        judul: "Cuti Dibatalkan Otomatis",
      })
    );
  });

  test("WT-AC-01-02: Tidak ada pengajuan cuti yang dibatalkan jika tidak ada yang melewati batas waktu", async () => {
    PengajuanCuti.findAll.mockResolvedValue([]);

    await cancelPengajuanCuti();

    expect(VerifikasiCuti.update).not.toHaveBeenCalled();
    expect(Notifikasi.create).not.toHaveBeenCalled();
  });
});
