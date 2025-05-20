// Función para verificar un componente específico
async function checkComponent(componentName) {
  try {
    const response = await fetch(`component-check.php?component=${componentName}`)
    return await response.json()
  } catch (error) {
    console.error(`Error al verificar componente ${componentName}:`, error)
    return {
      name: componentName,
      status: "error",
      details: [`Error al verificar componente: ${error.message}`],
      tests: [],
      recommendations: [],
    }
  }
}

// Función para verificar todos los componentes
async function checkAllComponents() {
  try {
    const response = await fetch("component-check.php")
    return await response.json()
  } catch (error) {
    console.error("Error al verificar todos los componentes:", error)
    return {
      status: "error",
      timestamp: new Date().toISOString(),
      summary: {
        total: 0,
        success: 0,
        warning: 0,
        error: 0,
      },
      components: {},
      recommendations: [],
    }
  }
}

// Función para renderizar el estado de un componente
function renderComponentStatus(component) {
  const componentCard = document.createElement("div")
  componentCard.className = "component-card"

  const componentHeader = document.createElement("div")
  componentHeader.className = "component-header"

  const componentName = document.createElement("div")
  componentName.className = "component-name"
  componentName.textContent = component.name

  const statusIndicator = document.createElement("span")
  statusIndicator.className = `status-indicator status-${component.status === "success" ? "ok" : component.status === "warning" ? "warning" : component.status === "error" ? "error" : "unknown"}`

  componentHeader.appendChild(componentName)
  componentHeader.appendChild(statusIndicator)

  componentCard.appendChild(componentHeader)

  // Añadir detalles
  if (component.details && component.details.length > 0) {
    const componentDetails = document.createElement("div")
    componentDetails.className = "component-details"
    componentDetails.textContent = component.details.join(" ")
    componentCard.appendChild(componentDetails)
  }

  // Añadir botón para ver más detalles
  const detailsButton = document.createElement("button")
  detailsButton.className = "btn btn-sm"
  detailsButton.textContent = "Ver detalles"
  detailsButton.style.marginTop = "10px"
  detailsButton.style.padding = "5px 10px"
  detailsButton.style.fontSize = "12px"

  detailsButton.addEventListener("click", () => {
    showComponentDetails(component)
  })

  componentCard.appendChild(detailsButton)

  return componentCard
}

