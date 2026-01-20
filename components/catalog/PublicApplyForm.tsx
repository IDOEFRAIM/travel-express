import { createApplicationAction } from "@/actions/application.actions";
import { useState } from "react";

export default function PublicApplyForm({ universityId }: { universityId: string }) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(event.currentTarget);
    try {
      await createApplicationAction(universityId);
      setSuccess(true);
    } catch (e: any) {
      setError("Erreur lors de la candidature.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow border max-w-lg mx-auto mt-8">
      <h2 className="text-xl font-bold mb-2">Postuler à cette université</h2>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">Postuler</button>
      {success && <div className="text-green-600 font-bold">Candidature envoyée !</div>}
      {error && <div className="text-red-600 font-bold">{error}</div>}
    </form>
  );
}
