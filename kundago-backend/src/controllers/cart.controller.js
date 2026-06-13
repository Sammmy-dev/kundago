import { Cart, Product } from '../models/index.js';
import { logger } from '../config/index.js';
import { calculateDeliveryFee } from '../utils/delivery.js';

const CART_POPULATE_FIELDS = 'name price images isActive stock weight';

async function populateCartItems(items) {
  const productIds = [...new Set(items.map((item) => item.productId.toString()))];
  const products = productIds.length > 0
    ? await Product.find({ _id: { $in: productIds } }).lean().select(CART_POPULATE_FIELDS)
    : [];
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  return items.map((item) => ({
    quantity: item.quantity,
    priceAtTime: item.priceAtTime,
    productId: productMap.get(item.productId.toString()) || {
      _id: item.productId,
      name: 'Unavailable',
      price: 0,
      images: [],
      isActive: false,
      stock: 0,
      weight: 0
    }
  }));
}

/**
 * @desc    Get user's cart
 * @route   GET /cart
 * @access  Private
 */
export const getCart = async (req, res) => {
  try {
    const { userId } = req.user;

    const cart = await Cart.findOrCreateByUserId(userId);
    const items = await populateCartItems(cart.items);

    const weights = items.map((item) => item.productId?.weight || 0);
    const { fee: deliveryFee } = calculateDeliveryFee(weights);
    const subtotal = cart.calculateTotal();

    res.status(200).json({
      success: true,
      data: {
        cart: {
          _id: cart._id,
          userId: cart.userId,
          items,
          totalItems: items.length,
          totalAmount: subtotal,
          deliveryFee,
          grandTotal: subtotal + deliveryFee,
          updatedAt: cart.updatedAt
        }
      }
    });
  } catch (error) {
    logger.error('Get cart error:', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /cart/add
 * @access  Private
 */
export const addToCart = async (req, res) => {
  try {
    const { userId } = req.user;
    const { productId, quantity = 1 } = req.body;

    // Validate input
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Check if product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not available'
      });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} available`
      });
    }

    // Get or create cart
    const cart = await Cart.findOrCreateByUserId(userId);

    // Check if adding more would exceed stock
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId.toString()
    );
    const totalQuantity = (existingItem?.quantity || 0) + quantity;

    if (totalQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Cannot add ${quantity} items. Only ${product.stock - (existingItem?.quantity || 0)} more available`
      });
    }

    // Add item to cart (uses model method)
    cart.addItem(productId, quantity, product.price);
    await cart.save();

    // Populate for response
    const addItems = await populateCartItems(cart.items);

    const addWeights = addItems.map((item) => item.productId?.weight || 0);
    const { fee: addDeliveryFee } = calculateDeliveryFee(addWeights);
    const addSubtotal = cart.calculateTotal();

    logger.info(`Item added to cart`, { userId, productId, quantity });

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: {
        cart: {
          _id: cart._id,
          items: addItems,
          totalItems: addItems.length,
          totalAmount: addSubtotal,
          deliveryFee: addDeliveryFee,
          grandTotal: addSubtotal + addDeliveryFee
        }
      }
    });
  } catch (error) {
    logger.error('Add to cart error:', { error: error.message });

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
};

/**
 * @desc    Update item quantity in cart
 * @route   PUT /cart/update
 * @access  Private
 */
export const updateCartItem = async (req, res) => {
  try {
    const { userId } = req.user;
    const { productId, quantity } = req.body;

    // Validate input
    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity are required'
      });
    }

    // Find cart
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // If quantity is 0 or less, remove item
    if (quantity <= 0) {
      cart.removeItem(productId);
      await cart.save();

      const removeItems = await populateCartItems(cart.items);

      const removeWeights = removeItems.map((item) => item.productId?.weight || 0);
      const { fee: removeDeliveryFee } = calculateDeliveryFee(removeWeights);
      const removeSubtotal = cart.calculateTotal();

      return res.status(200).json({
        success: true,
        message: 'Item removed from cart',
        data: {
          cart: {
            _id: cart._id,
            items: removeItems,
            totalItems: removeItems.length,
            totalAmount: removeSubtotal,
            deliveryFee: removeDeliveryFee,
            grandTotal: removeSubtotal + removeDeliveryFee
          }
        }
      });
    }

    // Check if product exists and has sufficient stock
    const product = await Product.findOne({ _id: productId, isActive: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not available'
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} available`
      });
    }

    // Update quantity
    const updated = cart.updateItemQuantity(productId, quantity);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Update price to current price
    const item = cart.items.find(
      (item) => item.productId.toString() === productId.toString()
    );
    if (item) {
      item.priceAtTime = product.price;
    }

    await cart.save();

    const updateItems = await populateCartItems(cart.items);

    const updateWeights = updateItems.map((item) => item.productId?.weight || 0);
    const { fee: updateDeliveryFee } = calculateDeliveryFee(updateWeights);
    const updateSubtotal = cart.calculateTotal();

    logger.info(`Cart item updated`, { userId, productId, quantity });

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: {
        cart: {
          _id: cart._id,
          items: updateItems,
          totalItems: updateItems.length,
          totalAmount: updateSubtotal,
          deliveryFee: updateDeliveryFee,
          grandTotal: updateSubtotal + updateDeliveryFee
        }
      }
    });
  } catch (error) {
    logger.error('Update cart error:', { error: error.message });

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update cart'
    });
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /cart/remove/:productId
 * @access  Private
 */
export const removeFromCart = async (req, res) => {
  try {
    const { userId } = req.user;
    const { productId } = req.params;

    // Find cart
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove item
    const removed = cart.removeItem(productId);

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    await cart.save();

    const remItems = await populateCartItems(cart.items);

    const remWeights = remItems.map((item) => item.productId?.weight || 0);
    const { fee: remDeliveryFee } = calculateDeliveryFee(remWeights);
    const remSubtotal = cart.calculateTotal();

    logger.info(`Item removed from cart`, { userId, productId });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: {
        cart: {
          _id: cart._id,
          items: remItems,
          totalItems: remItems.length,
          totalAmount: remSubtotal,
          deliveryFee: remDeliveryFee,
          grandTotal: remSubtotal + remDeliveryFee
        }
      }
    });
  } catch (error) {
    logger.error('Remove from cart error:', { error: error.message });

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
};
