# Devnayan Dental Dashboard — End-to-End Test Cases

> All data is stored locally in `localStorage` under the `dentease.*` keys. No backend / database is required. Refreshing the browser preserves all CRUD changes for the lifetime of the browser storage.
>
> **Seed reset:** open browser DevTools → Application → Local Storage → delete the `dentease.*` keys → refresh to restore the demo seed (Aarav Patel, Diya Sharma, Virajsinh + 12 braces invoices, Dr. Chintan, Dr. Darshit, Dr. Sharma, etc.).
>
> Notation: every test starts at the URL noted under **Where**, follows the **Steps**, and is considered passing when the **Expected** outcomes are all observed.

---

## 0. Smoke / sanity (run first)

### 0.1 App loads
- **Where:** `/`
- **Steps:** Open `http://localhost:5173/`.
- **Expected:**
  - Dashboard renders with today's date in the header.
  - No console errors.
  - Sidebar visible on ≥`1280px` screens; bottom nav visible on `<1280px`.
  - Mobile header shows menu button (left), Devnayan logo (centre), search icon (right).

### 0.2 Global keyboard shortcut
- **Where:** any page.
- **Steps:** Press `Cmd + K` (Mac) or `Ctrl + K` (Windows).
- **Expected:** Global Search palette opens centred at `12vh` from top. Focus is in the input.

### 0.3 PWA / installable
- **Where:** any page.
- **Steps:** Look in Chrome address bar for an "Install" icon, or DevTools → Application → Manifest.
- **Expected:** Manifest is detected (`Devnayan Dental Clinic`), theme colour `#C8902B`, gold tooth icon. App is installable on supported browsers.

---

## 1. Dashboard (`/`)

### 1.1 Today's snapshot
- **Where:** `/`
- **Steps:** Look at the four cards in the top row.
- **Expected:**
  - "Today's Appointments" shows count of appointments whose `start` falls on today's calendar date.
  - "Today's Revenue" shows the sum of `paid` from invoices dated today (₹0 if none).
  - "New Patients (30d)" counts patients registered within the last 30 days.
  - "Low Stock Items" counts inventory rows where `stock ≤ minStock`. Clicking this card navigates to `/inventory`.

### 1.2 Quick action navigation
- **Where:** `/`
- **Steps:** Click each of: Book Appointment, Add Patient, New Invoice, Manage Doctors.
- **Expected:** Navigation lands on `/appointments`, `/patients`, `/billing`, `/doctors` respectively.

### 1.3 Smart insights are dynamic
- **Where:** `/`
- **Steps:**
  1. Note the "Smart Insights" tiles.
  2. Go to `/inventory` and edit an item so its stock < min stock (e.g. set stock to 0).
  3. Return to `/`.
- **Expected:** The "X items below minimum stock" tile now reflects the new count. Clicking "View inventory" navigates to `/inventory`.

### 1.4 Charts use live data
- **Where:** `/`
- **Steps:**
  1. Note the "Total Revenue · 12 mo" chart and number.
  2. Create a new invoice for ₹5000 with today's date and a partial payment of ₹2000.
  3. Return to dashboard.
- **Expected:** The monthly bar for the current month grew by ₹5000; the green "paid" line is up ₹2000; the "Outstanding" tile increased by ₹3000.

---

## 2. Appointments (`/appointments`)

### 2.1 Book new appointment
- **Where:** `/appointments`
- **Steps:**
  1. Click **Book Patient** in the header.
  2. Select a Patient (e.g. *Virajsinh DharmendraSingh Atodariya*). The Doctor auto-populates with the patient's assigned doctor (*Dr. Darshit Dhanani*).
  3. Pick a treatment (e.g. *Braces - Monthly Adjustment*).
  4. Set Date = today, Time = 14:30, Chair = Chair 1, Notes = "Demo entry".
  5. Click **Confirm Booking**.
- **Expected:**
  - Toast: *"Virajsinh DharmendraSingh Atodariya booked for Braces - Monthly Adjustment"*.
  - Calendar shows the event in Dr. Darshit's color (blue) at the correct time.
  - Mobile list view groups it under today's date.

