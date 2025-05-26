////////////////////////////User.html javascript/////////////////////
const formTitle = document.getElementById("form-title");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const toggleBtn = document.getElementById("toggleBtn");

let isLoginMode = true;

toggleBtn.addEventListener("click", () => {
  isLoginMode = !isLoginMode;
  formTitle.textContent = isLoginMode ? "Login" : "Register";
  loginBtn.classList.toggle("hidden", !isLoginMode);
  registerBtn.classList.toggle("hidden", isLoginMode);
  toggleBtn.textContent = isLoginMode ? "New user? Register here" : "Already have an account? Login";
});

loginBtn.addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (ok) {
        localStorage.setItem('userId', data.user._id);
        alert("Login successful!");
        window.location.href = "index.html";
      } else {
        alert("Login failed: " + data.message);
      }
    })
    .catch(err => {
      alert("Error logging in");
      console.error(err);
    });
});

registerBtn.addEventListener("click", () => {
  // Registration will be added later
  alert("Registration not implemented yet.");
});


////////////////////////////Index.html javascript/////////////////////
  const products = [
    { _id: "3e41ee2b181545dba25236d0", name: "Product 1", price: 111.08, imageUrl: "https://example.com/product1.png" },
    { _id: "7da62b65ac724412b5b4e750", name: "Product 2", price: 304.66, imageUrl: "https://example.com/product2.png" },
    { _id: "139d1c76783641a1a415bd03", name: "Product 3", price: 19.93, imageUrl: "https://example.com/product3.png" },
    { _id: "c5c4d28845444ba299b4d170", name: "Product 4", price: 338.83, imageUrl: "https://example.com/product4.png" },
    { _id: "fd204bc272cb4682b6404c3a", name: "Product 5", price: 250.18, imageUrl: "https://example.com/product5.png" },
    { _id: "a5a84afa69fd4ab39d90d80a", name: "Product 6", price: 224.65, imageUrl: "https://example.com/product6.png" },
    { _id: "a92ef9b56075471f8c5dacdd", name: "Product 7", price: 409.60, imageUrl: "https://example.com/product7.png" },
    { _id: "e80b2c93b0614c1aaecc4a2f", name: "Product 8", price: 398.91, imageUrl: "https://example.com/product8.png" },
    { _id: "51cf92c07b9144e68ff4133b", name: "Product 9", price: 289.75, imageUrl: "https://example.com/product9.png" },
    { _id: "4e169fd1049942fba7b77f6e", name: "Product 10", price: 369.53, imageUrl: "https://example.com/product10.png" }
  ];

  const productList = document.getElementById("productList");
  const cartItems = [];
  const cartSidebar = document.getElementById("cartSidebar");
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  const cartTotal = document.getElementById("cartTotal");

  // Create product cards
  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${product.imageUrl}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>Price: R${product.price.toFixed(2)}</p>
      <input type="number" min="1" value="1" id="qty-${product._id}">
      <button id="btn-${product._id}">Add to Cart</button>
    `;
    productList.appendChild(card);

    const button = card.querySelector(`#btn-${product._id}`);
    button.addEventListener("click", () => {
      const qtyInput = document.getElementById(`qty-${product._id}`);
      const quantity = parseInt(qtyInput.value);

      if (quantity < 1 || isNaN(quantity)) {
        alert("Please enter a valid quantity.");
        return;
      }

      const existing = cartItems.find(item => item.id === product._id);
      if (existing) {
        existing.quantity += quantity;
        existing.subtotal = +(existing.quantity * existing.unitPrice).toFixed(2);
      } else {
        cartItems.push({
          id: product._id,
          name: product.name,
          unitPrice: product.price,
          quantity: quantity,
          subtotal: +(product.price * quantity).toFixed(2)
        });
      }

      updateCartSidebar();
    });
  });

  // Cart UI handlers
  document.getElementById("cartBtn").addEventListener("click", () => {
    cartSidebar.classList.add("active");
  });

  document.getElementById("closeCart").addEventListener("click", () => {
    cartSidebar.classList.remove("active");
  });

  function updateCartSidebar() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cartItems.forEach(item => {
      total += item.subtotal;

      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <strong>${item.name}</strong><br>
        Qty: ${item.quantity} | R${item.subtotal.toFixed(2)}
      `;
      cartItemsContainer.appendChild(div);
    });

    cartTotal.textContent = total.toFixed(2);
}

function insertOrder() {
        
  
    if (cartItems.length === 0) {
     alert("Your cart is empty.");
     return;
    }

    const order = {        
     userId: "c3e6bd7062ce4d53807bb21f",
     items: cartItems.map(item => ({
       productId: item.id,
       name: item.name,
       price: item.unitPrice,
       quantity: item.quantity
     })),
     total: cartItems.reduce((acc, item) => acc + item.subtotal, 0),
     status: "pending",
     createdAt: new Date().toISOString()
   };        

     fetch('http://localhost:3000/add-order', {
   method: 'POST',
   headers: {
     'Content-Type': 'application/json'
   },
   body: JSON.stringify(order)
     })
  .then(res => res.json())
  .then(data => alert(data.message))
  .catch(err => alert('Error: ' + err.message));
 }

