# dsh-webui-fix-pack

Fixes small bugs and rough edges in the Web UI.

[简体中文](README.md)

This plugin pack is based on the original dsh webui and patches various small bugs to make the experience much more comfortable.

The original webui is already decent. To stay compatible with the existing plugin ecosystem, this pack does not build a webui from scratch; instead it patches unreasonable parts of the current webui whenever possible.

The design goal is to keep each plugin's scope as small as possible and the code minimal and clean. All plugins are pure frontend, client-half only — no node-half and no external dependencies.

Because only frontend JS injection is available, some implementations are a bit hacky. It would be much easier if the official project fixed these issues.

## Install

From GitHub:

```sh
dsh plugin --profile web add "github:jiesou/dsh-webui-fix-pack#<ref>&path:/bundles/dsh-webui-fix-pack"
```

Bundle layers take effect after **restarting web**.

You can install the whole dsh-webui-fix-pack, or install individual plugins. To disable a single plugin inside the pack, override it by `id` in the profile's `cordis.patch.yml`.

## Plugins

### composer-focus-restore

Directory: [plugins/dsh-webui-fix-composer-focus-restore](plugins/dsh-webui-fix-composer-focus-restore/)

After choosing a command like `/models`, the popup closes and focus leaves the message box, so you have to click the box again to keep typing. This plugin restores focus to the composer.

### session-row-context-menu

Directory: [plugins/dsh-webui-fix-session-row-context-menu](plugins/dsh-webui-fix-session-row-context-menu/)

In the session list, opening the actions menu requires precisely aiming at the small "three dots" button and left-clicking. This plugin lets you right-click anywhere on the row to open the menu.

### double-enter-to-steer

Directory: [plugins/dsh-webui-fix-double-enter-to-steer](plugins/dsh-webui-fix-double-enter-to-steer/)

When there are queued messages, pressing Enter again writes the queued messages directly into the steering message.

"Press Enter once to queue, press Enter twice to steer."

### hide-session-log

Directory: [plugins/dsh-webui-fix-hide-session-log-btn](plugins/dsh-webui-fix-hide-session-log-btn/)

The "save Session log" button in the top-right corner is rarely used but takes up a lot of screen space, which is especially annoying on mobile. When you really need it you can use the `/export` command instead. This plugin hides the button and reclaims its title bar space.

### mobile-enter-newline

Directory: [plugins/dsh-webui-fix-mobile-enter-newline](plugins/dsh-webui-fix-mobile-enter-newline/)

Requires [lehhair/dsh-mobile](https://github.com/lehhair/dsh-mobile).

On mobile soft keyboards, Enter inserts a newline instead of sending a message. Desktop behavior is unchanged.

### mobile-keyboard-blur

Directory: [plugins/dsh-webui-fix-mobile-keyboard-blur](plugins/dsh-webui-fix-mobile-keyboard-blur/)

Requires [lehhair/dsh-mobile](https://github.com/lehhair/dsh-mobile).

Switching to the sidebar page blurs the chat composer, preventing the WebView from popping the soft keyboard back up after it was dismissed.

## Dependency strategy

The aggregate pack's `dependencies` always use `latest`; no local path rewriting.

Local development is handled by the web profile's `devDependencies` links: the six subplugins point at this repo's `plugins/` directory, so source edits take effect immediately. They stay out of `dependencies`, so `dsh plugin` reconcile never re-adds them to bundles.