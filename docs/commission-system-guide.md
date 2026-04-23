# Commission System Guide

> **Audience:** Administrators and developers integrating with the MLS backend.
> **Scope:** A complete overview of how commissions are calculated, structured, and applied to shipping rates in the Momentum Logistics Service (MLS).

---

## 1. Overview of the Commission Engine

The MLS Pricing Engine takes the raw price quoted by a carrier (e.g., FedEx or DHL) and applies a markup before presenting the final price to the customer.

This markup system is designed to ensure profitability while remaining flexible, supporting both **percentage-based** markups and **minimum flat-fee** safety nets.

There are two distinct halves to the commission system:

1. **Stage-Based Commissions (Percentage/Fixed Additions):** Applied on standard shipments.
2. **Hierarchical Minimum Thresholds (Flat Minimums):** A safety net that overrides the stage-based commission if a shipment's value is too low.

---

## 2. Stage-Based Commissions

Every shipment route is categorized into one of four "Stages" based on the origin and destination countries. You configure these rules per carrier.

### The Four Stages

1. **Local:** The origin and destination are both Poland (`PL` to `PL`).
2. **Export:** Origin is Poland, but destination is international (`PL` to `US`).
3. **Import:** Origin is international, but destination is Poland (`US` to `PL`).
4. **International:** Neither origin nor destination is Poland (`US` to `DE`).

### How It Works

For each stage, you can set a rule type:

- **PERCENT (Most Common):** Adds a percentage markup to the raw carrier price.
  _(Example: `10%` added to a 1,000 PLN quote = 1,100 PLN final price)._
- **FIXED:** Adds a static amount to the quote, regardless of the shipment's base price.
  _(Example: `100 PLN` fixed fee added to a 1,000 PLN quote = 1,100 PLN final price)._

---

## 3. Hierarchical Minimum Thresholds (The Safety Net)

Percentage commissions fail to generate meaningful profit on very cheap, low-weight shipments. To fix this, MLS includes a robust **Minimum Threshold System**.

### How It Works

If a quote from a carrier falls _at or below_ a set "Threshold", the system discards the percentage commission and instead adds a "Flat Commission".

_Example:_

- **Base Rate Threshold:** 300 PLN
- **Flat Minimum Commission:** 50 PLN
- **Carrier Quote:** 200 PLN
- **Result:** 200 PLN is below 300 PLN. A flat 50 PLN is added. The customer pays 250 PLN.

### The 3-Tier Hierarchy

To give you maximum control, you can define minimum thresholds at three different levels of specificity. The system evaluates them in strict order, stopping at the most specific matching rule:

1. **Route-Specific (Most Specific):** You can set a unique minimum exclusively for a specific stage on a specific carrier.
   _(Example: FedEx Export shipments under 500 PLN get a flat 100 PLN fee)_
2. **Carrier Fallback:** If no route-specific rule is defined, the system falls back to a general minimum for that entire carrier.
   _(Example: All FedEx shipments under 300 PLN get a flat 50 PLN fee)_
3. **Global Fallback (Least Specific):** If the carrier has no rules defined at all, the engine relies on a universal safety net.
   _(Example: Any shipment across the entire platform under 200 PLN gets a flat 40 PLN fee)_

---

## 4. Multi-Currency & Auto-Conversion

MLS supports seamless, multi-currency operations for minimum thresholds, primarily handling Polish Złoty (PLN) and Euros (EUR).

### The "Define Once" Approach (Auto-Conversion)

As an admin, **you only strictly need to define your minimum thresholds in PLN**.

If a customer is creating an international shipment that is quoted in Euros, the Pricing Engine does the heavy lifting:

1. It detects that the EUR threshold fields are blank.
2. It talks to the `CurrencyService` cache.
3. It instantly checks the live, real-time exchange rate to convert your PLN threshold into Euros.
4. It applies the equivalent flat Euro commission.

_(Example: You set a 300 PLN minimum threshold. The user gets a €60 quote. The system checks the live rate, sees 300 PLN ≈ €68. Since €60 is below €68, it converts your 50 PLN flat fee to ~€11 and adds it on the fly)._

### The "Manual Override" Toggle

Sometimes exchange rates fluctuate too wildly, and you want rigid math. Every level in the hierarchy has an **"Auto-calculate EUR based on PLN"** toggle.

If you turn off auto-calculation (setting the manual override flag to `true`), you must manually type exactly what the Euro threshold and Euro fee should be. Auto-conversion is disabled entirely for that specific rule tier.

---

## 5. API Reference for Administrators

The Admin Dashboard interacts with these rules via the following endpoints:

#### Stage-Based & Carrier Fallbacks

- `GET /api/admin/settings/commission/:carrierId` - Fetch all route percentages, route-specific minimums, and carrier fallback minimums.
- `PUT /api/admin/settings/commission/:carrierId` - Update those settings.

#### Global Fallback

- `GET /api/admin/settings/global-commission` - Fetch the universal safety net minimum.
- `PUT /api/admin/settings/global-commission` - Update the universal safety net minimum.

#### Payload Structure Example (Carrier Update)

```json
{
  // 1. Route-Specific Override (Export)
  "exportMinRatePln": 500,
  "exportMinFlatPln": 100,
  "isExportEurManual": true, // Manual toggle IS ON for Export
  "exportMinRateEur": 115, // Manually typed EUR threshold
  "exportMinFlatEur": 25, // Manually typed EUR fee

  // 2. Carrier Fallback (Applies to all other routes for this carrier)
  "minRateThresholdPln": 300,
  "minFlatCommissionPln": 50,
  "isEurManual": false // Manual toggle IS OFF. Let the engine auto-convert.
}
```

_Note: If a manual EUR toggle (`isEurManual`, `isExportEurManual`, etc.) is set to `true`, the corresponding EUR value fields become explicitly **required** by the API._
