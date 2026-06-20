/**
 * Select — Selector desplegable controlado con label, placeholder y estado de error.
 * Totalmente estilizado con CSS Modules sin librerías externas.
 */
import styles from "@/styles/ui/Select.module.css";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  className = "",
}: SelectProps) {
  const selectClassNames = [
    styles.select,
    error ? styles.selectError : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`${styles.wrapper} ${className}`.trim()}>
      <label className={styles.label}>{label}</label>
      <div className={styles.selectContainer}>
        <select
          className={selectClassNames}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className={styles.arrow} aria-hidden="true">
          ▾
        </span>
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
