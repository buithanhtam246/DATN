const db = require("../config/db");

exports.getAllBrands = async () => {

    const sql = `
        SELECT 
            id,
            name
        FROM brand
        WHERE status = 1
        ORDER BY name ASC
    `;

    const [rows] = await db.query(sql);

    return rows;
};