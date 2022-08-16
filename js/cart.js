// Creating variable for injecting items
const serverUrl = "http://localhost:3000/api/products/";
let storage = getLocalStorage();

// Creating variables for selectors
const cartItems = document.getElementById("cart__items");
const totalQuantity = document.getElementById("totalQuantity");
const totalPrice = document.getElementById("totalPrice");
const order = document.getElementById("order");

// Creating variables for form selectors
const formFirstName = document.getElementById("firstName");
const formLastName = document.getElementById("lastName");
const formAddress = document.getElementById("address");
const formCity = document.getElementById("city");
const formEmail = document.getElementById("email");
// Selector used for checking form with Regex
const formFields = document.querySelectorAll(
  'input[type="text"],input[type="email"]'
);

// ********************************************************************************
// Regex for each form element
// ********************************************************************************
const nameRegex = new RegExp("^[a-zA-Z àâäéèêëïîôöùûüç'-,.]+$");
const addressRegex = new RegExp(
  "^[0-9]{1,3}(?:(?:[,. ]){1}[-a-zA-Zàâäéèêëïîôöùûüç'-]+)+"
);
const cityRegex = new RegExp("^[a-zA-Zàâäéèêëïîôöùûüç'-]+$");
const emailRegex = new RegExp(
  "^[a-zA-Z0-9-._]+[@]{1}[a-zA-Z0-9-_]+[.]{1}[a-zA-Z]{2,}$"
);
// Create array of regex
const regexList = [nameRegex, nameRegex, addressRegex, cityRegex, emailRegex];
// Create array of error messages for form field
const errorMessages = [
  "Le prénom ne doit pas contenir de chiffres ou de caractères spéciaux",
  "Le nom de famille ne doit pas contenir de chiffres ou de caractères spéciaux",
  "L'adresse entrée doit être valide",
  "La ville ne doit pas contenir de chiffres ou de caractères spéciaux",
  "L'addresse email doit être valide",
];

// ********************************************************************************
// Getting data from API
// ********************************************************************************
let data;
fetch(serverUrl)
  .then(function (res) {
    if (res.ok) {
      return res.json();
    }
  })
  .then(function (value) {
    data = value;
    getLocalStorage();
    createCartElement(storage, data);
    calculateTotal(storage, data);
    modifyProducts();
    checkForm();
    passOrder();
  })
  .catch(function (err) {
    console.log(err);
  });

// ********************************************************************************
// Get datas from localStorage
// ********************************************************************************
function getLocalStorage() {
  let existingStorage = JSON.parse(window.localStorage.getItem("allCouches"));
  if (existingStorage == null) {
    existingStorage = [];
  }
  return existingStorage;
}

// ********************************************************************************
// Create cart element
// ********************************************************************************
function createCartElement(localStored, apiData) {
  class HtmlElement {
    constructor(type, text, append, className, attribute) {
      (this.type = type),
        (this.text = text),
        (this.append = append),
        (this.class = className),
        (this.attribute = attribute),
        (this.createHtml = function () {
          let element = document.createElement(this.type);
          element.innerHTML = this.text;
          if (this.class) {
            element.classList.add(this.class);
          }
          if (this.attribute) {
            if (
              Object.keys(this.attribute).includes("id") &&
              Object.keys(this.attribute).includes("color")
            ) {
              element.dataset.id = this.attribute.id;
              element.dataset.color = this.attribute.color;
            } else {
              let attributes = Object.entries(this.attribute);
              // insert attributes dynamically
              for (let i = 0; i < attributes.length; i++) {
                element.setAttribute(attributes[i][0], attributes[i][1]);
              }
            }
          }
          this.append.append(element);
        });
      this.createHtml();
    }
  }

  // Loop through all localStorage elements && create all Html elements using constructor
  for (let i = 0; i < localStored.length; i++) {
    // Create variable that matches element in cart and element in global API
    let apiElement = [...apiData].find(
      (element) => element._id === localStored[i].id
    );
    // Creating every article html element
    new HtmlElement("article", "", cartItems, "cart__item", {
      id: localStored[i].id,
      color: localStored[i].color,
    });
    // Variable for child selectors
    const articles = cartItems.children[i];
    // Creating every divs & img inside article element
    new HtmlElement("div", "", articles, "cart__item__img");
    new HtmlElement("img", "", articles.firstElementChild, "", {
      src: apiElement.imageUrl,
      alt: apiElement.altTxt,
    });
    // Creating every divs for content
    new HtmlElement("div", "", articles, "cart__item__content");
    // Variable for child selectors
    const description = articles.lastElementChild;
    // Creating every divs for content description (name, color, price)
    new HtmlElement("div", "", description, "cart__item__content__description");
    new HtmlElement("h2", apiElement.name, description.firstElementChild);
    new HtmlElement("p", localStored[i].color, description.firstElementChild);
    new HtmlElement(
      "p",
      `${apiElement.price} €`,
      description.firstElementChild
    );
    // Creating every divs for content settings (quantity, suppress button)
    new HtmlElement("div", "", description, "cart__item__content__settings");
    // Variable for child selectors
    const settings = description.lastElementChild;
    // Creating every divs for settings quantity
    new HtmlElement(
      "div",
      "",
      settings,
      "cart__item__content__settings__quantity"
    );
    new HtmlElement(
      "p",
      `Qté : ${localStored[i].quantity}`,
      settings.firstElementChild
    );
    new HtmlElement("input", "", settings.firstElementChild, "itemQuantity", {
      type: "number",
      name: "itemQuantity",
      min: 1,
      max: 100,
      value: localStored[i].quantity,
    });
    // Creating delete html element
    new HtmlElement(
      "div",
      "",
      settings,
      "cart__item__content__settings__delete"
    );
    new HtmlElement("p", "Supprimer", settings.lastElementChild, "deleteItem");
  }
}

