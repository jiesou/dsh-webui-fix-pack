/**
 * WORKAROUND for two upstream popovers that anchor to their triggers with
 * absolute positioning but never clamp to the viewport:
 *
 *   - SubagentCatalogAction (`dsh-client-ui-subagent`): the title-bar
 *     subagent session tree opens at `left: 0` and spills off-screen on
 *     narrow/touch layouts.
 *   - ContextMeter (`dsh-client-ui-conversation`): the composer context panel
 *     opens at `right: 0` with a fixed 264px width and can also leave the
 *     viewport on mobile.
 *
 * This plugin only adjusts horizontal placement by clamping any open instance
 * of either panel to the screen width on coarse-pointer (touch) UIs; the
 * original vertical direction (subagent opens downward, context opens upward)
 * is left untouched. A scoped CSS override restores the context panel's own
 * 264px width and content height instead of dsh-mobile's generic
 * `[role="dialog"]` full-width/full-height rule. It avoids CSS-module class
 * names (hashed and change across builds) and uses the stable ARIA structure
 * emitted by the components: a [role="tree"] / [role="dialog"] panel whose
 * parent also contains the matching button[aria-haspopup] trigger.
 *
 * https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/packages/client/ui-subagent/src/client/SubagentCatalogAction.module.css
 * https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/packages/client/ui-conversation/src/client/skeleton/ContextMeter.module.css
 *
 * Remove once upstream makes these popovers responsive.
 */
window.__ModuleLoader__.load({
  id: '@jiesou/dsh-webui-fix-mobile-panels-width',
  factory: () => {
    var EDGE = 16
    var CONTEXT_CSS = '@media (pointer: coarse){[data-dsh-mobile] span:has(> button[aria-haspopup="dialog"]) > [role="dialog"]{width:264px;max-width:calc(100vw - 32px);height:auto;max-height:none}}'

    function isTouchUi() {
      return !!window.matchMedia && window.matchMedia('(pointer: coarse)').matches
    }

    function isPanel(el) {
      if (!(el instanceof Element) || el.getAttribute('role') !== 'tree' && el.getAttribute('role') !== 'dialog') return false
      var parent = el.parentElement
      return parent !== null && parent.querySelector('button[aria-haspopup="' + el.getAttribute('role') + '"]') !== null
    }

    function panels() {
      var result = []
      document.querySelectorAll('[role="tree"], [role="dialog"]').forEach(function (el) {
        if (isPanel(el)) result.push({ root: el.parentElement, panel: el })
      })
      return result
    }

    function fitPanel(root, panel) {
      var width = panel.offsetWidth
      var rect = root.getBoundingClientRect()
      var viewportLeft = Math.min(Math.max(rect.left, EDGE), window.innerWidth - EDGE - width)
      panel.style.left = (viewportLeft - rect.left) + 'px'
      panel.style.right = 'auto'
    }

    function fitAll() {
      if (!isTouchUi()) return
      panels().forEach(function (item) {
        fitPanel(item.root, item.panel)
      })
    }

    function attach() {
      var style = document.createElement('style')
      style.dataset.plugin = '@jiesou/dsh-webui-fix-mobile-panels-width'
      style.dataset.pluginCss = '@jiesou/dsh-webui-fix-mobile-panels-width/context-meter.css'
      style.textContent = CONTEXT_CSS
      document.head.appendChild(style)

      fitAll()
      var observer = new MutationObserver(fitAll)
      observer.observe(document.body, { childList: true, subtree: true })
      window.addEventListener('resize', fitAll)
      return function () {
        observer.disconnect()
        window.removeEventListener('resize', fitAll)
        style.remove()
      }
    }

    return {
      name: '@jiesou/dsh-webui-fix-mobile-panels-width',
      apply(ctx) {
        ctx.effect(attach, '@jiesou/dsh-webui-fix-mobile-panels-width: keep mobile popovers inside the viewport')
      },
    }
  },
})
