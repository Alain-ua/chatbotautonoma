import { syllabusData } from "./data.js"

// Variables de estado
let currentView = "login"
let selectedCourse = null
let selectedTopic = null
let timerInterval = null
let timeLeft = 15 * 60 // 15 minutos en segundos
let userAnswers = {}
let currentQuizQuestions = []
let userEmail = null
let userName = null
let userRole = "student" // Por defecto, el usuario es estudiante
let chatHistory = [] // Almacenar mensajes de chat para el contexto
let isGeneratingSummary = false // Control para la generación de resúmenes
let isGeneratingQuestions = false // Control para la generación de preguntas
let currentTheme = localStorage.getItem("theme") || "light" // Tema actual

// INICIO: Configuración de la IA
const API_KEY = "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" // Key API
const API_URL = "https://openrouter.ai/api/v1/chat/completions"
const AI_MODEL = "deepseek/deepseek-prover-v2:free"
// FIN: Configuración de la IA

// Datos de cursos con temas específicos para cada curso
const coursesData = [
  {
    id: "arquitectura",
    title: "Arquitectura de Software",
    description: "Principios y patrones para el diseño de sistemas de software escalables y mantenibles.",
    icon: "fa-building",
    color: "#e67e22",
    topics: [
      {
        id: "arq-semana1",
        title: "Semana 1: Introducción a la Arquitectura de Software",
        summary: `
          La arquitectura de software es la estructura fundamental que define cómo se organizan los componentes de un sistema y cómo interactúan entre sí. Esta disciplina establece las bases para el desarrollo de sistemas robustos, escalables y mantenibles.

          En esta primera semana, exploraremos los conceptos básicos de la arquitectura de software, su importancia en el ciclo de desarrollo y los diferentes estilos arquitectónicos más utilizados en la industria. Comprenderemos cómo una buena arquitectura puede mejorar la calidad del software y reducir los costos de mantenimiento a largo plazo.

          Analizaremos también el rol del arquitecto de software, sus responsabilidades y las habilidades necesarias para desempeñar esta función clave en los equipos de desarrollo modernos.
        `,
        questions: [
          {
            question: "¿Cuál es el principal objetivo de la arquitectura de software?",
            options: [
              "Crear interfaces de usuario atractivas",
              "Definir la estructura fundamental y las interacciones entre componentes del sistema",
              "Optimizar algoritmos para máximo rendimiento",
              "Documentar el código fuente"
            ],
            correctAnswerIndex: 1
          },
          {
            question: "¿Qué característica NO es típicamente responsabilidad del arquitecto de software?",
            options: [
              "Seleccionar los patrones de diseño apropiados",
              "Programar todas las funcionalidades del sistema",
              "Evaluar requisitos no funcionales como escalabilidad y seguridad",
              "Definir interfaces entre componentes"
            ],
            correctAnswerIndex: 1
          },
          {
            question: "¿Por qué es importante la arquitectura de software en proyectos grandes?",
            options: [
              "Porque hace que el código se ejecute más rápido",
              "Porque reduce la necesidad de pruebas",
              "Porque facilita la comprensión, evolución y mantenimiento del sistema",
              "Porque elimina la necesidad de documentación"
            ],
            correctAnswerIndex: 2
          }
        ]
      },
      {
        id: "arq-semana2",
        title: "Semana 2: Patrones Arquitectónicos",
        summary: `
          Los patrones arquitectónicos son soluciones probadas a problemas recurrentes en la arquitectura de software. Representan buenas prácticas que han evolucionado a lo largo del tiempo y proporcionan un vocabulario común para los arquitectos.

          En esta semana, estudiaremos en profundidad los patrones arquitectónicos más importantes como Capas, Cliente-Servidor, Modelo-Vista-Controlador (MVC), Microservicios, y Arquitectura Orientada a Servicios (SOA). Para cada patrón, analizaremos sus componentes, relaciones, ventajas, desventajas y casos de uso apropiados.

          También aprenderemos a seleccionar el patrón adecuado según los requisitos específicos del proyecto y cómo combinar diferentes patrones para resolver problemas complejos.
        `,
        questions: [
          {
            question: "¿Qué patrón arquitectónico divide la aplicación en presentación, lógica de negocio y acceso a datos?",
            options: [
              "Microservicios",
              "Arquitectura por capas",
              "Arquitectura basada en eventos",
              "Arquitectura peer-to-peer"
            ],
            correctAnswerIndex: 1
          },
          {
            question: "La arquitectura de microservicios se caracteriza por:",
            options: [
              "Un monolito que contiene toda la funcionalidad",
              "Servicios pequeños e independientes que se comunican a través de APIs",
              "Una estructura rígida que dificulta los cambios",
              "La necesidad de desplegar toda la aplicación en cada actualización"
            ],
            correctAnswerIndex: 1
          },
          {
            question: "¿Cuál es una ventaja del patrón MVC (Modelo-Vista-Controlador)?",
            options: [
              "Simplifica el desarrollo al mezclar la lógica de negocio con la interfaz",
              "Reduce la necesidad de pruebas unitarias",
              "Permite la separación de responsabilidades y facilita el mantenimiento",
              "Elimina la necesidad de bases de datos"
            ],
            correctAnswerIndex: 2
          }
        ]
      },
      {
        id: "arq-semana3",
        title: "Semana 3: Calidad y Evaluación Arquitectónica",
        summary: `
          La calidad de una arquitectura de software determina en gran medida la calidad del producto final. Es crucial evaluar sistemáticamente las decisiones arquitectónicas para asegurar que cumplen con los requisitos establecidos.

          Durante esta semana, exploraremos los atributos de calidad como rendimiento, seguridad, disponibilidad, modificabilidad y usabilidad. Aprenderemos métodos para evaluar arquitecturas, incluyendo el Método de Análisis de Compensaciones Arquitectónicas (ATAM) y el Análisis de Costo-Beneficio.

          También estudiaremos cómo documentar adecuadamente una arquitectura utilizando diferentes vistas (lógica, de proceso, de desarrollo, física) y notaciones como UML y C4, para comunicar efectivamente las decisiones arquitectónicas a diferentes audiencias.
        `,
        questions: [
          {
            question: "¿Qué es ATAM en el contexto de la arquitectura de software?",
            options: [
              "Un lenguaje de programación para arquitectos",
              "Un método para evaluar arquitecturas basado en atributos de calidad",
              "Una herramienta de modelado UML",
              "Un framework de desarrollo ágil"
            ],
            correctAnswerIndex: 1
          },
          {
            question: "¿Cuál de los siguientes NO es un atributo de calidad típico en arquitectura de software?",
            options: [
              "Rendimiento",
              "Seguridad",
              "Popularidad en redes sociales",
              "Modificabilidad"
            ],
            correctAnswerIndex: 2
          },
          {
            question: "¿Por qué es importante documentar una arquitectura de software?",
            options: [
              "Para cumplir con requisitos legales únicamente",
              "Para aumentar el costo del proyecto",
              "Para comunicar decisiones y facilitar el entendimiento entre stakeholders",
              "Porque es obligatorio en todos los proyectos de software"
            ],
            correctAnswerIndex: 2
          }
        ]
      }
    ]
  },
  {
    id: "cloud",
    title: "Computación en la Nube",
    description: "Fundamentos y aplicaciones de servicios en la nube, virtualización y contenedores.",
    icon: "fa-cloud",
    color: "#3498db",
    topics: [
      {
        id: "cloud-semana1",
        title: "Semana 1: Fundamentos de la Computación en la Nube",
        summary: `
          La computación en la nube representa un cambio paradigmático en la forma en que se entregan y consumen los recursos informáticos. En lugar de mantener servidores físicos y centros de datos, las organizaciones pueden acceder a recursos computacionales bajo demanda a través de internet.

          En esta primera semana, exploraremos los conceptos fundamentales de la computación en la nube, incluyendo sus características esenciales: autoservicio bajo demanda, amplio acceso a la red, agrupación de recursos, elasticidad rápida y servicio medido.

          También estudiaremos los diferentes modelos de servicio (IaaS, PaaS, SaaS) y modelos de implementación (público, privado, híbrido, comunitario), así como las ventajas y desafíos que presenta la adopción de la nube para las organizaciones modernas.
        `,
        questions: [
          {
            question: "¿Cuál de los siguientes NO es un modelo de servicio en la nube?",
            options: [
              "Infraestructura como Servicio (IaaS)",
              "Plataforma como Servicio (PaaS)",
              "Software como Servicio (SaaS)",
              "Hardware como Servicio (HaaS)"
            ],
            correctAnswerIndex: 3
          },
          {
            question: "¿Qué característica de la computación en la nube permite aumentar o disminuir recursos rápidamente según la demanda?",
            options: [
              "Servicio medido",
              "Elasticidad",
              "Agrupación de recursos",
              "Autoservicio bajo demanda"
            ],
            correctAnswerIndex: 1
          },
          {
            question: "¿Cuál es la principal diferencia entre la nube pública y la nube privada?",
            options: [
              "La nube pública es gratuita mientras que la privada es de pago",
              "La nube pública está disponible para cualquier usuario, mientras que la privada es exclusiva para una organización",
              "La nube pública solo permite almacenar datos, mientras que la privada permite ejecutar aplicaciones",
              "La nube pública es más segura que la privada"
            ],
            correctAnswerIndex: 1
          }
        ]
      },
      {
        id: "cloud-semana2",
        title: "Semana 2: Proveedores de Servicios en la Nube",
        summary: `
          El mercado de servicios en la nube está dominado por varios proveedores importantes, cada uno con sus propias fortalezas, servicios y modelos de precios. Comprender las diferencias entre estos proveedores es esencial para seleccionar la plataforma adecuada para cada caso de uso.

          Durante esta semana, analizaremos en detalle los principales proveedores de servicios en la nube: Amazon Web Services (AWS), Microsoft Azure, Google Cloud Platform (GCP), IBM Cloud y otros. Estudiaremos sus servicios más destacados, arquitecturas de referencia, modelos de precios y casos de uso ideales.

          También aprenderemos estrategias para evitar el bloqueo de proveedores (vendor lock-in) y exploraremos enfoques multi-nube que permiten aprovechar lo mejor de diferentes plataformas.
        `,
        questions: [
          {
            question: "¿Cuál de los siguientes NO es uno de los principales proveedores de servicios en la nube?",
            options: [
              "Amazon Web Services (AWS)",
              "Microsoft Azure",
              "Google Cloud Platform (GCP)",
              "Adobe Cloud Services"
            ],
            correctAnswerIndex: 3
          },
          {
            question: "¿Qué es el 'vendor lock-in' en el contexto de la computación en la nube?",
            options: [
              "Una característica de seguridad que bloquea el acceso no autorizado",
              "La dependencia excesiva de un proveedor específico que dificulta cambiar a otro",
              "Un contrato que garantiza precios fijos durante un período",
              "Un sistema de autenticación de dos factores"
            ],
            correctAnswerIndex: 1
          },
          {
            question: "¿Qué servicio de AWS proporciona capacidad de cómputo redimensionable en la nube?",
            options: [
              "Amazon S3",
              "Amazon EC2",
              "Amazon RDS",
              "Amazon Lambda"
            ],
            correctAnswerIndex: 1
          }
        ]
      },
      {
        id: "cloud-semana3",
        title: "Semana 3: Virtualización y Contenedores",
        summary: `
          La virtualización y los contenedores son tecnologías fundamentales que hacen posible la computación en la nube moderna. Permiten utilizar eficientemente los recursos de hardware y facilitan la implementación, escalabilidad y portabilidad de las aplicaciones.

          En esta semana, estudiaremos los conceptos básicos de la virtualización, incluyendo hipervisores tipo 1 y tipo 2, máquinas virtuales y sus componentes. Compararemos este enfoque tradicional con la tecnología de contenedores, explorando en detalle Docker, su arquitectura, comandos básicos y mejores prácticas.

          También analizaremos las plataformas de orquestación de contenedores como Kubernetes, que permiten gestionar despliegues complejos de aplicaciones contenerizadas a escala, automatizando tareas como el equilibrio de carga, la escalabilidad y la recuperación ante fallos.
        `,
        questions: [
          {
            question: "¿Cuál es la principal diferencia entre máquinas virtuales y contenedores?",
            options: [
              "Las máquinas virtuales son más rápidas que los contenedores",
              "Los contenedores comparten el sistema operativo del host, mientras que las máquinas virtuales tienen su propio sistema operativo",
              "Los contenedores solo funcionan en la nube pública",
              "Las máquinas virtuales no pueden ejecutar aplicaciones empresariales"
            ],
            correctAnswerIndex: 1
          },
          {
            question: "¿Qué tecnología es Docker?",
            options: [
              "Un hipervisor tipo 1",
              "Un sistema operativo para servidores",
              "Una plataforma de contenedores",
              "Un lenguaje de programación para la nube"
            ],
            correctAnswerIndex: 2
          },
          {
            question: "¿Cuál es la función principal de Kubernetes?",
            options: [
              "Crear imágenes de contenedores",
              "Orquestar y gestionar clústeres de contenedores",
              "Virtualizar hardware físico",
              "Proporcionar almacenamiento en la nube"
            ],
            correctAnswerIndex: 1
          }
        ]
      }
    ]
  },
  {
    id: "mobile",
    title: "Aplicaciones Móviles",
    description: "Desarrollo de aplicaciones para dispositivos móviles en plataformas iOS y Android.",
    icon: "fa-mobile-alt",
    color: "#9b59b6",
    topics: [
      {
        id: "mobile-semana1",
        title: "Semana 1: Introducción al Desarrollo Móvil",
        summary: `
          El desarrollo de aplicaciones móviles se ha convertido en una de las áreas más dinámicas y relevantes de la industria del software. Con miles de millones de dispositivos móviles en uso en todo el mundo, las aplicaciones móviles representan una forma poderosa de llegar a los usuarios.

          En esta primera semana, exploraremos el panorama actual del desarrollo móvil, incluyendo las principales plataformas (iOS y Android), sus características, cuotas de mercado y ecosistemas. Analizaremos las diferencias entre aplicaciones nativas, híbridas y web progresivas (PWA), con sus respectivas ventajas y desventajas.

          También estudiaremos el ciclo de vida del desarrollo de aplicaciones móviles, desde la concepción y diseño hasta la publicación en las tiendas de aplicaciones y el mantenimiento posterior. Discutiremos consideraciones importantes como la experiencia de usuario en dispositivos móviles, las limitaciones de recursos y la diversidad de dispositivos.
        `,
        questions: [
          {
            question: "¿Cuál es la principal ventaja de las aplicaciones nativas frente a las híbridas?",
            options: [
              "Son más baratas de desarrollar",
              "Requieren menos tiempo de desarrollo",
              "Ofrecen mejor rendimiento y acceso completo a las capacidades del dispositivo",
              "Funcionan en todas las plataformas con un solo código"
            ],
            correctAnswerIndex: 2
          },
          {
            question: "¿Qué lenguaje de programación se utiliza principalmente para el desarrollo nativo en Android?",
            options: [
              "Swift",
              "Objective-C",
              "Java/Kotlin",
              "C#"
            ],
            correctAnswerIndex: 2
          },
          {
            question: "¿Qué son las PWA (Progressive Web Apps)?",
            options: [
              "Aplicaciones nativas para Windows Phone",
              "Aplicaciones web que ofrecen una experiencia similar a las nativas",
              "Un tipo de framework para desarrollo híbrido",
              "Aplicaciones exclusivas para tabletas"
            ],
            correctAnswerIndex: 1
          }
        ]
      },
      {
        id: "mobile-semana2",
        title: "Semana 2: Diseño de Interfaces para Móviles",
        summary: `
          El diseño de interfaces de usuario (UI) y experiencia de usuario (UX) es particularmente crítico en aplicaciones móviles debido a las limitaciones de espacio en pantalla, la interacción táctil y los diversos contextos de uso. Un buen diseño puede marcar la diferencia entre el éxito y el fracaso de una aplicación.

          Durante esta semana, estudiaremos los principios fundamentales del diseño móvil, incluyendo las guías de diseño de Material Design (Android) y Human Interface Guidelines (iOS). Aprenderemos sobre layouts responsivos, sistemas de navegación, tipografía, color y otros elementos visuales adaptados al contexto móvil.

          También exploraremos técnicas para mejorar la usabilidad móvil, como el diseño para "el pulgar", la accesibilidad, los gestos táctiles y la retroalimentación visual y háptica. Analizaremos herramientas populares para prototipado y diseño de interfaces móviles como Figma, Sketch y Adobe XD.
        `,
        questions: [
          {
            question: "¿Qué es el 'diseño para el pulgar' en interfaces móviles?",
            options: [
              "Un diseño que solo funciona con huellas dactilares",
              "Colocar elementos interactivos en áreas fácilmente alcanzables con el pulgar",
              "Un sistema de navegación basado en gestos",
              "Un tipo de animación para botones"
            ],
            correctAnswerIndex: 1
          },
          {
            question: "¿Cuál de los siguientes NO es un principio de Material Design?",
            options: [
              "Diseño basado en papel y tinta",
              "Animaciones significativas",
              "Minimalismo extremo sin colores",
              "Uso de cuadrículas y espaciado consistente"
            ],
            correctAnswerIndex: 2
          },
          {
            question: "¿Por qué es importante el diseño responsivo en aplicaciones móviles?",
            options: [
              "Para que la aplicación responda rápidamente a los toques",
              "Para que la interfaz se adapte a diferentes tamaños de pantalla y orientaciones",
              "Para reducir el consumo de batería",
              "Para cumplir con requisitos legales"
            ],
            correctAnswerIndex: 1
          }
        ]
      },
      {
        id: "mobile-semana3",
        title: "Semana 3: Frameworks de Desarrollo Multiplataforma",
        summary: `
          Los frameworks de desarrollo multiplataforma permiten crear aplicaciones que funcionan en múltiples sistemas operativos móviles con una única base de código, reduciendo significativamente el tiempo y costo de desarrollo. Estas herramientas han evolucionado considerablemente en los últimos años, ofreciendo rendimiento y capacidades cercanas a las aplicaciones nativas.

          En esta semana, exploraremos los principales frameworks multiplataforma como React Native, Flutter, Xamarin y Ionic. Para cada uno, analizaremos su arquitectura, lenguaje de programación, componentes principales, flujo de trabajo de desarrollo y casos de uso ideales.

          También discutiremos las consideraciones para elegir entre desarrollo nativo y multiplataforma según los requisitos del proyecto, y estudiaremos estrategias para maximizar el código compartido mientras se mantiene la experiencia específica de cada plataforma cuando sea necesario.
        `,
        questions: [
          {
            question: "¿Qué lenguaje de programación se utiliza principalmente en Flutter?",
            options: [
              "JavaScript",
              "C#",
              "Dart",
              "TypeScript"
            ],
            correctAnswerIndex: 2
          },
          {
            question: "¿Cuál es una ventaja clave de React Native?",
            options: [
              "Compila a código nativo para mejor rendimiento",
              "Utiliza WebView para renderizar la interfaz",
              "Solo funciona en dispositivos Android",
              "Requiere conocimientos de Swift y Kotlin"
            ],
            correctAnswerIndex: 0
          },
          {
            question: "¿Qué framework multiplataforma está desarrollado por Microsoft?",
            options: [
              "React Native",
              "Flutter",
              "Xamarin",
              "Ionic"
            ],
            correctAnswerIndex: 2
          }
        ]
      }
    ]
  },
  {
    id: "bi",
    title: "Inteligencia de Negocios",
    description: "Análisis de datos empresariales para la toma de decisiones estratégicas.",
    icon: "fa-chart-line",
    color: "#2ecc71",
    topics: [
      {
        id: "bi-semana1",
        title: "Semana 1: Fundamentos de Inteligencia de Negocios",
        summary: `
          La Inteligencia de Negocios (BI) comprende las estrategias y tecnologías utilizadas por las empresas para analizar datos e información de negocio. Su objetivo principal es apoyar la toma de decisiones basada en datos, proporcionando conocimientos accionables que mejoren el rendimiento organizacional.

          En esta primera semana, exploraremos los conceptos fundamentales de BI, su evolución histórica y su importancia estratégica en el entorno empresarial actual. Estudiaremos el ciclo de vida de la inteligencia de negocios, desde la recopilación de datos hasta la generación de insights y la implementación de decisiones.

          También analizaremos los componentes principales de una solución de BI, incluyendo fuentes de datos, procesos ETL (Extracción, Transformación y Carga), almacenes de datos (data warehouses), herramientas de análisis y visualización, y sistemas de reportes. Discutiremos cómo estos componentes trabajan juntos para transformar datos brutos en información valiosa para el negocio.
        `,
        questions: [
          {
            question: "¿Cuál es el principal objetivo de la Inteligencia de Negocios?",
            options: [
              "Automatizar todos los procesos empresariales",
              "Reemplazar a los gerentes en la toma de decisiones",
              "Proporcionar información y análisis para mejorar la toma de decisiones",
              "Reducir la cantidad de datos que maneja una empresa"
            ],
            correctAnswerIndex: 2
          },
          {
            question: "¿Qué significa ETL en el contexto de Inteligencia de Negocios?",
            options: [
              "Evaluar, Testear, Lanzar",
              "Extraer, Transformar, Cargar (Load)",
              "Entender, Traducir, Listar",
              "Ejecutar, Temporizar, Limitar"
            ],
            correctAnswerIndex: 1
          },
          {
            question: "¿Qué es un data warehouse?",
            options: [
              "Un tipo de base de datos operacional para transacciones diarias",
              "Un repositorio centralizado optimizado para análisis y consultas de datos",
              "Una herramienta para crear visualizaciones de datos",
              "Un sistema para gestionar documentos empresariales"
            ],
            correctAnswerIndex: 1
          }
        ]
      },
      {
        id: "bi-semana2",
        title: "Semana 2: Modelado de Datos para BI",
        summary: `
          El modelado de datos es un aspecto crítico de la inteligencia de negocios que determina cómo se estructuran, relacionan y almacenan los datos para su análisis eficiente. Un modelo bien diseñado facilita consultas complejas, mejora el rendimiento y permite una interpretación más intuitiva de la información.

          Durante esta semana, estudiaremos los diferentes enfoques de modelado para BI, incluyendo el modelo dimensional (esquemas en estrella y copo de nieve), el modelado relacional normalizado y los modelos híbridos. Aprenderemos a identificar hechos, dimensiones, medidas y jerarquías, y a diseñar modelos que respondan a los requisitos analíticos del negocio.

          También exploraremos conceptos avanzados como dimensiones lentamente cambiantes (SCD), tablas de hechos agregadas, y técnicas de modelado para casos específicos como series temporales, jerarquías recursivas y relaciones muchos a muchos. Practicaremos el diseño de modelos utilizando herramientas populares del mercado.
        `,
        questions: [
          {
            question: "¿Qué es un esquema en estrella en el modelado dimensional?",
            options: [
              "Un diagrama con forma de estrella que muestra el rendimiento de la empresa",
              "Un modelo donde una tabla de hechos central se conecta directamente con múltiples tablas de dimensiones",
              "Un tipo de visualización para datos financieros",
              "Un método para evaluar la calidad de los datos"
            ],
            correctAnswerIndex: 1
          },
          {
            question: "¿Cuál es la diferencia principal entre una tabla de hechos y una tabla de dimensiones?",
            options: [
              "Las tablas de hechos contienen medidas numéricas y claves foráneas, mientras que las tablas de dimensiones contienen atributos descriptivos",
              "Las tablas de hechos son más grandes que las tablas de dimensiones",
              "Las tablas de hechos se actualizan diariamente, las de dimensiones mensualmente",
              "Las tablas de hechos son para datos históricos, las de dimensiones para datos actuales"
            ],
            correctAnswerIndex: 0
          },
          {
            question: "¿Qué son las dimensiones lentamente cambiantes (SCD)?",
            options: [
              "Dimensiones que nunca cambian sus valores",
              "Técnicas para manejar cambios en los atributos de dimensiones a lo largo del tiempo",
              "Dimensiones que solo se actualizan una vez al año",
              "Un tipo de dimensión que se carga muy lentamente debido a su tamaño"
            ],
            correctAnswerIndex: 1
          }
        ]
      },
      {
        id: "bi-semana3",
        title: "Semana 3: Visualización de Datos y Dashboards",
        summary: `
          La visualización de datos es el arte y la ciencia de representar información de manera gráfica para facilitar su comprensión, identificar patrones y comunicar insights de forma efectiva. En el contexto de BI, las visualizaciones y dashboards son la interfaz principal a través de la cual los usuarios interactúan con los datos y obtienen valor de ellos.

          En esta semana, exploraremos los principios fundamentales de la visualización de datos efectiva, incluyendo la elección del tipo de gráfico adecuado según el mensaje a comunicar, el uso del color, la disposición espacial, la simplificación y la atención a la percepción visual humana.

          También estudiaremos el diseño de dashboards empresariales, desde la definición de KPIs (Indicadores Clave de Rendimiento) hasta la creación de paneles interactivos que permitan la exploración de datos a diferentes niveles de detalle. Analizaremos herramientas populares de visualización como Tableau, Power BI, QlikView y Google Data Studio, y practicaremos la creación de visualizaciones efectivas con datos reales.
        `,
        questions: [
          {
            question: "¿Qué tipo de gráfico es más adecuado para mostrar la distribución de valores en un conjunto de datos?",
            options: [
              "Gráfico de líneas",
              "Gráfico de barras",
              "Gráfico circular (pie)",
              "Histograma o gráfico de densidad"
            ],
            correctAnswerIndex: 3
          },
          {
            question: "¿Qué es un KPI en el contexto de dashboards empresariales?",
            options: [
              "Knowledge Processing Interface",
              "Key Performance Indicator (Indicador Clave de Rendimiento)",
              "Keyword Placement Index",
              "Knowledge Proficiency Inventory"
            ],
            correctAnswerIndex: 1
          },
          {
            question: "¿Cuál de los siguientes es un principio importante en el diseño de dashboards efectivos?",
            options: [
              "Incluir la mayor cantidad posible de datos en una sola pantalla",
              "Usar colores brillantes para todos los elementos",
              "Proporcionar contexto y permitir la comparación de métricas",
              "Evitar cualquier tipo de interactividad para no confundir al usuario"
            ],
            correctAnswerIndex: 2
          }
        ]
      }
    ]
  },
  {
    id: "metodologia",
    title: "Metodología de la Investigación Científica",
    description: "Fundamentos y técnicas para la investigación académica y científica.",
    icon: "fa-microscope",
    color: "#e74c3c",
    topics: syllabusData.topics, // Mantener los temas originales para este curso
  },
]

