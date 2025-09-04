const { login, register, refreshToken, logout } = require("../controllers/authController");
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../models", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("authController.login", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("WT-AU-01-01 | login berhasil", async () => {
    req.body = { username: "validUser", password: "validPassword" };

    const mockUser = {
      id: 1,
      idPegawai: 101,
      username: "validUser",
      role: "pegawai",
      password: "hashedPassword",
    };

    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValueOnce("accessToken123").mockReturnValueOnce("refreshToken123");

    await login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ where: { username: "validUser" } });
    expect(bcrypt.compare).toHaveBeenCalledWith("validPassword", "hashedPassword");
    expect(User.update).toHaveBeenCalledWith({ refreshToken: "refreshToken123" }, { where: { id: 1 } });
    expect(res.cookie).toHaveBeenCalledWith("refreshToken", "refreshToken123", expect.any(Object));
    expect(res.json).toHaveBeenCalledWith({
      msg: "Login berhasil",
      accessToken: "accessToken123",
      user: {
        id: 1,
        idPegawai: 101,
        username: "validUser",
        role: "pegawai",
      },
    });
  });

  test("WT-AU-01-02 | username tidak ditemukan", async () => {
    req.body = { username: "unknownUser", password: "anyPassword" };
    User.findOne.mockResolvedValue(null);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: "User tidak ditemukan" });
  });

  test("WT-AU-01-03 | password salah", async () => {
    req.body = { username: "validUser", password: "wrongPassword" };

    const mockUser = { id: 1, username: "validUser", password: "hashedPassword" };
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: "Password salah" });
  });
});

describe('authController.register', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  test('WT-AU-02-01: berhasil register user baru', async () => {
    req.body = {
      idPegawai: 1,
      username: 'pegawai1',
      password: 'password123',
      role: 'pegawai'
    };

    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed_password123');
    User.create.mockResolvedValue({
      id: 10,
      idPegawai: 1,
      username: 'pegawai1',
      role: 'pegawai'
    });

    await register(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ where: { username: 'pegawai1' } });
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(User.create).toHaveBeenCalledWith({
      idPegawai: 1,
      username: 'pegawai1',
      password: 'hashed_password123',
      role: 'pegawai'
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'User berhasil didaftarkan',
      user: {
        id: 10,
        idPegawai: 1,
        username: 'pegawai1',
        role: 'pegawai'
      }
    });
  });

  test('WT-AU-02-02: gagal register karena username sudah terdaftar', async () => {
    req.body = {
      idPegawai: 2,
      username: 'pegawai1',
      password: 'password456',
      role: 'pegawai'
    };

    User.findOne.mockResolvedValue({ id: 99, username: 'pegawai1' });

    await register(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ where: { username: 'pegawai1' } });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'Username sudah terdaftar',
      errors: { username: 'Username ini sudah terdaftar' }
    });
  });
});

describe("authController.refreshToken", () => {
  let req, res;

  beforeEach(() => {
    req = { cookies: {} };
    res = {
      sendStatus: jest.fn(),
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  test("WT-AU-03-01: access token baru ketika refresh token valid", async () => {
    req.cookies.refreshToken = "valid_refresh_token";

    const fakeUser = {
      id: 1,
      idPegawai: 10,
      username: "testuser",
      role: "admin",
    };

    User.findOne.mockResolvedValue(fakeUser);

    jwt.verify.mockReturnValue({ id: 1 });
    jwt.sign.mockReturnValue("new_access_token");

    await refreshToken(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      where: { refreshToken: "valid_refresh_token" },
    });
    expect(jwt.verify).toHaveBeenCalledWith(
      "valid_refresh_token",
      process.env.REFRESH_TOKEN_SECRET
    );
    expect(jwt.sign).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      accessToken: "new_access_token",
      user: {
        id: fakeUser.id,
        idPegawai: fakeUser.idPegawai,
        username: fakeUser.username,
        role: fakeUser.role,
      },
    });
  });

  test("WT-AU-03-02: mengembalikan 401 jika cookie tidak ada", async () => {
    req.cookies = {};

    await refreshToken(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
  });

  test("WT-AU-03-03: mengembalikan 403 jika refresh token tidak terdaftar di DB", async () => {
    req.cookies.refreshToken = "unknown_refresh_token";

    User.findOne.mockResolvedValue(null);

    await refreshToken(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  test("WT-AU-03-04: mengembalikan 403 jika token tidak valid", async () => {
    req.cookies.refreshToken = "invalid_refresh_token";

    User.findOne.mockResolvedValue({ id: 1 });
    jwt.verify.mockImplementation(() => {
      throw new Error("invalid token");
    });

    await refreshToken(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ msg: "Token tidak valid" });
  });
});

describe("authController.logout", () => {
  let req, res;

  beforeEach(() => {
    req = { cookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("WT-AU-04-01: refresh token valid", async () => {
    req.cookies.refreshToken = "valid_token";
    const fakeUser = { id: 1, refreshToken: "valid_token" };

    User.findOne.mockResolvedValue(fakeUser);
    User.update.mockResolvedValue([1]);

    await logout(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ where: { refreshToken: "valid_token" } });
    expect(User.update).toHaveBeenCalledWith({ refreshToken: null }, { where: { id: 1 } });
    expect(res.clearCookie).toHaveBeenCalledWith("refreshToken", { httpOnly: true, sameSite: "strict" });
    expect(res.json).toHaveBeenCalledWith({ msg: "Logout berhasil!" });
  });

  test("WT-AU-04-02: refresh token kosong", async () => {
    await logout(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: "Kamu belum login!" });
  });

  test("WT-AU-04-03: token tidak ada di DB", async () => {
    req.cookies.refreshToken = "not_in_db";

    User.findOne.mockResolvedValue(null);

    await logout(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ msg: "Token login tidak valid atau user sudah logout" });
  });
});