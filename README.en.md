# dsh-webui-fix-pack

Fixes small bugs and rough edges in the Web UI.

[简体中文](README.md)

This plugin pack is based on the original dsh webui and patches various small bugs to make the experience much more comfortable.

The original webui is already decent. To stay compatible with the existing plugin ecosystem, this pack does not build a webui from scratch; instead it patches unreasonable parts of the current webui whenever possible.

The design goal is to keep each plugin's scope as small as possible and the code minimal and clean. Most plugins are pure frontend, client-half only; `pwa` is the one Node-half exception because it patches the served index/manifest (still no external dependencies).

Because only frontend JS injection is available, some implementations are a bit hacky. It would be much easier if the official project fixed these issues.

## Install

### Install the whole dsh-webui-fix-pack aggregate pack

From npm (prebuilt artifacts, recommended):

```sh
dsh plugin --profile web add @jiesou/dsh-webui-fix-pack
```

Or from GitHub:

```sh
dsh plugin --profile web add "github:jiesou/dsh-webui-fix-pack#<ref>&path:/bundles/dsh-webui-fix-pack"
```

Restart **web** after installation.

To disable a single plugin inside the pack, override it by `id` in the profile's `cordis.patch.yml`.

### Install a single plugin

All subplugins are published to npm; package names match the directory names under `plugins/`, e.g.:

```sh
dsh plugin --profile web add @jiesou/dsh-webui-fix-composer-focus-restore
```

## Plugins

### pwa

[plugins/dsh-webui-fix-pwa](plugins/dsh-webui-fix-pwa/)

Fullscreen PWA on mobile hides the top status bar and bottom navigation bar; you have to swipe to reveal them, and the background colors are wrong.

This plugin switches the manifest to `standalone` and injects light/dark `theme_color`/`background_color` from the design tokens plus static index `theme-color` metas; the official layout plugin keeps owning the runtime color. It also serves a dedicated PWA icon: the original icon on a white circle, so it no longer blends into arbitrary wallpapers.

Note: an already installed PWA's `display` will not change with a manifest update — re-add/reinstall it.

### composer-focus-restore

[plugins/dsh-webui-fix-composer-focus-restore](plugins/dsh-webui-fix-composer-focus-restore/)

https://github.com/user-attachments/assets/9d39a220-7933-4902-8f64-38c9ec7978b4

After choosing a command like `/models`, the popup closes and focus leaves the message box, so you have to click the box again to keep typing.

This issue is fixed.

### session-row-context-menu

[plugins/dsh-webui-fix-session-row-context-menu](plugins/dsh-webui-fix-session-row-context-menu/)

<img height="200" alt="image" src="https://github.com/user-attachments/assets/b91a7d54-6bca-47f7-bfb9-47a1fefc4833" />

In the session list, opening the actions menu requires precisely aiming at the small "three dots" button and left-clicking.

Now you can right-click anywhere on the row to open the menu.

### double-enter-to-steer

[plugins/dsh-webui-fix-double-enter-to-steer](plugins/dsh-webui-fix-double-enter-to-steer/)

When there are queued messages, pressing Enter again writes the queued messages directly into the steering message.

"Press Enter once to queue, press Enter twice to steer."

### hide-session-log

[plugins/dsh-webui-fix-hide-session-log-btn](plugins/dsh-webui-fix-hide-session-log-btn/)

<img height="500" alt="image" src="https://github.com/user-attachments/assets/e0fe81c2-4cb6-4c14-8779-c3fb573514a0" />

The "save Session log" button in the top-right corner is rarely used but takes up a lot of screen space, which is especially annoying on mobile.

When you really need it you can use the `/export` command instead.

This plugin hides the button and reclaims its title bar space.

### mobile-enter-newline

[plugins/dsh-webui-fix-mobile-enter-newline](plugins/dsh-webui-fix-mobile-enter-newline/)

https://github.com/user-attachments/assets/f322ad94-5ba2-4cda-a10e-51902a9331db

Requires [lehhair/dsh-mobile](https://github.com/lehhair/dsh-mobile).

The original webui cannot insert a newline from a mobile soft keyboard at all; this extension makes Enter insert a newline on mobile soft keyboards.

Also, while the agent is running, the original webui always turns the send button into an agent stop button, so you could only queue messages by pressing Enter on a desktop keyboard.

Now, after typing a message, the agent stop button becomes a queue message button, so you can tap it to send the queued message.

### mobile-keyboard-blur

[plugins/dsh-webui-fix-mobile-keyboard-blur](plugins/dsh-webui-fix-mobile-keyboard-blur/)

Requires [lehhair/dsh-mobile](https://github.com/lehhair/dsh-mobile).

https://github.com/user-attachments/assets/55f1ab47-6b16-4946-842c-fcd3ff97143f

When focus stays in the message box and you open the sidebar to switch sessions, the WebView pops the keyboard back up after dismissing it, making the UI janky.

This issue is fixed.

### mobile-panels-width

[plugins/dsh-webui-fix-mobile-panels-width](plugins/dsh-webui-fix-mobile-panels-width/)

Requires [lehhair/dsh-mobile](https://github.com/lehhair/dsh-mobile).

The title-bar subagent catalog dropdown and the composer context panel both spill outside the screen on mobile.

Now on touch devices they are clamped to the screen width and no longer overflow left or right; the context panel's natural 264px width and content height are also restored instead of being stretched by dsh-mobile's generic dialog rule.

## Dependency strategy

The aggregate pack's `dependencies` always use `latest`; no local path rewriting.

Local development is handled by the web profile's `devDependencies` links: the eight subplugins point at this repo's `plugins/` directory, so source edits take effect immediately. They stay out of `dependencies`, so `dsh plugin` reconcile never re-adds them to bundles.