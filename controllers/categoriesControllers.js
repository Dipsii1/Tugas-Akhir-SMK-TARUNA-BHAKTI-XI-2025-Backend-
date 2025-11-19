const db = require("../config/db");


// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM kategori_buku");
        res.status(200).json({
            success: true,
            message: "Categories retrieved successfully",
            count: rows.length,
            data: rows
        })
    } catch (error) {
        console.error("Error getAllCategories:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve categories",
            error: error.message
        });
    }
}


module.exports = {
    getAllCategories
};