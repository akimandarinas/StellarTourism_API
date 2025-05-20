import { defineStore } from "pinia"
import { ref } from "vue"

// Store para datos compartidos entre componentes
export default defineStore("shared", () => {
  // Estado
  const sharedData = ref({})
  const lastUpdated = ref(Date.now())

  // Acciones
  function setData(key: string, value: any) {
    sharedData.value = {
      ...sharedData.value,
      [key]: value,
    }
    lastUpdated.value = Date.now()
  }

  function getData(key: string) {
    return sharedData.value[key]
  }

  function clearData() {
    sharedData.value = {}
    lastUpdated.value = Date.now()
  }

  return {
    sharedData,
    lastUpdated,
    setData,
    getData,
    clearData,
  }
})
