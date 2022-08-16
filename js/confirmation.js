// Creating variable for id of command
const orderIdUrl = new URLSearchParams(window.location.search).get("orderId");

// Creating variable for selectors
const orderId = document.getElementById("orderId");

// Inserting orderId into DOM
orderId.innerHTML = orderIdUrl;

// Suppress local Storage
window.localStorage.clear();
