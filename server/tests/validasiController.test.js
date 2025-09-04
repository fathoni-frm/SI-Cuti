const { validasiQr } = require('../controllers/validasiController');
const crypto = require('crypto');
const { PengajuanCuti, PelimpahanTugas, VerifikasiCuti, Pegawai } = require('../models');
const SECRET = 'SECRET_KEY_MOCK';

jest.mock("../models", () => ({
  PengajuanCuti: { findByPk: jest.fn() },
  VerifikasiCuti: { findByPk: jest.fn() },
  PelimpahanTugas: { findByPk: jest.fn() },
  Pegawai: {}
}));

jest.mock("crypto", () => {
  const updateMock = jest.fn().mockReturnThis();
  const digestMock = jest.fn().mockReturnValue("mocked-digest-string");
  const createHmacMock = jest.fn(() => ({
    update: updateMock,
    digest: digestMock
  }));

  return { createHmac: createHmacMock };
});

describe("validasiController.validasiQr", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { doc: "", id: "1", role: "", sig: "" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  function makeSig(doc, id, role, ts) {
    const raw = `${doc}/${id}/${role}`;
    return crypto.createHmac("sha256", SECRET).update(`${raw}/${ts}`).digest("hex").slice(0, 32);
  }

  test("WT-VL-01-01: Berhasil validasi QR PMC pengaju dengan signature valid", async () => {
    const ts = "2025-01-01";
    const pegawai = { nama: "Budi", nip: "123", jabatanStruktural: "Staff", jabatanFungsional: "Analis" };
    const mockData = { tanggalPengajuan: ts, pegawai };

    PengajuanCuti.findByPk.mockResolvedValue(mockData);

    req.params = { doc: "PMC", id: "1", role: "pengaju", sig: makeSig("PMC", "1", "pengaju", ts) };

    await validasiQr(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      penandatangan: expect.objectContaining({ nama: "Budi", nip: "123" }),
      surat: expect.any(Object)
    }));
  });

  test("WT-VL-01-02: Berhasil validasi QR PMC verifikator dengan signature valid", async () => {
    const ts = "2025-01-02";
    const pegawai = { nama: "Ani", nip: "456", jabatanStruktural: "Kabag" };
    const pengajuan = { pegawai: { nama: "Budi", nip: "123" } };
    const mockData = { tanggalVerifikasi: ts, verifikator: pegawai, PengajuanCuti: pengajuan };

    VerifikasiCuti.findByPk.mockResolvedValue(mockData);

    req.params = { doc: "PMC", id: "1", role: "verifikator", sig: makeSig("PMC", "1", "verifikator", ts) };

    await validasiQr(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      penandatangan: expect.objectContaining({ nama: "Ani", nip: "456" }),
      surat: expect.any(Object)
    }));
  });

  test("WT-VL-01-03: Berhasil validasi QR PLT pengaju dengan signature valid", async () => {
    const ts = "2025-01-03";
    const pegawai = { nama: "Cici", nip: "789", jabatanStruktural: "Staff", jabatanFungsional: "Programmer" };
    const mockData = { tanggalPengajuan: ts, pegawai };

    PengajuanCuti.findByPk.mockResolvedValue(mockData);

    req.params = { doc: "PLT", id: "1", role: "pengaju", sig: makeSig("PLT", "1", "pengaju", ts) };

    await validasiQr(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      penandatangan: expect.objectContaining({ nama: "Cici", nip: "789" }),
      surat: expect.any(Object)
    }));
  });

  test("WT-VL-01-04: Berhasil validasi QR PLT penerima dengan signature valid", async () => {
    const ts = "2025-01-04";
    const penerima = { nama: "Deni", nip: "101", jabatanFungsional: "Engineer" };
    const pengajuan = { pegawai: { nama: "Cici", nip: "789" } };
    const mockData = { tanggalVerifikasi: ts, penerima, PengajuanCuti: pengajuan };

    PelimpahanTugas.findByPk.mockResolvedValue(mockData);

    req.params = { doc: "PLT", id: "1", role: "penerima", sig: makeSig("PLT", "1", "penerima", ts) };

    await validasiQr(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      penandatangan: expect.objectContaining({ nama: "Deni", nip: "101" }),
      surat: expect.any(Object)
    }));
  });

  test("WT-VL-01-05: Berhasil validasi QR PLT verifikator dengan signature valid", async () => {
    const ts = "2025-01-05";
    const verifikator = { nama: "Eka", nip: "202", jabatanStruktural: "Supervisor" };
    const pengajuan = { pegawai: { nama: "Cici", nip: "789" } };
    const mockData = { tanggalVerifikasi: ts, verifikator, PengajuanCuti: pengajuan };

    VerifikasiCuti.findByPk.mockResolvedValue(mockData);

    req.params = { doc: "PLT", id: "1", role: "verifikator", sig: makeSig("PLT", "1", "verifikator", ts) };

    await validasiQr(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      penandatangan: expect.objectContaining({ nama: "Eka", nip: "202" }),
      surat: expect.any(Object)
    }));
  });

  test("WT-VL-01-06: Berhasil validasi QR PSC dengan signature valid", async () => {
    const ts = "2025-01-06";
    const verifikator = { nama: "Feri", nip: "303", jabatanStruktural: "Manager" };
    const pengajuan = { pegawai: { nama: "Gina", nip: "404" } };
    const mockData = { tanggalVerifikasi: ts, verifikator, PengajuanCuti: pengajuan };

    VerifikasiCuti.findByPk.mockResolvedValue(mockData);

    req.params = { doc: "PSC", id: "1", role: "verifikator", sig: makeSig("PSC", "1", "verifikator", ts) };

    await validasiQr(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      penandatangan: expect.objectContaining({ nama: "Feri", nip: "303" }),
      surat: expect.any(Object)
    }));
  });

  test("WT-VL-01-07: Gagal validasi QR karena data tidak ditemukan", async () => {
    PengajuanCuti.findByPk.mockResolvedValue(null);

    req.params = { doc: "PMC", id: "99", role: "pengaju", sig: "xxx" };

    await validasiQr(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: "Data tidak ditemukan" });
  });

  test("WT-VL-01-08: Gagal validasi QR karena signature tidak cocok", async () => {
    const ts = "2025-01-08";
    const pegawai = { nama: "Hani", nip: "505", jabatanStruktural: "Staff" };
    const mockData = { tanggalPengajuan: ts, pegawai };

    PengajuanCuti.findByPk.mockResolvedValue(mockData);

    req.params = { doc: "PMC", id: "1", role: "pengaju", sig: "salah-sig" };

    await validasiQr(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ msg: "QR tidak valid" });
  });
});
