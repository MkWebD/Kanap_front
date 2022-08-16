// Creating variables for selectors
const image = document.getElementById("image");
const title = document.getElementById("title");
const price = document.getElementById("price");
const description = document.getElementById("description");
const colors = document.getElementById("colors");
const quantity = document.getElementById("quantity");
const addToCart = document.getElementById("addToCart");

// Creating variable for url
const serverUrl = "http://localhost:3000/api/products/";

// Creating variable for id of product
const id = new URLSearchParams(window.location.search).get("id");

// Create listener for addToCart
addToCart.addEventListener("click", function () {
  addItemToCart(productData);
});

// Create variable with product data
let productData;

// Get data from single object from API
fetch(`${serverUrl}${id}`)
  .then(function (res) {
    if (res.ok) {
      return res.json();
    }
  })
  .then(function (data) {
    productData = data;
    // Add content to page
    createContent(data);
    title.innerHTML = data.name;
    price.innerHTML = data.price;
    description.innerHTML = data.description;
    addColors(data);
  })
  .catch(function (err) {
    console.log(err);
  });

// ********************************************************************************
// Function to map from API data (unique product)
// ********************************************************************************
function createContent(datas) {
  const productImg = `<img src="${datas.imageUrl}" alt="${datas.altTxt}">`;
  image.insertAdjacentHTML("beforeend", productImg);
}

// ********************************************************************************
// Function to add all colors
// ********************************************************************************
function addColors(data) {
  for (let color of data.colors) {
    let element = document.createElement("option");
    element.setAttribute("value", color);
    element.innerHTML = color;
    colors.appendChild(element);
  }
}

// ********************************************************************************
// Function for populating Local Storage
// ********************************************************************************
function addItemToCart(data) {
  // Get values from localStorage & create storage if not created
  let existingStorage = JSON.parse(window.localStorage.getItem("allCouches"));
  if (existingStorage == null) {
    existingStorage = [];
  }
  // Function to update Local Storage
  function updateStorage() {
    window.localStorage.setItem("allCouches", JSON.stringify(existingStorage));
  }
  // Create object with datas from selected item
  let object = {
    id: data._id,
    color: colors.value,
    quantity: parseInt(quantity.value),
  };

  // Check if options are selected
  if (object.color === "" || object.quantity === 0 || object.quantity > 100) {
    alert(
      "Veuillez sélectionner une couleur et/ou renseigner une quantité entre 1 et 100"
    );
  } else {
    // Check if element exists in localStorage
    if (
      existingStorage.find(
        (element) => element.color === object.color && element.id === object.id
      )
    ) {
      // Get index of existing element in localStorage
      let indexValue = existingStorage.findIndex(
        (element) => element.color === object.color && element.id === object.id
      );

      // Increment value of stored element
      existingStorage[indexValue].quantity += object.quantity;

      // Update localStorage with incremented value
      updateStorage();
      window.location.href = "cart.html";
    } else {
      // Add object to localStorage
      existingStorage.push(object);
      updateStorage();
      window.location.href = "cart.html";
    }
  }
}
