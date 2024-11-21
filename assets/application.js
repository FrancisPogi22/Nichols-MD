$(document).ready(() => {
  window.addEventListener("load", () => {
    $(".loader").addClass("loader--hidden");
  });

  $(window).scroll(() => {
    checkHeaderScroll();
  });

  checkHeaderScroll();

  function checkHeaderScroll() {
    if ($(window).scrollTop() > 50) {
      $("#header").addClass("scrolled");
    } else {
      $("#header").removeClass("scrolled");
    }
  }

  $(".search").click(function(event) {
    event.stopPropagation();
    $(".search-con").toggle();
  });

  $(".has-sub-menu").each(function () {
    let clicked = false,
      activeDropdown = null;
    const parent = $(this),
      dropdown = $(this).data("title"),
      submenu = $(`#${dropdown}`);

    parent.hover(
      function () {
        if (!clicked || activeDropdown !== dropdown) {
          if (activeDropdown && activeDropdown !== dropdown) {
            $(`#${activeDropdown}`).stop(true, true).slideUp(400);
            $(`[data-title="${activeDropdown}"]`).removeClass("active");
          }
          parent.addClass("active");
          submenu.stop(true, true).slideDown(400);
          activeDropdown = dropdown;
        }
      },
      function () {
        if (!submenu.is(":hover")) {
          submenu.stop(true, true).slideUp(400);
          parent.removeClass("active");
          activeDropdown = null;
        }
      }
    );

    parent.on("click", function (event) {
      if (!clicked) {
        event.preventDefault();
        parent.addClass("active");
        submenu.stop(true, true).slideDown(400);
        clicked = true;
        activeDropdown = dropdown;
      } else {
        window.location.href = parent.find("a").attr("href");
        clicked = false;
        activeDropdown = null;
      }
    });

    let timeoutId;

    submenu.hover(
      function () {
        clearTimeout(timeoutId);
        parent.addClass("active");
        submenu.stop(true, true).slideDown(400);
      },
      function () {
        timeoutId = setTimeout(() => {
          if (!parent.is(":hover") && !submenu.is(":hover")) {
            submenu.stop(true, true).slideUp(400);
            parent.removeClass("active");
            activeDropdown = null;
            clicked = false;
          }
        }, 200);
      }
    );
  });

  $(".add-to-cart-form").each(function () {
    $(this).on("submit", async function (event) {
      event.preventDefault();

      try {
        await addToCart(this).then(() => {
          updateCartItemCounts();
        });
      } catch (error) {
        console.error("Error adding item to cart:", error);
      }
    });
  });

  function checkWindowSize() {
    if ($(window).width() > 1310) {
      $("#mobile-navbar").css("display", "none");
    }
  }

  $(window).on("resize", function () {
    checkWindowSize();
  });

  $(".mobile-btn-container").click(function () {
    $("#mobile-navbar").slideToggle();
  });

  async function addToCart(form) {
    await fetch("/cart/add", {
      method: "post",
      body: new FormData(form),
    });

    await updateCartDrawer().then(() => {
      openCartDrawer();
    });
  }

  attachCartDrawerListeners();

  async function updateCartDrawer() {
    $.ajax({
      type: "GET",
      url: "/cart",
      dataType: "html",
      success(response) {
        let updatedCartDrawer = $(response).find(".cart-drawer").html();
        $(".cart-drawer").html(updatedCartDrawer);
        attachCartDrawerListeners();
      },
    });
  }

  function openCartDrawer() {
    $(".cart-drawer-con").addClass("active");
    $(".cart-drawer").addClass("active");
  }

  function closeCartDrawer() {
    $(".cart-drawer-con").removeClass("active");
    $(".cart-drawer").removeClass("active");
  }

  function attachCartDrawerListeners() {
    $(".closeCart").click(function () {
      closeCartDrawer();
    });

    $(".remove-item-btn").click(function (e) {
      e.preventDefault();
      e.stopPropagation();

      let object = $(this),
        productId = object.data("variant");

      $.ajax({
        type: "POST",
        url: "/cart/change.js",
        dataType: "json",
        data: {
          quantity: 0,
          id: productId,
        },
        async success() {
          updateCartDrawer();

          const res = await fetch("/cart.js"),
            cart = await res.json();
          updateCartItemCounts(cart.item_count);
        },
      });
    });
  }

  async function updateCartItemCounts() {
    const res = await fetch("/cart.js"),
      cart = await res.json();

    $(".cart-item-count span").each(function () {
      $(this).text(cart.item_count);
    });
  }

  $('#header a[href="/cart"]').on("click", (e) => {
    e.preventDefault();
    openCartDrawer();
  });

  $(".cart-drawer").on(
    "click",
    ".increase-quantity, .decrease-quantity",
    function (event) {
      event.preventDefault();

      const button = $(this);
      const quantityElement = button
        .closest(".quantity-text")
        .find(".quantity-value");
      const line = button.data("line"),
        currentQuantity = parseInt(quantityElement.text(), 10),
        newQuantity = button.hasClass("increase-quantity")
          ? currentQuantity + 1
          : Math.max(1, currentQuantity - 1);

      $.ajax({
        url: "/cart/change.js",
        type: "POST",
        dataType: "json",
        data: JSON.stringify({
          line: parseInt(line, 10),
          quantity: newQuantity,
        }),
        contentType: "application/json",
        success(cart) {
          quantityElement.text(newQuantity);
          updateCartTotals(cart);
          updateCartItemCounts();
        },
        error() {
          console.error("Error updating cart:", error);
        },
      });
    }
  );

  function updateCartTotals(cart) {
    const subtotalElement = $(".cart-subtotal"),
      totalPriceElement = $(".cart-total-price");

    if (subtotalElement.length)
      subtotalElement.text(formatMoney(cart.items_subtotal_price));

    if (totalPriceElement.length)
      totalPriceElement.text(formatMoney(cart.total_price));
  }

  function formatMoney(amount, currencySymbol = "$") {
    const formattedAmount = (amount / 100).toFixed(2);
    return `${currencySymbol}${formattedAmount.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      ","
    )}`;
  }
});
