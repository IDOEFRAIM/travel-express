
import createUniversityAction from "@/actions/university.actions";
import { useState } from "react";

export default function AddUniversityForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await createUniversityAction(formData);
      if (result.success) {
        setSuccess("Université ajoutée avec succès !");
        e.currentTarget.reset();
      } else {
        setError(result.error || "Erreur inconnue");
      }
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow border max-w-lg mx-auto mt-8">
      <h2 className="text-xl font-bold mb-2">Ajouter une université</h2>
      {error && <div className="text-red-600 font-bold">{error}</div>}
      {success && <div className="text-green-600 font-bold">{success}</div>}
      <div>
        <label className="block text-sm font-medium">Nom *</label>
        <input name="name" required className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Ville *</label>
        <input name="city" required className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Pays *</label>
        <select name="country" required defaultValue="Chine" className="w-full border rounded px-3 py-2">
          <option value="Chine">Chine</option>
          <option value="France">France</option>
          <option value="Canada">Canada</option>
          <option value="Burkina">Burkina</option>
          <option value="Espagne">Espagne</option>
          <option value="Allemagne">Allemagne</option>
          <option value="Maroc">Maroc</option>
          <option value="Sénégal">Sénégal</option>
          <option value="Autre">Autre</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Résumé court</label>
        <input name="summary" className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea name="description" className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Coût (ex: 2000-5000 USD/an)</label>
        <input name="costRange" className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Programmes</label>
        <input name="programs" className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Images (URLs, max 3)</label>
        <input name="images" placeholder="Séparez les URLs par des virgules" className="w-full border rounded px-3 py-2" />
        <span className="text-xs text-slate-400">Exemple: https://img1.jpg, https://img2.jpg, https://img3.jpg</span>
      </div>
      <div>
        <label className="block text-sm font-medium">Image principale (URL)</label>
        <input name="imageUrl" className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">PDF des conditions</label>
        <input name="pdf" type="file" accept="application/pdf" className="w-full border rounded px-3 py-2" />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700" disabled={loading}>
        {loading ? "Ajout..." : "Ajouter"}
      </button>
    </form>
  );
}
