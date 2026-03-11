const API_BASE = "https://cars-web-zty0.onrender.com";

async function sendInquiry(payload) {
  const res = await fetch(`${API_BASE}/api/inquiry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server error (${res.status}): ${text}`);
  }

  return res.json();
}

// Login form
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    alert("Welcome! You are now logged in.");
    loginForm.reset();
  });
}

// Register form
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", e => {
    e.preventDefault();
    alert("Registration complete! Welcome to AutoFind.");
    registerForm.reset();
  });
}

// Contact form
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async e => {
    e.preventDefault();

    const payload = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      car: document.getElementById("car").value.trim(),
      message: document.getElementById("message").value.trim(),
    };

    try {
      await sendInquiry(payload);
      alert("Thank you for your inquiry! We’ll be in touch soon.");
      contactForm.reset();
      await fetchLastInquiry();
    } catch (err) {
      console.error(err);
      alert("Sorry, we couldn’t submit your request. Please try again later.");
    }
  });
}

// Load last inquiry when the page loads (if the section exists)
window.addEventListener("DOMContentLoaded", () => {
  fetchLastInquiry();
});

// Debug helper: fetch and log the last submitted inquiry
// Usage: open DevTools Console and run `fetchLastInquiry()`
async function fetchLastInquiry() {
  try {
    const res = await fetch(`${API_BASE}/api/last-inquiry`);
    const data = await res.json();
    console.log("Last inquiry:", data.lastInquiry);
    renderLastInquiry(data.lastInquiry);
    return data.lastInquiry;
  } catch (err) {
    console.error("Failed to fetch last inquiry", err);
  }
}

function renderLastInquiry(inquiry) {
  const container = document.getElementById("lastInquiryContent");
  if (!container) return;

  if (!inquiry) {
    container.innerHTML = `<p><em>No inquiries submitted yet.</em></p>`;
    return;
  }

  container.innerHTML = `
    <p><strong>Name:</strong> ${escapeHtml(inquiry.name || "")}</p>
    <p><strong>Email:</strong> ${escapeHtml(inquiry.email || "")}</p>
    <p><strong>Phone:</strong> ${escapeHtml(inquiry.phone || "")}</p>
    <p><strong>Car of Interest:</strong> ${escapeHtml(inquiry.car || "")}</p>
    <p><strong>Message:</strong> ${escapeHtml(inquiry.message || "")}</p>
    <p><em>Received:</em> ${new Date(inquiry.receivedAt).toLocaleString()}</p>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Newsletter signup
const newsletterForm = document.getElementById("newsletterForm");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("newsletterEmail").value.trim();
    if (!email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    alert("Thank you for subscribing! You'll receive our latest updates soon.");
    newsletterForm.reset();
  });
}

// Car filter
const filterForm = document.getElementById("filterForm");
if (filterForm) {
  filterForm.addEventListener("submit", e => {
    e.preventDefault();
    const brand = document.getElementById("brand").value;
    const maxPrice = document.getElementById("price").value;
    const cars = document.querySelectorAll(".car-card");

    cars.forEach(car => {
      const carBrand = car.dataset.brand;
      const carPrice = parseInt(car.dataset.price, 10);
      let visible = true;

      if (brand && carBrand !== brand) visible = false;
      if (maxPrice && carPrice > parseInt(maxPrice, 10)) visible = false;

      car.style.display = visible ? "block" : "none";
    });
  });
}
