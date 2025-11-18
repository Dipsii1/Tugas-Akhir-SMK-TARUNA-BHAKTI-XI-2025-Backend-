const db = require("../config/db");

// Get all books
const getAllBuku = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        b.id,
        b.judul,
        p.nama_penulis AS penulis,
        pb.nama_penerbit AS penerbit,
        k.nama_kategori AS kategori,
        b.tahun_terbit,
        b.jumlah_total,
        b.jumlah_tersedia,
        b.created_at,
        b.updated_at
      FROM buku b
      LEFT JOIN penulis p ON b.id_penulis = p.id
      LEFT JOIN penerbit pb ON b.id_penerbit = pb.id
      LEFT JOIN kategori_buku k ON b.id_kategori = k.id
    `);

    res.status(200).json({
      success: true,
      message: "Books retrieved successfully",
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error("Error getAllBuku:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve books",
      error: error.message 
    });
  }
};

// Get book by ID
const getBukuById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid book ID" 
      });
    }

    const [rows] = await db.query(
      `SELECT 
        b.id,
        b.judul,
        p.nama_penulis AS penulis,
        pb.nama_penerbit AS penerbit,
        k.nama_kategori AS kategori,
        b.tahun_terbit,
        b.jumlah_total,
        b.jumlah_tersedia,
        b.created_at,
        b.updated_at
      FROM buku b
      LEFT JOIN penulis p ON b.id_penulis = p.id
      LEFT JOIN penerbit pb ON b.id_penerbit = pb.id
      LEFT JOIN kategori_buku k ON b.id_kategori = k.id
      WHERE b.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Book not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Book retrieved successfully",
      data: rows[0] 
    });
  } catch (error) {
    console.error("Error getBukuById:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve book details",
      error: error.message 
    });
  }
};

// Create book
const tambahBuku = async (req, res) => {
  try {
    const { judul, id_penulis, id_penerbit, tahun_terbit, id_kategori, jumlah_total } = req.body;

    // Validate required fields
    if (!judul || !id_penulis || !id_penerbit || !tahun_terbit || !id_kategori || !jumlah_total) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required (judul, id_penulis, id_penerbit, tahun_terbit, id_kategori, jumlah_total)" 
      });
    }

    // Validate data types
    if (isNaN(id_penulis) || isNaN(id_penerbit) || isNaN(id_kategori) || isNaN(jumlah_total)) {
      return res.status(400).json({ 
        success: false,
        message: "Author ID, publisher ID, category ID, and total quantity must be numbers" 
      });
    }

    if (jumlah_total < 0) {
      return res.status(400).json({ 
        success: false,
        message: "Total quantity cannot be negative" 
      });
    }

    // Validate publication year
    const currentYear = new Date().getFullYear();
    if (tahun_terbit < 1000 || tahun_terbit > currentYear + 1) {
      return res.status(400).json({ 
        success: false,
        message: `Invalid publication year (must be between 1000 - ${currentYear + 1})` 
      });
    }

    const jumlah_tersedia = jumlah_total;

    const [result] = await db.query(
      `INSERT INTO buku 
      (judul, id_penulis, id_penerbit, tahun_terbit, id_kategori, jumlah_total, jumlah_tersedia)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [judul, id_penulis, id_penerbit, tahun_terbit, id_kategori, jumlah_total, jumlah_tersedia]
    );

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      data: {
        id: result.insertId,
        judul,
        id_penulis,
        id_penerbit,
        tahun_terbit,
        id_kategori,
        jumlah_total,
        jumlah_tersedia
      }
    });

  } catch (error) {
    console.error("Error tambahBuku:", error);

    // Handle foreign key constraint error
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ 
        success: false,
        message: "Author ID, publisher ID, or category ID not found. Please ensure master data exists.",
        error: error.sqlMessage 
      });
    }

    // Handle duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        success: false,
        message: "Book already exists (duplicate entry)",
        error: error.sqlMessage 
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Failed to add book",
      error: error.message 
    });
  }
};

// Update book
const updateBuku = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      judul,
      id_penulis,
      id_penerbit,
      tahun_terbit,
      id_kategori,
      jumlah_total,
      jumlah_tersedia
    } = req.body;

    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid book ID" 
      });
    }

    // Check if book exists
    const [existingBook] = await db.query(
      `SELECT id FROM buku WHERE id = ?`,
      [id]
    );

    if (existingBook.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Book not found" 
      });
    }

    // Validate inputs if provided
    if (jumlah_total !== undefined && jumlah_total < 0) {
      return res.status(400).json({ 
        success: false,
        message: "Total quantity cannot be negative" 
      });
    }

    if (jumlah_tersedia !== undefined && jumlah_tersedia < 0) {
      return res.status(400).json({ 
        success: false,
        message: "Available quantity cannot be negative" 
      });
    }

    if (jumlah_tersedia !== undefined && jumlah_total !== undefined && jumlah_tersedia > jumlah_total) {
      return res.status(400).json({ 
        success: false,
        message: "Available quantity cannot exceed total quantity" 
      });
    }

    // Validate publication year if provided
    if (tahun_terbit !== undefined) {
      const currentYear = new Date().getFullYear();
      if (tahun_terbit < 1000 || tahun_terbit > currentYear + 1) {
        return res.status(400).json({ 
          success: false,
          message: `Invalid publication year (must be between 1000 - ${currentYear + 1})` 
        });
      }
    }

    const [result] = await db.query(`
      UPDATE buku SET
        judul = ?,
        id_penulis = ?,
        id_penerbit = ?,
        tahun_terbit = ?,
        id_kategori = ?,
        jumlah_total = ?,
        jumlah_tersedia = ?
      WHERE id = ?
    `, [
      judul,
      id_penulis,
      id_penerbit,
      tahun_terbit,
      id_kategori,
      jumlah_total,
      jumlah_tersedia,
      id
    ]);

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: {
        id,
        judul,
        id_penulis,
        id_penerbit,
        tahun_terbit,
        id_kategori,
        jumlah_total,
        jumlah_tersedia
      }
    });

  } catch (error) {
    console.error("Error updateBuku:", error);

    // Handle foreign key constraint error
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ 
        success: false,
        message: "Author ID, publisher ID, or category ID not found",
        error: error.sqlMessage 
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Failed to update book",
      error: error.message 
    });
  }
};

// Delete book
const deleteBuku = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid book ID" 
      });
    }

    // Check if book exists
    const [existingBook] = await db.query(
      `SELECT id, judul FROM buku WHERE id = ?`,
      [id]
    );

    if (existingBook.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Book not found" 
      });
    }

    await db.query(`DELETE FROM buku WHERE id = ?`, [id]);

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
      data: {
        id,
        judul: existingBook[0].judul
      }
    });

  } catch (error) {
    console.error("Error deleteBuku:", error);

    // Handle foreign key constraint error (if there are loans)
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ 
        success: false,
        message: "Cannot delete book because it is referenced by loan records",
        error: error.sqlMessage 
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Failed to delete book",
      error: error.message 
    });
  }
};

module.exports = {
  getAllBuku,
  getBukuById,
  tambahBuku,
  updateBuku,
  deleteBuku
};