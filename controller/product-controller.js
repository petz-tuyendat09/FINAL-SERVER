const Product = require("../models/Product");
const Categories = require("../models/Categories");
const productService = require("../services/productServices");
const fs = require("fs");
const path = require("path");

exports.getProductsWithPagination = async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 10,
    };

    const result = await productService.getProductsWithPagination(options);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Controller để tìm kiếm sản phẩm
 * @param {object} req
 * @param {object} res
 * @returns {Promise<void>}
 */
exports.queryProducts = async (req, res) => {
  try {
    const filters = {
      categoryName: req.query.categoryName,
      productSubcategories: req.query.productSubcategories,
      productName: req.query.productName,
      salePercent: req.query.salePercent,
      productStatus: req.query.productStatus,
      limit: parseInt(req.query.limit, 10) || 20,
    };

    const products = await productService.queryProducts(filters);
    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.insertProduct = async (body, productImage) => {
  try {
    const {
      productName,
      productPrice,
      salePercent,
      productQuantity,
      productCategory,
      productSkintype,
      description,
    } = body;

    // Check duplicated product
    const duplicatedProduct = await Product.findOne({
      productName: productName,
    });

    if (duplicatedProduct) {
      // Delete image if duplicated
      const filePath = path.join(
        __dirname,
        "../public/images/products",
        productImage
      );
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete file:", err);
      });
      return { status: 401, message: "Duplicated product name" };
    }

    // If not found, proceed to create a new product
    const categoryFind = await Categories.findOne({ _id: productCategory });
    const skintypeFind = await Skintype.findOne({ _id: productSkintype });

    if (!categoryFind) {
      throw new Error("Category name don't exist");
    }

    if (!skintypeFind) {
      throw new Error("Skintype don't exist");
    }

    // Create a new product schema instance
    const newProduct = new Product({
      productName: productName,
      productPrice: productPrice,
      salePercent: salePercent,
      productSlug: "123",
      productQuantity: productQuantity,
      productImage: productImage,
      productDescription: description,
      productCategory: {
        categoryId: categoryFind._id,
        categoryName: categoryFind.categoryName,
      },
      skinType: {
        skinTypeId: skintypeFind._id,
        skinTypeName: skintypeFind.skinType,
      },
    });

    const result = await newProduct.save();

    // Add to categories database
    categoryFind.products.push({ productId: result._id });
    await categoryFind.save();

    skintypeFind.products.push({ productId: result._id });
    await skintypeFind.save(); // Đã sửa lỗi từ categoryFind.save() thành skintypeFind.save()

    return { status: 201, message: "Product has been inserted to database" };
  } catch (error) {
    // Xóa tệp nếu có lỗi trong quá trình xử lý
    const filePath = path.join(
      __dirname,
      "../public/images/products",
      productImage
    );
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete file:", err);
    });
    throw new Error({ error, message: "There is something wrong..." });
  }
};

exports.deleteProduct = async (id) => {
  try {
    //  Delete product from database
    const deleteProduct = await Product.findByIdAndDelete(id);

    if (!deleteProduct) {
      throw new Error("Product not found");
    }

    // Delete product from categories
    await Categories.updateMany(
      { "products.productId": id },
      { $pull: { products: { productId: id } } }
    );

    await Skintype.updateMany(
      { "products.productId": id },
      { $pull: { products: { productId: id } } }
    );

    const filePath = path.join(
      __dirname,
      "../public/images/products",
      deleteProduct.productImage
    );

    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete file:", err);
    });

    console.log(
      `Product with ID ${id} has been deleted and removed from categories`
    );
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.updateProduct = async (id, body, imageName) => {
  try {
    const {
      productName,
      productPrice,
      salePercent,

      productQuantity,
      productCategory,
      productSkinType,
    } = body;

    const pro = await Product.findById(id);

    if (!pro) {
      throw new Error("Không tìm thấy sản phẩm");
    }

    const duplicatedProduct = await Product.findOne({
      productName: productName,
    });

    if (duplicatedProduct) {
      return { message: "Duplicated name" };
    }

    let categoryFind = null;
    if (productCategory) {
      categoryFind = await Categories.findOne({ _id: productCategory });
    }
    let skintypeFind = null;
    if (productSkinType) {
      skintypeFind = await Skintype.findOne({ _id: productSkintype });
    }

    const cateUpdate = categoryFind
      ? {
          categoryId: categoryFind._id,
          categoryName: categoryFind.name,
        }
      : pro.productCategory;

    const skinTypeUpdate = skintypeFind
      ? {
          skinTypeId: skintypeFind._id,
          skinTypeName: skintypeFind.skinType,
        }
      : pro.skinType;

    if (imageName != "") {
      const filePath = path.join(
        __dirname,
        "../public/images/products",
        pro.productImage
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filePath}`);
      }
    }

    const updateProduct = await Product.findByIdAndUpdate(
      { _id: id },
      {
        productName: productName !== "" ? productName : pro.productName,
        productPrice: productPrice == 0 ? pro.productPrice : productPrice,
        salePercent: salePercent == 0 ? pro.salePercent : salePercent,
        productQuantity:
          productQuantity === 0 ? pro.productQuantity : productQuantity,
        productImage: imageName || pro.productImage,
        productCategory: cateUpdate,
        skinType: skinTypeUpdate,
      }
    );
    return updateProduct;
  } catch (error) {
    throw new Error(error.message);
  }
};
