class PredictiveSearch {
  constructor(e, s) {
    this.input = document.getElementById(e);
    this.results = document.getElementById(s);
    this.setupListeners();
  }

  setupListeners() {
    this.input.addEventListener("keyup", this.fetchResults.bind(this));
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
      const productLimit = 100; // Limit products per collection shown

      const fetchAllCollections = (page = 1) => {
        $.getJSON(`/collections.json?page=${page}&limit=50`, (response) => {
          const collections = response.collections;

          if (collections.length > 0) {
            allCollections = allCollections.concat(collections);
            fetchAllCollections(page + 1); // Fetch next page
          } else {
            // All collections fetched
            const matchedCollections = allCollections.filter(
              (collection) =>
                collection.title.toLowerCase().includes(query.toLowerCase()) ||
                collection.handle.toLowerCase().includes(query.toLowerCase())
            );

            if (matchedCollections.length > 0) {
              matchedCollections.forEach((collection) => {
                // IMPORTANT: Add ?limit=250 here
                $.getJSON(
                  `/collections/${collection.handle}/products.json?limit=250`,
                  (productsData) => {
                    const limitedProducts = productsData.products.slice(
                      0,
                      productLimit
                    );
                    this.displayResults(limitedProducts, collection.title);
                  }
                ).fail((err) => {
                  console.error(
                    `Error fetching products for collection ${collection.title}:`,
                    err
                  );
                });
              });
            } else {
              this.clearResults();
            }
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
          <a href="${product.handle}">
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
