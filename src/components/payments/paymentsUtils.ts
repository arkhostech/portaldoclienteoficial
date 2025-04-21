
/**
 * Utility functions for payments page
 */

export const formatCurrency = (amount: string | number) => {
  let numAmount =
    typeof amount === "string"
      ? parseFloat(amount.replace(/[$R\s]/g, ""))
      : amount;
  if (isNaN(numAmount)) numAmount = 0;
  return numAmount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR");
};