### 2.2 Edit appointment
- **Where:** `/appointments`
- **Steps:**
  1. Click on an existing event (e.g. *Rohan Gupta · Root Canal* on Tuesday 2pm).
  2. In the panel, click **Edit Details**.
  3. Change Time to 15:00. Click **Save Changes**.
- **Expected:**
  - Toast: *"Appointment updated"*.
  - Event in calendar shifts from 2pm to 3pm.
  - The panel reopens with the updated time after save.

### 2.3 Delete appointment
- **Where:** `/appointments`
- **Steps:**
  1. Open any appointment.
  2. Click **Delete**.
  3. In confirm dialog, click **Delete**.
- **Expected:**
  - Confirm dialog shows the patient name + treatment + date.
  - Toast: *"Appointment deleted"*.
  - Event disappears from calendar / list.

### 2.4 Doctor filter
- **Where:** `/appointments`
- **Steps:**
  1. From the doctor dropdown, choose *Dr. Darshit Dhanani*.
- **Expected:**
  - Only Dr. Darshit's appointments remain.
  - Header subtitle reads "*Dr. Darshit Dhanani*".
  - Other doctors' events are hidden.
  - Color legend (multi-doctor) disappears (only one doctor).

### 2.5 Multi-view toggle
- **Where:** `/appointments`
- **Steps:** Click each of Day / Week / Month / Agenda in the toolbar.
- **Expected:** Calendar transitions through each view; events render correctly in each. Agenda view shows a list table.

### 2.6 Conflict resolution dialog
- **Where:** `/appointments`
- **Steps:**
  1. Ensure doctor filter is set to **All Doctors**.
  2. Book two appointments at the same time slot but for different doctors.
  3. Click on one of the overlapping events.
- **Expected:**
  - A "Multiple Overlapping Appointments" dialog opens listing both events with each doctor's avatar + initials.
  - Clicking a row opens that specific appointment's panel.
  - Closing the conflict dialog returns to the calendar without selection.

### 2.7 Today's WhatsApp reminders
- **Where:** `/appointments`
- **Steps:** Click **Today's Reminders** button in the toolbar.
- **Expected:**
  - If no upcoming today: info toast *"No upcoming appointments today"*.
  - If any exist: WhatsApp web links open (one tab per appointment, staggered 250ms apart) with a pre-filled reminder containing patient name, treatment, time, clinic.

### 2.8 PWA browser notification (manual)
- **Where:** `/appointments`
- **Steps:**
  1. Allow browser notifications when prompted.
  2. Book an appointment for ~10 minutes from now.
  3. Wait ≤1 minute.
- **Expected:** A system notification fires titled *"Upcoming: <Patient>"* with treatment + time + chair. Each appointment notifies at most once per session.

### 2.9 Booking dialog does NOT reopen on outside click
- **Where:** `/appointments`
- **Steps:**
  1. Click **Book Patient** to open the modal.
  2. Click on the dimmed area outside the modal.
- **Expected:** The dialog stays open. Closing is only possible via X, Cancel, or Escape. *(This was a previously reported bug.)*

---

## 3. Patients (`/patients`)

### 3.1 Add patient (two-step form)
- **Where:** `/patients`
- **Steps:**
  1. Click **Add Patient**.
  2. Fill Step 1: Name *Test Patient*, Phone *+91 99999 99999*, Age *30*, Gender *Female*, Address *Demo*, Medical Alerts *Penicillin Allergy*.
  3. Pick a Doctor from the new "Assigned Doctor" dropdown.
  4. Click **Continue** → review Step 2 → **Complete Registration**.
- **Expected:**
  - Toast: *"Test Patient registered"*.
  - Row appears at top of the table.
  - Subtitle increments patient count.
  - localStorage `dentease.patients` contains the new entry.

