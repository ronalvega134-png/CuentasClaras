# Product Requirements Document (PRD): CuentasClaras (iOS)

## 1. Objective & Product Vision
**CuentasClaras** es una aplicación móvil iOS nativa/híbrida de alta fidelidad diseñada específicamente para prestamistas independientes, pequeños comercios y personas en Colombia que gestionan préstamos personales, cobros periódicos y seguimiento de intereses en **Pesos Colombianos (COP)**.

- **Usuario objetivo**: Prestamistas informales, tenderos, emprendedores e individuos que manejan préstamos de confianza o esquemas de cobranza periódica (diaria, semanal, quincenal o mensual) y requieren orden contable sin complejidad de software corporativo.
- **Propuesta de valor**: Reemplazar cuadernos físicos o notas dispersas con un sistema offline-first confiable, con trazabilidad exacta de saldos, cálculo automático de intereses, generación de recibos compartibles (WhatsApp/PDF) y seguridad biométrica.

---

## 2. Core Capabilities & Scope (Capability Map)

| Módulo ID | Responsabilidad | Dependencia |
|---|---|---|
| `core-domain` | Modelos de dominio financiero, tipos monetarios COP (`Decimal` / Centavos), lógica de cálculo de amortización e interés (simple/compuesto/fijo). | Ninguna |
| `data-storage` | Persistencia local relacional offline-first, migraciones y queries transaccionales. | `core-domain` |
| `contacts-mgmt` | Directorio de deudores/clientes, historial de solvencia, datos de contacto e integración con libreta de iOS. | `data-storage` |
| `loans-engine` | Creación, estados del préstamo (Activo, En Mora, Pagado, Renegociado), cronograma de cuotas y cálculo de moras. | `core-domain`, `data-storage`, `contacts-mgmt` |
| `payments-ledger`| Registro de abonos/pagos (capital vs. interés), recibos comprobantes y liquidación. | `loans-engine` |
| `ui-presentation`| Vistas iPhone SwiftUI / React Native con Human Interface Guidelines, modo oscuro dinámico, microinteracciones hápticas y soporte Dynamic Island / Widgets. | Todos |

---

## 3. Financial Rules Engine (Reglas Financieras Colombianas - COP)
1. **Precisión Numérica**: Cero flotantes IEEE 754 (`Double` / `Float`). Se utiliza `Decimal` de alta precisión para evitar errores de redondeo en intereses acumulados. El peso colombiano no maneja fracciones decimales en uso cotidiano (se redondea al peso entero más cercano según regla bancaria estándar).
2. **Modalidades de Cobro**:
   - **Gota a gota / Pago diario**: Cuotas fijas diarias durante $N$ días (capital + interés distribuido uniformemente).
   - **Interés mensual fijo sobre saldo inicial**: Muy extendido en préstamos informales en Colombia (ej. 5% al 10% mensual pagando solo interés hasta liquidar capital).
   - **Amortización Francesa**: Cuota fija periódica con abono decreciente a interés y creciente a capital.
   - **Interés sobre saldos / Simple**: Liquidación periódica proporcional a los días transcurridos.
3. **Manejo de Mora**: Cargo porcentual o tarifa fija por día de atraso tras la fecha pactada.

---

## 4. UI/UX Design Contract (ui-ux-pro-max + Apple HIG)

### Principios Fundamentales Apple HIG
- **Tipografía**: San Francisco (`SF Pro Display` para títulos $\ge 20\text{pt}$, `SF Pro Text` para cuerpos y datos $\le 19\text{pt}$, con variante monoespaciada `SF Pro Rounded` / `monospacedDigitSystemFont` para todos los montos en COP para evitar oscilaciones de ancho).
- **Target Táctil**: Altura y anchura mínima interactiva de **44 × 44 pt** con espaciado de margen seguro (`Safe Area`).
- **Paleta y Modo Oscuro**:
  - `Background Primario`: Adaptativo semántico (`systemBackground` / Dark: `#0B0F19`).
  - `Surface Cards`: `secondarySystemBackground` / Dark: `#161F30` con separación por luminancia en lugar de sombras pesadas.
  - `Primary / Brand Tint`: Verde esmeralda financiero (`#00A86B` o `#10B981`) que transmite solidez y liquidez; acento advertencia/mora: `#EF4444` (Coral Red de alta legibilidad WCAG AAA).
- **Feedback Sensorial**: Integración nativa de `UIFeedbackGenerator` / Haptic Feedback (impacto ligero al registrar abonos, éxito al saldar préstamo).
- **Reducción de Movimiento**: Respetar `UIAccessibility.isReduceMotionEnabled`.

---

## 5. Non-Functional & Security Requirements (`security-and-hardening`)
- **Almacenamiento Seguro**: Claves maestras y datos sensibles de clientes encriptados con SQLCipher usando llave almacenada en **iOS Keychain**.
- **Autenticación Biométrica**: Acceso a la app resguardado opcionalmente con **Face ID / Touch ID** (`LocalAuthentication`).
- **Privacidad estricta**: Los datos financieros viven 100% en el dispositivo del usuario (`zero-cloud telemetry` de balances o identificadores de clientes sin consentimiento explícito).
- **Respaldo Local Seguro**: Exportación cifrada de base de datos en formato JSON / SQLite con contraseña para transferir a otro dispositivo vía AirDrop o archivo local.

---

## 6. Boundaries (Fronteras de Ingeniería)
- **Always**: Ejecutar pruebas unitarias para todo cálculo de amortización antes de cualquier commit. Usar tipos monetarios exactos. Cumplir 44 pt de área táctil.
- **Ask First**: Cambios en el esquema de base de datos relacional, migración de dependencias principales o adición de servicios cloud externos.
- **Never**: Almacenar importes en formato `Float` o `Double`. Guardar números de identificación o teléfonos sin sanitizar. Subir datos financieros a servidores no autorizados.

---

## 7. Success Criteria & Verification
- 100% de los algoritmos de interés y amortización cubiertos con pruebas automatizadas (`XCTest` o `Jest`).
- Tiempo de renderizado inicial de lista de préstamos $< 16\text{ms}$ (60/120 fps ProMotion).
- Modo Oscuro y Modo Claro evaluados con ratio de contraste $\ge 4.5:1$ en todos los estados.
- Cero pérdida de precisión monetaria tras 10,000 transacciones simuladas de abono fraccionado.
