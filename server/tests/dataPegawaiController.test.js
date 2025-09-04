const { getAllPegawai, getPegawaiById, getDaftarAtasan, getDaftarPegawai, createPegawai, updatePegawai, deletePegawai, validatePegawai } = require("../controllers/dataPegawaiController");
const { User, Pegawai, KuotaCuti } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

jest.mock("../models", () => ({
  Pegawai: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
  User: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  KuotaCuti: {
    destroy: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashedPassword123")
}));


describe("dataPegawaiController.getAllPegawai", () => {
  let req, res;

  beforeEach(() => {
    req = {}; 
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  test("WT-DP-01-01: berhasil mengambil seluruh data pegawai non-admin terurut ASC berdasarkan nama", async () => {
    const mockPegawai = [
      { id: 1, nama: "Andi", nip: "123", unitKerja: "IT", golongan: "IIIa", jabatanStruktural: "Staff", jabatanFungsional: null },
      { id: 2, nama: "Budi", nip: "456", unitKerja: "HRD", golongan: "IIIb", jabatanStruktural: null, jabatanFungsional: "Analis" }
    ];

    Pegawai.findAll.mockResolvedValue(mockPegawai);

    await getAllPegawai(req, res);

    expect(Pegawai.findAll).toHaveBeenCalledWith({
      include: [
        {
          model: User,
          where: { role: { [Op.notIn]: ["Admin"] } },
          attributes: [],
          required: true
        }
      ],
      attributes: ["id", "nama", "nip", "unitKerja", "golongan", "jabatanStruktural", "jabatanFungsional"],
      order: [["nama", "ASC"]]
    });

    expect(res.json).toHaveBeenCalledWith(mockPegawai);
  });

  test("WT-DP-01-02: hasil kosong jika hanya ada admin", async () => {
    Pegawai.findAll.mockResolvedValue([]);
    await getAllPegawai(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });
});

describe("dataPegawaiController.getPegawaiById", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("WT-DP-02-01: Menguji pengambilan data pegawai beserta data user berdasarkan ID yang valid", async () => {
    const fakePegawai = {
      id: 1,
      nama: "Fathoni",
      nip: "123456",
      get: jest.fn().mockReturnValue({ id: 1, nama: "Fathoni", nip: "123456" }),
      user: { id: 10, username: "fathoni" },
    };

    Pegawai.findByPk.mockResolvedValue(fakePegawai);

    await getPegawaiById(req, res);

    expect(Pegawai.findByPk).toHaveBeenCalledWith(1, { include: [{ model: User }] });
    expect(fakePegawai.get).toHaveBeenCalledWith({ plain: true });
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      nama: "Fathoni",
      nip: "123456",
      user: { id: 10, username: "fathoni" },
    });
  });

  test("WT-DP-02-02: Menguji respons saat ID pegawai tidak ditemukan", async () => {
    Pegawai.findByPk.mockResolvedValue(null);
    req.params.id = 999;

    await getPegawaiById(req, res);

    expect(Pegawai.findByPk).toHaveBeenCalledWith(999, { include: [{ model: User }] });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: "Pegawai tidak ditemukan" });
  });
});

