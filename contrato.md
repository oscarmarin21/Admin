## 1. Justificación y definición del problema administrativo

Las empresas dedicadas al desarrollo de software enfrentan actualmente importantes
desafíos administrativos en la planeación y el control de sus proyectos. Uno de los
principales problemas identificados es la falta de herramientas integradas que permitan
visualizar el avance, la carga de trabajo y los resultados de cada sprint, afectando la
eficiencia, la comunicación y la toma de decisiones.
De acuerdo con el 18th State of Agile Report (Digital.ai, 2024), más del 60 % de las
empresas reportan dificultades en la coordinación y seguimiento de tareas cuando no
disponen de dashboards unificados para la gestión de proyectos ágiles. Esta carencia
repercute directamente en los pilares de la administración: planificación, organización,
dirección y control.
Por lo tanto, se propone el diseño de una herramienta tecnológica web que facilite la
gestión administrativa de proyectos de desarrollo, mediante la organización visual de
tareas, la documentación de reuniones y el seguimiento de indicadores clave de
desempeño. Esta herramienta busca optimizar la coordinación del equipo, incrementar
la transparencia y fortalecer la toma de decisiones basada en información actualizada.

### Contexto organizacional

La herramienta propuesta está orientada a empresas medianas de desarrollo de
software, similares a las que operan bajo modelos de trabajo por proyectos y


metodologías ágiles. En este tipo de organizaciones, los equipos están conformados por
entre 8 y 15 desarrolladores, un Product Owner, un Scrum Master y personal
administrativo que supervisa la ejecución de los proyectos.
Una problemática común observada en este tipo de empresas es la fragmentación de la
información, dado que la planeación, el seguimiento y las reuniones se manejan en
múltiples herramientas no integradas (hojas de cálculo, correos, mensajes en Slack).
Esto genera dificultades en la visibilidad del avance, en la coordinación interequipos y en
la trazabilidad de decisiones. La herramienta diseñada busca unificar esos procesos
administrativos y operativos en una sola plataforma, fortaleciendo la transparencia, el
control y la eficiencia del trabajo colaborativo.

## 2. Marco teórico

La propuesta se fundamenta en los principios clásicos de la administración y su
aplicación a los entornos tecnológicos actuales. Henri Fayol (1949) establece que la
administración se compone de cuatro funciones esenciales: planificación, organización,
dirección y control.
En el contexto del desarrollo de software, estas funciones se integran con metodologías
ágiles como Scrum y Kanban, que promueven la adaptabilidad, la mejora continua y la
colaboración.
● **Planificación:** Definición de objetivos, tareas y tiempos de ejecución a través de
sprints.
● **Organización:** Distribución de responsabilidades (Product Owner, Scrum Master,
equipo de desarrollo).
● **Dirección:** Coordinación del trabajo mediante reuniones diarias y revisiones
periódicas.
● **Control:** Medición del progreso y evaluación de resultados mediante indicadores
(completion rate, productividad).
Atlassian (2024) y Parabol (2024) destacan que la combinación de Scrum y Kanban
(Scrumban) es una tendencia actual que permite mayor visibilidad operativa sin perder
la estructura iterativa de los proyectos ágiles.

### Expansión teórica

Según Koontz y Weihrich (2015), la administración moderna combina el pensamiento
clásico con la adaptabilidad de los entornos dinámicos. Esto implica que los procesos de
planificación, organización, dirección y control deben traducirse en prácticas concretas
dentro de los sistemas de información.


En este caso, la herramienta tecnológica actúa como un instrumento de control
administrativo (según Fayol, 1949) y de dirección operativa (Koontz, 2015), al permitir
supervisar el rendimiento del equipo, coordinar tareas y garantizar el cumplimiento de
objetivos estratégicos dentro de los proyectos de software.

## 3. Metodología de desarrollo

Para el diseño de esta herramienta se adoptará la metodología Scrum, aplicada de forma
iterativa y con entregas incrementales.

### Etapas del proceso

```
● Levantamiento de requerimientos: Identificación de las necesidades
administrativas y técnicas del sistema.
● Diseño de arquitectura: Definición de las entidades principales y del flujo
general del sistema.
● Desarrollo iterativo: Construcción modular de componentes (autenticación,
tablero, reportes, registro de reuniones).
● Validación y ajustes: Evaluación del cumplimiento funcional y revisión con base
en los objetivos administrativos.
● Despliegue: Implementación y pruebas en la nube (Vercel).
```
### Buenas prácticas integradas

```
● Control de versiones con GitHub.
● Integración continua mediante Vercel (CI/CD automático).
● Arquitectura serverless para optimizar costos y tiempos de despliegue.
● Documentación técnica y funcional continua durante los sprints.
```
### Roles y responsabilidades

**Rol Responsabilidad
principal
Herramienta
utilizada
Relación con
función
administrativa**
Product Owner Define el backlog,
prioriza tareas y valida
resultados
Módulo de
proyectos
Planificación


