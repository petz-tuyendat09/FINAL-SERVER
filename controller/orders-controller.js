const orderServices = require("../services/orderServices");

exports.getOrderByUserId = async (req, res) => {
  try {
    const { userId } = req.query;
    const orders = await orderServices.getOrderByUserId(userId);
    return res.status(200).json(orders);
  } catch (error) {
    console.log(error);
  }
};
