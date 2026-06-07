const pageTitle = document.querySelector("#pageTitle");
const tableText = document.querySelector("#tableText");
const customerBtn = document.querySelector("#customerBtn");
const adminBtn = document.querySelector("#adminBtn");
const customerView = document.querySelector("#customerView");
const adminView = document.querySelector("#adminView");
const menuList = document.querySelector("#menuList");
const cartList = document.querySelector("#cartList");
const totalText = document.querySelector("#totalText");
const submitBtn = document.querySelector("#submitBtn");
const successBox = document.querySelector("#successBox");
const successText = document.querySelector("#successText");
const adminLock = document.querySelector("#adminLock");
const adminContent = document.querySelector("#adminContent");
const pinInput = document.querySelector("#pinInput");
const unlockBtn = document.querySelector("#unlockBtn");
const pinError = document.querySelector("#pinError");
const refreshBtn = document.querySelector("#refreshBtn");
const ordersList = document.querySelector("#ordersList");

const params = new URLSearchParams(window.location.search);
const tableNumber = params.get("table") || "3";
const ownerPin = "1234";

saveTableNumber(tableNumber);
tableText.textContent = `当前桌号：${tableNumber}`;

function renderMenu() {
  menuList.innerHTML = menuItems
    .map(
      (item) => `
        <article class="card">
          <p class="hint">${item.category}</p>
          <h3>${item.name}</h3>
          <p class="hint">${item.description}</p>
          <div class="row">
            <span class="price">${money(item.price)}</span>
            <button data-id="${item.id}" type="button">加入</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderCart() {
  const cart = getCart();

  if (cart.length === 0) {
    cartList.innerHTML = `<div class="empty">还没有选择菜品。</div>`;
    totalText.textContent = "合计：¥0.00";
    submitBtn.disabled = true;
    return;
  }

  submitBtn.disabled = false;
  cartList.innerHTML = cart
    .map(
      (item) => `
        <article class="cart-item">
          <div class="row">
            <div>
              <h3>${item.name}</h3>
              <p class="hint">${money(item.price)} / 份</p>
            </div>
            <div class="item-controls">
              <button class="small-btn secondary" data-action="minus" data-id="${item.id}" type="button">-</button>
              <span class="qty">${item.quantity}</span>
              <button class="small-btn secondary" data-action="plus" data-id="${item.id}" type="button">+</button>
            </div>
          </div>
          <textarea data-id="${item.id}" placeholder="备注：例如少辣、不要葱">${item.notes || ""}</textarea>
        </article>
      `
    )
    .join("");

  totalText.textContent = `合计：${money(getCartTotal(cart))}`;
}

function renderOrders() {
  const orders = getOrders();

  if (orders.length === 0) {
    ordersList.innerHTML = `<div class="empty">暂时没有订单。</div>`;
    return;
  }

  ordersList.innerHTML = orders
    .map(
      (order) => `
        <article class="order-item">
          <div class="row">
            <div>
              <h3>订单号 ${order.orderNumber || order.id}</h3>
              <p class="hint">桌号 ${order.table} · ${order.createdAt}</p>
            </div>
            <span class="status">${order.status}</span>
          </div>
          ${order.items
            .map(
              (item) => `
                <p>
                  <strong>${item.name}</strong>
                  × ${item.quantity}
                  <span class="hint">备注：${item.notes || "无"}</span>
                </p>
              `
            )
            .join("")}
          <div class="row">
            <strong>总价：${money(order.total)}</strong>
            <select data-id="${order.id}">
              <option ${order.status === "新订单" ? "selected" : ""}>新订单</option>
              <option ${order.status === "制作中" ? "selected" : ""}>制作中</option>
              <option ${order.status === "已完成" ? "selected" : ""}>已完成</option>
            </select>
          </div>
        </article>
      `
    )
    .join("");
}

function showCustomer() {
  window.location.hash = "customer";
  pageTitle.textContent = "客人点餐";
  tableText.textContent = `当前桌号：${tableNumber}`;
  customerView.classList.remove("hidden");
  adminView.classList.add("hidden");
}

function showAdmin() {
  window.location.hash = "admin";
  pageTitle.textContent = "老板后台";
  tableText.textContent = "查看客人提交的订单";
  customerView.classList.add("hidden");
  adminView.classList.remove("hidden");
  renderOrders();
}

menuList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const item = menuItems.find((menuItem) => menuItem.id === Number(button.dataset.id));
  addToCart(item);
  renderCart();
});

cartList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const cart = getCart();
  const item = cart.find((cartItem) => cartItem.id === Number(button.dataset.id));
  if (!item) return;

  if (button.dataset.action === "plus") item.quantity += 1;
  if (button.dataset.action === "minus") item.quantity -= 1;

  saveCart(cart.filter((cartItem) => cartItem.quantity > 0));
  renderCart();
});

cartList.addEventListener("input", (event) => {
  if (event.target.tagName !== "TEXTAREA") return;

  const cart = getCart();
  const item = cart.find((cartItem) => cartItem.id === Number(event.target.dataset.id));
  if (!item) return;

  item.notes = event.target.value;
  saveCart(cart);
});

submitBtn.addEventListener("click", () => {
  const cart = getCart();
  const orderId = Date.now();
  const orderNumber = `L${String(orderId).slice(-6)}`;
  const orders = getOrders();

  orders.unshift({
    id: orderId,
    orderNumber,
    table: tableNumber,
    items: cart,
    total: getCartTotal(cart),
    status: "新订单",
    createdAt: new Date().toLocaleString()
  });

  saveOrders(orders);
  clearCart();
  successText.textContent = `订单号：${orderNumber}。老板后台已经可以看到。`;
  successBox.classList.remove("hidden");
  renderCart();
});

unlockBtn.addEventListener("click", () => {
  if (pinInput.value !== ownerPin) {
    pinError.classList.remove("hidden");
    return;
  }

  pinError.classList.add("hidden");
  adminLock.classList.add("hidden");
  adminContent.classList.remove("hidden");
  renderOrders();
});

ordersList.addEventListener("change", (event) => {
  if (event.target.tagName !== "SELECT") return;

  const orders = getOrders();
  const order = orders.find((item) => item.id === Number(event.target.dataset.id));
  if (!order) return;

  order.status = event.target.value;
  saveOrders(orders);
  renderOrders();
});

customerBtn.addEventListener("click", showCustomer);
adminBtn.addEventListener("click", showAdmin);
refreshBtn.addEventListener("click", renderOrders);

renderMenu();
renderCart();

if (window.location.hash === "#admin") {
  showAdmin();
} else {
  showCustomer();
}
