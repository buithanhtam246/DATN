# 🚀 QUICK COMMANDS - PHẦN ĐÁNH GIÁ

## 📍 File Locations

```bash
# Bây giờ tất cả file nằm trong Users module
cd d:\FPT\DATN\BE\Users

# Code files (không di chuyển - ở chỗ cũ)
├── controller/review.controller.js
├── service/review.service.js
├── repository/review.repository.js
├── router/review.router.js
└── model/Review.model.js

# Documentation (di chuyển vào docs/)
└── docs/
    ├── README.md                    ← Start here!
    ├── 00_START_GUIDE.txt
    ├── INDEX.md
    ├── README_REVIEW.md
    ├── REVIEW_API_GUIDE.md
    ├── POSTMAN_TEST_GUIDE.md
    ├── FRONTEND_INTEGRATION.md
    └── ... (8 files total)

# Testing (di chuyển vào test/)
└── test/
    ├── testReviewAPI.js
    └── checkReviewTable.js
```

---

## 💻 USEFUL COMMANDS

### 🚀 Start Server
```bash
cd d:\FPT\DATN\BE
npm start
```
✅ Server chạy tại: http://localhost:3000

### 🧪 Run Auto Test
```bash
cd d:\FPT\DATN\BE
node Users/test/testReviewAPI.js
```
✅ Test 6 API endpoints tự động (2 phút)

### ✔️ Check Database
```bash
cd d:\FPT\DATN\BE
node Users/test/checkReviewTable.js
```
✅ Kiểm tra bảng order_reviews

### 📖 Read Documentation
```bash
# Navigate to docs
cd d:\FPT\DATN\BE\Users\docs

# View files
ls  # hoặc dir (Windows)

# Read specific file
cat README.md               # Navigation guide
cat INDEX.md                # Choose your role
cat REVIEW_API_GUIDE.md     # API reference
cat FRONTEND_INTEGRATION.md # Frontend code
```

### 🔍 View Project Structure
```bash
# Show organization
cat Users/ORGANIZATION_SUMMARY.md

# Show project structure
cat Users/docs/PROJECT_STRUCTURE.md
```

---

## 🎯 COMMON TASKS

### Task 1: I'm a Backend Developer
```bash
# 1. Read summary
cat Users/docs/REVIEW_SUMMARY.md

# 2. Review API guide
cat Users/docs/REVIEW_API_GUIDE.md

# 3. Test API
node Users/test/testReviewAPI.js

# 4. Check code
cat Users/controller/review.controller.js
cat Users/service/review.service.js
```

### Task 2: I'm a Frontend Developer
```bash
# 1. Read frontend guide
cat Users/docs/FRONTEND_INTEGRATION.md

# 2. Copy Vue/React components
# (See the file for code examples)

# 3. Test API
cat Users/docs/POSTMAN_TEST_GUIDE.md
node Users/test/testReviewAPI.js

# 4. Reference API
cat Users/docs/REVIEW_API_GUIDE.md
```

### Task 3: I'm a QA/Tester
```bash
# 1. Auto test
node Users/test/testReviewAPI.js

# 2. Manual test guide
cat Users/docs/POSTMAN_TEST_GUIDE.md

# 3. API reference
cat Users/docs/REVIEW_API_GUIDE.md

# 4. Check DB
node Users/test/checkReviewTable.js
```

### Task 4: I'm a Manager/PM
```bash
# 1. Status report
cat Users/docs/COMPLETION_REPORT.md

# 2. What's included
cat Users/docs/START_HERE.md

# 3. Demo
node Users/test/testReviewAPI.js
```

---

## 📂 NAVIGATE DOCUMENTATION

### From BE Directory:
```bash
cd d:\FPT\DATN\BE

# View docs
cat Users/docs/README.md         # Start here
cat Users/docs/INDEX.md          # Choose role
cat Users/docs/00_START_GUIDE.txt

# View structure
cat Users/ORGANIZATION_SUMMARY.md
cat Users/docs/PROJECT_STRUCTURE.md
```

### View All Docs Files:
```bash
# List all
ls Users/docs/
cd Users/docs/ && ls

# Count files
ls Users/docs/ | wc -l
cd Users/docs/ && Get-ChildItem | Measure-Object | Select-Object Count  # PowerShell
```

### Find Specific File:
```bash
# Find API guide
find Users/docs -name "*API*"
Get-ChildItem Users/docs -Filter "*API*"

# Find Postman guide
find Users/docs -name "*POSTMAN*"
Get-ChildItem Users/docs -Filter "*POSTMAN*"

# Find Integration guide
find Users/docs -name "*INTEGRATION*"
Get-ChildItem Users/docs -Filter "*INTEGRATION*"
```

---

## 🔗 NAVIGATION MAP