// Base de datos simulada para los usuarios
const usersDB = [
  { email: "estudiante@autonoma.edu.pe", password: "estudiante123", name: "Estudiante Demo", role: "student" },
]

// DOM Elements
const views = document.querySelectorAll(".view")
const loginView = document.getElementById("login-view")
const registerView = document.getElementById("register-view")
const courseSelectionView = document.getElementById("course-selection-view")
const topicSelectionView = document.getElementById("topic-selection-view")
const chatView = document.getElementById("chat-view")
const quizView = document.getElementById("quiz-view")
const resultsView = document.getElementById("results-view")

const emailInput = document.getElementById("email-input")
const passwordInput = document.getElementById("password-input")
const loginButton = document.getElementById("login-button")
const registerLinkButton = document.getElementById("register-link")
const loginError = document.getElementById("login-error")
const logoutButton = document.getElementById("logout-button")
const userEmailDisplay = document.getElementById("user-email-display")
const userNameDisplay = document.getElementById("user-name-display")
const roleRadios = document.querySelectorAll('input[name="role"]')

// Elementos del formulario de registro
const registerForm = document.getElementById("register-form")
const registerNameInput = document.getElementById("register-name-input")
const registerEmailInput = document.getElementById("register-email-input")
const registerPasswordInput = document.getElementById("register-password-input")
const registerConfirmPasswordInput = document.getElementById("register-confirm-password-input")
const registerButton = document.getElementById("register-button")
const registerError = document.getElementById("register-error")
const loginLinkButton = document.getElementById("login-link")
const registerRoleRadios = document.querySelectorAll('input[name="register-role"]')

