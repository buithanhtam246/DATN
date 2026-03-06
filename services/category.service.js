const db = require("../config/db");

exports.getAllCategories = async () => {

    const sql = `
        SELECT 
            id,
            name
        FROM categories
        WHERE status = 1
        ORDER BY name ASC
    `;

    const [rows] = await db.query(sql);

    return rows;
};