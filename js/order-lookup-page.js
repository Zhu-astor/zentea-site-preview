/*
 * 訂單查詢頁：訂單編號＋下單時的 Email，向後端 /api/orders/lookup/ 查詢。
 * 後端有限制查詢次數，避免被拿來猜別人的訂單。
 */
document.addEventListener("DOMContentLoaded", () => {
  const cart = window.ZenteaCart;
  const $ = (sel) => document.querySelector(sel);
  const form = $("[data-lookup-form]");
  const errorBox = $("[data-lookup-error]");
  const submit = $("[data-lookup-submit]");

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
    $("[data-order]").hidden = true;
  }

  function render(order) {
    document.querySelectorAll("[data-f]").forEach((el) => (el.textContent = order[el.dataset.f] || ""));
    document.querySelectorAll("[data-money]").forEach((el) => {
      const n = order[el.dataset.money];
      el.textContent = el.dataset.money === "shipping_fee" && n === 0 ? ZT.t("免運") : cart.formatPrice(n);
    });
    const rows = { store: order.is_cvs, shipment: !!order.shipment_no, logistics: !!order.logistics_status };
    document.querySelectorAll("[data-row]").forEach((el) => (el.hidden = !rows[el.dataset.row]));
    $("[data-order-items]").replaceChildren(
      ...order.items.map((item) => {
        const li = document.createElement("li");
        li.className = "co__item";
        const name = document.createElement("span");
        name.textContent = `${item.product_name} ${item.variant_name} × ${item.quantity}`;
        const price = document.createElement("span");
        price.textContent = cart.formatPrice(item.line_total);
        li.append(name, price);
        return li;
      })
    );
    errorBox.hidden = true;
    $("[data-order]").hidden = false;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const orderNo = form.elements.order_no.value.trim();
    const email = form.elements.email.value.trim();
    if (!orderNo || !email) {
      showError(ZT.t("請填寫訂單編號與 Email"));
      return;
    }
    submit.disabled = true;
    try {
      const res = await fetch(cart.apiBase + ZT.api("/api/orders/lookup/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_no: orderNo, email }),
      });
      const data = await res.json();
      if (res.ok) render(data);
      else showError(data.error || ZT.t("查詢失敗，請稍後再試"));
    } catch (err) {
      showError(ZT.t("暫時無法連線，請稍後再試"));
    } finally {
      submit.disabled = false;
    }
  });
});
