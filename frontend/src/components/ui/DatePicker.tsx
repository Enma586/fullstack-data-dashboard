/**
 * DatePicker — Campo de entrada de fecha nativo estilizado con el tema oscuro.
 * Envuelve <input type="date"> con label y control de estado.
 */
import styles from "@/styles/ui/DatePicker.module.css";

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
}

export function DatePicker({
  label,
  value,
  onChange,
  min,
  max,
  className = "",
}: DatePickerProps) {
  return (
    <div className={`${styles.wrapper} ${className}`.trim()}>
      <label className={styles.label}>{label}</label>
      <input
        type="date"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
      />
    </div>
  );
}
