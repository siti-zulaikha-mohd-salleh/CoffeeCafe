
const STORAGE_KEYS = {
  users: "coffeeCafeUsers",
  currentUser: "coffeeCafeCurrentUser",
  cart: "coffeeCafeCart",
  orders: "coffeeCafeOrders",
  lastOrder: "coffeeCafeLastOrder"
};

function getData(key, fallback) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return data ?? fallback;
  } catch (e) {
    return fallback;
  }
}

function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() { return getData(STORAGE_KEYS.users, []); }
function getCurrentUser() { return getData(STORAGE_KEYS.currentUser, null); }
function getCart() { return getData(STORAGE_KEYS.cart, []); }
function getOrders() { return getData(STORAGE_KEYS.orders, []); }

function formatRM(amount) {
  return "RM " + Number(amount || 0).toFixed(2).replace(".00", "");
}

function renderNavbar() {
  const el = document.getElementById("navbar");
  if (!el) return;
  const user = getCurrentUser();
  el.innerHTML = `
<nav class="navbar navbar-expand-lg navbar-dark custom-nav sticky-top">
  <div class="container">
    <img src="./assets/logo.jpeg" height="50" width="50" alt="Coffee Cafe Logo">
    <a class="navbar-brand fw-bold" href="index.html">COFFEE CAFE</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navMenu">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="menu.html">Menu</a></li>
        <li class="nav-item"><a class="nav-link" href="analytics.html">Analytics</a></li>
        <li class="nav-item"><a class="nav-link" href="cart.html">Cart <span id="cartCount" class="badge bg-warning text-dark"></span></a></li>
        ${user ? `
          <li class="nav-item"><a class="nav-link" href="#">Hi, ${escapeHTML(user.name)}</a></li>
          <li class="nav-item"><a class="nav-link" href="#" onclick="logout()">Logout</a></li>
        ` : `
          <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
          <li class="nav-item"><a class="nav-link" href="register.html">Register</a></li>
        `}
      </ul>
    </div>
  </div>
</nav>`;
  updateCartCount();
}

function renderFooter() {
  const el = document.getElementById("footer");
  if (!el) return;
  el.innerHTML = `
<footer class="footer-section text-white py-4">
  <div class="container">
    <div class="row">
      <div class="col-lg-4 mb-4">
        <h4 class="fw-bold">COFFEECAFE</h4>
        <p>Premium modern coffee ordering experience with elegant design.</p>
      </div>
      <div class="col-lg-4 mb-4">
        <h5>Quick Links</h5>
        <ul class="list-unstyled">
          <li><a href="index.html" class="footer-link">Home</a></li>
          <li><a href="menu.html" class="footer-link">Menu</a></li>
          <li><a href="analytics.html" class="footer-link">Analytics</a></li>
          <li><a href="login.html" class="footer-link">Login</a></li>
        </ul>
      </div>
      <div class="col-lg-4 mb-4">
        <h5>Contact</h5>
        <p>Email: hello@coffeecafe.com</p>
        <p>Phone: +60 12-345 6789</p>
        <p>Kuala Lumpur, Malaysia</p>
      </div>
      <hr class="border-light">
      <div class="text-center"><small>© 2026 Coffee Cafe. All rights reserved.</small></div>
    </div>
  </div>
</footer>`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, m => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[m]));
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  const el = document.getElementById("cartCount");
  if (el) el.textContent = count ? count : "";
}

function addToCart(name, price) {
  const cart = getCart();
  const found = cart.find(item => item.name === name);
  if (found) found.quantity += 1;
  else cart.push({ name, price: Number(price), quantity: 1 });
  setData(STORAGE_KEYS.cart, cart);
  updateCartCount();
  alert(name + " added to cart!");
}

function updateCart(name, action) {
  let cart = getCart();
  const item = cart.find(i => i.name === name);
  if (!item) return;
  if (action === "increase") item.quantity += 1;
  if (action === "decrease") item.quantity -= 1;
  if (action === "remove" || item.quantity <= 0) {
    cart = cart.filter(i => i.name !== name);
  }
  setData(STORAGE_KEYS.cart, cart);
  renderCartPage();
  updateCartCount();
}

