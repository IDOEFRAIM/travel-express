
import { useState } from "react";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  // Add other fields as needed
}

interface EditPaymentFormProps {
  payment: Payment;
  onSave: (payment: Payment) => void | Promise<void>;
  onCancel: () => void;
}

export default function EditPaymentForm({ payment, onSave, onCancel }: EditPaymentFormProps) {
  const [amount, setAmount] = useState(payment.amount);
  const [currency, setCurrency] = useState(payment.currency);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSave({ ...payment, amount, currency });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
      <input
        type="number"
        value={amount}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(Number(e.target.value))}
        placeholder="Montant"
        min={0}
        required
      />
      <input
        type="text"
        value={currency}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrency(e.target.value)}
        placeholder="Devise"
        required
      />
      <button type="submit">Enregistrer</button>
      <button type="button" onClick={onCancel}>Annuler</button>
    </form>
  );
}
