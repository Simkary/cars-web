// Login form
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    alert("Login successful! (Demo only)");
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
  contactForm.addEventListener("submit", e => {
    e.preventDefault();
    alert("Thank you for your inquiry! We’ll be in touch soon.");
    contactForm.reset();
  });
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