describe("dataPegawaiController.getDaftarAtasan", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  test("WT-DP-03-01: Mengembalikan daftar pegawai dengan jabatan sesuai filter", async () => {
    const mockPegawai = [
      { id: 1, nama: "Andi", nip: "123", jabatanStruktural: "Ketua Tim", jabatanFungsional: "Staff" },
      { id: 2, nama: "Budi", nip: "456", jabatanStruktural: "Kepala Satuan Pelayanan", jabatanFungsional: "Supervisor" }
    ];

    Pegawai.findAll.mockResolvedValue(mockPegawai);

    await getDaftarAtasan(req, res);

    expect(Pegawai.findAll).toHaveBeenCalledWith({
      where: {
        jabatanStruktural: {
          [Op.in]: ["Ketua Tim", "Kepala Satuan Pelayanan"]
        }
      },
      attributes: ["id", "nama", "nip", "jabatanStruktural", "jabatanFungsional"],
      order: [["nama", "ASC"]]
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockPegawai);
  });

  test("WT-DP-03-02: Mengembalikan array kosong jika tidak ada pegawai yang memenuhi kriteria", async () => {
    Pegawai.findAll.mockResolvedValue([]);

    await getDaftarAtasan(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});

describe("dataPegawaiController.getDaftarPegawai", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  test("WT-DP-04-01: Menguji pengambilan daftar pegawai sesuai filter dan urutan ASC", async () => {
    const mockPegawai = [
      { id: 1, nama: "Andi", nip: "123", pangkat: "III/a", golongan: "A", jabatanStruktural: "Staff", jabatanFungsional: "Fungsional", satuanKerja: "IT" },
      { id: 2, nama: "Budi", nip: "456", pangkat: "III/b", golongan: "B", jabatanStruktural: "Staff", jabatanFungsional: "Fungsional", satuanKerja: "Keuangan" }
    ];

    Pegawai.findAll.mockResolvedValue(mockPegawai);

    await getDaftarPegawai(req, res);

    expect(Pegawai.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.any(Object),
      include: expect.any(Array),
      attributes: expect.any(Array),
      order: [["nama", "ASC"]]
    }));

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockPegawai);
  });

  test("WT-DP-04-02: Menguji respons saat tidak ada pegawai yang memenuhi kriteria filter", async () => {
    Pegawai.findAll.mockResolvedValue([]);

    await getDaftarPegawai(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});

describe("dataPegawaiController.createPegawai", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        nama: "Andi",
        nip: "123456789",
        ttl: "Jakarta, 01-01-1990",
        karpeg: "12345",
        karisKarsu: "67890",
        npwp: "1234567890",
        jenisKelamin: "Laki-laki",
        agama: "Islam",
        statusKeluarga: "Menikah",
        pendidikanTerakhir: "S1",
        namaSekolah: "SMAN 1",
        namaUniversitas: "UI",
        namaFakultas: "Teknik",
        namaJurusan: "Informatika",
        namaProgramStudi: "TI",
        unitKerja: "IT",
        satuanKerja: "Pusat",
        pangkat: "III/a",
        golongan: "A",
        jabatanStruktural: "Staff",
        jabatanFungsional: "Fungsional",
        alamatKantor: "Jl. Sudirman",
        noHp: "08123456789",
        emailKantor: "andi@kantor.go.id",
        emailPribadi: "andi@gmail.com"
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  test("WT-DP-05-01: Menguji penambahan pegawai baru dengan data valid", async () => {
    Pegawai.findOne.mockResolvedValue(null);
    const mockPegawai = { id: 1, ...req.body };
    Pegawai.create.mockResolvedValue(mockPegawai);

    await createPegawai(req, res);

    expect(Pegawai.findOne).toHaveBeenCalledWith({ where: { nip: req.body.nip }, paranoid: false });
    expect(Pegawai.create).toHaveBeenCalledWith(expect.objectContaining({ nip: "123456789", nama: "Andi" }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockPegawai);
  });

  test("WT-DP-05-02: Menguji penolakan jika NIP sudah terdaftar pada data aktif", async () => {
    Pegawai.findOne.mockResolvedValue({ id: 2, nip: "123456789", deletedAt: null });

    await createPegawai(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      msg: "NIP sudah terdaftar",
      errors: { nip: "NIP ini sudah terdaftar" }
    });
  });

  test("WT-DP-05-03: Menguji penolakan jika NIP sudah terdaftar pada data yang sudah dihapus (soft delete)", async () => {
    Pegawai.findOne.mockResolvedValue({ id: 3, nip: "123456789", deletedAt: new Date() });

    await createPegawai(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      msg: "NIP sudah terdaftar",
      errors: { nip: "NIP sudah terdaftar pada data yang telah dihapus" }
    });
  });
});

