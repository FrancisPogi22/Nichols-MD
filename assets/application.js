$(document).ready(() => {
  function t() {
    $(window).scrollTop() > 50
      ? $("#header").addClass("scrolled")
      : $("#header").removeClass("scrolled");
  }
  function a() {
    $(window).width() > 1310 && $("#mobile-navbar").css("display", "none"),
      1310 > $(window).width() && $("#skincare").css("display", "none");
  }
  async function e(t) {
    await fetch("/cart/add", { method: "post", body: new FormData(t) }),
      await n().then(() => {
        i();
      });
  }
  async function n() {
    $.ajax({
      type: "GET",
      url: "/cart",
      dataType: "html",
      success(t) {
        let a = $(t).find(".cart-drawer").html();
        $(".cart-drawer").html(a), s();
      },
    });
  }
  function i() {
    $(".cart-drawer-con").addClass("active"),
      $(".cart-drawer").addClass("active");
  }
  function c() {
    $(".cart-drawer-con").removeClass("active"),
      $(".cart-drawer").removeClass("active");
  }
  function s() {
    $(".closeCart").click(function () {
      c();
    }),
      $(".remove-item-btn").click(function (t) {
        t.preventDefault(), t.stopPropagation();
        let a = $(this).data("variant");
        $.ajax({
          type: "POST",
          url: "/cart/change.js",
          dataType: "json",
          data: { quantity: 0, id: a },
          async success() {
            n();
            let t = await fetch("/cart.js"),
              a = await t.json();
            o(a.item_count);
          },
        });
      });
  }
  async function o() {
    let t = await fetch("/cart.js"),
      a = await t.json();
    $(".cart-item-count span").each(function () {
      $(this).text(a.item_count);
    });
  }
  function r(t) {
    let a = $(".cart-subtotal"),
      e = $(".cart-total-price");
    a.length && a.text(l(t.items_subtotal_price)),
      e.length && e.text(l(t.total_price));
  }
  function l(t, a = "$") {
    let e = (t / 100).toFixed(2);
    return `${a}${e.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  }
  window.addEventListener("load", () => {
    $(".loader").addClass("loader--hidden");
  }),
    $(window).scroll(() => {
      t();
    }),
    t(),
    $(".search").click((t) => {
      t.stopPropagation(), $(".search-con").toggleClass("active");
    }),
    $(".search-con svg").click(() => {
      $("#searchInput").val(""),
        $(".search-con").removeClass("active"),
        $("#search-details-con").empty();
    }),
    $("#header .has-sub-menu").each(function () {
      let t = !1,
        a = null,
        e = $(this),
        n = $(this).data("title"),
        i = $(`#${n}`);
      e.hover(
        function () {
          (t && a === n) ||
            (a &&
              a !== n &&
              ($(`#${a}`).stop(!0, !0).slideUp(400),
              $(`[data-title="${a}"]`).removeClass("active")),
            e.addClass("active"),
            i.stop(!0, !0).slideDown(400),
            (a = n));
        },
        function () {
          i.is(":hover") ||
            (i.stop(!0, !0).slideUp(400), e.removeClass("active"), (a = null));
        }
      ),
        e.on("click", function (c) {
          t
            ? ((window.location.href = e.find("a").attr("href")),
              (t = !1),
              (a = null))
            : (c.preventDefault(),
              e.addClass("active"),
              i.stop(!0, !0).slideDown(400),
              (t = !0),
              (a = n));
        });
      let c;
      i.hover(
        function () {
          clearTimeout(c), e.addClass("active"), i.stop(!0, !0).slideDown(400);
        },
        function () {
          c = setTimeout(() => {
            e.is(":hover") ||
              i.is(":hover") ||
              (i.stop(!0, !0).slideUp(400),
              e.removeClass("active"),
              (a = null),
              (t = !1));
          }, 200);
        }
      );
    }),
    $("#mobile-navbar .has-sub-menu").on("click", function (t) {
      t.preventDefault();
      t.stopPropagation();

      let parentLink = $(this).children("a").attr("href"),
        subMenu = $(this).find(".sub-link-container"),
        isVisible = subMenu.is(":visible");

      $(this).toggleClass("active");
      $("#mobile-navbar .sub-link-container").not(subMenu).slideUp();

      if (isVisible) window.location.href = parentLink;
      else subMenu.slideDown();
    }),
    $("#mobile-navbar .sub-link-container a").on("click", function (e) {
      e.stopPropagation();
    }),
    $(".add-to-cart-form").each(function () {
      $(this).on("submit", async function (t) {
        t.preventDefault();
        try {
          await e(this).then(() => {
            o();
          });
        } catch (a) {
          console.error("Error adding item to cart:", a);
        }
      });
    }),
    $(window).on("resize", function () {
      a();
    }),
    $(".mobile-btn-container").click(function () {
      $("#mobile-navbar").toggleClass("active");
    }),
    s(),
    $('#header a[href="/cart"]').on("click", (t) => {
      t.preventDefault(), i();
    }),
    $(".cart-drawer").on(
      "click",
      ".increase-quantity, .decrease-quantity",
      function (t) {
        t.preventDefault();

        let $button = $(this),
          $quantityValue = $button
            .closest(".quantity-text")
            .find(".quantity-value"),
          lineIndex = $button.data("line"),
          currentQuantity = parseInt($quantityValue.text(), 10),
          newQuantity = $button.hasClass("increase-quantity")
            ? currentQuantity + 1
            : Math.max(1, currentQuantity - 1);

        $.ajax({
          url: "/cart/change.js",
          type: "POST",
          dataType: "json",
          data: JSON.stringify({
            line: parseInt(lineIndex, 10),
            quantity: newQuantity,
          }),
          contentType: "application/json",
          success(updatedCart) {
            // Instead of just updating quantity text, re-fetch the cart drawer HTML
            $.ajax({
              type: "GET",
              url: "/cart",
              dataType: "html",
              success: function (cartHtml) {
                const updatedCartDrawer = $(cartHtml)
                  .find(".cart-drawer")
                  .html();
                $(".cart-drawer").html(updatedCartDrawer);
              },
            });
          },
          error(xhr, status, error) {
            console.error("Error updating cart:", error);
          },
        });
      }
    ),
    setTimeout(function () {
      if ($(".promotion-container").length) {
        $(".promotion-container").fadeIn();
        $("body").css("overflow", "hidden");
      }
    }, 8000),
    $(".promotion-container svg").click(function () {
      $(".promotion-container").fadeOut();
      $("body").css("overflow", "auto");
    }),
    $(".year").text(new Date().getFullYear());
});
