import styles from "./Footer.module.css";
import { APP_VERSION } from "@/version";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.version}>v{APP_VERSION}</p>
    </footer>
  );
}
