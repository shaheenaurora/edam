export function inr(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise);
}

export const FREE_SHIPPING_ABOVE = 1499;
export const SHIPPING_FEE = 79;
