window.__ModuleLoader__.load({
  id: '@jiesou/dsh-webui-fix-mobile-enter-newline',
  factory: () => {
    function isTouchUi() {
      return !!window.matchMedia && window.matchMedia('(pointer: coarse)').matches
    }

    function slashMenuHasHighlight() {
      if (typeof document === 'undefined') return false
      return document.querySelector('[role="listbox"][aria-activedescendant]') !== null
    }

    function cards() {
      return Array.prototype.slice.call(document.querySelectorAll('[data-composer-card]'))
    }

    function textareaOf(card) {
      return card.querySelector('textarea[data-phase]')
    }

    function primaryOf(card) {
      var buttons = card.querySelectorAll('button')
      return buttons.length === 0 ? null : buttons[buttons.length - 1]
    }

    function isSend(btn) {
      return btn !== null && btn.querySelector('svg path') !== null
    }

    function isStop(btn) {
      return btn !== null && btn.querySelector('svg rect') !== null
    }

    function isStopMode(scope) {
      var sessions = scope.sessions
      var id = sessions.list.getSnapshot().current
      if (id === void 0) return false
      var binding = sessions.binding(id)
      var snap = binding && binding.session.getSnapshot()
      return !!snap && snap.running === true && snap.subagent === null
    }

    function onSendifiedClick(e) {
      var button = e.currentTarget
      var card = button.closest('[data-composer-card]')
      var textarea = card && textareaOf(card)
      if (!textarea) return
      e.preventDefault()
      e.stopImmediatePropagation()
      textarea.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      }))
    }

    function syncTooltip(button, label) {
      var tip = button.nextElementSibling
      if (tip !== null && tip.getAttribute('role') === 'tooltip' && label !== null) {
        tip.textContent = label
      }
    }

    function clearModified(button, restoreVisual) {
      var original = button.__dshOriginal
      if (original === undefined) return
      button.removeEventListener('click', onSendifiedClick, true)
      if (restoreVisual) {
        button.innerHTML = original.html
        if (original.label !== null) button.setAttribute('aria-label', original.label)
      }
      syncTooltip(button, original.label)
      delete button.__dshOriginal
    }

    function attachSteering(scope) {
      var template = { html: null, label: null }
      var scheduled = false

      function syncSoon() {
        if (scheduled) return
        scheduled = true
        requestAnimationFrame(function () {
          scheduled = false
          syncAll()
        })
      }

      function syncCard(card) {
        var button = primaryOf(card)
        if (button === null) return
        if (isSend(button) && template.html === null) {
          template.html = button.innerHTML
          template.label = button.getAttribute('aria-label')
        }
        var textarea = textareaOf(card)
        var hasText = textarea !== null && textarea.value.trim() !== ''
        var stopMode = isStopMode(scope)
        var modified = button.__dshOriginal !== undefined
        if (stopMode && hasText && template.html !== null) {
          if (!modified) {
            button.__dshOriginal = { html: button.innerHTML, label: button.getAttribute('aria-label') }
            button.addEventListener('click', onSendifiedClick, true)
          }
          if (!isSend(button)) {
            button.innerHTML = template.html
            if (template.label !== null) button.setAttribute('aria-label', template.label)
          }
          syncTooltip(button, template.label)
        } else if (modified) {
          clearModified(button, stopMode && !isStop(button))
        }
      }

      function syncAll() {
        cards().forEach(syncCard)
      }

      function restore(card) {
        var button = primaryOf(card)
        if (button === null || button.__dshOriginal === undefined) return
        clearModified(button, true)
      }

      var onKeyDown = function (e) {
        if (!(e.target instanceof HTMLTextAreaElement)) return
        if (e.key !== 'Enter') return
        if (e.isComposing || e.keyCode === 229) return
        if (!e.isTrusted) return
        if (!isTouchUi()) return
        if (e.ctrlKey || e.shiftKey || e.metaKey) return
        if (slashMenuHasHighlight()) return
        e.stopImmediatePropagation()
      }
      document.addEventListener('keydown', onKeyDown, true)
      document.addEventListener('input', syncSoon, true)
      var observer = new MutationObserver(syncSoon)
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true })
      syncAll()

      return function () {
        document.removeEventListener('keydown', onKeyDown, true)
        document.removeEventListener('input', syncSoon, true)
        observer.disconnect()
        cards().forEach(restore)
      }
    }

    return {
      name: '@jiesou/dsh-webui-fix-mobile-enter-newline',
      apply(ctx) {
        ctx.inject(['sessions'], function (scope) {
          scope.effect(function () {
            return attachSteering(scope)
          }, '@jiesou/dsh-webui-fix-mobile-enter-newline: sendify running primary button')
        })
      },
    }
  },
})
