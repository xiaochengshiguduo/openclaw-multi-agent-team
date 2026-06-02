English | [中文](README.zh-CN.md)

# Agent-to-Agent Example

`main` sends compact task briefs to role Agents. Role Agents return structured output to `main`.

Role Agents are internal by default: they should not bypass `main` to contact the user, perform external writes, or expose private runtime context.
