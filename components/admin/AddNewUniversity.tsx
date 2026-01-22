"use client";
import { useRouter } from 'next/navigation';
import { useState } from "react";

export default function AddNewUniversity() {
  const router = useRouter();
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    let newFiles = [...selectedFiles];
    for (const file of files) {
      if (newFiles.length >= 3) break;
      if (!newFiles.some(f => f.name === file.name && f.size === file.size)) {
        newFiles.push(file);
      }
    }
    if (newFiles.length > 3) {
      alert("Vous pouvez sélectionner au maximum 3 images.");
      return;
    }
    setSelectedFiles(newFiles);
    setPreviews(newFiles.map(file => URL.createObjectURL(file)));
    e.target.value = "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    const form = event.currentTarget;
    const formData = new FormData(form);
    selectedFiles.forEach(file => formData.append('images', file));
    const response = await fetch("/api/university", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    if (result.success) {
      setSuccess(true);
      if (form) form.reset();
      router.push('/admin/universities');
    } else {
      setError(result.error);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-slate-100 py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-100 p-10 relative">
          <a href="/admin/universities" className="absolute left-6 top-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-base transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Retour
          </a>
        <h1 className="text-3xl font-extrabold text-blue-700 mb-8 text-center tracking-tight">Nouvelle Université</h1>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        {success && <div className="text-green-500 text-sm mb-4">Université créée avec succès !</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-base font-bold text-slate-700 mb-1">Nom <span className="text-red-500">*</span></label>
            <input name="name" required className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-blue-200 outline-none font-medium" />
          </div>
          <div>
            <label className="block text-base font-bold text-slate-700 mb-1">Ville <span className="text-red-500">*</span></label>
            <input name="city" required className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-blue-200 outline-none font-medium" />
          </div>
          <div>
            <label className="block text-base font-bold text-slate-700 mb-1">Pays *</label>
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
            <label className="block text-base font-bold text-slate-700 mb-1">Résumé court</label>
            <input name="summary" maxLength={200} placeholder="Résumé court de la bourse ou université" className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-blue-200 outline-none font-medium" />
          </div>
          <div>
            <label className="block text-base font-bold text-slate-700 mb-1">Description détaillée</label>
            <textarea name="description" rows={4} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-blue-200 outline-none font-medium" />
          </div>
          <div>
            <label className="block text-base font-bold text-slate-700 mb-1">Coût (ex: 2000-5000 FCFA (XOF)/an)</label>
            <input name="costRange" placeholder="Montant en FCFA (XOF)" className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-blue-200 outline-none font-medium" />
          </div>
          <div>
            <label className="block text-base font-bold text-slate-700 mb-1">Programmes</label>
            <input name="programs" placeholder="Liste des programmes proposés" className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-blue-200 outline-none font-medium" />
          </div>
          <div>
            <label className="block text-base font-bold text-slate-700 mb-1">Images (max 3, JPG/PNG/WEBP)</label>
            <input
              name="images"
              type="file"
              accept="image/*"
              multiple
              className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-200 outline-none font-medium"
              onChange={handleImageChange}
              disabled={selectedFiles.length >= 3}
            />
            <span className="text-xs text-slate-400">
              {selectedFiles.length >= 3
                ? "Limite atteinte : 3 images maximum."
                : "Vous pouvez sélectionner jusqu'à 3 images."}
            </span>
            {previews.length > 0 && (
              <div className="flex gap-3 mt-3">
                {previews.map((src, i) => (
                  <div key={i} className="bg-white p-1 rounded-xl border flex items-center justify-center" style={{width: 80, height: 80}}>
                    <img src={src} alt={`preview-${i}`} className="max-h-16 max-w-16 object-contain" style={{display: 'block', margin: 'auto'}} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-base font-bold text-slate-700 mb-1">PDF des conditions de la bourse</label>
            <input name="pdf" type="file" accept="application/pdf" className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-200 outline-none font-medium" />
            <span className="text-xs text-slate-400">Optionnel. Un seul fichier PDF accepté.</span>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg transition-all"
          >
            Créer l'université
          </button>
        </form>
      </div>
    </main>
  );
}
