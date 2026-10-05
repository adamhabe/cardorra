export const ORDER_STATUSES = [

  {
    value: "new",
    label: "Nová",
  },

  {
    value: "awaiting_payment",
    label: "Čeká na platbu",
  },

  {
    value: "paid",
    label: "Zaplacená",
  },

  {
    value: "processing",
    label: "Připravuje se",
  },

  {
    value: "shipped",
    label: "Odeslaná",
  },

  {
    value: "completed",
    label: "Dokončená",
  },

  {
    value: "cancelled",
    label: "Zrušená",
  },

] as const;


export type OrderStatus =
  typeof ORDER_STATUSES[number]["value"];


export function isOrderStatus(
  value: string
): value is OrderStatus {

  return ORDER_STATUSES.some(
    (status) =>
      status.value === value
  );

}


export function orderStatusLabel(
  value: string
) {

  return (
    ORDER_STATUSES.find(
      (status) =>
        status.value === value
    )?.label ||
    value
  );

}


export function orderStatusClass(
  value: string
) {

  if (
    !isOrderStatus(value)
  ) {

    return "orderStatus orderStatus--unknown";

  }


  return (
    "orderStatus " +
    `orderStatus--${value}`
  );

}


export function shippingMethodLabel(
  value: string
) {

  switch (value) {

    case "pickup":
      return "Výdejní místo";

    case "address":
      return "Doručení na adresu";

    case "personal":
      return "Osobní předání";

    default:
      return value;

  }

}
export function paymentMethodLabel(
  value: string
) {

  switch (value) {

    case "card":
      return "Kartou online";

    case "cod":
      return "Dobírka";

    /*
      Pouze pro staré testovací
      objednávky.
    */
    case "bank":
      return "Bankovní převod (starý)";

    default:
      return value;

  }

}

