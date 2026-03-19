const brandService = require("../services/brand.service");

exports.getAllBrands = async (req, res) => {
    try {

        const brands = await brandService.getAllBrands();

        res.json({
            success: true,
            data: brands
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};