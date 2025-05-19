class PredictiveSearch {
  constructor(e, s) {
    this.input = document.getElementById(e);
    this.results = document.getElementById(s);
    this.setupListeners();
  }

  setupListeners() {
    let debounceTimer;
    this.input.addEventListener("keyup", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.fetchResults();
      }, 300);
    });
  }

  debounce(func, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  }

  fetchResults() {
    let query = this.input.value.trim();

    if (query.length > 0) {
      let allCollections = [];
      const productLimit = 100;
      const uniqueProductsMap = new Map();

      const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "");

      const addUniqueProducts = (products) => {
        products.forEach((product) => {
          if (!uniqueProductsMap.has(product.id)) {
            uniqueProductsMap.set(product.id, product);
          }
        });
      };

      const fetchAllCollections = (page = 1) => {
        $.getJSON(`/collections.json?page=${page}&limit=50`, (response) => {
          const collections = response.collections;

          if (collections.length > 0) {
            allCollections = allCollections.concat(collections);
            fetchAllCollections(page + 1);
          } else {
            const search = normalize(query);

            const matchedCollections = allCollections.filter((collection) => {
              const title = normalize(collection.title);
              const handle = normalize(collection.handle);
              return title.includes(search) || handle.includes(search);
            });

            let collectionFetches = [];

            if (matchedCollections.length > 0) {
              collectionFetches = matchedCollections.map((collection) => {
                return $.getJSON(
                  `/collections/${collection.handle}/products.json?limit=250`
                )
                  .then((productsData) => {
                    addUniqueProducts(productsData.products);
                  })
                  .fail((err) => {
                    console.error(
                      `Error fetching products for collection ${collection.title}:`,
                      err
                    );
                  });
              });
            }

            Promise.all(collectionFetches).then(() => {
              $.getJSON(`/products.json?limit=250`, (productResponse) => {
                const matchedProducts = productResponse.products.filter(
                  (product) => {
                    const title = normalize(product.title);
                    return title.includes(search);
                  }
                );

                addUniqueProducts(matchedProducts);

                // Convert Map to Array and limit
                const finalProducts = Array.from(
                  uniqueProductsMap.values()
                ).slice(0, productLimit);

                if (finalProducts.length > 0) {
                  this.displayResults(finalProducts, "Search Results");
                } else {
                  this.clearResults();
                }
              }).fail((err) => {
                console.error("Error fetching products:", err);
              });
            });
          }
        }).fail((err) => {
          console.error("Error fetching collections:", err);
        });
      };

      fetchAllCollections();
    } else {
      this.clearResults();
    }
  }

  displayResults(products) {
    this.clearResults();
    if (products && products.length > 0) {
      this.results.style.display = "block";
      products.forEach((product) => {
        const imageUrl = product.images[0].src
          ? product.images[0].src
          : "path/to/placeholder-image.jpg";

        this.results.insertAdjacentHTML(
          "beforeend",
          `<div class="search-widget">
          <a href="products/${product.handle}">
            <img src="${imageUrl}" alt="${product.title}">
            <div class="product-details">
              <p>${product.title}</p>
              <p>$${product.variants[0].price}</p>
            </div>
          </a>
        </div>`
        );
      });
    }
  }

  clearResults() {
    this.results.innerHTML = "";
    this.results.style.display = "none";
  }
}

const predictiveSearch = new PredictiveSearch(
  "searchInput",
  "search-details-con"
);
