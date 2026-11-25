'use strict';
/* =====================================================================
   INTELECTUS — Sistema de Evaluación del Capital Intelectual
   Proyecto universitario de Administración Estratégica
   Arquitectura: HTML5 + CSS3 + JavaScript puro + Chart.js + Lucide Icons
   Almacenamiento demostrativo: LocalStorage
   ===================================================================== */

/* ============================ CONFIGURACIÓN ============================ */
const CONFIG = {
  storageKey: 'intelectus_master_v2',
  escala: ['Nunca', 'Casi nunca', 'Algunas veces', 'Frecuentemente', 'Casi siempre'],
  // Clasificación inicial configurable (convención del proyecto de Administración Estratégica)
  rangos: [
    { max: 1.80, etq: 'muy baja', cls: 'r1' },
    { max: 2.60, etq: 'baja', cls: 'r2' },
    { max: 3.40, etq: 'intermedia', cls: 'r3' },
    { max: 4.20, etq: 'alta', cls: 'r4' },
    { max: 5.00, etq: 'muy alta', cls: 'r5' }
  ],
  umbralFortaleza: 3.41,
  umbralMejora: 3.40,
  minGrupoArea: 2 // mínimo de respuestas para desglose por área (resguardo de anonimato y visualización)
};

const COLOR = {
  humano: '#5b5bd6',
  relacional: '#16a34a',
  estructural: '#ea7c1a',
  navy: '#12263f'
};

const NOTA_AUTOINFORME = 'Estos resultados se basan en respuestas autoinformadas y constituyen indicadores descriptivos diseñados para este proyecto académico de Administración Estratégica. No representan un diagnóstico definitivo, un instrumento psicométrico validado ni una medición absoluta de la inteligencia o de la calidad objetiva de las relaciones.';

const F = t => `¿Con qué frecuencia ${t}?`;

/* ============================ CONTENIDO: 9 INTELIGENCIAS MÚLTIPLES ============================ */
// Subíndices propuestos para cada inteligencia (2 preguntas por subíndice = 8 preguntas por inteligencia)
const SUB_INT = ['Habilidades', 'Capacidades', 'Aplicación', 'Desarrollo'];

const INTELIGENCIAS = [
  {
    id: 'ling',
    nombre: 'Inteligencia lingüística o verbal',
    corto: 'Lingüística',
    icono: 'message-square',
    desc: 'Capacidad para usar el lenguaje oral y escrito al comunicar, explicar y argumentar con precisión.',
    rec: {
      area: 'Inteligencia lingüística o verbal',
      explicacion: 'El dominio del lenguaje oral y escrito es fundamental para transmitir ideas complejas, redactar informes técnicos y liderar equipos de trabajo.',
      accion: 'Practica exposiciones orales estructuradas de 3 minutos, lee artículos de análisis estratégico resumiendo sus puntos clave y redacta síntesis ejecutivas.',
      objetivo: 'Mejorar la claridad argumentativa y la persuasión en comunicaciones individuales y grupales.'
    },
    preg: [
      '¿Qué tan fácilmente expresas tus ideas de manera oral?',
      '¿Qué tan bien organizas tus ideas al escribir?',
      '¿Qué tan fácilmente comprendes textos e instrucciones escritas?',
      '¿Qué tan bien argumentas tus opiniones?',
      '¿Con qué frecuencia utilizas la comunicación para explicar una idea?',
      '¿Con qué frecuencia redactas textos para transmitir información?',
      '¿Con qué frecuencia practicas actividades para mejorar tu expresión?',
      '¿Con qué frecuencia buscas ampliar tu vocabulario o comprensión lectora?'
    ]
  },
  {
    id: 'logmat',
    nombre: 'Inteligencia lógico-matemática',
    corto: 'Lógico-matemática',
    icono: 'calculator',
    desc: 'Capacidad para razonar rigurosamente, analizar datos cuantitativos, reconocer patrones y resolver problemas complejos.',
    rec: {
      area: 'Inteligencia lógico-matemática',
      explicacion: 'La toma de decisiones estratégicas exige interpretar métricas de costos, balances operacionales y tendencias estadísticas sin sesgos.',
      accion: 'Descompón problemas operativos en árboles de decisión, practica el análisis de gráficos en hojas de cálculo y resuelve ejercicios de lógica aplicada.',
      objetivo: 'Fortalecer el pensamiento analítico fundamentado en evidencia cuantitativa.'
    },
    preg: [
      '¿Qué tan fácilmente realizas cálculos mentales o con números?',
      '¿Qué tan bien identificas patrones o relaciones entre datos?',
      '¿Qué tan fácilmente analizas un problema paso a paso?',
      '¿Qué tan bien evalúas si un razonamiento es coherente?',
      '¿Con qué frecuencia utilizas datos o números para tomar decisiones?',
      '¿Con qué frecuencia resuelves problemas que requieren lógica?',
      '¿Con qué frecuencia practicas juegos, ejercicios o cursos de razonamiento?',
      '¿Con qué frecuencia buscas aprender a interpretar datos o estadísticas?'
    ]
  },
  {
    id: 'esp',
    nombre: 'Inteligencia espacial o visual',
    corto: 'Espacial',
    icono: 'box',
    desc: 'Capacidad para percibir, imaginar, representar y transformar mentalmente formas, espacios, planos y diagramas.',
    rec: {
      area: 'Inteligencia espacial o visual',
      explicacion: 'Permite visualizar arquitecturas de procesos, mapas de procesos de valor, distribución de plantas y modelamiento de proyectos.',
      accion: 'Convierte informes textuales en infografías o diagramas de flujo (BPMN), utiliza mapas conceptuales y explora herramientas de modelado visual.',
      objetivo: 'Incrementar la capacidad de abstracción visual y diseño de esquemas organizacionales.'
    },
    preg: [
      '¿Qué tan fácilmente imaginas objetos o lugares en tu mente?',
      '¿Qué tan bien te orientas en lugares que no conoces?',
      '¿Qué tan fácilmente interpretas mapas, planos o diagramas?',
      '¿Qué tan bien percibes proporciones, colores y formas?',
      '¿Con qué frecuencia dibujas, diseñas o esquematizas ideas?',
      '¿Con qué frecuencia usas imágenes, gráficos o esquemas para explicar algo?',
      '¿Con qué frecuencia practicas actividades visuales como dibujo, fotografía o diseño?',
      '¿Con qué frecuencia exploras herramientas para crear representaciones visuales?'
    ]
  },
  {
    id: 'mus',
    nombre: 'Inteligencia musical',
    corto: 'Musical',
    icono: 'music',
    desc: 'Sensibilidad a la armonía, el ritmo, el tono, las frecuencias auditivas y la estructura acústica.',
    rec: {
      area: 'Inteligencia musical',
      explicacion: 'La percepción de patrones rítmicos y cadencias se relaciona con la atención focalizada, la memoria secuencial y el reconocimiento de anomalías acústicas en entornos industriales.',
      accion: 'Realiza ejercicios de escucha analítica distinguiendo capas sonoras e incorpora pausas auditivas reguladas para potenciar la concentración.',
      objetivo: 'Desarrollar mayor agudeza perceptual y modulación del ritmo de trabajo cognitivo.'
    },
    preg: [
      '¿Qué tan fácilmente reconoces ritmos o melodías?',
      '¿Qué tan bien notas cuando un sonido está desafinado o fuera de ritmo?',
      '¿Qué tan fácilmente recuerdas melodías después de escucharlas?',
      '¿Qué tan bien distingues instrumentos o sonidos dentro de una pieza musical?',
      '¿Con qué frecuencia cantas, tocas un instrumento o sigues un ritmo?',
      '¿Con qué frecuencia usas la música para concentrarte, relajarte o expresarte?',
      '¿Con qué frecuencia practicas o estudias música?',
      '¿Con qué frecuencia exploras géneros o instrumentos nuevos?'
    ]
  },
  {
    id: 'cor',
    nombre: 'Inteligencia corporal-cinestésica',
    corto: 'Corporal-cinestésica',
    icono: 'activity',
    desc: 'Habilidad para coordinar el cuerpo, manipular herramientas con destreza física y aprender a través de la acción táctil.',
    rec: {
      area: 'Inteligencia corporal-cinestésica',
      explicacion: 'Indispensable para el trabajo en terreno, inspección operativa, ergonomía postural en turnos prolongados y control motriz fino/grueso en maquinaria.',
      accion: 'Participa en simulaciones prácticas de campo, mantén rutinas de acondicionamiento físico y practica técnicas de pausas activas ergonométricas.',
      objetivo: 'Optimizar la resistencia física, destreza manual y coordinación en tareas técnicas.'
    },
    preg: [
      '¿Qué tan bien coordinas tus movimientos?',
      '¿Qué tan fácilmente aprendes habilidades que requieren movimiento?',
      '¿Qué tan bien controlas tu equilibrio y tu destreza manual?',
      '¿Qué tan rápido te adaptas a actividades físicas nuevas?',
      '¿Con qué frecuencia realizas actividades físicas, deportes o trabajos manuales?',
      '¿Con qué frecuencia aprendes haciendo, tocando o manipulando objetos?',
      '¿Con qué frecuencia entrenas para mejorar tu coordinación o tu habilidad física?',
      '¿Con qué frecuencia pruebas actividades nuevas que exigen movimiento?'
    ]
  },
  {
    id: 'inter',
    nombre: 'Inteligencia interpersonal',
    corto: 'Interpersonal',
    icono: 'users',
    desc: 'Capacidad para comprender motivaciones y emociones ajenas, generar empatía, colaborar y resolver desacuerdos.',
    rec: {
      area: 'Inteligencia interpersonal',
      explicacion: 'El capital relacional se sustenta en líderes con empatía que logran coordinar guardias operativas, alinear sindicatos y dialogar con stakeholders.',
      accion: 'Ejercita la escucha activa sin interrumpir, practica técnicas de mediación de conflictos (método Harvard) y coordina sesiones de retroalimentación 360°.',
      objetivo: 'Construir sinergia, confianza mutua y relaciones colaborativas de alto desempeño.'
    },
    preg: [
      '¿Qué tan fácilmente entiendes cómo se sienten otras personas?',
      '¿Qué tan fácilmente inicias conversaciones con personas que no conoces?',
      '¿Qué tan bien trabajas en equipo?',
      '¿Qué tan bien ayudas a resolver desacuerdos entre personas?',
      '¿Con qué frecuencia colaboras con otros para lograr un objetivo?',
      '¿Con qué frecuencia escuchas a otros para ayudarles o aconsejarles?',
      '¿Con qué frecuencia practicas habilidades como la escucha activa o la comunicación asertiva?',
      '¿Con qué frecuencia participas en grupos o actividades que amplían tus relaciones?'
    ]
  },
  {
    id: 'intra',
    nombre: 'Inteligencia intrapersonal',
    corto: 'Intrapersonal',
    icono: 'user',
    desc: 'Capacidad para conocer los propios límites, regular impulsos emocionales, autoevaluarse y definir metas congruentes.',
    rec: {
      area: 'Inteligencia intrapersonal',
      explicacion: 'La autorregulación emocional previene el estrés y la fatiga en ambientes de alta presión, y asegura el apego estricto a las normas de seguridad.',
      accion: 'Lleva una bitácora semanal de autoreflexión sobre decisiones tomadas, aplica técnicas de gestión del tiempo y define planes de desarrollo individual (PDI).',
      objetivo: 'Fortalecer el autoliderazgo, la resiliencia emocional y la disciplina operacional.'
    },
    preg: [
      '¿Qué tan bien identificas tus propias emociones?',
      '¿Qué tan claramente reconoces tus fortalezas y limitaciones?',
      '¿Qué tan bien regulas tus emociones ante situaciones difíciles?',
      '¿Qué tan bien estableces metas personales realistas?',
      '¿Con qué frecuencia reflexionas sobre tus decisiones y sus resultados?',
      '¿Con qué frecuencia actúas de acuerdo con tus valores y metas?',
      '¿Con qué frecuencia buscas retroalimentación para conocerte mejor?',
      '¿Con qué frecuencia dedicas tiempo a planificar tu desarrollo personal?'
    ]
  },
  {
    id: 'nat',
    nombre: 'Inteligencia naturalista',
    corto: 'Naturalista',
    icono: 'leaf',
    desc: 'Sensibilidad para observar patrones ambientales, clasificar recursos naturales y comprender la sostenibilidad ecológica.',
    rec: {
      area: 'Inteligencia naturalista',
      explicacion: 'Esencial en industrias extractivas y productivas para gestionar la huella hídrica, cumplimiento de EIAs, economía circular y gestión de relaves/residuos.',
      accion: 'Estudia normativas de gestión ambiental (ISO 14001, balance de cuencas hídricas) y diseña iniciativas de reducción de consumo de recursos en tu puesto.',
      objetivo: 'Incorporar la variable ecológica y de sostenibilidad en las decisiones estratégicas.'
    },
    preg: [
      '¿Qué tan fácilmente reconoces plantas, animales o fenómenos naturales?',
      '¿Qué tan atento estás a los cambios en el entorno natural?',
      '¿Qué tan bien clasificas elementos de la naturaleza según sus características?',
      '¿Qué tan bien comprendes la relación entre los seres vivos y su entorno?',
      '¿Con qué frecuencia pasas tiempo en contacto con la naturaleza?',
      '¿Con qué frecuencia practicas hábitos de cuidado del ambiente?',
      '¿Con qué frecuencia lees o investigas sobre naturaleza y ecología?',
      '¿Con qué frecuencia participas en actividades de observación o conservación ambiental?'
    ]
  },
  {
    id: 'exi',
    nombre: 'Inteligencia existencial',
    corto: 'Existencial',
    icono: 'compass',
    extension: true,
    desc: 'Inclinación a reflexionar sobre el propósito trascendente, la ética corporativa y el impacto a largo plazo de las acciones humanas.',
    rec: {
      area: 'Inteligencia existencial (Extensión)',
      explicacion: 'Aporta la visión de largo plazo que trasciende la rentabilidad trimestral, orientando la organización hacia la gobernanza ética (ESG) y el legado social.',
      accion: 'Dedica espacios a reflexionar sobre el impacto social de tus proyectos, revisa los códigos de ética corporativos y alinea tus metas con un propósito superior.',
      objetivo: 'Articular un liderazgo con base ética sólida y visión de sostenibilidad intergeneracional.'
    },
    preg: [
      '¿Qué tan seguido te planteas preguntas sobre el sentido de la vida o tu propósito?',
      '¿Qué tan cómodo te sientes ante preguntas que no tienen una respuesta definitiva?',
      '¿Qué tan bien relacionas tus decisiones diarias con tus valores más profundos?',
      '¿Qué tan fácilmente consideras perspectivas distintas sobre temas éticos o trascendentales?',
      '¿Con qué frecuencia reflexionas sobre el impacto de tus acciones en otras personas?',
      '¿Con qué frecuencia dedicas tiempo a la reflexión, la meditación o el silencio?',
      '¿Con qué frecuencia lees o dialogas sobre filosofía, ética o sentido de vida?',
      '¿Con qué frecuencia revisas tu propósito y lo ajustas cuando lo necesitas?'
    ]
  }
];

/* ============================ CAPITAL RELACIONAL PERSONAL ============================ */
const REL_PERSONAL = [
  {
    nombre: 'Comunicación',
    rec: {
      area: 'Comunicación Relacional',
      explicacion: 'Una comunicación ambigua genera reprocesos, fricciones y malentendidos entre áreas operativas y directivas.',
      accion: 'Practica la técnica de confirmación en dos vías (paráfrasis) y formula preguntas abiertas para validar entendimiento.',
      objetivo: 'Minimizar distorsiones de mensaje y asegurar alineamiento en los objetivos compartidos.'
    },
    preguntas: [
      F('expresas tus ideas con claridad al conversar con otras personas'),
      F('escuchas con atención antes de responder'),
      F('adaptas tu forma de comunicarte según la persona o la situación'),
      F('pides aclaraciones cuando algo no te queda claro')
    ]
  },
  {
    nombre: 'Cooperación',
    rec: {
      area: 'Cooperación y Trabajo en Equipo',
      explicacion: 'Los silos individuales fragmentan el flujo de la cadena de valor y multiplican los costos de transacción interna.',
      accion: 'Identifica necesidades en otras áreas de tu equipo y colabora activamente ofreciendo herramientas o información compartida.',
      objetivo: 'Fomentar la reciprocidad y la integración multifuncional de procesos.'
    },
    preguntas: [
      F('colaboras con otros para alcanzar objetivos comunes'),
      F('compartes información y recursos útiles con las personas con quienes trabajas o estudias'),
      F('reconoces y valoras los aportes de los demás'),
      F('ayudas a otros cuando lo necesitan, aunque no sea parte de tus tareas')
    ]
  },
  {
    nombre: 'Confianza',
    rec: {
      area: 'Construcción de Confianza',
      explicacion: 'La confianza es el lubricante organizacional que reduce la necesidad de control burocrático excesivo.',
      accion: 'Cumple sistemáticamente los acuerdos pactados en plazos fijados y comunica oportunamente cualquier riesgo antes de fallar.',
      objetivo: 'Consolidar credibilidad profesional y capital de reputación.'
    },
    preguntas: [
      F('cumples los compromisos que adquieres con otras personas'),
      F('te sientes cómodo confiando en las personas con quienes trabajas o estudias'),
      F('otras personas recurren a ti cuando necesitan apoyo'),
      F('hablas con honestidad aun cuando el tema es difícil')
    ]
  },
  {
    nombre: 'Gestión de relaciones',
    rec: {
      area: 'Gestión de Relaciones y Stakeholders',
      explicacion: 'La habilidad de construir redes estratégicas y resolver tensiones pacíficamente preserva la licencia social individual e institucional.',
      accion: 'Mapea tus contactos clave, programa contactos periódicos sin interés inmediato y aborda diferencias con foco en intereses, no en posiciones.',
      objetivo: 'Ampliar una red de capital social sólida y duradera.'
    },
    preguntas: [
      F('abordas los conflictos buscando soluciones y no culpables'),
      F('mantienes contacto con personas que pueden aportar a tu desarrollo'),
      F('muestras empatía ante las emociones de los demás'),
      F('construyes relaciones positivas con personas diferentes a ti')
    ]
  }
];

/* ============================ CAPITAL ESTRUCTURAL PERSONAL ============================ */
const EST_PERSONAL = [
  {
    nombre: 'Gestión del conocimiento',
    rec: {
      area: 'Gestión del Conocimiento Personal',
      explicacion: 'La pérdida de registros y bitácoras obliga a reinventar la rueda permanentemente, reduciendo la productividad.',
      accion: 'Crea repositorios digitales clasificados por proyectos y redacta notas de lecciones aprendidas al culminar hitos.',
      objetivo: 'Convertir la experiencia empírica en conocimiento sistemático reutilizable.'
    },
    preguntas: [
      F('organizas tus apuntes, archivos o documentos de modo que puedes encontrarlos con rapidez'),
      F('registras lo que aprendes de tus experiencias'),
      F('compartes tus conocimientos con otras personas'),
      F('revisas y actualizas la información que conservas')
    ]
  },
  {
    nombre: 'Procesos y organización',
    rec: {
      area: 'Procesos y Estandarización',
      explicacion: 'La improvisación incrementa la probabilidad de errores operativos y accidentes en faenas exigentes.',
      accion: 'Escribe listas de verificación (checklists) para tus tareas recurrentes y aplica el ciclo PHVA (Planificar-Hacer-Verificar-Actuar).',
      objetivo: 'Elevar la reproducibilidad y confiabilidad de los entregables individuales.'
    },
    preguntas: [
      F('planificas tus tareas antes de comenzar'),
      F('describes o documentas los pasos de los procedimientos que repites'),
      F('defines prioridades y plazos para tus actividades'),
      F('evalúas cómo trabajaste para mejorar tu forma de hacerlo')
    ]
  },
  {
    nombre: 'Sistemas y tecnología',
    rec: {
      area: 'Sistemas y Tecnología Aplicada',
      explicacion: 'El rezago digital frena la competitividad frente a perfiles adaptados a la industria 4.0.',
      accion: 'Automatiza rutinas de datos mediante macros o scripts, aprende software analítico y respalda información en la nube.',
      objetivo: 'Aprovechar la tecnología como multiplicador de productividad cognitiva.'
    },
    preguntas: [
      F('usas herramientas digitales para organizar tu trabajo o estudio'),
      F('haces copias de seguridad de tu información importante'),
      F('aprendes a usar herramientas tecnológicas nuevas'),
      F('simplificas o automatizas tareas repetitivas con ayuda de la tecnología')
    ]
  },
  {
    nombre: 'Cultura e innovación',
    rec: {
      area: 'Cultura e Innovación Continua',
      explicacion: 'La resistencia al cambio petrifica las metodologías de trabajo e impide adaptarse a nuevas exigencias del mercado.',
      accion: 'Propón una mejora mensual en tus flujos de trabajo, realiza pilotos controlados y analiza los fracasos como aprendizaje.',
      objetivo: 'Mantener una mentalidad ágil de mejora y curiosidad experimental.'
    },
    preguntas: [
      F('propones ideas para mejorar la forma de hacer las cosas'),
      F('pruebas enfoques nuevos aunque no estés seguro del resultado'),
      F('aprendes de tus errores y ajustas tu manera de trabajar'),
      F('participas en espacios donde se comparten ideas o buenas prácticas')
    ]
  }
];

