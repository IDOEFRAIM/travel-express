'use client';
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function EditUniversityPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: university, isLoading, error } = useQuery({
    queryKey: ["university", id],
    queryFn: async () => {
      const res = await axios.get(`/api/universities/${id}`);
      return res.data.university;
    },
    enabled: !!id,
  });

  const [form, setForm] = useState({
    name: university?.name || "",
    city: university?.city || "",
    summary: university?.summary || "",
    description: university?.description || "",
    costRange: university?.costRange || "",
    programs: university?.programs || "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  // Anciennes images (URLs)
  const [oldImages, setOldImages] = useState<string[]>(university?.images || []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    let newFiles = [...selectedFiles];
    for (const file of files) {
      if (oldImages.length + newFiles.length >= 3) break;
      if (!newFiles.some(f => f.name === file.name && f.size === file.size)) {
        newFiles.push(file);
      }
    }
    if (oldImages.length + newFiles.length > 3) {
      alert("Vous pouvez avoir au maximum 3 images (anciennes + nouvelles).");
      return;
    }
    setSelectedFiles(newFiles);
    setPreviews(newFiles.map(file => URL.createObjectURL(file)));
    e.target.value = "";
  }

  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      await axios.put(`/api/universities/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["university", id] });
      router.push(`/admin/universities/${id}`);
    }
  });

  interface UniversityForm {
    name: string;
    city: string;
    summary: string;
    description: string;
    costRange: string;
    programs: string;
  }

  interface University {
    name: string;
    city: string;
    summary: string;
    description: string;
    costRange: string;
    programs: string;
    images: string[];
    [key: string]: any;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleRemoveOldImage(url: string) {
    setOldImages(oldImages.filter(img => img !== url));
  }

  function handleSubmit(e: { preventDefault: () => void; }) {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    selectedFiles.forEach(file => formData.append('images', file));
    oldImages.forEach(url => formData.append('oldImages', url));
    updateMutation.mutate(formData);
  }

  if (isLoading) return <div>Chargement...</div>;
  if (error || !university) return <div>Erreur ou université introuvable.</div>;

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-slate-100 py-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-0 overflow-hidden">
        <div className="bg-slate-100 px-10 py-5 text-center text-lg font-bold text-slate-700 tracking-wide border-b">
          <Link href={`/admin/universities/${id}`}>Retour aux détails</Link>
        </div>
        <form className="p-10 space-y-6" onSubmit={handleSubmit}>
          <input name="name" value={form.name} onChange={handleChange} className="w-full p-3 border rounded-xl" placeholder="Nom" />
          <input name="city" value={form.city} onChange={handleChange} className="w-full p-3 border rounded-xl" placeholder="Ville" />
          <input name="summary" value={form.summary} onChange={handleChange} className="w-full p-3 border rounded-xl" placeholder="Résumé" />
          <input name="description" value={form.description} onChange={handleChange} className="w-full p-3 border rounded-xl" placeholder="Description" />
          <input name="costRange" value={form.costRange} onChange={handleChange} className="w-full p-3 border rounded-xl" placeholder="Coût" />
          <input name="programs" value={form.programs} onChange={handleChange} className="w-full p-3 border rounded-xl" placeholder="Programmes" />
          <div>
            <label className="block text-base font-bold text-slate-700 mb-1">Images actuelles</label>
            {oldImages.length > 0 ? (
              <div className="flex gap-3 mt-2 mb-2">
                {oldImages.map((src, i) => (
                  <div key={i} className="relative bg-white p-1 rounded-xl border flex items-center justify-center" style={{width: 80, height: 80}}>
                    <img src={src} alt={`old-${i}`} className="max-h-16 max-w-16 object-contain" style={{display: 'block', margin: 'auto'}} />
                    <button type="button" onClick={() => handleRemoveOldImage(src)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                  </div>
                ))}
              </div>
            ) : <span className="text-xs text-slate-400">Aucune image enregistrée.</span>}
            <label className="block text-base font-bold text-slate-700 mb-1 mt-4">Ajouter des images (max 3 au total)</label>
            <input
              name="images"
              type="file"
              accept="image/*"
              multiple
              className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-200 outline-none font-medium"
              onChange={handleImageChange}
              disabled={oldImages.length + selectedFiles.length >= 3}
            />
            <span className="text-xs text-slate-400">
              {oldImages.length + selectedFiles.length >= 3
                ? "Limite atteinte : 3 images maximum."
                : `Vous pouvez ajouter jusqu'à ${3 - oldImages.length - selectedFiles.length} image(s).`}
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
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg transition-all">Enregistrer</button>
        </form>
      </div>
    </main>
  );
}