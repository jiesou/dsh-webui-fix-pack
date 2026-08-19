window.__ModuleLoader__.load({
  id: '@jiesou/dsh-webui-fix-pwa',
  factory: () => ({
    name: '@jiesou/dsh-webui-fix-pwa',
    apply(ctx) {
      ctx.effect(() => {
        document.head
          .querySelectorAll('meta[name="theme-color"][data-dsh-webui-fix-pwa]')
          .forEach((meta) => meta.remove())
      }, '@jiesou/dsh-webui-fix-pwa: let layout own the runtime theme-color meta')
    },
  }),
})