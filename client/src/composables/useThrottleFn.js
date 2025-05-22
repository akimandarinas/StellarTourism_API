/**
 * Composable para limitar la frecuencia de ejecución de una función
 * @param {Function} fn - Función a limitar
 * @param {number} delay - Tiempo de espera en milisegundos
 * @returns {Function} - Función limitada
 */
export function useThrottleFn(fn, delay = 200) {
  let lastTime = 0
  let timer = null

  return function (...args) {
    const now = Date.now()
    const remaining = delay - (now - lastTime)

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }

      lastTime = now
      return fn.apply(this, args)
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now()
        timer = null
        fn.apply(this, args)
      }, remaining)
    }
  }
}
