# 添加角色 Agent

在 `roles/<role>/` 下添加角色模板，然后将其纳入生成 / 注册计划。

新增角色 Agent 默认是内部角色：应通过 `main` 的 agent-to-agent 路由访问，默认不要绑定 Telegram 或其他面向用户的渠道，除非有明确且已审核的理由。
