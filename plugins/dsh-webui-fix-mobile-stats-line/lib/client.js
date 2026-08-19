/**
 * Fix StatsLine tooltip on mobile.
 *
 * Root cause: @dsh-external/dsh-mobile hides every `[data-side]` element
 * (`[data-dsh-mobile] [data-side] { display:none !important }`), and the
 * upstream Tooltip bubble uses `role="tooltip"` + `data-side="top"`.
 * Touch taps already make the upstream Tooltip mount; only its display is
 * suppressed. This plugin re-enables that bubble for the StatsLine slot and
 * allows it to use up to 80vw (wider than upstream's 50vw, while still
 * leaving comfortable viewport margins).
 */
window.__ModuleLoader__.load({
  id: '@jiesou/dsh-webui-fix-mobile-stats-line',
  factory: () => {
    var STATS_TOOLTIP_CSS = '@media (width<=768px){[data-dsh-mobile] [data-slot="conversation.composer.dock"] [role="tooltip"]{display:block !important;max-width:80vw !important}}'

    function attach() {
      var style = document.createElement('style')
      style.dataset.plugin = '@jiesou/dsh-webui-fix-mobile-stats-line'
      style.dataset.pluginCss = '@jiesou/dsh-webui-fix-mobile-stats-line/stats-line-tooltip.css'
      style.textContent = STATS_TOOLTIP_CSS
      document.head.appendChild(style)
      return function () {
        style.remove()
      }
    }

    return {
      name: '@jiesou/dsh-webui-fix-mobile-stats-line',
      apply(ctx) {
        ctx.effect(attach, '@jiesou/dsh-webui-fix-mobile-stats-line: show upstream stats line tooltip on mobile')
      },
    }
  },
})