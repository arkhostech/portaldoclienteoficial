
import { useState, useEffect } from "react";
import { UseFormSetValue } from "react-hook-form";

export function useInstallmentCalculation({
  enable_installments,
  installments_count,
  amount,
  total_amount,
  setValue,
}: {
  enable_installments: boolean;
  installments_count: number;
  amount: string;
  total_amount: string;
  setValue: UseFormSetValue<any>;
}) {
  const [parcelValue, setParcelValue] = useState<string>("");

  useEffect(() => {
    if (
      enable_installments &&
      installments_count > 0 &&
      total_amount &&
      amount &&
      parseFloat(total_amount) > parseFloat(amount)
    ) {
      const faltante = parseFloat(total_amount) - parseFloat(amount);
      const valorParcela = faltante / Number(installments_count);
      setParcelValue(valorParcela.toFixed(2));
      setValue("installment_amount", valorParcela.toFixed(2));
    } else if (parseFloat(amount) === parseFloat(total_amount)) {
      setParcelValue("");
      setValue("installment_amount", "");
      if (enable_installments) setValue("enable_installments", false);
    } else {
      setParcelValue("");
    }
    // Only trigger when values actually change
  }, [enable_installments, installments_count, amount, total_amount, setValue]);

  return { parcelValue, setParcelValue };
}