// Elementos de selección de cursos
const courseList = document.getElementById("course-list")

// Elementos de selección de temas
const currentCourseTitle = document.getElementById("current-course-title")
const topicUserName = document.getElementById("topic-user-name")
const topicUserEmail = document.getElementById("topic-user-email")
const backToCoursesButton = document.getElementById("back-to-courses-button")
const topicLogoutButton = document.getElementById("topic-logout-button")
const courseName = document.getElementById("course-name")
const courseDescription = document.getElementById("course-description")
const courseIcon = document.getElementById("course-icon")
const topicList = document.getElementById("topic-list")
const syllabusEditor = document.getElementById("syllabus-editor")
const editCourseDescription = document.getElementById("edit-course-description")
const topicsEditor = document.getElementById("topics-editor")
const addTopicButton = document.getElementById("add-topic-button")
const saveSyllabusButton = document.getElementById("save-syllabus-button")

const chatTopicTitle = document.getElementById("chat-topic-title")
const chatTopicContext = document.getElementById("chat-topic-context") // Span para el tema en el mensaje de introducción
const topicSummary = document.getElementById("topic-summary") // Aún se utiliza para la visualización inicial
const startQuizButton = document.getElementById("start-quiz-button")
const chatBackButton = document.getElementById("chat-back-button")

// Elementos específicos del chat
const chatMessages = document.getElementById("chat-messages")
const chatInput = document.getElementById("chat-input")
const sendChatButton = document.getElementById("send-chat-button")
const chatLoading = document.getElementById("chat-loading")
const chatError = document.getElementById("chat-error")

const quizTopicTitle = document.getElementById("quiz-topic-title")
const timerDisplay = document.getElementById("timer")
const quizForm = document.getElementById("quiz-form")
const submitQuizButton = document.getElementById("submit-quiz-button")
const quizMessage = document.getElementById("quiz-message")
const unansweredWarning = document.getElementById("unanswered-warning")

const resultsTopicTitle = document.getElementById("results-topic-title")
const scoreDisplay = document.getElementById("score")
const resultsDetails = document.getElementById("results-details")
const recommendations = document.getElementById("recommendations")
const tryAgainButton = document.getElementById("try-again-button")
const resultsBackButton = document.getElementById("results-back-button")

