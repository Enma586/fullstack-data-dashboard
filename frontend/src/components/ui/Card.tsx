import type { ReactNode } from "react";
import styles from "./Card.module.css";

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  variant?: "default" | "elevated";
  headerRight?: ReactNode;
}

export function Card({
  children,
  title,
  className = "",
  variant = "default",
  headerRight,
}: CardProps) {
  const classNames = [
    styles.card,
    variant === "elevated" ? styles.cardElevated : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames}>
      {title && (
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
