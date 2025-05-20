#!/usr/bin/env node

/**
 * Script para verificar que todas las dependencias estén instaladas y en versiones compatibles
 */

import fs from "fs"
import path from "path"
import { execSync } from "child_process"

// Colores para la consola
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

// Función para imprimir mensajes con colores
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

// Función para verificar si un comando existe
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: "ignore" })
    return true
  } catch (e) {
    return false
  }
}

// Verificar que Node.js esté instalado y en la versión correcta
function checkNodeVersion() {
  log("Verificando Node.js...", colors.cyan)

  const nodeVersion = process.version
  log(`Versión de Node.js: ${nodeVersion}`, colors.blue)

  const requiredVersion = ">=18.0.0"
  const packageJson = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf8"))
  const engineNode = packageJson.engines?.node || requiredVersion

  // Verificación simple (podría mejorarse con semver)
  const currentVersion = Number.parseInt(nodeVersion.slice(1).split(".")[0], 10)
  const requiredMinVersion = Number.parseInt(engineNode.replace(">=", "").split(".")[0], 10)

  if (currentVersion < requiredMinVersion) {
    log(`Error: Se requiere Node.js ${engineNode}, pero tienes ${nodeVersion}`, colors.red)
    log("Por favor, actualiza Node.js: https://nodejs.org/", colors.yellow)
    process.exit(1)
  }

  log("✓ Node.js está en la versión correcta", colors.green)
}

// Verificar que npm esté instalado
function checkNpm() {
  log("Verificando npm...", colors.cyan)

  if (!commandExists("npm")) {
    log("Error: npm no está instalado", colors.red)
    log("Por favor, instala npm: https://www.npmjs.com/get-npm", colors.yellow)
    process.exit(1)
  }

  const npmVersion = execSync("npm --version").toString().trim()
  log(`Versión de npm: ${npmVersion}`, colors.blue)

  log("✓ npm está instalado", colors.green)
}

// Verificar que las dependencias estén instaladas
function checkDependencies() {
  log("Verificando dependencias...", colors.cyan)

  try {
    // Verificar si node_modules existe
    if (!fs.existsSync(path.resolve("node_modules"))) {
      log("Error: Las dependencias no están instaladas", colors.red)
      log("Por favor, ejecuta: npm install", colors.yellow)
      process.exit(1)
    }

    // Verificar dependencias críticas
    const criticalDeps = ["vue", "astro", "firebase", "axios", "pinia", "vue-router", "@stripe/stripe-js"]

    for (const dep of criticalDeps) {
      try {
        // Intentar importar la dependencia
        const depPath = path.resolve(`node_modules/${dep}/package.json`)
        if (!fs.existsSync(depPath)) {
          log(`Error: Dependencia crítica no encontrada: ${dep}`, colors.red)
          log("Por favor, ejecuta: npm install", colors.yellow)
          process.exit(1)
        }

        const depPackage = JSON.parse(fs.readFileSync(depPath, "utf8"))
        log(`✓ ${dep}@${depPackage.version}`, colors.green)
      } catch (e) {
        log(`Error al verificar dependencia ${dep}: ${e.message}`, colors.red)
        process.exit(1)
      }
    }

    log("✓ Todas las dependencias críticas están instaladas", colors.green)
  } catch (e) {
    log(`Error al verificar dependencias: ${e.message}`, colors.red)
    process.exit(1)
  }
}

// Verificar compatibilidad de versiones
function checkVersionCompatibility() {
  log("Verificando compatibilidad de versiones...", colors.cyan)

  try {
    // Verificar compatibilidad de Vue y Vue Router
    const vuePackage = JSON.parse(fs.readFileSync(path.resolve("node_modules/vue/package.json"), "utf8"))
    const vueRouterPackage = JSON.parse(fs.readFileSync(path.resolve("node_modules/vue-router/package.json"), "utf8"))

    const vueMajorVersion = Number.parseInt(vuePackage.version.split(".")[0], 10)
    const vueRouterMajorVersion = Number.parseInt(vueRouterPackage.version.split(".")[0], 10)

    if (vueMajorVersion !== 3 || vueRouterMajorVersion !== 4) {
      log(
        `Error: Incompatibilidad de versiones. Vue ${vuePackage.version} y Vue Router ${vueRouterPackage.version}`,
        colors.red,
      )
      log("Se requiere Vue 3.x y Vue Router 4.x", colors.yellow)
      process.exit(1)
    }

    log(`✓ Vue ${vuePackage.version} y Vue Router ${vueRouterPackage.version} son compatibles`, colors.green)

    // Verificar compatibilidad de Firebase
    const firebasePackage = JSON.parse(fs.readFileSync(path.resolve("node_modules/firebase/package.json"), "utf8"))
    const firebaseMajorVersion = Number.parseInt(firebasePackage.version.split(".")[0], 10)

    if (firebaseMajorVersion < 9) {
      log(`Error: Versión de Firebase incompatible: ${firebasePackage.version}`, colors.red)
      log("Se requiere Firebase 9.x o superior", colors.yellow)
      process.exit(1)
    }

    log(`✓ Firebase ${firebasePackage.version} es compatible`, colors.green)

    log("✓ Todas las versiones son compatibles", colors.green)
  } catch (e) {
    log(`Error al verificar compatibilidad de versiones: ${e.message}`, colors.red)
    process.exit(1)
  }
}

// Función principal
function main() {
  log("=== Verificación de dependencias ===", colors.magenta)

  checkNodeVersion()
  checkNpm()
  checkDependencies()
  checkVersionCompatibility()

  log("=== Verificación completada con éxito ===", colors.magenta)
}

// Ejecutar la función principal
main()