// Botones de cambio de tema
const themeToggleBtn = document.getElementById("theme-toggle-btn")
const registerThemeToggleBtn = document.getElementById("register-theme-toggle-btn")
const themeToggleMain = document.getElementById("theme-toggle-main")
const themeToggleTopics = document.getElementById("theme-toggle-topics")
const themeToggleChat = document.getElementById("theme-toggle-chat")
const themeToggleResults = document.getElementById("theme-toggle-results")

// Funciones

// Función para cambiar el tema
function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light"
  document.documentElement.setAttribute("data-theme", currentTheme)
  localStorage.setItem("theme", currentTheme)

  // Actualizar iconos de todos los botones de tema
  const themeButtons = document.querySelectorAll(".theme-btn, .theme-toggle-btn")
  themeButtons.forEach((btn) => {
    const icon = btn.querySelector("i")
    if (icon) {
      if (currentTheme === "dark") {
        icon.className = "fas fa-sun"
      } else {
        icon.className = "fas fa-moon"
      }
    }
  })
}

// Inicializar tema
function initTheme() {
  document.documentElement.setAttribute("data-theme", currentTheme)

  // Actualizar iconos de todos los botones de tema
  const themeButtons = document.querySelectorAll(".theme-btn, .theme-toggle-btn")
  themeButtons.forEach((btn) => {
    const icon = btn.querySelector("i")
    if (icon) {
      if (currentTheme === "dark") {
        icon.className = "fas fa-sun"
      } else {
        icon.className = "fas fa-moon"
      }
    }
  })
}

function showView(viewId) {
  views.forEach((view) => {
    view.classList.remove("active")
  })
  const activeView = document.getElementById(viewId)
  if (activeView) {
    activeView.classList.add("active")
    currentView = viewId
  } else {
    console.error("View not found:", viewId)
    // Volver a la vista de inicio de sesión si la vista solicitada no existe
    document.getElementById("login-view").classList.add("active")
    currentView = "login"
  }
  // Desplázate hacia arriba al cambiar de vistas
  window.scrollTo(0, 0)
}

function validateEmail(email) {
  // Validación para el dominio @autonoma.edu.pe
  const re = /^[a-zA-Z0-9._%+-]+@autonoma\.edu\.pe$/
  return re.test(String(email).toLowerCase())
}

function handleLogin() {
  const email = emailInput.value.trim()
  const password = passwordInput.value // Obtener la contraseña
  // Siempre usar el rol de estudiante
  const selectedRole = "student"
  loginError.textContent = "" // Limpiar errores previos

  if (!validateEmail(email)) {
    loginError.textContent = "Por favor, usa un correo válido (@autonoma.edu.pe)"
    return
  }

  if (password === "") {
    loginError.textContent = "Por favor, ingresa tu contraseña."
    return
  }

  // Verifica si el usuario existe en nuestra base de datos simulada
  const user = usersDB.find((u) => u.email === email && u.password === password)

  if (!user) {
    loginError.textContent = "Credenciales incorrectas. Intenta nuevamente."
    return
  }

  userEmail = email
  userName = user.name
  userRole = "student" // Siempre establecer como estudiante

  // Almacenar la sesión del usuario
  localStorage.setItem("userEmail", userEmail)
  localStorage.setItem("userName", userName)
  localStorage.setItem("userRole", userRole)

  userEmailDisplay.textContent = userEmail
  userNameDisplay.textContent = userName

  loadCourses()
  showView("course-selection-view")
  passwordInput.value = "" // Limpiar el campo de contraseña después de iniciar sesión
}

// Actualiza la función handleRegister para prevenir el envío del formulario y agregar un listener de eventos
function handleRegister(event) {
  if (event) event.preventDefault()

  const name = registerNameInput.value.trim()
  const email = registerEmailInput.value.trim()
  const password = registerPasswordInput.value
  const confirmPassword = registerConfirmPasswordInput.value
  // Siempre usar el rol de estudiante
  const selectedRole = "student"
  registerError.textContent = "" // Limpiar errores previos

  // Validar entradas inputs
  if (!name) {
    registerError.textContent = "Por favor, ingresa tu nombre completo."
    return
  }

  if (!validateEmail(email)) {
    registerError.textContent = "Por favor, usa un correo válido (@autonoma.edu.pe)"
    return
  }

  if (password.length < 6) {
    registerError.textContent = "La contraseña debe tener al menos 6 caracteres."
    return
  }

  if (password !== confirmPassword) {
    registerError.textContent = "Las contraseñas no coinciden."
    return
  }

  // Verifica si el usuario ya existe
  if (usersDB.some((u) => u.email === email)) {
    registerError.textContent = "Este correo ya está registrado."
    return
  }

  // Agregar usuario
  usersDB.push({ email, password, name, role: "student" })

  // Mostrar mensaje de éxito y redirigir al inicio de sesión
  alert("¡Registro exitoso! Ahora puedes iniciar sesión.")
  showView("login-view")

  // Limpiar formulario de registro
  registerNameInput.value = ""
  registerEmailInput.value = ""
  registerPasswordInput.value = ""
  registerConfirmPasswordInput.value = ""
}

function handleLogout() {
  userEmail = null
  userName = null
  userRole = "student"
  selectedCourse = null
  selectedTopic = null

  localStorage.removeItem("userEmail")
  localStorage.removeItem("userName")
  localStorage.removeItem("userRole")

  emailInput.value = "" // Limpiar campos de entrada
  passwordInput.value = ""
  loginError.textContent = "" // Limpiar errores

  // Restablecer el estado si es necesario
  userAnswers = {}
  stopTimer()
  chatHistory = [] // Limpiar el historial de chat al cerrar sesión
  showView("login-view")
}

function loadCourses() {
  courseList.innerHTML = "" // Limpiar cursos anteriores

  coursesData.forEach((course) => {
    const courseCard = document.createElement("div")
    courseCard.className = "course-card"
    courseCard.dataset.courseId = course.id

    courseCard.innerHTML = `
      <div class="course-card-header" style="background-color: ${course.color}">
        <div class="course-card-icon">
          <i class="fas ${course.icon}"></i>
        </div>
      </div>
      <div class="course-card-body">
        <div class="course-card-title">${course.title}</div>
        <div class="course-card-description">${course.description}</div>
      </div>
      <div class="course-card-footer">
        <button class="secondary-button">Acceder al Curso</button>
      </div>
    `

    courseCard.addEventListener("click", () => selectCourse(course.id))
    courseList.appendChild(courseCard)
  })
}

function selectCourse(courseId) {
  selectedCourse = coursesData.find((c) => c.id === courseId)
  if (selectedCourse) {
    currentCourseTitle.textContent = selectedCourse.title
    topicUserName.textContent = userName
    topicUserEmail.textContent = userEmail

    courseName.textContent = selectedCourse.title
    courseDescription.textContent = selectedCourse.description
    courseIcon.className = `fas ${selectedCourse.icon}`

    // Ocultar editor de sílabo ya que solo es para estudiantes
    syllabusEditor.style.display = "none"

    loadTopics()
    showView("topic-selection-view")
  } else {
    console.error("Course not found:", courseId)
    showView("course-selection-view")
  }
}

function loadTopics() {
  topicList.innerHTML = "" // Limpiar temas anteriores

  if (selectedCourse && selectedCourse.topics) {
    selectedCourse.topics.forEach((topic) => {
      const button = document.createElement("button")
      button.innerHTML = `<i class="fas fa-file-alt"></i> ${topic.title}`
      button.dataset.topicId = topic.id
      button.addEventListener("click", () => selectTopic(topic.id))
      topicList.appendChild(button)
    })
  }
}

function loadTopicsForEditing() {
  topicsEditor.innerHTML = ""

  if (selectedCourse && selectedCourse.topics) {
    selectedCourse.topics.forEach((topic, index) => {
      const topicEditItem = document.createElement("div")
      topicEditItem.className = "topic-edit-item"
      topicEditItem.dataset.topicId = topic.id

      // Limpiar el resumen de etiquetas HTML
      let cleanSummary = topic.summary
      // Eliminar etiquetas HTML
      cleanSummary = cleanSummary.replace(/<[^>]*>/g, "")
      // Eliminar DOCTYPE y otras declaraciones
      cleanSummary = cleanSummary.replace(/<!DOCTYPE[^>]*>/g, "")
      cleanSummary = cleanSummary.replace(/<!--[\s\S]*?-->/g, "")
      // Eliminar "En resumen" al final si existe
      cleanSummary = cleanSummary.replace(/En resumen,?\s*\.?$/i, "")

      topicEditItem.innerHTML = `
        <div class="topic-edit-header">
          <div class="topic-edit-title">
            <i class="fas fa-file-alt"></i> Semana ${index + 1}
          </div>
          <div class="topic-edit-actions">
            <button class="icon-button edit" title="Editar tema"><i class="fas fa-edit"></i></button>
            <button class="icon-button delete" title="Eliminar tema"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        <div class="topic-edit-content" style="display: none;">
          <div class="input-group">
            <label>Título de la semana:</label>
            <input type="text" class="topic-title-input" value="${topic.title}">
          </div>
          <div class="input-group">
            <label>Resumen:</label>
            <textarea class="topic-summary-input" rows="4" placeholder="Ingrese el resumen del tema aquí...">${cleanSummary}</textarea>
          </div>
          <button class="ai-generate-btn generate-summary-btn" data-topic-index="${index}">
            <i class="fas fa-magic"></i> Generar resumen con IA
          </button>
          <div class="ai-loading summary-loading-${index}" style="display: none;">
            <i class="fas fa-spinner fa-spin"></i> Generando resumen...
          </div>
          
          <!-- Sección de preguntas -->
          <div class="questions-section">
            <h4><i class="fas fa-question-circle"></i> Preguntas de evaluación</h4>
            <div class="questions-container" id="questions-container-${topic.id}">
              ${renderQuestions(topic.questions || [])}
            </div>
            <button class="add-question-btn" data-topic-id="${topic.id}">
              <i class="fas fa-plus"></i> Añadir pregunta
            </button>
            <button class="generate-questions-btn" data-topic-id="${topic.id}">
              <i class="fas fa-magic"></i> Generar preguntas con IA
            </button>
            <div class="ai-loading questions-loading-${topic.id}" style="display: none;">
              <i class="fas fa-spinner fa-spin"></i> Generando preguntas...
            </div>
          </div>
        </div>
      `

      // Agregar event listeners para los botones de edición y eliminación
      const editBtn = topicEditItem.querySelector(".edit")
      const deleteBtn = topicEditItem.querySelector(".delete")
      const content = topicEditItem.querySelector(".topic-edit-content")
      const generateBtn = topicEditItem.querySelector(".generate-summary-btn")
      const addQuestionBtn = topicEditItem.querySelector(".add-question-btn")
      const generateQuestionsBtn = topicEditItem.querySelector(".generate-questions-btn")

      editBtn.addEventListener("click", () => {
        content.style.display = content.style.display === "none" ? "block" : "none"
      })

      deleteBtn.addEventListener("click", () => {
        if (confirm("¿Estás seguro de que deseas eliminar esta semana?")) {
          topicEditItem.remove()
        }
      })

      generateBtn.addEventListener("click", (e) => {
        const topicIndex = e.currentTarget.dataset.topicIndex
        const titleInput = topicEditItem.querySelector(".topic-title-input")
        const summaryInput = topicEditItem.querySelector(".topic-summary-input")
        const loadingIndicator = topicEditItem.querySelector(`.summary-loading-${topicIndex}`)

        generateSummaryWithAI(titleInput.value, summaryInput, loadingIndicator)
      })

      addQuestionBtn.addEventListener("click", () => {
        const topicId = addQuestionBtn.dataset.topicId
        addNewQuestion(topicId)
      })

      generateQuestionsBtn.addEventListener("click", () => {
        const topicId = generateQuestionsBtn.dataset.topicId
        const titleInput = topicEditItem.querySelector(".topic-title-input")
        const summaryInput = topicEditItem.querySelector(".topic-summary-input")
        const loadingIndicator = topicEditItem.querySelector(`.questions-loading-${topicId}`)

        generateQuestionsWithAI(topicId, titleInput.value, summaryInput.value, loadingIndicator)
      })

      topicsEditor.appendChild(topicEditItem)

      // Añadir event listeners a las preguntas
      addQuestionEventListeners(topic.id)
    })
  }
}

