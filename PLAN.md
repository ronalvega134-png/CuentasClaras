# Plan de Implementación: CuentasClaras (iOS) - Iteración 1

## Overview
Construcción de la primera rebanada vertical funcional (Vertical Slice): Configuración del núcleo de cálculo financiero en COP, persistencia relacional local de Contactos y Préstamos, y vista de listado y creación con estética Apple HIG.

---

## Tareas Desglosadas (Tasks Breakdown)

### Tarea 1: Motor Financiero y Tipos Monetarios (`core-domain`)
- **Descripción**: Implementación aislada de los tipos de datos monetarios en COP (evitando punto flotante) y las funciones de cálculo de amortización (interés simple, porcentaje fijo mensual y cuota fija diaria).
- **Criterios de Aceptación**:
  - Manejo de enteros para centavos/COP sin acumulación de error de redondeo.
  - Generación exacta de tabla de cuotas para las 3 modalidades más usadas en Colombia.
- **Verificación**: Suite de pruebas unitarias cubriendo 20 casos de amortización contra calculadora financiera real.
- **Archivos**: `src/core/currency.ts` (o `.swift`), `src/core/amortization.ts`, `tests/amortization.test.ts`.

### Tarea 2: Capa de Persistencia Relacional y Migraciones (`data-storage`)
- **Descripción**: Esquema relacional implementado en SQLite con soporte para operaciones ACID transaccionales.
- **Criterios de Aceptación**:
  - Creación de tablas: `contacts`, `loans`, `installments`, `payments`, `payment_allocations`.
  - Índices sobre llaves foráneas y campos de consulta (`status`, `due_date`, `contact_id`).
- **Verificación**: Pruebas de integración de inserción, actualización en cascada y consultas de saldos.
- **Archivos**: `src/database/schema.ts`, `src/database/migrations/`, `tests/database.test.ts`.

### Tarea 3: Dominio de Contactos y Creación de Préstamo (`contacts-mgmt` + `loans-engine`)
- **Descripción**: Lógica transaccional para registrar un deudor y crear un préstamo con su cronograma de cuotas asociado.
- **Criterios de Aceptación**:
  - Al desembolsar un préstamo se autogeneran todas las cuotas correspondientes con sus fechas de vencimiento.
  - Validación de campos requeridos (monto $> 0$, tasa $\ge 0$, frecuencia válida).
- **Verificación**: Pruebas unitarias de creación de préstamo y verificación de integridad referencial.
- **Archivos**: `src/services/loan-service.ts`, `src/services/contact-service.ts`, `tests/loan-service.test.ts`.

### Tarea 4: Componentes de UI Base según Apple HIG & ui-ux-pro-max
- **Descripción**: Sistema de diseño en código: tokens de color semánticos (Modo Claro / Modo Oscuro), tipografía San Francisco monoespaciada para montos, tarjetas con contraste $\ge 4.5:1$ y botones con target mínimo de 44 pt.
- **Criterios de Aceptación**:
  - Cero colores hex quemados en componentes.
  - Soporte impecable a cambio de tema Claro/Oscuro sin parpadeos.
  - Formateador de moneda colombiana `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })`.
- **Archivos**: `src/ui/theme.ts`, `src/ui/components/MoneyText.tsx`, `src/ui/components/Card.tsx`.

### Tarea 5: Flujo Vertical: Pantalla Principal de Préstamos y Creación Rápida
- **Descripción**: Pantalla resumen con saldo total en calle, préstamos activos/vencidos y formulario de alta rápida de préstamo.
- **Criterios de Aceptación**:
  - Listado con tarjetas claras que indican deudor, saldo restante, próxima cuota y estado (Al día / En mora).
  - Feedback háptico al interactuar con acciones primarias.
- **Verificación**: Prueba en emulador / dispositivo y checklist de accesibilidad.
- **Archivos**: `src/ui/screens/LoansListScreen.tsx`, `src/ui/screens/CreateLoanScreen.tsx`.

---

## Checkpoint de Calidad y Seguridad (Definition of Done)
1. Cobertura de pruebas unitarias superior al 90% en la capa de cálculo financiero.
2. Auditoría de dependencias (`security-and-hardening`) sin vulnerabilidades críticas o altas.
3. Revisión de código bajo los 5 ejes (`code-review-and-quality`).
4. Verificación de diseño táctil (44 pt) y contraste de accesibilidad WCAG AA.