// Función para mostrar detalles de un componente
function showComponentDetails(component) {
  // Crear modal
  const modal = document.createElement("div")
  modal.style.position = "fixed"
  modal.style.top = "0"
  modal.style.left = "0"
  modal.style.width = "100%"
  modal.style.height = "100%"
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
  modal.style.display = "flex"
  modal.style.justifyContent = "center"
  modal.style.alignItems = "center"
  modal.style.zIndex = "1000"

  // Crear contenido del modal
  const modalContent = document.createElement("div")
  modalContent.style.backgroundColor = "white"
  modalContent.style.borderRadius = "5px"
  modalContent.style.padding = "20px"
  modalContent.style.maxWidth = "800px"
  modalContent.style.width = "90%"
  modalContent.style.maxHeight = "90vh"
  modalContent.style.overflow = "auto"

  // Crear encabezado del modal
  const modalHeader = document.createElement("div")
  modalHeader.style.display = "flex"
  modalHeader.style.justifyContent = "space-between"
  modalHeader.style.alignItems = "center"
  modalHeader.style.marginBottom = "20px"

  const modalTitle = document.createElement("h2")
  modalTitle.textContent = `Detalles del componente: ${component.name}`
  modalTitle.style.margin = "0"

  const closeButton = document.createElement("button")
  closeButton.textContent = "×"
  closeButton.style.backgroundColor = "transparent"
  closeButton.style.border = "none"
  closeButton.style.fontSize = "24px"
  closeButton.style.cursor = "pointer"
  closeButton.addEventListener("click", () => {
    document.body.removeChild(modal)
  })

  modalHeader.appendChild(modalTitle)
  modalHeader.appendChild(closeButton)

  modalContent.appendChild(modalHeader)

  // Crear sección de estado
  const statusSection = document.createElement("div")
  statusSection.style.marginBottom = "20px"

  const statusTitle = document.createElement("h3")
  statusTitle.textContent = "Estado"
  statusTitle.style.marginBottom = "10px"

  const statusValue = document.createElement("div")
  statusValue.style.display = "flex"
  statusValue.style.alignItems = "center"

  const statusIndicator = document.createElement("span")
  statusIndicator.className = `status-indicator status-${component.status === "success" ? "ok" : component.status === "warning" ? "warning" : component.status === "error" ? "error" : "unknown"}`

  const statusText = document.createElement("span")
  statusText.textContent =
    component.status === "success"
      ? "Correcto"
      : component.status === "warning"
        ? "Advertencias"
        : component.status === "error"
          ? "Error"
          : "Desconocido"
  statusText.style.marginLeft = "10px"
  statusText.style.fontWeight = "bold"
  statusText.style.color =
    component.status === "success"
      ? "var(--success-color)"
      : component.status === "warning"
        ? "var(--warning-color)"
        : component.status === "error"
          ? "var(--danger-color)"
          : "var(--light-text)"

  statusValue.appendChild(statusIndicator)
  statusValue.appendChild(statusText)

  statusSection.appendChild(statusTitle)
  statusSection.appendChild(statusValue)

  modalContent.appendChild(statusSection)

  // Crear sección de detalles
  if (component.details && component.details.length > 0) {
    const detailsSection = document.createElement("div")
    detailsSection.style.marginBottom = "20px"

    const detailsTitle = document.createElement("h3")
    detailsTitle.textContent = "Detalles"
    detailsTitle.style.marginBottom = "10px"

    const detailsList = document.createElement("ul")
    detailsList.style.margin = "0"
    detailsList.style.paddingLeft = "20px"

    component.details.forEach((detail) => {
      const detailItem = document.createElement("li")
      detailItem.textContent = detail
      detailsList.appendChild(detailItem)
    })

    detailsSection.appendChild(detailsTitle)
    detailsSection.appendChild(detailsList)

    modalContent.appendChild(detailsSection)
  }

  // Crear sección de pruebas
  if (component.tests && component.tests.length > 0) {
    const testsSection = document.createElement("div")
    testsSection.style.marginBottom = "20px"

    const testsTitle = document.createElement("h3")
    testsTitle.textContent = "Pruebas"
    testsTitle.style.marginBottom = "10px"

    const testsTable = document.createElement("table")
    testsTable.style.width = "100%"
    testsTable.style.borderCollapse = "collapse"

    const tableHeader = document.createElement("thead")
    const headerRow = document.createElement("tr")

    const nameHeader = document.createElement("th")
    nameHeader.textContent = "Prueba"
    nameHeader.style.textAlign = "left"
    nameHeader.style.padding = "8px"
    nameHeader.style.borderBottom = "2px solid #ddd"

    const statusHeader = document.createElement("th")
    statusHeader.textContent = "Estado"
    statusHeader.style.textAlign = "left"
    statusHeader.style.padding = "8px"
    statusHeader.style.borderBottom = "2px solid #ddd"

    const messageHeader = document.createElement("th")
    messageHeader.textContent = "Mensaje"
    messageHeader.style.textAlign = "left"
    messageHeader.style.padding = "8px"
    messageHeader.style.borderBottom = "2px solid #ddd"

    headerRow.appendChild(nameHeader)
    headerRow.appendChild(statusHeader)
    headerRow.appendChild(messageHeader)

    tableHeader.appendChild(headerRow)
    testsTable.appendChild(tableHeader)

    const tableBody = document.createElement("tbody")

    component.tests.forEach((test) => {
      const row = document.createElement("tr")

      const nameCell = document.createElement("td")
      nameCell.textContent = test.name
      nameCell.style.padding = "8px"
      nameCell.style.borderBottom = "1px solid #ddd"

      const statusCell = document.createElement("td")
      const testStatusIndicator = document.createElement("span")
      testStatusIndicator.className = `status-indicator status-${test.status === "success" ? "ok" : test.status === "warning" ? "warning" : test.status === "error" ? "error" : "unknown"}`
      statusCell.appendChild(testStatusIndicator)
      statusCell.style.padding = "8px"
      statusCell.style.borderBottom = "1px solid #ddd"

      const messageCell = document.createElement("td")
      messageCell.textContent = test.message
      messageCell.style.padding = "8px"
      messageCell.style.borderBottom = "1px solid #ddd"

      row.appendChild(nameCell)
      row.appendChild(statusCell)
      row.appendChild(messageCell)

      tableBody.appendChild(row)
    })

    testsTable.appendChild(tableBody)

    testsSection.appendChild(testsTitle)
    testsSection.appendChild(testsTable)

    modalContent.appendChild(testsSection)
  }

  // Crear sección de recomendaciones
  if (component.recommendations && component.recommendations.length > 0) {
    const recommendationsSection = document.createElement("div")
    recommendationsSection.style.marginBottom = "20px"

    const recommendationsTitle = document.createElement("h3")
    recommendationsTitle.textContent = "Recomendaciones"
    recommendationsTitle.style.marginBottom = "10px"

    const recommendationsList = document.createElement("ul")
    recommendationsList.style.margin = "0"
    recommendationsList.style.paddingLeft = "20px"

    component.recommendations.forEach((recommendation) => {
      const recommendationItem = document.createElement("li")
      recommendationItem.textContent = recommendation
      recommendationsList.appendChild(recommendationItem)
    })

    recommendationsSection.appendChild(recommendationsTitle)
    recommendationsSection.appendChild(recommendationsList)

    modalContent.appendChild(recommendationsSection)
  }

  modal.appendChild(modalContent)
  document.body.appendChild(modal)
}

