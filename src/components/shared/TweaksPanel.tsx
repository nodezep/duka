import { X, Sun, Moon, Palette } from 'lucide-react'
import { useThemeStore } from '@/stores/theme'
import { cn } from '@/lib/utils'

interface TweaksPanelProps {
  onClose: () => void
}

export function TweaksPanel({ onClose }: TweaksPanelProps) {
  const { mode, setMode, accent, setAccent } = useThemeStore()

  return (
    <div className="w-80 rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl p-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-foreground flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" /> Preferencias Visuales
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          title="Cerrar"
          className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Mode toggle */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-muted-foreground">Modo Visual</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('light')}
            className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all duration-200",
              mode === 'light'
                ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                : "border-border hover:bg-muted text-foreground"
            )}
          >
            <Sun className="h-3.5 w-3.5" /> Claro
          </button>
          <button
            type="button"
            onClick={() => setMode('dark')}
            className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all duration-200",
              mode === 'dark'
                ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                : "border-border hover:bg-muted text-foreground"
            )}
          >
            <Moon className="h-3.5 w-3.5" /> Oscuro
          </button>
        </div>
      </div>

      {/* Accent selection */}
      <div className="space-y-1.5 pt-1 border-t border-border">
        <span className="text-xs font-semibold text-muted-foreground">Color de Acento</span>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'azul', label: 'Azul', bg: 'bg-[#1E63E6]' },
            { id: 'indigo', label: 'Índigo', bg: 'bg-[#4F46E5]' },
            { id: 'teal', label: 'Teal', bg: 'bg-[#0D9488]' },
          ].map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAccent(a.id as any)}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs transition-all duration-200",
                accent === a.id
                  ? "border-primary bg-primary/10 text-primary font-bold"
                  : "border-border text-foreground hover:bg-muted"
              )}
            >
              <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", a.bg)} />
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
