# Dashboard & Milestones

**Route:** `/dashboard` and `/dashboard/[id]`  
**Files:** `app/dashboard/page.tsx`, `app/dashboard/[id]/page.tsx`

The Dashboard is your command center — showing all active and completed contracts, milestone statuses, and fund positions in real time.

---

## Dashboard List (`/dashboard`)

![Dashboard — Contract List](../assets/screenshots/dashboard-list.png)

### What You'll See
- All contracts where your wallet is client or contractor
- Contract title, status badge, total value, creation date
- Progress indicator: milestones approved / total
- Quick link to each contract's detail page

### Empty State

![Dashboard — Empty State](../assets/screenshots/dashboard-empty.png)

If you have no contracts yet, two action buttons guide you through the right flow:
1. **Audit a Contract** → `/audit` *(start here — always audit before deploying)*
2. **Create Contract** → `/create`

---

## Contract Detail (`/dashboard/[id]`)

![Contract Detail — Overview Panel](../assets/screenshots/contract-detail.png)

### Contract Overview Panel
- Title, description, status badge
- Client and Contractor wallet addresses (clickable Solana Explorer links)
- Total value and locked USDC remaining in escrow
- Audit hash recorded on-chain (if provided at deployment)

---

## Milestone Workflow

```mermaid
sequenceDiagram
    participant C as Contractor
    participant UI as Dashboard
    participant AI as AI Verification
    participant CL as Client
    participant Sol as Solana

    C->>UI: Submit milestone evidence
    UI->>AI: POST /api/checkpoint\n{ contractSpec, evidenceText }
    AI-->>UI: { status, compliance_score, findings }
    UI-->>C: Show AI verdict

    alt APPROVED (score ≥ 80)
        UI-->>CL: Notify: milestone ready for approval
        CL->>UI: Click "Approve Release"
        UI->>Sol: approve_milestone transaction
        Sol-->>C: USDC released to contractor wallet ✓
    else NEEDS_REVISION (score 50–79)
        UI-->>C: Show required fixes
        C->>UI: Revise and resubmit
    else MAJOR_ISSUE (score < 50)
        UI-->>C: Show specific blockers
        UI-->>CL: Alert: evidence does not meet spec
    end
```

---

### As Contractor

![Milestone — Evidence Submission](../assets/screenshots/milestone-submit.png)

1. Complete the deliverable for the milestone
2. Click **Submit Evidence** on the milestone card
3. Paste links, file paths, screenshots, or a detailed description
4. Submit — AI verifies automatically within seconds

**AI Verification Result shows:**

![Milestone — AI Verification Result](../assets/screenshots/milestone-ai-result.png)

- Status badge: `APPROVED` / `NEEDS REVISION` / `MAJOR ISSUE`
- Compliance score (0–100)
- Specific approved items vs. required fixes

---

### As Client

![Milestone — Client Approval](../assets/screenshots/milestone-approve.png)

1. Review the submitted evidence and AI verdict
2. Click **Approve Release** when satisfied
3. Approve the Solana transaction in Phantom
4. USDC releases instantly to the contractor's wallet

---

## Fund Flow Visualization

```mermaid
flowchart LR
    CA["Client ATA\n(USDC)"]
    ESC["🔒 Contract Escrow PDA\n(USDC locked)"]
    CTA["Contractor ATA\n(USDC)"]

    CA -- "Deploy Contract\n(all funds)" --> ESC
    ESC -- "Approve Milestone\n(per milestone amount)" --> CTA

    style CA fill:#1a1a2e,stroke:#9945FF,color:#f0f0ff
    style ESC fill:#2d1b1b,stroke:#ff8800,color:#ffddcc
    style CTA fill:#0d1f1a,stroke:#14F195,color:#ccffee
```

> Funds in escrow are **not accessible** to the client, contractor, or ContractGuard until explicit on-chain approval.

---

## Contract Chat (Q&A)

![Contract Chat — Q&A Interface](../assets/screenshots/contract-chat.png)

On the contract detail page, the **Chat** tab lets you ask anything about the contract:

> *"Does this contract include a penalty clause for late delivery?"*  
> *"What are my IP rights under Clause 5?"*  
> *"Is this payment schedule fair for a 3-month project?"*

Powered by `/api/chat-contract` — answers are grounded in the actual contract text and the original audit analysis.
