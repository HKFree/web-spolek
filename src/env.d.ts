declare namespace App {
  interface Locals {
    /** Přihlášený redaktor (jen v redakci, viz src/middleware.ts). */
    redaktor?: import('./redakce/auth').Redaktor;
  }
}
