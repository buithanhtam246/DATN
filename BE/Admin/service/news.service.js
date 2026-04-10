const db = require("../config/db");

const normalizeBitInput = (value, defaultValue = 0) => {
    if (value === null || typeof value === 'undefined') return defaultValue;
    if (typeof value === 'number') return Number(value) === 1 ? 1 : 0;
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (typeof value === 'string') {
        const s = value.trim().toLowerCase();
        if (s === '1' || s === 'true' || s === 'yes' || s === 'on') return 1;
        if (s === '0' || s === 'false' || s === 'no' || s === 'off') return 0;
        if (s === 'published' || s === 'active' || s === 'show' || s === 'visible') return 1;
        if (s === 'draft' || s === 'inactive' || s === 'hide' || s === 'hidden') return 0;
    }
    return defaultValue;
};

const normalizeDateTimeInput = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value !== 'string') return null;

    const v = value.trim();
    if (!v) return null;

    // Accept HTML datetime-local: YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return v.replace('T', ' ') + ':00';
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(v)) return v.replace('T', ' ');

    // Already in MySQL DATETIME-like format
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(v)) return v.length === 16 ? v + ':00' : v;

    return v;
};

const slugify = (input) => {
    if (!input) return '';
    const s = String(input)
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return s;
};

exports.getAllNews = async () => {
    let connection;
    try {
        connection = await db.getConnection();
        const sql = `
            SELECT id, title, slug, summary, content, image_url, status, is_featured, author_name, published_at, created_at, updated_at
            FROM news
            ORDER BY id DESC
        `;
        const [rows] = await connection.query(sql);

        return rows.map((row) => ({
            id: row.id,
            title: row.title,
            slug: row.slug,
            summary: row.summary,
            content: row.content,
            imageUrl: row.image_url,
            status: typeof row.status === 'number' ? row.status : normalizeBitInput(row.status, 1),
            isFeatured: typeof row.is_featured === 'number' ? row.is_featured : normalizeBitInput(row.is_featured, 0),
            authorName: row.author_name,
            publishedAt: row.published_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    } catch (error) {
        console.error("❌ Lỗi Service News - getAllNews:", error.message);
        throw error;
    } finally {
        if (connection) await connection.release();
    }
};

exports.getNewsById = async (id) => {
    let connection;
    try {
        connection = await db.getConnection();
        const sql = `
            SELECT id, title, slug, summary, content, image_url, status, is_featured, author_name, published_at, created_at, updated_at
            FROM news
            WHERE id = ?
        `;
        const [rows] = await connection.query(sql, [id]);
        if (rows.length === 0) return null;

        const row = rows[0];
        return {
            id: row.id,
            title: row.title,
            slug: row.slug,
            summary: row.summary,
            content: row.content,
            imageUrl: row.image_url,
            status: typeof row.status === 'number' ? row.status : normalizeBitInput(row.status, 1),
            isFeatured: typeof row.is_featured === 'number' ? row.is_featured : normalizeBitInput(row.is_featured, 0),
            authorName: row.author_name,
            publishedAt: row.published_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    } catch (error) {
        console.error("❌ Lỗi Service News - getNewsById:", error.message);
        throw error;
    } finally {
        if (connection) await connection.release();
    }
};

exports.createNews = async (newsData) => {
    let connection;
    try {
        connection = await db.getConnection();
        const {
            title,
            slug,
            summary,
            content,
            authorName,
            author_name,
            imageUrl,
            image_url,
            status,
            isFeatured,
            is_featured,
            publishedAt,
            published_at
        } = newsData;

        const statusVal = normalizeBitInput(status, 1);
        const isFeaturedVal = normalizeBitInput(
            typeof isFeatured === 'undefined' ? is_featured : isFeatured,
            0
        );
        const imageVal = imageUrl ?? image_url ?? null;
        const authorVal = authorName ?? author_name ?? null;
        const publishedVal = normalizeDateTimeInput(publishedAt ?? published_at);

        const slugVal = (slug && String(slug).trim()) ? String(slug).trim() : slugify(title);
        if (!slugVal) {
            const err = new Error('Slug is required');
            err.statusCode = 400;
            throw err;
        }

        const sql = `
            INSERT INTO news (title, slug, summary, content, image_url, status, is_featured, author_name, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.query(sql, [
            title,
            slugVal,
            summary ?? null,
            content ?? null,
            imageVal,
            statusVal,
            isFeaturedVal,
            authorVal,
            publishedVal
        ]);

        return {
            id: result.insertId,
            title,
            slug: slugVal,
            summary: summary ?? null,
            content: content ?? null,
            imageUrl: imageVal,
            status: statusVal,
            isFeatured: isFeaturedVal,
            authorName: authorVal,
            publishedAt: publishedVal
        };
    } catch (error) {
        console.error("❌ Lỗi Service News - createNews:", error.message);
        throw error;
    } finally {
        if (connection) await connection.release();
    }
};

exports.updateNews = async (id, newsData) => {
    let connection;
    try {
        connection = await db.getConnection();
        const {
            title,
            slug,
            summary,
            content,
            authorName,
            author_name,
            imageUrl,
            image_url,
            status,
            isFeatured,
            is_featured,
            publishedAt,
            published_at
        } = newsData;

        const statusVal = normalizeBitInput(status, 1);
        const isFeaturedVal = normalizeBitInput(
            typeof isFeatured === 'undefined' ? is_featured : isFeatured,
            0
        );
        const imageVal = imageUrl ?? image_url ?? null;
        const authorVal = authorName ?? author_name ?? null;
        const publishedVal = normalizeDateTimeInput(publishedAt ?? published_at);

        const slugVal = (slug && String(slug).trim()) ? String(slug).trim() : slugify(title);
        if (!slugVal) {
            const err = new Error('Slug is required');
            err.statusCode = 400;
            throw err;
        }

        const sql = `
            UPDATE news
            SET title = ?, slug = ?, summary = ?, content = ?, image_url = ?, status = ?, is_featured = ?, author_name = ?, published_at = ?
            WHERE id = ?
        `;
        const [result] = await connection.query(sql, [
            title,
            slugVal,
            summary ?? null,
            content ?? null,
            imageVal,
            statusVal,
            isFeaturedVal,
            authorVal,
            publishedVal,
            id
        ]);

        if (result.affectedRows === 0) return null;

        return {
            id: Number(id),
            title,
            slug: slugVal,
            summary: summary ?? null,
            content: content ?? null,
            imageUrl: imageVal,
            status: statusVal,
            isFeatured: isFeaturedVal,
            authorName: authorVal,
            publishedAt: publishedVal
        };
    } catch (error) {
        console.error("❌ Lỗi Service News - updateNews:", error.message);
        throw error;
    } finally {
        if (connection) await connection.release();
    }
};

exports.deleteNews = async (id) => {
    let connection;
    try {
        connection = await db.getConnection();
        const sql = `DELETE FROM news WHERE id = ?`;
        const [result] = await connection.query(sql, [id]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error("❌ Lỗi Service News - deleteNews:", error.message);
        throw error;
    } finally {
        if (connection) await connection.release();
    }
};
