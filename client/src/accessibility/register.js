/* Registro de componentes y utilidades de accesibilidad */

import AccessibleImage from "./components/AccessibleImage.vue"
import AccessibleVideo from "./components/AccessibleVideo.vue"
import AccessibleDialog from "./components/AccessibleDialog.vue"
import AccessibilitySettings from "./components/AccessibilitySettings.vue"
import ScreenReaderAnnouncement from "./components/ScreenReaderAnnouncement.vue"
import SkipToContent from "./components/SkipToContent.vue"
import AccessibleNavigation from "./components/AccessibleNavigation.vue"
import AccessibleAudio from "./components/AccessibleAudio.vue"

import { directives } from "./directives"


export function registerAccessibility(app) {
  app.component("AccessibleImage", AccessibleImage)
  app.component("AccessibleVideo", AccessibleVideo)
  app.component("AccessibleDialog", AccessibleDialog)
  app.component("AccessibilitySettings", AccessibilitySettings)
  app.component("ScreenReaderAnnouncement", ScreenReaderAnnouncement)
  app.component("SkipToContent", SkipToContent)
  app.component("AccessibleNavigation", AccessibleNavigation)
  app.component("AccessibleAudio", AccessibleAudio)

  for (const [name, directive] of Object.entries(directives)) {
    app.directive(name, directive)
  }

  initializeScreenReaderAnnouncer()

  app.provide("accessibility", {
  })
}


function initializeScreenReaderAnnouncer() {
  if (typeof document === "undefined") return

  if (!document.getElementById("a11y-announcer")) {
    const announcer = document.createElement("div")
    announcer.id = "a11y-announcer"
    announcer.setAttribute("aria-live", "polite")
    announcer.setAttribute("aria-atomic", "true")
    announcer.style.position = "absolute"
    announcer.style.width = "1px"
    announcer.style.height = "1px"
    announcer.style.padding = "0"
    announcer.style.overflow = "hidden"
    announcer.style.clip = "rect(0, 0, 0, 0)"
    announcer.style.whiteSpace = "nowrap"
    announcer.style.border = "0"

    document.body.appendChild(announcer)
  }
}

export {
  AccessibleImage,
  AccessibleVideo,
  ScreenReaderAnnouncement,
  AccessibilitySettings,
  AccessibleDialog,
  SkipToContent,
  AccessibleNavigation,
  AccessibleAudio,
}