### Entry Points:
```
Users/docs/README.md                ← Main navigation
    ↓
Users/docs/INDEX.md                 ← Choose your role
    ↓
Backend:                       Frontend:                  QA:
REVIEW_SUMMARY.md              FRONTEND_INTEGRATION.md    POSTMAN_TEST_GUIDE.md
REVIEW_API_GUIDE.md            REVIEW_API_GUIDE.md        README_REVIEW.md
    ↓                              ↓                          ↓
Code Review                    Copy Components            Execute Tests
```

---

## 📊 FILE COUNT BY CATEGORY

### Documentation:
```
Users/docs/
├── README.md
├── 00_START_GUIDE.txt
├── START_HERE.md
├── INDEX.md
├── README_REVIEW.md
├── REVIEW_SUMMARY.md
├── REVIEW_API_GUIDE.md
├── POSTMAN_TEST_GUIDE.md
├── FRONTEND_INTEGRATION.md
├── COMPLETION_REPORT.md
├── FILE_MANIFEST.md
└── PROJECT_STRUCTURE.md
= 12 files (1,500+ lines)
```

### Testing:
```
Users/test/
├── testReviewAPI.js           (400 lines)
└── checkReviewTable.js        (60 lines)
= 2 files (460 lines)
```

### Code:
```
Users/{controller,service,repository,router,model}/
├── review.controller.js       (150 lines)
├── review.service.js          (350 lines)
├── review.repository.js       (250 lines)
├── review.router.js           (20 lines)
└── Review.model.js            (50 lines)
= 5 files (820 lines)
```

---

## ✅ VERIFY ORGANIZATION

### Check if everything is in place:
```bash
# From BE directory
cd d:\FPT\DATN\BE

# 1. Check docs folder
ls Users/docs/
# Should show: README.md, INDEX.md, REVIEW_*.md, etc.

# 2. Check test folder
ls Users/test/
# Should show: testReviewAPI.js, checkReviewTable.js

# 3. Check code files
ls Users/controller/review.controller.js     # ✅ Should exist
ls Users/service/review.service.js           # ✅ Should exist
ls Users/repository/review.repository.js     # ✅ Should exist
ls Users/router/review.router.js             # ✅ Should exist
ls Users/model/Review.model.js               # ✅ Should exist

# 4. Check server.js updated
grep "reviewRouter" server.js                # ✅ Should find it
```

---

## 🚀 NEXT STEPS

### Immediately:
```bash
# 1. Navigate
cd d:\FPT\DATN\BE

# 2. Read main docs
cat Users/docs/README.md

# 3. Choose your path
cat Users/docs/INDEX.md
```

### Start Development:
```bash
# 1. Start server (Terminal 1)
npm start

# 2. Run tests (Terminal 2)
node Users/test/testReviewAPI.js

# 3. Read code (Text Editor)
code Users/controller/review.controller.js
code Users/service/review.service.js
```

---

## 📞 TROUBLESHOOTING

### Can't find files?
```bash
# Make sure you're in BE directory
cd d:\FPT\DATN\BE

# Check Users folder exists
ls Users/

# Check subfolders
ls Users/docs/
ls Users/test/
```

### Can't run tests?
```bash
# From BE directory
cd d:\FPT\DATN\BE

# Run test
node Users/test/testReviewAPI.js

# If error: make sure server is running
npm start  # in another terminal
```

### Can't read docs?
```bash
# Navigate to docs
cd d:\FPT\DATN\BE\Users\docs

# List files
ls

# Read with cat
cat README.md
cat INDEX.md

# Or use your text editor
code README.md
```

---

## 💡 USEFUL TIPS

### Open all docs in editor:
```bash
# VSCode
code Users/docs/*.md

# Or specific file
code Users/docs/REVIEW_API_GUIDE.md
```

### View file tree:
```bash
# Install tree command (Windows)
tree /F Users

# Or use PowerShell
Get-ChildItem Users -Recurse
```

### Search in docs:
```bash
# Find pattern in docs
grep -r "API" Users/docs/
Get-ChildItem Users/docs -Recurse | Select-String "API"
```

---

## ✨ ORGANIZATION COMPLETE!

```
Users/
├── controller/
│   └── review.controller.js ✅
├── service/
│   └── review.service.js ✅
├── repository/
│   └── review.repository.js ✅
├── router/
│   └── review.router.js ✅
├── model/
│   └── Review.model.js ✅
├── docs/ ✨ NEW
│   └── 12 documentation files
├── test/ ✨ NEW
│   └── 2 test scripts
└── ORGANIZATION_SUMMARY.md ← YOU ARE HERE
```

**Ready to start? → Read `Users/docs/README.md`**

---

Last Updated: 5 March 2026
Status: ✅ Complete
