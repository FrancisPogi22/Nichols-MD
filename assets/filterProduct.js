class ProductWidget {
  constructor(t, e = 9) {
    this.collection = t || "treatments";
    this.productList = $(".categories-product-list");
    this.productsPerPage = e;
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
      let t = $("#priceRange").val();
      $("#minPrice").text(t),
        this.fetchFilteredProducts({ minPrice: 0, maxPrice: parseInt(t, 10) });
    });

    $("#filterBtn").click((t) => {
      t.preventDefault();
      let e = $("#skinTypeFilter").val(),
        r = $("#productTypeFilter").val(),
        i = $("#brandFilter").val(),
        a = $("#typeFilter").val(),
        s = $("#treatmentFilter").val(),
        c = $("#priceFilter").val(),
        l = {};
      if (c) {
        let [n, o] = c.split("-").map(Number);
        l = { minPrice: n, maxPrice: o };
      }
      let d = { skinType: e, productType: r, brand: i, ...l };
      a && (d.type = a), s && (d.treatment = s), this.fetchFilteredProducts(d);
    });

    $("#sortBy").change((t) => {
      let e = $(t.currentTarget).val();
      this.fetchFilteredProducts({ sortBy: e });
    });

    $(document).on("click", ".closeCart", () => {
      this.closeCartDrawer();
    });

    $(".cart-drawer").on("click", ".remove-item-btn", (t) => {
      t.preventDefault();
      t.stopPropagation();
      let variantId = $(t.currentTarget).data("variant");
      this.removeItemFromCart(variantId);
    });
  }

  createProductWidget(t) {
    let e = `/products/${t.handle}`,
      r = $("<div>", { class: "product-widget" }),
      i = $("<a>", { href: e }),
      a =
        t.images && t.images[0]?.src
          ? $("<img>", {
              src: t.images[0].src,
              alt: t.images[0].alt || "Product Image",
            })
          : $("<img>", {
              src: "https://cdn.shopify.com/s/files/1/0597/1116/0382/files/NMD_Logo.png?v=1732133643",
              alt: "Default Image",
            });
    i.append(a), r.append(i);
    let s = $("<div>", { class: "product-details" }),
      c = $("<a>", { href: e }).append(
        $("<p>").text(t.title || "Treatment Name")
      );
    let variantId = t.variants[0]?.id || t.id;
    let l = t.variants[0]?.compare_at_price
        ? parseFloat(t.variants[0].compare_at_price)
        : null,
      n = Math.min(...t.variants.map((t) => t.price)),
      o = Math.max(...t.variants.map((t) => t.price)),
      d = $("<p>", { class: n !== o ? "price-comparison" : "" }).append(
        n !== o
          ? $("<span>").text("$" + n.toFixed(2) + " - $" + o.toFixed(2))
          : l && l < n
          ? [
              $("<span>").text("$" + l.toFixed(2)),
              $("<span>", { class: "compare-price" })
                .text(" $" + n.toFixed(2))
                .css("text-decoration", "line-through"),
            ]
          : $("<span>").text("$" + n.toFixed(2))
      ),
      p = "treatments" === this.collection ? "View Service" : "Learn More",
      container = $("<div>", { class: "button-container" }).append(
        $("<form>", { class: "add-to-cart-form" }).append(
          $("<input>", {
            type: "hidden",
            id: "variant-id",
            name: "id",
            value: variantId,
          }),
          $("<div>", {
            class: "product-quantity",
            style: "display: none;",
          }).append(
            $("<input>", {
              type: "number",
              class: "quantity",
              name: "quantity",
              value: 1,
              min: 1,
            })
          ),
          $("<button>", {
            type: "button",
            class: "btn-secondary AddToCart",
            id: "AddToCart",
            click: (event) => this.addToCart(event, variantId),
          }).text("Add to Cart"),
          $("<button>", {
            type: "button",
            class: "btn-secondary checkout-btn",
            click: (event) => this.checkoutProduct(event),
          }).text("Checkout")
        ),
        $("<a>", { href: e, class: "btn-secondary" }).text(p)
      );
    return s.append(c, d, container), r.append(s), r;
  }

  async checkoutProduct(event) {
    event.preventDefault();

    let form = $(event.target).closest("form")[0];

    if (!form) return;

    await fetch("/cart/add", {
      method: "POST",
      body: new FormData(form),
    });

    window.location.href = "/checkout";
  }

  async addToCart(event, variantId) {
    event.preventDefault();
    await fetch("/cart/add", {
      method: "post",
      body: new FormData(event.target.closest("form")),
    });
    await this.updateCart();
  }

  async updateCart() {
    const response = await fetch("/cart.js");
    const updatedCartData = await response.json();

    await this.updateCartDrawer(updatedCartData);
    this.showCartDrawer();
  }

  async updateCartDrawer(updatedCartData) {
    $.ajax({
      type: "GET",
      url: "/cart",
      dataType: "html",
      success: (t) => {
        let a = $(t).find(".cart-drawer").html();
        $(".cart-drawer").html(a);
        this.updateItemCount(updatedCartData);
      },
    });
  }

  bindRemoveItemEvent() {
    $(".cart-drawer").on("click", ".remove-item-btn", (event) => {
      event.preventDefault();
      event.stopPropagation();
      let variantId = $(event.currentTarget).data("variant");
      this.removeItemFromCart(variantId);
    });
  }

  async updateCartItem(variantId, newQuantity) {
    await $.ajax({
      type: "POST",
      url: "/cart/change.js",
      dataType: "json",
      data: { quantity: newQuantity, id: variantId },
      success: (response) => {
        this.updateCart(response);
      },
    });
  }

  showCartDrawer() {
    $(".cart-drawer-con").addClass("active");
    $(".cart-drawer").addClass("active");
  }

  closeCartDrawer() {
    $(".cart-drawer-con").removeClass("active");
    $(".cart-drawer").removeClass("active");
  }

  async removeItemFromCart(variantId) {
    await $.ajax({
      type: "POST",
      url: "/cart/change.js",
      dataType: "json",
      data: { quantity: 0, id: variantId },
      success: (response) => {
        this.updateCart(response);
      },
    });
  }

  async updateItemCount(updatedCartData) {
    $(document)
      .find(".cart-item-count span")
      .each(function () {
        $(this).text(updatedCartData.item_count);
      });
  }

  updateCartPrices(cartData) {
    let subtotalElement = $(".cart-subtotal"),
      totalPriceElement = $(".cart-total-price");

    if (subtotalElement.length) {
      subtotalElement.text(this.formatPrice(cartData.items_subtotal_price));
    }
    if (totalPriceElement.length) {
      totalPriceElement.text(this.formatPrice(cartData.total_price));
    }
  }

  formatPrice(price, currency = "$") {
    let formattedPrice = (price / 100).toFixed(2);
    return `${currency}${formattedPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  }

  fetchFilteredProducts(t = {}, e = null) {
    this.showLoader();
    let r = `/collections/${this.collection}/products.json?limit=250`;
    e && (r += `&page_info=${e}`);
    $.ajax({
      type: "GET",
      url: r,
      success: (e) => {
        let r = e.products;
        this.allProducts = this.filterAndSortProducts(r, t);
        this.totalPages = Math.ceil(
          this.allProducts.length / this.productsPerPage
        );
        this.renderProducts();
        this.renderPagination();
        this.hideLoader();
      },
      error: (t, e, r) => {
        console.error("Error fetching collection data:", r);
        this.hideLoader();
      },
    });
  }

  filterAndSortProducts(products, filters) {
    return products.filter((e) => {
      let r = parseFloat(e.variants[0].price),
        i =
          (filters.minPrice ? r >= filters.minPrice : true) &&
          (filters.maxPrice ? r <= filters.maxPrice : true),
        a = !filters.skinType || e.tags?.includes(filters.skinType),
        s = !filters.productType || e.tags?.includes(filters.productType),
        c = !filters.brand || e.tags?.includes(filters.brand),
        l = !filters.type || e.tags?.includes(filters.type),
        n = !filters.treatment || e.tags?.includes(filters.treatment);
      return i && a && s && c && l && n;
    });
  }

  renderPagination() {
    let t = $(".pagination-container");
    if ((t.empty(), this.totalPages > 1)) {
      let e = $("<ul>", { class: "pagination" });
      for (let r = 1; r <= this.totalPages; r++) {
        let i = $("<span>", {
            class: r === this.currentPage ? "pagination-current" : "",
          }),
          a = $("<a>", {
            href: "#!",
            text: r,
            class: r !== this.currentPage ? "pagination-link" : "",
            "data-page": r,
          });
        i.append(a), e.append(i);
      }
      t.append(e);
      $(".pagination-link").click((t) => {
        t.preventDefault();
        let e = $(t.currentTarget).data("page");
        this.currentPage = e;
        this.renderProducts();
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
