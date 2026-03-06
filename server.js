require("dotenv").config();

const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/product.routes");
const brandRoutes = require("./routes/brand.routes");
const categoryRoutes = require("./routes/category.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/public", express.static("public"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});