### 3.2 Open patient detail drawer
- **Where:** `/patients`
- **Steps:** Click any patient row (e.g. *Virajsinh*).
- **Expected:**
  - Right-side drawer opens with header, three tabs: Overview / Treatment History / Tooth Chart.
  - Edit (pencil) and Delete (trash) icon buttons appear in the header.
  - Outstanding Balance card shows the correct amount and a "Send payment link" action if `balance > 0`.

### 3.3 Edit patient
- **Where:** Patient drawer.
- **Steps:** Click pencil icon → modify any field (e.g. address) → **Save Changes**.
- **Expected:**
  - Toast: *"<Name> updated"*.
  - Drawer reflects new data.
  - localStorage updates.

### 3.4 Delete patient
- **Where:** Patient drawer or row hover.
- **Steps:** Click trash icon → confirm.
- **Expected:**
  - Confirm dialog explains permanence.
  - Toast: *"<Name> deleted"*.
  - Row vanishes; localStorage shrinks.

### 3.5 Tooth chart interaction
- **Where:** Patient drawer → Tooth Chart tab.
- **Steps:**
  1. Hover over a tooth.
  2. Click tooth #11 → in the dropdown, pick *Crown*.
  3. Click tooth #36 → pick *Filled*.
  4. Click tooth #18 → pick *Extracted*.
  5. Click a *braces*-tagged tooth (Virajsinh) → revert to *Healthy*.
- **Expected:**
  - Hover shows tooltip with quadrant + tooth name + condition.
  - Each click opens a categorised picker (Normal / Restoration / Pathology / Missing / Endodontics / Cosmetic / Orthodontic).
  - Tooth visual updates: crown turns gold, filled turns blue, extracted shows X overlay, braces show wire+bracket.
  - Selecting "Healthy" removes the entry from `teethConditions`.
  - All changes persist after closing/reopening the drawer.

### 3.6 Mobile alerts dark theme
- **Where:** Patient drawer for *Diya Sharma* (has *Penicillin Allergy, Asthma*).
- **Expected:** The medical alerts box uses a dark theme red — readable against the dark UI (previously was light theme red — fixed).

### 3.7 Filter by status + balance
- **Where:** `/patients`
- **Steps:** Pick *Active* + *Has Balance* in the two filters.
- **Expected:** Only active patients with `balance > 0` remain. Result count in toolbar matches the visible rows.

---

## 4. Billing (`/billing`)

### 4.1 New invoice with status preview
- **Where:** `/billing`
- **Steps:**
  1. Click **New Invoice**.
  2. Pick patient (doctor auto-fills).
  3. Pick treatment, set Amount=2000, Paid=1500.
- **Expected:**
  - "Status preview" box appears at the bottom of the form, shows "Partial" with balance ₹500.
  - Submit → toast *"INV-NNN created"*.
  - Row appears in table; stat cards (Total Revenue / Collected / Pending / Overdue) recompute.

### 4.2 View full invoice template
- **Where:** `/billing`
- **Steps:**
  1. Click any invoice row to open the drawer.
  2. Click **View Full**.
- **Expected:**
  - Full-screen overlay opens showing a printable invoice (white paper).
  - Includes clinic letterhead, INV-id, patient details, doctor details, treatment line item, totals, UPI box if balance > 0, signature line with doctor name.

### 4.3 Print invoice
- **Where:** Full invoice modal.
- **Steps:** Click **Print**.
- **Expected:** Browser print dialog opens. The print preview shows only the invoice paper (no app chrome). CSS `@page` margin is 12mm.

### 4.4 Share invoice via WhatsApp
- **Where:** Invoice drawer or Full Invoice modal.
- **Steps:** Click **WhatsApp** (drawer) or **Share** (full).
- **Expected:** New tab opens to `wa.me/<phone>?text=...` with a multi-line message including INV-id, treatment, totals, balance, and UPI ID if outstanding.

### 4.5 UPI payment flow — happy path
- **Where:** Billing — any invoice with balance > 0 (e.g. INV-002 / Diya Sharma).
- **Steps:**
  1. Open drawer → click **Take Payment (₹2,500)** (or hover row → Wallet icon).
  2. Pick **UPI**.
  3. Confirm the QR is showing the UPI ID `chintansayania@okhdfcbank` (or whichever doctor) and the amount.
  4. Edit amount if desired, click **Payment Done**.
  5. Pick **Share** to send the receipt on WhatsApp, or **Done**.
