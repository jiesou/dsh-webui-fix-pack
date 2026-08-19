# dsh-webui-fix-pack

修复 Web UI 的各种小 bug 和不合理的地方

[English](README.en.md)

本着 **不重复造轮子** 的原则，这个 plugin 聚合包是在 dsh 本身的 webui 上做优化，修复 PWA，修复响应式问题等等

而且，**每个 fixup 都作为独立 plugin 提供** 可以逐个独立安装独立卸载

我不希望：

- 自造 webui
- 从头实现自己的原生“desktop”
- 丢弃现有的插件生态
- 做“All in One”一堆功能的一体化 plugin

设计目标是让每个 plugin 的作用域尽可能的小，代码尽可能少且干净。绝大多数 plugin 是纯前端、纯 client-half 的

但因为只能注入前端 JS 之类的，因此有些实现会有点 hacky。毕竟官方来修这些问题会容易很多！

---

这是搭配 [lehhair/dsh-mobile](https://github.com/lehhair/dsh-mobile) 之后，能获得的完美移动端 PWA 体验：

https://github.com/user-attachments/assets/f11f9447-d6be-47ea-a9c6-bd2bb9041936

- 消息换行
- 消息 steering
- 子代理面板

都非常优雅

## 安装

建议先安装 [lehhair/dsh-mobile](https://github.com/lehhair/dsh-mobile) 获得更好的移动端体验！

### 安装整个 dsh-webui-fix-pack 聚合包

从 npm 安装（预构建产物，推荐）：

```sh
dsh plugin --profile web add @jiesou/dsh-webui-fix-pack
```

或从 GitHub 安装：

```sh
dsh plugin --profile web add "github:jiesou/dsh-webui-fix-pack#main&path:/bundles/dsh-webui-fix-pack"
```

安装后需要 **重启 web** 生效

如需在 pack 中单独禁用某插件，在 profile 的 `cordis.patch.yml` 按 `id` 覆盖即可

### 单独安装单个插件

所有子插件都已发布到 npm，包名对应仓库 `plugins/` 下的目录名，例如：

```sh
dsh plugin --profile web add @jiesou/dsh-webui-fix-composer-focus-restore
```

## Plugins

### pwa

[plugins/dsh-webui-fix-pwa](plugins/dsh-webui-fix-pwa/)

手机全屏 PWA 默认全屏展示，会隐藏顶部状态栏和底部导航栏，必须划拉一下才能拉出来：

https://github.com/user-attachments/assets/433a9dfe-202e-4e25-a784-9bccf6243c2a

现在把 PWA 改为 `standalone` 而不是 `fullscreen` 模式，并按 design token 注入正确的 color

<img height="400" alt="before-pwa-icon 截图 2026-08-19 12-41-51" src="https://github.com/user-attachments/assets/ae2d5e9b-a774-4818-9b80-8026de07f412" /><img height="400" alt="after-pwa-icon 截图 2026-08-19 13-44-57" src="https://github.com/user-attachments/assets/7cbaf353-a184-4520-9782-b14ae4863927" />
<img height="300" alt="截图 2026-08-19 13-34-56" src="https://github.com/user-attachments/assets/7579df75-cca5-474c-8f5c-7c56e6c6ed60" />

PWA 图标也单独生成：避免和黑色背景混在一起

### composer-focus-restore

[plugins/dsh-webui-fix-composer-focus-restore](plugins/dsh-webui-fix-composer-focus-restore/)

https://github.com/user-attachments/assets/9d39a220-7933-4902-8f64-38c9ec7978b4

`/models` 等命令选择后，popup 框关闭，消息框焦点会跑走的，必须再点一下消息框，才能接着打字

修复了这个问题

### session-row-context-menu

[plugins/dsh-webui-fix-session-row-context-menu](plugins/dsh-webui-fix-session-row-context-menu/)

<img height="200" alt="image" src="https://github.com/user-attachments/assets/b91a7d54-6bca-47f7-bfb9-47a1fefc4833" />

会话列表中，必须要鼠标瞄准小小的“三个点”，左键才能打开菜单，很麻烦

现在可以在任意位置右键打开

### double-enter-to-steer

[plugins/dsh-webui-fix-double-enter-to-steer](plugins/dsh-webui-fix-double-enter-to-steer/)

有 queue 消息时，再按一次 Enter 直接把 queue 消息写入 steering 消息

实现“单击回车 queue”，“双击回车 steering”

### hide-like-dislike

[plugins/dsh-webui-fix-hide-like-dislike](plugins/dsh-webui-fix-hide-like-dislike/)

每个 agent 回复下面的“好的回答 / 有问题的回答”两个反馈按钮没有任何作用

这个插件直接隐藏它们；纯 CSS 实现，只注入一个 style 标签

### hide-session-log

[plugins/dsh-webui-fix-hide-session-log-btn](plugins/dsh-webui-fix-hide-session-log-btn/)

<img height="500" alt="image" src="https://github.com/user-attachments/assets/e0fe81c2-4cb6-4c14-8779-c3fb573514a0" />

右上角的 save Session log 按钮很少用到，却占很大的屏幕空间。尤其是在移动设备上很难受

真的需要的时候也可以通过 `/export` 命令，不需要这个按钮
 
因此隐藏这个按钮，同时回收它占用的标题栏空间

### mobile-enter-newline

[plugins/dsh-webui-fix-mobile-enter-newline](plugins/dsh-webui-fix-mobile-enter-newline/)

https://github.com/user-attachments/assets/f322ad94-5ba2-4cda-a10e-51902a9331db

需要搭配 [lehhair/dsh-mobile](https://github.com/lehhair/dsh-mobile) 使用

原来的 webui 在移动端完全无法通过软键盘实现换行，这个扩展让移动端软键盘下 Enter 能够换行

同时，在 agent 运行时，原来的 webui 消息发送按钮始终变成 agent 停止按钮，只能在桌面端按 Enter 来 queue 消息

现在，输入消息后，agent 停止按钮 会变成 queue 消息按钮，可以直接点击按钮来发送

### mobile-keyboard-blur

[plugins/dsh-webui-fix-mobile-keyboard-blur](plugins/dsh-webui-fix-mobile-keyboard-blur/)

需要搭配 [lehhair/dsh-mobile](https://github.com/lehhair/dsh-mobile) 使用

https://github.com/user-attachments/assets/55f1ab47-6b16-4946-842c-fcd3ff97143f

焦点停留在消息框时打开侧边栏切换 session， 会导致 WebView 把键盘收起后又弹回来，界面鬼畜

修复了这个问题

### mobile-panels-width

[plugins/dsh-webui-fix-mobile-panels-width](plugins/dsh-webui-fix-mobile-panels-width/)

需要搭配 [lehhair/dsh-mobile](https://github.com/lehhair/dsh-mobile) 使用

lehhair/dsh-mobile 的 CSS 规则会导致标题栏的子代理会话列表、以及输入框里的上下文面板，溢出屏幕

修复了这个问题。before/after:

<img height="600" alt="before-context截图 2026-08-19 19-39-43" src="https://github.com/user-attachments/assets/635d56ac-5a92-4174-9927-f556413f24f9" /><img height="600" alt="after-context截图 2026-08-19 19-40-09" src="https://github.com/user-attachments/assets/50e75b9a-5115-4da7-b353-c9f40c85f586" />

<img height="600" alt="before-subagent-fix截图 2026-08-19 12-25-17" src="https://github.com/user-attachments/assets/6e4448f2-12e1-493b-a575-8428b5b4a530" /><img height="600" alt="after-subagent-fix截图 2026-08-19 12-26-33" src="https://github.com/user-attachments/assets/6b86fb2c-4086-42ce-a6df-d17644c09180" />

### mobile-hide-h-scroll

[plugins/dsh-webui-fix-mobile-hide-h-scroll](plugins/dsh-webui-fix-mobile-hide-h-scroll/)

需要搭配 [lehhair/dsh-mobile](https://github.com/lehhair/dsh-mobile) 使用

在手机 WebView 里左右滑动打开侧边栏时，仍能看到横向滚动条

这个插件在 dsh-mobile 的移动布局下隐藏所有滚动条；纯 CSS，只注入一个 style 标签

### mobile-stats-line

[plugins/dsh-webui-fix-mobile-stats-line](plugins/dsh-webui-fix-mobile-stats-line/)

需要搭配 [lehhair/dsh-mobile](https://github.com/lehhair/dsh-mobile) 使用

移动端侧边栏的 stats line 会被截断且没有 tooltip，无法看到完整统计信息

这个插件把 stats line 限制在视口内，并在点击时显示完整内容的浮层

## 依赖策略

聚合包 `package.json` 的 `dependencies` 永远写 `latest`，不做本地路径替换

本地开发由 web profile 的 `devDependencies` link 覆盖：所有子插件指向本仓库 `plugins/` 目录，改源码即时生效，且不进入 `dependencies`，`dsh plugin` reconcile 不会把它们加回 bundles

