# How Forge OS works — a walkthrough

Written because the screens do not yet explain themselves well enough. That is
a fault in the screens, not in the reader. Until it is fixed, this is the map.

---

## The one idea

**Events are the only thing that can change manufacturing state. Every screen
derives what it shows from the same event log.**

That single rule is why the system behaves like an operating system instead of
a set of pages:

- No screen stores manufacturing state. Not one.
- When you act, an event is published to a shared log.
- Every screen re-derives its picture from that log.
- So a decision made in one room appears in the others without them being told,
  without a refresh, and without any screen sending a message to another.

If you remember nothing else: **rooms read, events write.**

---

## The 60-second demonstration

Do this in order and the whole architecture is visible.

### 1. Open `/engineering` — the Engineering Bay

You will see four specifications. `FTT-CR-001` is a chassis rail drawing.

Look at the **lifecycle strip**:

```
DRAFT → REVIEW → APPROVED → RELEASED → DEPRECATED
```

- the **amber, glowing** state is where the document is *now*
- **teal, illuminated** states are where it may go *next*
- **dimmed** states are unreachable from here

Below it, "Impossible from review" lists transitions that exist in the
lifecycle but are not legal right now. That is the system telling you what it
will refuse.

### 2. Try to approve it as the wrong person

The **Acting as** row has three engineers. Ngozi Bello *authored* `FTT-CR-001`.

Select **Ngozi Bello**, then press **Approve for manufacture**.

It is refused:

```
MANUFACTURING CONSTRAINT
A specification may not be approved by the engineer who authored it.
Rule ENG-001
```

That is not a form validation message. It is a manufacturing rule with a
number you could quote in a meeting.

### 3. Try as someone under-qualified

Select **Tunde Bakare** (engineering-level-2). Approve again.

```
MANUFACTURING CONSTRAINT
Approval for manufacture requires a level 3 engineering competency.
Rule ENG-003
```

Two different refusals, two different reasons. The room contains none of this
logic — it asks the kernel and displays the answer.

### 4. Now do it properly

Select **Folake Adeyemi** (level 3, did not author it). Press **Approve for
manufacture**.

The right-hand panel shows three layers:

```
EVENT        engineering.specification.approved
CONSEQUENCE  FTT-CR-001    review → APPROVED
DECISION     Forge OS recommends: FTT-CR-001 may now be released
```

- **Event** — what happened
- **Consequence** — what changed as a result
- **Decision** — what the system thinks should happen next

Recording is not coordinating. The third line is the difference.

Now press **Release for production**.

### 5. Watch the operating system react — without leaving the room

Scroll to **Operating system response**. Mission progress bars and
recommendations are already updated. The recommendation now reads:

```
Production may begin against FTT-CR-001.
  Specification FTT-CR-001 has entered "released" state.
  Engineering constraints satisfied — ENG-001 and ENG-003 passed at approval.
  Rule SPC-001 is satisfied: the specification is released.
  Missions depending on FTT-CR-001 are unlocked for production.
```

Those four lines are the **reason**. The system explains itself rather than
asking to be trusted.

### 6. Go to `/control` — the Operations Centre

You did not tell this room anything. It has:

- **Released specs** count increased by one
- the same **"Production may begin"** recommendation, with the same reasons
- the event in the **Operations feed**, written for a person:
  `Specification approved / FTT-CR-001 / Folake Adeyemi`

### 7. Go to `/grid` — the National Manufacturing Grid

Same event, third view. Released specs is up here too.

**Three rooms, one decision, nothing passed between them.** They all folded the
same log.

---

## How to read each screen

### Engineering Bay `/engineering`
Where controlled documents live. Its principle: *nothing is manufactured
against an unapproved specification.* Every action passes four gates —
is the record complete, may this actor act, does the domain permit it, does the
document's state allow the transition.

### Operations Centre `/control`
The national operating picture. **Situation** across the top, then decisions
with reasons, components in flight, missions, network, and the shared feed.
System health is weighted — one faulted machine does not make a nation critical.

### National Manufacturing Grid `/grid`
National capability. Every figure is counted from the log. Where nothing is
known it says **"Not surveyed"** rather than showing 0 — an unknown quantity
silently becoming zero is how government software misleads people.

### Language Studio `/language`
Real translation coverage counted from the dictionaries. English, French,
Hausa, Igbo, Pidgin and Yoruba are complete at 45 strings. **Urhobo is at 15**,
so it names the exact 30 keys still needed — that list is a work queue.

---

## Vocabulary

**Specification states** — draft, review, approved, released, deprecated

**Component states** — planned, manufacturing, inspection, rework, assembly,
completed, installed, retired (plus blocked, scrapped, cancelled)

**Rule codes** — quotable, like a standard:

| Code | Constraint |
|---|---|
| ENG-001 | An author may not approve their own specification |
| ENG-003 | Approval requires level 3 engineering competency |
| ENG-005 | A revision must state what it supersedes |
| SPC-001 | Nothing manufactured against an unreleased specification |
| ASM-001 | Nothing enters assembly until inspection passes |
| MCH-002 | No work booked to a faulted machine |
| PV-002 | Pressure vessels require an ASME-certified workshop |
| QC-001 | Inspection requires a verified inspector competency |
| QC-003 | Safety-critical components require a level 3 inspector |
| QC-004 | The producer may not inspect their own work |
| QC-007 | Measurements require an in-calibration instrument |

**Colour** — teal is alive and healthy. Amber is in transition or pending.
Pink is attention: a constraint, a halt, a fault. Pink is rare on purpose.

---

## Why the honesty labels

**"Demo mode · seed data · not operational"** — the activity is seeded so the
screens are not empty. It stops the moment real events arrive.

**"Not surveyed"** — no one has counted this yet. It is not zero.

Forge OS is government-facing. A fabricated number presented as fact is the
one failure that would cost the platform its credibility, so the system says
what it does not know.

---

## What is deliberately not built yet

- Six rooms are not yet converged: ArrivalDock, Rooms, DemoStudio,
  ArrivalMasthead, FactoryFloor, LanguageRuntime
- Publishing Studio — foundation only
- The registry: `machine + component` events are still classed as MACHINE
- Identity: the migration in `supabase/migrations/002_identity.sql` has not
  been run, so registration is not live
