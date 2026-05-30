import { useState, DragEvent } from 'react'
import { Upload, FileText, X } from 'lucide-react'

interface FileUploadProps {
  file: File | null
  onSelect: (file: File) => void
  onRemove: () => void
  onInvalid?: () => void
  accept?: string
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function FileUpload({ file, onSelect, onRemove, onInvalid, accept = '.pdf' }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const validateAndSelect = (selected?: File | null) => {
    if (selected && selected.type === 'application/pdf') {
      onSelect(selected)
    } else if (selected) {
      onInvalid?.()
    }
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    validateAndSelect(event.dataTransfer.files?.[0])
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-brand-cyan/40 bg-brand-cyanlt/40 p-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-cyan">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-brand-deep">{file.name}</p>
          <p className="text-xs text-brand-deep/50">{formatSize(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-1.5 text-brand-deep/40 transition hover:bg-white hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
          aria-label="Quitar archivo adjunto"
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
      className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-center transition-colors focus-within:ring-2 focus-within:ring-brand-cyan/40 ${
        isDragOver
          ? 'border-brand-cyan bg-brand-cyanlt/60'
          : 'border-brand-cyan/30 bg-brand-cyanlt/20 hover:border-brand-cyan hover:bg-brand-cyanlt/40'
      }`}
    >
      <Upload className="mb-1 h-6 w-6 text-brand-cyan" aria-hidden="true" />
      <span className="text-sm font-semibold text-brand-navy">Haz clic o arrastra el RIF en PDF</span>
      <span className="mt-0.5 text-xs text-brand-deep/50">Solo PDF</span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => validateAndSelect(event.target.files?.[0])}
      />
    </label>
  )
}
