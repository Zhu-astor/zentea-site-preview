/*
 * 購物車頁：每次變動都重新向後端試算，畫面上的價格與小計一律以後端回傳為準。
 */
document.addEventListener("DOMContentLoaded", () => {
  const cart = window.ZenteaCart;
  const $ = (sel) => document.querySelector(sel);
  const status = $("[data-cart-status]");
  const layout = $("[data-cart-layout]");
  const list = $("[data-cart-list]");
  const empty = $("[data-cart-empty]");
  const template = $("#cart-line");

  let requestId = 0;

  function showEmpty() {
    status.hidden = true;
    layout.hidden = true;
    empty.hidden = false;
  }

  function renderLine(item) {
    const li = template.content.firstElementChild.cloneNode(true);
    const hasProblem = item.problems.length > 0;
    li.dataset.sku = item.sku;
    li.classList.toggle("has-problem", hasProblem);

    const img = li.querySelector(".c-line__img");
    // 沒有圖片（例如已下架）時保留空框，避免這一列的版面跑掉
    if (item.image) {
      img.src = item.image;
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "c-line__img is-empty";
      img.replaceWith(placeholder);
    }

    // 一律用 textContent 放後端資料，不用 innerHTML
    li.querySelector(".c-line__name").textContent = item.product_name || item.sku;
    li.querySelector(".c-line__variant").textContent = item.variant_name;
    li.querySelector(".c-line__price").textContent = item.unit_price ? cart.formatPrice(item.unit_price) : "";
    li.querySelector(".c-line__total").textContent = hasProblem ? "—" : cart.formatPrice(item.line_total);

    const problem = li.querySelector(".c-line__problem");
    problem.textContent = item.problems.join("、");
    problem.hidden = !hasProblem;

    const input = li.querySelector(".c-qty__input");
    input.value = item.quantity;
    input.max = cart.MAX_QTY;
    input.addEventListener("change", () => update(item.sku, input.value));
    li.querySelectorAll(".c-qty__btn").forEach((btn) =>
      btn.addEventListener("click", () => update(item.sku, item.quantity + Number(btn.dataset.step)))
    );
    li.querySelector(".c-line__remove").addEventListener("click", () => update(item.sku, 0));
    return li;
  }

  function update(sku, qty) {
    cart.setQty(sku, qty);
    render();
  }

  async function render() {
    if (cart.count() === 0) return showEmpty();

    const id = ++requestId;
    try {
      const data = await cart.quote();
      if (id !== requestId) return; // 使用者連續點擊時只採用最後一次的結果

      list.replaceChildren(...data.items.map(renderLine));
      document.querySelectorAll("[data-cart-subtotal]").forEach((el) => (el.textContent = cart.formatPrice(data.subtotal)));
      $("[data-cart-warn]").hidden = !data.has_problems;
      // 有商品無法購買時不能前往結帳
      $("[data-cart-checkout]").classList.toggle("is-disabled", data.has_problems);
      $("[data-cart-checkout]").setAttribute("aria-disabled", data.has_problems);
      status.hidden = true;
      empty.hidden = true;
      layout.hidden = false;
    } catch (e) {
      if (id !== requestId) return;
      status.textContent = "暫時無法取得最新價格與庫存，請稍後再重新整理頁面。";
      status.hidden = false;
      layout.hidden = true;
    }
  }

  $("[data-cart-checkout]").addEventListener("click", (e) => {
    if (e.currentTarget.classList.contains("is-disabled")) e.preventDefault();
  });

  render();
});
