import { useRef, useState } from "react";
import { FileText, ImageIcon, Paperclip, Trash2, Upload, ExternalLink, Loader2, AlertCircle } from "lucide-react";

function fmtSize(bytes) {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024*1024)  return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1024/1024).toFixed(1)} MB`;
}

function DocIcon({ mimeType }) {
  if (mimeType === "application/pdf")
    return <FileText size={16} className="text-red-500 dark:text-red-400 flex-shrink-0" />;
  return <ImageIcon size={16} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />;
}

export function DocumentsSection({ entityType, entityId, docs, loading, uploading, error, upload, remove, getFileUrl }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFiles = async (files) => {
    setUploadError("");
    const allowed = ["application/pdf", "image/png", "image/jpeg"];
    for (const file of files) {
      if (!allowed.includes(file.type)) {
        setUploadError(`Tipo no permitido: ${file.name}. Solo PDF, PNG o JPG.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`${file.name} supera los 10 MB.`);
        continue;
      }
      try {
        await upload(file);
      } catch (e) {
        setUploadError(e.message);
      }
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles([...e.dataTransfer.files]);
  };

  const onInputChange = (e) => {
    if (e.target.files?.length) {
      handleFiles([...e.target.files]);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Paperclip size={14} className="text-gray-400" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Documentos adjuntos
        </p>
        {docs.length > 0 && (
          <span className="text-xs bg-gray-100 dark:bg-[#2d2d2d] text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
            {docs.length}
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-200 dark:border-[#404040] hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-[#2d2d2d]/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          multiple
          className="hidden"
          onChange={onInputChange}
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 py-1">
            <Loader2 size={16} className="animate-spin text-blue-500" />
            <p className="text-sm text-blue-600 dark:text-blue-400">Subiendo…</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-1">
            <Upload size={16} className="text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="text-blue-600 dark:text-blue-400 font-medium">Elegí un archivo</span>
              {" "}o arrastrá aquí
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">· PDF, PNG, JPG · máx 10 MB</p>
          </div>
        )}
      </div>

      {/* Errores */}
      {(uploadError || error) && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 dark:text-red-400">{uploadError || error}</p>
        </div>
      )}

      {/* Lista de documentos */}
      {loading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 size={14} className="animate-spin text-gray-400" />
          <p className="text-xs text-gray-400">Cargando documentos…</p>
        </div>
      ) : docs.length > 0 ? (
        <div className="space-y-2">
          {docs.map(doc => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-[#333333]"
            >
              <DocIcon mimeType={doc.mime_type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{doc.file_name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {fmtSize(doc.file_size)} · {new Date(doc.created_at).toLocaleDateString("es-AR")}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <a
                  href={getFileUrl(doc.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title="Ver / descargar"
                  onClick={e => e.stopPropagation()}
                >
                  <ExternalLink size={13} className="text-blue-500" />
                </a>
                <button
                  onClick={e => { e.stopPropagation(); remove(doc.id); }}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Eliminar documento"
                >
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-1">
          Sin documentos adjuntos
        </p>
      )}
    </div>
  );
}
