class PredictiveSearch {
  constructor(inputId, resultsId) {
    this.input = document.getElementById(inputId);
    this.results = document.getElementById(resultsId);
    this.setupListeners();
  }

  setupListeners() {
    this.input.addEventListener("keyup", this.fetchResults.bind(this));
  }

  debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  fetchResults() {
    const debouncedFetchResults = this.debounce(() => {
      const query = this.input.value.trim();
      if (query.length > 0) {
        fetch(`/search/suggest.json?q=${query}`)
          .then((response) => response.json())
          .then((data) => {
            if (data?.resources?.results?.products) {
              const products = data.resources.results.products;
              this.displayResults(products);
            } else {
              this.clearResults();
            }
          })
          .catch((error) =>
            console.error("Error fetching search suggestions:", error)
          );
      } else {
        this.clearResults();
      }
    }, 300);

    debouncedFetchResults();
  }

  displayResults(products) {
    if (products && products.length > 0) {
      this.clearResults();
      this.results.style.display = "block";
      products.forEach((product) => {
        this.results.insertAdjacentHTML(
          "beforeend",
          `<div class="search-widget">
                <a href="${product.url}">
                  <img src="${product.featured_image.url}" alt="${product.title}">
                  <div class="product-details">
                    <p>${product.title}</p>
                    <p>$${product.price}</p>
                  </div>
                </a>
              </div>`
        );
      });
    } else {
      this.clearResults();
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
