const { resetKuotaCutiTahunan } = require("../tasks/autoResetKuotaCuti");
const { Pegawai, KuotaCuti } = require("../models");

jest.mock("../models", () => ({
  Pegawai: { findAll: jest.fn() },
  KuotaCuti: { findAll: jest.fn() },
}));

jest.mock("node-cron", () => ({
  schedule: jest.fn(),
}));

describe("autoResetKuotaCuti.resetKuotaCutiTahunan", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("WT-AR-01-01: Memastikan kuota cuti tahunan dan jenis lain direset sesuai aturan", async () => {
    const mockPegawai = [{ idPegawai: 1 }];
    const mockKuotas = [
      { jenisCuti: "Cuti Tahunan", sisaKuota: 8, update: jest.fn() },
      { jenisCuti: "Cuti Tahunan N-1", sisaKuota: 4, update: jest.fn() },
      { jenisCuti: "Cuti Tahunan N-2", sisaKuota: 2, update: jest.fn() },
      { jenisCuti: "Cuti Besar", sisaKuota: 80, update: jest.fn() },
      { jenisCuti: "Cuti Sakit", sisaKuota: 10, update: jest.fn() },
      { jenisCuti: "Cuti Alasan Penting", sisaKuota: 5, update: jest.fn() },
      { jenisCuti: "Cuti Di Luar Tanggungan Negara", sisaKuota: 250, update: jest.fn() },
      { jenisCuti: "Cuti Melahirkan", sisaKuota: 80, update: jest.fn() },
    ];

    Pegawai.findAll.mockResolvedValue(mockPegawai);
    KuotaCuti.findAll.mockResolvedValue(mockKuotas);

    await resetKuotaCutiTahunan(req, res);

    // cek update untuk rollover tahunan
    expect(mockKuotas[2].update).toHaveBeenCalledWith({ totalKuota: 4, sisaKuota: 4 }); // N-2
    expect(mockKuotas[1].update).toHaveBeenCalledWith({ totalKuota: 6, sisaKuota: 6 }); // N-1
    expect(mockKuotas[0].update).toHaveBeenCalledWith({ totalKuota: 12, sisaKuota: 12 }); // Tahunan

    // cek reset jenis lain
    expect(mockKuotas[3].update).toHaveBeenCalledWith({ totalKuota: 90, sisaKuota: 90 });
    expect(mockKuotas[4].update).toHaveBeenCalledWith({ totalKuota: 30, sisaKuota: 30 });
    expect(mockKuotas[5].update).toHaveBeenCalledWith({ totalKuota: 30, sisaKuota: 30 });
    expect(mockKuotas[6].update).toHaveBeenCalledWith({ totalKuota: 260, sisaKuota: 260 });
    expect(mockKuotas[7].update).toHaveBeenCalledWith({ totalKuota: 90, sisaKuota: 90 });
  });

  test("WT-AR-01-02: Memastikan sistem mereset jenis cuti lain meski data tahunan tidak lengkap", async () => {
    const mockPegawai = [{ idPegawai: 2 }];
    const mockKuotas = [
      { jenisCuti: "Cuti Tahunan", sisaKuota: 5, update: jest.fn() },
      // Tidak ada N-1 dan N-2
      { jenisCuti: "Cuti Besar", sisaKuota: 70, update: jest.fn() },
      { jenisCuti: "Cuti Sakit", sisaKuota: 20, update: jest.fn() },
      { jenisCuti: "Cuti Alasan Penting", sisaKuota: 10, update: jest.fn() },
      { jenisCuti: "Cuti Di Luar Tanggungan Negara", sisaKuota: 250, update: jest.fn() },
      { jenisCuti: "Cuti Melahirkan", sisaKuota: 80, update: jest.fn() },
    ];

    Pegawai.findAll.mockResolvedValue(mockPegawai);
    KuotaCuti.findAll.mockResolvedValue(mockKuotas);

    await resetKuotaCutiTahunan(req, res);

    // Tidak ada update untuk tahunan, N-1, N-2
    expect(mockKuotas[0].update).not.toHaveBeenCalledWith({ totalKuota: 12, sisaKuota: 12 });

    // Cek reset jenis lain tetap jalan
    expect(mockKuotas[1].update).toHaveBeenCalledWith({ totalKuota: 90, sisaKuota: 90 });
    expect(mockKuotas[2].update).toHaveBeenCalledWith({ totalKuota: 30, sisaKuota: 30 });
    expect(mockKuotas[3].update).toHaveBeenCalledWith({ totalKuota: 30, sisaKuota: 30 });
    expect(mockKuotas[4].update).toHaveBeenCalledWith({ totalKuota: 260, sisaKuota: 260 });
    expect(mockKuotas[5].update).toHaveBeenCalledWith({ totalKuota: 90, sisaKuota: 90 });
  });
});