/* ============================ CUESTIONARIO EMPRESARIAL ============================ */
// 12 subíndices organizados en las 3 dimensiones (4 subíndices por dimensión, 3 preguntas cada uno = 36 preguntas)
const EMPRESA_ITEMS = [
  // Capital Humano (4)
  {
    cap: 'humano',
    nombre: 'Competencias técnicas',
    rec: {
      area: 'Competencias Técnicas del Personal',
      explicacion: 'La brecha entre el perfil requerido y las competencias reales del personal merma la eficiencia de las operaciones.',
      accion: 'Levantar un inventario de competencias críticas por puesto y diseñar planes de entrenamiento técnico en simuladores.',
      objetivo: 'Garantizar que el 100% del personal clave cuente con certificación de competencias validadas.'
    },
    preguntas: [
      F('las personas de la organización cuentan con los conocimientos necesarios para hacer bien su trabajo'),
      F('el personal aplica sus habilidades para resolver los problemas del día a día'),
      F('se identifican y aprovechan las capacidades de cada trabajador')
    ]
  },
  {
    cap: 'humano',
    nombre: 'Formación y desarrollo',
    rec: {
      area: 'Formación y Desarrollo Continuo',
      explicacion: 'La falta de capacitación estanca el know-how corporativo ante innovaciones del sector.',
      accion: 'Formular un plan anual de capacitación (PAC) enfocado en minería 4.0, seguridad y liderazgo de turno.',
      objetivo: 'Superar un promedio de 80 horas de capacitación anual por colaborador.'
    },
    preguntas: [
      F('la organización ofrece capacitaciones útiles para tu puesto'),
      F('tienes oportunidades de crecer o asumir nuevas responsabilidades'),
      F('recibes retroalimentación que te ayuda a mejorar')
    ]
  },
  {
    cap: 'humano',
    nombre: 'Motivación y compromiso',
    rec: {
      area: 'Clima Laboral y Compromiso',
      explicacion: 'La desmotivación y la rotación no deseada destruyen el capital humano y encarecen los costos de reemplazo.',
      accion: 'Implementar encuestas periódicas de clima (eNPS), programas de reconocimiento y optimizar esquemas de turnos y descanso.',
      objetivo: 'Reducir la rotación voluntaria a menos del 3.5% anual.'
    },
    preguntas: [
      F('te sientes motivado para dar lo mejor en tu trabajo'),
      F('sientes que tu esfuerzo es reconocido'),
      F('el personal muestra compromiso con los objetivos de la organización')
    ]
  },
  {
    cap: 'humano',
    nombre: 'Liderazgo y supervisión',
    rec: {
      area: 'Liderazgo en Terreno',
      explicacion: 'El liderazgo verticalista y distante bloquea el reporte temprano de riesgos y desmotiva a las guardias operativas.',
      accion: 'Capacitar a supervisores de primera línea en liderazgo visible, coaching y empoderamiento de seguridad.',
      objetivo: 'Lograr una evaluación positiva de liderazgo superior al 85% en las auditorías internas.'
    },
    preguntas: [
      F('tus jefes comunican con claridad lo que esperan de ti'),
      F('los líderes escuchan las ideas del personal'),
      F('los líderes dan ejemplo con su comportamiento')
    ]
  },

  // Capital Relacional (4)
  {
    cap: 'relacional',
    nombre: 'Relación con clientes',
    rec: {
      area: 'Relaciones Comerciales y Clientes',
      explicacion: 'La pérdida de trazabilidad o calidad en la entrega compromete los contratos a largo plazo con refinerías y fundiciones.',
      accion: 'Instituir protocolos de calidad concertada, encuestas semestrales de satisfacción y certificación The Copper Mark.',
      objetivo: 'Mantener un índice de cumplimiento contractual (OTIF) igual o mayor al 98%.'
    },
    preguntas: [
      F('la organización conoce las necesidades de sus clientes'),
      F('los reclamos de los clientes se atienden con rapidez'),
      F('se mide la satisfacción de los clientes')
    ]
  },
  {
    cap: 'relacional',
    nombre: 'Proveedores y contratistas',
    rec: {
      area: 'Cadena de Proveedores y Contratistas',
      explicacion: 'La heterogeneidad en estándares de seguridad y calidad entre contratistas genera incidentes y retrasos en la cadena de valor.',
      accion: 'Homologar proveedores bajo estándares corporativos HSEC e incentivar el desarrollo de proveedores locales de la región.',
      objetivo: 'Alinear al 100% de contratistas a las normas de seguridad corporativa.'
    },
    preguntas: [
      F('la organización mantiene buena coordinación con sus proveedores'),
      F('se establecen alianzas con otras instituciones u organizaciones'),
      F('se cumplen los acuerdos con proveedores y aliados')
    ]
  },
  {
    cap: 'relacional',
    nombre: 'Comunicación y diálogo social',
    rec: {
      area: 'Licencia Social y Relaciones Comunitarias',
      explicacion: 'El aislamiento de las comunidades vecinas alimenta la desconfianza y arriesga paros o bloqueos que paralizan la operación.',
      accion: 'Fortalecer las mesas de diálogo permanente en distritos vecinos e invertir en proyectos de valor compartido (agua, salud, educación).',
      objetivo: 'Sostener cero días de paralización por conflictos sociales.'
    },
    preguntas: [
      F('la información importante llega a tiempo a quienes la necesitan'),
      F('las distintas áreas colaboran entre sí'),
      F('existen canales para expresar opiniones o inquietudes')
    ]
  },
  {
    cap: 'relacional',
    nombre: 'Reputación y legitimidad',
    rec: {
      area: 'Reputación Corporativa y ESG',
      explicacion: 'Una reputación débil debilita la posición de la empresa ante autoridades ambientales (Senace) para ampliar permisos.',
      accion: 'Publicar informes de sostenibilidad auditados según estándares GRI/ICMM y difundir hitos ambientales como La Enlozada.',
      objetivo: 'Posicionar la empresa en el cuartil superior de percepción ciudadana en Arequipa.'
    },
    preguntas: [
      F('la organización cumple lo que promete'),
      F('el personal se siente orgulloso de pertenecer a la organización'),
      F('la organización es vista de forma positiva por su entorno')
    ]
  },

  // Capital Estructural (4)
  {
    cap: 'estructural',
    nombre: 'Gestión del conocimiento organizacional',
    rec: {
      area: 'Repositorio del Conocimiento Organizacional',
      explicacion: 'La jubilación de metalurgistas y técnicos experimentados sin transferencia documentada causa pérdidas millonarias.',
      accion: 'Crear un banco digital de lecciones aprendidas de guardias y planes de sucesión técnica estructurados.',
      objetivo: 'Documentar el 100% de los procesos críticos y problemas resueltos en planta y mina.'
    },
    preguntas: [
      F('se documentan los procedimientos y las lecciones aprendidas'),
      F('es fácil encontrar la información que se necesita para trabajar'),
      F('quienes más saben comparten su conocimiento con el resto del equipo')
    ]
  },
  {
    cap: 'estructural',
    nombre: 'Procesos y estandarización',
    rec: {
      area: 'Estandarización de Procesos (SOPs / PETS)',
      explicacion: 'Las variaciones no controladas en molienda o flotación encarecen el costo unitario por libra de metal producida.',
      accion: 'Auditar periódicamente los procedimientos escritos de trabajo seguro y aplicar metodologías Lean Mining.',
      objetivo: 'Alcanzar una adherencia a los procedimientos estandarizados mayor al 95%.'
    },
    preguntas: [
      F('los procesos de trabajo están definidos y se siguen'),
      F('se revisan los procesos para mejorarlos'),
      F('las responsabilidades de cada área están claras')
    ]
  },
  {
    cap: 'estructural',
    nombre: 'Sistemas y tecnología de planta',
    rec: {
      area: 'Sistemas Tecnológicos y Automatización SCADA',
      explicacion: 'La obsolescencia tecnológica limita la capacidad de procesar 409,500 t/d ante la baja de leyes de mineral.',
      accion: 'Integrar sistemas SCADA/DCS con gemelos digitales y modelos predictivos de mantenimiento de molinos SAG.',
      objetivo: 'Lograr una disponibilidad de equipos principales de planta superior al 92%.'
    },
    preguntas: [
      F('las herramientas tecnológicas disponibles son adecuadas para el trabajo'),
      F('los sistemas de información permiten trabajar con datos confiables'),
      F('se protege adecuadamente la información de la organización')
    ]
  },
  {
    cap: 'estructural',
    nombre: 'Innovación y mejora continua',
    rec: {
      area: 'Cultura de Innovación y Mejora Continua',
      explicacion: 'Sin innovación continua, los incrementos en costos de energía, agua y reactivos reducen el margen de la cadena de valor.',
      accion: 'Implementar un programa de sugerencias premiadas del personal de base y desarrollar pilotos de inteligencia artificial aplicada.',
      objetivo: 'Generar al menos 10 iniciativas de innovación validadas por año con retorno medible.'
    },
    preguntas: [
      F('se fomenta que el personal proponga ideas nuevas'),
      F('se prueban nuevas formas de trabajar o de ofrecer productos y servicios'),
      F('se aprende de los errores sin buscar culpables')
    ]
  }
];

const CAPS = {
  humano: { nombre: 'Capital humano', color: COLOR.humano },
  relacional: { nombre: 'Capital relacional', color: COLOR.relacional },
  estructural: { nombre: 'Capital estructural', color: COLOR.estructural }
};

const SECTORES_DEFAULT = [
  'Minería y Recursos Naturales',
  'Manufactura e Industria',
  'Comercio y Distribución',
  'Servicios Profesionales',
  'Tecnología y Software',
  'Educación e Investigación',
  'Salud y Farmacéutica',
  'Construcción e Infraestructura',
  'Agroindustria',
  'Otro'
];

/* Departamentos / Oficinas predeterminados sugeridos según sector económico */
const DEPARTAMENTOS_POR_SECTOR = {
  'Minería y Recursos Naturales': [
    'Operaciones Mina (Tajo / Subsuelo)',
    'Planta Concentradora & Procesos',
    'Mantenimiento Mecánico-Eléctrico',
    'Seguridad, Salud Ocupacional & Medio Ambiente (SSOMA)',
    'Relaciones Comunitarias & Responsabilidad Social',
    'Administración, Costos & Cadena de Suministro'
  ],
  'Manufactura e Industria': [
    'Producción y Líneas de Ensamble',
    'Control de Calidad y Certificaciones ISO',
    'Mantenimiento de Planta y Maquinaria',
    'Almacén, Compras y Cadena de Suministro',
    'Seguridad Industrial y Salud Ocupacional',
    'Administración, Finanzas y RR.HH.'
  ],
  'Comercio y Distribución': [
    'Ventas y Canales Comerciales (B2B/B2C)',
    'Logística, Almacén y Distribución (Fulfillment)',
    'Marketing, Publicidad y Comercio Electrónico',
    'Servicio al Cliente, Garantías y Postventa',
    'Compras y Gestión Estratégica de Proveedores',
    'Administración, Facturación y Finanzas'
  ],
  'Servicios Profesionales': [
    'Consultoría y Gestión de Proyectos Estratégicos',
    'Asesoría Legal, Tributaria y Cumplimiento',
    'Auditoría, Contabilidad y Finanzas',
    'Gestión del Talento Humano y Desarrollo Organizacional',
    'Desarrollo de Negocios y Relación con Clientes',
    'Tecnología de la Información y Soporte'
  ],
  'Tecnología y Software': [
    'Ingeniería de Software y Desarrollo de Producto',
    'Infraestructura Cloud, DevOps y Ciberseguridad',
    'Diseño UX/UI, Producto e Investigación',
    'Ciencia de Datos, BI e Inteligencia Artificial',
    'Ventas Técnicas B2B y Customer Success',
    'Cultura, Talento y Gestión Humana'
  ],
  'Educación e Investigación': [
    'Dirección Académica y Coordinación Docente',
    'Investigación, Desarrollo e Innovación (I+D+i)',
    'Posgrado, Formación Continua y Extensión',
    'Admisiones, Matrícula y Servicios al Estudiante',
    'Bienestar Universitario, Tutoría y Empleabilidad',
    'Administración, Finanzas y Planeamiento Institucional'
  ],
  'Salud y Farmacéutica': [
    'Dirección Médica y Atención Asistencial',
    'Enfermería y Cuidados Hospitalarios',
    'Farmacia, Laboratorio Clínico e Insumos Médicos',
    'Auditoría Médica, Calidad y Epidemiología',
    'Admisión, Seguros y Facturación Hospitalaria',
    'Gestión del Talento y Servicios Generales'
  ],
  'Construcción e Infraestructura': [
    'Oficina Técnica, Metrados y Presupuestos (S10/BIM)',
    'Residencia de Obra y Producción en Frente',
    'Seguridad, Salud y Medio Ambiente (SSOMA)',
    'Logística de Materiales, Equipos y Maquinaria Amarilla',
    'Control de Calidad y Laboratorio de Ensayos',
    'Administración de Obra, Tareos y Valorizaciones'
  ],
  'Agroindustria': [
    'Operaciones de Campo, Riego y Labores Agrícolas',
    'Planta de Procesamiento y Empaque (Packing)',
    'Aseguramiento de la Calidad e Inocuidad (HACCP/GlobalGAP)',
    'Mantenimiento Agroindustrial e Infraestructura',
    'Logística de Exportación, Aduanas y Cadena de Frío',
    'Recursos Humanos, Bienestar y Relaciones Laborales'
  ],
  'Otro': [
    'Dirección y Planeamiento Estratégico',
    'Operaciones y Servicios Principales',
    'Administración, Finanzas y Tesorería',
    'Gestión del Talento y Cultura Organizacional',
    'Comercial, Ventas y Atención al Cliente',
    'Tecnología, Procesos y Mejora Continua'
  ]
};

const TAMANOS_DEFAULT = [
  'Microempresa (1-10 trabajadores)',
  'Pequeña (11-50 trabajadores)',
  'Mediana (51-250 trabajadores)',
  'Gran Empresa (más de 250 trabajadores)'
];

const NIVELES_EDUCATIVOS = [
  'Secundaria completa',
  'Técnico superior en curso',
  'Técnico superior titulado',
  'Universitario en curso',
  'Universitario titulado',
  'Posgrado / Maestría / Doctorado',
  'Otro'
];

/* ============================ DEFINICIONES DE EVALUACIÓN ============================ */
const DEFS = {};

INTELIGENCIAS.forEach(i => {
  DEFS['int_' + i.id] = {
    key: 'int_' + i.id,
    titulo: i.nombre,
    dim: 'humano',
    color: COLOR.humano,
    recSub: null, // usa la recomendación estructurada de la inteligencia
    ref: i,
    subindices: SUB_INT.map((n, k) => ({
      nombre: n,
      preguntas: i.preg.slice(k * 2, k * 2 + 2)
    }))
  };
});

DEFS.relacional = {
  key: 'relacional',
  titulo: 'Capital relacional',
  dim: 'relacional',
  color: COLOR.relacional,
  subindices: REL_PERSONAL,
  nota: 'Estas preguntas exploran tus comportamientos y experiencias personales en comunicación, cooperación y confianza. No constituyen una medida objetiva de tus relaciones.'
};

DEFS.estructural = {
  key: 'estructural',
  titulo: 'Capital estructural',
  dim: 'estructural',
  color: COLOR.estructural,
  subindices: EST_PERSONAL,
  nota: 'Esta modalidad personal evalúa tus hábitos de organización, gestión de información y uso de tecnología. No evalúa la estructura de una empresa.'
};

DEFS.empresa = {
  key: 'empresa',
  titulo: 'Cuestionario de Capital Intelectual Organizacional',
  dim: 'empresa',
  color: COLOR.navy,
  subindices: EMPRESA_ITEMS,
  nota: 'Responde pensando en la organización donde trabajas. Tus respuestas se consolidarán de forma agregada para el diagnóstico corporativo.'
};

/* ============================ UTILIDADES BÁSICAS ============================ */
const $ = s => document.querySelector(s);
const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const f2 = v => (v == null || isNaN(v)) ? '—' : Number(v).toFixed(2).replace('.', ',');
const clasif = v => CONFIG.rangos.find(r => v <= r.max) || CONFIG.rangos[CONFIG.rangos.length - 1];
const pill = v => `<span class="pill ${clasif(v).cls}">${f2(v)} · ${clasif(v).etq}</span>`;

function hoy() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

const fmtFecha = s => {
  if (!s) return '';
  const parts = s.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return s;
};

const icono = (n, cls = '') => `<i data-lucide="${n}" class="ic ${cls}"></i>`;

/* ============================ MOTOR DE CÁLCULO REUTILIZABLE ============================ */
// Devuelve null si faltan respuestas. NO redondea en pasos intermedios.
function calcular(def, r) {
  let k = 0;
  const subs = [];
  for (const s of def.subindices) {
    const vals = s.preguntas.map(() => r[k++]);
    if (vals.some(v => !v)) return null;
    subs.push({
      nombre: s.nombre,
      cap: s.cap,
      valor: avg(vals),
      rec: s.rec || null
    });
  }
  return {
    subs,
    total: avg(subs.map(s => s.valor))
  };
}

const aplanar = def => def.subindices.flatMap((s, si) => s.preguntas.map((t, qi) => ({ si, qi, t, sub: s.nombre })));
const nPreg = def => def.subindices.reduce((n, s) => n + s.preguntas.length, 0);

/* ============================ GENERADOR DE ARQUETIPOS DE RESPUESTA ============================ */
function generarRespuestasArquetipo(def, arquetipo = 'realista') {
  const flat = aplanar(def);
  const numSubs = def.subindices ? def.subindices.length : 1;

  switch (arquetipo) {
    case 'sobresaliente': {
      // Alto desempeño: 4 y 5 en todos los reactivos (~4.65)
      const pat = [5, 5, 4, 5, 5, 5, 4, 5, 5, 4];
      return flat.map((_, idx) => pat[idx % pat.length]);
    }
    case 'realista': {
      // Perfil realista recomendado para sustentación:
      // Subíndices sólidos (4 y 5) con brechas puntuales (2 y 3) en los últimos subíndices
      // para fundamentar y justificar el Plan de Mejora ante el jurado de tesis/evaluación.
      return flat.map(item => {
        if (item.si === numSubs - 1) {
          // Último subíndice (ej. Desarrollo, Innovación): brecha de oportunidad (2-3)
          return (item.qi % 2 === 0) ? 3 : 2;
        } else if (numSubs >= 4 && item.si === numSubs - 2) {
          // Penúltimo subíndice: nivel intermedio (3-4)
          return (item.qi % 2 === 0) ? 3 : 4;
        } else {
          // Primeros subíndices: fortalezas consolidadas (4-5)
          return (item.qi % 2 === 0) ? 5 : 4;
        }
      });
    }
    case 'no_apto': {
      // Perfil con brechas críticas: calificaciones bajas (1 a 3, promedio ~2.45)
      const pat = [2, 1, 2, 3, 2, 2, 1, 3, 2, 2];
      return flat.map((_, idx) => pat[idx % pat.length]);
    }
    case 'aleatorio':
    default: {
      // Dinámico pseudo-aleatorio con distribución ponderada
      const opciones = [2, 3, 3, 4, 4, 4, 5, 5];
      return flat.map(() => opciones[Math.floor(Math.random() * opciones.length)]);
    }
  }
}

/* ============================ GESTIÓN DE ESTADO Y LOCALSTORAGE ============================ */
function nuevoEstado() {
  return {
    v: 2,
    modalidad: 'inicio', // 'inicio', 'personal', 'empresa'
    perfil: null,
    eval: {},
    borr: {},
    historial: [],
    autoAvanzar: true,
    modoSustentacion: false,
    simArquetipo: 'realista',
    filtroSubs: 'todos',
    filtroResumen: 'todos',
    empresa: {
      datos: null,
      departamentos: [
        'Operaciones Mina (Tajo)',
        'Planta Concentradora (C1/C2)',
        'Mantenimiento Mecánico-Eléctrico',
        'Relaciones Comunitarias & Responsabilidad Social',
        'Medio Ambiente & Recursos Hídricos (La Enlozada)',
        'Administración, Costos & Cadena de Suministro'
      ],
      borr: null,
      resp: []
    }
  };
}

function cargar() {
  try {
    const s = JSON.parse(localStorage.getItem(CONFIG.storageKey));
    if (s && s.v === 2) {
      if (s.autoAvanzar === undefined) s.autoAvanzar = true;
      if (s.modoSustentacion === undefined) s.modoSustentacion = false;
      if (!s.simArquetipo) s.simArquetipo = 'realista';
      if (!s.filtroSubs) s.filtroSubs = 'todos';
      if (!s.filtroResumen) s.filtroResumen = 'todos';
      return s;
    }
  } catch (e) {}
  return nuevoEstado();
}

let S = cargar();

function guardar() {
  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(S));
  } catch (e) {
    toast('No se pudo guardar localmente (almacenamiento no disponible).');
  }
}

/* ============================ INTERFAZ: TOAST Y MODALES ============================ */
let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('on'), 3000);
}

function modal({ titulo, texto, ok = 'Aceptar', cancel = 'Cancelar', onOk }) {
  $('#modal').innerHTML = `
    <div class="modal-bg" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="modal">
        <h3 id="modalTitle">${titulo}</h3>
        <div style="font-size:0.95rem;color:var(--txt);margin:0.8rem 0 1.2rem;line-height:1.5">${texto}</div>
        <div class="fila">
          ${cancel ? `<button type="button" class="btn btn-sec" data-act="cerrarModal">${cancel}</button>` : ''}
          <button type="button" class="btn" id="modalOkBtn">${ok}</button>
        </div>
      </div>
    </div>`;
  $('#modalOkBtn').onclick = () => {
    cerrarModal();
    if (onOk) onOk();
  };
  $('#modalOkBtn').focus();
}

function cerrarModal() {
  $('#modal').innerHTML = '';
}

/* ============================ GESTIÓN DE GRÁFICOS (CHART.JS) ============================ */
const charts = [];
function destruirGraficos() {
  charts.splice(0).forEach(c => {
    try { c.destroy(); } catch (e) {}
  });
}

function sinChart(id) {
  const el = $('#' + id);
  if (el) {
    el.parentElement.innerHTML = `
      <div class="aviso">
        No se pudo cargar la biblioteca gráfica (Chart.js). Verifica tu conexión a Internet para renderizar el gráfico.
      </div>`;
  }
}

function graficoBarras(id, labels, vals, colores, horizontal) {
  if (!window.Chart) return sinChart(id);
  const eje = { min: 0, max: 5, ticks: { stepSize: 1 }, grid: { color: '#e2e8f0' } };
  charts.push(new Chart($('#' + id), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: vals,
        backgroundColor: colores,
        borderRadius: 6,
        maxBarThickness: 42
      }]
    },
    options: {
      indexAxis: horizontal ? 'y' : 'x',
      maintainAspectRatio: false,
      scales: {
        [horizontal ? 'x' : 'y']: eje,
        [horizontal ? 'y' : 'x']: { grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: c => ' ' + f2(c.parsed[horizontal ? 'x' : 'y']) + ' / 5.00'
          }
        }
      }
    }
  }));
}

