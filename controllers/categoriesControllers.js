const db = require("../config/db");

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM kategori_buku ORDER BY id ASC");
    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error("Error getAllCategories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve categories",
      error: error.message
    });
  }
};

// Get category by ID and books data
const getIdCategories = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID"
      });
    }

    const [rows] = await db.query(
      `SELECT 
        k.id AS kategori_id,
        k.nama_kategori,
        b.id AS buku_id,
        b.judul,
        b.penulis,
        b.penerbit,
        b.deskripsi,
        b.tahun_terbit,
        b.jumlah_total,
        b.jumlah_tersedia,
        b.created_at,
        b.updated_at
      FROM kategori_buku k
      LEFT JOIN buku b ON b.id_kategori = k.id
      WHERE k.id = ?
      ORDER BY b.id ASC`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    const booksByCategories = {
      id: rows[0].kategori_id,
      nama_kategori: rows[0].nama_kategori,
      buku: rows
        .filter(r => r.buku_id !== null) // hindari null jika belum ada buku
        .map(r => ({
          id: r.buku_id,
          judul: r.judul,
          penulis: r.penulis,
          penerbit: r.penerbit,
          deskripsi: r.deskripsi,
          tahun_terbit: r.tahun_terbit,
          jumlah_total: r.jumlah_total,
          jumlah_tersedia: r.jumlah_tersedia,
          created_at: r.created_at,
          updated_at: r.updated_at
        }))
    };

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: booksByCategories
    });

  } catch (error) {
    console.error("Error getIdCategories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve category details",
      error: error.message
    });
  }
};

// Create category
const createCategories = async (req, res) => {
  try {
    const { nama_kategori } = req.body;

    if (!nama_kategori) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (nama_kategori)"
      });
    }

    // Validate nama_kategori is not empty string
    if (nama_kategori.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Category name cannot be empty"
      });
    }

    const [result] = await db.query(
      `INSERT INTO kategori_buku (nama_kategori) VALUES (?)`,
      [nama_kategori.trim()]
    );

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: { 
        id: result.insertId, 
        nama_kategori: nama_kategori.trim() 
      }
    });

  } catch (error) {
    console.error("Error createCategories:", error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: "Category already exists (duplicate entry)",
        error: error.sqlMessage
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_kategori } = req.body;

    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID"
      });
    }

    if (!nama_kategori) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (nama_kategori)"
      });
    }

    // Validate nama_kategori is not empty string
    if (nama_kategori.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Category name cannot be empty"
      });
    }

    // Check if category exists
    const [existingCategory] = await db.query(
      `SELECT id, nama_kategori FROM kategori_buku WHERE id = ?`,
      [id]
    );

    if (existingCategory.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    const [result] = await db.query(
      `UPDATE kategori_buku SET nama_kategori = ? WHERE id = ?`,
      [nama_kategori.trim(), id]
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: {
        id,
        nama_kategori: nama_kategori.trim()
      }
    });

  } catch (error) {
    console.error("Error updateCategory:", error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: "Category name already exists (duplicate entry)",
        error: error.sqlMessage
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID"
      });
    }

    // Check if category exists
    const [existingCategory] = await db.query(
      `SELECT id, nama_kategori FROM kategori_buku WHERE id = ?`,
      [id]
    );

    if (existingCategory.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Check if category is being used by any books
    const [booksUsingCategory] = await db.query(
      `SELECT COUNT(*) as count FROM buku WHERE id_kategori = ?`,
      [id]
    );

    if (booksUsingCategory[0].count > 0) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete category because it is being used by books",
        books_count: booksUsingCategory[0].count
      });
    }

    await db.query(`DELETE FROM kategori_buku WHERE id = ?`, [id]);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: {
        id,
        nama_kategori: existingCategory[0].nama_kategori
      }
    });

  } catch (error) {
    console.error("Error deleteCategory:", error);

    // Handle foreign key constraint error
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        success: false,
        message: "Cannot delete category because it is referenced by book records",
        error: error.sqlMessage
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message
    });
  }
};

module.exports = {
  getAllCategories,
  getIdCategories,
  createCategories,
  updateCategory,
  deleteCategory
};