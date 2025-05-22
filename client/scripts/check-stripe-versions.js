#!/usr/bin/env node

/* Script para verificar la compatibilidad de Stripe entre el cliente y la API. */

const fs = require("fs")
const path = require("path")
const axios = require("axios")
const dotenv = require("dotenv")

dotenv.config()

// Configuración
const API_URL = process.env.PUBLIC_API_URL || "http://localhost:8000/api"
const STRIPE_CHECK_ENDPOINT = `${API_URL}/stripe-check.php`
const CLIENT_PACKAGE_JSON = path.resolve(__dirname, "../package.json")

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

async function checkStripeVersions() {
  console.log(`${colors.blue}Verificando compatibilidad de versiones de Stripe...${colors.reset}\n`)

  try {
    // Obtener Stripe del cliente
    const clientPackageJson = JSON.parse(fs.readFileSync(CLIENT_PACKAGE_JSON, "utf8"))
    const clientStripeVersion = clientPackageJson.dependencies["@stripe/stripe-js"] || "No encontrado"

    console.log(`${colors.cyan}Versión de Stripe en el cliente:${colors.reset} ${clientStripeVersion}`)

    console.log(`\n${colors.cyan}Verificando configuración de Stripe en la API...${colors.reset}`)

    const response = await axios.get(STRIPE_CHECK_ENDPOINT)
    const apiStripeConfig = response.data

    console.log(`\n${colors.cyan}Resultado de la verificación:${colors.reset}`)
    console.log(`- Estado: ${getStatusColor(apiStripeConfig.status)}${apiStripeConfig.status}${colors.reset}`)
    console.log(`- Mensaje: ${apiStripeConfig.message}`)
    console.log(`- Entorno: ${apiStripeConfig.config.environment}`)
    console.log(`- Modo de Stripe: ${apiStripeConfig.config.stripe_mode}`)
    console.log(`- Clave secreta: ${apiStripeConfig.config.has_secret_key ? "Configurada" : "No configurada"}`)
    console.log(`- Clave pública: ${apiStripeConfig.config.has_publishable_key ? "Configurada" : "No configurada"}`)
    console.log(`- Secreto de webhook: ${apiStripeConfig.config.has_webhook_secret ? "Configurado" : "No configurado"}`)

    // Verificar requisitos
    console.log(`\n${colors.cyan}Requisitos:${colors.reset}`)
    console.log(`- cURL: ${apiStripeConfig.requirements.curl ? "✅ Habilitado" : "❌ No habilitado"}`)
    console.log(`- JSON: ${apiStripeConfig.requirements.json ? "✅ Habilitado" : "❌ No habilitado"}`)

    // Verificar directorios
    console.log(`\n${colors.cyan}Directorios:${colors.reset}`)
    console.log(`- Directorio de webhooks: ${getDirStatus(apiStripeConfig.directories.webhook_dir)}`)
    console.log(`- Archivo de logs: ${getDirStatus(apiStripeConfig.directories.stripe_log_file)}`)

    console.log(`\n${colors.cyan}Modo de prueba:${colors.reset}`)
    console.log(`- Habilitado: ${apiStripeConfig.test_mode.enabled ? "✅ Sí" : "❌ No"}`)
    console.log(
      `- Tarjetas de prueba: ${apiStripeConfig.test_mode.test_cards_available ? "✅ Disponibles" : "❌ No disponibles"}`,
    )
    console.log(
      `- Simulador de webhooks: ${apiStripeConfig.test_mode.webhook_simulator_available ? "✅ Disponible" : "❌ No disponible"}`,
    )

    console.log(`\n${colors.blue}Resumen:${colors.reset}`)
    if (apiStripeConfig.status === "success") {
      console.log(
        `${colors.green}✅ La configuración de Stripe es compatible entre el cliente y la API.${colors.reset}`,
      )
    } else if (apiStripeConfig.status === "warning") {
      console.log(
        `${colors.yellow}⚠️ Hay advertencias en la configuración de Stripe. Revise los detalles anteriores.${colors.reset}`,
      )
    } else {
      console.log(
        `${colors.red}❌ Hay errores en la configuración de Stripe. Revise los detalles anteriores.${colors.reset}`,
      )
    }
  } catch (error) {
    console.error(`${colors.red}Error al verificar la compatibilidad de versiones de Stripe:${colors.reset}`)
    if (error.response) {
      console.error(`- Estado: ${error.response.status}`)
      console.error(`- Datos: ${JSON.stringify(error.response.data, null, 2)}`)
    } else if (error.request) {
      console.error(`- No se pudo conectar con la API. Verifique que esté en ejecución.`)
    } else {
      console.error(`- Error: ${error.message}`)
    }
    process.exit(1)
  }
}

function getStatusColor(status) {
  switch (status) {
    case "success":
      return colors.green
    case "warning":
      return colors.yellow
    case "error":
      return colors.red
    default:
      return colors.reset
  }
}

function getDirStatus(dir) {
  if (!dir.exists) {
    return `❌ No existe (${dir.path})`
  } else if (!dir.writable) {
    return `⚠️ Existe pero no es escribible (${dir.path})`
  } else {
    return `✅ Existe y es escribible (${dir.path})`
  }
}

checkStripeVersions()