function graficoBarrasAgrupadas(id, labels, datasets) {
  if (!window.Chart) return sinChart(id);
  const eje = { min: 0, max: 5, ticks: { stepSize: 1 }, grid: { color: '#e2e8f0' } };
  charts.push(new Chart($('#' + id), {
    type: 'bar',
    data: {
      labels,
      datasets: datasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.color,
        borderRadius: 4,
        maxBarThickness: 32
      }))
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10, weight: '600' } } },
        y: eje
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { boxWidth: 12, font: { size: 11, weight: '600' } }
        },
        tooltip: {
          callbacks: {
            label: c => ' ' + c.dataset.label + ': ' + f2(c.parsed.y) + ' / 5.00'
          }
        }
      }
    }
  }));
}

function graficoMadurezDoughnut(id, dist) {
  if (!window.Chart) return sinChart(id);
  const total = (dist.inicial || 0) + (dist.desarrollo || 0) + (dist.consolidado || 0) + (dist.sobresaliente || 0);
  const data = [dist.inicial || 0, dist.desarrollo || 0, dist.consolidado || 0, dist.sobresaliente || 0];
  const colors = ['#dc2626', '#d97706', '#16a34a', '#12263f'];
  const baseLabels = [
    'Nivel Inicial / Crítico (1.00-2.50)',
    'En Desarrollo (2.51-3.40)',
    'Consolidado (3.41-4.20)',
    'Sobresaliente (4.21-5.00)'
  ];

  charts.push(new Chart($('#' + id), {
    type: 'doughnut',
    data: {
      labels: baseLabels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      maintainAspectRatio: false,
      cutout: '56%',
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: {
            boxWidth: 14,
            font: { size: 11 },
            generateLabels: chart => {
              return chart.data.labels.map((l, i) => {
                const val = data[i];
                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                return {
                  text: l + ': ' + val + ' (' + pct + '%)',
                  fillStyle: colors[i],
                  strokeStyle: '#ffffff',
                  lineWidth: 1,
                  hidden: false,
                  index: i
                };
              });
            }
          }
        },
        tooltip: {
          callbacks: {
            label: c => {
              const val = c.raw;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return ' ' + val + ' colaborador(es) (' + pct + '%)';
            }
          }
        }
      }
    }
  }));
}

function graficoRadar(id, labels, vals, color, customLabel) {
  if (!window.Chart) return sinChart(id);
  const el = $('#' + id);
  if (!el) return;
  const benchmarkVal = 4.50;
  const ChartConstructor = window.Chart || (typeof Chart !== 'undefined' ? Chart : null);
  if (!ChartConstructor) return sinChart(id);
  charts.push(new ChartConstructor(el, {
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label: customLabel || 'Puntuación Obtenida',
          data: vals,
          backgroundColor: color + '33',
          borderColor: color,
          pointBackgroundColor: color,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          spanGaps: false
        },
        {
          label: 'Estándar de Excelencia Benchmark (4,50)',
          data: labels.map(() => benchmarkVal),
          backgroundColor: 'transparent',
          borderColor: '#0d9488',
          borderWidth: 1.5,
          borderDash: [4, 4],
          pointRadius: 2,
          pointHoverRadius: 4,
          pointBackgroundColor: '#0d9488'
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 5,
          ticks: { stepSize: 1, backdropColor: 'transparent', font: { size: 10 } },
          pointLabels: { font: { size: 11, weight: '600' } },
          grid: { color: '#e2e8f0' }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { boxWidth: 12, font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: c => ` ${c.dataset.label}: ${f2(c.parsed.r)} / 5,00`
          }
        }
      }
    }
  }));
}

/* ============================ ANÁLISIS ESTRUCTURADO: FORTALEZAS Y RECOMENDACIONES ============================ */
function analisis(items) {
  const ord = [...items].sort((a, b) => b.valor - a.valor);
  let fort = ord.filter(x => x.valor >= CONFIG.umbralFortaleza).slice(0, 3);
  let relF = false;
  if (!fort.length) {
    fort = ord.slice(0, 1);
    relF = true;
  }

  const asc = [...ord].reverse();
  let mej = asc.filter(x => x.valor <= CONFIG.umbralMejora).slice(0, 3);
  let relM = false;
  if (!mej.length) {
    mej = asc.slice(0, 1);
    relM = true;
  }

  return { fort, mej, relF, relM };
}

