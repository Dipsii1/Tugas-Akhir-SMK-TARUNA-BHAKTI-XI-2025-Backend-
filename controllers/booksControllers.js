const db = require("../config/db");

// Get all books
const getAllBook = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        b.id,
        b.judul,
        b.penulis,
        b.ISBN,
        b.penerbit,
        b.deskripsi,
        k.nama_kategori AS kategori,
        b.tahun_terbit,
        b.jumlah_total,
        b.jumlah_tersedia,
        b.cover,
        b.created_at,
        b.updated_at
      FROM buku b
      LEFT JOIN kategori_buku k ON b.id_kategori = k.id
      ORDER BY b.id DESC
    `);

    res.status(200).json({
      success: true,
      message: "Books retrieved successfully",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error getAllBook:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve books" });
  }
};

// Get book by ID
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        b.id,
        b.judul,
        b.penulis,
        b.ISBN,
        b.penerbit,
        b.deskripsi,
        k.nama_kategori AS kategori,
        b.tahun_terbit,
        b.jumlah_total,
        b.jumlah_tersedia,
        b.cover,
        b.created_at,
        b.updated_at
      FROM buku b
      LEFT JOIN kategori_buku k ON b.id_kategori = k.id
      WHERE b.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    res.status(200).json({
      success: true,
      message: "Book retrieved successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("Error getBookById:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve book details" });
  }
};

// Create book
const createBook = async (req, res) => {
  try {
    const { judul, penulis, ISBN, penerbit, deskripsi, tahun_terbit, id_kategori, jumlah_total } = req.body;

    if (!judul || !penulis || !ISBN || !penerbit || !deskripsi || !tahun_terbit || !id_kategori || !jumlah_total) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const cover = req.file ? req.file.filename : null;

    // Check duplicate ISBN
    const [exists] = await db.query(`SELECT id FROM buku WHERE ISBN = ?`, [ISBN]);
    if (exists.length) {
      return res.status(409).json({ success: false, message: "ISBN already exists" });
    }

    const jumlah_tersedia = jumlah_total;

    const [result] = await db.query(
      `INSERT INTO buku (judul, penulis, ISBN, penerbit, deskripsi, tahun_terbit, id_kategori, jumlah_total, jumlah_tersedia, cover)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [judul, penulis, ISBN, penerbit, deskripsi, tahun_terbit, id_kategori, jumlah_total, jumlah_tersedia, cover]
    );

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      data: {
        id: result.insertId,
        judul,
        penulis,
        ISBN,
        penerbit,
        deskripsi,
        tahun_terbit,
        id_kategori,
        jumlah_total,
        jumlah_tersedia,
        cover,
      },
    });
  } catch (error) {
    console.error("Error createBook:", error);
    res.status(500).json({ success: false, message: "Failed to add book" });
  }
};

// Update book
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = req.body;

    const [exist] = await db.query(`SELECT * FROM buku WHERE id = ?`, [id]);
    if (!exist.length) return res.status(404).json({ success: false, message: "Book not found" });

    // Prevent ISBN duplicate
    if (updatedFields.ISBN) {
      const [dup] = await db.query(`SELECT id FROM buku WHERE ISBN = ? AND id != ?`, [updatedFields.ISBN, id]);
      if (dup.length) return res.status(409).json({ success: false, message: "ISBN already exists" });
    }

    const [result] = await db.query(`UPDATE buku SET ? WHERE id = ?`, [updatedFields, id]);

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: { id, ...updatedFields },
    });
  } catch (error) {
    console.error("Error updateBook:", error);
    res.status(500).json({ success: false, message: "Failed to update book" });
  }
};

// Delete book
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`SELECT judul FROM buku WHERE id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Book not found" });

    await db.query(`DELETE FROM buku WHERE id = ?`, [id]);

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
      data: { id, judul: rows[0].judul },
    });
  } catch (error) {
    console.error("Error deleteBook:", error);
    res.status(500).json({ success: false, message: "Failed to delete book" });
  }
};

module.exports = {
  getAllBook,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
