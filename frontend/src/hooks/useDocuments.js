import { useState, useEffect, useCallback } from "react";
import { API } from "../utils/helpers";

export function useDocuments(entityType, entityId) {
  const [docs,     setDocs]     = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [uploading,setUploading]= useState(false);
  const [error,    setError]    = useState(null);

  const load = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API}/documents?entityType=${entityType}&entityId=${entityId}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDocs(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => { load(); }, [load]);

  const upload = useCallback(async (file) => {
    setUploading(true);
    setError(null);
    try {
      // Convertir a base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result.split(",")[1]);
        reader.onerror = () => reject(new Error("Error al leer el archivo"));
        reader.readAsDataURL(file);
      });

      const res = await fetch(`${API}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          fileName: file.name,
          mimeType: file.type,
          fileData: base64,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al subir");
      }
      const saved = await res.json();
      setDocs(prev => [saved, ...prev]);
      return saved;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setUploading(false);
    }
  }, [entityType, entityId]);

  const remove = useCallback(async (docId) => {
    try {
      await fetch(`${API}/documents/${docId}`, { method: "DELETE" });
      setDocs(prev => prev.filter(d => d.id !== docId));
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const getFileUrl = (docId) => `${API}/documents/${docId}/file`;

  return { docs, loading, uploading, error, upload, remove, getFileUrl, reload: load };
}
