const orderServices = require("../services/orderServices");

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
exports.editOrderStatus = async (req, res) => {
  try {
    const { orderId, newStatus } = req.body;
    if (!orderId || !newStatus) {
      return res.status(400).json({
        success: false,
        message: "Order ID and new status are required.",
      });
    }

    const updatedOrder = await orderServices.updateOrderStatus(
      orderId,
      newStatus
    );
    if (!updatedOrder) {
      return res.status(400).json({
        success: false,
        message: "Không thể đổi sang trạng thái trước đó.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error in editOrderStatus: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