function htmlRecomendacionesEstructuradas(mejoresItems) {
  if (!mejoresItems.length) return '';
  return `
    <div class="card">
      <h3>Plan de Recomendaciones de Mejora Continua</h3>
      <p class="nota">Derivadas directamente de las puntuaciones obtenidas en las áreas con mayor margen de desarrollo.</p>
      <div style="margin-top:1rem">
        ${mejoresItems.map(item => {
          const r = item.rec || {
            area: item.nombre,
            explicacion: 'Esta dimensión presenta oportunidad para optimizar procesos y consolidar competencias.',
            accion: 'Implementar talleres de buenas prácticas y seguimiento de indicadores periódicos.',
            objetivo: 'Alcanzar una puntuación superior a 3.50 en la próxima evaluación.'
          };
          return `
            <div class="rec-box">
              <div class="rec-area">
                <span>${esc(r.area)}</span>
                ${pill(item.valor)}
              </div>
              <div class="rec-item"><strong>Diagnóstico:</strong> ${esc(r.explicacion)}</div>
              <div class="rec-item"><strong>Acción sugerida:</strong> ${esc(r.accion)}</div>
              <div class="rec-item"><strong>Objetivo de mejora:</strong> ${esc(r.objetivo)}</div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

function htmlAnalisisFortalezasMejoras(items) {
  if (!items.length) return '';
  const a = analisis(items);
  const li = x => `<li><strong>${esc(x.nombre)}</strong> ${pill(x.valor)}</li>`;

  return `
    <div class="cols2">
      <div class="card">
        <h3>Fortalezas Relativas Identificadas</h3>
        ${a.relF ? '<p class="nota">Ningún elemento superó el umbral alto (3.41); se exhiben los de mayor desempeño relativo.</p>' : '<p class="nota">Dimensiones con mayor nivel de madurez alcanzado.</p>'}
        <ul class="lista">${a.fort.map(li).join('')}</ul>
      </div>
      <div class="card">
        <h3>Áreas con Oportunidad de Desarrollo</h3>
        ${a.relM ? '<p class="nota">Las puntuaciones son elevadas en general; se señala el área con menor puntuación relativa.</p>' : '<p class="nota">Dimensiones donde se recomienda concentrar los esfuerzos de desarrollo.</p>'}
        <ul class="lista">${a.mej.map(li).join('')}</ul>
      </div>
    </div>
    ${htmlRecomendacionesEstructuradas(a.mej)}`;
}

/* ============================ MOTOR DE PLAN DE ACCIÓN ESTRATÉGICO ============================ */
function diagnosticarEscenarioPlan(puntajeGlobal) {
  if (puntajeGlobal <= 2.60) {
    return {
      nivel: 'critico',
      etiqueta: 'Nivel Crítico / Prioridad de Rescate',
      estrategia: 'Estrategia de Choque y Reestructuración Base',
      desc: 'El resultado global refleja brechas críticas (≤ 2.60) que comprometen el desempeño estratégico. Se activa un plan de intervención inmediata (0–30 días) orientado a estabilizar competencias esenciales, canales relacionales y procesos clave.'
    };
  }
  if (puntajeGlobal <= 3.40) {
    return {
      nivel: 'intermedio',
      etiqueta: 'Nivel Intermedio / En Desarrollo',
      estrategia: 'Estrategia de Cierre de Brechas y Estandarización',
      desc: 'Se observa una base operativa funcional, pero con brechas tácticas (≤ 3.40). El plan prioriza el fortalecimiento progresivo en el corto plazo (31–60 días) para llevar las áreas débiles al umbral de consolidación.'
    };
  }
  if (puntajeGlobal <= 4.20) {
    return {
      nivel: 'alto',
      etiqueta: 'Nivel Alto / Consolidado',
      estrategia: 'Estrategia de Optimización hacia el Benchmark (4,50)',
      desc: 'Los resultados muestran un capital intelectual maduro y competitivo. El plan enfoca los esfuerzos en cerrar las brechas relativas restantes para alcanzar el estándar de excelencia Benchmark (4,50).'
    };
  }
  return {
    nivel: 'sobresaliente',
    etiqueta: 'Nivel Sobresaliente / Excelencia',
    estrategia: 'Estrategia de Sostenimiento, Mentoría e Innovación',
    desc: 'Desempeño sobresaliente (> 4.20) en la evaluación. El plan estructura iniciativas de sostenimiento, transferencia de conocimiento (mentoría) e innovación continua sobre las áreas de menor puntuación relativa.'
  };
}

function construirAccionItem(item, modo) {
  const v = item.valor;
  const cap = item.cap || 'humano';
  const r = item.rec || {
    area: item.nombre,
    explicacion: 'Dimensión clave para el equilibrio del capital intelectual.',
    accion: 'Ejecutar sesiones prácticas de mejora continua y revisión periódica de avances.',
    objetivo: 'Elevar de forma sostenida el desempeño en la próxima re-evaluación.'
  };

  let prio = 'p3', prioEtq = '🟢 P3 · Optimización', plazo = '61 – 90+ días (Mediano Plazo)', fase = 3;
  if (v <= 2.60) {
    prio = 'p1'; prioEtq = '🔴 P1 · Crítica'; plazo = '0 – 30 días (Inmediato)'; fase = 1;
  } else if (v <= 3.40) {
    prio = 'p2'; prioEtq = '🟡 P2 · Táctica'; plazo = '31 – 60 días (Corto Plazo)'; fase = 2;
  }

  const brecha = Math.max(0, 4.50 - v);
  const meta = v <= 2.60
    ? Math.min(3.60, v + 1.00)
    : (v <= 3.40 ? Math.min(4.10, v + 0.70) : Math.max(4.50, Math.min(5.00, v + 0.30)));

  let accionAdaptada = r.accion;
  if (v <= 2.60) {
    accionAdaptada = `[Intervención urgente] ${r.accion} Realizar seguimiento semanal de cumplimiento.`;
  } else if (v > 3.40) {
    accionAdaptada = `[Sostenimiento y excelencia] ${r.accion} Documentar buenas prácticas y asumir rol de referente.`;
  }

  const responsablesEmp = {
    humano: 'Gerencia de Talento Humano / Jefaturas de Área',
    relacional: 'Gerencia Comercial / Compras / Rel. Comunitarias',
    estructural: 'Gerencia de Operaciones / TI / Aseguramiento de Calidad'
  };
  const responsablesPers = {
    humano: 'Evaluado (Autogestión) y Mentor / Tutor',
    relacional: 'Evaluado y Red de Pares / Supervisión',
    estructural: 'Evaluado (Hábitos digitales y gestión personal)'
  };

  const kpisEmp = {
    humano: `Puntaje ≥ ${f2(meta)} y ≥ 85% cumplimiento del Plan de Capacitación`,
    relacional: `Puntaje ≥ ${f2(meta)} e Índice de Satisfacción / OTIF ≥ 95%`,
    estructural: `Puntaje ≥ ${f2(meta)} y 100% de procesos críticos documentados`
  };
  const kpisPers = {
    humano: `Subir de ${f2(v)} a ≥ ${f2(meta)} en re-evaluación (4 semanas)`,
    relacional: `Subir de ${f2(v)} a ≥ ${f2(meta)} con ≥ 2 evidencias prácticas/mes`,
    estructural: `Subir de ${f2(v)} a ≥ ${f2(meta)} con hábito semanal verificado`
  };

  const dimNombre = (CAPS[cap] && CAPS[cap].nombre) ? CAPS[cap].nombre : 'Capital Humano';

  return {
    area: r.area || item.nombre,
    dimension: dimNombre,
    cap,
    valor: v,
    brecha,
    meta,
    prio,
    prioEtq,
    plazo,
    fase,
    diagnostico: r.explicacion,
    accion: accionAdaptada,
    objetivo: `${r.objetivo} (Meta numérica: ${f2(v)} → ≥ ${f2(meta)})`,
    responsable: modo === 'empresa' ? (responsablesEmp[cap] || responsablesEmp.humano) : (responsablesPers[cap] || responsablesPers.humano),
    kpi: modo === 'empresa' ? (kpisEmp[cap] || kpisEmp.humano) : (kpisPers[cap] || kpisPers.humano)
  };
}

function renderPlanAccionEstructurado({ modo, titulo, subtitulo, entidad, puntajeGlobal, items, volverAct, porArea }) {
  const escDiag = diagnosticarEscenarioPlan(puntajeGlobal);
  const ordenados = [...items].sort((a, b) => a.valor - b.valor);
  const conBrecha = ordenados.filter(x => x.valor <= CONFIG.umbralMejora);
  // Si todas superan 3.40, tomar hasta las 6 con menor puntaje relativo para plan de optimización/sostenimiento
  const seleccionados = conBrecha.length ? conBrecha : ordenados.slice(0, Math.min(6, ordenados.length));
  const acciones = seleccionados.map(it => construirAccionItem(it, modo));

  const nP1 = acciones.filter(a => a.prio === 'p1').length;
  const nP2 = acciones.filter(a => a.prio === 'p2').length;
  const nP3 = acciones.filter(a => a.prio === 'p3').length;
  const brechaProm = avg(acciones.map(a => a.brecha));

  const f1 = acciones.filter(a => a.fase === 1);
  const f2Items = acciones.filter(a => a.fase === 2);
  const f3 = acciones.filter(a => a.fase === 3);

  // Focos departamentales (solo en modalidad empresarial si existen áreas visibles)
  let htmlDeptos = '';
  if (modo === 'empresa' && porArea && porArea.length) {
    const visibles = porArea.filter(a => !a.oculto).sort((a, b) => a.total - b.total);
    if (visibles.length) {
      const focos = visibles.slice(0, 3);
      htmlDeptos = `
        <div class="card">
          <h3>Foco de Intervención por Departamento / Área</h3>
          <p class="nota">Áreas organizacionales ordenadas de menor a mayor índice global para focalizar recursos y capacitación.</p>
          <div class="plan-table-wrap">
            <table class="plan-table">
              <thead>
                <tr>
                  <th>Departamento / Oficina</th>
                  <th>Índice Global</th>
                  <th>Dimensión Más Débil</th>
                  <th>Directiva Recomendada</th>
                </tr>
              </thead>
              <tbody>
                ${focos.map(a => {
                  const dims = [
                    { k: 'Capital Humano', v: a.humano },
                    { k: 'Capital Relacional', v: a.relacional },
                    { k: 'Capital Estructural', v: a.estructural }
                  ].sort((x, y) => x.v - y.v);
                  const debil = dims[0];
                  const dir = a.total <= 2.60
                    ? `Intervención inmediata en ${debil.k} (${f2(debil.v)}) mediante mesa técnica semanal.`
                    : (a.total <= 3.40
                      ? `Plan de nivelación táctica en ${debil.k} (${f2(debil.v)}) en los próximos 60 días.`
                      : `Consolidar liderazgo y transferir buenas prácticas desde ${debil.k} (${f2(debil.v)}).`);
                  return `
                    <tr>
                      <td><strong>${esc(a.area)}</strong><br><small class="muted">${a.n} respuestas</small></td>
                      <td>${f2(a.total)} ${pill(a.total)}</td>
                      <td><strong>${debil.k}</strong> (${f2(debil.v)})</td>
                      <td>${esc(dir)}</td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>`;
    }
  }

  return `
    <div class="solo-print">
      <h2>INTELECTUS-CI — ${esc(titulo)}</h2>
      <p>${esc(entidad)} · Fecha: ${fmtFecha(hoy())} · Índice Global: ${f2(puntajeGlobal)} / 5,00</p>
    </div>

    <div class="fila sep" style="margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
      <div>
        <h2>${esc(titulo)}</h2>
        <p class="muted">${esc(subtitulo)}</p>
      </div>
      <div class="fila no-print" style="gap:0.4rem;">
        <button class="btn btn-sec btn-sm" data-act="nav" data-arg="${volverAct}">${icono('arrow-left')} Volver al panel</button>
        <button class="btn btn-sm" data-act="imprimir">${icono('printer')} Imprimir / PDF</button>
      </div>
    </div>

    <!-- 1. DIAGNÓSTICO SITUACIONAL Y KPIs DEL PLAN -->
    <div class="card plan-banner nivel-${escDiag.nivel}">
      <div class="fila sep" style="align-items:flex-start; flex-wrap:wrap; gap:1rem;">
        <div style="flex:1; min-width:260px;">
          <div class="plan-tag-diag">
            ${icono('compass')} DIAGNÓSTICO AUTOMÁTICO BASADO EN RESULTADOS
          </div>
          <h3 style="margin:0.2rem 0 0.35rem; font-size:1.3rem;">${esc(escDiag.estrategia)}</h3>
          <p style="margin:0; font-size:0.93rem;">${esc(escDiag.desc)}</p>
        </div>
        <div style="text-align:right; background:#fff; padding:0.75rem 1.1rem; border-radius:12px; border:1px solid var(--line); box-shadow:var(--shadow-sm);">
          <div class="score-num" style="font-size:2.1rem;">${f2(puntajeGlobal)} <span class="score-max">/ 5,00</span></div>
          <span class="pill ${clasif(puntajeGlobal).cls}">${esc(escDiag.etiqueta)}</span>
        </div>
      </div>

      <div class="kpis" style="margin-top:1rem; margin-bottom:0;">
        <div class="kpi">
          <div class="kpi-num">${acciones.length}</div>
          <small>Iniciativas en el Plan</small>
        </div>
        <div class="kpi">
          <div class="kpi-num" style="color:var(--r1);">${nP1}</div>
          <small>Prioridad Crítica (P1)</small>
        </div>
        <div class="kpi">
          <div class="kpi-num" style="color:var(--r2);">${nP2}</div>
          <small>Prioridad Táctica (P2)</small>
        </div>
        <div class="kpi">
          <div class="kpi-num" style="color:var(--navy);">${f2(brechaProm)}</div>
          <small>Brecha Prom. vs Benchmark (4,50)</small>
        </div>
      </div>
    </div>

    <!-- 2. MATRIZ ESTRUCTURADA DEL PLAN DE ACCIÓN -->
    <div class="card">
      <div class="fila sep" style="margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
        <div>
          <h3 style="margin:0;">Matriz Estructurada del Plan de Acción</h3>
          <p class="nota" style="margin:0.15rem 0 0;">Ordenada por nivel de urgencia (de menor a mayor puntaje arrojado).</p>
        </div>
        <div class="filter-subindices-bar no-print">
          <button type="button" class="filter-pill act" data-act="filtrarPlanAccion" data-arg="todos">📋 Todas (${acciones.length})</button>
          <button type="button" class="filter-pill" data-act="filtrarPlanAccion" data-arg="p1">🔴 Críticas P1 (${nP1})</button>
          <button type="button" class="filter-pill" data-act="filtrarPlanAccion" data-arg="p2">🟡 Tácticas P2 (${nP2})</button>
          <button type="button" class="filter-pill" data-act="filtrarPlanAccion" data-arg="p3">🟢 Optimización P3 (${nP3})</button>
        </div>
      </div>

      <div class="plan-table-wrap">
        <table class="plan-table">
          <thead>
            <tr>
              <th>Prioridad</th>
              <th>Área / Dimensión</th>
              <th>Resultado y Brecha</th>
              <th>Objetivo Estratégico (SMART)</th>
              <th>Acciones Concretas</th>
              <th>Responsable y Plazo</th>
              <th>KPI de Verificación</th>
            </tr>
          </thead>
          <tbody id="tbodyPlanAccion">
            ${acciones.map(a => {
              const barColor = a.prio === 'p1' ? 'var(--r1)' : (a.prio === 'p2' ? 'var(--r2)' : 'var(--r5)');
              const pctBar = Math.min(100, Math.round((a.valor / 5) * 100));
              return `
              <tr data-prio="${a.prio}">
                <td>
                  <span class="prio-badge prio-${a.prio}">${a.prioEtq}</span>
                </td>
                <td>
                  <strong>${esc(a.area)}</strong><br>
                  <span class="cap-chip ${a.cap}">${esc(a.dimension)}</span>
                </td>
                <td>
                  <strong>${f2(a.valor)}</strong> / 5,00
                  <div class="mini-bar-wrap" title="Nivel actual: ${pctBar}%">
                    <div class="mini-bar-fill" style="width:${pctBar}%; background:${barColor};"></div>
                  </div>
                  <small class="muted">Brecha: -${f2(a.brecha)} pts</small>
                </td>
                <td>${esc(a.objetivo)}</td>
                <td>
                  <div>${esc(a.accion)}</div>
                  <small class="muted" style="display:block; margin-top:0.25rem;"><em>Diagnóstico:</em> ${esc(a.diagnostico)}</small>
                </td>
                <td>
                  <strong>${esc(a.responsable)}</strong><br>
                  <small class="muted">${esc(a.plazo)}</small>
                </td>
                <td>${esc(a.kpi)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- 3. HOJA DE RUTA POR HORIZONTES (30 - 60 - 90 DÍAS) -->
    <div class="card">
      <h3>Hoja de Ruta de Ejecución (Horizonte 30 – 60 – 90+ Días)</h3>
      <p class="nota">Secuencia temporal recomendada para ejecutar el plan sin saturar la capacidad operativa.</p>
      <div class="roadmap-grid">
        <div class="roadmap-col fase-1">
          <h4><span>Fase 1 · 0 a 30 días</span> <span class="prio-badge prio-p1">${f1.length}</span></h4>
          ${f1.length ? `<ul class="roadmap-list">${f1.map(a => `<li><strong>${esc(a.area)} (${f2(a.valor)}):</strong> ${esc(a.accion)}</li>`).join('')}</ul>` : '<p class="nota">Sin brechas críticas inmediatas en esta fase.</p>'}
        </div>
        <div class="roadmap-col fase-2">
          <h4><span>Fase 2 · 31 a 60 días</span> <span class="prio-badge prio-p2">${f2Items.length}</span></h4>
          ${f2Items.length ? `<ul class="roadmap-list">${f2Items.map(a => `<li><strong>${esc(a.area)} (${f2(a.valor)}):</strong> ${esc(a.accion)}</li>`).join('')}</ul>` : '<p class="nota">Sin brechas tácticas pendientes en esta fase.</p>'}
        </div>
        <div class="roadmap-col fase-3">
          <h4><span>Fase 3 · 61 a 90+ días</span> <span class="prio-badge prio-p3">${f3.length}</span></h4>
          ${f3.length ? `<ul class="roadmap-list">${f3.map(a => `<li><strong>${esc(a.area)} (${f2(a.valor)}):</strong> ${esc(a.accion)}</li>`).join('')}</ul>` : '<p class="nota">Se recomienda programar la re-evaluación integral al cierre del trimestre.</p>'}
        </div>
      </div>
    </div>

    ${htmlDeptos}

    <div class="aviso">
      <strong>Seguimiento y Control:</strong> Se recomienda re-aplicar la evaluación INTELECTUS-CI al término de los 60–90 días para medir el cierre efectivo de brechas respecto a las metas trazadas.
    </div>`;
}

/* ============================ ESTADOS DE AVANCE ============================ */
function estadoEval(key) {
  const def = DEFS[key], tot = nPreg(def);
  if (S.eval[key]) {
    const val = (S.eval[key].resultado && S.eval[key].resultado.total != null) ? S.eval[key].resultado.total : null;
    return { cls: 'ok', txt: 'Completada', valor: val, hecho: tot, tot };
  }
  const b = S.borr[key];
  const n = b ? b.r.filter(Boolean).length : 0;
  if (n > 0) return { cls: 'prog', txt: `En progreso (${n}/${tot})`, hecho: n, tot };
  return { cls: '', txt: 'No iniciada', hecho: 0, tot };
}

function capitalHumanoResumen() {
  const hechas = INTELIGENCIAS.filter(i => S.eval['int_' + i.id] && S.eval['int_' + i.id].resultado && S.eval['int_' + i.id].resultado.total != null);
  return {
    n: hechas.length,
    total: hechas.length === 9 ? avg(hechas.map(i => S.eval['int_' + i.id].resultado.total)) : null
  };
}

/* ============================ CUESTIONARIO INTERACTIVO ============================ */
let Q = null;

function iniciarQ(key, ctx) {
  const def = DEFS[key], flat = aplanar(def);
  Q = { key, def, flat, i: 0, r: Array(flat.length).fill(0), ctx: ctx || null };

  const b = key === 'empresa' ? S.empresa.borr : S.borr[key];
  if (b && b.r && b.r.length === flat.length && (key !== 'empresa' || !ctx)) {
    Q.r = b.r.slice();
    Q.i = Math.min(b.i || 0, flat.length - 1);
    if (key === 'empresa') Q.ctx = b.ctx;
  }
  ir('cuestionario');
}

function persistirQ() {
  if (!Q) return;
  if (Q.key === 'empresa') S.empresa.borr = { r: Q.r.slice(), i: Q.i, ctx: Q.ctx };
  else S.borr[Q.key] = { r: Q.r.slice(), i: Q.i };
  guardar();
}

function volverDeQ() {
  if (!Q) return ir('inicio');
  persistirQ();
  const k = Q.key;
  Q = null;
  if (k === 'empresa') ir('empresaPanel');
  else if (k.startsWith('int_')) ir('humano');
  else ir('panel');
}

function finalizarQ() {
  const falt = Q.r.map((v, i) => v ? null : i).filter(x => x !== null);
  if (falt.length) {
    modal({
      titulo: 'Cuestionario incompleto',
      texto: `Aún restan <strong>${falt.length}</strong> pregunta(s) por responder. El sistema requiere completar la totalidad de reactivos para procesar los cálculos definitivos.`,
      ok: 'Ir a la primera pendiente',
      cancel: 'Cerrar',
      onOk: () => { Q.i = falt[0]; render(); }
    });
    return;
  }

  modal({
    titulo: 'Finalizar y procesar evaluación',
    texto: 'Se procederá al cálculo de puntuaciones y generación de gráficos. Podrás consultar el informe en cualquier momento desde el historial.',
    ok: 'Finalizar evaluación',
    cancel: 'Seguir revisando',
    onOk: cerrarEvaluacion
  });
}

function cerrarEvaluacion() {
  const res = calcular(Q.def, Q.r);
  if (!res) return toast('Faltan respuestas.');
  const fecha = hoy();

  if (Q.key === 'empresa') {
    S.empresa.resp.push({
      id: 'r_' + Date.now(),
      nombre: (Q.ctx && Q.ctx.nombre) || 'Anónimo',
      area: (Q.ctx && Q.ctx.area) || 'Otra',
      fecha,
      r: Q.r.slice()
    });
    S.empresa.borr = null;
    guardar();
    Q = null;
    ir('empresaPanel');
    toast('¡Evaluación empresarial registrada exitosamente!');
  } else {
    const key = Q.key;
    S.eval[key] = { fecha, r: Q.r.slice(), resultado: res };
    S.historial.unshift({ id: 'h_' + Date.now(), key, titulo: Q.def.titulo, fecha, resultado: res });
    delete S.borr[key];
    guardar();
    Q = null;
    ir('resultado', { key });
    toast('Evaluación personal completada con éxito.');
  }
}

/* ============================ VISTAS Y PLANTILLAS ============================ */
const VISTAS = {};
const POST = {};

/* ---------- 1. PANTALLA DE INICIO (BIENVENIDA) ---------- */
VISTAS.inicio = () => `
  <section class="hero">
    <h1>INTELECTUS</h1>
    <div class="sub">Sistema de Evaluación del Capital Intelectual</div>
    <p class="desc">
      Plataforma interactiva para evaluar, medir y alinear estratégicamente los activos intangibles de personas y organizaciones. Analiza las <b>9 inteligencias múltiples</b>, el <b>capital relacional</b> y el <b>capital estructural</b> con cálculo de promedios, gráficos radiales y recomendaciones prácticas.
    </p>
    <div class="hero-chips">
      <span class="hchip">${icono('brain')} Capital Humano</span>
      <span class="hchip">${icono('handshake')} Capital Relacional</span>
      <span class="hchip">${icono('network')} Capital Estructural</span>
      <span class="hchip">${icono('sparkles')} Estrategia y Valor</span>
    </div>
  </section>

  <div class="cards2">
    <div class="card acc tinte-humano">
      <div class="icobox bg-humano">${icono('user-round', 'ic-lg')}</div>
      <h2>Evaluación Personal</h2>
      <p>Conoce tus fortalezas, identifica tus capacidades en las nueve inteligencias y descubre oportunidades de desarrollo profesional y personal.</p>
      <div class="push">
        <button class="btn btn-humano" data-act="irPersonal">
          ${icono('play')} Comenzar evaluación personal
        </button>
      </div>
    </div>

    <div class="card acc tinte-estructural">
      <div class="icobox bg-estructural">${icono('building-2', 'ic-lg')}</div>
      <h2>Evaluación Empresarial</h2>
      <p>Analiza el capital intelectual de tu organización, recopila evaluaciones de trabajadores por departamentos y genera resultados agregados estratégicos.</p>
      <div class="push">
        <button class="btn btn-estructural" data-act="irEmpresa">
          ${icono('arrow-right')} Ingresar a evaluación empresarial
        </button>
      </div>
    </div>
  </div>

  <div class="card tinte-navy">
    <h3>Sinergia con INTELECTUS-CV (Cadena de Valor Minera)</h3>
    <p>
      En la Administración Estratégica, el <b>Capital Intelectual</b> cobra vida en las actividades primarias de la <b>Cadena de Valor de Porter</b>. Evalúa tu perfil técnico, operativo y de supervisión frente a las convocatorias reales del sector minero peruano (<b>Maccaferri Huaraz</b>, <b>Antamina</b> y <b>La Libertad</b>):
    </p>
    <div class="fila" style="margin-top:0.8rem">
      <a href="intelectus_cv.html" class="btn btn-sec">
        ${icono('layers')} Ingresar a INTELECTUS-CV (Competencias Mineras)
      </a>
    </div>
  </div>

  <div class="card alcance">
    <h3>Alcance Técnico y Arquitectura de la Demostración</h3>
    <p><span class="tag-op">OPERATIVO EN NAVEGADOR</span> Cuestionarios completos, motor matemático de promedios, gráficos dinámicos con Chart.js, plan de mejora, exportación CSV y generación de informes imprimibles.</p>
    <p><span class="tag-sim">DATOS LOCALES</span> Esta demostración almacena los datos en LocalStorage (en tu equipo). Para una implementación corporativa multiusuario real, se requerirá un backend con API REST, base de datos relacional y autenticación JWT.</p>
  </div>`;

/* ---------- 2. EVALUACIÓN PERSONAL: REGISTRO Y PERFIL ---------- */
VISTAS.registro = () => {
  const p = S.perfil || {};
  const esEdicion = !!(S.perfil && S.perfil.nombre);
  return `
    <h2>${esEdicion ? 'Editar Perfil del Evaluado' : 'Registro de la Persona Evaluada'}</h2>
    <p class="muted">${esEdicion ? 'Actualiza tus datos para personalizar las evaluaciones y reportes. Los cambios se guardarán automáticamente.' : 'Ingresa tus datos para personalizar las evaluaciones y reportes. Los datos se conservan en tu navegador.'}</p>
    
    <div class="card">
      <form class="form" data-form="perfil" novalidate>
        <div>
          <label for="f-nombre">Nombre completo *</label>
          <input id="f-nombre" name="nombre" value="${esc(p.nombre || '')}" placeholder="Ej. Carlos Hilario Mendoza" autocomplete="name">
          <small class="err" data-err="nombre"></small>
        </div>

        <div>
          <label for="f-edad">Edad <span class="opt">(opcional)</span></label>
          <input id="f-edad" name="edad" type="number" min="10" max="100" value="${esc(p.edad || '')}" placeholder="Ej. 24">
          <small class="err" data-err="edad"></small>
        </div>

        <div>
          <label for="f-ocup">Ocupación o Profesión *</label>
          <input id="f-ocup" name="ocupacion" value="${esc(p.ocupacion || '')}" placeholder="Ej. Estudiante de Ingeniería / Analista de Operaciones">
          <small class="err" data-err="ocupacion"></small>
        </div>

        <div>
          <label for="f-niv">Nivel educativo <span class="opt">(opcional)</span></label>
          <select id="f-niv" name="nivel">
            <option value="">Selecciona tu nivel...</option>
            ${NIVELES_EDUCATIVOS.map(n => `<option value="${n}" ${p.nivel === n ? 'selected' : ''}>${n}</option>`).join('')}
          </select>
        </div>

        <div>
          <label for="f-fecha">Fecha de evaluación *</label>
          <input id="f-fecha" name="fecha" type="date" value="${esc(p.fecha || hoy())}">
          <small class="err" data-err="fecha"></small>
        </div>

        <div class="fila">
          <button class="btn btn-humano" type="submit">${icono('save')} ${esEdicion ? 'Guardar cambios y volver al panel' : 'Guardar y continuar al panel'}</button>
          <button class="btn btn-sec" type="button" data-act="rellenarFormPerfilDemo" title="Rellenar formulario con datos de ejemplo para la sustentación">${icono('sparkles')} Cargar datos demo</button>
          <button class="btn btn-sec" type="button" data-act="nav" data-arg="${esEdicion ? 'panel' : 'inicio'}">Cancelar</button>
        </div>
      </form>
    </div>`;
};
VISTAS.perfil = VISTAS.registro;

/* ---------- 3. PANEL PERSONAL (DASHBOARD) ---------- */
VISTAS.panel = () => {
  if (!S.perfil) {
    return `
      <div class="fila sep" style="margin-bottom:1rem">
        <div>
          <h2>Panel de Evaluación Personal</h2>
          <p class="muted">Configuración de perfil personal</p>
        </div>
        <button class="btn btn-sec btn-sm" data-act="nav" data-arg="inicio">${icono('home')} Inicio</button>
      </div>
      <div class="card" style="text-align:center;padding:3rem 1.5rem;">
        <div class="card-ico humano" style="margin:0 auto 1rem;">${icono('user')}</div>
        <h2>Aún no has registrado tu perfil</h2>
        <p class="muted">Para comenzar la evaluación de capital intelectual, registra tus datos básicos o carga un perfil de prueba para la sustentación.</p>
        <div class="fila" style="justify-content:center;gap:0.75rem;margin-top:1.25rem;flex-wrap:wrap;">
          <button class="btn btn-humano" data-act="nav" data-arg="registro">
            ${icono('user-plus')} Registrar mi perfil
          </button>
          <button class="btn btn-sec" data-act="crearPerfilDemo">
            ${icono('sparkles')} Cargar perfil de demostración
          </button>
        </div>
      </div>`;
  }

  const ch = capitalHumanoResumen();
  const rel = estadoEval('relacional');
  const est = estadoEval('estructural');
  const p = S.perfil;

  const tarjetaDim = (dim, ico, titulo, desc, estadoHtml, btnHtml) => `
    <div class="card acc tinte-${dim}">
      <div class="icobox bg-${dim}">${icono(ico, 'ic-lg')}</div>
      <h3>${titulo}</h3>
      <p style="font-size:0.9rem;color:var(--muted)">${desc}</p>
      <div style="margin:0.5rem 0">${estadoHtml}</div>
      <div class="push">${btnHtml}</div>
    </div>`;

  return `
    <div class="fila sep" style="margin-bottom:1rem">
      <div>
        <h2>Panel de Evaluación Personal</h2>
        <p class="muted">${esc(p.nombre)} · ${esc(p.ocupacion)} · Evaluación del ${fmtFecha(p.fecha)}</p>
      </div>
      <div class="fila">
        <button class="btn btn-sec btn-sm" data-act="nav" data-arg="perfil">${icono('user')} Editar perfil</button>
        <button class="btn btn-ghost btn-sm" data-act="nav" data-arg="historial">${icono('history')} Historial (${S.historial.length})</button>
      </div>
    </div>

    <!-- TARJETA DE SIMULACIÓN INTEGRAL (PARA SUSTENTACIÓN) -->
    <div class="card sim-archetypes-card" style="margin-bottom:1.25rem; padding:1.15rem 1.35rem;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
        <div style="max-width:680px;">
          <div style="font-size:0.72rem; font-weight:800; color:var(--humano); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:0.25rem;">
            MODALIDAD DEMOSTRATIVA PARA SUSTENTACIÓN ESTRATÉGICA
          </div>
          <h3 style="margin:0 0 0.25rem; color:var(--navy); font-size:1.15rem;">
            Simulación Rápida de Capital Intelectual Personal
          </h3>
          <p class="muted" style="margin:0; font-size:0.85rem; line-height:1.45;">
            Rellena y evalúa automáticamente las <strong>9 inteligencias múltiples</strong>, el <strong>capital relacional</strong> y el <strong>capital estructural</strong> con arquetipos calibrados. Habilita de inmediato todos los <strong>gráficos radiales</strong>, <strong>índices consolidados</strong> y el <strong>plan de mejora</strong> para tu sustentación.
          </p>
        </div>
        <div class="fila" style="gap:0.4rem; flex-wrap:wrap;">
          ${(ch.n > 0 || rel.valor != null || est.valor != null) ? `
            <button class="btn btn-ghost btn-sm" data-act="limpiarPersonal" title="Limpiar evaluaciones personales para reiniciar">${icono('trash-2')} Limpiar datos</button>
          ` : ''}
          <button class="btn btn-copper btn-sm" data-act="nav" data-arg="resumen" title="Ver informe general consolidado">
            ${icono('bar-chart-2')} Ver Resumen
          </button>
        </div>
      </div>

      <div style="margin-top:0.85rem; padding-top:0.75rem; border-top:1px solid #e2e8f0; display:flex; align-items:center; gap:0.45rem; flex-wrap:wrap;">
        <span style="font-size:0.8rem; font-weight:700; color:var(--navy);">${icono('sparkles')} Simular todo con:</span>
        <button type="button" class="btn btn-outline btn-xs" data-act="simularPersonalCompleto" data-arg="sobresaliente" title="Simular todas las dimensiones con desempeño sobresaliente (~4.65)">🌟 Sobresaliente</button>
        <button type="button" class="btn btn-teal btn-xs" data-act="simularPersonalCompleto" data-arg="realista" title="Recomendado para Sustentación: Perfil realista con fortalezas y brechas para justificar el Plan de Mejora">⚖️ Realista con Brechas (Recomendado)</button>
        <button type="button" class="btn btn-outline btn-xs" data-act="simularPersonalCompleto" data-arg="no_apto" title="Simular todas las dimensiones con brechas críticas (~2.45)">⚠️ Con Brechas Críticas</button>
        <button type="button" class="btn btn-copper btn-xs" data-act="simularPersonalCompleto" data-arg="aleatorio" title="Simular con variabilidad aleatoria dinámica">🎲 Aleatorio Dinámico</button>
      </div>
    </div>

    <div class="cards3">
      ${tarjetaDim(
        'humano',
        'brain',
        'Capital Humano',
        'Evaluación de las 9 inteligencias múltiples: conocimientos, habilidades y capacidades personales.',
        `<span class="badge ${ch.n === 9 ? 'ok' : (ch.n ? 'prog' : '')}">${ch.n} de 9 inteligencias</span> ${ch.total != null ? pill(ch.total) : ''}`,
        `<button class="btn btn-humano btn-sm" data-act="nav" data-arg="humano">${ch.n ? 'Continuar' : 'Comenzar'} módulo humano</button>`
      )}

      ${tarjetaDim(
        'relacional',
        'handshake',
        'Capital Relacional',
        'Comunicación, cooperación, confianza y gestión de relaciones interpersonales y profesionales.',
        `<span class="badge ${rel.cls}">${rel.txt}</span> ${rel.valor != null ? pill(rel.valor) : ''}`,
        rel.valor != null
          ? `<div class="fila"><button class="btn btn-relacional btn-sm" data-act="verResultado" data-arg="relacional">Ver resultados</button><button class="btn btn-sec btn-sm" data-act="repetir" data-arg="relacional">Repetir</button></div>`
          : `<button class="btn btn-relacional btn-sm" data-act="iniciar" data-arg="relacional">${rel.hecho ? 'Continuar' : 'Comenzar'} evaluación</button>`
      )}

      ${tarjetaDim(
        'estructural',
        'network',
        'Capital Estructural',
        'Gestión del conocimiento personal, orden de procesos, herramientas digitales y cultura de mejora.',
        `<span class="badge ${est.cls}">${est.txt}</span> ${est.valor != null ? pill(est.valor) : ''}`,
        est.valor != null
          ? `<div class="fila"><button class="btn btn-estructural btn-sm" data-act="verResultado" data-arg="estructural">Ver resultados</button><button class="btn btn-sec btn-sm" data-act="repetir" data-arg="estructural">Repetir</button></div>`
          : `<button class="btn btn-estructural btn-sm" data-act="iniciar" data-arg="estructural">${est.hecho ? 'Continuar' : 'Comenzar'} evaluación</button>`
      )}
    </div>

    <div class="card" style="margin-top:1rem">
      <div class="fila sep">
        <div>
          <h3>Consolidado y Reportes</h3>
          <p class="nota">Consulta el gráfico radial integrado de las 9 inteligencias y el comparativo dimensional.</p>
        </div>
        <div class="fila">
          <button class="btn" data-act="nav" data-arg="resumen">${icono('bar-chart-3')} Ver resumen y gráficos</button>
          <button class="btn btn-sec" data-act="nav" data-arg="planMejora">${icono('compass')} Plan de mejora</button>
        </div>
      </div>
    </div>`;
};

/* ---------- 4. MÓDULO CAPITAL HUMANO: 9 INTELIGENCIAS MÚLTIPLES ---------- */
VISTAS.humano = () => {
  const ch = capitalHumanoResumen();
  return `
    <div class="fila sep" style="margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
      <div>
        <h2>Capital Humano: Evaluación de Inteligencias Múltiples</h2>
        <p class="muted">9 inteligencias evaluadas en 4 subíndices (Habilidades, Capacidades, Aplicación, Desarrollo) con 8 preguntas cada una (72 preguntas en total).</p>
      </div>
      <div class="fila" style="gap:0.4rem; flex-wrap:wrap;">
        <button class="btn btn-teal btn-sm" data-act="simularHumanoCompleto" data-arg="realista" title="Simular 9 inteligencias con arquetipo realista calibrado">${icono('zap')} Simular 9 (Realista)</button>
        <button class="btn btn-outline btn-sm" data-act="simularHumanoCompleto" data-arg="sobresaliente" title="Simular 9 inteligencias con arquetipo sobresaliente">🌟 Sobresaliente</button>
        <button class="btn btn-sec btn-sm" data-act="nav" data-arg="panel">${icono('arrow-left')} Volver al panel</button>
      </div>
    </div>

    <div class="card">
      <div class="fila sep">
        <div>
          <strong>Progreso del Módulo: ${ch.n} de 9 inteligencias completadas</strong>
          <div class="nota">Completa las 9 inteligencias para calcular el indicador global descriptivo de capital humano.</div>
        </div>
        <div>
          ${ch.total != null ? `<span>Indicador Global Humano: ${pill(ch.total)}</span>` : ''}
        </div>
      </div>
      <div class="prog humano" style="margin-top:0.75rem">
        <span style="width:${(ch.n / 9) * 100}%"></span>
      </div>
    </div>

    <div class="cards3">
      ${INTELIGENCIAS.map(i => {
        const k = 'int_' + i.id;
        const e = estadoEval(k);
        return `
          <div class="card acc tinte-humano">
            <div class="icobox bg-humano">${icono(i.icono, 'ic-lg')}</div>
            <h3>${i.nombre} ${i.extension ? '<span class="badge">extensión</span>' : ''}</h3>
            <p style="font-size:0.88rem;color:var(--muted)">${i.desc}</p>
            ${i.extension ? '<p class="nota">Propuesta complementaria al modelo clásico; evalúa la reflexión ética y propósito de vida.</p>' : ''}
            <div style="margin:0.5rem 0">
              <span class="badge ${e.cls}">${e.txt}</span> ${e.valor != null ? pill(e.valor) : ''}
            </div>
            <div class="push">
              ${e.valor != null
                ? `<div class="fila"><button class="btn btn-humano btn-sm" data-act="verResultado" data-arg="${k}">Ver resultado</button><button class="btn btn-sec btn-sm" data-act="repetir" data-arg="${k}">Repetir</button></div>`
                : `<button class="btn btn-humano btn-sm" data-act="iniciar" data-arg="${k}">${e.hecho ? 'Continuar (' + e.hecho + '/8)' : 'Comenzar (8 preguntas)'}</button>`}
            </div>
          </div>`;
      }).join('')}
    </div>

    ${ch.n > 0 ? `
      <div class="fila" style="margin-top:1rem">
        <button class="btn" data-act="nav" data-arg="resumen">${icono('bar-chart-3')} Ver Gráfico Radial de Inteligencias</button>
      </div>` : ''}`;
};

/* ---------- 5. CUESTIONARIO INTERACTIVO (EJECUCIÓN) ---------- */
VISTAS.cuestionario = () => {
  if (!Q) {
    return `
      <div class="card" style="text-align:center;padding:3rem 1.5rem;">
        <div class="card-ico humano" style="margin:0 auto 1rem;">${icono('clipboard-list')}</div>
        <h3>No hay ningún cuestionario activo</h3>
        <p class="muted">Selecciona una dimensión en el panel para comenzar o continuar una evaluación.</p>
        <button class="btn btn-humano" data-act="nav" data-arg="panel" style="margin-top:1.25rem;">
          ${icono('arrow-left')} Ir al panel personal
        </button>
      </div>`;
  }
  const q = Q.flat[Q.i];
  const n = Q.flat.length;
  const hechas = Q.r.filter(Boolean).length;
  const dim = Q.def.dim;
  const pc = Math.round((hechas / n) * 100);
  const cls = dim === 'empresa' ? '' : dim;
  const progColorCls = pc < 40 ? 'prog-amber' : (pc < 80 ? 'prog-blue' : 'prog-emerald');
  const arqActivo = S.simArquetipo || 'realista';

  return `
    <div class="q-${cls}">
      <div class="fila sep no-print" style="margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
        <h3 style="margin:0">${esc(Q.def.titulo)}</h3>
        <div class="fila" style="gap:0.4rem; flex-wrap:wrap;">
          <button type="button" class="btn btn-copper btn-sm" data-act="autoRellenarYFinalizarQ" data-arg="${arqActivo}" title="Rellenar todas las preguntas y calcular resultados inmediatamente para la sustentación">
            ${icono('zap')} Simular y Finalizar
          </button>
          <button type="button" class="btn btn-ghost btn-sm" data-act="salirQ">${icono('log-out')} Salir</button>
        </div>
      </div>

      <!-- BARRA DE SIMULACIÓN Y ARQUETIPOS PARA SUSTENTACIÓN -->
      <div class="sim-archetypes-card card" style="margin-bottom:1rem; padding:0.85rem 1rem;">
        <div class="fila sep" style="flex-wrap:wrap; gap:0.5rem; align-items:center;">
          <div>
            <span style="font-size:0.72rem; font-weight:800; color:var(--humano); text-transform:uppercase; letter-spacing:0.06em;">⚡ Simulador Rápido de Sustentación</span>
            <div style="font-size:0.82rem; color:var(--muted)">Elige un arquetipo calibrado para autocompletar este cuestionario (${n} preguntas):</div>
          </div>
          <div class="fila" style="gap:0.4rem; align-items:center;">
            <button type="button" class="btn btn-ghost btn-xs" data-act="toggleAutoAvanzar" title="Avanzar automáticamente a la siguiente pregunta al calificar">
              ${S.autoAvanzar ? '⚡ Auto-avance: ON' : '⏸️ Auto-avance: OFF'}
            </button>
            <button type="button" class="btn btn-copper btn-xs" data-act="autoRellenarYFinalizarQ" data-arg="${arqActivo}" title="Rellenar y calcular resultados inmediatamente">
              ${icono('zap')} Simular y Ver Informe
            </button>
          </div>
        </div>
        <div class="fila" style="gap:0.35rem; margin-top:0.6rem; flex-wrap:wrap;">
          <button type="button" class="btn btn-xs ${arqActivo === 'sobresaliente' ? 'btn-humano' : 'btn-outline'}" data-act="autoRellenarQ" data-arg="sobresaliente" title="Perfil Sobresaliente (~4.65)">🌟 Sobresaliente</button>
          <button type="button" class="btn btn-xs ${arqActivo === 'realista' ? 'btn-teal' : 'btn-outline'}" data-act="autoRellenarQ" data-arg="realista" title="Recomendado para Sustentación: fortalezas y brechas puntuales para justificar el Plan de Mejora">⚖️ Realista con Brechas (Recomendado)</button>
          <button type="button" class="btn btn-xs ${arqActivo === 'no_apto' ? 'btn-humano' : 'btn-outline'}" data-act="autoRellenarQ" data-arg="no_apto" title="Perfil con Brechas Críticas (~2.45)">⚠️ Con Brechas Críticas</button>
          <button type="button" class="btn btn-xs ${arqActivo === 'aleatorio' ? 'btn-copper' : 'btn-outline'}" data-act="autoRellenarQ" data-arg="aleatorio" title="Distribución aleatoria dinámica">🎲 Aleatorio Dinámico</button>
        </div>
      </div>

      ${Q.def.nota ? `<div class="aviso azul">${esc(Q.def.nota)}</div>` : ''}
      ${Q.key === 'empresa' && Q.ctx ? `<p class="nota">Evaluando como participante de: <strong>${esc(Q.ctx.area)}</strong> · ${esc(Q.ctx.nombre || 'Anónimo')}</p>` : ''}

      <div class="card">
        <div class="q-head">
          <span class="q-sub">${esc(q.sub)}</span>
          <strong>Pregunta ${Q.i + 1} de ${n}</strong>
        </div>

        <div class="prog ${cls} ${progColorCls}" aria-label="Progreso">
          <span style="width:${pc}%"></span>
        </div>
        <div class="fila sep" style="margin-top:0.35rem; align-items:center;">
          <p class="nota" style="margin:0">
            ${hechas} de ${n} respondidas (${pc}%) ${n - hechas ? `· Faltan ${n - hechas} preguntas` : '· ¡Cuestionario completo!'}
          </p>
          <div class="fila" style="gap:0.35rem;">
            <button type="button" class="btn btn-ghost btn-xs" data-act="autoRellenarQ" data-arg="${arqActivo}" title="Rellenar todas las preguntas con el arquetipo activo">
              ${icono('sparkles')} Rellenar (${arqActivo})
            </button>
          </div>
        </div>

        <div class="q-texto" id="qTexto">${esc(q.t)}</div>

        <div class="escala" role="radiogroup" aria-labelledby="qTexto">
          ${CONFIG.escala.map((et, k) => `
            <button type="button" class="esc-op ${Q.r[Q.i] === k + 1 ? 'sel' : ''}" role="radio" aria-checked="${Q.r[Q.i] === k + 1}" data-act="resp" data-arg="${k + 1}">
              <strong>${k + 1}</strong>
              <span>${et}</span>
            </button>`).join('')}
        </div>

        <div class="fila sep" style="margin-top:1.5rem">
          <button class="btn btn-sec" data-act="ant" ${Q.i === 0 ? 'disabled' : ''}>
            ${icono('chevron-left')} Anterior
          </button>
          <div class="fila">
            <button class="btn btn-ghost" data-act="guardarProg">${icono('save')} Guardar progreso</button>
            <button class="btn btn-sec" data-act="sig" ${Q.i === n - 1 ? 'disabled' : ''}>
              Siguiente ${icono('chevron-right')}
            </button>
          </div>
        </div>

        <div class="chips" aria-label="Navegador directo de preguntas">
          ${Q.flat.map((_, idx) => `
            <button type="button" class="chip ${Q.r[idx] ? 'hecha' : ''} ${idx === Q.i ? 'act' : ''}" data-act="saltar" data-arg="${idx}" aria-label="Ir a pregunta ${idx + 1}">
              ${idx + 1}
            </button>`).join('')}
        </div>
      </div>

      <div class="fila sep" style="margin-top:1rem; flex-wrap:wrap; gap:0.5rem;">
        <div class="fila" style="gap:0.5rem;">
          <button type="button" class="btn btn-teal btn-sm" data-act="autoRellenarQ" data-arg="realista" title="Auto-rellenar con arquetipo realista">
            ${icono('sparkles')} Auto-rellenar realista (${n} preguntas)
          </button>
        </div>
        <div class="fila" style="gap:0.5rem;">
          <button type="button" class="btn btn-copper" data-act="autoRellenarYFinalizarQ" data-arg="${arqActivo}" title="Completar y ver informe directamente">
            ${icono('zap')} Rellenar y Finalizar
          </button>
          <button class="btn" data-act="finalizar">${icono('check-circle')} Finalizar evaluación</button>
        </div>
      </div>

      <p class="nota" style="text-align:right;margin-top:0.5rem">
        Atajos de teclado: teclas 1 a 5 para calificar · Flechas ← y → para navegar
      </p>
    </div>`;
};

/* ---------- 6. RESULTADOS DE EVALUACIÓN INDIVIDUAL ---------- */
function renderBloqueResultado(def, ev, extraDesc) {
  const res = ev.resultado;
  const c = clasif(res.total);
  const filtroActivo = S.filtroSubs || 'todos';

  const nFortalezas = res.subs.filter(s => s.valor >= CONFIG.umbralFortaleza).length;
  const nIntermedios = res.subs.filter(s => s.valor < CONFIG.umbralFortaleza && s.valor > 2.60).length;
  const nBrechas = res.subs.filter(s => s.valor <= 2.60).length;

  return `
    <div class="solo-print">
      <h2>INTELECTUS — Informe de Evaluación del Capital Intelectual</h2>
      <p>Persona: ${esc(S.perfil ? S.perfil.nombre : 'Evaluado')} · Fecha: ${fmtFecha(ev.fecha)}</p>
    </div>

    <div class="fila sep" style="margin-bottom:1rem">
      <div>
        <h2>${esc(def.titulo)}</h2>
        <p class="muted">Fecha de evaluación: ${fmtFecha(ev.fecha)} ${S.perfil ? '· ' + esc(S.perfil.nombre) : ''}</p>
      </div>
      <div class="fila no-print">
        <button class="btn btn-sec btn-sm" data-act="nav" data-arg="${def.key.startsWith('int_') ? 'humano' : 'panel'}">
          ${icono('arrow-left')} Volver al panel
        </button>
        <button class="btn btn-sec btn-sm" data-act="nav" data-arg="historial">
          ${icono('history')} Historial
        </button>
        <button class="btn btn-sm" data-act="imprimir">
          ${icono('printer')} Imprimir / PDF
        </button>
      </div>
    </div>

    <div class="card tinte-${def.dim}">
      <div class="score">
        <div>
          <div class="score-num">${f2(res.total)} <span class="score-max">/ 5,00</span></div>
          <span class="pill ${c.cls}">Nivel: ${c.etq.toUpperCase()}</span>
        </div>
        <div style="flex:1;min-width:260px">
          <p>${extraDesc || 'Puntuación consolidada a partir de los promedios de los subíndices evaluados.'}</p>
        </div>
      </div>
    </div>

    <div class="cols2">
      <div class="card">
        <h3>Desglose Gráfico por Subíndice</h3>
        <div class="chart-box">
          <canvas id="gr-subs"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="fila sep" style="margin-bottom:0.6rem; flex-wrap:wrap; gap:0.4rem;">
          <h3 style="margin:0;">Tabla de Puntuaciones</h3>
        </div>

        <!-- FILTROS INTERACTIVOS EN TIEMPO REAL -->
        <div class="filter-subindices-bar fila" style="gap:0.35rem; margin-bottom:0.75rem; flex-wrap:wrap;">
          <button type="button" class="filter-pill ${filtroActivo === 'todos' ? 'act' : ''}" data-act="filtrarSubs" data-arg="todos">
            📋 Todos (${res.subs.length})
          </button>
          <button type="button" class="filter-pill ${filtroActivo === 'fortaleza' ? 'act' : ''}" data-act="filtrarSubs" data-arg="fortaleza">
            🟢 Fortalezas (${nFortalezas})
          </button>
          <button type="button" class="filter-pill ${filtroActivo === 'intermedio' ? 'act' : ''}" data-act="filtrarSubs" data-arg="intermedio">
            🟡 Nivel Medio (${nIntermedios})
          </button>
          <button type="button" class="filter-pill ${filtroActivo === 'mejora' ? 'act' : ''}" data-act="filtrarSubs" data-arg="mejora">
            🔴 Brechas (${nBrechas})
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Subíndice Evaluado</th>
              <th>Puntuación</th>
              <th>Nivel</th>
            </tr>
          </thead>
          <tbody id="tbodySubindices">
            ${res.subs.map(s => {
              const cat = s.valor >= CONFIG.umbralFortaleza ? 'fortaleza' : (s.valor <= 2.60 ? 'mejora' : 'intermedio');
              const ocultar = (filtroActivo !== 'todos' && filtroActivo !== cat) ? 'display:none;' : '';
              return `
              <tr data-categoria="${cat}" style="${ocultar}">
                <td><strong>${esc(s.nombre)}</strong></td>
                <td>${f2(s.valor)}</td>
                <td>${pill(s.valor)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        <p class="nota" style="margin-top:0.75rem">
          Escala de 1 a 5: 1.00–1.80 muy baja · 1.81–2.60 baja · 2.61–3.40 intermedia · 3.41–4.20 alta · 4.21–5.00 muy alta.
        </p>
      </div>
    </div>

    ${htmlAnalisisFortalezasMejoras(res.subs)}

    <div class="aviso">
      ${NOTA_AUTOINFORME} ${def.nota ? esc(def.nota) : ''}
    </div>`;
}

VISTAS.resultado = (p = {}) => {
  const { key, hist } = p || {};
  const it = hist ? S.historial.find(h => h.id === hist) : S.eval[key];
  if (!it) return '<div class="card"><p>No se encontraron registros de esta evaluación.</p><button class="btn btn-humano" data-act="nav" data-arg="panel">Volver al panel</button></div>';
  const def = DEFS[hist ? it.key : key];
  if (!def) return '<div class="card"><p>Definición de evaluación no encontrada.</p><button class="btn btn-sec" data-act="nav" data-arg="panel">Volver al panel</button></div>';
  const extra = def.ref ? esc(def.ref.desc) : '';
  return renderBloqueResultado(def, it, extra);
};

POST.resultado = (p = {}) => {
  const { key, hist } = p || {};
  const it = hist ? S.historial.find(h => h.id === hist) : S.eval[key];
  if (!it) return;
  const def = DEFS[hist ? it.key : key];
  if (!def || !it.resultado) return;
  graficoBarras('gr-subs', it.resultado.subs.map(s => s.nombre), it.resultado.subs.map(s => s.valor), def.color, true);
};

/* ---------- 7. RESUMEN GENERAL PERSONAL CON RADAR ---------- */
VISTAS.resumen = () => {
  const ch = capitalHumanoResumen();
  const rel = S.eval.relacional;
  const est = S.eval.estructural;
  const hechas = INTELIGENCIAS.filter(i => S.eval['int_' + i.id]);

  if (!hechas.length && !rel && !est) {
    return `
      <h2>Resumen General del Capital Intelectual</h2>
      <div class="card">
        <p>Aún no has completado ninguna evaluación. Completa al menos un módulo para visualizar los gráficos consolidados.</p>
        <button class="btn btn-humano" data-act="nav" data-arg="panel">Ir al panel de evaluación</button>
      </div>`;
  }

  const dimTot = [ch.total, rel ? rel.resultado.total : null, est ? est.resultado.total : null];
  const vals = dimTot.filter(v => v != null);
  const promGlobal = vals.length ? avg(vals) : null;

  return `
    <div class="solo-print">
      <h2>INTELECTUS — Resumen General del Capital Intelectual</h2>
      <p>${esc(S.perfil ? S.perfil.nombre : '')} · ${fmtFecha(hoy())}</p>
    </div>

    <div class="fila sep" style="margin-bottom:1rem">
      <div>
        <h2>Resumen General y Gráficos</h2>
        <p class="muted">${esc(S.perfil ? S.perfil.nombre : 'Evaluado')} · Fecha: ${fmtFecha(hoy())}</p>
      </div>
      <div class="fila no-print">
        <button class="btn btn-sec btn-sm" data-act="nav" data-arg="panel">${icono('arrow-left')} Volver al panel</button>
        <button class="btn btn-sec btn-sm" data-act="nav" data-arg="planMejora">${icono('compass')} Plan de mejora</button>
        <button class="btn btn-sm" data-act="imprimir">${icono('printer')} Imprimir / PDF</button>
      </div>
    </div>

    ${promGlobal != null ? `
      <div class="card">
        <div class="score">
          <div>
            <div class="score-num">${f2(promGlobal)} <span class="score-max">/ 5,00</span></div>
            <span class="pill ${clasif(promGlobal).cls}">Indicador Descriptivo Global: ${clasif(promGlobal).etq.toUpperCase()}</span>
          </div>
          <div style="flex:1;min-width:240px">
            <p class="nota">Promedio simple de las dimensiones completadas (${vals.length} de 3). ${ch.total == null && ch.n ? 'El capital humano se incorporará al completar las 9 inteligencias.' : ''}</p>
          </div>
        </div>
      </div>` : ''}

    <div class="cols2">
      <div class="card">
        <h3>Radar de las 9 Inteligencias Múltiples</h3>
        <div class="chart-box alto">
          <canvas id="gr-radar"></canvas>
        </div>
        <p class="nota">${hechas.length} de 9 completadas. Las inteligencias pendientes se grafican vacías.</p>
      </div>

      <div class="card">
        <h3>Comparativo Dimensional</h3>
        <div class="chart-box alto">
          <canvas id="gr-dims"></canvas>
        </div>
        <p class="nota">Compara el Capital Humano, Capital Relacional y Capital Estructural.</p>
      </div>
    </div>

    <div class="card">
      <div class="fila sep" style="margin-bottom:0.6rem; flex-wrap:wrap; gap:0.4rem;">
        <h3 style="margin:0;">Detalle Consolidado de Puntuaciones</h3>
        <div class="filter-subindices-bar fila" style="gap:0.35rem; flex-wrap:wrap;">
          <button type="button" class="filter-pill act" data-act="filtrarResumen" data-arg="todos">
            📋 Todos
          </button>
          <button type="button" class="filter-pill" data-act="filtrarResumen" data-arg="fortaleza">
            🟢 Fortalezas (≥3.41)
          </button>
          <button type="button" class="filter-pill" data-act="filtrarResumen" data-arg="intermedio">
            🟡 Nivel Medio (2.61–3.40)
          </button>
          <button type="button" class="filter-pill" data-act="filtrarResumen" data-arg="mejora">
            🔴 Brechas (&le;2.60)
          </button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Dimensión / Módulo</th>
            <th>Puntuación</th>
            <th>Nivel</th>
          </tr>
        </thead>
        <tbody id="tbodyResumen">
          ${ch.total != null ? `<tr data-categoria="${ch.total >= CONFIG.umbralFortaleza ? 'fortaleza' : (ch.total <= 2.60 ? 'mejora' : 'intermedio')}"><td><strong>Capital Humano (Promedio de 9 inteligencias)</strong></td><td>${f2(ch.total)}</td><td>${pill(ch.total)}</td></tr>` : ''}
          ${rel ? `<tr data-categoria="${rel.resultado.total >= CONFIG.umbralFortaleza ? 'fortaleza' : (rel.resultado.total <= 2.60 ? 'mejora' : 'intermedio')}"><td><strong>Capital Relacional</strong></td><td>${f2(rel.resultado.total)}</td><td>${pill(rel.resultado.total)}</td></tr>` : ''}
          ${est ? `<tr data-categoria="${est.resultado.total >= CONFIG.umbralFortaleza ? 'fortaleza' : (est.resultado.total <= 2.60 ? 'mejora' : 'intermedio')}"><td><strong>Capital Estructural</strong></td><td>${f2(est.resultado.total)}</td><td>${pill(est.resultado.total)}</td></tr>` : ''}
          ${hechas.map(i => {
            const val = S.eval['int_' + i.id].resultado.total;
            const cat = val >= CONFIG.umbralFortaleza ? 'fortaleza' : (val <= 2.60 ? 'mejora' : 'intermedio');
            return `
            <tr data-categoria="${cat}">
              <td style="padding-left:1.5rem">↳ ${i.nombre}</td>
              <td>${f2(val)}</td>
              <td>${pill(val)}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div class="aviso">${NOTA_AUTOINFORME}</div>`;
};

POST.resumen = () => {
  const ch = capitalHumanoResumen();
  const rel = S.eval.relacional;
  const est = S.eval.estructural;

  graficoRadar(
    'gr-radar',
    INTELIGENCIAS.map(i => i.corto),
    INTELIGENCIAS.map(i => S.eval['int_' + i.id] ? S.eval['int_' + i.id].resultado.total : null),
    COLOR.humano
  );

  const d = [
    ['Capital humano', ch.total, COLOR.humano],
    ['Capital relacional', rel ? rel.resultado.total : null, COLOR.relacional],
    ['Capital estructural', est ? est.resultado.total : null, COLOR.estructural]
  ];
  graficoBarras('gr-dims', d.map(x => x[0]), d.map(x => x[1]), d.map(x => x[2]), false);
};

/* ---------- 8. PLAN DE MEJORA PERSONAL (SECCIÓN 11 Y 16) ---------- */
VISTAS.planMejora = () => {
  const ch = capitalHumanoResumen();
  const rel = S.eval.relacional;
  const est = S.eval.estructural;
  const hechas = INTELIGENCIAS.filter(i => S.eval['int_' + i.id]);

  const items = [
    ...hechas.map(i => ({ nombre: i.nombre, cap: 'humano', valor: S.eval['int_' + i.id].resultado.total, rec: i.rec })),
    ...(rel ? rel.resultado.subs.map(s => ({ ...s, cap: 'relacional' })) : []),
    ...(est ? est.resultado.subs.map(s => ({ ...s, cap: 'estructural' })) : [])
  ];

  if (!items.length) {
    return `
      <h2>Plan de Acción Estratégico Personal</h2>
      <div class="card">
        <p>Aún no dispones de evaluaciones completadas para generar el plan de acción personalizado según tus resultados.</p>
        <button class="btn btn-humano" data-act="nav" data-arg="panel">Ir a evaluar</button>
      </div>`;
  }

  const dimTot = [ch.total, rel ? rel.resultado.total : null, est ? est.resultado.total : null].filter(v => v != null);
  const puntajeGlobal = dimTot.length ? avg(dimTot) : avg(items.map(x => x.valor));
  const nombrePersona = S.perfil ? S.perfil.nombre : 'Evaluado';

  return renderPlanAccionEstructurado({
    modo: 'personal',
    titulo: 'Plan de Acción Estratégico Personal',
    subtitulo: `Acciones, objetivos SMART, plazos y KPIs generados según los resultados obtenidos por ${nombrePersona}.`,
    entidad: `Evaluado: ${nombrePersona}`,
    puntajeGlobal,
    items,
    volverAct: 'panel'
  });
};

/* ---------- 9. HISTORIAL PERSONAL (SECCIÓN 14) ---------- */
VISTAS.historial = () => `
  <div class="fila sep" style="margin-bottom:1rem">
    <div>
      <h2>Historial de Evaluaciones Personales</h2>
      <p class="muted">Registro cronológico de evaluaciones completadas en este navegador.</p>
    </div>
    <button class="btn btn-sec btn-sm" data-act="nav" data-arg="panel">${icono('arrow-left')} Volver al panel</button>
  </div>

  <div class="card">
    ${S.historial.length ? `
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Evaluación</th>
            <th>Puntuación</th>
            <th>Nivel</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${S.historial.map(h => `
            <tr>
              <td>${fmtFecha(h.fecha)}</td>
              <td><strong>${esc(h.titulo)}</strong></td>
              <td>${f2(h.resultado.total)}</td>
              <td>${pill(h.resultado.total)}</td>
              <td>
                <div class="fila">
                  <button class="btn btn-sec btn-sm" data-act="verHist" data-arg="${h.id}">${icono('eye')} Ver</button>
                  <button class="btn btn-danger btn-sm" data-act="borrarHist" data-arg="${h.id}" aria-label="Eliminar">${icono('trash-2')}</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`
    : '<p>Todavía no has completado ninguna evaluación personal.</p>'}
  </div>`;

/* ---------- 10. CONFIGURACIÓN (SECCIÓN 16) ---------- */
VISTAS.configuracion = () => `
  <h2>Configuración del Sistema</h2>
  <p class="muted">Ajustes generales de la aplicación demostrativa INTELECTUS.</p>

  <div class="card">
    <h3>Baremos y Clasificación de Puntuaciones</h3>
    <p class="nota">Escala inicial de 1 a 5 propuesta para el curso de Administración Estratégica:</p>
    <table>
      <thead>
        <tr>
          <th>Rango de Puntuación</th>
          <th>Clasificación Descriptiva</th>
          <th>Criterio Estratégico</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>1.00 a 1.80</td><td><span class="pill r1">Muy baja</span></td><td>Brecha crítica de capacidad</td></tr>
        <tr><td>1.81 a 2.60</td><td><span class="pill r2">Baja</span></td><td>Área de mejora prioritaria</td></tr>
        <tr><td>2.61 a 3.40</td><td><span class="pill r3">Intermedia</span></td><td>Capacidad en desarrollo</td></tr>
        <tr><td>3.41 a 4.20</td><td><span class="pill r4">Alta</span></td><td>Fortaleza relativa sólida</td></tr>
        <tr><td>4.21 a 5.00</td><td><span class="pill r5">Muy alta</span></td><td>Competencia distintiva clave</td></tr>
      </tbody>
    </table>
  </div>

  <div class="card">
    <h3>Gestión de Almacenamiento Local (LocalStorage)</h3>
    <p class="nota">Esta demostración guarda la información en la memoria de este navegador. Puedes reiniciar los datos si deseas reiniciar las pruebas.</p>
    <div class="fila" style="margin-top:1rem">
      <button class="btn btn-danger btn-sm" data-act="reiniciarPersonal">${icono('trash-2')} Borrar datos personales</button>
      <button class="btn btn-danger btn-sm" data-act="reiniciarEmpresa">${icono('trash-2')} Borrar datos empresariales</button>
    </div>
  </div>`;

/* ---------- 11. MODALIDAD EMPRESARIAL: REGISTRO DE EMPRESA ---------- */
VISTAS.empresaDatos = () => {
  const d = S.empresa.datos || {};
  return `
    <h2>Registro de la Organización</h2>
    <p class="muted">Configura los datos base de la empresa a evaluar para el análisis estratégico del capital intelectual.</p>

    <div class="card">
      <form class="form" data-form="empresa" novalidate>
        <div>
          <label for="e-nombre">Nombre de la organización o empresa *</label>
          <input id="e-nombre" name="nombre" value="${esc(d.nombre)}" placeholder="Ej. Sociedad Minera Cerro Verde S.A.A.">
          <small class="err" data-err="nombre"></small>
        </div>

        <div>
          <label for="e-sector">Sector económico *</label>
          <select id="e-sector" name="sector">
            <option value="">Selecciona el sector...</option>
            ${SECTORES_DEFAULT.map(s => `<option value="${s}" ${d.sector === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
          <small class="err" data-err="sector"></small>

          <!-- Previsualización dinámica de departamentos predeterminados por sector -->
          <div id="sector-deptos-box" style="margin-top:0.65rem; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:8px; padding:0.75rem 1rem;">
            <div style="font-size:0.78rem; font-weight:700; color:var(--navy); margin-bottom:0.4rem; display:flex; align-items:center; gap:0.35rem;">
              ${icono('folder-tree')} Departamentos / Oficinas sugeridos para este sector:
            </div>
            <div id="sector-deptos-list" style="display:flex; flex-wrap:wrap; gap:0.35rem;">
              ${(DEPARTAMENTOS_POR_SECTOR[d.sector] || DEPARTAMENTOS_POR_SECTOR['Minería y Recursos Naturales']).map(dep => `
                <span style="background:#ffffff; color:#1e293b; font-size:0.75rem; font-weight:600; padding:0.22rem 0.55rem; border-radius:5px; border:1px solid #cbd5e1; box-shadow:0 1px 2px rgba(0,0,0,0.04);">${esc(dep)}</span>
              `).join('')}
            </div>
            <div style="font-size:0.72rem; color:#64748b; margin-top:0.45rem;">
              ℹ️ <em>Al guardar la empresa, se inicializarán automáticamente estos departamentos en el sistema (podrás editarlos, agregar nuevos o eliminarlos después).</em>
            </div>
          </div>
        </div>

        <div>
          <label for="e-tam">Tamaño de la organización *</label>
          <select id="e-tam" name="tamano">
            <option value="">Selecciona el tamaño...</option>
            ${TAMANOS_DEFAULT.map(t => `<option value="${t}" ${d.tamano === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
          <small class="err" data-err="tamano"></small>
        </div>

        <div>
          <label for="e-trabajadores">Número aproximado de trabajadores</label>
          <input id="e-trabajadores" name="trabajadores" type="number" min="1" value="${esc(d.trabajadores || 5500)}" placeholder="Ej. 5500">
        </div>

        <div>
          <label for="e-resp">Responsable de la evaluación <span class="opt">(opcional)</span></label>
          <input id="e-resp" name="responsable" value="${esc(d.responsable)}" placeholder="Ej. Gerencia de Estrategia y RR.HH.">
        </div>

        <div>
          <label for="e-fecha">Fecha de inicio de la evaluación</label>
          <input id="e-fecha" name="fecha" type="date" value="${esc(d.fecha || hoy())}">
        </div>

        <div class="fila">
          <button class="btn btn-estructural" type="submit">${icono('save')} Guardar y acceder al panel empresarial</button>
          <button class="btn btn-sec" type="button" data-act="nav" data-arg="inicio">Cancelar</button>
        </div>
      </form>
    </div>`;
};

/* ---------- 12. PANEL EMPRESARIAL (DASHBOARD CORPORATIVO) ---------- */
VISTAS.empresaPanel = () => {
  if (!S.empresa.datos) {
    return `
      <div class="fila sep" style="margin-bottom:1rem">
        <div>
          <h2>Panel de Capital Intelectual Empresarial</h2>
          <p class="muted">Configuración inicial de la organización</p>
        </div>
        <button class="btn btn-sec btn-sm" data-act="nav" data-arg="inicio">${icono('home')} Inicio</button>
      </div>
      <div class="card" style="text-align:center;padding:3rem 1.5rem;">
        <div class="card-ico estructural" style="margin:0 auto 1rem;">${icono('building-2')}</div>
        <h3>Registra primero los datos de la organización</h3>
        <p class="muted">Para configurar departamentos, registrar evaluaciones y consultar resultados consolidados, ingresa los datos de la empresa o carga el caso de estudio de minería.</p>
        <div class="fila" style="justify-content:center;margin-top:1.5rem;gap:1rem;flex-wrap:wrap">
          <button class="btn btn-estructural" data-act="nav" data-arg="empresaDatos">
            ${icono('building')} Registrar empresa
          </button>
          <button class="btn btn-sec" data-act="cargarSimulacionMinera">
            ${icono('database')} Cargar caso de estudio: Cerro Verde
          </button>
        </div>
      </div>`;
  }

  const d = S.empresa.datos;
  const n = S.empresa.resp.length;
  const sims = S.empresa.resp.filter(r => r.sim).length;
  const trabTot = d.trabajadores || 100;
  const pctPart = Math.min(100, Math.round((n / trabTot) * 100));

  return `
    <div class="fila sep" style="margin-bottom:1rem">
      <div>
        <h2>Panel de Capital Intelectual Empresarial</h2>
        <p class="muted">${esc(d.nombre)} · Sector: ${esc(d.sector)} · ${esc(d.tamano)}</p>
      </div>
      <div class="fila">
        <button class="btn btn-sec btn-sm" data-act="nav" data-arg="empresaDatos">${icono('pencil')} Editar empresa</button>
        <button class="btn btn-ghost btn-sm" data-act="nav" data-arg="empresaDepartamentos">${icono('folder-tree')} Departamentos (${S.empresa.departamentos.length})</button>
      </div>
    </div>

    <div class="kpis">
      <div class="kpi">
        <b>${n}</b>
        <small>Evaluaciones registradas</small>
      </div>
      <div class="kpi">
        <b>${pctPart}%</b>
        <small>Participación estimada (${n}/${trabTot})</small>
      </div>
      <div class="kpi">
        <b>${S.empresa.departamentos.length}</b>
        <small>Departamentos activos</small>
      </div>
      <div class="kpi">
        <b>36</b>
        <small>Reactivos por evaluación</small>
      </div>
    </div>

    <div class="cards2">
      <div class="card acc tinte-estructural">
        <div class="icobox bg-estructural">${icono('clipboard-list', 'ic-lg')}</div>
        <h3>Registrar Respuesta de Trabajador <span class="tag-op">OPERATIVO</span></h3>
        <p>Aplica el cuestionario de 36 preguntas para evaluar las tres dimensiones (Humano, Relacional, Estructural) en el equipo.</p>
        <div class="push fila">
          <button class="btn btn-estructural" data-act="nav" data-arg="empresaNueva">
            ${icono('plus')} Nueva respuesta
          </button>
          ${S.empresa.borr ? `<button class="btn btn-sec" data-act="empresaContinuar">Continuar borrador</button>` : ''}
        </div>
      </div>

      <div class="card acc tinte-navy">
        <div class="icobox bg-navy">${icono('pie-chart', 'ic-lg')}</div>
        <h3>Resultados y Análisis Agregado <span class="tag-op">OPERATIVO</span></h3>
        <p>Calcula el indicador global, gráficos radiales, comparativas entre departamentos y genera el informe ejecutivo.</p>
        <div class="push">
          <button class="btn" data-act="nav" data-arg="empresaResultados" ${n ? '' : 'disabled'}>
            ${icono('bar-chart-2')} Ver panel de resultados
          </button>
        </div>
      </div>
    </div>

    <!-- PANEL DE SIMULACIÓN ADAPTADO AL TAMAÑO Y TRABAJADORES (PARA SUSTENTACIÓN) -->
    <div class="card" style="border-left:4px solid var(--copper); background:#FFFFFF; box-shadow:var(--shadow-sm);">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
        <div>
          <div style="font-size:0.72rem; font-weight:800; color:var(--copper); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:0.25rem;">
            MODALIDAD DEMOSTRATIVA PARA SUSTENTACIÓN ESTRATÉGICA
          </div>
          <h3 style="margin:0 0 0.35rem; color:var(--navy); font-size:1.15rem;">
            Simulación de Respuestas por Tamaño Organizacional
          </h3>
          <p class="muted" style="margin:0; font-size:0.85rem; max-width:680px; line-height:1.45;">
            Genera automáticamente un lote de respuestas calibradas según el tamaño configurado (<strong>${esc(d.tamano)}</strong>, aprox. <strong>${d.trabajadores} trabajadores</strong>). Todas las respuestas se distribuyen equitativamente entre los <strong>${S.empresa.departamentos.length} departamentos</strong>, garantizando que cada área cuente con al menos 2 o más respuestas para que <strong>todos los gráficos y tablas comparativas se visualicen al 100%</strong> durante tu sustentación.
          </p>
        </div>

        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.5rem;">
          <button class="btn btn-estructural" data-act="simularPorTamano" title="Genera respuestas según el tamaño y número de trabajadores configurado">
            ${icono('zap')} Simular muestra para ${esc(d.nombre)}
          </button>
          ${sims ? `<button class="btn btn-danger btn-sm" data-act="quitarSim">${icono('trash')} Eliminar ${sims} simulados</button>` : ''}
        </div>
      </div>

      <!-- Barra de simulación por escala específica -->
      <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid #e2e8f0; display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; font-size:0.8rem;">
        <span style="color:#64748b; font-weight:700;">Simular por escala específica:</span>
        <button class="btn btn-ghost btn-sm" data-act="simularPorTamano" data-arg="micro" title="Simular Microempresa (6-8 colaboradores)">Micro (6-8 cols)</button>
        <button class="btn btn-ghost btn-sm" data-act="simularPorTamano" data-arg="pequena" title="Simular Pequeña Empresa (18-24 colaboradores)">Pequeña (18-24 cols)</button>
        <button class="btn btn-ghost btn-sm" data-act="simularPorTamano" data-arg="mediana" title="Simular Mediana Empresa (36-40 colaboradores)">Mediana (36-40 cols)</button>
        <button class="btn btn-ghost btn-sm" data-act="simularPorTamano" data-arg="grande" title="Simular Gran Empresa (60 colaboradores)">Gran Empresa (60 cols)</button>
        <button class="btn btn-ghost btn-sm" data-act="cargarSimulacionMinera" title="Caso de estudio estándar (12 respuestas)">Caso Cerro Verde (12)</button>
      </div>
    </div>

    ${n ? `
      <div class="card">
        <h3>Registro de Participantes Recientes</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Participante</th>
              <th>Departamento / Área</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${S.empresa.resp.map((r, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${esc(r.nombre)}</strong></td>
                <td>${esc(r.area)}</td>
                <td>${fmtFecha(r.fecha)}</td>
                <td>${r.sim ? '<span class="tag-sim">simulado</span>' : '<span class="tag-op">real</span>'}</td>
                <td>
                  <button class="btn btn-danger btn-sm" data-act="borrarResp" data-arg="${r.id}" title="Eliminar">${icono('trash-2')}</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>

        <!-- Restablecer plantilla sectorial -->
        <div style="margin-top:1rem; padding-top:0.85rem; border-top:1px solid #e2e8f0; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.6rem;">
          <span style="font-size:0.78rem; color:#64748b;">Plantilla predeterminada:</span>
          <button class="btn btn-sec btn-sm" data-act="cargarPlantillaSector" title="Cargar los 6 departamentos modelo del sector actual">
            ${icono('refresh-cw')} Cargar departamentos sugeridos de ${esc(S.empresa.datos?.sector || 'Sector')}
          </button>
        </div>
      </div>` : ''}`;
};

/* ---------- 13. GESTIÓN DE DEPARTAMENTOS EMPRESARIALES (SECCIÓN 16) ---------- */
VISTAS.empresaDepartamentos = () => {
  const deps = S.empresa.departamentos;
  const resp = S.empresa.resp;

  return `
    <div class="fila sep" style="margin-bottom:1rem">
      <div>
        <h2>Gestión de Departamentos y Áreas</h2>
        <p class="muted">Configura las áreas que participan en la evaluación del capital intelectual de ${esc(S.empresa.datos ? S.empresa.datos.nombre : 'la organización')}.</p>
      </div>
      <button class="btn btn-sec btn-sm" data-act="nav" data-arg="empresaPanel">${icono('arrow-left')} Volver al panel</button>
    </div>

    <div class="cols2">
      <div class="card">
        <h3>Departamentos Registrados</h3>
        <table>
          <thead>
            <tr>
              <th>Departamento</th>
              <th>Respuestas</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            ${deps.map((d, idx) => {
              const count = resp.filter(r => r.area === d).length;
              return `
                <tr>
                  <td><strong>${esc(d)}</strong></td>
                  <td>${count} respuesta(s)</td>
                  <td>
                    ${deps.length > 1 ? `<button class="btn btn-danger btn-sm" data-act="eliminarDepto" data-arg="${idx}">${icono('trash-2')}</button>` : '—'}
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="card">
        <h3>Agregar Nuevo Departamento</h3>
        <form class="form" data-form="nuevoDepto" style="margin-top:0.8rem">
          <div>
            <label for="nuevoDeptoNom">Nombre del área o departamento</label>
            <input id="nuevoDeptoNom" name="nombre" placeholder="Ej. Logística y Cadena de Suministro" required>
          </div>
          <button class="btn btn-estructural" type="submit">${icono('plus')} Agregar departamento</button>
        </form>
      </div>
    </div>`;
};

/* ---------- 14. LISTA DE PARTICIPANTES EMPRESARIALES (SECCIÓN 16) ---------- */
VISTAS.empresaParticipantes = () => {
  const resp = S.empresa.resp;
  return `
    <div class="fila sep" style="margin-bottom:1rem">
      <div>
        <h2>Participantes y Evaluaciones Registradas</h2>
        <p class="muted">Total de ${resp.length} respuestas recolectadas.</p>
      </div>
      <div class="fila">
        <button class="btn btn-estructural btn-sm" data-act="nav" data-arg="empresaNueva">${icono('plus')} Nuevo participante</button>
        <button class="btn btn-sec btn-sm" data-act="nav" data-arg="empresaPanel">${icono('arrow-left')} Volver al panel</button>
      </div>
    </div>

    <div class="card">
      ${resp.length ? `
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre / Código</th>
              <th>Área / Departamento</th>
              <th>Fecha</th>
              <th>Modalidad</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            ${resp.map((r, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${esc(r.nombre)}</strong></td>
                <td>${esc(r.area)}</td>
                <td>${fmtFecha(r.fecha)}</td>
                <td>${r.sim ? '<span class="tag-sim">Simulado</span>' : '<span class="tag-op">Real</span>'}</td>
                <td>
                  <button class="btn btn-danger btn-sm" data-act="borrarResp" data-arg="${r.id}">${icono('trash-2')}</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>`
      : '<p>Aún no hay participantes registrados.</p>'}
    </div>`;
};

/* ---------- 15. NUEVA EVALUACIÓN EMPRESARIAL (FORMULARIO PARTICIPANTE) ---------- */
VISTAS.empresaNueva = () => `
  <h2>Registro de Participante de la Organización</h2>
  <p class="muted">Ingresa los datos del trabajador antes de responder el cuestionario empresarial.</p>

  <div class="card">
    <form class="form" data-form="trabajador" novalidate>
      <div>
        <label for="t-nombre">Nombre del trabajador <span class="opt">(opcional; déjalo vacío para responder de forma anónima)</span></label>
        <input id="t-nombre" name="nombre" placeholder="Ej. Ing. Operador de Guardia (o anónimo)">
      </div>

      <div>
        <label for="t-area">Departamento o Área operativa *</label>
        <select id="t-area" name="area" required>
          <option value="">Selecciona el departamento...</option>
          ${S.empresa.departamentos.map(a => `<option value="${a}">${a}</option>`).join('')}
        </select>
        <small class="err" data-err="area"></small>
      </div>

      <p class="nota">
        En resguardo del anonimato, los resultados por departamento solo se desglosan cuando existen al menos <strong>${CONFIG.minGrupoArea} respuestas</strong> en esa área.
      </p>

      <div class="fila">
        <button class="btn btn-estructural" type="submit">${icono('play')} Comenzar cuestionario (36 preguntas)</button>
        <button class="btn btn-sec" type="button" data-act="nav" data-arg="empresaPanel">Cancelar</button>
      </div>
    </form>
  </div>`;

/* ---------- 16. CÁLCULO AGREGADO Y RESULTADOS EMPRESARIALES ---------- */
function agregarResultadosEmpresa() {
  const resp = S.empresa.resp
    .map(r => ({ ...r, res: calcular(DEFS.empresa, r.r) }))
    .filter(r => r.res != null);

  if (!resp.length) return null;

  // Promedio por subíndice
  const subs = EMPRESA_ITEMS.map((s, i) => ({
    nombre: s.nombre,
    cap: s.cap,
    valor: avg(resp.map(r => r.res.subs[i].valor)),
    rec: s.rec
  }));

  // Promedios por dimensión (Humano, Relacional, Estructural)
  const caps = {};
  Object.keys(CAPS).forEach(c => {
    const subsCap = subs.filter(s => s.cap === c);
    caps[c] = subsCap.length ? avg(subsCap.map(s => s.valor)) : 0;
  });

  // Indicador Global = (Humano + Relacional + Estructural) / 3
  const total = avg(Object.values(caps));

  // Desglose por departamento / área
  const areas = {};
  resp.forEach(r => {
    (areas[r.area] = areas[r.area] || []).push(r);
  });

  const porArea = Object.entries(areas).map(([a, rs]) => {
    const o = {
      area: a,
      n: rs.length,
      oculto: rs.length < CONFIG.minGrupoArea
    };
    if (!o.oculto) {
      Object.keys(CAPS).forEach(c => {
        o[c] = avg(rs.map(r => avg(r.res.subs.filter(s => s.cap === c).map(s => s.valor))));
      });
      o.total = (o.humano + o.relacional + o.estructural) / 3;
    }
    return o;
  });

  // Distribución de colaboradores por nivel de madurez (para gráfico de dona / demografía de percepción)
  const distribucionMadurez = { inicial: 0, desarrollo: 0, consolidado: 0, sobresaliente: 0 };
  resp.forEach(r => {
    let scoreTotal = 0;
    if (r.res && r.res.total) {
      scoreTotal = r.res.total;
    } else if (Array.isArray(r.r)) {
      scoreTotal = avg(r.r);
    }
    if (scoreTotal <= 2.50) distribucionMadurez.inicial++;
    else if (scoreTotal <= 3.40) distribucionMadurez.desarrollo++;
    else if (scoreTotal <= 4.20) distribucionMadurez.consolidado++;
    else distribucionMadurez.sobresaliente++;
  });

  return { n: resp.length, subs, caps, total, porArea, resp, distribucionMadurez };
}

VISTAS.empresaResultados = () => {
  const g = agregarResultadosEmpresa();
  if (!g) {
    return `
      <h2>Resultados Empresariales</h2>
      <div class="card">
        <p>No se han registrado evaluaciones completadas para consolidar los resultados agregados.</p>
        <button class="btn btn-estructural" data-act="nav" data-arg="empresaNueva">Registrar primera evaluación</button>
      </div>`;
  }

  const d = S.empresa.datos || { nombre: 'Sociedad Minera Cerro Verde S.A.A.', sector: 'Gran Minería', tamano: 'Gran empresa' };
  const sims = S.empresa.resp.some(r => r.sim);
  const indGlobalClasif = clasif(g.total);

  return `
    <div class="solo-print">
      <h2>INTELECTUS — Dictamen de Capital Intelectual Organizacional</h2>
      <p>Empresa: ${esc(d.nombre)} · Fecha: ${fmtFecha(hoy())}</p>
    </div>

    <div class="fila sep" style="margin-bottom:1rem">
      <div>
        <h2>Resultados Agregados: ${esc(d.nombre)}</h2>
        <p class="muted">${g.n} evaluaciones consolidadas · Sector: ${esc(d.sector)} · Fecha: ${fmtFecha(hoy())}</p>
      </div>
      <div class="fila no-print">
        <button class="btn btn-sec btn-sm" data-act="nav" data-arg="empresaPanel">${icono('arrow-left')} Volver al panel</button>
        <button class="btn btn-sec btn-sm" data-act="exportCSV">${icono('download')} Exportar CSV</button>
        <button class="btn btn-sm" data-act="imprimir">${icono('printer')} Imprimir / PDF</button>
      </div>
    </div>

    ${sims ? `<div class="aviso sim"><span class="tag-sim">CASO SIMULADO</span> Este consolidado incorpora datos de ejemplo estructurados con fines académicos.</div>` : ''}

    <div class="kpis">
      <div class="kpi" style="border-top:4px solid ${COLOR.navy}">
        <b>${f2(g.total)}</b>
        <small>Índice Global · ${indGlobalClasif.etq.toUpperCase()}</small>
      </div>
      <div class="kpi" style="border-top:4px solid ${COLOR.humano}">
        <b>${f2(g.caps.humano)}</b>
        <small>Capital Humano · ${clasif(g.caps.humano).etq}</small>
      </div>
      <div class="kpi" style="border-top:4px solid ${COLOR.relacional}">
        <b>${f2(g.caps.relacional)}</b>
        <small>Capital Relacional · ${clasif(g.caps.relacional).etq}</small>
      </div>
      <div class="kpi" style="border-top:4px solid ${COLOR.estructural}">
        <b>${f2(g.caps.estructural)}</b>
        <small>Capital Estructural · ${clasif(g.caps.estructural).etq}</small>
      </div>
    </div>

    <!-- FILA 1 DE GRÁFICOS: RADAR Y COMPARATIVA GENERAL POR DEPARTAMENTOS -->
    <div class="cols2">
      <div class="card">
        <h3>Radar de los 12 Subíndices Organizacionales</h3>
        <p class="nota" style="margin-bottom:0.6rem;">Mapeo integral de madurez por cada uno de los 12 componentes estratégicos.</p>
        <div class="chart-box alto">
          <canvas id="gr-emp-radar"></canvas>
        </div>
      </div>

      <div class="card">
        <h3>Comparativa de Índice Global por Departamentos</h3>
        <p class="nota" style="margin-bottom:0.6rem;">Índice consolidado por área (se muestran áreas con ≥ ${CONFIG.minGrupoArea} respuestas para resguardo de anonimato).</p>
        <div class="chart-box alto">
          <canvas id="gr-emp-deptos"></canvas>
        </div>
      </div>
    </div>

    <!-- FILA 2 DE GRÁFICOS (NUEVOS): MULTIDIMENSIONAL POR ÁREA Y DISTRIBUCIÓN DE MADUREZ -->
    <div class="cols2">
      <div class="card">
        <h3>Desglose Multidimensional por Departamento</h3>
        <p class="nota" style="margin-bottom:0.6rem;">Comparativa directa de Capital Humano, Relacional y Estructural por cada área evaluada.</p>
        <div class="chart-box alto">
          <canvas id="gr-emp-deptos-caps"></canvas>
        </div>
      </div>

      <div class="card">
        <h3>Distribución de Colaboradores por Nivel de Madurez</h3>
        <p class="nota" style="margin-bottom:0.6rem;">Proporción demográfica de colaboradores según la percepción global de su entorno laboral.</p>
        <div class="chart-box alto">
          <canvas id="gr-emp-madurez"></canvas>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Desglose Detallado por Subíndice</h3>
      <table>
        <thead>
          <tr>
            <th>Dimensión</th>
            <th>Subíndice</th>
            <th>Puntuación Promedio</th>
            <th>Nivel</th>
          </tr>
        </thead>
        <tbody>
          ${g.subs.map(s => `
            <tr>
              <td><span style="color:${CAPS[s.cap].color};font-weight:700">${CAPS[s.cap].nombre}</span></td>
              <td><strong>${esc(s.nombre)}</strong></td>
              <td>${f2(s.valor)}</td>
              <td>${pill(s.valor)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="card">
      <h3>Comparativa de Puntuaciones por Departamento</h3>
      <table>
        <thead>
          <tr>
            <th>Departamento</th>
            <th>Respuestas (n)</th>
            <th>C. Humano</th>
            <th>C. Relacional</th>
            <th>C. Estructural</th>
            <th>Índice Global</th>
          </tr>
        </thead>
        <tbody>
          ${g.porArea.map(a => a.oculto
            ? `<tr><td>${esc(a.area)}</td><td>${a.n}</td><td colspan="4" class="nota">Oculto por política de anonimato (< ${CONFIG.minGrupoArea} respuestas)</td></tr>`
            : `<tr>
                <td><strong>${esc(a.area)}</strong></td>
                <td>${a.n}</td>
                <td>${f2(a.humano)}</td>
                <td>${f2(a.relacional)}</td>
                <td>${f2(a.estructural)}</td>
                <td>${pill(a.total)}</td>
              </tr>`).join('')}
        </tbody>
      </table>
    </div>

    ${htmlAnalisisFortalezasMejoras(g.subs)}

    <div class="aviso">
      Este informe refleja percepciones consolidadas de los colaboradores y sirve como diagnóstico preliminar para la formulación del Plan Estratégico Corporativo.
    </div>`;
};

POST.empresaResultados = () => {
  const g = agregarResultadosEmpresa();
  if (!g) return;

  // 1. Radar de los 12 subíndices
  graficoRadar(
    'gr-emp-radar',
    g.subs.map(s => s.nombre),
    g.subs.map(s => s.valor),
    COLOR.navy
  );

  // 2. Comparativa por departamentos (Índice Global)
  const areasVisibles = g.porArea.filter(a => !a.oculto);
  graficoBarras(
    'gr-emp-deptos',
    areasVisibles.map(a => a.area),
    areasVisibles.map(a => a.total),
    COLOR.estructural,
    true
  );

  // 3. NUEVO GRÁFICO 3: Comparativa Multidimensional por Área (Humano, Relacional, Estructural)
  graficoBarrasAgrupadas(
    'gr-emp-deptos-caps',
    areasVisibles.map(a => a.area),
    [
      { label: 'C. Humano', data: areasVisibles.map(a => a.humano), color: COLOR.humano },
      { label: 'C. Relacional', data: areasVisibles.map(a => a.relacional), color: COLOR.relacional },
      { label: 'C. Estructural', data: areasVisibles.map(a => a.estructural), color: COLOR.estructural }
    ]
  );

  // 4. NUEVO GRÁFICO 4: Distribución de Colaboradores por Nivel de Madurez (Dona)
  graficoMadurezDoughnut('gr-emp-madurez', g.distribucionMadurez);
};

/* ---------- 17. PLAN DE MEJORA EMPRESARIAL (SECCIÓN 13 Y 16) ---------- */
VISTAS.empresaPlanMejora = () => {
  const g = agregarResultadosEmpresa();
  if (!g) {
    return `
      <h2>Plan de Acción Estratégico Empresarial</h2>
      <div class="card">
        <p>Aún no hay respuestas consolidadas para formular el plan de acción organizacional.</p>
        <button class="btn btn-estructural" data-act="nav" data-arg="empresaPanel">Volver al panel empresarial</button>
      </div>`;
  }

  const nombreEmp = S.empresa.datos ? S.empresa.datos.nombre : 'Organización';
  return renderPlanAccionEstructurado({
    modo: 'empresa',
    titulo: 'Plan Estratégico de Acción en Capital Intelectual',
    subtitulo: `Matriz de intervención priorizada, responsables y hoja de ruta 30-60-90 días para ${nombreEmp}.`,
    entidad: `Organización: ${nombreEmp} (${g.n} participantes)`,
    puntajeGlobal: g.total,
    items: g.subs,
    volverAct: 'empresaPanel',
    porArea: g.porArea
  });
};

/* ---------- 18. INFORMES EMPRESARIALES (SECCIÓN 13 Y 16) ---------- */
VISTAS.empresaInformes = () => {
  return VISTAS.empresaResultados();
};
POST.empresaInformes = () => {
  if (POST.empresaResultados) POST.empresaResultados();
};

/* ---------- 19. HISTORIAL EMPRESARIAL (SECCIÓN 14) ---------- */
VISTAS.empresaHistorial = () => {
  const resp = S.empresa.resp;
  return `
    <div class="fila sep" style="margin-bottom:1rem">
      <div>
        <h2>Historial de Evaluaciones Empresariales</h2>
        <p class="muted">Registro de todas las encuestas recibidas en la organización.</p>
      </div>
      <button class="btn btn-sec btn-sm" data-act="nav" data-arg="empresaPanel">${icono('arrow-left')} Volver al panel</button>
    </div>

    <div class="card">
      ${resp.length ? `
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Participante</th>
              <th>Departamento</th>
              <th>Origen</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            ${resp.map((r, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${fmtFecha(r.fecha)}</td>
                <td><strong>${esc(r.nombre)}</strong></td>
                <td>${esc(r.area)}</td>
                <td>${r.sim ? '<span class="tag-sim">Simulado</span>' : '<span class="tag-op">Real</span>'}</td>
                <td>
                  <button class="btn btn-danger btn-sm" data-act="borrarResp" data-arg="${r.id}">${icono('trash-2')}</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>`
      : '<p>No hay evaluaciones en el historial empresarial.</p>'}
    </div>`;
};

/* ============================ NAVEGACIÓN Y ENRUTAMIENTO ============================ */
let V = { name: 'inicio', p: {} };

function ir(name, p = {}) {
  V = { name, p };
  // Sincronizar modalidad del estado
  if (name === 'inicio') S.modalidad = 'inicio';
  else if (name.startsWith('empresa')) S.modalidad = 'empresa';
  else S.modalidad = 'personal';

  render();
  if (typeof window.scrollTo === 'function') window.scrollTo(0, 0);

  // Cerrar sidebar en móviles
  const sb = $('#sidebar');
  const sbb = $('#sidebarBackdrop');
  if (sb) sb.classList.remove('open');
  if (sbb) sbb.classList.remove('open');
}

function renderSidebar() {
  const nav = $('#sidebarNav');
  const modLabel = $('#sidebarModeLabel');
  const userTitle = $('#sidebarUserTitle');
  let links = [];

  if (S.modalidad === 'personal') {
    modLabel.textContent = 'MODALIDAD PERSONAL';
    userTitle.textContent = S.perfil ? S.perfil.nombre : 'Sin registrar';

    links = [
      { id: 'inicio', label: 'Inicio', icon: 'home' },
      { id: S.perfil ? 'panel' : 'registro', label: 'Mi perfil / Panel', icon: 'user' },
      { id: 'humano', label: '9 Inteligencias', icon: 'brain' },
      { id: 'resumen', label: 'Resultados y Gráficos', icon: 'bar-chart-3' },
      { id: 'planMejora', label: 'Plan de mejora', icon: 'compass' },
      { id: 'historial', label: 'Historial personal', icon: 'history' },
      { id: 'configuracion', label: 'Configuración', icon: 'settings' }
    ];
  } else if (S.modalidad === 'empresa') {
    modLabel.textContent = 'MODALIDAD EMPRESARIAL';
    userTitle.textContent = S.empresa.datos ? S.empresa.datos.nombre : 'Sin registrar';

    links = [
      { id: 'inicio', label: 'Inicio', icon: 'home' },
      { id: 'empresaPanel', label: 'Panel empresarial', icon: 'layout-dashboard' },
      { id: 'empresaDatos', label: 'Datos de la empresa', icon: 'building' },
      { id: 'empresaDepartamentos', label: 'Departamentos', icon: 'folder-tree' },
      { id: 'empresaParticipantes', label: 'Participantes', icon: 'users' },
      { id: 'empresaNueva', label: 'Nueva evaluación', icon: 'clipboard-list' },
      { id: 'empresaResultados', label: 'Panel de resultados', icon: 'pie-chart' },
      { id: 'empresaPlanMejora', label: 'Plan de mejora', icon: 'compass' },
      { id: 'empresaHistorial', label: 'Historial de respuestas', icon: 'history' },
      { id: 'configuracion', label: 'Configuración', icon: 'settings' }
    ];
  } else {
    modLabel.textContent = 'INTELECTUS-CI';
    userTitle.textContent = 'Bienvenido';

    links = [
      { id: 'inicio', label: 'Inicio', icon: 'home' },
      { id: S.perfil ? 'panel' : 'registro', label: 'Evaluación Personal', icon: 'user' },
      { id: S.empresa.datos ? 'empresaPanel' : 'empresaDatos', label: 'Evaluación Empresarial', icon: 'building-2' },
      { id: 'configuracion', label: 'Configuración', icon: 'settings' }
    ];
  }

  nav.innerHTML = links.map(l => {
    const act = (V.name === l.id || (V.name === 'perfil' && l.id === (S.perfil ? 'panel' : 'registro'))) ? 'active' : '';
    return `
      <button type="button" class="sidebar-link ${act}" data-act="nav" data-arg="${l.id}">
        ${icono(l.icon)}
        <span>${esc(l.label)}</span>
      </button>`;
  }).join('') + `
    <div style="border-top:1px solid rgba(255,255,255,0.08); margin:0.75rem 0.5rem 0.25rem; padding-top:0.75rem;">
      <a href="intelectus_cv.html" class="sidebar-link" style="color:#fbd38d;">
        ${icono('layers')}
        <span>INTELECTUS-CV (Minería)</span>
      </a>
    </div>`;
}

function render() {
  destruirGraficos();

  // Actualizar contenido principal
  const vistaFn = VISTAS[V.name];
  if (vistaFn) {
    $('#app').innerHTML = vistaFn(V.p);
  } else {
    $('#app').innerHTML = '<div class="card"><p>Vista no encontrada.</p><button class="btn" data-act="nav" data-arg="inicio">Ir al inicio</button></div>';
  }

  // Ejecutar hook post-renderizado (gráficos, etc.)
  if (POST[V.name]) {
    POST[V.name](V.p);
  }

  // Actualizar contexto en topbar
  const ctx = $('#ctxBadge');
  if (V.name === 'inicio') {
    ctx.textContent = '';
  } else if (S.modalidad === 'empresa') {
    ctx.textContent = S.empresa.datos ? S.empresa.datos.nombre : 'Empresarial';
  } else {
    ctx.textContent = S.perfil ? S.perfil.nombre.split(' ')[0] : 'Personal';
  }

  // Renderizar menú lateral
  renderSidebar();

  // Recrear iconos Lucide
  if (window.lucide) {
    try { lucide.createIcons(); } catch (e) {}
  }
}

/* ============================ CONTROLADOR DE ACCIONES ============================ */
function responderReactivo(v, elemClickado) {
  Q.r[Q.i] = v;
  persistirQ();

  if (elemClickado) {
    const cont = elemClickado.closest('.escala');
    if (cont) {
      cont.querySelectorAll('.esc-op').forEach(btn => btn.classList.remove('sel', 'pulse-sel'));
    }
    elemClickado.classList.add('sel', 'pulse-sel');
  }

  if (S.autoAvanzar && Q.i < Q.flat.length - 1) {
    setTimeout(() => {
      if (Q && Q.i < Q.flat.length - 1) {
        Q.i++;
        persistirQ();
        render();
      } else {
        render();
      }
    }, 220);
  } else {
    render();
  }
}

const ACT = {
  nav(dest) {
    if (Q) persistirQ();
    Q = null;
    ir(dest);
  },
  irPersonal() {
    ir(S.perfil ? 'panel' : 'registro');
  },
  irEmpresa() {
    ir(S.empresa.datos ? 'empresaPanel' : 'empresaDatos');
  },
  iniciar(k) {
    iniciarQ(k);
  },
  verResultado(k) {
    ir('resultado', { key: k });
  },
  repetir(k) {
    modal({
      titulo: 'Repetir evaluación',
      texto: 'Se iniciará un nuevo cuestionario. Tu resultado anterior permanecerá guardado en el historial, pero el resumen actual se actualizará cuando completes la nueva evaluación.',
      ok: 'Repetir cuestionario',
      onOk: () => {
        delete S.eval[k];
        delete S.borr[k];
        guardar();
        iniciarQ(k);
      }
    });
  },
  verHist(id) {
    ir('resultado', { hist: id });
  },
  borrarHist(id) {
    modal({
      titulo: 'Eliminar evaluación del historial',
      texto: '¿Deseas eliminar permanentemente este registro del historial personal?',
      ok: 'Eliminar',
      onOk: () => {
        S.historial = S.historial.filter(h => h.id !== id);
        guardar();
        render();
        toast('Registro eliminado.');
      }
    });
  },
  imprimir() {
    window.print();
  },
  reiniciarPersonal() {
    modal({
      titulo: 'Borrar datos personales',
      texto: 'Se eliminarán tu perfil, borradores, evaluaciones e historial personal de este navegador. Esta acción es irreversible.',
      ok: 'Eliminar todo',
      onOk: () => {
        S.perfil = null;
        S.eval = {};
        S.borr = {};
        S.historial = [];
        guardar();
        ir('inicio');
        toast('Datos personales eliminados.');
      }
    });
  },

  /* Cuestionario */
  resp(v, el) { responderReactivo(+v, el); },

  toggleAutoAvanzar() {
    S.autoAvanzar = !S.autoAvanzar;
    guardar();
    render();
    toast(S.autoAvanzar ? '⚡ Auto-avance habilitado (220ms al calificar)' : '⏸️ Auto-avance pausado (manual)');
  },

  toggleModoSustentacion() {
    S.modoSustentacion = !S.modoSustentacion;
    document.body.classList.toggle('modo-sustentacion', !!S.modoSustentacion);
    const btn = document.getElementById('btnModoSustentacion');
    if (btn) {
      btn.classList.toggle('btn-teal', !!S.modoSustentacion);
      btn.innerHTML = S.modoSustentacion
        ? `${icono('minimize-2')} <span class="hide-mobile">Modo Normal</span>`
        : `${icono('maximize-2')} <span class="hide-mobile">Modo Sustentación</span>`;
      if (window.lucide) { try { lucide.createIcons(); } catch (e) {} }
    }
    guardar();
    toast(S.modoSustentacion ? '⛶ Modo Sustentación activado (optimizado para proyector)' : 'Modo estándar restaurado');
  },

  filtrarSubs(criterio) {
    S.filtroSubs = criterio || 'todos';
    const pills = document.querySelectorAll('.filter-subindices-bar .filter-pill');
    pills.forEach(p => {
      p.classList.toggle('act', p.dataset.arg === S.filtroSubs);
    });
    const filas = document.querySelectorAll('#tbodySubindices tr[data-categoria]');
    filas.forEach(f => {
      const cat = f.dataset.categoria;
      if (S.filtroSubs === 'todos' || cat === S.filtroSubs) {
        f.style.display = '';
      } else {
        f.style.display = 'none';
      }
    });
  },

  filtrarResumen(criterio) {
    S.filtroResumen = criterio || 'todos';
    const pills = document.querySelectorAll('#tbodyResumen').length ? document.querySelectorAll('.filter-subindices-bar .filter-pill') : [];
    pills.forEach(p => {
      p.classList.toggle('act', p.dataset.arg === S.filtroResumen);
    });
    const filas = document.querySelectorAll('#tbodyResumen tr[data-categoria]');
    filas.forEach(f => {
      const cat = f.dataset.categoria;
      if (S.filtroResumen === 'todos' || cat === S.filtroResumen) {
        f.style.display = '';
      } else {
        f.style.display = 'none';
      }
    });
  },

  filtrarPlanAccion(criterio) {
    const filtro = criterio || 'todos';
    const pills = document.querySelectorAll('.filter-subindices-bar .filter-pill[data-act="filtrarPlanAccion"]');
    pills.forEach(p => {
      p.classList.toggle('act', p.dataset.arg === filtro);
    });
    const filas = document.querySelectorAll('#tbodyPlanAccion tr[data-prio]');
    filas.forEach(f => {
      const prio = f.dataset.prio;
      f.style.display = (filtro === 'todos' || prio === filtro) ? '' : 'none';
    });
  },

  ant() {
    if (Q.i > 0) {
      Q.i--;
      persistirQ();
      render();
    }
  },
  sig() {
    if (Q.i < Q.flat.length - 1) {
      Q.i++;
      persistirQ();
      render();
    }
  },
  saltar(i) {
    Q.i = +i;
    persistirQ();
    render();
  },
  guardarProg() {
    persistirQ();
    toast('Progreso guardado correctamente en este navegador.');
  },
  salirQ() {
    volverDeQ();
  },
  finalizar() {
    finalizarQ();
  },
  cerrarModal() {
    cerrarModal();
  },

  /* Simulación y avance rápido para sustentación */
  autoRellenarQ(tipo) {
    if (!Q) return;
    const arq = tipo || S.simArquetipo || 'realista';
    S.simArquetipo = arq;
    if (!S.perfil && Q.key !== 'empresa') {
      S.perfil = {
        nombre: 'Carlos Hilario Mendoza',
        ocupacion: 'Ingeniero de Operaciones / Analista de Procesos Mineros',
        edad: 24,
        nivel: 'Universitario titulado',
        fecha: hoy()
      };
    }
    Q.r = generarRespuestasArquetipo(Q.def, arq);
    Q.i = Q.flat.length - 1;
    persistirQ();
    render();
    const nombresArq = {
      sobresaliente: 'Sobresaliente (~4.65)',
      realista: 'Realista con Brechas (~3.60)',
      no_apto: 'Brechas Críticas (~2.45)',
      aleatorio: 'Aleatorio Dinámico'
    };
    toast(`✓ Se respondieron las ${Q.flat.length} preguntas con arquetipo ${nombresArq[arq] || arq}.`);
  },

  autoRellenarYFinalizarQ(tipo) {
    if (!Q) return;
    const arq = tipo || S.simArquetipo || 'realista';
    S.simArquetipo = arq;
    if (!S.perfil && Q.key !== 'empresa') {
      S.perfil = {
        nombre: 'Carlos Hilario Mendoza',
        ocupacion: 'Ingeniero de Operaciones / Analista de Procesos Mineros',
        edad: 24,
        nivel: 'Universitario titulado',
        fecha: hoy()
      };
    }
    Q.r = generarRespuestasArquetipo(Q.def, arq);
    persistirQ();
    cerrarEvaluacion();
  },

  simularPersonalCompleto(arquetipo = 'realista') {
    if (!S.perfil) {
      S.perfil = {
        nombre: 'Carlos Hilario Mendoza',
        ocupacion: 'Ingeniero de Operaciones / Analista de Procesos Mineros',
        edad: 24,
        nivel: 'Universitario titulado',
        fecha: hoy()
      };
    }
    const arq = arquetipo || 'realista';
    S.simArquetipo = arq;
    const keys = [...INTELIGENCIAS.map(i => 'int_' + i.id), 'relacional', 'estructural'];

    keys.forEach(k => {
      const def = DEFS[k];
      const r = generarRespuestasArquetipo(def, arq);
      const res = calcular(def, r);
      S.eval[k] = { fecha: hoy(), r, resultado: res };
      delete S.borr[k];
      if (!S.historial.some(h => h.key === k)) {
        S.historial.unshift({
          id: 'h_sim_' + Date.now() + '_' + k,
          key: k,
          titulo: def.titulo,
          fecha: hoy(),
          resultado: res
        });
      }
    });
    guardar();
    render();
    const nombresArq = {
      sobresaliente: 'Sobresaliente (~4.65)',
      realista: 'Realista con Brechas (Recomendado para Sustentación)',
      no_apto: 'Con Brechas Críticas (~2.45)',
      aleatorio: 'Aleatorio Dinámico'
    };
    toast(`✓ ¡Evaluación Personal Completa simulada (${nombresArq[arq] || arq})! Gráficos radiales y Plan de Mejora listos.`);
  },

  simularHumanoCompleto(tipo = 'realista') {
    if (!S.perfil) {
      S.perfil = {
        nombre: 'Carlos Hilario Mendoza',
        ocupacion: 'Ingeniero de Operaciones / Analista de Procesos Mineros',
        edad: 24,
        nivel: 'Universitario titulado',
        fecha: hoy()
      };
    }
    const arq = tipo || 'realista';
    const keys = INTELIGENCIAS.map(i => 'int_' + i.id);
    keys.forEach(k => {
      const def = DEFS[k];
      const r = generarRespuestasArquetipo(def, arq);
      const res = calcular(def, r);
      S.eval[k] = { fecha: hoy(), r, resultado: res };
      delete S.borr[k];
      if (!S.historial.some(h => h.key === k)) {
        S.historial.unshift({
          id: 'h_sim_' + Date.now() + '_' + k,
          key: k,
          titulo: def.titulo,
          fecha: hoy(),
          resultado: res
        });
      }
    });
    guardar();
    render();
    toast(`✓ Se simularon las 9 Inteligencias Múltiples con arquetipo ${arq}.`);
  },

  limpiarPersonal() {
    modal({
      titulo: 'Reiniciar evaluaciones personales',
      texto: '¿Deseas reiniciar las evaluaciones personales? Se borrarán los puntajes y borradores para permitir una nueva demostración desde cero. Los datos básicos de tu perfil se mantendrán.',
      ok: 'Reiniciar evaluaciones',
      cancel: 'Cancelar',
      onOk: () => {
        S.eval = {};
        S.borr = {};
        S.historial = [];
        guardar();
        render();
        toast('Evaluaciones personales reiniciadas.');
      }
    });
  },

  crearPerfilDemo() {
    S.perfil = {
      nombre: 'Carlos Hilario Mendoza',
      ocupacion: 'Ingeniero de Operaciones / Analista de Procesos Mineros',
      edad: 24,
      nivel: 'Universitario titulado',
      fecha: hoy()
    };
    guardar();
    render();
    toast('Perfil de demostración configurado correctamente.');
  },

  rellenarFormPerfilDemo() {
    const form = document.querySelector('form[data-form="perfil"]');
    if (form) {
      if (form.nombre) form.nombre.value = 'Carlos Hilario Mendoza';
      if (form.edad) form.edad.value = '24';
      if (form.ocupacion) form.ocupacion.value = 'Ingeniero de Operaciones / Analista de Procesos Mineros';
      if (form.nivel) form.nivel.value = 'Universitario titulado';
      if (form.fecha) form.fecha.value = hoy();
      toast('Datos de prueba cargados en el formulario.');
    }
  },

  /* Empresa */
  empresaContinuar() {
    iniciarQ('empresa');
  },
  eliminarDepto(idx) {
    const dNom = S.empresa.departamentos[idx];
    modal({
      titulo: 'Eliminar departamento',
      texto: `¿Eliminar el departamento <strong>${esc(dNom)}</strong>? Las respuestas registradas asociadas se conservarán con ese nombre histórico.`,
      ok: 'Eliminar',
      onOk: () => {
        S.empresa.departamentos.splice(idx, 1);
        guardar();
        render();
        toast('Departamento eliminado.');
      }
    });
  },
  borrarResp(id) {
    modal({
      titulo: 'Eliminar respuesta',
      texto: '¿Eliminar permanentemente esta respuesta registrada?',
      ok: 'Eliminar',
      onOk: () => {
        S.empresa.resp = S.empresa.resp.filter(r => r.id !== id);
        guardar();
        render();
        toast('Respuesta eliminada.');
      }
    });
  },
  cargarPlantillaSector(sectorArg) {
    const sec = sectorArg || (S.empresa.datos ? S.empresa.datos.sector : null) || 'Minería y Recursos Naturales';
    if (DEPARTAMENTOS_POR_SECTOR[sec]) {
      S.empresa.departamentos = [...DEPARTAMENTOS_POR_SECTOR[sec]];
      guardar();
      render();
      toast('Se cargaron los 6 departamentos sugeridos para ' + sec + '.');
    }
  },

  simularPorTamano(escalaOpt) {
    if (!S.empresa.datos) {
      S.empresa.datos = {
        nombre: 'Sociedad Minera Cerro Verde S.A.A.',
        sector: 'Minería y Recursos Naturales',
        tamano: 'Gran Empresa (más de 250 trabajadores)',
        trabajadores: 4800,
        responsable: 'Gerencia de Transformación y RR.HH.',
        fecha: hoy()
      };
    }

    const d = S.empresa.datos;
    const deptos = S.empresa.departamentos && S.empresa.departamentos.length > 0
      ? S.empresa.departamentos
      : (DEPARTAMENTOS_POR_SECTOR[d.sector] || DEPARTAMENTOS_POR_SECTOR['Minería y Recursos Naturales']);
    S.empresa.departamentos = deptos;

    // Calcular cantidad de respuestas según la escala o trabajadores configurados
    let nCols = 24;
    const nDeptos = deptos.length;
    const minPorArea = 2; // Garantiza visibilidad en gráficos y tablas (umbral minGrupoArea: 2)

    if (escalaOpt === 'micro') {
      nCols = Math.max(nDeptos * minPorArea, 8);
    } else if (escalaOpt === 'pequena') {
      nCols = Math.max(nDeptos * 3, 18);
    } else if (escalaOpt === 'mediana') {
      nCols = Math.max(nDeptos * 4, 36);
    } else if (escalaOpt === 'grande') {
      nCols = Math.max(nDeptos * 6, 60);
    } else {
      // Auto-detección según el tamaño y número de trabajadores de la empresa
      const trab = d.trabajadores || 100;
      const tam = d.tamano || '';
      if (tam.includes('Micro') || trab <= 10) {
        nCols = Math.max(nDeptos * minPorArea, Math.min(trab, 10));
      } else if (tam.includes('Pequeña') || trab <= 50) {
        nCols = Math.max(nDeptos * 3, Math.min(trab, 24));
      } else if (tam.includes('Mediana') || trab <= 250) {
        nCols = Math.max(nDeptos * 4, Math.min(trab, 48));
      } else {
        nCols = Math.max(nDeptos * 6, 60);
      }
    }

    // Calibración de puntuaciones base según sector económico
    const sectorScores = {
      'Minería y Recursos Naturales': { humano: 3.75, relacional: 3.45, estructural: 4.15 },
      'Tecnología y Software': { humano: 4.25, relacional: 3.85, estructural: 3.70 },
      'Manufactura e Industria': { humano: 3.65, relacional: 3.50, estructural: 4.10 },
      'Servicios Profesionales': { humano: 4.05, relacional: 4.15, estructural: 3.60 },
      'Salud y Farmacéutica': { humano: 4.15, relacional: 3.70, estructural: 4.05 },
      'Construcción e Infraestructura': { humano: 3.60, relacional: 3.45, estructural: 4.00 },
      'Educación e Investigación': { humano: 4.30, relacional: 3.90, estructural: 3.55 },
      'Comercio y Distribución': { humano: 3.80, relacional: 4.10, estructural: 3.65 },
      'Agroindustria': { humano: 3.65, relacional: 3.60, estructural: 3.95 }
    };

    const baseScores = sectorScores[d.sector] || { humano: 3.80, relacional: 3.65, estructural: 3.90 };

    // Limpiar simulaciones anteriores para no inflar artificialmente la muestra
    S.empresa.resp = S.empresa.resp.filter(r => !r.sim);

    const nuevas = [];
    const ts = Date.now();
    for (let i = 0; i < nCols; i++) {
      // Distribución equitativa y redonda entre todos los departamentos (cada departamento recibe al menos nCols/nDeptos)
      const depto = deptos[i % deptos.length];

      // Variación contextual según departamento
      let sesgoH = 0, sesgoR = 0, sesgoE = 0;
      const deptoLower = depto.toLowerCase();
      if (deptoLower.includes('planta') || deptoLower.includes('operacion') || deptoLower.includes('mantenimiento') || deptoLower.includes('obra')) {
        sesgoE += 0.25; sesgoH -= 0.10;
      } else if (deptoLower.includes('comunitari') || deptoLower.includes('comercial') || deptoLower.includes('cliente') || deptoLower.includes('venta')) {
        sesgoR += 0.35; sesgoE -= 0.15;
      } else if (deptoLower.includes('talento') || deptoLower.includes('humano') || deptoLower.includes('investigacion') || deptoLower.includes('docen')) {
        sesgoH += 0.30; sesgoR += 0.10;
      }

      const r = aplanar(DEFS.empresa).map(q => {
        const cap = EMPRESA_ITEMS[q.si].cap;
        let baseVal = baseScores[cap];
        if (cap === 'humano') baseVal += sesgoH;
        else if (cap === 'relacional') baseVal += sesgoR;
        else if (cap === 'estructural') baseVal += sesgoE;

        const jitter = (Math.random() * 1.6 - 0.8);
        return Math.max(1, Math.min(5, Math.round(baseVal + jitter)));
      });

      const resCalculado = calcular(DEFS.empresa, r);

      nuevas.push({
        id: 'r_sim_' + ts + '_' + (i + 1),
        nombre: 'Colaborador ' + String(i + 1).padStart(2, '0') + ' (' + depto.split(' ')[0] + ')',
        area: depto,
        fecha: hoy(),
        r,
        res: resCalculado,
        sim: true
      });
    }

    S.empresa.resp.push(...nuevas);
    guardar();
    render();
    const minCalculado = Math.floor(nCols / deptos.length);
    toast('✓ Se generaron ' + nCols + ' respuestas simuladas (' + minCalculado + ' por departamento). ¡Resultados listos para sustentar!');
  },

  cargarSimulacionMinera() {
    // Caso de estudio minero: Sociedad Minera Cerro Verde S.A.A.
    if (!S.empresa.datos) {
      S.empresa.datos = {
        nombre: 'Sociedad Minera Cerro Verde S.A.A.',
        sector: 'Gran Minería del Cobre y Molibdeno',
        tamano: 'Más de 250 trabajadores (Gran empresa)',
        trabajadores: 4800,
        responsable: 'Gerencia de Recursos Humanos y Transformación',
        fecha: hoy()
      };
    }
    const deptos = S.empresa.departamentos;
    const baseScores = {
      'humano': 3.75,
      'relacional': 3.40,
      'estructural': 4.10
    };

    const nuevas = [];
    for (let i = 0; i < 12; i++) {
      const depto = deptos[i % deptos.length];
      const r = aplanar(DEFS.empresa).map(q => {
        const cap = EMPRESA_ITEMS[q.si].cap;
        const jitter = (Math.random() * 1.6 - 0.8);
        const val = Math.max(1, Math.min(5, Math.round(baseScores[cap] + jitter)));
        return val;
      });

      nuevas.push({
        id: 'r_sim_' + Date.now() + '_' + i,
        nombre: `Colaborador ${String(i + 1).padStart(2, '0')}`,
        area: depto,
        fecha: hoy(),
        r,
        sim: true
      });
    }

    S.empresa.resp.push(...nuevas);
    guardar();
    render();
    toast('Se cargaron 12 respuestas simuladas de Sociedad Minera Cerro Verde.');
  },
  quitarSim() {
    S.empresa.resp = S.empresa.resp.filter(r => !r.sim);
    guardar();
    render();
    toast('Respuestas simuladas eliminadas.');
  },
  exportCSV() {
    const g = agregarResultadosEmpresa();
    if (!g) return toast('No hay datos para exportar.');

    const cab = [
      'id', 'participante', 'departamento', 'fecha', 'simulado',
      ...EMPRESA_ITEMS.map(s => s.nombre),
      'capital_humano', 'capital_relacional', 'capital_estructural', 'indicador_global'
    ];

    const filas = g.resp.map(r => {
      const caps = Object.keys(CAPS).map(c => avg(r.res.subs.filter(s => s.cap === c).map(s => s.valor)));
      return [
        r.id,
        r.nombre,
        r.area,
        r.fecha,
        r.sim ? 'si' : 'no',
        ...r.res.subs.map(s => s.valor.toFixed(2)),
        ...caps.map(v => v.toFixed(2)),
        avg(caps).toFixed(2)
      ];
    });

    const csvContent = '\uFEFF' + [cab, ...filas].map(f => f.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intelectus_resultados_${(S.empresa.datos.nombre || 'empresa').toLowerCase().replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast('Archivo CSV generado y descargado.');
  },
  reiniciarEmpresa() {
    modal({
      titulo: 'Reiniciar datos empresariales',
      texto: 'Se eliminarán la configuración de la empresa y todas las respuestas registradas. Esta acción no se puede deshacer.',
      ok: 'Borrar todo',
      onOk: () => {
        S.empresa = nuevoEstado().empresa;
        guardar();
        ir('inicio');
        toast('Datos empresariales eliminados.');
      }
    });
  }
};

/* ============================ EVENT LISTENERS ============================ */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = ACT[el.dataset.act];
  if (fn) fn(el.dataset.arg, el);
});

// Toggle Sidebar en Móviles
const btnToggleSb = $('#btnToggleSidebar');
if (btnToggleSb) {
  btnToggleSb.addEventListener('click', () => {
    const sb = $('#sidebar');
    const sbb = $('#sidebarBackdrop');
    if (sb) sb.classList.toggle('open');
    if (sbb) sbb.classList.toggle('open');
  });
}

const sbBackdrop = $('#sidebarBackdrop');
if (sbBackdrop) {
  sbBackdrop.addEventListener('click', () => {
    const sb = $('#sidebar');
    if (sb) sb.classList.remove('open');
    sbBackdrop.classList.remove('open');
  });
}

// Listener reactivo al cambiar el Sector Económico en el formulario de empresa
document.addEventListener('change', e => {
  if (e.target && e.target.id === 'e-sector') {
    const sec = e.target.value;
    const box = document.getElementById('sector-deptos-box');
    const list = document.getElementById('sector-deptos-list');
    if (box && list) {
      if (sec && DEPARTAMENTOS_POR_SECTOR[sec]) {
        box.style.display = 'block';
        list.innerHTML = DEPARTAMENTOS_POR_SECTOR[sec].map(dep => `
          <span style="background:#ffffff; color:#1e293b; font-size:0.75rem; font-weight:600; padding:0.22rem 0.55rem; border-radius:5px; border:1px solid #cbd5e1; box-shadow:0 1px 2px rgba(0,0,0,0.04);">${esc(dep)}</span>
        `).join('');
      } else {
        box.style.display = 'none';
      }
    }
  }
});

/* Formularios y Validaciones */
function mostrarErrores(form, errs) {
  form.querySelectorAll('[data-err]').forEach(s => { s.textContent = errs[s.dataset.err] || ''; });
  form.querySelectorAll('input,select,textarea').forEach(i => i.classList.toggle('invalido', !!errs[i.name]));
  const primero = Object.keys(errs)[0];
  if (primero) {
    const campo = form.querySelector(`[name="${primero}"]`);
    if (campo) campo.focus();
  }
  return Object.keys(errs).length === 0;
}

document.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  const tipo = form.dataset.form;
  const d = Object.fromEntries(new FormData(form));
  Object.keys(d).forEach(k => { d[k] = String(d[k]).trim(); });
  const errs = {};

  if (tipo === 'perfil') {
    if (!d.nombre || d.nombre.length < 3) errs.nombre = 'Ingresa tu nombre completo (mínimo 3 caracteres).';
    if (!d.ocupacion) errs.ocupacion = 'Indica tu ocupación o profesión actual.';
    if (d.edad && (isNaN(+d.edad) || +d.edad < 10 || +d.edad > 100)) errs.edad = 'Ingresa una edad válida (entre 10 y 100 años).';
    if (!d.fecha) errs.fecha = 'Selecciona la fecha de evaluación.';

    if (!mostrarErrores(form, errs)) return;

    S.perfil = {
      nombre: d.nombre,
      edad: d.edad,
      ocupacion: d.ocupacion,
      nivel: d.nivel,
      fecha: d.fecha
    };
    guardar();
    ir('panel');
    toast('Perfil guardado exitosamente.');
  } else if (tipo === 'empresa') {
    if (!d.nombre || d.nombre.length < 2) errs.nombre = 'Escribe el nombre de la organización.';
    if (!d.sector) errs.sector = 'Selecciona el sector económico.';
    if (!d.tamano) errs.tamano = 'Selecciona el tamaño de la empresa.';

    if (!mostrarErrores(form, errs)) return;

    const sectorPrevio = S.empresa.datos ? S.empresa.datos.sector : null;
    const sectorCambio = !sectorPrevio || sectorPrevio !== d.sector;

    S.empresa.datos = {
      nombre: d.nombre,
      sector: d.sector,
      tamano: d.tamano,
      trabajadores: +d.trabajadores || 100,
      responsable: d.responsable,
      fecha: d.fecha || hoy()
    };

    // Si es empresa nueva o cambió de sector económico, inicializar los departamentos predeterminados
    if (sectorCambio && DEPARTAMENTOS_POR_SECTOR[d.sector]) {
      S.empresa.departamentos = [...DEPARTAMENTOS_POR_SECTOR[d.sector]];
    }

    guardar();
    ir('empresaPanel');
    toast('Organización registrada con ' + S.empresa.departamentos.length + ' departamentos sugeridos para ' + d.sector + '.');
  } else if (tipo === 'trabajador') {
    if (!d.area) errs.area = 'Selecciona el departamento o área correspondiente.';
    if (!mostrarErrores(form, errs)) return;

    S.empresa.borr = null;
    iniciarQ('empresa', { nombre: d.nombre, area: d.area });
  } else if (tipo === 'nuevoDepto') {
    const nom = d.nombre;
    if (nom && !S.empresa.departamentos.includes(nom)) {
      S.empresa.departamentos.push(nom);
      guardar();
      render();
      toast(`Departamento "${nom}" agregado.`);
    }
  }
});

/* Atajos de teclado en el cuestionario */
document.addEventListener('keydown', e => {
  if (V.name !== 'cuestionario' || !Q || $('#modal').innerHTML) return;
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

  if (e.key >= '1' && e.key <= '5') {
    responderReactivo(+e.key);
  } else if (e.key === 'ArrowRight') {
    ACT.sig();
  } else if (e.key === 'ArrowLeft') {
    ACT.ant();
  }
});

/* Inicialización */
if (S.modoSustentacion) {
  document.body.classList.add('modo-sustentacion');
  const btn = document.getElementById('btnModoSustentacion');
  if (btn) {
    btn.classList.add('btn-teal');
    btn.innerHTML = `${icono('minimize-2')} <span class="hide-mobile">Modo Normal</span>`;
  }
}
render();
