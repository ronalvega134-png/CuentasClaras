# Relational Database Schema & Data Architecture (CuentasClaras)

```mermaid
erDiagram
    CONTACT ||--o{ LOAN : "solicita"
    LOAN ||--o{ INSTALLMENT : "contiene"
    LOAN ||--o{ PAYMENT : "recibe"
    PAYMENT ||--o{ PAYMENT_ALLOCATION : "desglosa en"
    INSTALLMENT ||--o{ PAYMENT_ALLOCATION : "cubierta por"

    CONTACT {
        string id PK "UUID v4"
        string full_name "Nombre y Apellidos"
        string phone "Teléfono celular (ej. +57 300...)"
        string document_id "Cédula o NIT (Opcional)"
        string notes "Notas de referencia / dirección"
        datetime created_at "Timestamp ISO8601"
        datetime updated_at "Timestamp ISO8601"
    }

    LOAN {
        string id PK "UUID v4"
        string contact_id FK "Referencia a CONTACT"
        integer principal_cop "Monto inicial prestado en COP (entero)"
        string interest_type "SIMPLE | COMPOUND | FIXED_PERCENT | DAILY_FIXED"
        integer interest_rate_basis_points "Tasa en puntos básicos (ej: 500 = 5.00%)"
        string frequency "DAILY | WEEKLY | BIWEEKLY | MONTHLY"
        integer total_installments "Número total de cuotas acordadas"
        date start_date "Fecha de desembolso"
        date due_date "Fecha límite estimada de finalización"
        string status "ACTIVE | IN_ARREARS | PAID | DEFAULTED"
        integer late_fee_basis_points "Tasa de mora o recargo diario"
        string notes "Condiciones o garantías acordadas"
        datetime created_at "Timestamp"
        datetime updated_at "Timestamp"
    }

    INSTALLMENT {
        string id PK "UUID v4"
        string loan_id FK "Referencia a LOAN"
        integer installment_number "Número de cuota (1, 2, ...)"
        date due_date "Fecha de vencimiento de la cuota"
        integer expected_principal_cop "Capital programado para esta cuota"
        integer expected_interest_cop "Interés programado para esta cuota"
        integer total_due_cop "Suma de capital + interés esperado"
        string status "PENDING | PARTIALLY_PAID | PAID | OVERDUE"
        datetime paid_at "Fecha en que se completó el pago"
    }

    PAYMENT {
        string id PK "UUID v4"
        string loan_id FK "Referencia a LOAN"
        integer amount_paid_cop "Valor total abonado en COP"
        datetime payment_date "Fecha y hora del recaudo"
        string payment_method "CASH | NEQUI | DAVIPLATA | BANK_TRANSFER"
        string receipt_number "Folio correlativo visible"
        string notes "Observaciones del pago"
        datetime created_at "Timestamp"
    }

    PAYMENT_ALLOCATION {
        string id PK "UUID v4"
        string payment_id FK "Referencia a PAYMENT"
        string installment_id FK "Referencia a INSTALLMENT (Opcional)"
        integer principal_applied_cop "Monto abonado a reducción de capital"
        integer interest_applied_cop "Monto abonado a intereses generados"
        integer late_fee_applied_cop "Monto abonado a cargos por mora"
    }
```

## Reglas de Integridad y Consistencia
1. **Regla de Caja**: `PAYMENT.amount_paid_cop == sum(PAYMENT_ALLOCATION.principal_applied_cop + interest_applied_cop + late_fee_applied_cop)`.
2. **Prioridad de Cascada de Pagos**:
   - Primero se cubren los cargos de mora pendientes.
   - Segundo se cancelan los intereses corrientes vencidos de la cuota más antigua.
   - Tercero el excedente amortiza directamente al capital (`principal`).
3. **Estado del Préstamo**: Si la fecha actual supera `INSTALLMENT.due_date` y el balance de cuota pendiente es $> 0$, el préstamo pasa automáticamente al estado `IN_ARREARS` (En Mora).
