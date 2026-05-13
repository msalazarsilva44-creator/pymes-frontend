import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  lastPage: number
  total: number
  perPage: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, lastPage, total, perPage, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null

  const from = (currentPage - 1) * perPage + 1
  const to = Math.min(currentPage * perPage, total)

  // Genera los números de página con elipsis
  const getPages = (): (number | '...')[] => {
    const pages: (number | '...')[] = []
    const delta = 2 // páginas visibles a cada lado de la actual

    if (lastPage <= 7) {
      for (let i = 1; i <= lastPage; i++) pages.push(i)
      return pages
    }

    pages.push(1)

    const rangeStart = Math.max(2, currentPage - delta)
    const rangeEnd = Math.min(lastPage - 1, currentPage + delta)

    if (rangeStart > 2) pages.push('...')

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i)
    }

    if (rangeEnd < lastPage - 1) pages.push('...')

    pages.push(lastPage)
    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      <p className="text-sm text-gray-500">
        Mostrando <span className="font-semibold text-gray-700">{from}</span> a{' '}
        <span className="font-semibold text-gray-700">{to}</span> de{' '}
        <span className="font-semibold text-gray-700">{total}</span> resultados
      </p>

      <div className="flex items-center gap-1">
        {/* Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Números */}
        {getPages().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 py-2 text-sm text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[36px] h-9 px-2 text-sm font-semibold rounded-lg transition-all ${
                page === currentPage
                  ? 'bg-mercarof-navy text-white shadow-md shadow-mercarof-navy/20'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