- **Expected:**
  - QR image renders from `api.qrserver.com`.
  - **Copy UPI ID** + **Open UPI App** buttons work (clipboard + `upi://pay?…`).
  - On Done: invoice's `paid` increases; status auto-derives (Paid / Partial); drawer reflects the new balance.
  - Toast *"₹X recorded as UPI"*.

### 4.6 UPI payment flow — cash
- **Where:** Billing — any invoice with balance.
- **Steps:** Take Payment → **Cash** → enter amount → **Mark Paid**.
- **Expected:** Same as UPI path but skips the QR step.

### 4.7 Payment with missing UPI ID
- **Where:** A doctor in localStorage has no UPI ID.
- **Steps:** Try to **Take Payment** → **UPI**.
- **Expected:** Error toast *"No UPI ID on file for <doctor>. Add one in the Doctors page."* (Cash path still works.)

### 4.8 Filter & search invoices
- **Where:** `/billing`
- **Steps:** Search "INV-V01" then "Virajsinh". Filter by Paid / Partial / Unpaid.
- **Expected:** Table filters by both `id` and `patient` substring + status filter. Result counts match.

### 4.9 Delete invoice
- **Where:** Billing.
- **Steps:** Hover row → trash icon → confirm.
- **Expected:** Confirm dialog describes the invoice; on confirm, row disappears and stat cards re-aggregate.

---

## 5. Inventory (`/inventory`)

### 5.1 Add item
- **Where:** `/inventory`
- **Steps:** **Add Item** → fill Name, Category (Consumables/Materials/Medicines/…), Stock=20, Min Stock=5, Unit=boxes, Price=300, Date.
- **Expected:** Toast success, row appears at top, stat cards reflect new totals.

### 5.2 Low stock highlighting
- **Where:** `/inventory`
- **Steps:** Edit an item so `stock ≤ minStock`.
- **Expected:** Row gets red Package icon, "Low Stock" badge, stock value in red. Stat card "Low Stock" increments. Drawer shows a red alert banner.

### 5.3 Filter by category
- **Where:** `/inventory`
- **Steps:** Use category filter (custom dropdown — no native `<select>`).
- **Expected:** Table filters; "All Categories" shows everything.

### 5.4 Edit and delete
- **Where:** Inventory drawer.
- **Steps:** Edit pencil to modify; trash to delete (confirm).
- **Expected:** Both flows reflect immediately; localStorage updates.

---

## 6. Doctors (`/doctors`)

### 6.1 Demo data verification
- **Where:** `/doctors`
- **Steps:** Inspect default doctors.
- **Expected:** Three cards present:
  - *Dr. Chintan Sayania* (Primary, gold) — UPI `chintansayania@okhdfcbank`.
  - *Dr. Darshit Dhanani* (Orthodontist, blue) — UPI `dhananidarshit41-1@okhdfcbank`.
  - *Dr. Sharma* (Periodontist, emerald) — UPI `drsharma@okaxis`.

### 6.2 Add doctor
- **Where:** `/doctors`
- **Steps:** **Add Doctor** → fill all fields; pick color *Rose*; submit.
- **Expected:** New card appears with rose-coloured avatar. Patients/Invoices/Revenue tiles initialise to 0.

### 6.3 Edit doctor → primary swap
- **Where:** Doctor card → pencil.
- **Steps:** Edit a non-primary doctor; tick "Mark as primary doctor"; save.
- **Expected:** Only one doctor remains primary at a time; previous primary loses the star. Sidebar default doctor (used for new patients) reflects the change.

### 6.4 UPI copy to clipboard
- **Where:** Doctor drawer.
- **Steps:** Click the UPI box.
- **Expected:** Toast *"UPI ID copied"* and clipboard contains the UPI ID.

