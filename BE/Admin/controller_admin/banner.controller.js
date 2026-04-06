const { sequelize } = require('../../config/database');
const path = require('path');
const fs = require('fs');

const MAX_ACTIVE_BANNERS = 3;
let bannerStatusColumnReady = false;

const normalizeBannerStatus = (status) => (String(status).trim().toLowerCase() === 'inactive' ? 'inactive' : 'active');

const getStatusCaseSql = () => `
  CASE
    WHEN c.banner_status = 'active' THEN 'active'
    WHEN c.banner_status = 'inactive' THEN 'inactive'
    ELSE 'inactive'
  END
`;

const ensureBannerStatusColumn = async () => {
  if (bannerStatusColumnReady) {
    return;
  }

  const column = await sequelize.query(
    "SHOW COLUMNS FROM categories LIKE 'banner_status'",
    { type: sequelize.QueryTypes.SELECT }
  );

  if (column.length === 0) {
    await sequelize.query(
      "ALTER TABLE categories ADD COLUMN banner_status ENUM('active','inactive') NOT NULL DEFAULT 'inactive'"
    );

    await sequelize.query(
      `UPDATE categories
       SET banner_status = CASE
         WHEN size_guide_image_url IS NOT NULL AND size_guide_image_url <> '' THEN 'active'
         ELSE 'inactive'
       END
       WHERE parent_id IS NULL`
    );
  }

  bannerStatusColumnReady = true;
};

const countActiveBanners = async (excludeCategoryId = null) => {
  await ensureBannerStatusColumn();

  const replacements = [];
  let excludeSql = '';
  if (excludeCategoryId) {
    excludeSql = 'AND id <> ?';
    replacements.push(Number(excludeCategoryId));
  }

  const result = await sequelize.query(
    `SELECT COUNT(*) AS total
     FROM categories
     WHERE parent_id IS NULL
       AND size_guide_image_url IS NOT NULL
       AND size_guide_image_url <> ''
       AND banner_status = 'active'
       ${excludeSql}`,
    {
      replacements,
      type: sequelize.QueryTypes.SELECT
    }
  );

  return Number(result?.[0]?.total || 0);
};

