import { useActiveProfile, useProfileName, useStore } from '../store'

export function ProfileSwitch({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const active = useActiveProfile()
  const setActive = useStore((s) => s.setActiveProfile)
  const nameV = useProfileName('v')
  const nameP = useProfileName('p')

  const wrapper = tone === 'dark' ? 'bg-white/15 backdrop-blur' : 'bg-paper-2'
  const activeCls = tone === 'dark' ? 'bg-white text-brand-700' : 'bg-white text-ink shadow-sm'
  const idleCls = tone === 'dark' ? 'text-white/80' : 'text-ink-faint'

  return (
    <div className={`flex rounded-full p-0.5 ${wrapper}`}>
      {(['v', 'p'] as const).map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => setActive(id)}
          className={`rounded-full px-3 py-1 text-[12px] font-bold transition-all ${
            active === id ? activeCls : idleCls
          }`}
        >
          {id === 'v' ? nameV : nameP}
        </button>
      ))}
    </div>
  )
}
