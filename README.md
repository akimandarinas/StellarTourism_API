    ########################################
    ##########    INSTRUCCIONES    #########
    ########################################

1. Instalar y habilitar XAMPP.

2. Mover la carpeta stellar-tourism a xampp/htdocs

3. Ejecutar el script Diagrama_Entidad_Relacion.py, lo que generará 
   un diagrama para la base de datos.

4. Ir a http://localhost/phpmyadmin/index.php y crear una nueva BBDD.
   Importa todos los archivos .sql de la carpeta database.

5. Ir a la ruta de la api, abre el CMD y escribe composer install. Verificar que se instalan las dependencias.

6. Si prefieres no usar Apache de XAMPP, hay un servidor integrado que se ejecuta
   abriendo CMD y escribiendo php -S localhost:8000 -t public
   Si el servidor responde: PHP 8.2.28 Development Server (http://localhost:8000) started
   es que la api funciona correctamente en local. Si existe algun error en las llamadas, la consola lo mostrara.

7. Si el servidor da continuos errores, he implementado algunos scripts para corregir dependencias.
   Tambien hay un index.html en la ruta api/public/index.html con una solucion unificada para testear rutas esperadas, modelos,
   respuestas http y de la base de datos. Tambien hay en /public otras herramientas de diagnostico. 
   Tambien he implementado un validador de consultas y una solucion para enviar datos de prueba automáticamente a la Base de datos.

8. Cuando la api funcione correctamente y el servidor esté corriendo en la consola, ir a la carpeta client
   y en otra consola escribir npm install. Se verificarán todas las dependencias y sus compatibilidades.
   Cuando se instalen todas las dependencias escribir npm run dev para inicializar el servidor de desarrollo del cliente 
   en el puerto localhost:3000.

9. Si persisten errores de incompatibilidad de dependencias en el packaje.json, en client existen varios scrpts de respaldo para arreglar las dependencias.

10. Ahora, abre el navegador y abre localhost:3000 con MySQL de XAMPP encendido, Apache (o el servidor integrado), y el servidor de desarrollo de node en la consola,
    en la que nos imprimirá errores decarga y visualizacion
