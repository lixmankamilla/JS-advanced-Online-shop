const heartLoad = document.querySelector(".lds-heart");
const rightBlock = document.querySelector(".site-right-blocks");
const leftBlock = document.querySelector(".site-main-block-left");
const catalog = document.querySelector(".catalog-block");
const shopCartBtnMain = document.querySelector(".shop-cart");
const searchInput = document.querySelector("#search-input");
const selectLang = document.querySelector(".select-lang");
const productsCounter = document.querySelector(
  ".site-header-shop-cart-counter"
);
let data = null;
let newFilteredArr;
let arrForBasket = [];

const localStorArrForBasket = localStorage.getItem("basketItems");

if (localStorArrForBasket) {
  arrForBasket = JSON.parse(localStorArrForBasket);
}

const localProductsCounterText = localStorage.getItem("count");

if (localProductsCounterText) {
  productsCounter.textContent = JSON.parse(localProductsCounterText);
}

const language = {
  catalog: {
    en: "Catalog",
    ru: "Каталог",
    az: "Kataloq",
  },
  search: {
    en: "Search",
    ru: "Поиск",
    az: "Axtar",
  },
};

const fetchProductData = () => {
  return fetch("https://dummyjson.com/products/category/smartphones")
    .then((response) => {
      return response.json();
    })
    .then((responseData) => {
      data = responseData.products;
      newFilteredArr = data;
      renderProducts(data);
    });
};

fetchProductData();

const renderProducts = (data) => {
  let product = "";
  data.forEach((dataObj, index) => {
    product += `
    <div class="product-block" data-product-id="${dataObj.id}">
    <div class="product-img"><img src="${dataObj.images[0]}" alt="" width="150px" height="150px"></div>
    <div class="product-title">${dataObj.title}</div>
    <div class="product-desc">${dataObj.description}</div>
    <div class="product-availability-status">${dataObj.availabilityStatus}</div>
    <div class="product-price">${dataObj.price} $</div>
    <div class="product-counter">
    <button class="product-plus-btn" data-id="${index}">+</button>
    <div class="counter" data-id="${index}">1</div>
    <button class="product-minus-btn" data-id="${index}">-</button>
    <button class="product-shop-cart-btn" data-id="${index}"></button>
    </div>
  </div>
    `;
  });
  rightBlock.innerHTML = product;
  return data;
};

const filterProducts = (filterDiv) => {
  const brandsArray = [];
  data.forEach((dataObj) => {
    if (!brandsArray.includes(dataObj.brand)) {
      brandsArray.push(dataObj.brand);
    }
  });

  const brands = {
    type: "brand",
    items: brandsArray,
  };

  const createFilterSelectElement = (filterListData) => {
    const select = document.createElement("select");
    select.classList.add("filters-item");

    select.setAttribute("data-filter", "");

    select.setAttribute("data-type", filterListData.type);

    let options = '<option value="All Products">All Products</option>';
    filterListData.items.forEach((filterItem) => {
      options += `
              <option value="${filterItem}">${filterItem}</option>
          `;
    });

    select.insertAdjacentHTML("beforeend", options);
    select.addEventListener("change", (event) => {
      const filterType = event.target.dataset.type;
      const filterValue = event.target.value;

      const filtered = data.filter((dataObj) => {
        if (
          dataObj[filterType] === filterValue ||
          filterValue === "All Products"
        ) {
          return true;
        }
        return false;
      });

      newFilteredArr = renderProducts(filtered);
    });
    return select;
  };

  const filterSelectBrands = createFilterSelectElement(brands);
  filterDiv.append(filterSelectBrands);
};

const addCategory = (categoryName, categoryDiv) => {
  const allCategory = Array.from(categoryDiv.querySelectorAll(".category-div"));
  let categoryExists = false;

  allCategory.forEach((el) => {
    if (el.textContent === categoryName) {
      categoryExists = true;
      return;
    }
  });

  if (!categoryExists) {
    const categoryNameDiv = document.createElement("li");
    categoryNameDiv.classList.add("category-div");
    categoryNameDiv.textContent = categoryName;

    const filterDiv = document.createElement("div");
    filterDiv.classList.add("filter-div");

    categoryNameDiv.appendChild(filterDiv);
    categoryDiv.appendChild(categoryNameDiv);

    allCategory.push(categoryNameDiv);
    return allCategory;
  }
};

