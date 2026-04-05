const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Sử dụng path.resolve để tìm đúng thư mục BE/public
        // __dirname là vị trí file này (BE/Admin/middleware_admin)
        // ../../ sẽ nhảy ra ngoài 2 cấp để về thư mục BE
        const dir = path.resolve(__dirname, '../../public/images/products');

        // Log đường dẫn này ra Terminal để bạn kiểm tra xem nó trỏ đi đâu
        console.log('📂 File destination:', dir);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'product-' + uniqueSuffix + path.extname(file.originalname);
        console.log('📝 File saved as:', filename, 'fieldname:', file.fieldname, 'size:', file.size);
        cb(null, filename);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware to log incoming files
upload.use = (req, res, next) => {
    console.log('📥 Multer middleware triggered');
    next();
};

console.log('✅ Upload middleware loaded');
module.exports = upload;