function renderQuestions(questions) {
  if (!questions || questions.length === 0) {
    return '<p style="color: #666; font-style: italic; text-align: center; padding: 15px;">No hay preguntas añadidas. Añade preguntas o genera con IA.</p>'
  }

  return questions
    .map(
      (question, qIndex) => `
    <div class="question-item" data-question-index="${qIndex}">
      <div class="question-header">
        <div class="question-text">Pregunta ${qIndex + 1}</div>
        <div class="question-actions">
          <button class="icon-button edit edit-question-btn" title="Editar pregunta"><i class="fas fa-edit"></i></button>
          <button class="icon-button delete delete-question-btn" title="Eliminar pregunta"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div class="input-group">
        <input type="text" class="question-text-input" value="${question.question}" placeholder="Escribe la pregunta aquí...">
      </div>
      <div class="options-list">
        ${question.options
          .map(
            (option, oIndex) => `
          <div class="option-item ${oIndex === question.correctAnswerIndex ? "correct" : ""}">
            <input type="radio" name="correct-${qIndex}" value="${oIndex}" ${oIndex === question.correctAnswerIndex ? "checked" : ""}>
            <input type="text" class="option-text-input" value="${option}" placeholder="Opción ${oIndex + 1}">
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `,
    )
    .join("")
}

function addNewQuestion(topicId) {
  const questionsContainer = document.getElementById(`questions-container-${topicId}`)
  const questionCount = questionsContainer.querySelectorAll(".question-item").length

  const newQuestion = {
    question: "Nueva pregunta",
    options: ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
    correctAnswerIndex: 0,
  }

  // Encontrar el tema y añadir la pregunta
  const topic = selectedCourse.topics.find((t) => t.id === topicId)
  if (topic) {
    if (!topic.questions) {
      topic.questions = []
    }
    topic.questions.push(newQuestion)

    // Actualizar la visualización
    questionsContainer.innerHTML = renderQuestions(topic.questions)

    // Añadir event listeners a los nuevos botones
    addQuestionEventListeners(topicId)
  }
}

function addQuestionEventListeners(topicId) {
  const questionsContainer = document.getElementById(`questions-container-${topicId}`)
  if (!questionsContainer) return

  // Añadir event listeners a los botones de editar y eliminar
  const editButtons = questionsContainer.querySelectorAll(".edit-question-btn")
  const deleteButtons = questionsContainer.querySelectorAll(".delete-question-btn")
  const correctRadios = questionsContainer.querySelectorAll('input[type="radio"]')
  const questionTextInputs = questionsContainer.querySelectorAll(".question-text-input")
  const optionTextInputs = questionsContainer.querySelectorAll(".option-text-input")

  editButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const questionItem = e.target.closest(".question-item")
      const questionIndex = Number.parseInt(questionItem.dataset.questionIndex)
      // Aquí podrías implementar la edición de la pregunta
      // Por ahora, simplemente hacemos que el input sea editable
      const questionInput = questionItem.querySelector(".question-text-input")
      questionInput.focus()
    })
  })

  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (confirm("¿Estás seguro de que deseas eliminar esta pregunta?")) {
        const questionItem = e.target.closest(".question-item")
        const questionIndex = Number.parseInt(questionItem.dataset.questionIndex)

        // Eliminar la pregunta del array
        const topic = selectedCourse.topics.find((t) => t.id === topicId)
        if (topic && topic.questions) {
          topic.questions.splice(questionIndex, 1)

          // Actualizar la visualización
          questionsContainer.innerHTML = renderQuestions(topic.questions)

          // Volver a añadir event listeners
          addQuestionEventListeners(topicId)
        }
      }
    })
  })

  correctRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const questionItem = e.target.closest(".question-item")
      const questionIndex = Number.parseInt(questionItem.dataset.questionIndex)
      const optionIndex = Number.parseInt(e.target.value)

      // Actualizar la respuesta correcta
      const topic = selectedCourse.topics.find((t) => t.id === topicId)
      if (topic && topic.questions) {
        topic.questions[questionIndex].correctAnswerIndex = optionIndex

        // Actualizar las clases visuales
        const options = questionItem.querySelectorAll(".option-item")
        options.forEach((opt, idx) => {
          if (idx === optionIndex) {
            opt.classList.add("correct")
          } else {
            opt.classList.remove("correct")
          }
        })
      }
    })
  })

  // Añadir event listeners para actualizar el texto de las preguntas
  questionTextInputs.forEach((input) => {
    input.addEventListener("change", (e) => {
      const questionItem = e.target.closest(".question-item")
      const questionIndex = Number.parseInt(questionItem.dataset.questionIndex)

      // Actualizar el texto de la pregunta
      const topic = selectedCourse.topics.find((t) => t.id === topicId)
      if (topic && topic.questions) {
        topic.questions[questionIndex].question = e.target.value
      }
    })
  })

  // Añadir event listeners para actualizar el texto de las opciones
  optionTextInputs.forEach((input) => {
    input.addEventListener("change", (e) => {
      const questionItem = e.target.closest(".question-item")
      const questionIndex = Number.parseInt(questionItem.dataset.questionIndex)
      const optionItem = e.target.closest(".option-item")
      const optionIndex = Array.from(optionItem.parentNode.children).indexOf(optionItem)

      // Actualizar el texto de la opción
      const topic = selectedCourse.topics.find((t) => t.id === topicId)
      if (topic && topic.questions && optionIndex >= 0) {
        topic.questions[questionIndex].options[optionIndex] = e.target.value
      }
    })
  })
}

async function generateQuestionsWithAI(topicId, title, summary, loadingElement) {
  if (isGeneratingQuestions) return

  isGeneratingQuestions = true
  loadingElement.style.display = "flex"

  try {
    const prompt = `Genera 5 preguntas de opción múltiple para evaluar el conocimiento sobre el tema "${title}".
    
    Resumen del tema: ${summary}
    
    Para cada pregunta, proporciona:
    1. El texto de la pregunta (debe ser contextualizada y específica sobre el tema)
    2. Cuatro opciones de respuesta distintas y claras
    3. El índice de la opción correcta (0-3)
    
    IMPORTANTE: 
    - Las preguntas deben ser variadas y no repetitivas
    - Cada pregunta debe evaluar un aspecto diferente del tema
    - Las preguntas deben ser claras y específicas
    - Las opciones deben ser plausibles pero solo una correcta
    
    Devuelve las preguntas en formato JSON con esta estructura:
    [
      {
        "question": "Texto de la pregunta 1",
        "options": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
        "correctAnswerIndex": 0
      },
      ...
    ]`

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente educativo especializado en crear preguntas de evaluación. Responde solo con el JSON solicitado, sin texto adicional.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const generatedContent = data.choices?.[0]?.message?.content?.trim()

    if (generatedContent) {
      // Extraer el JSON de la respuesta
      const jsonMatch = generatedContent.match(/\[[\s\S]*\]/)
      let questionsJson

      if (jsonMatch) {
        try {
          questionsJson = JSON.parse(jsonMatch[0])
        } catch (e) {
          console.error("Error parsing JSON:", e)
          throw new Error("No se pudo procesar el formato de las preguntas generadas")
        }
      } else {
        throw new Error("No se encontró un formato JSON válido en la respuesta")
      }

      // Añadir las preguntas generadas al tema
      const topic = selectedCourse.topics.find((t) => t.id === topicId)
      if (topic) {
        if (!topic.questions) {
          topic.questions = []
        }

        // Verificar si hay preguntas duplicadas
        const existingQuestions = new Set(topic.questions.map((q) => q.question.toLowerCase().trim()))
        const newQuestions = questionsJson.filter((q) => !existingQuestions.has(q.question.toLowerCase().trim()))

        // Añadir las nuevas preguntas
        topic.questions = [...topic.questions, ...newQuestions]

        // Actualizar la visualización
        const questionsContainer = document.getElementById(`questions-container-${topicId}`)
        questionsContainer.innerHTML = renderQuestions(topic.questions)

        // Añadir event listeners a los nuevos botones
        addQuestionEventListeners(topicId)
      }
    } else {
      throw new Error("No se recibieron preguntas válidas")
    }
  } catch (error) {
    console.error("Error generando preguntas:", error)
    alert(`Error al generar preguntas: ${error.message}`)
  } finally {
    loadingElement.style.display = "none"
    isGeneratingQuestions = false
  }
}

async function generateSummaryWithAI(title, summaryElement, loadingElement) {
  if (isGeneratingSummary || !title.trim()) return

  isGeneratingSummary = true
  loadingElement.style.display = "flex"

  try {
    const prompt = `Genera un resumen educativo detallado para un tema de curso universitario titulado "${title}". 
    
    INSTRUCCIONES IMPORTANTES:
    - El resumen debe ser informativo, bien estructurado y adecuado para estudiantes universitarios.
    - Incluye puntos clave, conceptos importantes y una breve introducción al tema.
    - NO incluyas etiquetas HTML ni códigos. Escribe el texto plano y limpio.
    - NO termines con frases como "En resumen" o similares.
    - El resumen debe tener entre 150-250 palabras.
    - Usa un estilo académico, claro y conciso.
    - Estructura el texto en párrafos cortos para facilitar la lectura.
    - Incluye una breve introducción, desarrollo de ideas principales y conclusión.
    
    Sigue el mismo formato y estilo que este ejemplo:
    
    "La metodología de la investigación científica constituye el conjunto de procedimientos y técnicas que se aplican de manera ordenada y sistemática en la realización de un estudio. En el ámbito académico, representa una herramienta fundamental para la generación de conocimiento válido y confiable.
    
    Este enfoque metodológico se basa en el método científico, caracterizado por la observación sistemática, la formulación de hipótesis, la experimentación controlada y el análisis riguroso de resultados. La aplicación de estos principios permite desarrollar investigaciones que contribuyen significativamente al avance de las diferentes disciplinas.
    
    La importancia de dominar estos conceptos radica en que proporcionan al investigador las bases para diseñar estudios coherentes, recopilar datos relevantes y analizarlos adecuadamente. Esto garantiza que las conclusiones obtenidas sean válidas y puedan ser consideradas como aportaciones al conocimiento científico."
    `

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente educativo especializado en crear contenido académico claro y conciso. Responde solo con texto plano, sin etiquetas HTML ni códigos.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const generatedSummary = data.choices?.[0]?.message?.content?.trim()

    if (generatedSummary) {
      // Limpiar cualquier etiqueta HTML que pudiera haber
      const cleanSummary = generatedSummary.replace(/<[^>]*>/g, "")
      // Eliminar "En resumen" al final si existe
      const finalSummary = cleanSummary.replace(/En resumen,?\s*\.?$/i, "")
      summaryElement.value = finalSummary
    } else {
      throw new Error("No se recibió un resumen válido")
    }
  } catch (error) {
    console.error("Error generando resumen:", error)
    alert(`Error al generar el resumen: ${error.message}`)
  } finally {
    loadingElement.style.display = "none"
    isGeneratingSummary = false
  }
}

function addNewTopic() {
  const newTopicId = "new-topic-" + Date.now()
  const topicCount = topicsEditor.children.length

  const topicEditItem = document.createElement("div")
  topicEditItem.className = "topic-edit-item"
  topicEditItem.dataset.topicId = newTopicId

  topicEditItem.innerHTML = `
    <div class="topic-edit-header">
      <div class="topic-edit-title">
        <i class="fas fa-file-alt"></i> Semana ${topicCount + 1}
      </div>
      <div class="topic-edit-actions">
        <button class="icon-button delete" title="Eliminar tema"><i class="fas fa-trash"></i></button>
      </div>
    </div>
    <div class="topic-edit-content">
      <div class="input-group">
        <label>Título de la semana:</label>
        <input type="text" class="topic-title-input" value="Semana ${topicCount + 1}">
      </div>
      <div class="input-group">
        <label>Resumen:</label>
        <textarea class="topic-summary-input" rows="4" placeholder="Ingrese el resumen del tema aquí..."></textarea>
      </div>
      <button class="ai-generate-btn generate-summary-btn" data-topic-index="new-${topicCount}">
        <i class="fas fa-magic"></i> Generar resumen con IA
      </button>
      <div class="ai-loading summary-loading-new-${topicCount}" style="display: none;">
        <i class="fas fa-spinner fa-spin"></i> Generando resumen...
      </div>
      
      <!-- Sección de preguntas -->
      <div class="questions-section">
        <h4><i class="fas fa-question-circle"></i> Preguntas de evaluación</h4>
        <div class="questions-container" id="questions-container-${newTopicId}">
          <p style="color: #666; font-style: italic; text-align: center; padding: 15px;">No hay preguntas añadidas. Añade preguntas o genera con IA.</p>
        </div>
        <button class="add-question-btn" data-topic-id="${newTopicId}">
          <i class="fas fa-plus"></i> Añadir pregunta
        </button>
        <button class="generate-questions-btn" data-topic-id="${newTopicId}">
          <i class="fas fa-magic"></i> Generar preguntas con IA
        </button>
        <div class="ai-loading questions-loading-${newTopicId}" style="display: none;">
          <i class="fas fa-spinner fa-spin"></i> Generando preguntas...
        </div>
      </div>
    </div>
  `

  // Agregar event listeners
  const deleteBtn = topicEditItem.querySelector(".delete")
  const generateBtn = topicEditItem.querySelector(".generate-summary-btn")
  const addQuestionBtn = topicEditItem.querySelector(".add-question-btn")
  const generateQuestionsBtn = topicEditItem.querySelector(".generate-questions-btn")

  deleteBtn.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que deseas eliminar esta semana?")) {
      topicEditItem.remove()
    }
  })

  generateBtn.addEventListener("click", (e) => {
    const topicIndex = e.currentTarget.dataset.topicIndex
    const titleInput = topicEditItem.querySelector(".topic-title-input")
    const summaryInput = topicEditItem.querySelector(".topic-summary-input")
    const loadingIndicator = topicEditItem.querySelector(`.summary-loading-${topicIndex}`)

    generateSummaryWithAI(titleInput.value, summaryInput, loadingIndicator)
  })

  addQuestionBtn.addEventListener("click", () => {
    const topicId = addQuestionBtn.dataset.topicId

    // Crear un objeto de tema temporal si no existe
    if (!selectedCourse.topics.find((t) => t.id === topicId)) {
      selectedCourse.topics.push({
        id: topicId,
        title: topicEditItem.querySelector(".topic-title-input").value,
        summary: topicEditItem.querySelector(".topic-summary-input").value,
        questions: [],
      })
    }

    addNewQuestion(topicId)
  })

  generateQuestionsBtn.addEventListener("click", () => {
    const topicId = generateQuestionsBtn.dataset.topicId
    const titleInput = topicEditItem.querySelector(".topic-title-input")
    const summaryInput = topicEditItem.querySelector(".topic-summary-input")
    const loadingIndicator = topicEditItem.querySelector(`.questions-loading-${topicId}`)

    // Crear un objeto de tema temporal si no existe
    if (!selectedCourse.topics.find((t) => t.id === topicId)) {
      selectedCourse.topics.push({
        id: topicId,
        title: titleInput.value,
        summary: summaryInput.value,
        questions: [],
      })
    }

    generateQuestionsWithAI(topicId, titleInput.value, summaryInput.value, loadingIndicator)
  })

  topicsEditor.appendChild(topicEditItem)

  // Hacer scroll hasta el nuevo tema
  topicEditItem.scrollIntoView({ behavior: "smooth", block: "center" })
}

function saveSyllabusChanges() {
  if (!selectedCourse) return

  // Mostrar indicador de carga
  saveSyllabusButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'
  saveSyllabusButton.disabled = true

  setTimeout(() => {
    try {
      // Actualizar la descripción del curso
      selectedCourse.description = editCourseDescription.value
      courseDescription.textContent = selectedCourse.description

      // Actualizar los temas
      const updatedTopics = []
      const topicItems = topicsEditor.querySelectorAll(".topic-edit-item")

      topicItems.forEach((item, index) => {
        const topicId = item.dataset.topicId
        const titleInput = item.querySelector(".topic-title-input")
        const summaryInput = item.querySelector(".topic-summary-input")

        // Crear un objeto de tema actualizado
        const updatedTopic = {
          id: topicId,
          title: titleInput.value,
          summary: summaryInput.value,
          questions: [], // Mantener preguntas vacías para simplificar
        }

        // Si es un tema existente, conservar sus preguntas
        const existingTopic = selectedCourse.topics.find((t) => t.id === topicId)
        if (existingTopic && existingTopic.questions) {
          updatedTopic.questions = existingTopic.questions
        }

        updatedTopics.push(updatedTopic)
      })

      // Actualizar los temas del curso
      selectedCourse.topics = updatedTopics

      // Recargar la lista de temas
      loadTopics()

      // Mostrar mensaje de éxito
      const successMessage = document.createElement("div")
      successMessage.className = "success-message"
      successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Cambios guardados correctamente'
      successMessage.style.color = "var(--success-color)"
      successMessage.style.padding = "10px"
      successMessage.style.marginTop = "15px"
      successMessage.style.textAlign = "center"
      successMessage.style.fontWeight = "bold"

      const editorActions = document.querySelector(".editor-actions")
      editorActions.parentNode.insertBefore(successMessage, editorActions.nextSibling)

      // Eliminar el mensaje después de 3 segundos
      setTimeout(() => {
        successMessage.remove()
      }, 3000)
    } catch (error) {
      console.error("Error al guardar cambios:", error)
      alert("Ocurrió un error al guardar los cambios. Por favor, intenta nuevamente.")
    } finally {
      // Restaurar el botón
      saveSyllabusButton.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios'
      saveSyllabusButton.disabled = false
    }
  }, 800) // Simular un pequeño retraso para mejor UX
}

function selectTopic(topicId) {
  selectedTopic = selectedCourse.topics.find((t) => t.id === topicId)
  if (selectedTopic) {
    chatTopicTitle.textContent = selectedTopic.title

    // Limpiar el resumen de etiquetas HTML
    let cleanSummary = selectedTopic.summary
    // Eliminar etiquetas HTML
    cleanSummary = cleanSummary.replace(/<[^>]*>/g, "")
    // Eliminar DOCTYPE y otras declaraciones
    cleanSummary = cleanSummary.replace(/<!DOCTYPE[^>]*>/g, "")
    cleanSummary = cleanSummary.replace(/<!--[\s\S]*?-->/g, "")
    // Eliminar "En resumen" al final si existe
    cleanSummary = cleanSummary.replace(/En resumen,?\s*\.?$/i, "")

    topicSummary.textContent = cleanSummary
    chatTopicContext.textContent = selectedTopic.title // Actualizar el contexto en el mensaje de introducción

    // Reiniciar el chat para el nuevo tema
    chatMessages.innerHTML = `
            <div class="message system-message">
                <p>Hola! Soy tu asistente para ${selectedCourse.title}. Puedes preguntarme sobre el resumen del tema a continuación o cualquier duda que tengas sobre <strong>${selectedTopic.title}</strong>.</p>
            </div>
            <div class="message system-message">
                <strong>Resumen:</strong>
                <p>${cleanSummary}</p>
            </div>` // Restablecer la visualización de mensajes
    chatInput.value = "" // Limpiar entrada
    chatError.textContent = "" // Limpiar errores
    chatHistory = [
      // Inicializar el historial de chat con el mensaje del sistema y el resumen
      {
        role: "system",
        content: `Eres un asistente educativo especializado en ${selectedCourse.title}. 
        IMPORTANTE: SOLO debes responder preguntas relacionadas con el tema "${selectedTopic.title}". 
        Si el usuario pregunta sobre cualquier otro tema o solicita información no relacionada con este tema específico, 
        debes responder: "Lo siento, solo puedo responder preguntas relacionadas con ${selectedTopic.title}. 
        Estoy aquí para ayudarte a estudiar este tema específico. ¿Tienes alguna duda sobre ${selectedTopic.title}?".
        Sé claro, conciso y educativo en tus respuestas sobre el tema.`,
      },
      { role: "assistant", content: `Resumen del tema "${selectedTopic.title}": ${cleanSummary}` }, // Agregar el resumen como contexto
    ]
    showView("chat-view")
  } else {
    console.error("Topic not found:", topicId)
    showView("topic-selection-view") // Regresar si el tema no es válido
  }
}

function addMessageToChat(sender, text) {
  const messageDiv = document.createElement("div")
  messageDiv.classList.add("message", sender === "user" ? "user-message" : "ai-message")
  // Formateo básico similar a Markdown para negritas y listas
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Negritas
  text = text.replace(/(\n|^)\* (.*?)/g, "$1<ul><li>$2</li></ul>") // Elemento de lista inicial
  text = text.replace(/<\/ul>\n<ul>/g, "") // Combinar listas adyacentes
  // Manejo simple de párrafos
  text = text
    .split("\n")
    .map((p) => (p.trim() ? `<p>${p}</p>` : ""))
    .join("")
  messageDiv.innerHTML = text // Utiliza innerHTML para renderizar HTML básico como <p>, <strong>, <ul>, <li>
  chatMessages.appendChild(messageDiv)
  // Desplázate hacia abajo
  chatMessages.scrollTop = chatMessages.scrollHeight
  chatMessages.scrollTop = chatMessages.scrollHeight

  // Agregar al historial de chat para el contexto de la API (solo si no es un mensaje del sistema agregado internamente)
  if (sender === "user" || sender === "ai") {
    chatHistory.push({ role: sender === "user" ? "user" : "assistant", content: text })
  }
}

async function sendMessageToAI() {
  const userText = chatInput.value.trim()
  if (!userText || !selectedTopic) return

  addMessageToChat("user", userText)
  chatInput.value = "" // Limpiar el campo de entrada
  chatLoading.style.display = "flex" // Mostrar indicador de carga
  chatError.textContent = "" // Limpiar errores previos
  sendChatButton.disabled = true // Deshabilitar el botón mientras se espera
  chatInput.disabled = true

  try {
    // Prepara los mensajes en el formato esperado por la API
    // Envía solo los mensajes más recientes para mantener el contexto manejable si es necesario
    const messagesToSend = [...chatHistory] // Enviar todo el historial por ahora

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: messagesToSend,
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    chatLoading.style.display = "none" // Ocultar el indicador de carga

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) // Intentar analizar el error
      console.error("API Error Response:", errorData)
      throw new Error(`Error ${response.status}: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()

    // Extraer el texto de la respuesta - la estructura puede variar según la API
    const aiText = data.choices?.[0]?.message?.content?.trim()

    if (aiText) {
      addMessageToChat("ai", aiText)
    } else {
      console.error("Invalid response structure:", data)
      throw new Error("No se recibió una respuesta válida del asistente.")
    }
  } catch (error) {
    console.error("Error sending message to AI:", error)
    chatLoading.style.display = "none"
    chatError.textContent = `Error al contactar al asistente: ${error.message}. Inténtalo de nuevo.`
  } finally {
    sendChatButton.disabled = false // Volver a habilitar el botón
    chatInput.disabled = false
    chatInput.focus()
  }
}

