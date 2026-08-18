/**
 * WORKAROUND for the DSH Web UI session list: the row actions menu is only
 * reachable through the small ellipsis button, which is hard to hit. This
 * plugin makes right-clicking anywhere on a session row open that same menu.
 *
 * It works by replaying a click on the row's own ellipsis button, so the
 * menu state stays owned by the workspace React component. Class names come
 * from @deepseek-ai/dsh-client-ui-workspace's Rows.module.css bundle.
 *
 * https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/packages/client/ui-workspace/src/client/rows/Rows.tsx
 *
 * Remove once upstream adds a native context menu to session rows.
 */
window.__ModuleLoader__.load({
  id: '@jiesou/dsh-webui-fix-session-row-context-menu',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports

    var SESSION_ROW = '[role="treeitem"][aria-selected]'
    var MENU_OPEN = 'YDXeBa_menuOpen'

    function menuButton(row) {
      return row.querySelector('button')
    }

    function closeOpenMenus() {
      var rows = document.querySelectorAll(SESSION_ROW + '.' + MENU_OPEN)
      for (var i = 0; i < rows.length; i++) {
        var btn = menuButton(rows[i])
        if (btn !== null) btn.click()
      }
    }

    function onContextMenu(e) {
      var el = e.target instanceof Element ? e.target : e.target.parentElement
      var row = el instanceof Element ? el.closest(SESSION_ROW) : null
      if (row === null) return
      var btn = menuButton(row)
      if (btn === null) return
      e.preventDefault()
      if (row.classList.contains(MENU_OPEN)) return
      closeOpenMenus()
      btn.click()
    }

    function attach() {
      document.addEventListener('contextmenu', onContextMenu, true)
      return function () {
        document.removeEventListener('contextmenu', onContextMenu, true)
      }
    }

    exports.name = '@jiesou/dsh-webui-fix-session-row-context-menu'
    exports.apply = function (ctx) {
      ctx.effect(attach, '@jiesou/dsh-webui-fix-session-row-context-menu: open row menu on right-click')
    }
    return module.exports
  },
})
