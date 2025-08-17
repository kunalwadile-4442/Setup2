// utils/cart.utils.js
export function formatCart(cart) {
  if (!cart) return null;

  let totalQuantity = 0;
  let totalPrice = 0;

  cart.items.forEach((item) => {
    if (item.product) {
      totalQuantity += item.quantity;
      totalPrice += item.quantity * item.product.price;
    }
  });

  return {
    ...cart.toObject(),
    totalQuantity,
    totalPrice,
  };
}
