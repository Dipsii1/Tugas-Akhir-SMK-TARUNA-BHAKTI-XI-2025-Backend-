const db = require("../config/db");

// ==============================
// AUTO UPDATE LATE
// ==============================
const autoLate = async () => {
  await db.query(`
    UPDATE peminjaman
    SET status = 'late'
    WHERE status = 'accept'
      AND tgl_pengembalian IS NOT NULL
      AND tgl_pengembalian < CURDATE()
  `);
};

// ==============================
// GET ALL BORROWED
// ==============================
const getAllBorrowed = async (req, res) => {
  try {
    await autoLate();

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

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// GET BORROWED BY ID
// ==============================
const getBorrowedById = async (req, res) => {
  try {
    await autoLate();

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
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// GET BORROWED BY USER
// ==============================
const getBorrowedByUserId = async (req, res) => {
  try {
    await autoLate();

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

    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// CREATE BORROW
// ==============================
const createBorrow = async (req, res) => {
  try {
    const { id_buku, id_user, catatan } = req.body;

    if (!id_buku || !id_user)
      return res.status(400).json({ success: false, message: "Data wajib diisi" });

    // === CEK BUKU ===
    const [[book]] = await db.query(
      `SELECT jumlah_tersedia FROM buku WHERE id = ?`,
      [id_buku]
    );

    if (!book)
      return res.status(404).json({ success: false, message: "Buku tidak ditemukan" });

    if (book.jumlah_tersedia <= 0)
      return res.status(400).json({ success: false, message: "Stok buku habis" });

    // === CEK USER ===
    const [[user]] = await db.query(`SELECT id FROM users WHERE id = ?`, [id_user]);
    if (!user)
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });

    // === CEK BUKU YANG SAMA ===
    const [sameBook] = await db.query(`
      SELECT id FROM peminjaman 
      WHERE id_user = ?
        AND id_buku = ?
        AND status IN ('pending', 'accept', 'late')
    `, [id_user, id_buku]);

    if (sameBook.length)
      return res.status(400).json({ success: false, message: "Buku sudah dipinjam" });

    // === SIMPAN ===
    const [result] = await db.query(`
      INSERT INTO peminjaman (id_user, id_buku, tgl_peminjaman, status, catatan)
      VALUES (?, ?, CURDATE(), 'pending', ?)
    `, [id_user, id_buku, catatan || null]);

    res.status(201).json({
      success: true,
      message: "Peminjaman berhasil",
      data: { id: result.insertId }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// UPDATE BORROW
// ==============================
const updateBorrow = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;
    const { status, tgl_pengembalian, catatan } = req.body;

    const [[current]] = await conn.query(
      `SELECT id_buku, status FROM peminjaman WHERE id = ?`,
      [id]
    );

    if (!current)
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

    const allowed = ["pending", "accept", "late", "returned", "rejected"];
    if (status && !allowed.includes(status))
      return res.status(400).json({ success: false, message: "Status tidak valid" });

    await conn.beginTransaction();

    const consumes = (s) => ["accept", "late"].includes(s);
    const oldConsume = consumes(current.status);
    const newConsume = consumes(status);

    // === STOK ===
    if (!oldConsume && newConsume) {
      const [[book]] = await conn.query(
        `SELECT jumlah_tersedia FROM buku WHERE id = ? FOR UPDATE`,
        [current.id_buku]
      );

      if (book.jumlah_tersedia <= 0) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: "Stok habis" });
      }

      await conn.query(`
        UPDATE buku 
        SET jumlah_tersedia = GREATEST(jumlah_tersedia - 1,0)
        WHERE id = ?
      `, [current.id_buku]);
    }

    if (oldConsume && !newConsume) {
      await conn.query(`
        UPDATE buku 
        SET jumlah_tersedia = LEAST(jumlah_tersedia + 1, jumlah_total)
        WHERE id = ?
      `, [current.id_buku]);
    }

    // === UPDATE DATA ===
    const updates = [];
    const values = [];

    if (status) {
      let finalStatus = status;
      const today = new Date().toISOString().slice(0,10);

      if (status === "accept" && tgl_pengembalian && tgl_pengembalian < today)
        finalStatus = "late";

      updates.push("status = ?");
      values.push(finalStatus);
    }

    if (tgl_pengembalian) {
      updates.push("tgl_pengembalian = ?");
      values.push(tgl_pengembalian);
    }

    if (catatan !== undefined) {
      updates.push("catatan = ?");
      values.push(catatan || null);
    }

    if (!updates.length) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: "Tidak ada perubahan" });
    }

    values.push(id);

    await conn.query(
      `UPDATE peminjaman SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    await conn.commit();
    res.json({ success: true, message: "Data berhasil diperbarui" });

  } catch (error) {
    await conn.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
};

// ==============================
// DELETE BORROW
// ==============================
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

    const consumes = ["accept", "late"].includes(row.status);

    await conn.beginTransaction();

    if (consumes) {
      await conn.query(`
        UPDATE buku 
        SET jumlah_tersedia = LEAST(jumlah_tersedia + 1, jumlah_total)
        WHERE id = ?
      `, [row.id_buku]);
    }

    await conn.query(`DELETE FROM peminjaman WHERE id = ?`, [id]);

    await conn.commit();
    res.json({ success: true, message: "Peminjaman dihapus" });

  } catch (error) {
    await conn.rollback();
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
