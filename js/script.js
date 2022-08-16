// Creating variable for items to inject
const queryItems = document.getElementById("items");
const serverUrl = "http://localhost:3000/api/products/";

// ********************************************************************************
// Getting data from API
// ********************************************************************************
fetch(serverUrl)
  .then(function (res) {
    if (res.ok) {
      return res.json();
    }
  })
  .then(function (data) {
    createContent(data);
  })
  .catch(function (err) {
    console.log(err);
  });

// ********************************************************************************
// Mapping function from API data
// ********************************************************************************
function createContent(item) {
  for (let i = 0; i < item.length; i++) {
    // Creating card for product
    const productItem = `<a href="./product.html?id=${item[i]._id}">
<article>
  <img src="${item[i].imageUrl}" alt="${item[i].altTxt}">
  <h3 class="productName">${item[i].name}</h3>
  <p class="productDescription">${item[i].description}</p>
</article>
</a>`;
    // Insert template into DOM
    queryItems.insertAdjacentHTML("beforeend", productItem);
  }
}
