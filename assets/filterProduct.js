class ProductWidget {
  constructor(t) {
    (this.collection = t || "treatments"),
      (this.productList = $(".categories-product-list")),
      (this.productsPerPage = 9),
      (this.currentPage = 1),
      (this.allProducts = []),
      (this.totalPages = 0),
      this.init();
  }
  init() {
    this.bindEvents(), this.fetchFilteredProducts();
  }
  bindEvents() {
    $("#priceRange").on("mouseup", () => {
      let t = $("#priceRange").val();
      $("#minPrice").text(t),
        this.fetchFilteredProducts({ minPrice: 0, maxPrice: parseInt(t, 10) });
    }),
      $("#filterBtn").click((t) => {
        t.preventDefault();
        let e = $("#skinTypeFilter").val(),
          r = $("#productTypeFilter").val(),
          a = $("#brandFilter").val();
        this.fetchFilteredProducts({ skinType: e, productType: r, brand: a });
      }),
      $("#sortBy").change((t) => {
        let e = $(t.currentTarget).val();
        this.fetchFilteredProducts({ sortBy: e });
      });
  }
  createProductWidget(t) {
    let e = `/products/${t.handle}`,
      r = $("<div>", { class: "product-widget" }),
      a = $("<a>", { href: e }),
      i;
    (i =
      t.images && t.images[0]?.src
        ? $("<img>", {
            src: t.images[0].src,
            alt: t.images[0].alt || "Product Image",
          })
        : $("<img>", {
            src: "https://cdn.shopify.com/s/files/1/0597/1116/0382/files/NMD_Logo.png?v=1732133643",
            alt: "Default Image",
          })),
      a.append(i),
      r.append(a);
    let s = $("<div>", { class: "product-details" }),
      c = $("<a>", { href: e }).append(
        $("<p>").text(t.title || "Treatment Name")
      );
    parseFloat(t.variants[0].price);
    let o = t.variants[0]?.compare_at_price
        ? parseFloat(t.variants[0].compare_at_price)
        : null,
      d = Math.min(...t.variants.map((t) => t.price)),
      n = Math.max(...t.variants.map((t) => t.price)),
      l = $("<p>", { class: d !== n ? "price-comparison" : "" }).append(
        d !== n
          ? $("<span>").text("$" + d.toFixed(2) + " - $" + n.toFixed(2))
          : o && o < d
          ? [
              $("<span>").text("$" + o.toFixed(2)),
              $("<span>", { class: "compare-price" })
                .text(" $" + d.toFixed(2))
                .css("text-decoration", "line-through"),
            ]
          : $("<span>").text("$" + d.toFixed(2))
      ),
      p = $("<a>", { href: e, class: "btn-secondary" }).text("View Product");
    return s.append(c, l, p), r.append(s), r;
  }
  fetchFilteredProducts(t = {}) {
    this.showLoader();
    let e = `/collections/${this.collection}/products.json`;
    $.ajax({
      type: "GET",
      url: e,
      success: (e) => {
        let r = e.products;
        if (
          ((this.allProducts = r.filter((e) => {
            let r = parseFloat(e.variants[0].price),
              a =
                (void 0 === t.minPrice || r >= t.minPrice) &&
                (void 0 === t.maxPrice || r <= t.maxPrice),
              i = !t.skinType || e.tags?.includes(t.skinType),
              s = !t.productType || e.tags?.includes(t.productType),
              c = !t.brand || e.tags?.includes(t.brand);
            return a && i && s && c;
          })),
          t.sortBy)
        )
          switch (t.sortBy) {
            case "title-asc":
              this.allProducts.sort((t, e) => t.title.localeCompare(e.title));
              break;
            case "title-desc":
              this.allProducts.sort((t, e) => e.title.localeCompare(t.title));
              break;
            case "price-asc":
              this.allProducts.sort(
                (t, e) =>
                  parseFloat(t.variants[0].price) -
                  parseFloat(e.variants[0].price)
              );
              break;
            case "price-desc":
              this.allProducts.sort(
                (t, e) =>
                  parseFloat(e.variants[0].price) -
                  parseFloat(t.variants[0].price)
              );
          }
        (this.totalPages = Math.ceil(
          this.allProducts.length / this.productsPerPage
        )),
          (this.currentPage = 1),
          this.renderProducts(),
          this.renderPagination(),
          this.hideLoader();
      },
      error: (t, e, r) => {
        console.error("Error fetching collection data:", r), this.hideLoader();
      },
    });
  }
  renderPagination() {
    let t = $(".pagination-container");
    if ((t.empty(), this.totalPages > 1)) {
      let e = $("<ul>", { class: "pagination" });
      for (let r = 1; r <= this.totalPages; r++) {
        let a = $("<span>", {
            class: r === this.currentPage ? "pagination-current" : "",
          }),
          i = $("<a>", {
            href: "#!",
            text: r,
            class: r !== this.currentPage ? "pagination-link" : "",
            "data-page": r,
          });
        a.append(i), e.append(a);
      }
      t.append(e),
        $(".pagination-link").click((t) => {
          t.preventDefault();
          let e = $(t.currentTarget).data("page");
          (this.currentPage = e),
            this.renderProducts(),
            this.renderPagination();
        });
    }
  }
  renderProducts() {
    this.productList.empty();
    let t = (this.currentPage - 1) * this.productsPerPage,
      e = t + this.productsPerPage,
      r = this.allProducts.slice(t, e);
    r.length > 0
      ? r.forEach((t) => {
          let e = this.createProductWidget(t);
          this.productList.append(e);
        })
      : this.productList.append(
          $("<p>", {
            class: "no-products-message",
            text: "No products found with the selected filters.",
          })
        );
  }
  showLoader() {
    $(".product-loader").removeClass("loader--hidden");
  }
  hideLoader() {
    $(".product-loader").addClass("loader--hidden");
  }
}
