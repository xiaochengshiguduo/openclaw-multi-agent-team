# 子 Agent 架构

OpenClaw 原生的 subagent announce 链支持稳定的多 agent 编排，具有嵌套深度层级。

## 架构概览

```
用户 ↔ main (depth-0, 面向用户的入口)
         ↓ sessions_spawn
    编排者 (depth-1, 可选协调者)
         ↓ sessions_spawn
    工作者 (depth-2, 专业角色)
         ↓ announce (deliver=false, 内部注入)
    编排者综合结果
         ↓ announce
    main 整合
         ↓ deliver
    用户接收最终结果
```

## 核心原则

**1. 通过 announce 链实现稳定的结果流转**

- 工作者（depth-2）结果使用 `deliver=false` 内部注入给编排者
- 不依赖有轮数限制的 ping-pong 消息传递
- 推送式完成事件，无需轮询

**2. 工作者不刷屏 Telegram**

- 只有 main（depth-0）向用户的 Telegram 交付
- 工作者结果在编排者或 main 综合前保持内部

**3. 可配置的编排方式**

- 简单任务：main 直接派生工作者（depth-1）
- 复杂任务：main 派生编排者 → 编排者派生工作者（depth-2）

## 配置

在 `~/.openclaw/openclaw.json` 中添加：

```json5
{
  "agents": {
    "defaults": {
      "subagents": {
        "maxSpawnDepth": 2,          // 启用嵌套编排者模式
        "maxChildrenPerAgent": 6,    // 限制每个编排者的扇出数
        "maxConcurrent": 8,          // 并发子 agent 运行总数
        "delegationMode": "suggest"  // 提示指导
      }
    },
    "list": [{
      "id": "main",
      "subagents": {
        "allowAgents": ["pm", "architect", "backend", "frontend", "qa", "reviewer", "security", "devops", "docs", "research"],
        "delegationMode": "prefer"
      }
    }]
  },
  "tools": {
    "sessions": {
      "visibility": "all"  // 允许跨会话检查
    }
  }
}
```

## 使用模式

**从 main 派生：**

```javascript
// 简单任务：直接派生工作者（depth-1）
sessions_spawn({
  task: "审查登录接口的安全性",
  taskName: "security_review",
  agentId: "security",
  model: "anthropic/claude-opus-4-6"
});

sessions_yield(); // 等待完成事件
```

**编排者模式：**

```javascript
// 复杂任务：先派生编排者
sessions_spawn({
  task: "协调 backend + frontend + QA 开发新功能",
  taskName: "feature_coord",
  agentId: "architect",  // architect 作为编排者
  model: "anthropic/claude-opus-4-6"
});

// 编排者随后派生工作者（depth-2）
// 工作者结果通过内部注入流向编排者
// 编排者综合后 announce 给 main
```

## 与旧版 A2A 的对比

本架构替换了旧版 agent-to-agent (A2A) `sessions_send` 模式：

| 方面 | 旧版 A2A | Subagent Announce 链 |
|---|---|---|
| 结果交付 | `sessions_send` + `maxPingPongTurns` 限制 | Announce 链，无轮数限制 |
| 稳定性 | 超出轮数限制时结果丢失 | 推送式，可靠交付 |
| 恢复 | 需要手动恢复协议 | 内置运行时事件管理 |
| Telegram 刷屏 | 工作者可能直接向用户发消息 | 只有 main 向用户交付 |
| 配置 | `session.agentToAgent.maxPingPongTurns` | `agents.defaults.subagents.maxSpawnDepth` |

## 何时使用编排者（Depth-2）

**使用编排者模式当：**

- 任务需要 3+ 个并行工作者
- 工作者需要协调或冲突解决
- 结果需要综合后再交付给用户
- 示例："构建登录功能" → architect 协调 backend + frontend + security + QA

**直接派生当：**

- 简单的 1-2 工作者任务
- 工作者产出独立输出
- 无需综合
- 示例："审查这段代码" → 直接派生 reviewer

## 扩展阅读

- [OpenClaw Subagents 文档](https://docs.openclaw.ai/tools/subagents)
- [Session 工具](https://docs.openclaw.ai/concepts/session-tool)
