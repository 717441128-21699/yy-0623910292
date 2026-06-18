import { ChevronDown, Search } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { STREETS, CATEGORIES } from '@/types'
import { useStore } from '@/store'

function MultiSelect({ options, selected, onChange, placeholder }: {
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((s) => s !== val))
    } else {
      onChange([...selected, val])
    }
  }

  const label = selected.length === 0 ? placeholder : selected.length <= 2 ? selected.join('、') : `${selected[0]}等${selected.length}项`

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-blue-400 transition-colors min-w-[140px]"
      >
        <span className={`flex-1 text-left ${selected.length === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
          {label}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[180px]">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center gap-2"
            >
              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                selected.includes(opt)
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'border-gray-300'
              }`}>
                {selected.includes(opt) && <span className="text-xs">✓</span>}
              </span>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FilterBar() {
  const { selectedStreets, selectedCategories, timeRange, setSelectedStreets, setSelectedCategories, setTimeRange } = useStore()

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 flex-wrap">
      <MultiSelect
        options={STREETS}
        selected={selectedStreets}
        onChange={setSelectedStreets}
        placeholder="全部街道"
      />
      <MultiSelect
        options={CATEGORIES}
        selected={selectedCategories}
        onChange={setSelectedCategories}
        placeholder="全部类型"
      />
      <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
        {(['7d', '30d'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1.5 rounded-md text-sm transition-all ${
              timeRange === range
                ? 'bg-white text-blue-600 shadow-sm font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {range === '7d' ? '近7天' : '近30天'}
          </button>
        ))}
      </div>
      <button className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:shadow-lg active:scale-[0.98]"
        style={{ background: '#2E7CF6' }}
      >
        <Search className="w-4 h-4" />
        查询
      </button>
    </div>
  )
}
