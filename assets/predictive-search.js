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
      fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.resources?.results?.products) {
            this.displayResults(data.resources.results.products);
          } else {
            this.clearResults();
          }
        })
        .catch((err) => console.error("Error fetching search results:", err));
    } else {
      this.clearResults();
    }
  }

  displayResults(products) {
    this.clearResults();
    if (products && products.length > 0) {
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
    }
  }

  clearResults() {
    this.results.innerHTML = "";
    this.results.style.display = "none";
  }
}

const predictiveSearch = new PredictiveSearch("searchInput", "search-details-con");
