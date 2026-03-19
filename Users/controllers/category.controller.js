const categoryService = require("../services/category.service");

exports.getAllCategories = async (req, res) => {
    try {

        const categories = await categoryService.getAllCategories();

        res.json({
            success: true,
            data: categories
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};