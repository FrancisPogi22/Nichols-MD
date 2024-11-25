class ProductWidget {
  constructor(collection) {
    this.collection = collection || "treatments";
    this.productList = $(".categories-product-list");
    this.productsPerPage = 9;
    this.currentPage = 1;
    this.allProducts = [];
    this.totalPages = 0;
    this.init();
  }

  init() {
    this.bindEvents();
    this.fetchFilteredProducts();
  }

  bindEvents() {
    $("#priceRange").on("mouseup", () => {
      const maxPrice = $("#priceRange").val();
      $("#minPrice").text(maxPrice);
      this.fetchFilteredProducts({
        minPrice: 0,
        maxPrice: parseInt(maxPrice, 10),
      });
    });

    $("#filterBtn").click((e) => {
      e.preventDefault();
      const selectedSkinType = $("#skinTypeFilter").val();
      const selectedProductType = $("#productTypeFilter").val();
      const selectedBrand = $("#brandFilter").val();

      this.fetchFilteredProducts({
        skinType: selectedSkinType,
        productType: selectedProductType,
        brand: selectedBrand,
      });
    });

    $("#sortBy").change((e) => {
      const sortBy = $(e.currentTarget).val();
      this.fetchFilteredProducts({ sortBy });
    });
  }

  createProductWidget(product) {
    const productUrl = `/products/${product.handle}`;
    const productWidget = $("<div>", { class: "product-widget" });
    const productLink = $("<a>", { href: productUrl });
    let productImage;

    if (product.images && product.images[0]?.src) {
      productImage = $("<img>", {
        src: product.images[0].src,
        alt: product.images[0].alt || "Product Image",
      });
    } else {
      productImage = $("<img>", {
        src: "https://cdn.shopify.com/s/files/1/0597/1116/0382/files/NMD_Logo.png?v=1732133643",
        alt: "Default Image",
      });
    }

    productLink.append(productImage);
    productWidget.append(productLink);

    const productDetails = $("<div>", { class: "product-details" });
    const productTitle = $("<a>", { href: productUrl }).append(
      $("<p>").text(product.title || "Treatment Name")
    );

    const price = parseFloat(product.variants[0].price);
    const compareAtPrice = product.variants[0]?.compare_at_price
      ? parseFloat(product.variants[0].compare_at_price)
      : null;

    let lowestPrice = Math.min(
      ...product.variants.map((variant) => variant.price)
    );
    let highestPrice = Math.max(
      ...product.variants.map((variant) => variant.price)
    );

    const priceWrapper = $("<p>", {
      class: lowestPrice !== highestPrice ? "price-comparison" : "",
    }).append(
      lowestPrice !== highestPrice
        ? $("<span>").text(
            "$" + lowestPrice.toFixed(2) + " - $" + highestPrice.toFixed(2)
          )
        : compareAtPrice && compareAtPrice < lowestPrice
        ? [
            $("<span>").text("$" + compareAtPrice.toFixed(2)),
            $("<span>", { class: "compare-price" })
              .text(" $" + lowestPrice.toFixed(2))
              .css("text-decoration", "line-through"),
          ]
        : $("<span>").text("$" + lowestPrice.toFixed(2))
    );

    const viewProductButton = $("<a>", {
      href: productUrl,
      class: "btn-secondary",
    }).text("View Product");

    productDetails.append(productTitle, priceWrapper, viewProductButton);
    productWidget.append(productDetails);

    return productWidget;
  }

  fetchFilteredProducts(filters = {}) {
    this.showLoader();

    const collectionUrl = `/collections/${this.collection}/products.json`;

    $.ajax({
      type: "GET",
      url: collectionUrl,
      success: (response) => {
        const products = response.products;

        this.allProducts = products.filter((product) => {
          const price = parseFloat(product.variants[0].price);
          const matchesPrice =
            (filters.minPrice === undefined || price >= filters.minPrice) &&
            (filters.maxPrice === undefined || price <= filters.maxPrice);

          const matchesSkinType =
            !filters.skinType || product.tags?.includes(filters.skinType);
          const matchesProductType =
            !filters.productType || product.tags?.includes(filters.productType);
          const matchesBrand =
            !filters.brand || product.tags?.includes(filters.brand);

          return (
            matchesPrice &&
            matchesSkinType &&
            matchesProductType &&
            matchesBrand
          );
        });

        if (filters.sortBy) {
          switch (filters.sortBy) {
            case "title-asc":
              this.allProducts.sort((a, b) => a.title.localeCompare(b.title));
              break;
            case "title-desc":
              this.allProducts.sort((a, b) => b.title.localeCompare(a.title));
              break;
            case "price-asc":
              this.allProducts.sort(
                (a, b) =>
                  parseFloat(a.variants[0].price) -
                  parseFloat(b.variants[0].price)
              );
              break;
            case "price-desc":
              this.allProducts.sort(
                (a, b) =>
                  parseFloat(b.variants[0].price) -
                  parseFloat(a.variants[0].price)
              );
              break;
            default:
              break;
          }
        }

        this.totalPages = Math.ceil(
          this.allProducts.length / this.productsPerPage
        );
        this.currentPage = 1;
        this.renderProducts();
        this.renderPagination();
        this.hideLoader();
      },
      error: (xhr, status, error) => {
        console.error("Error fetching collection data:", error);
        this.hideLoader();
      },
    });
  }

  renderPagination() {
    const paginationContainer = $(".pagination-container");
    paginationContainer.empty();

    if (this.totalPages > 1) {
      const paginationList = $("<ul>", { class: "pagination" });
      for (let i = 1; i <= this.totalPages; i++) {
        const part = $("<span>", {
          class: i === this.currentPage ? "pagination-current" : "",
        });

        const link = $("<a>", {
          href: "#!",
          text: i,
          class: i !== this.currentPage ? "pagination-link" : "",
          "data-page": i,
        });

        part.append(link);
        paginationList.append(part);
      }

      paginationContainer.append(paginationList);

      $(".pagination-link").click((e) => {
        e.preventDefault();
        const page = $(e.currentTarget).data("page");
        this.currentPage = page;
        this.renderProducts();
        this.renderPagination();
      });
    }
  }

  renderProducts() {
    this.productList.empty();

    const start = (this.currentPage - 1) * this.productsPerPage,
      end = start + this.productsPerPage,
      productsToShow = this.allProducts.slice(start, end);

    if (productsToShow.length > 0) {
      productsToShow.forEach((product) => {
        const productWidget = this.createProductWidget(product);
        this.productList.append(productWidget);
      });
    } else {
      this.productList.append(
        $("<p>", {
          class: "no-products-message",
          text: "No products found with the selected filters.",
        })
      );
    }
  }

  showLoader() {
    $(".product-loader").removeClass("loader--hidden");
  }

  hideLoader() {
    $(".product-loader").addClass("loader--hidden");
  }
}