```
Scrum Master Facilita las reuniones,
remueve obstáculos y
supervisa el flujo del
trabajo
Módulo de
reuniones y
reportes
Dirección
Equipo de
desarrollo
Ejecuta tareas asignadas
y actualiza estados en el
tablero
Panel Kanban Organización
Coordinador
administrativo
Supervisa métricas y
cumplimiento de
objetivos del sprint
Vista de reportes Control
```
## 4. Especificaciones funcionales y técnicas de la herramienta

### 4.1. Funcionalidades principales

**Módulo Descripción Objetivo administrativo**
Gestión de
proyectos
Crear, editar y listar proyectos con
fechas y responsables.
Planificación y
organización
Gestión de tareas Asignar tareas, definir estados (To Do,
Doing, Done).
Organización y control
Panel Kanban Visualizar el flujo de trabajo en
columnas arrastrables.
Control operativo
Registro de
reuniones
Guardar decisiones y lecciones
aprendidas.
Dirección y mejora
continua
Reporte de avance Mostrar el porcentaje de tareas
completadas por sprint (Completion
Rate).
Control y evaluación

### 4.2. Registro de reuniones y retrospectivas

El sistema incluirá un módulo sencillo para documentar las reuniones administrativas del
proyecto (dailies, reviews o retrospectivas). Cada registro contendrá:
● Fecha y tipo de reunión.
● Decisiones tomadas.


● Lecciones aprendidas.
● Responsable de seguimiento.
Los registros se almacenarán en una colección asociada a cada proyecto (meetings),
permitiendo consultar el historial de reuniones. Administrativamente, este componente
fortalece la gestión del conocimiento y el control de decisiones.

### 4.3. Reporte administrativo simplificado

El sistema presentará un único indicador: el Completion Rate o porcentaje de avance del
sprint.
Completion Rate = (Tareas Completadas / Tareas Totales) × 100
Este valor se mostrará en la interfaz como un porcentaje y una barra de progreso. La
métrica ofrece una visión clara del cumplimiento del sprint y sirve como referencia para
el control administrativo del proyecto. Se elimina la necesidad de gráficos complejos
(como burndown charts) para mantener simplicidad y eficiencia.

### 4.4. Arquitectura y despliegue

La herramienta seguirá una arquitectura cliente-servidor moderna, desarrollada
completamente con JavaScript.
**Componentes:**
● **Frontend:** React + Tailwind CSS (interfaz y vistas dinámicas).
● **Backend:** Node.js + Express (API REST serverless).
● **Base de datos:** MongoDB Atlas (almacenamiento en la nube).
● **Plataforma de despliegue:** Vercel (para frontend y backend unificados).
● **Control de versiones:** GitHub.
El despliegue en Vercel permite automatizar la integración y publicación del sistema con
cada commit, reduciendo tiempos y costos de mantenimiento.

### 4.5. Vistas funcionales previstas

Aunque no se desarrollará prototipo en esta etapa, se definen las vistas principales que
compondrán la herramienta:
● **Inicio de sesión (mock):** pantalla de acceso simbólico.
● **Dashboard principal:** resumen de proyectos con su porcentaje de avance.
● **Vista de proyecto:** tablero Kanban (To Do / Doing / Done).
● **Vista de reuniones:** formulario para registrar decisiones y aprendizajes.
● **Vista de reportes:** indicador de Completion Rate del sprint actual.


## Conclusiones y posibles mejoras

La herramienta propuesta aborda de manera efectiva las principales dificultades
administrativas presentes en la gestión de proyectos de desarrollo de software, al
integrar en una sola interfaz las funciones de planificación, dirección y control.
Su enfoque en la simplicidad —particularmente con el uso del Completion Rate como
indicador principal— permite mantener una visión clara del avance sin sobrecargar la
gestión con datos innecesarios.
En etapas futuras, se prevé ampliar la solución con funcionalidades como notificaciones
automáticas, integración con Slack o Jira, y análisis de desempeño predictivo,
fortaleciendo así su valor como sistema de apoyo administrativo y estratégico para
equipos ágiles.

## Referencias

```
Atlassian. (2024). Scrum vs. Kanban: Choosing the Right Agile Framework for Your
Team. https://www.atlassian.com
Digital.ai. (2024). 18th Annual State of Agile Report. https://stateofagile.com
Fayol, H. (1949). General and Industrial Management. Pitman Publishing.
Koontz, H., & Weihrich, H. (2015). Essentials of Management. McGraw-Hill Education.
Morningmate. (2025). Top 5 Challenges in Project Management for Software
Companies. https://www.morningmate.com
Parabol. (2024). Agile Trends and Insights for 2024. https://www.parabol.co/blog
TechnologyAdvice. (2025). Hybrid Agile Approaches in Modern Software Teams.
https://technologyadvice.com
```

