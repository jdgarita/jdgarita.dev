/* ============================================================
   Juan Diego Garita — custom.js
   ============================================================
   Vanilla-JS controllers for:
     1. Theme toggle  (light / dark, persisted in localStorage)
     2. Language toggle (en / es, persisted in localStorage)
     3. i18n loader    (fetches i18n/<lang>.json; falls back to
                        embedded dictionary on file:// previews)
     4. Mobile nav toggle
     5. Header shadow on scroll
     6. Footer year

   i18n contract:
     - Every translatable element carries [data-i18n="key"].
       The loader sets its textContent to dict[key].
     - Attribute translation uses [data-i18n-attr="attr:key"].
       Multiple pairs are comma-separated:
         data-i18n-attr="aria-label:a11y.foo, title:a11y.foo"

   Theme initialization runs inline in index.html <head> to avoid
   FOUC; this file only handles the click-to-toggle interaction.
   ============================================================ */

(function () {
    'use strict';

    /* ---------- Fallback dictionaries (used when fetch fails,
       e.g. opening index.html via file://). Keep in sync with
       i18n/en.json and i18n/es.json. ---------- */
    var FALLBACK = {
        en: {
            'meta.title': 'Juan Diego Garita · Senior Mobile Engineer, Kotlin Multiplatform & Android',
            'meta.description': 'Senior mobile engineer with 10+ years building Android and Kotlin Multiplatform apps for U.S. companies, including apps with 10M+ downloads. Creator of Faint, Still and the open-source frnk toolkit.',
            'a11y.themeToggle': 'Toggle light / dark theme',
            'a11y.langToggle': 'Switch language',
            'a11y.menuToggle': 'Toggle navigation menu',
            'a11y.frnkLanding': 'frnk landing page',
            'a11y.frnkSource': 'frnk source on GitHub',
            'a11y.frnkViewSource': 'View frnk on GitHub',
            'a11y.stillLanding': 'Still landing page',
            'a11y.faintLanding': 'Faint landing page',
            'a11y.faintAppStore': 'Faint on the App Store',
            'a11y.faintPlay': 'Faint on Google Play',
            'a11y.stillPlay': 'Still on Google Play',
            'a11y.stillAppStore': 'Still on the App Store',
            'a11y.techStack': 'Tech stack',
            'a11y.aknghtStudios': 'AKnght Studios website (external site)',
            'a11y.frnkChangelog': 'View frnk changelog on GitHub',
            'nav.about': 'About',
            'nav.apps': 'Indie Apps',
            'nav.openSource': 'Open Source',
            'nav.experience': 'Experience',
            'nav.skills': 'Skills',
            'nav.contact': 'Contact',
            'nav.resume': 'Resume',
            'hero.eyebrow': 'Senior Mobile Engineer',
            'hero.title': 'Juan Diego Garita',
            'hero.tagline': 'I build polished, reliable mobile apps with Kotlin Multiplatform.',
            'hero.description': '10+ years shipping Android and Kotlin Multiplatform apps for U.S. companies, including apps with 10M+ and 50M+ downloads, across experimentation, ads and authentication.',
            'hero.ctaPrimary': 'Download resume',
            'hero.ctaSecondary': 'Get in touch',
            'about.heading': 'About',
            'about.body': "Senior mobile engineer based in Costa Rica with 10+ years of Android experience, working remotely with U.S. teams. I currently work on mobile experimentation for the Experian® app. Before that I built ad monetization for a Kotlin Multiplatform app factory at Swiftly, engagement features at Mode, and Trusona's Android authentication SDK. I care about clean, modular architecture, test-first development and reliable releases.",
            'about.highlight1': '10+ years shipping Android apps, including apps with 10M+ and 50M+ downloads',
            'about.highlight2': 'Kotlin Multiplatform and Jetpack Compose specialist',
            'about.highlight3': 'Agile practitioner — Scrum, Kanban, TDD, pair programming',
            'experience.heading': 'Experience Summary',
            'experience.subheading': '',
            'experience.role1.company': 'Ascendion (client: Experian)',
            'experience.role1.role': 'Senior Android Engineer',
            'experience.role1.dates': '2026 — Present',
            'experience.role1.reach': 'Experian® app · 10M+ downloads on Google Play',
            'experience.role1.bullet1': 'Build features on the mobile Experimentation team; shipped 2 A/B experiments to production so far, testing UI/UX changes in key user flows.',
            'experience.role1.bullet2': 'Build cross-platform experiment capabilities that work within iOS constraints, keeping Android and iOS at feature parity for smooth rollouts.',
            'experience.role1.bullet3': "Improving the app's branding and its startup and load times.",
            'experience.role2.company': 'Swiftly',
            'experience.role2.role': 'Senior Kotlin Multiplatform Engineer',
            'experience.role2.dates': '2022 — 2026',
            'experience.role2.bullet1': 'Owned ad monetization for a Kotlin Multiplatform "App Factory" that ships white-label retail apps to Android and iOS (~8 client apps).',
            'experience.role2.bullet2': 'Designed and built a reusable ads component on the Xandr (Microsoft) Mobile SDK, adopted by every client app: one integration instead of one per app.',
            'experience.role2.bullet3': 'Shipped banner, interstitial and video ads and standardized impression tracking, giving more reliable ad reporting and higher measured impressions.',
            'experience.role3.company': 'Mode',
            'experience.role3.role': 'Senior Android Engineer',
            'experience.role3.dates': '2021 — 2022',
            'experience.role3.reach': 'Mode app · 50M+ downloads on Google Play',
            'experience.role3.bullet1': 'Built engagement features designed to bring users back every day and grow daily active users.',
            'experience.role3.bullet2': 'Shipped a surveys feature that brought 3 third-party survey providers into a single experience.',
            'experience.role3.bullet3': 'Wrote the architecture docs, validated features with Product through A/B tests, and orchestrated cross-team releases.',
            'experience.role4.company': 'Trusona',
            'experience.role4.role': 'Android Developer',
            'experience.role4.dates': '2017 — 2021',
            'experience.role4.reach': 'Trusona app · 10K+ downloads on Google Play',
            'experience.role4.bullet1': "As one of two Android engineers, designed and built the Trusona Android SDK, letting third-party apps adopt Trusona's authentication system.",
            'experience.role4.bullet2': 'Designed and built Trusona\'s official Android app.',
            'experience.role4.bullet3': 'Automated releases with Fastlane, cutting release time from a full day to a few hours; worked test-first (TDD) in Kotlin and Java, in a Kanban flow.',
            'experience.role5.company': 'Gorilla Logic (client: DaVita)',
            'experience.role5.role': 'Android Developer',
            'experience.role5.dates': '2016 — 2017',
            'experience.role5.bullet1': "Fixed bugs and improved stability in DaVita's patient-facing Android app, written in Java.",
            'experience.role6.company': 'Accenture',
            'experience.role6.role': 'Software Developer Senior Analyst',
            'experience.role6.dates': '2015 — 2016',
            'experience.role6.bullet1': 'Built Android features in Java for a Fortune 500 consumer-goods client (name withheld under NDA).',
            'apps.heading': 'Indie Apps',
            'apps.subheading': 'Focused, production-ready cross-platform mobile apps built and maintained independently.',
            'openSource.heading': 'Open Source & Tooling',
            'openSource.subheading': 'Reusable architectural frameworks, templates, and libraries created to speed up modern mobile development.',
            'projects.frnk.tagline': 'Modular Kotlin Multiplatform Toolkit',
            'projects.frnk.description': 'An opinionated, production-grade architectural foundation for Kotlin Multiplatform apps. Features headless UI contracts, pluggable backends, and strict MVI pattern implementations to launch new mobile products in days.',
            'projects.still.tagline': 'Fridge & Pantry Tracker',
            'projects.still.description': 'Log food in 3 taps: category, item, location. Still works out when each one needs using, lays out the kitchen at a glance, and sends one reminder the day before. No account; everything stays on the phone.',
            'projects.faint.tagline': 'AI-Powered Coffee Tasting Journal',
            'projects.faint.description': 'A companion app for specialty coffee lovers. Scan roaster tasting cards, track flavor profiles, log brewing parameters, and build a personalized coffee map.',
            'projects.store.getItOn': 'Get it on',
            'projects.store.downloadOn': 'Download on the',
            'projects.store.availableOn': 'Available on',
            'projects.store.comingSoon': 'App Store — Coming soon',
            'projects.store.viewSourceOn': 'View source on',
            'projects.store.visit': 'Visit',
            'projects.store.landingPage': 'Landing page',
            'skills.heading': 'Tech stack',
            'skills.subheading': '',
            'skills.group.core': 'Core',
            'skills.group.android': 'Android',
            'skills.group.tooling': 'Tooling',
            'skills.group.architecture': 'Architecture',
            'contact.heading': "Let's talk",
            'contact.body': 'Open to senior Android and Kotlin Multiplatform roles, contract work and interesting collaborations. Based in Costa Rica, working in U.S. time zones.',
            'friends.heading': 'Friends & fellow makers',
            'friends.subheading': 'Independent studios run by friends of mine. Each one is its own business, unaffiliated with me.',
            'friends.aknght.description': 'Games, apps and tools for writers, from a small team that has always worked remotely.',
            'friends.disclaimer': "Shared as a courtesy: no payment, partnership, or business relationship. External sites are operated independently, and I'm not responsible for their content.",
            'footer.rights': 'All rights reserved.',
            'notfound.title': 'Page not found',
            'notfound.body': "The page you're looking for doesn't exist or has moved.",
            'notfound.cta': 'Back to home',
            'frnk.meta.title': 'frnk — Kotlin Multiplatform client toolkit',
            'frnk.meta.description': 'frnk is a modular Kotlin Multiplatform + Compose Multiplatform toolkit with headless UI, MVI architecture, Room persistence, PostHog + Sentry observability, and RevenueCat monetization — built for indie and small-team mobile devs.',
            'frnk.hero.logoAlt': 'frnk logo',
            'frnk.hero.eyebrow': 'Open-source KMP client toolkit',
            'frnk.hero.title': 'frnk',
            'frnk.hero.tagline': 'A modular Kotlin Multiplatform toolkit for indie and small-team mobile apps.',
            'frnk.hero.description': 'Headless Compose UI, MVI presentation, Room persistence, PostHog + Sentry observability, and RevenueCat monetization — wired together via Koin so day-to-day work stays on features, not plumbing.',
            'frnk.hero.ctaPrimary': 'View on GitHub',
            'frnk.about.heading': 'Why frnk',
            'frnk.about.body': 'frnk gives indie / small-team apps a fast-compiling foundation with a clean architecture, aggressive modularization, and a standardized MVI presentation layer — so the day-to-day work stays on features and business logic.',
            'frnk.features.heading': 'What it ships',
            'frnk.features.mvi.title': 'MVI presentation engine',
            'frnk.features.mvi.body': 'MviContract, MviViewModel<S, I, E> and UiText ship in core-mvi, with no Compose dependency. New screens subclass MviViewModel and stay consistent across the toolkit.',
            'frnk.features.ui.title': 'Headless Compose UI',
            'frnk.features.ui.body': 'Built on compose-unstyled so consuming apps bring their own design system instead of fighting opinionated defaults.',
            'frnk.features.backends.title': 'PostHog + Sentry observability',
            'frnk.features.backends.body': 'Analytics and crash reporting sit behind AnalyticsTracker and CrashReporter interfaces, with PostHog and Sentry implementations installed in one call: frnkModules { observability(…) }.',
            'frnk.features.modularity.title': 'Strict api / impl modules',
            'frnk.features.modularity.body': '*-api modules expose only interfaces and DTOs; *-impl modules carry the concrete bindings — wired via Koin and swappable per project.',
            'frnk.features.di.title': 'One-call Koin bootstrap',
            'frnk.features.di.body': "initializeFrnk(modules) starts DI from the explicit module list the host passes, so capability modules you don't pass never enter the graph.",
            'frnk.features.persistence.title': 'Room persistence',
            'frnk.features.persistence.body': 'Room KMP with the bundled SQLite driver, plus a Multiplatform Settings key/value store. The toolkit owns the driver; your host app owns the schema.',
            'frnk.features.monetization.title': 'RevenueCat monetization',
            'frnk.features.monetization.body': 'Entitlement and feature-gate interfaces with a RevenueCat implementation behind them — paywall logic stays out of feature modules.',
            'frnk.features.ci.title': 'Tagged releases + pre-commit ktlint',
            'frnk.features.ci.body': 'Each release tag is checked against Frnk.VERSION and published with notes from the CHANGELOG; ktlint formatting runs in a git pre-commit hook.',
            'frnk.stack.heading': 'Built with',
            'frnk.status.heading': 'Project status',
            'frnk.status.body': 'Early / pre-1.0. APIs may shift between minor versions — pre-1.0 policy is that 0.x.0 may break API while 0.x.y stays additive and fix-only.',
            'frnk.status.changelogLink': 'View CHANGELOG on GitHub'
        },
        es: {
            'meta.title': 'Juan Diego Garita · Ingeniero Móvil Senior, Kotlin Multiplatform y Android',
            'meta.description': 'Ingeniero móvil senior con más de 10 años desarrollando apps Android y Kotlin Multiplatform para empresas de EE. UU., incluidas apps con más de 10M de descargas. Creador de Faint, Still y del toolkit de código abierto frnk.',
            'a11y.themeToggle': 'Cambiar tema claro / oscuro',
            'a11y.langToggle': 'Cambiar idioma',
            'a11y.menuToggle': 'Abrir menú de navegación',
            'a11y.frnkLanding': 'Landing page de frnk',
            'a11y.frnkSource': 'Código fuente de frnk en GitHub',
            'a11y.frnkViewSource': 'Ver frnk en GitHub',
            'a11y.stillLanding': 'Landing page de Still',
            'a11y.faintLanding': 'Landing page de Faint',
            'a11y.faintAppStore': 'Faint en el App Store',
            'a11y.faintPlay': 'Faint en Google Play',
            'a11y.stillPlay': 'Still en Google Play',
            'a11y.stillAppStore': 'Still en el App Store',
            'a11y.techStack': 'Stack tecnológico',
            'a11y.aknghtStudios': 'Sitio web de AKnght Studios (sitio externo)',
            'a11y.frnkChangelog': 'Ver el changelog de frnk en GitHub',
            'nav.about': 'Sobre Mí',
            'nav.apps': 'Apps indie',
            'nav.openSource': 'Código abierto',
            'nav.experience': 'Experiencia',
            'nav.skills': 'Habilidades',
            'nav.contact': 'Contacto',
            'nav.resume': 'Currículum',
            'hero.eyebrow': 'Ingeniero Móvil Senior',
            'hero.title': 'Juan Diego Garita',
            'hero.tagline': 'Construyo apps móviles pulidas y confiables con Kotlin Multiplatform.',
            'hero.description': 'Más de 10 años lanzando apps Android y Kotlin Multiplatform para empresas de EE. UU., incluidas apps con más de 10M y 50M de descargas, en experimentación, publicidad y autenticación.',
            'hero.ctaPrimary': 'Descargar currículum',
            'hero.ctaSecondary': 'Contáctame',
            'about.heading': 'Sobre Mí',
            'about.body': 'Ingeniero móvil senior en Costa Rica con más de 10 años de experiencia en Android, trabajando de forma remota con equipos de EE. UU. Actualmente trabajo en experimentación móvil para la app de Experian®. Antes construí la monetización con anuncios de un "App Factory" en Kotlin Multiplatform en Swiftly, funciones de engagement en Mode y el SDK de autenticación para Android de Trusona. Me importan la arquitectura limpia y modular, el desarrollo guiado por pruebas y los lanzamientos confiables.',
            'about.highlight1': 'Más de 10 años lanzando apps Android, incluidas apps con más de 10M y 50M de descargas',
            'about.highlight2': 'Especialista en Kotlin Multiplatform y Jetpack Compose',
            'about.highlight3': 'Prácticas ágiles — Scrum, Kanban, TDD, pair programming',
            'experience.heading': 'Resumen de Experiencia',
            'experience.subheading': '',
            'experience.role1.company': 'Ascendion (cliente: Experian)',
            'experience.role1.role': 'Ingeniero Android Senior',
            'experience.role1.dates': '2026 — Presente',
            'experience.role1.reach': 'App de Experian® · más de 10M de descargas en Google Play',
            'experience.role1.bullet1': 'Desarrollo funciones en el equipo de Experimentación móvil; he lanzado 2 experimentos A/B a producción hasta ahora, probando cambios de UI/UX en flujos clave.',
            'experience.role1.bullet2': 'Construyo capacidades de experimentación multiplataforma que respetan las restricciones de iOS, manteniendo la paridad entre Android e iOS para lanzamientos sin fricciones.',
            'experience.role1.bullet3': 'Mejoro el branding de la app y sus tiempos de inicio y carga.',
            'experience.role2.company': 'Swiftly',
            'experience.role2.role': 'Ingeniero Senior de Kotlin Multiplatform',
            'experience.role2.dates': '2022 — 2026',
            'experience.role2.bullet1': 'Fui responsable de la monetización con anuncios de un "App Factory" en Kotlin Multiplatform que publica apps de retail de marca blanca en Android e iOS (~8 apps cliente).',
            'experience.role2.bullet2': 'Diseñé y construí un componente de anuncios reutilizable sobre el SDK móvil de Xandr (Microsoft), adoptado por todas las apps cliente: una sola integración en lugar de una por app.',
            'experience.role2.bullet3': 'Lancé anuncios banner, intersticiales y de video, y estandaricé el seguimiento de impresiones, logrando reportes más confiables y más impresiones medidas.',
            'experience.role3.company': 'Mode',
            'experience.role3.role': 'Ingeniero Android Senior',
            'experience.role3.dates': '2021 — 2022',
            'experience.role3.reach': 'App de Mode · más de 50M de descargas en Google Play',
            'experience.role3.bullet1': 'Construí funciones de engagement pensadas para que los usuarios volvieran cada día y aumentaran los usuarios activos diarios.',
            'experience.role3.bullet2': 'Lancé una función de encuestas que reunió a 3 proveedores de encuestas de terceros en una sola experiencia.',
            'experience.role3.bullet3': 'Redacté la documentación de arquitectura, validé funciones con Producto mediante pruebas A/B y coordiné lanzamientos entre equipos.',
            'experience.role4.company': 'Trusona',
            'experience.role4.role': 'Desarrollador Android',
            'experience.role4.dates': '2017 — 2021',
            'experience.role4.reach': 'App de Trusona · más de 10K descargas en Google Play',
            'experience.role4.bullet1': 'Como uno de los dos ingenieros Android, diseñé y construí el SDK de Trusona para Android, permitiendo a apps de terceros adoptar el sistema de autenticación de Trusona.',
            'experience.role4.bullet2': 'Diseñé y construí la app oficial de Trusona para Android.',
            'experience.role4.bullet3': 'Automaticé los lanzamientos con Fastlane, reduciendo el tiempo de publicación de un día completo a unas pocas horas; trabajé guiado por TDD en Kotlin y Java, en un flujo Kanban.',
            'experience.role5.company': 'Gorilla Logic (cliente: DaVita)',
            'experience.role5.role': 'Desarrollador Android',
            'experience.role5.dates': '2016 — 2017',
            'experience.role5.bullet1': 'Corregí errores y mejoré la estabilidad de la app Android para pacientes de DaVita, escrita en Java.',
            'experience.role6.company': 'Accenture',
            'experience.role6.role': 'Analista Senior de Desarrollo de Software',
            'experience.role6.dates': '2015 — 2016',
            'experience.role6.bullet1': 'Desarrollé funciones Android en Java para un cliente Fortune 500 de bienes de consumo (nombre reservado por confidencialidad).',
            'apps.heading': 'Apps indie',
            'apps.subheading': 'Apps móviles multiplataforma, enfocadas y listas para producción, creadas y mantenidas de forma independiente.',
            'openSource.heading': 'Código abierto y herramientas',
            'openSource.subheading': 'Frameworks arquitectónicos, plantillas y librerías reutilizables creados para acelerar el desarrollo móvil moderno.',
            'projects.frnk.tagline': 'Toolkit modular para Kotlin Multiplatform',
            'projects.frnk.description': 'Una base arquitectónica opinada y lista para producción para apps Kotlin Multiplatform. Incluye contratos de UI headless, backends intercambiables e implementaciones estrictas del patrón MVI para lanzar nuevos productos móviles en días.',
            'projects.still.tagline': 'Refri y despensa al día',
            'projects.still.description': 'Registra tu comida en 3 toques: categoría, alimento y lugar. Still calcula cuándo usar cada uno, muestra la cocina de un vistazo y avisa el día antes. Sin cuenta; todo queda en el teléfono.',
            'projects.faint.tagline': 'Diario de cata de café con IA',
            'projects.faint.description': 'Una app compañera para amantes del café de especialidad. Escanea las tarjetas de cata del tostador, sigue perfiles de sabor, registra parámetros de preparación y construye tu mapa cafetero personalizado.',
            'projects.store.getItOn': 'Disponible en',
            'projects.store.downloadOn': 'Descárgala en el',
            'projects.store.availableOn': 'Disponible en',
            'projects.store.comingSoon': 'App Store — Próximamente',
            'projects.store.viewSourceOn': 'Ver código en',
            'projects.store.visit': 'Visita',
            'projects.store.landingPage': 'Landing page',
            'skills.heading': 'Stack técnico',
            'skills.subheading': '',
            'skills.group.core': 'Base',
            'skills.group.android': 'Android',
            'skills.group.tooling': 'Herramientas',
            'skills.group.architecture': 'Arquitectura',
            'contact.heading': 'Hablemos',
            'contact.body': 'Abierto a roles senior de Android y Kotlin Multiplatform, trabajo por contrato y colaboraciones interesantes. Desde Costa Rica, en horarios de EE. UU.',
            'friends.heading': 'Amigos y otros creadores',
            'friends.subheading': 'Estudios independientes de amigos míos. Cada uno es un negocio propio, sin afiliación conmigo.',
            'friends.aknght.description': 'Juegos, apps y herramientas para escritores, de un pequeño equipo que siempre ha trabajado de forma remota.',
            'friends.disclaimer': 'Compartido como cortesía: sin pago, alianza ni relación comercial. Los sitios externos se operan de forma independiente y no soy responsable de su contenido.',
            'footer.rights': 'Todos los derechos reservados.',
            'notfound.title': 'Página no encontrada',
            'notfound.body': 'La página que buscas no existe o se ha movido.',
            'notfound.cta': 'Volver al inicio',
            'frnk.meta.title': 'frnk — Toolkit cliente para Kotlin Multiplatform',
            'frnk.meta.description': 'frnk es un toolkit modular de Kotlin Multiplatform + Compose Multiplatform con UI headless, arquitectura MVI, persistencia con Room, observabilidad con PostHog + Sentry y monetización con RevenueCat — pensado para desarrolladores móviles indie y equipos pequeños.',
            'frnk.hero.logoAlt': 'Logo de frnk',
            'frnk.hero.eyebrow': 'Toolkit cliente KMP de código abierto',
            'frnk.hero.title': 'frnk',
            'frnk.hero.tagline': 'Un toolkit modular de Kotlin Multiplatform para apps móviles indie y de equipos pequeños.',
            'frnk.hero.description': 'UI headless en Compose, presentación MVI, persistencia con Room, observabilidad con PostHog + Sentry y monetización con RevenueCat — conectados con Koin para que el trabajo del día a día se enfoque en funciones, no en plomería.',
            'frnk.hero.ctaPrimary': 'Ver en GitHub',
            'frnk.about.heading': 'Por qué frnk',
            'frnk.about.body': 'frnk da a las apps indie y de equipos pequeños una base de compilación rápida, una arquitectura limpia, modularización agresiva y una capa de presentación MVI estandarizada — para que el trabajo del día a día se enfoque en funciones y lógica de negocio.',
            'frnk.features.heading': 'Qué incluye',
            'frnk.features.mvi.title': 'Motor de presentación MVI',
            'frnk.features.mvi.body': 'MviContract, MviViewModel<S, I, E> y UiText viven en core-mvi, sin dependencia de Compose. Cada pantalla nueva extiende MviViewModel y mantiene consistencia en todo el toolkit.',
            'frnk.features.ui.title': 'UI headless en Compose',
            'frnk.features.ui.body': 'Construido sobre compose-unstyled para que las apps consumidoras usen su propio design system en vez de pelear con valores por defecto rígidos.',
            'frnk.features.backends.title': 'Observabilidad con PostHog + Sentry',
            'frnk.features.backends.body': 'La analítica y el reporte de errores viven detrás de las interfaces AnalyticsTracker y CrashReporter, con implementaciones de PostHog y Sentry que se instalan en una sola llamada: frnkModules { observability(…) }.',
            'frnk.features.modularity.title': 'Módulos api / impl estrictos',
            'frnk.features.modularity.body': 'Los módulos *-api exponen sólo interfaces y DTOs; los *-impl traen las implementaciones concretas — todo cableado vía Koin e intercambiable por proyecto.',
            'frnk.features.di.title': 'Bootstrap de Koin en una llamada',
            'frnk.features.di.body': 'initializeFrnk(modules) arranca el DI con la lista explícita de módulos que pasa la app host, así que los módulos de capacidades que no pases nunca entran al grafo.',
            'frnk.features.persistence.title': 'Persistencia con Room',
            'frnk.features.persistence.body': 'Room KMP con el driver de SQLite incluido, más un key/value store con Multiplatform Settings. El toolkit posee el driver; la app host posee el esquema.',
            'frnk.features.monetization.title': 'Monetización con RevenueCat',
            'frnk.features.monetization.body': 'Interfaces de entitlements y feature gates con una implementación de RevenueCat detrás — la lógica de paywall se mantiene fuera de los módulos de features.',
            'frnk.features.ci.title': 'Releases etiquetados + ktlint pre-commit',
            'frnk.features.ci.body': 'Cada tag de release se valida contra Frnk.VERSION y se publica con las notas del CHANGELOG; el formato con ktlint se aplica en un hook de git pre-commit.',
            'frnk.stack.heading': 'Construido con',
            'frnk.status.heading': 'Estado del proyecto',
            'frnk.status.body': 'Etapa temprana / pre-1.0. Las APIs pueden cambiar entre versiones menores — la política pre-1.0 es que 0.x.0 puede romper la API mientras 0.x.y se mantiene aditivo y de bugfixes.',
            'frnk.status.changelogLink': 'Ver CHANGELOG en GitHub'
        }
    };

    /* ---------- Analytics (first-party beacon → /e → PostHog) ----------
       Each event is POSTed to /e on this site; worker.js validates it and relays
       it to PostHog server-side. No third-party script, no cookie. The only
       identifier is a random id in sessionStorage (one tab, gone when it closes);
       the visit's referrer + UTM tags are kept there too, so a click after an
       internal navigation still credits where the visit came from.
       Fire-and-forget: sendBeacon never blocks a click or a navigation. */
    var beaconBase = null;

    function initBeacon() {
        if (!window.JSON || !window.Blob || !window.URLSearchParams) return;
        var vid;
        try { vid = sessionStorage.getItem('jd_vid'); } catch (e) {}
        if (!vid) {
            vid = window.crypto && crypto.randomUUID
                ? crypto.randomUUID()
                : Date.now().toString(36) + Math.random().toString(36).slice(2);
            try { sessionStorage.setItem('jd_vid', vid); } catch (e) {}
        }

        var query = new URLSearchParams(location.search);
        var attribution = { ref: document.referrer };
        var tagged = false;
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (key) {
            if (query.get(key)) { attribution[key] = query.get(key); tagged = true; }
        });
        var internal = false;
        try { internal = new URL(document.referrer).host === location.host; } catch (e) {}
        try {
            var stored = JSON.parse(sessionStorage.getItem('jd_attr'));
            if (!tagged && internal && stored) attribution = stored;
            else sessionStorage.setItem('jd_attr', JSON.stringify(attribution));
        } catch (e) {}

        beaconBase = { vid: vid, url: location.href };
        for (var key in attribution) beaconBase[key] = attribution[key];
        // 404.html marks itself so a missing path doesn't read as a real page view.
        if (document.documentElement.getAttribute('data-page') === '404') beaconBase.nf = true;
    }

    function logEvent(name, params) {
        if (!beaconBase) return;
        var payload = { e: name, lang: document.documentElement.getAttribute('lang') };
        var key;
        for (key in beaconBase) payload[key] = beaconBase[key];
        for (key in params) payload[key] = params[key];
        var body = JSON.stringify(payload);
        try {
            // text/plain keeps it a simple request; worker.js parses the body whatever its type.
            if (navigator.sendBeacon && navigator.sendBeacon('/e', new Blob([body], { type: 'text/plain' }))) return;
            if (window.fetch) fetch('/e', { method: 'POST', body: body, keepalive: true }).catch(function () {});
        } catch (e) {}
    }

    /* ---------- Helpers ---------- */
    function $(sel, root) { return (root || document).querySelector(sel); }
    function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

    /* ---------- i18n ---------- */
    function loadDict(lang) {
        // Sub-pages set <html data-i18n-base="../"> so the same script can find
        // i18n/*.json from any nesting level. Root pages leave it unset.
        var base = document.documentElement.getAttribute('data-i18n-base') || '';
        return fetch(base + 'i18n/' + lang + '.json', { cache: 'no-cache' })
            .then(function (res) {
                if (!res.ok) throw new Error('fetch failed: ' + res.status);
                return res.json();
            })
            .catch(function () { return FALLBACK[lang] || FALLBACK.en; });
    }

    function applyDict(dict) {
        $$('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (dict[key] != null) el.textContent = dict[key];
        });

        $$('[data-i18n-attr]').forEach(function (el) {
            el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
                var parts = pair.split(':');
                if (parts.length !== 2) return;
                var attr = parts[0].trim();
                var key  = parts[1].trim();
                if (dict[key] != null) el.setAttribute(attr, dict[key]);
            });
        });
    }

    function setLang(lang) {
        document.documentElement.setAttribute('lang', lang);
        try { localStorage.setItem('lang', lang); } catch (e) {}
        var label = $('#lang-toggle-label');
        // Show the language the button will switch *to*, not the current one.
        if (label) label.textContent = lang === 'es' ? 'EN' : 'ES';
        loadDict(lang).then(applyDict);
    }

    /* ---------- Theme ---------- */
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem('theme', theme); } catch (e) {}
        var meta = document.querySelector('meta[name="theme-color"]:not([media])') ||
                   document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#0e1116' : '#fafaf7');
    }

    /* ---------- Boot ---------- */
    document.addEventListener('DOMContentLoaded', function () {
        // Initial language (the inline head script already set <html lang>)
        var lang = document.documentElement.getAttribute('lang') || 'en';
        if (lang !== 'en' && lang !== 'es') lang = 'en';
        setLang(lang);

        // Page view, once the language is known (the beacon records it).
        initBeacon();
        logEvent('pageview', {});

        // Theme toggle
        var themeBtn = $('#theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', function () {
                var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
                var next = current === 'dark' ? 'light' : 'dark';
                setTheme(next);
                logEvent('theme_toggle', { theme: next });
            });
        }

        // Language toggle
        var langBtn = $('#lang-toggle');
        if (langBtn) {
            langBtn.addEventListener('click', function () {
                var current = document.documentElement.getAttribute('lang') === 'es' ? 'es' : 'en';
                var next = current === 'es' ? 'en' : 'es';
                setLang(next);
                logEvent('lang_toggle', { language: next });
            });
        }

        // Mobile nav toggle
        var navToggle = $('#nav-toggle');
        var navMenu   = $('#nav-menu');
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', function () {
                var open = navMenu.classList.toggle('is-open');
                navToggle.setAttribute('aria-expanded', String(open));
                logEvent('mobile_nav_toggle', { action: open ? 'open' : 'close' });
            });
            // Close menu when tapping a link on mobile
            navMenu.addEventListener('click', function (e) {
                if (e.target.tagName === 'A' && navMenu.classList.contains('is-open')) {
                    navMenu.classList.remove('is-open');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Header shadow on scroll
        var header = $('.site-header');
        if (header) {
            var onScroll = function () {
                header.classList.toggle('is-scrolled', window.scrollY > 8);
            };
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        }

        // Footer year
        var yearEl = $('#footer-year');
        if (yearEl) yearEl.textContent = String(new Date().getFullYear());

        // ---------- Analytics: link tracking ----------

        // Resume downloads (root uses "resume/jd.pdf"; sub-pages use "../resume/jd.pdf" or "/resume/jd.pdf")
        $$('a[href$="resume/jd.pdf"]').forEach(function (link) {
            link.addEventListener('click', function () {
                logEvent('file_download', {
                    file_name: 'jd.pdf',
                    file_extension: 'pdf',
                    link_location: link.closest('nav') ? 'nav' : 'hero'
                });
            });
        });

        // Section navigation (root uses "#about"; sub-pages use "/#about")
        $$('.nav-menu a').forEach(function (link) {
            var href = link.getAttribute('href') || '';
            var hashIdx = href.indexOf('#');
            if (hashIdx < 0) return;
            link.addEventListener('click', function () {
                logEvent('select_content', {
                    content_type: 'nav_section',
                    content_id: href.substring(hashIdx + 1)
                });
            });
        });

        // Contact links
        $$('.contact-link').forEach(function (link) {
            link.addEventListener('click', function () {
                var href = link.getAttribute('href') || '';
                var type = href.indexOf('mailto:') === 0 ? 'email'
                         : href.indexOf('linkedin') > -1 ? 'linkedin'
                         : href.indexOf('github') > -1   ? 'github'
                         : 'other';
                logEvent('select_content', {
                    content_type: 'contact_link',
                    content_id: type
                });
            });
        });

        // Friends section — outbound links to independent studios.
        $$('.friend-link').forEach(function (link) {
            link.addEventListener('click', function () {
                logEvent('select_content', {
                    content_type: 'friend_link',
                    content_id: link.getAttribute('data-friend') || 'unknown'
                });
            });
        });

        // Project card outbound links — unified under one content_type so
        // they group in PostHog. content_id is "<target>_<project>", with the
        // project slug read from the enclosing card's title.
        function projectSlug(el) {
            var card = el.closest('.project-card');
            var title = card && card.querySelector('.project-title');
            return title ? title.textContent.trim().toLowerCase() : 'unknown';
        }

        function trackProjectLinks(selector, target) {
            $$(selector).forEach(function (link) {
                link.addEventListener('click', function () {
                    logEvent('select_content', {
                        content_type: 'project_link',
                        content_id: target + '_' + projectSlug(link)
                    });
                });
            });
        }

        trackProjectLinks('.store-btn--play', 'google_play');
        trackProjectLinks('.store-btn--apple:not(.is-disabled)', 'app_store');
        trackProjectLinks('.store-btn--github', 'github');
        trackProjectLinks('.store-btn--site', 'landing');

        // Experience download badges → the employer app's Play listing.
        // content_id is the company slug read from the enclosing card.
        $$('.timeline-app').forEach(function (link) {
            link.addEventListener('click', function () {
                var company = link.closest('.timeline-card') && link.closest('.timeline-card').querySelector('.timeline-company');
                logEvent('select_content', {
                    content_type: 'experience_app',
                    content_id: company ? company.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'unknown'
                });
            });
        });
    });
})();
