# CuentasClaras (iOS) 📱💰

Aplicación móvil orientada a la gestión inteligente y offline-first de préstamos, abonos e intereses en **Pesos Colombianos (COP)**.

---

## 🎯 Objetivo
Facilitar el control de cobros y préstamos personales o para pequeños negocios en Colombia con:
- **Costo $0**: Sin bases de datos pagas ni cuotas mensuales; arquitectura 100% Local-First en SQLite.
- **Precisión Financiera**: Manejo de monedas en enteros/centavos COP sin acumulación de errores de coma flotante IEEE 754.
- **Estética Nativa Apple HIG + ui-ux-pro-max**:
  - Tipografía San Francisco con números tabulares (`tabular-nums`).
  - Modo Oscuro y Claro dinámico por separación de luminancia.
  - Áreas táctiles ergonómicas mínimas de 44 pt.

---

## 🚀 Inicio Rápido (Desarrollo en iOS)

### Prerrequisitos
- Node.js $\ge 18$
- App móvil **Expo Go** instalada en tu iPhone.

### Instalación y Ejecución
```bash
# 1. Instalar dependencias
npm install

# 2. Correr las pruebas unitarias TDD
npm test

# 3. Iniciar el servidor local de desarrollo
npx expo start
```
Escanea el código QR desde la cámara de tu iPhone para probar la aplicación en tiempo real.

---

## 🧪 Pruebas Automatizadas (TDD)
```bash
npx jest
```
Todas las modalidades de crédito (gota a gota / pago diario, cobro de interés mensual y liquidación simple a 360 días) están cubiertas con tests automatizados.

---

## 📄 Documentación Técnica
- [PRD.md](./PRD.md): Especificación técnica completa.
- [SCHEMA.md](./SCHEMA.md): Diagrama Entidad-Relación y diccionario de datos relacional.
- [PLAN.md](./PLAN.md): Plan de iteraciones verticales de desarrollo.
