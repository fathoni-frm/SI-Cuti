const { cancelPengajuanCuti } = require("../tasks/autoCancelCuti");
const { PengajuanCuti, VerifikasiCuti, PelimpahanTugas, Notifikasi } = require("../models");
const { Op } = require("sequelize");

jest.mock("../models", () => ({
  PengajuanCuti: { findAll: jest.fn() },
  VerifikasiCuti: { update: jest.fn() },
  PelimpahanTugas: { update: jest.fn() },
  Notifikasi: { create: jest.fn() },
}));

jest.mock("node-cron", () => ({
  schedule: jest.fn(),
}));

describe("cronJobs.cancelPengajuanCuti", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("WT-AC-01-01: Membatalkan pengajuan cuti yang sudah melewati batas waktu", async () => {
    const pengajuanMock = {
      id: 1,
      status: "Diproses",
      tanggalPengajuan: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 hari lalu
      idPegawai: 10,
      save: jest.fn(),
      PelimpahanTuga: { status: "Belum Diverifikasi", idPenerima: 1, update: jest.fn().mockResolvedValue(true) },
    };

    PengajuanCuti.findAll.mockResolvedValue([pengajuanMock]);
    VerifikasiCuti.update.mockResolvedValue([1]);
    PelimpahanTugas.update.mockResolvedValue([1]);
    Notifikasi.create.mockResolvedValue({});

    await cancelPengajuanCuti();

    expect(pengajuanMock.status).toBe("Dibatalkan");
    expect(VerifikasiCuti.update).toHaveBeenCalledWith(
      { statusVerifikasi: "Dibatalkan" },
      { where: { idPengajuan: 1, statusVerifikasi: { [Op.in]: ["Belum Diverifikasi", "Diproses"] } } }
    );
    expect(pengajuanMock.PelimpahanTuga.update).toHaveBeenCalledWith(
      { status: "Dibatalkan" },
      { where: { status: { [Op.in]: ["Belum Diverifikasi", "Diproses"] } } }
    );
    expect(Notifikasi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        idPenerima: pengajuanMock.idPegawai,
        judul: "Cuti Dibatalkan Otomatis",
      })
    );
    expect(consoleSpy).toHaveBeenCalledWith("Ada pengajuan cuti yang harus dibatalkan.");
  });

  test("WT-AC-01-02: Tidak ada pengajuan cuti yang dibatalkan jika tidak ada yang melewati batas waktu", async () => {
    PengajuanCuti.findAll.mockResolvedValue([]);

    await cancelPengajuanCuti();

    expect(PengajuanCuti.findAll).toHaveBeenCalled();
    expect(VerifikasiCuti.update).not.toHaveBeenCalled();
    expect(Notifikasi.create).not.toHaveBeenCalled();
    expect(PelimpahanTugas.update).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith("Tidak ada pengajuan cuti yang harus dibatalkan.");
  });
});