// Función para generar preguntas contextualizadas adicionales
async function generateContextualQuestions(count) {
  if (count <= 0 || !selectedTopic) return []
  
  try {
    const prompt = `Genera ${count} preguntas de opción múltiple contextualizadas para evaluar el conocimiento sobre el tema "${selectedTopic.title}".
    
    Resumen del tema: ${selectedTopic.summary}
    
    IMPORTANTE: Las preguntas deben ser contextualizadas, es decir, deben aplicar los conceptos del tema a situaciones reales o casos prácticos.
    
    Para cada pregunta, proporciona:
    1. El texto de la pregunta (debe ser contextualizada y aplicada a un escenario real)
    2. Cuatro opciones de respuesta distintas y claras
    3. El índice de la opción correcta (0-3)
    
    Devuelve las preguntas en formato JSON con esta estructura:
    [
      {
        "question": "Texto de la pregunta contextualizada 1",
        "options": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
        "correctAnswerIndex": 0
      },
      ...
    ]`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente educativo especializado en crear preguntas de evaluación contextualizadas. Responde solo con el JSON solicitado, sin texto adicional.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content?.trim();

    if (generatedContent) {
      // Extraer el JSON de la respuesta
      const jsonMatch = generatedContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Error parsing JSON:", e);
          return [];
        }
      }
    }
    return [];
  } catch (error) {
    console.error("Error generating contextual questions:", error);
    return [];
  }
}

