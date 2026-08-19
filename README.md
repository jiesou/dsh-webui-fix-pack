# dsh-webui-fix-pack

修复 Web UI 的各种小 bug 和不合理的地方

[English](README.en.md)

这个 plugin 包基于 dsh 原始的 webui，修补了各种小 bug，能让使用体验舒服很多！

dsh 本身的 webui 做的已经还不错了，为了兼容现有的各种插件生态，没有选择自己从头做一个 webui，而是尽可能通过各种方式修补现有 webui 中不合理的地方

设计目标是让 plugin 的作用域尽可能的小，代码尽可能少且干净。plugin 也都是纯前端，纯 client-half 的，不涉及 node-half 和外部依赖

但因为只能注入前端 JS 之类的，因此有些实现会有点 hacky。毕竟官方来修这些问题会容易很多！

## 安装

### 安装整个 dsh-webui-fix-pack 聚合包

从 npm 安装（预构建产物，推荐）：

```sh
dsh plugin --profile web add @jiesou/dsh-webui-fix-pack
```

或从 GitHub 安装：

```sh
dsh plugin --profile web add "github:jiesou/dsh-webui-fix-pack#<ref>&path:/bundles/dsh-webui-fix-pack"
```

安装后需要 **重启 web** 生效。

如需在 pack 中单独禁用某插件，在 profile 的 `cordis.patch.yml` 按 `id` 覆盖即可。

### 单独安装单个插件

所有子插件都已发布到 npm，包名对应仓库 `plugins/` 下的目录名，例如：

```sh
dsh plugin --profile web add @jiesou/dsh-webui-fix-composer-focus-restore
```

## Plugins

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

## 依赖策略

聚合包 `package.json` 的 `dependencies` 永远写 `latest`，不做本地路径替换。

本地开发由 web profile 的 `devDependencies` link 覆盖：6 个子插件指向本仓库 `plugins/` 目录，改源码即时生效，且不进入 `dependencies`，`dsh plugin` reconcile 不会把它们加回 bundles。

