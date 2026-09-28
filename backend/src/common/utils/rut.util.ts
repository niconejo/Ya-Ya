/**
 * Validación de RUT chileno mediante el algoritmo de dígito verificador
 * (módulo 11). Se usa en el registro de usuarios (B3) para confirmar que
 * el RUT ingresado es matemáticamente válido antes de guardarlo.
 *
 * Importante: esto NO confirma que el RUT le pertenezca realmente a la
 * persona (eso requeriría una validación contra el Registro Civil o el
 * SII, fuera del alcance del MVP). Es solo una validación de formato.
 */

/**
 * Normaliza un RUT a formato sin puntos, con guión y dígito verificador
 * en mayúscula. Ej: "12.345.678-k" -> "12345678-K"
 */
export function normalizeRut(rut: string): string {
  const clean = rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return `${cuerpo}-${dv}`;
}

/**
 * Calcula el dígito verificador esperado para un cuerpo de RUT dado.
 */
function calcularDigitoVerificador(cuerpo: string): string {
  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return String(resto);
}

/**
 * Valida que un RUT (con o sin puntos/guión) sea correcto.
 */
export function isValidRut(rut: string): boolean {
  if (!rut) return false;

  const normalized = normalizeRut(rut);
  const [cuerpo, dv] = normalized.split('-');

  if (!cuerpo || !dv || !/^\d{7,8}$/.test(cuerpo)) return false;

  return calcularDigitoVerificador(cuerpo) === dv;
}