### 6.5 Call / WhatsApp shortcuts
- **Where:** Doctor card or drawer.
- **Steps:** Click **Call** or **WhatsApp**.
- **Expected:** Phone dialer (`tel:`) or WhatsApp web opens with the doctor's number.

### 6.6 Patient/invoice counts auto-aggregate
- **Where:** `/doctors`
- **Steps:** Note counts; assign a new patient to *Dr. Darshit*; refresh `/doctors`.
- **Expected:** Patient count for that doctor increments. Same for invoice & revenue when a new invoice is created with that doctor.

---

## 7. Doctor ↔ Patient ↔ Invoice linkage

### 7.1 Assigned doctor follows the patient
- **Where:** `/billing` → New Invoice.
- **Steps:** Select patient *Virajsinh*.
- **Expected:** Doctor field auto-populates to *Dr. Darshit Dhanani* (patient's assigned doctor).

### 7.2 Same in booking
- **Where:** `/appointments` → Book Patient.
- **Steps:** Select patient *Virajsinh*.
- **Expected:** Doctor dropdown switches to *Dr. Darshit*.

### 7.3 Virajsinh's invoice history is intact
- **Where:** `/billing`, search "Virajsinh".
- **Expected:** 12 invoices `INV-V01` … `INV-V12`, each ₹2,500 on the 3rd Thursday of months April 2025 → March 2026, all marked Paid. Total = ₹30,000.

---

## 8. Global Search (`Cmd+K`)

### 8.1 Cross-entity search
- **Where:** anywhere.
- **Steps:** Press `Cmd+K`; type `virajsinh`.
- **Expected:** Results grouped by Patients, Appointments, Invoices, Inventory, Doctors with relevant matches.

### 8.2 Keyboard navigation
- **Steps:** Arrow Up / Down moves selection; Enter activates; Esc closes.
- **Expected:** Selected row gets `bg-bg-body`; pressing Enter navigates to that entity's section.

### 8.3 Empty/no results
- **Steps:** Open palette with empty input → shows placeholder. Type random string → "No matches for …".

---

## 9. Mobile bottom nav

### 9.1 Primary destinations
- **Where:** any page, viewport < 1280px.
- **Steps:** Tap each of Home, Calendar, Patients, Billing.
- **Expected:** Each navigates with the active indicator bar (gold underline) animating between items.

### 9.2 More drawer
- **Steps:** Tap **More**.
- **Expected:** Bottom sheet slides up showing Inventory / Doctors / Help in a 3-column grid; tapping any item navigates and closes the sheet. Tapping the dimmed area also closes it.

---

## 10. CRUD persistence (cross-cutting)

### 10.1 Reload preserves changes
- **Where:** any page.
- **Steps:** Add a patient → refresh page → return to `/patients`.
- **Expected:** New patient still listed. `dentease.patients` in localStorage contains the JSON.

### 10.2 Clearing storage restores seed
- **Where:** DevTools.
- **Steps:** Delete `dentease.*` keys → refresh.
- **Expected:** All data returns to the original seed (mock patients, demo invoices, etc.).

---

## 11. Visual / consistency

### 11.1 No native UI controls
- **Where:** any page.
- **Expected:** No HTML `<select>` elements visible; all dropdowns use the custom `Select` component (consistent dark styling).

### 11.2 No light-theme bleed
- **Where:** any drawer / modal (Patient, Invoice, Inventory, Doctor).
- **Expected:** All surfaces are dark; status badges use `bg-*-900/30` variants; the only intentionally-white surface is the printable invoice template at `/billing` → View Full.

### 11.3 White button bug fixed
- **Where:** Dashboard top-right, Patients top-right, Appointment panel footer.
- **Expected:** Action buttons use gold (`bg-primary`), never near-white.

### 11.4 Booking dialog protection
- **Where:** Any add/edit modal.
- **Steps:** Click outside on the dimmed overlay.
- **Expected:** Modal does NOT close (prevents accidental data loss). Closing only via X / Cancel / Escape.

---

## Pass / Fail criteria

A run passes when **every** test above reports its expected result with no console errors and no broken navigation. Record fails as: *test id · which step · observed result · screenshot if relevant*.
