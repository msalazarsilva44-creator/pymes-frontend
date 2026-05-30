import { useState, DragEvent } from 'react'
import { Upload, X } from 'lucide-react'

interface ProofUploadProps {
  file: File | null
  preview: string | null
  onFile: (file: File) => void
  onRemove: () => void
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function ProofUpload({ file, preview, onFile, onRemove }: ProofUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    const dropped = event.dataTransfer.files?.[0]
    if (dropped) onFile(dropped)
  }

  if (file && preview) {
    return (
      <div className="flex items-center gap-4 rounded-lg border border-brand-cyan/30 bg-brand-cyanlt/30 p-3">
        <img src={preview} alt="Vista previa del comprobante" className="h-20 w-20 rounded-lg border border-brand-cyan/20 object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-brand-deep">{file.name}</p>
          <p className="text-xs text-brand-deep/50">{formatSize(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Quitar comprobante"
          className="rounded-full p-1.5 text-brand-deep/40 transition hover:bg-white hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-center transition-colors focus-within:ring-2 focus-within:ring-brand-cyan/40 ${
        isDragOver
          ? 'border-brand-cyan bg-brand-cyanlt/60'
          : 'border-brand-cyan/30 bg-brand-cyanlt/20 hover:border-brand-cyan hover:bg-brand-cyanlt/40'
      }`}
    >
      <Upload className="mb-2 h-9 w-9 text-brand-cyan" aria-hidden="true" />
      <p className="text-sm font-semibold text-brand-navy">Haz clic o arrastra el comprobante</p>
      <p className="mt-0.5 text-xs text-brand-deep/50">PNG, JPG, GIF máx. 5MB</p>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const selected = event.target.files?.[0]
          if (selected) onFile(selected)
        }}
      />
    </label>
  )
}
