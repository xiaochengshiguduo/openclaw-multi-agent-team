# Routing Decision

Routing decisions define only one entry question:

> May `main` complete this task directly, or must the task enter the Multi-Agent workflow?

Concrete role routing after entry is owned by `TEAM.md`. This document does not decide which specific Agents should be summoned.

## Main self-handling boundary

`main` may directly complete only tasks that are all of the following:

```text
chat + read-only + non-durable + low-risk
```

Typical direct tasks:

- casual conversation, greetings, explanations, idea discussion, or advice
- summarizing existing context or existing results
- reading files, checking status, searching information, or other read-only inspection
- non-durable planning, tradeoff discussion, or recommendations that do not modify files, commit, publish, or change the runtime environment
- quick/direct answers requested by the user, only when the task remains read-only, non-durable, and low-risk

Direct tasks do not require a shared task archive or routing record unless the scope grows.

## Mandatory Multi-Agent entry

`main` must not complete a task independently if any condition below matches. The task must enter the Multi-Agent workflow, then `TEAM.md` decides concrete role routing.

Mandatory entry triggers:

- modifies durable artifacts, including code, docs, scripts, tests, templates, configs, workflows, or project protocols
- creates formal project outcomes, including commits, tags, releases, pushes, PRs, changelog entries, or version changes
- affects runtime state or environment, including OpenClaw runtime, Gateway, agent workspaces, memory, sessions, state, cron, services, shell rc files, routing, DNS, or network behavior
- is primarily review, testing, verification, audit, risk assessment, or release readiness
- produces reusable procedures, templates, skills, SOPs, or long-term rules

If any trigger matches, `main` should hand the work into the Multi-Agent workflow instead of completing it alone.

## User override rule

A user request for a quick or direct answer may bypass Multi-Agent only when the task still remains read-only, non-durable, and low-risk.

A user request cannot bypass mandatory entry for durable artifacts, formal project outcomes, runtime/environment changes, review/testing/verification/audit/risk assessment, or reusable long-term procedures.

## Required routing decision record

When a task enters the Multi-Agent workflow and creates a shared task archive, create or update `routing.md` with the entry decision:

```text
Decision: direct | multi-agent
Why this decision:
Direct handling allowed: yes/no
Mandatory entry triggers:
User override:
Notes for TEAM.md routing:
```

For direct chat/read-only/non-durable work, a routing record is not required.

## Re-routing

Re-route from direct handling into Multi-Agent workflow when:

- the user asks for a durable artifact, commit, push, release, or reusable procedure
- the work changes from advice/read-only inspection into implementation
- review, testing, verification, audit, risk assessment, or release readiness becomes the main goal
- runtime/environment state may be affected
- new risk or uncertainty appears

Once re-routed, let `TEAM.md` decide concrete role routing.