// Función para actualizar el estado de los componentes
async function updateComponentsStatus() {
  const componentsContainer = document.getElementById("components-container")
  componentsContainer.innerHTML =
    '<div class="component-card"><div class="component-header"><div class="component-name">Cargando componentes...</div><span class="loading"></span></div></div>'

  try {
    const result = await checkAllComponents()

    if (result && result.components) {
      componentsContainer.innerHTML = ""

      // Ordenar componentes por estado (error, warning, success)
      const sortedComponents = Object.values(result.components).sort((a, b) => {
        const statusOrder = { error: 0, warning: 1, success: 2, unknown: 3 }
        return statusOrder[a.status] - statusOrder[b.status]
      })

      sortedComponents.forEach((component) => {
        componentsContainer.appendChild(renderComponentStatus(component))
      })

      // Actualizar estado del sistema
      updateSystemStatus(result)

      // Actualizar recomendaciones
      updateRecommendations(result.recommendations)
    } else {
      componentsContainer.innerHTML =
        '<div class="component-card"><div class="component-header"><div class="component-name">Error al cargar componentes</div><span class="status-indicator status-error"></span></div></div>'
    }
  } catch (error) {
    console.error("Error al actualizar estado de componentes:", error)
    componentsContainer.innerHTML =
      '<div class="component-card"><div class="component-header"><div class="component-name">Error al cargar componentes</div><span class="status-indicator status-error"></span></div></div>'
  }
}

// Función para actualizar el estado del sistema
function updateSystemStatus(result) {
  const systemStatusEl = document.getElementById("system-status")
  const systemDetailsEl = document.getElementById("system-status-details")

  systemStatusEl.innerHTML = ""

  const statusIndicator = document.createElement("span")
  statusIndicator.className = `status-indicator status-${result.status === "success" ? "ok" : result.status === "warning" ? "warning" : "error"}`
  systemStatusEl.appendChild(statusIndicator)

  const statusText = document.createElement("span")
  statusText.textContent =
    result.status === "success" ? "Operativo" : result.status === "warning" ? "Advertencias" : "Crítico"
  systemStatusEl.appendChild(statusText)

  systemDetailsEl.textContent = `${result.summary.success} correctos, ${result.summary.warning} advertencias, ${result.summary.error} errores`
}

// Función para actualizar recomendaciones
function updateRecommendations(recommendations) {
  const recommendationsContainer = document.getElementById("recommendations-container")
  const recommendationsList = document.getElementById("recommendations-list")

  if (recommendations && recommendations.length > 0) {
    recommendationsContainer.style.display = "block"
    recommendationsList.innerHTML = ""

    recommendations.forEach((rec) => {
      const li = document.createElement("li")
      li.innerHTML = `<strong>${rec.component}:</strong> ${rec.recommendation}`
      recommendationsList.appendChild(li)
    })
  } else {
    recommendationsContainer.style.display = "none"
  }
}

// Función para probar endpoints de la API
async function testApiEndpoint(endpoint) {
  const resultContainer = document.getElementById("api-test-result")
  resultContainer.innerHTML = '<div class="loading-spinner"></div><p>Probando endpoint...</p>'

  try {
    const startTime = performance.now()
    const response = await fetch(endpoint)
    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)

    let responseData
    let responseText = ""

    try {
      responseData = await response.json()
      responseText = JSON.stringify(responseData, null, 2)
    } catch (e) {
      responseText = await response.text()
    }

    const statusClass = response.ok ? "success" : "error"

    resultContainer.innerHTML = `
      <div class="api-response ${statusClass}">
        <div class="api-response-header">
          <div class="api-response-status">
            <span class="status-indicator status-${response.ok ? "ok" : "error"}"></span>
            <span>Estado: ${response.status} ${response.statusText}</span>
          </div>
          <div class="api-response-time">Tiempo: ${responseTime}ms</div>
        </div>
        <div class="api-response-body">
          <pre>${responseText}</pre>
        </div>
      </div>
    `
  } catch (error) {
    resultContainer.innerHTML = `
      <div class="api-response error">
        <div class="api-response-header">
          <div class="api-response-status">
            <span class="status-indicator status-error"></span>
            <span>Error</span>
          </div>
        </div>
        <div class="api-response-body">
          <pre>Error al probar el endpoint: ${error.message}</pre>
        </div>
      </div>
    `
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // Actualizar estado de componentes
  updateComponentsStatus()

  // Configurar botones de prueba de API
  const apiRootBtn = document.getElementById("test-api-root")
  const healthCheckBtn = document.getElementById("test-health-check")
  const testApiBtn = document.getElementById("test-api-test")
  const customEndpointForm = document.getElementById("custom-endpoint-form")

  if (apiRootBtn) {
    apiRootBtn.addEventListener("click", () => {
      testApiEndpoint("/api")
    })
  }

  if (healthCheckBtn) {
    healthCheckBtn.addEventListener("click", () => {
      testApiEndpoint("/api/health")
    })
  }

  if (testApiBtn) {
    testApiBtn.addEventListener("click", () => {
      testApiEndpoint("/api/test")
    })
  }

  if (customEndpointForm) {
    customEndpointForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const endpointInput = document.getElementById("custom-endpoint")
      if (endpointInput && endpointInput.value) {
        testApiEndpoint(endpointInput.value)
      }
    })
  }

  // Actualizar cada 5 minutos
  setInterval(updateComponentsStatus, 300000)
})
