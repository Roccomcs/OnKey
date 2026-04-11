import { useState, useEffect, useCallback } from "react";
import { API } from "../utils/helpers";

export function useDocuments(entityType, entityId) {
  const [docs,     setDocs]     = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [uploading,setUploading]= useState(false);
  const [error,    setError]    = useState(null);

  const getToken = () => localStorage.getItem("authToken");

  const load = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API}/documents?entityType=${entityType}&entityId=${entityId}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
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
      const fd = new FormData();
      fd.append("file", file);
      fd.append("entityType", entityType);
      fd.append("entityId", String(entityId));

      const res = await fetch(`${API}/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      if (!res.ok) {
        let msg = `Error ${res.status}`;
        try { const err = await res.json(); msg = err.error || msg; } catch {}
        throw new Error(msg);
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
      await fetch(`${API}/documents/${docId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setDocs(prev => prev.filter(d => d.id !== docId));
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const getFileUrl = (docId) => `${API}/documents/${docId}/file`;

  return { docs, loading, uploading, error, upload, remove, getFileUrl, reload: load };
}
