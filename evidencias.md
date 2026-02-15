ID,Tipo de Prueba,Parámetros Enviados,Resultado Esperado
1,Búsqueda Relevante,q=arduino,"""Arduino Uno"" aparece primero (Score 10) que ""Sensor"" (Score 5)."
2,Búsqueda Vacía,q=,La pantalla se limpia y muestra el placeholder de inicio.
3,Solo Espacios,q=   ,El sistema ignora los espacios y trata la búsqueda como vacía.
4,Case Insensitive,q=RASPBERRY,Encuentra la Pi 4 correctamente sin importar las mayúsculas.
5,Filtro Combinado,q=web & cat=Educación,"Muestra únicamente el ""Curso Full Stack"" (Filtro doble)."
6,Selección de Chips,"tags=ia,seguridad",Muestra el curso de IA y el de Ciberseguridad (Filtro OR).
7,Rango de Precios,min=100 & max=500,Muestra el Multímetro ($320) y el Arduino ($250).
8,Ordenamiento,sort=newest,"El ""Curso Web"" (28 de Feb) aparece en la primera posición."
9,Paginación,page=2,Muestra los siguientes 4 productos del set de datos.
10,Sin Resultados,q=xbox,"Muestra el mensaje: ""😕 No se encontraron resultados""."