function renderCartPage() {
  const container = document.getElementById("cartContent");
  if (!container) return;
  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = `<div class="alert alert-warning">Your cart is empty.</div>`;
    return;
  }
  let total = 0;
  const rows = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return `
<tr>
  <td>${escapeHTML(item.name)}</td>
  <td>${formatRM(item.price)}</td>
  <td>
    <button class="btn btn-sm btn-outline-dark" onclick="updateCart('${escapeJS(item.name)}','decrease')">-</button>
    <span class="mx-2">${item.quantity}</span>
    <button class="btn btn-sm btn-outline-dark" onclick="updateCart('${escapeJS(item.name)}','increase')">+</button>
  </td>
  <td>${formatRM(itemTotal)}</td>
  <td><button class="btn btn-sm btn-danger" onclick="updateCart('${escapeJS(item.name)}','remove')">Remove</button></td>
</tr>`;
  }).join("");
  container.innerHTML = `
<div class="card border-0 shadow-lg p-4">
  <table class="table align-middle">
    <thead><tr><th>Drink</th><th>Price</th><th>Quantity</th><th>Total</th><th>Action</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <hr>
  <div class="d-flex justify-content-between">
    <h4>Grand Total</h4>
    <h4 class="price">${formatRM(total)}</h4>
  </div>
  <a href="checkout.html" class="btn btn-success mt-3">Proceed To Checkout</a>
</div>`;
}

function escapeJS(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function renderCheckoutPage() {
  const cart = getCart();
  if (cart.length === 0) {
    window.location.href = "cart.html";
    return;
  }
  const summary = document.getElementById("orderSummary");
  let total = 0;
  summary.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return `
<div class="d-flex justify-content-between mb-3">
  <div><strong>${escapeHTML(item.name)}</strong><br>Qty: ${item.quantity}</div>
  <div>${formatRM(itemTotal)}</div>
</div>`;
  }).join("") + `<hr><div class="d-flex justify-content-between"><h4>Total</h4><h4>${formatRM(total)}</h4></div>`;
}

function placeOrder(event) {
  event.preventDefault();
  const cart = getCart();
  if (cart.length === 0) {
    window.location.href = "cart.html";
    return;
  }
  const form = event.target;
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderDate = new Date();
  const order = {
    id: "ORD-" + orderDate.getTime(),
    customer_name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    address: form.address.value.trim(),
    items: cart.map(item => ({
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity)
    })),
    total: Number(total),
    dateISO: orderDate.toISOString(),
    date: orderDate.toLocaleString()
  };
  const orders = getOrders();
  orders.push(order);
  setData(STORAGE_KEYS.orders, orders);
  setData(STORAGE_KEYS.lastOrder, order);
  setData(STORAGE_KEYS.cart, []);
  window.location.href = "receipt.html";
}

function renderReceiptPage() {
  const order = getData(STORAGE_KEYS.lastOrder, null);
  const container = document.getElementById("receiptContent");
  if (!container) return;
  if (!order) {
    container.innerHTML = `<div class="alert alert-warning">No recent order found.</div><a href="index.html" class="btn btn-dark">Back Home</a>`;
    return;
  }
  const rows = order.items.map(item => `
<tr>
  <td>${escapeHTML(item.name)}</td>
  <td>${item.quantity}</td>
  <td>${formatRM(item.price * item.quantity)}</td>
</tr>`).join("");
  container.innerHTML = `
<div class="card shadow-lg border-0 p-5">
  <h1 class="fw-bold text-center mb-4">Order Receipt</h1>
  <p><strong>Customer:</strong> ${escapeHTML(order.customer_name)}</p>
  <p><strong>Phone:</strong> ${escapeHTML(order.phone)}</p>
  <p><strong>Address:</strong> ${escapeHTML(order.address)}</p>
  <p><strong>Date:</strong> ${escapeHTML(order.date)}</p>
  <hr>
  <table class="table">
    <thead><tr><th>Drink</th><th>Qty</th><th>Total</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <hr>
  <h3 class="text-end">Grand Total: ${formatRM(order.total)}</h3>
  <button onclick="window.print()" class="btn btn-dark mt-4">Print Receipt</button>
</div>`;
}

