'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { uploadDocumentAction } from "@/actions/document.actions";
import { X, UploadCloud, FileText, Check } from 'lucide-react';

import { cn } from "@/lib/utils";

export function UploadDocumentButton({ applicationId, className }: { applicationId: string; className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Basic Client Side Validation
      if (selectedFile.size > 5 * 1024 * 1024) {
         setErrorMsg("Fichier trop volumineux (Max 5Mo)");
         return;
      }
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(selectedFile.type)) {
         setErrorMsg("Format non supporté (PDF, JPG, PNG uniquement)");
         return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setErrorMsg(null);
    if (!file) {
       setErrorMsg("Veuillez sélectionner un fichier.");
       return;
    }
    setIsPending(true);
    formData.append('applicationId', applicationId);
    // formData already contains 'file' from the input if name="file"
    
    try {
      await uploadDocumentAction(formData);
      setIsOpen(false);
      setFile(null);
      setErrorMsg(null);
    } catch (e: any) {
      console.error(e);
      const message = e?.message || "Une erreur est survenue lors de l'envoi du document.";
      setErrorMsg(message);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
      document.documentElement.classList.add('overflow-hidden');
      setTimeout(() => {
        selectRef.current?.focus();
      }, 100);
    } else {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  return (
    <>

      <Button 
        onClick={() => { setIsOpen(true); setErrorMsg(null); }}
        variant="primary"
        size="lg"
        className={cn("w-full font-bold text-lg flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg py-3 rounded-xl", className)}
      >
        <UploadCloud size={22} /> Ajouter un document
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
          
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                 <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><UploadCloud size={20}/></div>
                 Téléverser une pièce
              </h3>
              <button type="button" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form action={handleSubmit} className="p-6 space-y-6">
               <input type="hidden" name="applicationId" value={applicationId} />
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Type de document</label>
                     <select ref={selectRef} name="type" className="w-full h-11 px-4 rounded-xl border-2 border-blue-400 bg-white font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                        <option value="PASSPORT">Passeport</option>
                        <option value="DIPLOMA">Relevé de notes / Diplôme</option>
                        <option value="CV">CV / Lettre de motivation</option>
                        <option value="PHOTO">Photo d'identité</option>
                        <option value="MEDICAL">Certificat médical</option>
                        <option value="OTHER">Autre document</option>
                     </select>
                  </div>
                  <div className="flex flex-col gap-2 items-center">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer group w-full ${
                         file ? 'border-green-500 bg-green-50' : 'border-blue-500 hover:bg-blue-50 bg-blue-50/30'
                      }`}
                    >
                       <input 
                          type="file" 
                          name="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="application/pdf,image/jpeg,image/png,image/jpg"
                          onChange={handleFileChange}
                       />
                       <div className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110 ${
                          file ? 'bg-green-200 text-green-700' : 'bg-blue-200 text-blue-700'
                       }`}>
                          {file ? <Check size={24} /> : <FileText size={24} />}
                       </div>
                       <div className="text-base font-bold text-slate-700">
                          {file ? file.name : "Cliquez ou utilisez le bouton ci-dessous pour sélectionner un fichier"}
                       </div>
                       <div className="text-xs text-slate-400 mt-1">
                          {file ? `${(file.size / 1024 / 1024).toFixed(2)} Mo` : "PDF, JPG, PNG (Max 5Mo)"}
                       </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full font-semibold border-blue-500 text-blue-700 hover:bg-blue-100"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choisir un fichier
                    </Button>
                  </div>
                  {errorMsg && (
                    <div className="text-red-500 text-sm font-semibold text-center mt-2">{errorMsg}</div>
                  )}
               </div>
               <div className="flex gap-3 pt-2">
		      <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsOpen(false)}>Annuler</Button>
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg" isLoading={isPending} disabled={!file}>Envoyer</Button>
               </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
