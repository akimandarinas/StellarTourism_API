import { computed } from "vue"
import { useUIStore } from "../stores/ui"

export function useUI() {
  const uiStore = useUIStore()

  return {
    theme: computed(() => uiStore.theme),
    sidebarOpen: computed(() => uiStore.sidebarOpen),
    mobileMenuOpen: computed(() => uiStore.mobileMenuOpen),
    toggleTheme: uiStore.toggleTheme,
    setTheme: uiStore.setTheme,
    applyTheme: uiStore.applyTheme,
    toggleSidebar: uiStore.toggleSidebar,
    closeSidebar: uiStore.closeSidebar,
    toggleMobileMenu: uiStore.toggleMobileMenu,
    closeMobileMenu: uiStore.closeMobileMenu,
  }
}
