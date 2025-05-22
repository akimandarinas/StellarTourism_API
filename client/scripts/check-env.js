#!/usr/bin/env node

/* Script para verificar que todas las variables de entorno estén definidas */

import fs from "fs"
import path from "path"
import dotenv from "dotenv"

dotenv.config()

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

// Variables de entorno requeridas
const requiredEnvVars = [
  {
    name: "PUBLIC_API_URL",
    description: "URL base de la API",
    defaultValue: "http://localhost:8000/api",
    validator: (value) => value && value.startsWith("http"),
  },
  {
    name: "VITE_FIREBASE_API_KEY",
    description: "Clave de API de Firebase",
    validator: (value) => value && value.length > 10,
  },
  {
    name: "VITE_FIREBASE_AUTH_DOMAIN",
    description: "Dominio de autenticación de Firebase",
    validator: (value) => value && value.includes("."),
  },
  {
    name: "VITE_FIREBASE_PROJECT_ID",
    description: "ID del proyecto de Firebase",
    validator: (value) => value && value.length > 0,
  },
  {
    name: "VITE_STRIPE_PUBLISHABLE_KEY",
    description: "Clave publicable de Stripe",
    validator: (value) => value && (value.startsWith("pk_test_") || value.startsWith("pk_live_")),
  },
]

// Función para verificarlas
function checkEnvVars() {
  log("Verificando variables de entorno...", colors.cyan)

  let missingVars = 0
  let invalidVars = 0

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name] || envVar.defaultValue

    if (!value) {
      log(`Error: Variable de entorno requerida no definida: ${envVar.name}`, colors.red)
      log(`  Descripción: ${envVar.description}`, colors.yellow)
      missingVars++
      continue
    }

    if (envVar.validator && !envVar.validator(value)) {
      log(`Error: Variable de entorno inválida: ${envVar.name}`, colors.red)
      log(`  Valor actual: ${value}`, colors.yellow)
      log(`  Descripción: ${envVar.description}`, colors.yellow)
      invalidVars++
      continue
    }

    log(`✓ ${envVar.name}: ${value.substring(0, 10)}${value.length > 10 ? "..." : ""}`, colors.green)
  }

  if (missingVars > 0 || invalidVars > 0) {
    log(`\nSe encontraron ${missingVars} variables faltantes y ${invalidVars} variables inválidas.`, colors.red)
    log("Por favor, configura correctamente las variables de entorno en el archivo .env", colors.yellow)
    process.exit(1)
  }

  log("\n✓ Todas las variables de entorno están configuradas correctamente", colors.green)
}

// Verificar si existe .env
function checkEnvFile() {
  log("Verificando archivo .env...", colors.cyan)

  const envPath = path.resolve(".env")

  if (!fs.existsSync(envPath)) {
    log("Error: No se encontró el archivo .env", colors.red)
    log("Por favor, crea un archivo .env en la raíz del proyecto", colors.yellow)
    process.exit(1)
  }

  log("✓ Archivo .env encontrado", colors.green)
}




function main() {
  log("=== Verificación de variables de entorno ===", colors.magenta)

  checkEnvFile()
  checkEnvVars()

  log("=== Verificación completada con éxito ===", colors.magenta)
}

// Ejecutar la función principal
main()
