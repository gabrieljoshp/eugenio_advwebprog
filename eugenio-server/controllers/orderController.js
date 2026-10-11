const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const { HttpStatus } = require("../config/constants");
const { successResponse, errorResponse } = require("../config/response");

const sellerOrderFilter = async (sellerId) => {
  const products = await Product.find({ seller: sellerId }).select("_id");
  return { "items.product": { $in: products.map((product) => product._id) } };
};

const sellerCanAccessOrder = async (sellerId, order) => {
  const productIds = order.items.map((item) => item.product?._id || item.product);
  return Boolean(
    await Product.exists({ _id: { $in: productIds }, seller: sellerId }),
  );
};

const getOrders = async (req, res) => {
  try {
    const filter = req.user.role === "admin"
      ? {}
      : req.user.role === "seller"
        ? await sellerOrderFilter(req.user.id)
        : { user: req.user.id };
    const orders = await Order.find(filter).populate("user", "firstName lastName email").populate("items.product");
    return successResponse(res, { message: "Orders retrieved successfully.", count: orders.length, data: orders });
  } catch (error) {
    return errorResponse(res, { status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const order = await Order.create({ ...req.body, user: req.user.id });
    return successResponse(res, { status: HttpStatus.CREATED, message: "Order created successfully.", data: order });
  } catch (error) {
    return errorResponse(res, { status: HttpStatus.BAD_REQUEST, message: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) return errorResponse(res, { status: HttpStatus.NOT_FOUND, message: "Order not found" });
    const isOwner = String(existingOrder.user) === String(req.user.id);
    const sellerHasProduct = req.user.role === "seller" && await sellerCanAccessOrder(req.user.id, existingOrder);
    if (req.user.role !== "admin" && !isOwner && !sellerHasProduct) {
      return errorResponse(res, { status: HttpStatus.FORBIDDEN, message: "Forbidden" });
    }
    const updates = req.user.role === "admin"
      ? req.body
      : sellerHasProduct
        ? { status: req.body.status }
      : { shippingAddress: req.body.shippingAddress, paymentMethod: req.body.paymentMethod };
    const order = await Order.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return errorResponse(res, { status: HttpStatus.NOT_FOUND, message: "Order not found" });
    }

    return successResponse(res, { message: "Order updated successfully.", data: order });
  } catch (error) {
    return errorResponse(res, { status: HttpStatus.BAD_REQUEST, message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return errorResponse(res, { status: HttpStatus.NOT_FOUND, message: "Order not found" });
    }

    return successResponse(res, { message: "Order deleted successfully.", data: order });
  } catch (error) {
    return errorResponse(res, { status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user").populate("items.product");
    if (!order) return errorResponse(res, { status: HttpStatus.NOT_FOUND, message: "Order not found" });
    const isOwner = String(order.user._id || order.user) === String(req.user.id);
    const sellerHasProduct = req.user.role === "seller" && await sellerCanAccessOrder(req.user.id, order);
    if (req.user.role !== "admin" && !isOwner && !sellerHasProduct) {
      return errorResponse(res, { status: HttpStatus.FORBIDDEN, message: "Forbidden" });
    }
    return successResponse(res, { message: "Order retrieved successfully.", data: order });
  } catch (error) {
    return errorResponse(res, { status: HttpStatus.BAD_REQUEST, message: "Invalid order id.", error: error.message });
  }
};

module.exports = { getOrders, getOrderById, createOrder, updateOrder, deleteOrder };
