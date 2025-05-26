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
 