function registerUser(event) {
  event.preventDefault();
  const form = event.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim().toLowerCase();
  const password = form.password.value;
  const confirm = form.confirm_password.value;
  const msg = document.getElementById("registerMessage");

  if (!name || !email || !password || !confirm) {
    msg.innerHTML = `<div class="alert alert-danger">Please fill in all fields.</div>`;
    return;
  }
  if (password !== confirm) {
    msg.innerHTML = `<div class="alert alert-danger">Passwords do not match.</div>`;
    return;
  }
  const users = getUsers();
  if (users.some(u => u.email === email)) {
    msg.innerHTML = `<div class="alert alert-danger">Email already registered.</div>`;
    return;
  }
  users.push({ name, email, password });
  setData(STORAGE_KEYS.users, users);
  msg.innerHTML = `<div class="alert alert-success">Registration successful. Please login.</div>`;
  setTimeout(() => window.location.href = "login.html", 800);
}

function loginUser(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.email.value.trim().toLowerCase();
  const password = form.password.value;
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  const msg = document.getElementById("loginMessage");
  if (!user) {
    msg.innerHTML = `<div class="alert alert-danger">Invalid email or password.</div>`;
    return;
  }
  setData(STORAGE_KEYS.currentUser, user);
  window.location.href = "index.html";
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.currentUser);
  window.location.href = "index.html";
}


function getOrderDate(order) {
  if (order.dateISO) {
    const d = new Date(order.dateISO);
    if (!isNaN(d.getTime())) return d;
  }

  if (order.date) {
    const direct = new Date(order.date);
    if (!isNaN(direct.getTime())) return direct;

    // Support older saved orders using Malaysia format like 24/5/2026, 4:55:00 PM
    const match = String(order.date).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,\s*(.*))?/);
    if (match) {
      const day = Number(match[1]);
      const month = Number(match[2]) - 1;
      const year = Number(match[3]);
      const converted = new Date(year, month, day);
      if (!isNaN(converted.getTime())) return converted;
    }
  }

  return null;
}

function toDateKey(date) {
  if (!date || isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function renderAnalyticsPage() {
  const orders = getOrders();
  const now = new Date();
  const todayKey = toDateKey(now);
  let totalSales = 0, todaySales = 0, weeklySales = 0, monthlySales = 0, totalItems = 0;
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const monthKey = todayKey.slice(0, 7);
  const drinkData = {};
  const labels = [], chartSales = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = toDateKey(d);
    labels.push(d.toLocaleDateString("en-US", { weekday: "short" }));
    chartSales.push(
      orders
        .filter(o => toDateKey(getOrderDate(o)) === key)
        .reduce((sum, o) => sum + Number(o.total || 0), 0)
    );
  }

  orders.forEach(order => {
    const d = getOrderDate(order);
    const key = toDateKey(d);
    const amount = Number(order.total || 0);

    totalSales += amount;
    if (key === todayKey) todaySales += amount;
    if (d && d >= sevenDaysAgo) weeklySales += amount;
    if (key.slice(0, 7) === monthKey) monthlySales += amount;

    (order.items || []).forEach(item => {
      totalItems += Number(item.quantity || 0);
      drinkData[item.name] = (drinkData[item.name] || 0) + Number(item.quantity || 0);
    });
  });

  setText("todaySales", formatRM(todaySales));
  setText("weeklySales", formatRM(weeklySales));
  setText("monthlySales", formatRM(monthlySales));
  setText("totalOrders", orders.length);
  setText("totalRevenue", formatRM(totalSales));
  setText("totalDrinks", totalItems);

  const tbody = document.getElementById("recentOrders");
  if (tbody) {
    tbody.innerHTML = orders.length ? [...orders].reverse().map(order => `
<tr><td>${escapeHTML(order.customer_name)}</td><td>${escapeHTML(order.date)}</td><td>${formatRM(order.total)}</td></tr>`).join("") : 
`<tr><td colspan="3" class="text-center text-muted">No orders yet.</td></tr>`;
  }

  if (window.Chart) {
    new Chart(document.getElementById("salesChart"), {
      type: "line",
      data: { labels, datasets: [{ label: "Sales Revenue", data: chartSales, borderWidth: 3, tension: 0.4, fill: true }] },
      options: { responsive: true }
    });
    new Chart(document.getElementById("drinkChart"), {
      type: "pie",
      data: { labels: Object.keys(drinkData), datasets: [{ data: Object.values(drinkData), borderWidth: 2 }] },
      options: { responsive: true, plugins: { legend: { position: "bottom" } } }
    });
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  renderFooter();
  updateCartCount();
});
