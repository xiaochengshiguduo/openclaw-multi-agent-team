English | [中文](routing-decision.zh-CN.md)

# Routing Decision

Routing decisions explain when `main` should work directly, when one specialist should assist, and when a durable multi-agent task archive is required.

`main` owns routing. Role Agents may recommend escalation or simplification, but they do not bypass `main` or talk to users directly unless explicitly authorized.

## Routing levels

```text
Level 1: main direct
Level 2: main + one specialist Agent
Level 3: main creates shared/tasks and coordinates multiple Agents
Level 4: high-risk overlay requiring security/devops/reviewer participation
```

Level 4 is an overlay, not a replacement for Level 1-3. If a task is high risk, add the required reviewers even when the implementation looks small.

## Level 1: main direct

Use Level 1 when the task is simple, bounded, and low risk.

Typical signals:

- Simple questions or explanations
- One-step checks
- Small single-file edits
- Low-risk local inspection
- Urgent operational actions where central control matters
- User explicitly asks for a quick direct answer

Required roles:

- `main`

Task archive:

- Not required.

Routing record:

- Not required unless the task grows beyond the original scope.

## Level 2: main + one specialist Agent

Use Level 2 when the task is still bounded, but one expert view would improve correctness.

Typical signals:

- One primary domain owns the work
- A quick expert review is useful
- The task does not need durable archive coordination
- The expected output is a recommendation, review, or small focused change

Common pairings:

| Signal | Specialist |
|---|---|
| Requirements or acceptance boundaries | `pm` |
| Architecture or tradeoffs | `architect` |
| Server/API/data logic | `backend` |
| UI/client interaction/state | `frontend` |
| Test strategy or regressions | `qa` |
| Maintainability review | `reviewer` |
| Secrets, auth, command, file, or network risk | `security` |
| Runtime, CI, services, SSH, systemd, cron, or healthchecks | `devops` |
| Documentation or handoff quality | `docs` |
| External research or option comparison | `research` |

Task archive:

- Usually not required.

Routing record:

- A short explanation in the final handoff is enough unless the task escalates.

Escalate to Level 3 if the specialist finds cross-role work, long-running coordination, or missing acceptance criteria.

## Level 3: multi-agent archived

Use Level 3 when the task needs durable coordination across multiple roles.

Typical signals:

- Three or more roles are needed
- The work spans design, implementation, testing, and review
- Multiple files, modules, systems, or docs must change together
- The task needs a durable source of truth under `shared/tasks`
- Parallel investigation or independent review is valuable
- The user explicitly asks for multi-agent handling

Required roles:

- `main` always owns delivery and user communication
- Select role Agents according to the role matrix below

Task archive:

- Required under `shared/tasks/TASK-YYYYMMDD-HHMM-slug/`

Required minimum files:

```text
metadata.md
routing.md
status.md
brief.md
plan.md
final.md
```

Add role files as needed, such as `pm.md`, `architecture.md`, `qa.md`, `review.md`, `security.md`, `devops.md`, `docs.md`, or `research.md`.

Routing record:

- Required in `routing.md` before execution, then updated if the level or selected Agents change.

## Level 4: high-risk overlay

Use Level 4 whenever the task touches high-risk boundaries. Level 4 can apply to Level 1, Level 2, or Level 3 work.

Mandatory participants:

- `security` for secrets, auth, privacy, command/file/network risk, external writes, or data exposure
- `devops` for runtime, Gateway, SSH, systemd, cron, firewall, CI/CD, deployment, or service changes
- `reviewer` for maintainability, rollback, and final sanity review

High-risk triggers:

- Secrets, tokens, credentials, private configs, or memory/session data
- Authentication, authorization, network exposure, or firewall changes
- Destructive commands or irreversible writes
- OpenClaw Gateway/runtime/model/provider/scheduler configuration
- systemd, crontab, nginx, SSH, DNS, CI/CD, deployment, or release changes
- External writes such as sending messages, publishing, pushing, opening PRs, or changing public resources
- Production data, privacy-sensitive files, or user-owned transcripts

Task archive:

- Required when the high-risk work is non-trivial, long-running, or affects shared systems.
- For small urgent fixes, `main` may act directly only after preserving safety boundaries and documenting the decision in the final handoff.

## Scoring rubric

Use this rubric for non-trivial work. It is a guide, not a substitute for safety judgment.

| Dimension | 0 | 1 | 2 |
|---|---|---|---|
| Complexity | One step | Several steps | Design + implementation + validation |
| Impact | Single answer/file | Multiple files | Multiple modules/systems |
| Roles | `main` only | `main` + one specialist | Three or more roles |
| Risk | Low | Reversible | Security/external/production risk |
| Durability | No record needed | Brief handoff | Task archive needed |
| Uncertainty | Clear | Some unknowns | Research/clarification needed |

Suggested mapping:

```text
0-2 points: Level 1
3-5 points: Level 2
6+ points: Level 3
Any high-risk trigger: add Level 4 overlay
```

## Role selection matrix

| Task signal | Select |
|---|---|
| Requirements, scope, acceptance criteria | `pm` |
| Architecture, module boundaries, long-term tradeoffs | `architect` |
| Server/API/data/script logic | `backend` |
| UI, client behavior, interaction/state | `frontend` |
| Test plan, acceptance, regression coverage | `qa` |
| Maintainability, code review, consistency | `reviewer` |
| Secrets, auth, privacy, command/file/network risk | `security` |
| Runtime, services, CI, deployment, SSH, systemd, cron | `devops` |
| README, guides, bilingual docs, final handoff | `docs` |
| External research, prior art, option comparison | `research` |
| User communication, routing, final delivery | `main` |

## User override rules

- If the user explicitly asks for multi-agent handling, route to Level 3 unless a narrower safe interpretation is confirmed.
- If the user explicitly asks for a quick direct answer, prefer Level 1 unless risk requires Level 4.
- If user instructions conflict with safety boundaries, pause and ask or refuse the unsafe part.
- `main` must not use role Agents to bypass approval, privacy, or external-write rules.

## Required routing decision record

For Level 3 and non-trivial Level 4 work, create or update `routing.md` with:

```text
Decision level:
Mode:
Why this level:
Score:
High-risk triggers:
Selected Agents:
Not selected:
Escalation conditions:
User override:
```

For Level 2 work, a short final explanation is enough unless the work escalates.

## Re-routing

Re-route when:

- New risks appear
- A specialist reports the task is broader than expected
- Acceptance criteria change
- The task becomes long-running
- External writes or production changes become necessary

When re-routing, update `routing.md` if a task archive exists, then tell the user when the change affects scope, timeline, risk, or approvals.
