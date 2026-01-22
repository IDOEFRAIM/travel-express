import { useState } from "react";

export default function EditPaymentForm({ payment, onSave, onCancel }) {
  const [amount, setAmount] = useState(payment.amount);
  const [currency, setCurrency] = useState(payment.currency);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({ ...payment, amount, currency });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Montant"
        min={0}
        required
      />
      <input
        type="text"
        value={currency}
        onChange={e => setCurrency(e.target.value)}
        placeholder="Devise"
        required
      />
      <button type="submit">Enregistrer</button>
      <button type="button" onClick={onCancel}>Annuler</button>
    </form>
  );
}
