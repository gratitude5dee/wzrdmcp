# WZRDMCP — Roadmap to 1B Transactions by Q4 2026

**Assumptions (explicit):**
- Scope = **1B cumulative transactions processed by Dec 31, 2026** **and** a Q4'26 monthly run-rate ≥ **120M tx/month** (≈ 46.3 TPS avg).
- Current date: **Oct 2025**; horizon ≈ 15 months.
- "Transaction" = any inbound model invocation (success or failure) reaching the model endpoint (counted once per request).
- Primary surfaces: API + SDKs + connectors + partner-run workloads.

## North-star & guardrails
- **Volume:** 1.0–1.2B cumulative tx, run-rate ≥ 120M/mo by Q4'26.
- **SLA:** 99.9% monthly; p95 latency ≤ 1.5s for text, ≤ 12s for first-frame video.
- **Gross Margin:** ≥ 65% blended by Q4'26 (via routing, reserved capacity, and caching).
- **Security/Compliance:** ACP-compliant, SOC 2 Type II by Q2'26; regional data residency options.

---

## Phased plan (timeline & targets)

| Phase | Dates | Volume target | Product / Platform | GTM / BizDev | Proof & KPIs |
|---|---|---:|---|---|---|
| **P0: Hardening & hooks** | Oct–Dec '25 | 50M cum | x402 cleanup; WZRDMCP telemetry; usage quotas; idempotency keys; SDKs (TS, Python); rate-limit tiering; cost attribution per slug | Revamp docs, examples, and quickstarts; design partner tiering | p95/p99 baselines; crash-free runs > 99.9%; MQL→AQL conversion ≥ 12% |
| **P1: PLG ignition** | Jan–Mar '26 | 200M cum | Self-serve projects, orgs, keys; workspace analytics; "recipes" (multi-model flows); fine-grained ACP roles | Launch with cloud marketplace listing(s); starter credits; hackathon series | MAUs ≥ 15k devs; 25% wk-4 activation; $/tx < plan |
| **P2: Scale rails** | Apr–Jun '26 | 500M cum | Multi-region routing; autoscaling pools; smart model routing (QoS + cost); cached responses & dedupe; async webhooks | SI partners onboard (3–5); co-sell plays; solution galleries | 60M/mo run-rate; 99.9% SLA; margin ≥ 58% |
| **P3: Distribution flywheel** | Jul–Sep '26 | 800M cum | Private endpoints; enterprise SSO/SAML; audit trails; data-residency; BYO-model; quota bursting | Strategic alliances (3 clouds / 6 ISVs); OEM deals in 2 verticals | 100M/mo run-rate; ≥ 12 lighthouse logos |
| **P4: Monetized scale** | Oct–Dec '26 | **1.0–1.2B** cum | Tiered QoS, reservations & committed use discounts; cost guardrails; anomaly credits | Renewal motion; reseller channels; packaged vertical SKUs | **≥ 120M/mo run-rate**; margin ≥ 65%; NRR ≥ 125% |

---

## Architecture & capacity checklist
- **Throughput:** Design for sustained **50–75 TPS** headroom (≥ 2× target) with burst 10× for 5 minutes.
- **Resilience:** Idempotent write paths; dead-letter queue for async jobs; bulkhead per model family.
- **Routing:** Policy-based: cost, latency, geography, availability; circuit breakers by slug.
- **Observability:** WZRDMCP spans for every `tx_id`; golden signals (R/L/Errors/Saturation) export to SIEM.
- **Data:** Redaction at edge; PII tagging; customer-held keys optional; exportable audit logs.
- **Compliance:** SOC2 II (Q2'26), ISO 27001 (Q3'26); DPA + SCCs; region pinning (US/EU at minimum).

---

## KPI tree (leading → north-star)
- **Top of Funnel:** site→signup CR, SDK installs, example runs per new user.
- **Activation:** "First success" within 24h, 3+ slugs tried week 1, keys created/org.
- **Engagement:** DAU of builders, weekly flows executed, projects with >1 environment.
- **Monetization:** ARB (avg rev per builder), commits, reserved capacity uptake.
- **Reliability:** SLA, error budget burn, cost per 1k tx, variance by slug.

---

## Risks & mitigations
- **Model supply volatility** → multi-vendor routing, pinned LTS variants, per-slug SLOs.
- **Cost spikes** → dynamic pricing bands, customer-side budgets, request coalescing/caching.
- **Security incidents** → ACP-by-default templates, secret scanning, automated key rotation.
- **Channel conflict** → clean rules of engagement with ISVs/SIs, MDF for co-sell.