// ********************************************************************************
// Function to calculate number of items & total price
// ********************************************************************************
function calculateTotal(storage, apiData) {
  // Calculate total number of items
  let itemTotal;
  if (storage.length === 0) {
    itemTotal = 0;
    totalQuantity.innerHTML = itemTotal;
  } else {
    itemTotal = [...storage]
      .map((item) => item.quantity)
      .reduce((previousValue, currentValue) => previousValue + currentValue);
    totalQuantity.innerHTML = itemTotal;
  }

  // Calculate total price
  let arrayPrice = [];

  // Loop through local storage
  for (let i = 0; i < storage.length; i++) {
    // Create variable that matches element in cart and element in global API
    let apiElement = [...apiData].find(
      (element) => element._id === storage[i].id
    );

    // Add prices to arrayPrice
    arrayPrice.push(apiElement.price * storage[i].quantity);
  }
  if (arrayPrice.length === 0) {
    totalPrice.innerHTML = 0;
  } else {
    // Sum of all prices in array
    const priceTotal = arrayPrice.reduce(
      (previousValue, currentValue) => previousValue + currentValue
    );
    totalPrice.innerHTML = priceTotal;
  }
}
// ********************************************************************************
// Function to modify products quantity in cart
// ********************************************************************************
function modifyProducts() {
  // Create node list for each element in cart
  const itemQuantityInput = document.getElementsByClassName("itemQuantity");
  const suppressButton = document.getElementsByClassName("deleteItem");
  function updateStorage() {
    window.localStorage.setItem("allCouches", JSON.stringify(storage));
    location.reload();
  }

  // Loop through all deleteItems
  [...suppressButton].forEach((item) => {
    // Create variables for selecting parent node with attributes
    let articleItem = item.parentNode.parentNode.parentNode.parentNode;
    let articleItemIdAttr = articleItem.getAttribute("data-id");
    let articleItemColorAttr = articleItem.getAttribute("data-color");

    // Add event listener for each button
    item.addEventListener("click", () => {
      for (let i = 0; i < storage.length; i++) {
        // Check attributes
        if (
          storage[i].id === articleItemIdAttr &&
          storage[i].color === articleItemColorAttr
        ) {
          // Suppress item from DOM & storage
          storage = storage.filter((item) => {
            if (
              item.id == articleItemIdAttr &&
              item.color == articleItemColorAttr
            ) {
              return false;
            }
            return true;
          });
          // Set updated value to local Storage & reload page
          updateStorage();
        }
      }
    });
  });

  // Loop through all items that have the class "itemQuantity"
  [...itemQuantityInput].forEach((item) => {
    // Create variables for selecting parent node with attributes
    let articleItem = item.parentNode.parentNode.parentNode.parentNode;
    let articleItemIdAttr = articleItem.getAttribute("data-id");
    let articleItemColorAttr = articleItem.getAttribute("data-color");

    // Add event listener for each input
    item.addEventListener("change", (event) => {
      event.preventDefault();
      for (let i = 0; i < storage.length; i++) {
        // Check attributes
        if (
          storage[i].id === articleItemIdAttr &&
          storage[i].color === articleItemColorAttr
        ) {
          // Convert value into number and modify storage
          if (item.value <= 0 || item.value > 100) {
            alert("Le nombre de produits doit être compris entre 1 et 100");
          } else {
            let parsedValue = parseInt(item.value);
            storage[i].quantity = parsedValue;

            // Set updated value to local Storage & reload page
            updateStorage();
          }
        }
      }
    });
  });
}

// ********************************************************************************
// Function to check each item of the form
// ********************************************************************************
function checkForm() {
  class FormChecker {
    constructor(formField, regex, message) {
      (this.formField = formField),
        (this.regex = regex),
        (this.message = message);
    }
  }
  for (let i = 0; i < formFields.length; i++) {
    let formElement = new FormChecker(
      formFields[i],
      regexList[i],
      errorMessages[i]
    );
    let sibling = formElement.formField.nextElementSibling;
    formElement.formField.addEventListener("input", (e) => {
      if (
        e.target.value === null ||
        e.target.value === "" ||
        formElement.regex.test(e.target.value) === true
      ) {
        sibling.innerHTML = "";
        return true;
      } else {
        sibling.innerHTML = formElement.message;
        return false;
      }
    });
  }
}

// ********************************************************************************
// Function to check if form is filled
// ********************************************************************************
function passOrder() {
  order.addEventListener("click", (event) => {
    if (storage.length === 0) {
      event.preventDefault();
      alert("Veuillez ajouter un ou plusieurs objets dans votre panier");
    } else if (
      !nameRegex.test(formFirstName.value) ||
      !nameRegex.test(formLastName.value) ||
      !addressRegex.test(formAddress.value) ||
      !cityRegex.test(formCity.value) ||
      !emailRegex.test(formEmail.value)
    ) {
      event.preventDefault();
      alert("Veuillez renseigner le formulaire correctement");
    } else {
      event.preventDefault();
      let productId = [];
      for (let i = 0; i < storage.length; i++) {
        productId.push(storage[i].id);
      }
      let order = {
        contact: {
          firstName: formFirstName.value,
          lastName: formLastName.value,
          address: formAddress.value,
          city: formCity.value,
          email: formEmail.value,
        },
        products: productId,
      };
      // Envoi du formulaire
      const orderJson = JSON.stringify(order);

      // POST method for order & contact
      fetch(serverUrl + "order", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: orderJson,
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          window.location.href = "confirmation.html?orderId=" + data.orderId;
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
}
