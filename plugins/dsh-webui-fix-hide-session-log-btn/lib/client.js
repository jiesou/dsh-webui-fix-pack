window.__ModuleLoader__.load({
  id: '@jiesou/dsh-webui-fix-hide-session-log-btn',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports

    var LABEL = 'session log'

    function match(el) {
      if (!(el instanceof HTMLElement)) return false
      var t = (el.textContent || '').trim().toLowerCase()
      return t.indexOf(LABEL) === 0
    }

    function hide(btn) {
      btn.style.setProperty('display', 'none', 'important')
    }

    function tuneHeader(root) {
      root.querySelectorAll('.wSkVaW_crumbs').forEach(function (nav) {
        nav.querySelectorAll('.wSkVaW_crumb').forEach(function (crumb) {
          crumb.style.maxWidth = 'none'
          crumb.style.minWidth = '0'
        })
      })
    }

    function observe() {
      var seen = new WeakSet()
      var sweep = function (root) {
        root.querySelectorAll('button, a, [role="button"]').forEach(function (el) {
          if (seen.has(el)) return
          if (match(el)) {
            seen.add(el)
            hide(el)
          }
        })
        tuneHeader(root)
      }
      sweep(document)
      var obs = new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          m.addedNodes.forEach(function (n) {
            if (n.nodeType === 1) sweep(n)
            else if (n.nodeType === 3 && n.parentElement) sweep(n.parentElement)
          })
        })
      })
      obs.observe(document.body, { childList: true, subtree: true })
      return function () { obs.disconnect() }
    }

    exports.name = '@jiesou/dsh-webui-fix-hide-session-log-btn'
    exports.apply = function (ctx) {
      ctx.effect(observe, '@jiesou/dsh-webui-fix-hide-session-log-btn: hide by label + reclaim title space')
    }
    return module.exports
  },
})
