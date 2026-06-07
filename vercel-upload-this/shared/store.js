const cartKey = "qrRestaurantCart";
const ordersKey = "qrRestaurantOrders";
const tableKey = "qrRestaurantTable";
const memoryStore = {};

function readValue(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch (error) {
    return memoryStore[key] || fallback;
  }
}

function writeValue(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    memoryStore[key] = value;
  }
}

function removeValue(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    delete memoryStore[key];
  }
}

function getCart() {
  return JSON.parse(readValue(cartKey, "[]"));
}

function saveCart(cart) {
  writeValue(cartKey, JSON.stringify(cart));
}

function clearCart() {
  removeValue(cartKey);
}

function getOrders() {
  return JSON.parse(readValue(ordersKey, "[]"));
}

function saveOrders(orders) {
  writeValue(ordersKey, JSON.stringify(orders));
}

function getTableNumber() {
  return readValue(tableKey, "");
}

function saveTableNumber(tableNumber) {
  writeValue(tableKey, tableNumber);
}

function addToCart(item) {
  const cart = getCart();
  const found = cart.find((cartItem) => cartItem.id === item.id);

  if (found) {
    found.quantity += 1;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      notes: ""
    });
  }

  saveCart(cart);
}

function getCartTotal(cart) {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function money(amount) {
  return `¥${amount.toFixed(2)}`;
}