// Función modificada para generar 5 preguntas del chat
async function generateChatQuestions() {
  // Generar preguntas basadas en el chat
  if (chatHistory.length < 3) return [] // No hay suficiente historial para generar preguntas

  try {
    const prompt = `Basándote en la siguiente conversación entre un estudiante y un asistente educativo sobre "${selectedTopic.title}", 
    genera 5 preguntas de opción múltiple que evalúen la comprensión del estudiante sobre los temas discutidos.
    
    CONVERSACIÓN:
    ${chatHistory.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n\n")}
    
    Para cada pregunta, proporciona:
    1. El texto de la pregunta (debe ser contextualizada y específica sobre lo discutido)
    2. Cuatro opciones de respuesta distintas y claras
    3. El índice de la opción correcta (0-3)
    
    IMPORTANTE: Las preguntas deben ser variadas y evaluar diferentes aspectos de la conversación.
    
    Devuelve las preguntas en formato JSON con esta estructura:
    [
      {
        "question": "Texto de la pregunta 1",
        "options": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
        "correctAnswerIndex": 0
      },
      ...
    ]`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente educativo especializado en crear preguntas de evaluación basadas en conversaciones. Responde solo con el JSON solicitado, sin texto adicional.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content?.trim();

    if (generatedContent) {
      // Extraer el JSON de la respuesta
      const jsonMatch = generatedContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Error parsing JSON:", e);
          return [];
        }
      }
    }
    return [];
  } catch (error) {
    console.error("Error generating chat questions:", error);
    return [];
  }
}

// Función modificada para mostrar 10 preguntas (5 por defecto y 5 contextualizadas)
function startQuiz() {
  if (!selectedTopic) return;

  // Mostrar indicador de carga
  startQuizButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparando quiz...';
  startQuizButton.disabled = true;

  // Generar preguntas basadas en el chat
  generateChatQuestions().then(async (chatQuestions) => {
    // Selecciona 5 preguntas aleatorias del tema (por defecto)
    const topicQuestions = selectedTopic.questions || [];
    const shuffledTopicQuestions = [...topicQuestions].sort(() => 0.5 - Math.random()).slice(0, 5);

    // Inicializar el array de preguntas del quiz
    currentQuizQuestions = shuffledTopicQuestions;

    // Añadir preguntas contextualizadas del chat
    if (chatQuestions && chatQuestions.length > 0) {
      // Si hay preguntas del chat, tomar hasta 5
      const contextualQuestions = chatQuestions.slice(0, 5);
      
      // Si no hay suficientes preguntas del chat, generar preguntas contextualizadas adicionales
      if (contextualQuestions.length < 5) {
        const additionalQuestions = await generateContextualQuestions(5 - contextualQuestions.length);
        currentQuizQuestions = [...currentQuizQuestions, ...contextualQuestions, ...additionalQuestions];
      } else {
        currentQuizQuestions = [...currentQuizQuestions, ...contextualQuestions];
      }
    } else {
      // Si no hay preguntas del chat, generar 5 preguntas contextualizadas
      const contextualQuestions = await generateContextualQuestions(5);
      currentQuizQuestions = [...currentQuizQuestions, ...contextualQuestions];
    }

    // Si no hay suficientes preguntas, mostrar un mensaje
    if (currentQuizQuestions.length === 0) {
      alert("No hay preguntas disponibles para este tema. Por favor, añade preguntas o genera con IA.");
      startQuizButton.innerHTML = '<i class="fas fa-tasks"></i> Iniciar Preguntas';
      startQuizButton.disabled = false;
      return;
    }

    quizTopicTitle.textContent = `Quiz: ${selectedTopic.title}`;
    quizForm.innerHTML = ""; // Limpiar el formulario anterior
    userAnswers = {}; // Reiniciar respuestas
    quizMessage.textContent = ""; // Limpiar cualquier mensaje anterior
    unansweredWarning.style.display = "none"; // Ocultar advertencia

    currentQuizQuestions.forEach((q, index) => {
      const questionBlock = document.createElement("div");
      questionBlock.classList.add("question-block");
      questionBlock.dataset.questionIndex = index;

      const questionText = document.createElement("p");
      questionText.textContent = `${index + 1}. ${q.question}`;
      
      // Añadir indicador de tipo de pregunta
      const questionType = index < 5 ? "Estándar" : "Contextualizada";
      const questionTypeSpan = document.createElement("span");
      questionTypeSpan.style.fontSize = "0.8rem";
      questionTypeSpan.style.color = "var(--primary-color)";
      questionTypeSpan.style.fontStyle = "italic";
      questionTypeSpan.style.marginLeft = "10px";
      questionTypeSpan.textContent = `(${questionType})`;
      
      questionText.appendChild(questionTypeSpan);
      questionBlock.appendChild(questionText);

      q.options.forEach((option, optionIndex) => {
        const label = document.createElement("label");
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = `question-${index}`;
        radio.value = optionIndex;
        radio.id = `q${index}_opt${optionIndex}`;
        // Agregar un listener de eventos para almacenar la respuesta inmediatamente
        radio.addEventListener("change", () => {
          userAnswers[index] = Number.parseInt(radio.value, 10);
          // Quitar la clase de no respondida si existe
          questionBlock.classList.remove("unanswered");
        });

        label.appendChild(radio);
        label.appendChild(document.createTextNode(` ${option}`)); // Agregar un espacio antes del texto de la opción
        questionBlock.appendChild(label);
      });
      quizForm.appendChild(questionBlock);
    });

    timeLeft = 15 * 60; // Restablecer el temporizador a 15 minutos
    startTimer();

    // Restaurar el botón
    startQuizButton.innerHTML = '<i class="fas fa-tasks"></i> Iniciar Preguntas';
    startQuizButton.disabled = false;

    showView("quiz-view");
  });
}

