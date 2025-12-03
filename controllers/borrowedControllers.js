const db = require("../config/db"); // Pastikan koneksi db sudah pakai mysql2/promise

const VALID_STATUSES = ["pending", "accept", "returned", "late"];

function toMySqlDate(date = new Date()) {
  const d = new Date(date);
  const pad = (n) => (n < 10 ? "0" + n : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toMySqlDateTime(date = new Date()) {
  const d = new Date(date);
  const pad = (n) => (n < 10 ? "0" + n : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function defaultDueDate(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toMySqlDate(date);
}

function statusConsumesStock(status) {
  return ["accept", "late"].includes(status);
}

// GET all borrowed
const getAllBorrowed = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.*,
        b.judul AS judul_buku,
        b.penulis,
        u.name AS nama_user,
        u.email AS email_user
      FROM peminjaman p
      JOIN buku b ON p.id_buku = b.id
      JOIN users u ON p.id_user = u.id
      ORDER BY p.created_at DESC
    `);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error("getAllBorrowed error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET borrowed by ID
const getBorrowedById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT 
        p.*,
        b.judul AS judul_buku,
        b.penulis,
        u.name AS nama_user,
        u.email AS email_user
      FROM peminjaman p
      JOIN buku b ON p.id_buku = b.id
      JOIN users u ON p.id_user = u.id
      WHERE p.id = ?
    `, [id]);

    if (!rows.length)
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("getBorrowedById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET borrowed by user ID
const getBorrowedByUserId = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const [rows] = await db.query(`
      SELECT 
        p.*,
        b.judul AS judul_buku,
        b.penulis,
        u.name AS nama_user
      FROM peminjaman p
      JOIN buku b ON p.id_buku = b.id
      JOIN users u ON p.id_user = u.id
      WHERE p.id_user = ?
      ORDER BY p.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (err) {
    console.error("getBorrowedByUserId error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE borrow
const createBorrow = async (req, res) => {
  try {
    const { id_buku, id_user, catatan } = req.body;

    // Validasi
    const [[book]] = await db.query(`SELECT jumlah_tersedia FROM buku WHERE id = ?`, [id_buku]);
    if (!book) return res.status(404).json({ success: false, message: "Buku tidak ditemukan" });

    if (book.jumlah_tersedia <= 0)
      return res.status(400).json({ success: false, message: "Stok buku habis" });

    const [[user]] = await db.query(`SELECT id FROM users WHERE id = ?`, [id_user]);
    if (!user) return res.status(404).json({ success: false, message: "User tidak ditemukan" });

    // User hanya boleh punya 1 peminjaman aktif
    const [active] = await db.query(`
      SELECT id FROM peminjaman 
      WHERE id_user = ? AND status IN ('pending','accept','late')
    `, [id_user]);

    if (active.length)
      return res.status(400).json({ success: false, message: "User sudah memiliki peminjaman aktif" });

    const tglPinjam = toMySqlDate();

    const [result] = await db.query(`
      INSERT INTO peminjaman (id_user, id_buku, tgl_peminjaman, status, catatan)
      VALUES (?, ?, ?, 'pending', ?)
    `, [id_user, id_buku, tglPinjam, catatan || null]);

    res.status(201).json({
      success: true,
      message: "Peminjaman dibuat",
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error("createBorrow error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE borrow
const updateBorrow = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;
    const { status, tgl_jatuh_tempo, catatan } = req.body;

    const [[current]] = await conn.query(
      `SELECT id_buku, status FROM peminjaman WHERE id = ?`,
      [id]
    );

    if (!current)
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

    const newStatus = status || current.status;

    if (!VALID_STATUSES.includes(newStatus))
      return res.status(400).json({ success: false, message: "Status tidak valid" });

    await conn.beginTransaction();

    // Jika status berubah dan perlu update stok
    if (!statusConsumesStock(current.status) && statusConsumesStock(newStatus)) {
      const [[book]] = await conn.query(
        `SELECT jumlah_tersedia FROM buku WHERE id = ? FOR UPDATE`,
        [current.id_buku]
      );

      if (book.jumlah_tersedia <= 0) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: "Stok habis" });
      }

      await conn.query(
        `UPDATE buku SET jumlah_tersedia = jumlah_tersedia - 1 WHERE id = ?`,
        [current.id_buku]
      );
    }

    if (statusConsumesStock(current.status) && !statusConsumesStock(newStatus)) {
      await conn.query(
        `UPDATE buku SET jumlah_tersedia = jumlah_tersedia + 1 WHERE id = ?`,
        [current.id_buku]
      );
    }

    const updates = [];
    const values = [];

    if (status) {
      updates.push("status = ?");
      values.push(newStatus);
    }

    if (tgl_jatuh_tempo || status === "accept") {
      updates.push("tgl_jatuh_tempo = ?");
      values.push(tgl_jatuh_tempo || defaultDueDate());
    }

    if (status === "returned") {
      updates.push("tgl_pengembalian = ?");
      values.push(toMySqlDateTime());
    }

    if (catatan !== undefined) {
      updates.push("catatan = ?");
      values.push(catatan || null);
    }

    if (updates.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: "Tidak ada data yang diubah" });
    }

    values.push(id);

    await conn.query(
      `UPDATE peminjaman SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    await conn.commit();

    res.json({ success: true, message: "Peminjaman diperbarui" });

  } catch (err) {
    await conn.rollback();
    console.error("updateBorrow error:", err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

// DELETE borrow
const deleteBorrow = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;

    const [[row]] = await conn.query(
      `SELECT id_buku, status FROM peminjaman WHERE id = ?`,
      [id]
    );

    if (!row)
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

    await conn.beginTransaction();

    if (statusConsumesStock(row.status)) {
      await conn.query(
        `UPDATE buku SET jumlah_tersedia = jumlah_tersedia + 1 WHERE id = ?`,
        [row.id_buku]
      );
    }

    await conn.query(`DELETE FROM peminjaman WHERE id = ?`, [id]);

    await conn.commit();

    res.json({ success: true, message: "Peminjaman dihapus" });

  } catch (error) {
    await conn.rollback();
    console.error("deleteBorrow error:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
};

module.exports = {
  getAllBorrowed,
  getBorrowedById,
  getBorrowedByUserId,
  createBorrow,
  updateBorrow,
  deleteBorrow
};