exports.getCategoryBanners = async (req, res) => {
  try {
    await ensureBannerStatusColumn();

    const banners = await sequelize.query(
      `SELECT
        c.id,
        c.id AS category_id,
        c.name AS category_name,
        c.name AS title,
        c.size_guide_image_url AS image_url,
        CONCAT('/products?parentCategory=', c.id) AS link_url,
        ${getStatusCaseSql()} AS status,
        c.note,
        NULL AS created_at,
        NULL AS updated_at
       FROM categories c
       WHERE c.parent_id IS NULL
         AND c.size_guide_image_url IS NOT NULL
         AND c.size_guide_image_url <> ''
       ORDER BY c.id DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    return res.status(200).json({ success: true, data: banners });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi lấy banner danh mục: ' + error.message });
  }
};

exports.createCategoryBanner = async (req, res) => {
  try {
    await ensureBannerStatusColumn();

    const { category_id, note, status } = req.body;

    if (!category_id) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn danh mục cha' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng upload ảnh banner' });
    }

    const category = await sequelize.query(
      `SELECT
        id,
        name,
        size_guide_image_url,
        ${getStatusCaseSql()} AS effective_status
       FROM categories c
       WHERE c.id = ? AND c.parent_id IS NULL
       LIMIT 1`,
      {
        replacements: [category_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (category.length === 0) {
      return res.status(404).json({ success: false, message: 'Danh mục cha không tồn tại' });
    }

    const imageUrl = req.file.filename;
    const bannerNote = (note || '').trim();
    const bannerStatus = normalizeBannerStatus(status);

    const currentStatus = category[0].effective_status === 'inactive' ? 'inactive' : 'active';
    if (bannerStatus === 'active' && currentStatus !== 'active') {
      const activeCount = await countActiveBanners(category_id);
      if (activeCount >= MAX_ACTIVE_BANNERS) {
        return res.status(400).json({
          success: false,
          message: `Chỉ được hiển thị tối đa ${MAX_ACTIVE_BANNERS} banner trên giao diện users`
        });
      }
    }

    if (category[0].size_guide_image_url && category[0].size_guide_image_url !== imageUrl) {
      const oldImagePath = path.join(__dirname, '../../uploads/category-banners', category[0].size_guide_image_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    await sequelize.query(
      `UPDATE categories
       SET size_guide_image_url = ?, note = ?, banner_status = ?
       WHERE id = ?`,
      {
        replacements: [imageUrl, bannerNote, bannerStatus, category_id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    const updated = await sequelize.query(
      `SELECT
        c.id,
        c.id AS category_id,
        c.name AS category_name,
        c.name AS title,
        c.size_guide_image_url AS image_url,
        CONCAT('/products?parentCategory=', c.id) AS link_url,
        ${getStatusCaseSql()} AS status,
        c.note,
        NULL AS created_at,
        NULL AS updated_at
       FROM categories c
       WHERE c.id = ?`,
      {
        replacements: [category_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return res.status(201).json({ success: true, message: 'Lưu banner danh mục thành công', data: updated[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi thêm banner danh mục: ' + error.message });
  }
};

exports.deleteCategoryBanner = async (req, res) => {
  try {
    await ensureBannerStatusColumn();

    const { id } = req.params;

    const category = await sequelize.query(
      'SELECT id, size_guide_image_url FROM categories WHERE id = ? AND parent_id IS NULL LIMIT 1',
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (category.length === 0) {
      return res.status(404).json({ success: false, message: 'Banner không tồn tại' });
    }

    const imagePath = path.join(__dirname, '../../uploads/category-banners', category[0].size_guide_image_url || '');
    if (category[0].size_guide_image_url && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await sequelize.query('UPDATE categories SET size_guide_image_url = NULL, note = NULL, banner_status = ? WHERE id = ?', {
      replacements: ['inactive', id],
      type: sequelize.QueryTypes.UPDATE
    });

    return res.status(200).json({ success: true, message: 'Xóa banner thành công' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi xóa banner: ' + error.message });
  }
};

exports.updateCategoryBanner = async (req, res) => {
  try {
    await ensureBannerStatusColumn();

    const { id } = req.params;
    const { note, status } = req.body;

    const category = await sequelize.query(
      `SELECT
        c.id,
        c.name,
        c.size_guide_image_url,
        c.note,
        ${getStatusCaseSql()} AS effective_status
      FROM categories c
      WHERE c.id = ? AND c.parent_id IS NULL
      LIMIT 1`,
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (category.length === 0) {
      return res.status(404).json({ success: false, message: 'Danh mục cha không tồn tại' });
    }

    let imageUrl = category[0].size_guide_image_url || null;
    if (req.file) {
      imageUrl = req.file.filename;
      if (category[0].size_guide_image_url && category[0].size_guide_image_url !== imageUrl) {
        const oldImagePath = path.join(__dirname, '../../uploads/category-banners', category[0].size_guide_image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const bannerNote = note === undefined ? (category[0].note || '') : String(note).trim();
    const currentStatus = category[0].effective_status === 'inactive' ? 'inactive' : 'active';
    const bannerStatus = status === undefined ? currentStatus : normalizeBannerStatus(status);

    if (bannerStatus === 'active' && currentStatus !== 'active') {
      const activeCount = await countActiveBanners(id);
      if (activeCount >= MAX_ACTIVE_BANNERS) {
        return res.status(400).json({
          success: false,
          message: `Chỉ được hiển thị tối đa ${MAX_ACTIVE_BANNERS} banner trên giao diện users`
        });
      }
    }

    await sequelize.query(
      `UPDATE categories
       SET size_guide_image_url = ?, note = ?, banner_status = ?
       WHERE id = ?`,
      {
        replacements: [imageUrl, bannerNote, bannerStatus, id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    const updated = await sequelize.query(
      `SELECT
        c.id,
        c.id AS category_id,
        c.name AS category_name,
        c.name AS title,
        c.size_guide_image_url AS image_url,
        CONCAT('/products?parentCategory=', c.id) AS link_url,
        ${getStatusCaseSql()} AS status,
        c.note,
        NULL AS created_at,
        NULL AS updated_at
       FROM categories c
       WHERE c.id = ?`,
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return res.status(200).json({ success: true, message: 'Cập nhật banner thành công', data: updated[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật banner: ' + error.message });
  }
};

exports.getSportBanners = async (req, res) => {
  try {
    await ensureBannerStatusColumn();

    const banners = await sequelize.query(
      `SELECT
        c.id,
        c.id AS category_id,
        c.name AS category_name,
        p.name AS parent_category_name,
        CONCAT('Banner ', c.name) AS title,
        c.size_guide_image_url AS image_url,
        CONCAT('/products?categoryId=', c.id) AS link_url,
        ${getStatusCaseSql()} AS status,
        c.note,
        NULL AS created_at,
        NULL AS updated_at
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      WHERE c.parent_id IS NOT NULL
        AND c.size_guide_image_url IS NOT NULL
        AND c.size_guide_image_url <> ''
      ORDER BY c.id DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    return res.status(200).json({ success: true, data: banners });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi lấy banner thể thao: ' + error.message });
  }
};

exports.createSportBanner = async (req, res) => {
  try {
    await ensureBannerStatusColumn();

    const { category_id, note, status } = req.body;

    if (!category_id) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn danh mục con' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng upload ảnh banner' });
    }

    const category = await sequelize.query(
      `SELECT
        c.id,
        c.name,
        c.parent_id,
        c.size_guide_image_url
      FROM categories c
      WHERE c.id = ? AND c.parent_id IS NOT NULL
      LIMIT 1`,
      {
        replacements: [category_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (category.length === 0) {
      return res.status(404).json({ success: false, message: 'Danh mục con không tồn tại' });
    }

    const imageUrl = req.file.filename;
    const bannerNote = (note || '').trim();
    const bannerStatus = normalizeBannerStatus(status);

    if (category[0].size_guide_image_url && category[0].size_guide_image_url !== imageUrl) {
      const oldImagePath = path.join(__dirname, '../../uploads/category-banners', category[0].size_guide_image_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    await sequelize.query(
      `UPDATE categories
       SET size_guide_image_url = ?, note = ?, banner_status = ?
       WHERE id = ?`,
      {
        replacements: [imageUrl, bannerNote, bannerStatus, category_id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    const updated = await sequelize.query(
      `SELECT
        c.id,
        c.id AS category_id,
        c.name AS category_name,
        p.name AS parent_category_name,
        CONCAT('Banner ', c.name) AS title,
        c.size_guide_image_url AS image_url,
        CONCAT('/products?categoryId=', c.id) AS link_url,
        ${getStatusCaseSql()} AS status,
        c.note,
        NULL AS created_at,
        NULL AS updated_at
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      WHERE c.id = ?`,
      {
        replacements: [category_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return res.status(201).json({ success: true, message: 'Lưu banner thể thao thành công', data: updated[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi thêm banner thể thao: ' + error.message });
  }
};

exports.updateSportBanner = async (req, res) => {
  try {
    await ensureBannerStatusColumn();

    const { id } = req.params;
    const { note, status } = req.body;

    const category = await sequelize.query(
      `SELECT
        c.id,
        c.name,
        c.parent_id,
        c.size_guide_image_url,
        c.note,
        ${getStatusCaseSql()} AS effective_status
      FROM categories c
      WHERE c.id = ? AND c.parent_id IS NOT NULL
      LIMIT 1`,
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (category.length === 0) {
      return res.status(404).json({ success: false, message: 'Banner thể thao không tồn tại' });
    }

    let imageUrl = category[0].size_guide_image_url || null;
    if (req.file) {
      imageUrl = req.file.filename;
      if (category[0].size_guide_image_url && category[0].size_guide_image_url !== imageUrl) {
        const oldImagePath = path.join(__dirname, '../../uploads/category-banners', category[0].size_guide_image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const bannerNote = note === undefined ? (category[0].note || '') : String(note).trim();
    const currentStatus = category[0].effective_status === 'inactive' ? 'inactive' : 'active';
    const bannerStatus = status === undefined ? currentStatus : normalizeBannerStatus(status);

    await sequelize.query(
      `UPDATE categories
       SET size_guide_image_url = ?, note = ?, banner_status = ?
       WHERE id = ?`,
      {
        replacements: [imageUrl, bannerNote, bannerStatus, id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    const updated = await sequelize.query(
      `SELECT
        c.id,
        c.id AS category_id,
        c.name AS category_name,
        p.name AS parent_category_name,
        CONCAT('Banner ', c.name) AS title,
        c.size_guide_image_url AS image_url,
        CONCAT('/products?categoryId=', c.id) AS link_url,
        ${getStatusCaseSql()} AS status,
        c.note,
        NULL AS created_at,
        NULL AS updated_at
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      WHERE c.id = ?`,
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return res.status(200).json({ success: true, message: 'Cập nhật banner thể thao thành công', data: updated[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật banner thể thao: ' + error.message });
  }
};

exports.deleteSportBanner = async (req, res) => {
  try {
    await ensureBannerStatusColumn();

    const { id } = req.params;

    const category = await sequelize.query(
      'SELECT id, parent_id, size_guide_image_url FROM categories WHERE id = ? AND parent_id IS NOT NULL LIMIT 1',
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (category.length === 0) {
      return res.status(404).json({ success: false, message: 'Banner thể thao không tồn tại' });
    }

    const imagePath = path.join(__dirname, '../../uploads/category-banners', category[0].size_guide_image_url || '');
    if (category[0].size_guide_image_url && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await sequelize.query(
      'UPDATE categories SET size_guide_image_url = NULL, note = NULL, banner_status = ? WHERE id = ?',
      {
        replacements: ['inactive', id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    return res.status(200).json({ success: true, message: 'Xóa banner thể thao thành công' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi xóa banner thể thao: ' + error.message });
  }
};