const addToBasket = (arr) => {
  const basketDiv = document.createElement("div");
  basketDiv.classList.add("basket-div");

  const exitBtn = document.createElement("button");
  exitBtn.classList.add("exit-btn");
  exitBtn.textContent = "X";

  const basketProducts = document.createElement("div");
  basketProducts.classList.add("basket-products");

  const allProductsSum = document.createElement("div");
  allProductsSum.classList.add("all-products-count");

  basketDiv.append(basketProducts);
  rightBlock.append(basketDiv);
  basketDiv.append(exitBtn);

  renderBasket(arr, basketProducts);
  localStorage.setItem("basketItems", JSON.stringify(arr));

  exitBtn.addEventListener("click", () => {
    basketDiv.remove();
  });
};

const renderBasket = (renderArr, basketProducts) => {
  let item = "";
  let count = 0;
  renderArr.forEach((product, index) => {
    item += `
    <div class="basket-product" data-product-id="${product.id}">
    <div class="basket-product-img"><img src="${
      product.images[0]
    }" alt="" width="150px" height="150px"></div>
    <div class="basket-product-title">${product.title}</div>
    <div class="basket-product-price"> $${product.price}</div>
    <div class="basket-product-total-price"> <span class="basket-product-total-price-span-text">Total Price: </span> <span class="basket-product-total-price-span-num">${
      product.count * product.price
    } </span>  <span class="basket-product-total-price-span-num-dollar">$</span> </div>
    <div class="basket-product-counter-block">
    <button class="basket-product-plus-btn" data-id="${index}">+</button>
    <div class="basket-product-counter" data-id="${index}">${
      product.count
    }</div>
    <button class="basket-product-minus-btn" data-id="${index}">-</button>
    <button class="basket-product-delete-btn" data-id="${index}"></button>
    </div>
  </div>
    `;
    count = product.count + count;
  });
  productsCounter.textContent = count;
  localStorage.setItem("count", JSON.stringify(productsCounter.textContent));
  basketProducts.innerHTML = item;
};

const deleteFromArr = function (arr, target, basketProducts) {
  const targetParent = target.parentNode;
  const parent = targetParent.parentNode;
  const parentId = parent.getAttribute("data-product-id");
  for (let i = 0; i < arr.length; i++) {
    let el = arr[i];
    if (el.id === +parentId) {
      arr.splice(i, 1);
    }
  }

  renderBasket(arr, basketProducts);
  localStorage.setItem("basketItems", JSON.stringify(arr));
};

const changeCountArr = (arr, target, basketCounter, basketProducts) => {
  const targetParent = target.parentNode;
  const parent = targetParent.parentNode;
  const parentId = parent.getAttribute("data-product-id");
  for (let i = 0; i < arr.length; i++) {
    let el = arr[i];
    if (el.id === +parentId) {
      el.count = +basketCounter.textContent;
    }
  }

  renderBasket(arr, basketProducts);
  localStorage.setItem("basketItems", JSON.stringify(arr));
};

leftBlock.addEventListener("click", (event) => {
  const target = event.target;
  const categoryDivAll = document.querySelector(".category-all-div");

  if (target === catalog) {
    if (categoryDivAll) {
      categoryDivAll.remove();
    } else {
      const categoryDiv = document.createElement("ul");
      categoryDiv.classList.add("category-all-div");
      leftBlock.appendChild(categoryDiv);

      const categories = addCategory("Smartphones", categoryDiv);
      categories.forEach((category) => {
        category.addEventListener("click", (e) => {
          const selectDiv = document.querySelector(".filters-item");
          if (!selectDiv) {
            if (e.target.tagName.toLowerCase() !== "select") {
              const filterDiv = category.querySelector(".filter-div");
              filterProducts(filterDiv);
            }
          } else {
            if (e.target.tagName.toLowerCase() !== "select") {
              selectDiv.remove();
            }
          }
        });
      });
    }
  }
});

