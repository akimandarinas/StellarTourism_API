# generate_model.py
# Script para MySQL Workbench Scripting Shell
# Ejecutar desde el menú "Scripting Shell" de Workbench: File → Run Script...

import grt
from grt.modules import ReverseEngineerMySQL

def main():
    # Conexión a la base de datos (ajusta host, puerto, usuario y contraseña)
    conn = ReverseEngineerMySQL.connect('127.0.0.1', 3306, 'root', '', 'stellar_tourism')

    # Crear un nuevo modelo y esquema físico
    wbdoc = grt.root.wb.doc
    catalog = wbdoc.createCatalog('stellar_tourism_model')
    phys_schema = catalog.createPhysicalSchema('stellar_tourism')

    # Incluir todas las tablas al modelo
    ReverseEngineerMySQL.reverseEngineer(phys_schema, conn)

    # Guardar el modelo como archivo .mwb
    output_path = '/mnt/data/stellar_tourism.mwb'
    wbdoc.saveAsModel(output_path)
    print(f'Modelo guardado en: {output_path}')

if __name__ == '__main__':
    main()
