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
            'meta.title': 'Juan Diego Garita · Indie Mobile Developer & Kotlin Multiplatform Specialist',
            'meta.description': 'Indie mobile developer and Kotlin Multiplatform specialist building Faint and Still, plus the open-source frnk toolkit. 10+ years of senior Android experience.',
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
            'a11y.techStack': 'Tech stack',
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
            'hero.description': '10+ years shipping production mobile apps for startups and large companies across ads and authentication.',
            'hero.ctaPrimary': 'Download resume',
            'hero.ctaSecondary': 'Get in touch',
            'about.heading': 'About',
            'about.body': "I'm a Google Certified Associate Android Developer in Kotlin with 10+ years of experience writing clean, well-tested code for startups and large companies. I focus on Kotlin Multiplatform, Jetpack Compose and modern Android, and I care deeply about craftsmanship, collaboration and continuous improvement.",
            'about.highlight1': 'Google Certified Associate Android Developer (Kotlin)',
            'about.highlight2': 'Kotlin Multiplatform and Jetpack Compose specialist',
            'about.highlight3': 'Agile practitioner — Scrum, Kanban, TDD, pair programming',
            'experience.heading': 'Experience Summary',
            'experience.subheading': '',
            'experience.role1.company': 'Experian',
            'experience.role1.role': 'Senior Android Engineer',
            'experience.role1.dates': '2026 — Present',
            'experience.role1.reach': 'Experian® app · 10M+ downloads on Google Play',
            'experience.role1.bullet1': 'Drive the mobile Experimentation team, shipping A/B tests and UI/UX experiments that tune engagement and key user flows across the apps.',
            'experience.role1.bullet2': 'Build cross-platform experiment capabilities that work within iOS constraints, keeping Android and iOS at feature parity for smooth rollouts.',
            'experience.role2.company': 'Swiftly',
            'experience.role2.role': 'Senior Kotlin Multiplatform Engineer',
            'experience.role2.dates': '2022 — 2026',
            'experience.role2.bullet1': 'Helped build a Kotlin Multiplatform "App Factory" that streamlines shipping client apps to both Android and iOS.',
            'experience.role2.bullet2': 'Designed and built a reusable ads component powered by the Xandr Mobile SDK — one integration, reused across client apps.',
            'experience.role2.bullet3': 'Shipped end-to-end monetization — video, interstitial, and banner ads — across multiple client apps.',
            'experience.role3.company': 'Mode',
            'experience.role3.role': 'Senior Android Developer',
            'experience.role3.dates': '2021 — 2022',
            'experience.role3.reach': 'Mode app · 50M+ downloads on Google Play',
            'experience.role3.bullet1': 'Built engagement features designed to bring users back every day and grow daily active users.',
            'experience.role3.bullet2': 'Shipped a robust surveys feature that brought multiple third-party survey providers into a single experience.',
            'experience.role3.bullet3': 'Wrote the architecture docs, validated features with Product through A/B tests, and orchestrated cross-team releases.',
            'experience.role4.company': 'Trusona',
            'experience.role4.role': 'Android Developer',
            'experience.role4.dates': '2017 — 2021',
            'experience.role4.reach': 'Trusona app · 10K+ downloads on Google Play',
            'experience.role4.bullet1': 'Designed and built the Trusona Android SDK, letting third-party apps adopt Trusona\'s authentication system.',
            'experience.role4.bullet2': 'Designed and built Trusona\'s official Android app.',
            'experience.role4.bullet3': 'Automated release pipelines with Fastlane and shipped features in Kotlin and Java, test-first with TDD, in a Kanban flow.',
            'apps.heading': 'Indie Apps',
            'apps.subheading': 'Focused, production-ready cross-platform mobile apps built and maintained independently.',
            'openSource.heading': 'Open Source & Tooling',
            'openSource.subheading': 'Reusable architectural frameworks, templates, and libraries created to speed up modern mobile development.',
            'projects.frnk.tagline': 'Modular Kotlin Multiplatform Toolkit',
            'projects.frnk.description': 'An opinionated, production-grade architectural foundation for Kotlin Multiplatform apps. Features headless UI contracts, pluggable backends, and strict MVI pattern implementations to launch new mobile products in days.',
            'projects.still.tagline': 'Smart Food Freshness & Waste Tracker',
            'projects.still.description': 'Keep track of fridge and pantry contents with predictive shelf-life tracking and proactive reminders before food expires.',
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
            'contact.body': 'Open to senior Android and Kotlin Multiplatform roles, contract work and interesting collaborations.',
            'footer.rights': 'All rights reserved.',
            'notfound.title': 'Page not found',
            'notfound.body': "The page you're looking for doesn't exist or has moved.",
            'notfound.cta': 'Back to home',
            'frnk.meta.title': 'frnk — Kotlin Multiplatform client toolkit',
            'frnk.meta.description': 'frnk is a modular Kotlin Multiplatform + Compose Multiplatform toolkit with headless UI, pluggable Supabase and Firebase backends, MVI architecture, SQLDelight persistence, and RevenueCat monetization — built for indie and small-team mobile devs.',
            'frnk.hero.logoAlt': 'frnk logo',
            'frnk.hero.eyebrow': 'Open-source KMP client toolkit',
            'frnk.hero.title': 'frnk',
            'frnk.hero.tagline': 'A modular Kotlin Multiplatform toolkit for indie and small-team mobile apps.',
            'frnk.hero.description': 'Headless Compose UI, pluggable Supabase + Firebase backends, MVI presentation, SQLDelight persistence, and RevenueCat monetization — wired together via Koin so day-to-day work stays on features, not plumbing.',
            'frnk.hero.ctaPrimary': 'View on GitHub',
            'frnk.about.heading': 'Why frnk',
            'frnk.about.body': 'frnk gives indie / small-team apps a fast-compiling foundation with a clean architecture, aggressive modularization, and a standardized MVI presentation layer — so the day-to-day work stays on features and business logic.',
            'frnk.features.heading': 'What it ships',
            'frnk.features.mvi.title': 'MVI presentation engine',
            'frnk.features.mvi.body': 'MviContract, MviViewModel<S, A, E>, and ObserveAsEvents ship in shared-ui-atoms. New screens subclass MviViewModel and stay consistent across the toolkit.',
            'frnk.features.ui.title': 'Headless Compose UI',
            'frnk.features.ui.body': 'Built on compose-unstyled so consuming apps bring their own design system instead of fighting opinionated defaults.',
            'frnk.features.backends.title': 'Pluggable backends',
            'frnk.features.backends.body': 'Supabase and Firebase implementations sit behind capability interfaces. Pick one at runtime via BackendChoice without touching feature code.',
            'frnk.features.modularity.title': 'Strict api / impl modules',
            'frnk.features.modularity.body': '*-api modules expose only interfaces and DTOs; *-impl modules carry the concrete bindings — wired via Koin and swappable per project.',
            'frnk.features.di.title': 'One-shot Koin bootstrap',
            'frnk.features.di.body': 'frnkModules(BackendChoice) and initializeFrnk() set up DI in one call so host apps stand up the toolkit in their Application class.',
            'frnk.features.persistence.title': 'SQLDelight persistence',
            'frnk.features.persistence.body': 'Multiplatform driver factory and Multiplatform Settings key/value store. The toolkit owns the driver; your host app owns the schema.',
            'frnk.features.monetization.title': 'RevenueCat monetization',
            'frnk.features.monetization.body': 'Entitlement and feature-gate interfaces with a RevenueCat implementation behind them — paywall logic stays out of feature modules.',
            'frnk.features.ci.title': 'Fast CI + pre-commit ktlint',
            'frnk.features.ci.body': 'A single CI job runs compileAndroidMain and testDebugUnitTest; ktlint formatting is enforced via an auto-installed git pre-commit hook.',
            'frnk.stack.heading': 'Built with',
            'frnk.status.heading': 'Project status',
            'frnk.status.body': 'Early / pre-1.0. APIs may shift between minor versions — pre-1.0 policy is that 0.x.0 may break API while 0.x.y stays additive and fix-only.',
            'frnk.status.changelogLink': 'View CHANGELOG on GitHub'
        },
        es: {
            'meta.title': 'Juan Diego Garita · Desarrollador Móvil Indie y Especialista en Kotlin Multiplatform',
            'meta.description': 'Desarrollador móvil indie y especialista en Kotlin Multiplatform, creador de Faint y Still y del toolkit de código abierto frnk. Más de 10 años de experiencia senior en Android.',
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
            'a11y.techStack': 'Stack tecnológico',
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
            'hero.description': 'Más de 10 años lanzando apps móviles en producción para startups y grandes empresas en publicidad y autenticación.',
            'hero.ctaPrimary': 'Descargar currículum',
            'hero.ctaSecondary': 'Contáctame',
            'about.heading': 'Sobre Mí',
            'about.body': 'Soy un Google Certified Associate Android Developer en Kotlin con más de 10 años de experiencia escribiendo código limpio y bien probado para startups y grandes empresas. Me enfoco en Kotlin Multiplatform, Jetpack Compose y Android moderno, y me apasionan el buen oficio, la colaboración y la mejora continua.',
            'about.highlight1': 'Google Certified Associate Android Developer (Kotlin)',
            'about.highlight2': 'Especialista en Kotlin Multiplatform y Jetpack Compose',
            'about.highlight3': 'Prácticas ágiles — Scrum, Kanban, TDD, pair programming',
            'experience.heading': 'Resumen de Experiencia',
            'experience.subheading': '',
            'experience.role1.company': 'Experian',
            'experience.role1.role': 'Ingeniero Android Senior',
            'experience.role1.dates': '2026 — Presente',
            'experience.role1.reach': 'App de Experian® · más de 10M de descargas en Google Play',
            'experience.role1.bullet1': 'Impulso el equipo de Experimentación móvil, lanzando pruebas A/B y experimentos de UI/UX que afinan la interacción y los flujos clave de las apps.',
            'experience.role1.bullet2': 'Construyo capacidades de experimentación multiplataforma que respetan las restricciones de iOS, manteniendo la paridad entre Android e iOS para lanzamientos sin fricciones.',
            'experience.role2.company': 'Swiftly',
            'experience.role2.role': 'Ingeniero Senior de Kotlin Multiplatform',
            'experience.role2.dates': '2022 — 2026',
            'experience.role2.bullet1': 'Ayudé a construir un "App Factory" en Kotlin Multiplatform que agiliza el lanzamiento de apps cliente en Android e iOS.',
            'experience.role2.bullet2': 'Diseñé y construí un componente de anuncios reutilizable basado en el SDK móvil de Xandr — una sola integración, reutilizada en las apps cliente.',
            'experience.role2.bullet3': 'Entregué monetización de punta a punta — anuncios de video, intersticiales y banners — en múltiples apps cliente.',
            'experience.role3.company': 'Mode',
            'experience.role3.role': 'Desarrollador Android Senior',
            'experience.role3.dates': '2021 — 2022',
            'experience.role3.reach': 'App de Mode · más de 50M de descargas en Google Play',
            'experience.role3.bullet1': 'Construí funciones de engagement pensadas para que los usuarios volvieran cada día y aumentaran los usuarios activos diarios.',
            'experience.role3.bullet2': 'Lancé una robusta función de encuestas que reunió a múltiples proveedores de encuestas de terceros en una sola experiencia.',
            'experience.role3.bullet3': 'Redacté la documentación de arquitectura, validé funciones con Producto mediante pruebas A/B y coordiné lanzamientos entre equipos.',
            'experience.role4.company': 'Trusona',
            'experience.role4.role': 'Desarrollador Android',
            'experience.role4.dates': '2017 — 2021',
            'experience.role4.reach': 'App de Trusona · más de 10K descargas en Google Play',
            'experience.role4.bullet1': 'Diseñé y construí el SDK de Trusona para Android, permitiendo a apps de terceros adoptar el sistema de autenticación de Trusona.',
            'experience.role4.bullet2': 'Diseñé y construí la app oficial de Trusona para Android.',
            'experience.role4.bullet3': 'Automaticé pipelines de publicación con Fastlane y desarrollé funciones en Kotlin y Java, guiadas por TDD, en un flujo Kanban.',
            'apps.heading': 'Apps indie',
            'apps.subheading': 'Apps móviles multiplataforma, enfocadas y listas para producción, creadas y mantenidas de forma independiente.',
            'openSource.heading': 'Código abierto y herramientas',
            'openSource.subheading': 'Frameworks arquitectónicos, plantillas y librerías reutilizables creados para acelerar el desarrollo móvil moderno.',
            'projects.frnk.tagline': 'Toolkit modular para Kotlin Multiplatform',
            'projects.frnk.description': 'Una base arquitectónica opinada y lista para producción para apps Kotlin Multiplatform. Incluye contratos de UI headless, backends intercambiables e implementaciones estrictas del patrón MVI para lanzar nuevos productos móviles en días.',
            'projects.still.tagline': 'Control inteligente de frescura y desperdicio de alimentos',
            'projects.still.description': 'Lleva el control de lo que hay en tu refri y alacena con seguimiento predictivo de vida útil y recordatorios proactivos antes de que los alimentos caduquen.',
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
            'contact.body': 'Abierto a roles senior de Android y Kotlin Multiplatform, trabajo por contrato y colaboraciones interesantes.',
            'footer.rights': 'Todos los derechos reservados.',
            'notfound.title': 'Página no encontrada',
            'notfound.body': 'La página que buscas no existe o se ha movido.',
            'notfound.cta': 'Volver al inicio',
            'frnk.meta.title': 'frnk — Toolkit cliente para Kotlin Multiplatform',
            'frnk.meta.description': 'frnk es un toolkit modular de Kotlin Multiplatform + Compose Multiplatform con UI headless, backends intercambiables de Supabase y Firebase, arquitectura MVI, persistencia con SQLDelight y monetización con RevenueCat — pensado para desarrolladores móviles indie y equipos pequeños.',
            'frnk.hero.logoAlt': 'Logo de frnk',
            'frnk.hero.eyebrow': 'Toolkit cliente KMP de código abierto',
            'frnk.hero.title': 'frnk',
            'frnk.hero.tagline': 'Un toolkit modular de Kotlin Multiplatform para apps móviles indie y de equipos pequeños.',
            'frnk.hero.description': 'UI headless en Compose, backends intercambiables (Supabase + Firebase), presentación MVI, persistencia con SQLDelight y monetización con RevenueCat — conectados con Koin para que el trabajo del día a día se enfoque en funciones, no en plomería.',
            'frnk.hero.ctaPrimary': 'Ver en GitHub',
            'frnk.about.heading': 'Por qué frnk',
            'frnk.about.body': 'frnk da a las apps indie y de equipos pequeños una base de compilación rápida, una arquitectura limpia, modularización agresiva y una capa de presentación MVI estandarizada — para que el trabajo del día a día se enfoque en funciones y lógica de negocio.',
            'frnk.features.heading': 'Qué incluye',
            'frnk.features.mvi.title': 'Motor de presentación MVI',
            'frnk.features.mvi.body': 'MviContract, MviViewModel<S, A, E> y ObserveAsEvents viven en shared-ui-atoms. Cada pantalla nueva extiende MviViewModel y mantiene consistencia en todo el toolkit.',
            'frnk.features.ui.title': 'UI headless en Compose',
            'frnk.features.ui.body': 'Construido sobre compose-unstyled para que las apps consumidoras usen su propio design system en vez de pelear con valores por defecto rígidos.',
            'frnk.features.backends.title': 'Backends intercambiables',
            'frnk.features.backends.body': 'Implementaciones de Supabase y Firebase detrás de interfaces de capacidades. Elige una en tiempo de ejecución con BackendChoice sin tocar el código de las features.',
            'frnk.features.modularity.title': 'Módulos api / impl estrictos',
            'frnk.features.modularity.body': 'Los módulos *-api exponen sólo interfaces y DTOs; los *-impl traen las implementaciones concretas — todo cableado vía Koin e intercambiable por proyecto.',
            'frnk.features.di.title': 'Bootstrap de Koin de un solo paso',
            'frnk.features.di.body': 'frnkModules(BackendChoice) e initializeFrnk() montan el DI en una sola llamada para que la app host levante el toolkit en su Application.',
            'frnk.features.persistence.title': 'Persistencia con SQLDelight',
            'frnk.features.persistence.body': 'Driver factory multiplataforma y key/value store con Multiplatform Settings. El toolkit posee el driver; la app host posee el esquema.',
            'frnk.features.monetization.title': 'Monetización con RevenueCat',
            'frnk.features.monetization.body': 'Interfaces de entitlements y feature gates con una implementación de RevenueCat detrás — la lógica de paywall se mantiene fuera de los módulos de features.',
            'frnk.features.ci.title': 'CI rápido + ktlint pre-commit',
            'frnk.features.ci.body': 'Un único job de CI corre compileAndroidMain y testDebugUnitTest; el formato con ktlint se aplica mediante un hook de git pre-commit auto-instalado.',
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

        // Project card outbound links — unified under one content_type so
        // they group in GA4. content_id is "<target>_<project>", with the
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
