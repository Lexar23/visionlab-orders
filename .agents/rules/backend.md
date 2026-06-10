---
trigger: always_on
---

vamos a hacer un sistema de tracker de ordenes para lentes de contacto, nombre VisTracker
vamos a usar sistema de grab and put para ordenar las ordenes de produccion  
sistema de login de usuario nombre ID y contraseña
no se puede avanzar sin el login en ninguna pagina  



estructura de orden
cada orden va a mostrar solamente el numero de orden y los dias restantes para la entrega {el bacground cambia de color dependiendo el numero de dias faltantes 

orden -- sucursal -- factura  -- fecha de inicio ----dias para la entrega{vamos a usar un sistema de colores para los lentes que tiene 0, 1, 2 dias para la entrega }
un cuadro de observaciones editable--boton de save solo para las observaciones 

........................

layout 
navbar{
 inicio
 Ingreso
 Pendiente
 produccion 
 Teñido
 Calidad
 Facturacion 
 Retrabajos 
 Entregado
 }
pagina principal{
 2 columnas
 la primera muestra todas las ordenes en el sistema exepto entregadas agrupadas con un dropdown con la cantidad de ordenes pendiente 
 la segunda va tener una lista  
tiene boton de agregar{orden o Tarea} con un formulario con la misma informacion de orden o una indicacion de tarea para la segunda columna 
 en la tarea va a mostrar un contador de dias dictados por la persona 
} 

cada una de las otras paginas va a mostrar el conjunto de ordenes que muestre en su estado como si fuera un filtro

cuando las ordenes lleguen a entregadas se van a mostrar por una semana y cuantos dias llevan entregadas 