describe("dataPegawai.updatePegawai", () => {
  let req, res, mockPegawai;

  beforeEach(() => {
    req = {
      params: { id: 1 },
      body: {
        nama: "Budi",
        nip: "123456789",
        jabatanStruktural: "Staff",
        user: null
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockPegawai = {
      id: 1,
      update: jest.fn().mockResolvedValue(true)
    };

    jest.clearAllMocks();
  });

  test("WT-DP-06-01: Menguji pembaruan data pegawai yang sudah ada tanpa pembaruan akun", async () => {
    Pegawai.findByPk.mockResolvedValue(mockPegawai);

    await updatePegawai(req, res);

    expect(mockPegawai.update).toHaveBeenCalledWith(expect.objectContaining({ nama: "Budi" }));
    expect(res.json).toHaveBeenCalledWith({ message: "Data pegawai dan akun berhasil diperbarui" });
  });

  test("WT-DP-06-02: Menguji pembaruan data pegawai sekaligus membuat akun baru jika akun belum ada", async () => {
    req.body.user = { username: "budi123", password: "password123", role: "pegawai" };

    Pegawai.findByPk.mockResolvedValue(mockPegawai);
    User.findOne.mockResolvedValue(null);

    await updatePegawai(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(User.create).toHaveBeenCalledWith({
      username: "budi123",
      password: "hashedPassword123",
      role: "pegawai",
      idPegawai: 1
    });
    expect(res.json).toHaveBeenCalledWith({ message: "Data pegawai dan akun berhasil diperbarui" });
  });

  test("WT-DP-06-03: Menguji pembaruan data pegawai sekaligus memperbarui akun existing tanpa mengubah password", async () => {
    req.body.user = { username: "budi123", password: "123", role: "pegawai" };

    Pegawai.findByPk.mockResolvedValue(mockPegawai);
    const akunMock = { update: jest.fn().mockResolvedValue(true) };
    User.findOne.mockResolvedValue(akunMock);

    await updatePegawai(req, res);

    expect(akunMock.update).toHaveBeenCalledWith({
      username: "budi123",
      role: "pegawai"
    });
    expect(res.json).toHaveBeenCalledWith({ message: "Data pegawai dan akun berhasil diperbarui" });
  });

  test("WT-DP-06-04: Menguji pembaruan data pegawai sekaligus memperbarui akun existing dengan password baru minimal 8 karakter", async () => {
    req.body.user = { username: "budi123", password: "passwordBaru", role: "admin" };

    Pegawai.findByPk.mockResolvedValue(mockPegawai);
    const akunMock = { update: jest.fn().mockResolvedValue(true) };
    User.findOne.mockResolvedValue(akunMock);

    await updatePegawai(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith("passwordBaru", 10);
    expect(akunMock.update).toHaveBeenCalledWith({
      username: "budi123",
      role: "admin",
      password: "hashedPassword123"
    });
    expect(res.json).toHaveBeenCalledWith({ message: "Data pegawai dan akun berhasil diperbarui" });
  });

  test("WT-DP-06-05: Menguji jika pegawai dengan id yang diberikan tidak ditemukan", async () => {
    Pegawai.findByPk.mockResolvedValue(null);

    await updatePegawai(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Pegawai tidak ditemukan" });
  });
});

describe("dataPegawai.deletePegawai", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: "1" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });
  
  test('WT-DP-07-01: Menghapus pegawai yang ada, beserta data User & KuotaCuti', async () => {
    const mockPegawai = { destroy: jest.fn() };
    Pegawai.findByPk.mockResolvedValue(mockPegawai);
    User.destroy.mockResolvedValue(1);
    KuotaCuti.destroy.mockResolvedValue(1);

    await deletePegawai(req, res);

    expect(Pegawai.findByPk).toHaveBeenCalledWith("1");
    expect(User.destroy).toHaveBeenCalledWith({ where: { idPegawai: "1" } });
    expect(KuotaCuti.destroy).toHaveBeenCalledWith({ where: { idPegawai: "1" } });
    expect(mockPegawai.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: "Pegawai berhasil dihapus" });
  });
  
  test('WT-DP-07-02: Menghapus pegawai tanpa relasi User & KuotaCuti', async () => {
    const mockPegawai = { destroy: jest.fn() };
    Pegawai.findByPk.mockResolvedValue(mockPegawai);
    User.destroy.mockResolvedValue(0);
    KuotaCuti.destroy.mockResolvedValue(0);

    await deletePegawai(req, res);

    expect(Pegawai.findByPk).toHaveBeenCalledWith("1");
    expect(User.destroy).toHaveBeenCalledWith({ where: { idPegawai: "1" } });
    expect(KuotaCuti.destroy).toHaveBeenCalledWith({ where: { idPegawai: "1" } });
    expect(mockPegawai.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: "Pegawai berhasil dihapus" });
  });

  test('WT-DP-07-03: Menghapus pegawai dengan id yang tidak ditemukan', async () => {
    Pegawai.findByPk.mockResolvedValue(null);

    await deletePegawai(req, res);

    expect(Pegawai.findByPk).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: "Pegawai tidak ditemukan" });
  });
});

describe("dataPegawai.validatePegawai", () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    test("WT-DP-08-01: Validasi berhasil jika nip dan username belum terdaftar di tabel Pegawai dan User", async () => {
        req.body = { nip: "1234567890", username: "userbaru" };

        Pegawai.findOne.mockResolvedValue(null);
        User.findOne.mockResolvedValue(null);

        await validatePegawai(req, res);

        expect(res.json).toHaveBeenCalledWith({ valid: true });
    });

    test("WT-DP-08-02: Gagal validasi jika nip sudah terdaftar di Pegawai", async () => {
        req.body = { nip: "1111111111", username: "userbaru" };

        Pegawai.findOne.mockResolvedValue({ id: 1, nip: "1111111111" });
        User.findOne.mockResolvedValue(null);

        await validatePegawai(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            errors: { nip: ["NIP sudah terdaftar"] },
        });
    });

    test("WT-DP-08-03: Gagal validasi jika username sudah digunakan di User", async () => {
        req.body = { nip: "1234567890", username: "admin" };

        Pegawai.findOne.mockResolvedValue(null);
        User.findOne.mockResolvedValue({ id: 1, username: "admin" });

        await validatePegawai(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            errors: { username: ["Username sudah digunakan"] },
        });
    });

    test("WT-DP-08-04: Gagal validasi jika nip dan username keduanya sudah terdaftar", async () => {
        req.body = { nip: "1111111111", username: "admin" };

        Pegawai.findOne.mockResolvedValue({ id: 1, nip: "1111111111" });
        User.findOne.mockResolvedValue({ id: 1, username: "admin" });

        await validatePegawai(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            errors: {
                nip: ["NIP sudah terdaftar"],
                username: ["Username sudah digunakan"],
            },
        });
    });
});
