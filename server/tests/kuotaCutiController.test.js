const { getKuotaCutiByUser, createKuotaCuti, updateKuotaCuti, tambahKuotaCutiTahunan } = require("../controllers/kuotaCutiController");
const { KuotaCuti, Pegawai } = require("../models");

jest.mock("../models", () => ({
    KuotaCuti: { 
        findAll: jest.fn(),
        findByPk: jest.fn(),
        findOne: jest.fn(),
        bulkCreate: jest.fn(),
    },
    Pegawai: jest.fn()
}));

describe("kuotaCutiController.getKuotaCutiByUser", () => {
    let req, res;

    beforeEach(() => {
        req = { params: { id: 1 } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    test("WT-KC-01-01: Berhasil mendapatkan semua data kuota cuti untuk pegawai berdasarkan idPegawai", async () => {
        const mockKuota = [
            {
                id: 1,
                idPegawai: 1,
                jenisCuti: "Tahunan",
                sisaKuota: 10,
                Pegawai: { nama: "Budi", nip: "12345" }
            },
            {
                id: 2,
                idPegawai: 1,
                jenisCuti: "Sakit",
                sisaKuota: 5,
                Pegawai: { nama: "Budi", nip: "12345" }
            }
        ];

        KuotaCuti.findAll.mockResolvedValue(mockKuota);

        await getKuotaCutiByUser(req, res);

        expect(KuotaCuti.findAll).toHaveBeenCalledWith({
            where: { idPegawai: 1 },
            include: {
                model: Pegawai,
                attributes: ["nama", "nip"]
            }
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockKuota);
    });
});

describe("kuotaCutiController.createKuotaCuti", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { idPegawai: 1 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("WT-KC-02-01: Berhasil membuat kuota cuti default untuk pegawai sesuai daftar jenisCutiList", async () => {
    const mockKuotas = [
      { idPegawai: 1, jenisCuti: "Cuti Tahunan N-2", totalKuota: 0, sisaKuota: 0 },
      { idPegawai: 1, jenisCuti: "Cuti Tahunan N-1", totalKuota: 0, sisaKuota: 0 },
      { idPegawai: 1, jenisCuti: "Cuti Tahunan", totalKuota: 12, sisaKuota: 12 },
      { idPegawai: 1, jenisCuti: "Cuti Besar", totalKuota: 90, sisaKuota: 90 },
      { idPegawai: 1, jenisCuti: "Cuti Sakit", totalKuota: 30, sisaKuota: 30 },
      { idPegawai: 1, jenisCuti: "Cuti Alasan Penting", totalKuota: 30, sisaKuota: 30 },
      { idPegawai: 1, jenisCuti: "Cuti Di Luar Tanggungan Negara", totalKuota: 260, sisaKuota: 260 },
      { idPegawai: 1, jenisCuti: "Cuti Melahirkan", totalKuota: 90, sisaKuota: 90 },
    ];

    KuotaCuti.bulkCreate.mockResolvedValue(mockKuotas);

    await createKuotaCuti(req, res);

    expect(KuotaCuti.bulkCreate).toHaveBeenCalledWith(expect.arrayContaining(mockKuotas));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      msg: "Kuota cuti berhasil ditambahkan",
      data: mockKuotas,
    });
  });
});

describe("kuotaCutiController.updateKuotaCuti", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("WT-KC-03-01: Berhasil memperbarui semua kuota cuti yang datanya ditemukan", async () => {
    req.body = [
      { id: 1, totalKuota: 12, sisaKuota: 10 },
      { id: 2, totalKuota: 15, sisaKuota: 12 },
    ];

    const mockKuota1 = { update: jest.fn(), id: 1, totalKuota: 12, sisaKuota: 10 };
    const mockKuota2 = { update: jest.fn(), id: 2, totalKuota: 15, sisaKuota: 12 };

    KuotaCuti.findByPk.mockImplementation((id) => {
      if (id === 1) return Promise.resolve(mockKuota1);
      if (id === 2) return Promise.resolve(mockKuota2);
      return Promise.resolve(null);
    });

    await updateKuotaCuti(req, res);

    expect(KuotaCuti.findByPk).toHaveBeenCalledTimes(2);
    expect(mockKuota1.update).toHaveBeenCalledWith({ totalKuota: 12, sisaKuota: 10 });
    expect(mockKuota2.update).toHaveBeenCalledWith({ totalKuota: 15, sisaKuota: 12 });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      msg: "Semua kuota cuti berhasil diperbarui",
      data: [mockKuota1, mockKuota2],
    });
  });

  test("WT-KC-03-02: Mengembalikan error jika input bukan array", async () => {
    req.body = { id: 1, totalKuota: 10, sisaKuota: 10 }; 

    await updateKuotaCuti(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      msg: "Data harus berupa array",
    });
  });
});

describe("kuotaCutiController.tambahKuotaCutiTahunan", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });
  
  test('WT-KC-04-01: Berhasil menambah kuota cuti tahunan pada pegawai yang datanya ditemukan', async () => {
    req.body = { idPegawai: 1, jumlah: 5 };

    const kuotaMock = {
      idPegawai: 1,
      jenisCuti: "Cuti Tahunan",
      totalKuota: 10,
      sisaKuota: 8,
      save: jest.fn(),
    };

    KuotaCuti.findOne.mockResolvedValue(kuotaMock);

    await tambahKuotaCutiTahunan(req, res);

    expect(KuotaCuti.findOne).toHaveBeenCalledWith({
      where: { idPegawai: 1, jenisCuti: "Cuti Tahunan" },
    });

    expect(kuotaMock.totalKuota).toBe(15);
    expect(kuotaMock.sisaKuota).toBe(13);
    expect(kuotaMock.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Kuota cuti tahunan berhasil ditambahkan.",
      data: kuotaMock,
    });
  });
  
  test("WT-KC-04-02: Mengembalikan error jika idPegawai atau jumlah tidak diisi", async () => {
    req.body = { idPegawai: "", jumlah: 5 };

    await tambahKuotaCutiTahunan(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "idPegawai dan jumlah wajib diisi",
    });
  });
  
  test("WT-KC-04-03: Mengembalikan error jika data kuota cuti tahunan tidak ditemukan untuk pegawai", async () => {
    req.body = { idPegawai: 99, jumlah: 5 };

    KuotaCuti.findOne.mockResolvedValue(null);

    await tambahKuotaCutiTahunan(req, res);

    expect(KuotaCuti.findOne).toHaveBeenCalledWith({
      where: { idPegawai: 99, jenisCuti: "Cuti Tahunan" },
    });

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Data kuota cuti tahunan tidak ditemukan untuk pegawai ini.",
    });
  });
});
