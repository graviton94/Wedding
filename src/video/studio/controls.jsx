/** 스튜디오 패널에서 반복 사용하는 입력 컨트롤 모음 */

export const Field = ({ label, hint, children, inline = false }) => (
  <label className={`block ${inline ? 'flex items-center justify-between gap-3' : ''}`}>
    <span className="block text-[11px] tracking-wide text-white/55 mb-1">
      {label}
      {hint && <span className="ml-1.5 text-white/30 normal-case">{hint}</span>}
    </span>
    {children}
  </label>
);

export const Slider = ({ label, value, onChange, min = 0, max = 1, step = 0.01, format }) => (
  <div className="mb-3">
    <div className="flex items-center justify-between mb-1">
      <span className="text-[11px] tracking-wide text-white/55">{label}</span>
      <span className="text-[11px] tabular-nums text-amber-200/80">
        {format ? format(value) : Number(value).toFixed(step < 1 ? 2 : 0)}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-amber-300 h-1 cursor-pointer"
    />
  </div>
);

export const Toggle = ({ label, value, onChange, hint }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className="w-full flex items-center justify-between py-2 group"
  >
    <span className="text-left">
      <span className="block text-xs text-white/80">{label}</span>
      {hint && <span className="block text-[10px] text-white/35">{hint}</span>}
    </span>
    <span
      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
        value ? 'bg-amber-400/80' : 'bg-white/15'
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
          value ? 'left-[18px]' : 'left-0.5'
        }`}
      />
    </span>
  </button>
);

export const Select = ({ label, value, onChange, options }) => (
  <Field label={label}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/8 border border-white/12 rounded px-2 py-1.5 text-xs text-white/90
                 focus:outline-none focus:border-amber-300/50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-neutral-900">
          {o.label}
        </option>
      ))}
    </select>
  </Field>
);

export const TextInput = ({ label, value, onChange, placeholder, hint }) => (
  <Field label={label} hint={hint}>
    <input
      type="text"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/8 border border-white/12 rounded px-2 py-1.5 text-xs text-white/90
                 placeholder:text-white/25 focus:outline-none focus:border-amber-300/50"
    />
  </Field>
);

export const ColorInput = ({ label, value, onChange }) => (
  <Field label={label} inline>
    <span className="flex items-center gap-2">
      <span className="text-[10px] tabular-nums text-white/40">{value}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-6 rounded cursor-pointer bg-transparent border border-white/15"
      />
    </span>
  </Field>
);

export const NumberInput = ({ label, value, onChange, min, max, step = 1, hint }) => (
  <Field label={label} hint={hint}>
    <input
      type="number"
      value={value ?? ''}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      className="w-full bg-white/8 border border-white/12 rounded px-2 py-1.5 text-xs text-white/90
                 focus:outline-none focus:border-amber-300/50"
    />
  </Field>
);

export const SectionTitle = ({ children }) => (
  <h3 className="text-[10px] uppercase tracking-[0.2em] text-amber-200/60 mt-5 mb-2 first:mt-0">
    {children}
  </h3>
);

export const Btn = ({ children, onClick, variant = 'ghost', className = '', ...rest }) => {
  const styles = {
    ghost: 'bg-white/8 hover:bg-white/14 text-white/80 border-white/12',
    primary: 'bg-amber-400/90 hover:bg-amber-300 text-neutral-900 border-transparent font-medium',
    danger: 'bg-red-500/15 hover:bg-red-500/25 text-red-200 border-red-400/20',
  }[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded border text-xs transition-colors ${styles} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