rightBlock.addEventListener("click", (event) => {
  const target = event.target;
  const plusBtn = document.querySelectorAll(".product-plus-btn");
  const minusBtn = document.querySelectorAll(".product-minus-btn");
  const shopCartBtn = document.querySelectorAll(".product-shop-cart-btn");
  const productCounter = document.querySelectorAll(".counter");

  plusBtn.forEach((el) => {
    const elId = el.getAttribute("data-id");
    if (target === el) {
      productCounter[elId].textContent = +productCounter[elId].textContent + 1;
    }
  });

  minusBtn.forEach((el) => {
    const elId = el.getAttribute("data-id");
    if (target === el) {
      if (+productCounter[elId].textContent !== 1) {
        productCounter[elId].textContent =
          +productCounter[elId].textContent - 1;
      }
    }
  });

  shopCartBtn.forEach((el) => {
    const elId = el.getAttribute("data-id");
    if (target === el) {
      const shopCartBtnParent = el.parentNode;
      const product = shopCartBtnParent.parentNode;
      const productId = product.getAttribute("data-product-id");
      data.forEach((dataObj) => {
        if (dataObj.id == productId) {
          let found = false;
          if (arrForBasket.length != 0) {
            arrForBasket.forEach((basketItem) => {
              if (basketItem.id === +productId) {
                basketItem.count =
                  basketItem.count + parseInt(productCounter[elId].textContent);
                productCounter[elId].textContent = "1";
                found = true;
                return;
              }
            });
          }
          if (!found) {
            dataObj.count = +productCounter[elId].textContent;
            arrForBasket.push(dataObj);
            productCounter[elId].textContent = "1";
          }
        }
      });
      count = 0;
      arrForBasket.forEach((e) => {
        count = e.count + count;
      });
      productsCounter.textContent = count;
      localStorage.setItem(
        "count",
        JSON.stringify(productsCounter.textContent)
      );
    }
  });
});

shopCartBtnMain.addEventListener("click", () => {
  const basketDiv = document.querySelector(".basket-div");
  if (!basketDiv) {
    addToBasket(arrForBasket);
    const basketPlusBtns = document.querySelectorAll(
      ".basket-product-plus-btn"
    );
    const basketMinusBtns = document.querySelectorAll(
      ".basket-product-minus-btn"
    );
    const basketCounters = document.querySelectorAll(".basket-product-counter");
    const basketDeleteBtns = document.querySelectorAll(
      ".basket-product-delete-btn"
    );
    const basketProduct = document.querySelectorAll(".basket-product");
    const basketProducts = document.querySelectorAll(".basket-products");

    basketPlusBtns.forEach((btn, index) => {
      btn.addEventListener("click", function () {
        basketCounters[index].textContent =
          +basketCounters[index].textContent + 1;
        changeCountArr(
          arrForBasket,
          this,
          basketCounters[index],
          basketProducts
        );
        const btnParent = btn.parentNode;
        const basketProductDiv = btnParent.parentNode;
        const productTotalPriceDiv = basketProductDiv.querySelector(
          ".basket-product-total-price"
        );
        const productTotalPrice = productTotalPriceDiv.querySelector(
          ".basket-product-total-price-span-num"
        );
        const productPrice = basketProductDiv.querySelector(
          ".basket-product-price"
        );

        productTotalPrice.textContent =
          parseFloat(productTotalPrice.textContent) +
          parseFloat(productPrice.textContent.replace(/\$/g, ""));
      });
    });

    basketMinusBtns.forEach((btn, index) => {
      btn.addEventListener("click", function () {
        if (+basketCounters[index].textContent != 1) {
          basketCounters[index].textContent =
            +basketCounters[index].textContent - 1;
          changeCountArr(
            arrForBasket,
            this,
            basketCounters[index],
            basketProducts
          );

          const btnParent = btn.parentNode;
          const basketProductDiv = btnParent.parentNode;
          const productTotalPriceDiv = basketProductDiv.querySelector(
            ".basket-product-total-price"
          );
          const productTotalPrice = productTotalPriceDiv.querySelector(
            ".basket-product-total-price-span-num"
          );
          const productPrice = basketProductDiv.querySelector(
            ".basket-product-price"
          );

          productTotalPrice.textContent =
            parseFloat(productTotalPrice.textContent) -
            parseFloat(productPrice.textContent.replace(/\$/g, ""));
        } else {
          basketProduct[index].remove();
          deleteFromArr(arrForBasket, this, basketProducts);
        }
      });
    });

    basketDeleteBtns.forEach((btn, index) => {
      btn.addEventListener("click", function () {
        basketProduct[index].remove();
        deleteFromArr(arrForBasket, this, basketProducts);
      });
    });
  } else {
    basketDiv.remove();
  }
});

searchInput.addEventListener("input", (event) => {
  const searchText = event.target.value.toLowerCase();
  const filtered = newFilteredArr.filter((element) => {
    if (
      element.title.toLowerCase().includes(searchText) ||
      element.description.toLowerCase().includes(searchText)
    ) {
      return true;
    } else {
      return false;
    }
  });

  renderProducts(filtered);
});

selectLang.addEventListener("change", (event) => {
  const elements = document.querySelectorAll("[data-lang]");
  const selectedLanguage = selectLang.value;

  elements.forEach((el) => {
    const dataLangValue = el.getAttribute("data-lang");
    el.textContent = language[dataLangValue][selectedLanguage];
    if (el === searchInput) {
      el.setAttribute("placeholder", language[dataLangValue][selectedLanguage]);
    }
  });
});
