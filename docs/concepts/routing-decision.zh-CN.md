[English](routing-decision.md) | 中文

# 路由决策

路由决策只定义一个入口问题：

> `main` 是否可以直接完成这个任务，还是必须进入 Multi-Agent 流程？

进入 Multi-Agent 流程之后，具体岗位路由由 `TEAM.md` 负责。本文件不决定具体召唤哪些 Agent。

## main 自处理边界

`main` 只能直接完成同时满足以下条件的任务：

```text
聊天 + 只读 + 非持久 + 低风险
```

允许直接处理的典型任务：

- 日常聊天、问候、解释概念、讨论想法或纯建议
- 总结已有上下文或整理已有结果
- 读取文件、查看状态、检索信息或其他只读检查
- 非持久性的计划、取舍分析或方案建议，但不修改文件、不提交、不发布、不改变 runtime 环境
- 用户明确要求快速/直接回答，且任务仍然保持只读、非持久、低风险

直接处理的任务不需要 shared task archive 或 routing record，除非范围扩大。

## 必须进入 Multi-Agent 的条件

只要命中以下任一条件，`main` 不得独立完成任务。任务必须进入 Multi-Agent 流程，然后由 `TEAM.md` 决定具体岗位路由。

必须进入的触发条件：

- 修改持久产物，包括代码、文档、脚本、测试、模板、配置、workflow 或项目协议
- 产生正式项目结果，包括 commit、tag、release、push、PR、changelog 或版本变更
- 影响 runtime 状态或运行环境，包括 OpenClaw runtime、Gateway、agent workspace、memory、sessions、state、cron、service、shell rc、路由、DNS 或网络行为
- 任务本身以审查、测试、验证、审计、风险评估或发布就绪判断为主要目标
- 产生可复用流程、模板、skill、SOP 或长期规则

只要命中任一触发条件，`main` 应把任务交给 Multi-Agent 流程，而不是自己独立完成。

## 用户 override 规则

用户要求快速或直接回答时，只有任务仍然保持只读、非持久、低风险，才允许跳过 Multi-Agent。

用户要求不能绕过持久产物、正式项目结果、runtime/环境变更、审查/测试/验证/审计/风险评估，或可复用长期流程的强制进入条件。

## 必需路由决策记录

当任务进入 Multi-Agent 流程并创建 shared task archive 时，创建或更新 `routing.md`，记录入口判断：

```text
Decision: direct | multi-agent
Why this decision:
Direct handling allowed: yes/no
Mandatory entry triggers:
User override:
Notes for TEAM.md routing:
```

直接处理的聊天、只读、非持久任务不需要 routing record。

## 重新路由

出现以下情况时，从 main 直接处理重新路由到 Multi-Agent 流程：

- 用户要求产出持久产物、commit、push、release 或可复用流程
- 工作从建议/只读检查变成实现
- 审查、测试、验证、审计、风险评估或发布就绪判断成为主要目标
- 可能影响 runtime 或环境状态
- 出现新风险或不确定性

重新路由后，由 `TEAM.md` 决定具体岗位路由。