function startTimer() {
  stopTimer() // Limpiar cualquier temporizador existente
  timerInterval = setInterval(() => {
    timeLeft--
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    timerDisplay.textContent = `Tiempo restante: ${minutes}:${seconds < 10 ? "0" + seconds : seconds}`

    if (timeLeft <= 0) {
      stopTimer()
      alert("¡Tiempo agotado!")
      submitQuiz(true) // Enviar automáticamente cuando se acabe el tiempo
    }
  }, 1000)
}

function stopTimer() {
  clearInterval(timerInterval)
  timerInterval = null
}

// Función para manejar el envío del cuestionario (puede ser llamada por el botón o el temporizador)
function submitQuiz(timeExpired = false) {
  stopTimer()

  let score = 0
  const unansweredQuestions = []
  resultsDetails.innerHTML = "" // Limpiar resultados previos

  // Verificar si todas las preguntas han sido respondidas si el tiempo no ha expirado
  if (!timeExpired) {
    for (let i = 0; i < currentQuizQuestions.length; i++) {
      if (userAnswers[i] === undefined) {
        unansweredQuestions.push(i)
      }
    }
  }

  if (unansweredQuestions.length > 0 && !timeExpired) {
    // Mostrar advertencia y resaltar preguntas sin responder
    unansweredWarning.style.display = "flex"
    unansweredWarning.textContent = `Hay ${unansweredQuestions.length} pregunta(s) sin responder. Por favor, completa todas las preguntas.`

    // Resaltar preguntas sin responder
    const questionBlocks = quizForm.querySelectorAll(".question-block")
    questionBlocks.forEach((block) => block.classList.remove("unanswered"))

    unansweredQuestions.forEach((index) => {
      const block = quizForm.querySelector(`.question-block[data-question-index="${index}"]`)
      if (block) {
        block.classList.add("unanswered")
        // Hacer scroll a la primera pregunta sin responder
        if (index === unansweredQuestions[0]) {
          block.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
    })

    return
  }

  unansweredWarning.style.display = "none" // Ocultar advertencia
  quizMessage.textContent = "" // Limpiar mensaje si todas las preguntas fueron respondidas o si el tiempo expiró

  currentQuizQuestions.forEach((q, index) => {
    const userAnswerIndex = userAnswers[index]
    const correctAnswerIndex = q.correctAnswerIndex
    const isCorrect = userAnswerIndex === correctAnswerIndex

    if (isCorrect) {
      score++
    }

    // Mostrar resultado detallado para cada pregunta
    const resultItem = document.createElement("div")
    resultItem.classList.add("result-item")
    resultItem.classList.add(isCorrect ? "correct" : "incorrect")

    const questionP = document.createElement("p")
    questionP.innerHTML = `<strong>Pregunta ${index + 1}:</strong> ${q.question}`
    resultItem.appendChild(questionP)

    const yourAnswerP = document.createElement("p")
    const userAnswerText = userAnswerIndex !== undefined ? q.options[userAnswerIndex] : "No respondida"
    yourAnswerP.innerHTML = `Tu respuesta: ${userAnswerText}`
    resultItem.appendChild(yourAnswerP)

    if (!isCorrect) {
      const correctAnswerP = document.createElement("p")
      correctAnswerP.innerHTML = `Respuesta correcta: ${q.options[correctAnswerIndex]}`
      resultItem.appendChild(correctAnswerP)
    }

    resultsDetails.appendChild(resultItem)
  })

  const finalScore = `${score} / ${currentQuizQuestions.length}`
  scoreDisplay.textContent = finalScore
  resultsTopicTitle.textContent = `Resultados: ${selectedTopic.title}`

  // Generar recomendaciones basadas en la puntuación
  let recommendationText = ""
  const percentage = (score / currentQuizQuestions.length) * 100
  if (percentage >= 80) {
    recommendationText = "¡Excelente trabajo! Has demostrado un buen dominio del tema."
  } else if (percentage >= 50) {
    recommendationText = "Buen intento. Repasa los puntos donde tuviste errores para reforzar tu conocimiento."
  } else {
    recommendationText =
      "Parece que necesitas repasar más a fondo este tema. Revisa el resumen y tus respuestas incorrectas."
  }
  recommendations.textContent = recommendationText

  showView("results-view")
}

// Eventos Listeners función que se encarga de recibir y responder a eventos
// Navegación de Inicio de Sesión y Registro
if (registerLinkButton) {
  registerLinkButton.addEventListener("click", () => showView("register-view"))
}

if (loginLinkButton) {
  loginLinkButton.addEventListener("click", () => showView("login-view"))
}

// Formulario de inicio de sesión
if (loginButton) {
  loginButton.addEventListener("click", handleLogin)
}

// Formulario de registro
if (registerForm) {
  registerForm.addEventListener("submit", handleRegister)
}

if (registerButton) {
  registerButton.addEventListener("click", handleRegister)
}

// Permitir iniciar sesión al presionar la tecla Enter en los campos de correo electrónico o contraseña
if (emailInput) {
  emailInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleLogin()
    }
  })
}

if (passwordInput) {
  passwordInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleLogin()
    }
  })
}

// Botones de logout
if (logoutButton) {
  logoutButton.addEventListener("click", handleLogout)
}

if (topicLogoutButton) {
  topicLogoutButton.addEventListener("click", handleLogout)
}

// Navegación entre vistas
if (backToCoursesButton) {
  backToCoursesButton.addEventListener("click", () => {
    selectedCourse = null
    showView("course-selection-view")
  })
}

if (chatBackButton) {
  chatBackButton.addEventListener("click", () => {
    selectedTopic = null // Limpiar el tema seleccionado al regresar
    chatHistory = [] // Limpiar el historial de chat
    showView("topic-selection-view")
  })
}

// Listener del botón de envío de chat
if (sendChatButton) {
  sendChatButton.addEventListener("click", sendMessageToAI)
}

// Permitir enviar mensajes de chat al presionar la tecla Enter en el área de texto (Shift+Enter para nueva línea)
if (chatInput) {
  chatInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault() // Prevenir el comportamiento predeterminado de Enter (nueva línea)
      sendMessageToAI()
    }
  })
}

// Botones para el editor de sílabo
if (addTopicButton) {
  addTopicButton.addEventListener("click", addNewTopic)
}

if (saveSyllabusButton) {
  saveSyllabusButton.addEventListener("click", saveSyllabusChanges)
}

if (startQuizButton) {
  startQuizButton.addEventListener("click", startQuiz)
}

if (submitQuizButton) {
  submitQuizButton.addEventListener("click", () => submitQuiz(false)) // Enviar mediante botón
}

if (resultsBackButton) {
  resultsBackButton.addEventListener("click", () => {
    selectedTopic = null // Limpiar el tema seleccionado
    userAnswers = {} // Restablecer respuestas
    showView("topic-selection-view")
  })
}

if (tryAgainButton) {
  tryAgainButton.addEventListener("click", () => {
    // Regresar a la vista de chat para el mismo tema y reiniciar el proceso
    if (selectedTopic) {
      chatTopicTitle.textContent = selectedTopic.title
      topicSummary.textContent = selectedTopic.summary
      userAnswers = {} // Restablecer respuestas
      showView("chat-view")
    } else {
      showView("topic-selection-view")
    }
  })
}

// Botones de cambio de tema
if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", toggleTheme)
}

if (registerThemeToggleBtn) {
  registerThemeToggleBtn.addEventListener("click", toggleTheme)
}

if (themeToggleMain) {
  themeToggleMain.addEventListener("click", toggleTheme)
}

if (themeToggleTopics) {
  themeToggleTopics.addEventListener("click", toggleTheme)
}

if (themeToggleChat) {
  themeToggleChat.addEventListener("click", toggleTheme)
}

if (themeToggleResults) {
  themeToggleResults.addEventListener("click", toggleTheme)
}

// --- Inicialización ---

function initializeApp() {
  // Inicializar tema
  initTheme()

  // Verificar si existe una sesión activa
  const savedEmail = localStorage.getItem("userEmail")
  const savedName = localStorage.getItem("userName")
  const savedRole = localStorage.getItem("userRole")

  if (savedEmail && validateEmail(savedEmail)) {
    userEmail = savedEmail
    userName = savedName || ""
    userRole = "student" // Siempre establecer como estudiante

    userEmailDisplay.textContent = userEmail
    userNameDisplay.textContent = userName

    loadCourses()
    showView("course-selection-view") // Comenzar en la selección de cursos si el usuario ha iniciado sesión
  } else {
    showView("login-view")
  }
}

// Iniciar la aplicación cuando se cargue la página
document.addEventListener("DOMContentLoaded", initializeApp)