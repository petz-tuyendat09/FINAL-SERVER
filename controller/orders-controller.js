const Order = require("../models/Order");
const Product = require("../models/Product");
const orderServices = require("../services/orderServices");
const User = require("../models/User");
exports.getOrderByUserId = async (req, res) => {
  try {
    const { userId } = req.query;
    if (userId) {
      const orders = await orderServices.getOrderByUserId(userId);
      return res.status(200).json(orders);
    }
  } catch (error) {
    console.log(error);
  }
};

exports.getOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.query;
    console.log(orderId);
    const orders = await orderServices.getOrderByOrderId(orderId);
    return res.status(200).json(orders);
  } catch (error) {
    console.log(error);
  }
};

exports.insertOrders = async (req, res) => {
  try {
    const { 
      customerName, 
      customerPhone, 
      customerEmail, 
      customerAddress, 
      products,
      orderTotal, 
      voucherId,
      orderDiscount, 
      userId, 
      totalAfterDiscount, 
      paymentMethod, 
      orderStatus 
    } = req.body;

    const OrderModel = new Order({
      customerName, 
      customerPhone, 
      customerEmail, 
      customerAddress, 
      products,
      orderTotal, 
      voucherId,
      orderDiscount, 
      userId, 
      totalAfterDiscount, 
      paymentMethod, 
      orderStatus
    });

    const savedOrder = await OrderModel.save();

    const productUpdates = products.map(async (item) => {
      try {
        const product = await Product.findOne({ _id: item.productId, "productOption.name": item.productOption });
        if (product) {
          const option = product.productOption.find(option => option.name === item.productOption);
          if (option && option.productQuantity >= item.productQuantity) {
            option.productQuantity -= item.productQuantity;
            await product.save(); 
          } else {
            throw new Error(`Insufficient quantity for product: ${item.productId}`);
          }
        } else {
          throw new Error(`Product not found: ${item.productId}`);
        }
      } catch (error) {
        console.error(error);
      }
    });

    await Promise.allSettled(productUpdates);

    if (userId) {
      await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            userOrders: {
              orderDate: new Date(),
              orderId: savedOrder._id,
              orderTotal: totalAfterDiscount,
            },
          },
        },
        { new: true }
      );
    }

    return res.status(200).json({ success: true, data: savedOrder });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


exports.queryOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      year,
      month,
      day,
      userId,
      customerName,
      totalPriceSort,
      productQuantitySort,
    } = req.query;

    const orders = await orderServices.queryOrders({
      page,
      limit,
      year,
      month,
      day,
      userId,
      customerName,
      totalPriceSort,
      productQuantitySort,
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });
    }

    const result = await orderServices.cancelOrder(orderId);

    if (!result.success) {
      return res.status(404).json({ success: false, message: result.message });
    }

    return res
      .status(200)
      .json({ success: true, message: "Order canceled successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
