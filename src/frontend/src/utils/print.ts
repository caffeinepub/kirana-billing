import type { CartItem, Sale, Settings } from "../hooks/useStore";

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${mins}`;
}

function itemSubtotal(cartItem: CartItem): number {
  const base = cartItem.item.price * cartItem.quantity;
  const disc = base * (cartItem.discount / 100);
  return Math.round((base - disc) * 100) / 100;
}

function getItemName(cartItem: CartItem, lang: Settings["printLang"]): string {
  const en = cartItem.item.nameEn;
  const kn = cartItem.item.nameKn;
  if (lang === "en") return en;
  if (lang === "kn") return kn || en;
  // both
  if (kn && kn !== en) return `${en} / ${kn}`;
  return en;
}

export function generateReceipt(sale: Sale, settings: Settings): void {
  const { printLang } = settings;
  const showKn = printLang === "kn" || printLang === "both";

  const headerStoreName =
    printLang === "kn"
      ? settings.storeNameKn || settings.storeNameEn
      : printLang === "en"
        ? settings.storeNameEn
        : `${settings.storeNameEn}${settings.storeNameKn ? ` / ${settings.storeNameKn}` : ""}`;

  const thankYouEn = "Thank you! Visit again";
  const thankYouKn = "ಧನ್ಯವಾದಗಳು! ಮತ್ತೆ ಬನ್ನಿ";

  let footer = "";
  if (printLang === "en") footer = thankYouEn;
  else if (printLang === "kn") footer = thankYouKn;
  else footer = `${thankYouEn}\n${thankYouKn}`;

  const itemRows = sale.items
    .map((ci) => {
      const name = getItemName(ci, printLang);
      const qty = ci.quantity;
      const price = ci.item.price;
      const sub = itemSubtotal(ci);
      const discStr = ci.discount > 0 ? ` (-${ci.discount}%)` : "";
      return `<tr>
        <td style="padding:2px 0;vertical-align:top;">${name}</td>
        <td style="padding:2px 0;text-align:right;white-space:nowrap;">${qty} × ₹${price}${discStr}</td>
        <td style="padding:2px 0;text-align:right;white-space:nowrap;">₹${sub.toFixed(2)}</td>
      </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="${showKn ? "kn" : "en"}">
<head>
  <meta charset="UTF-8"/>
  <title>Bill - ${settings.storeNameEn}</title>
  <style>
    @media print {
      @page { size: 58mm auto; margin: 0; }
      body { margin: 0; }
    }
    body {
      font-family: 'Noto Sans Kannada', 'Arial', sans-serif;
      font-size: 11px;
      width: 54mm;
      margin: 2mm auto;
      color: #000;
    }
    h1 { font-size: 13px; font-weight: bold; margin: 0 0 2px; text-align: center; }
    .sub { font-size: 10px; text-align: center; margin: 1px 0; }
    .divider { border-top: 1px dashed #000; margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; }
    td { font-size: 10px; }
    .total-row { font-size: 12px; font-weight: bold; }
    .footer { text-align: center; font-size: 10px; margin-top: 6px; }
  </style>
</head>
<body>
  <h1>${headerStoreName}</h1>
  ${settings.phone ? `<div class="sub">📞 ${settings.phone}</div>` : ""}
  <div class="sub">${formatDate(sale.date)}</div>
  <div class="divider"></div>
  <table>
    <thead>
      <tr>
        <th style="text-align:left;font-size:10px;">Item</th>
        <th style="text-align:right;font-size:10px;">Qty×Rate</th>
        <th style="text-align:right;font-size:10px;">Amt</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>
  <div class="divider"></div>
  <table>
    <tr class="total-row">
      <td>TOTAL</td>
      <td></td>
      <td style="text-align:right;">₹${sale.total.toFixed(2)}</td>
    </tr>
  </table>
  <div class="divider"></div>
  <div class="footer">${footer.replace(/\n/g, "<br/>")}</div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=400,height=600");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 250);
}
