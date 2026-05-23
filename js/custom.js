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
            'meta.title': 'JD Garita · Sr Mobile Engineer',
            'meta.description': 'Senior mobile engineer with 10+ years of experience building Android and Kotlin Multiplatform apps.',
            'a11y.themeToggle': 'Toggle light / dark theme',
            'a11y.langToggle': 'Switch language',
            'a11y.menuToggle': 'Toggle navigation menu',
            'a11y.frnkLanding': 'frnk landing page',
            'a11y.frnkSource': 'frnk source on GitHub',
            'a11y.frnkViewSource': 'View frnk on GitHub',
            'a11y.frnkChangelog': 'View frnk changelog on GitHub',
            'nav.about': 'About',
            'nav.experience': 'Experience',
            'nav.projects': 'Projects',
            'nav.skills': 'Skills',
            'nav.contact': 'Contact',
            'nav.resume': 'Résumé',
            'hero.eyebrow': 'Senior Mobile Engineer',
            'hero.title': 'Juan Diego Garita',
            'hero.tagline': 'I build polished, reliable mobile apps with Kotlin Multiplatform.',
            'hero.description': '10+ years shipping production mobile apps for startups and large companies across ads and authentication.',
            'hero.ctaPrimary': 'Download résumé',
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
            'experience.role1.bullet1': 'Drive the Experimentation team, running A/B tests and UI/UX experiments to optimize user engagement and flows across the mobile apps.',
            'experience.role1.bullet2': 'Build cross-platform capabilities, adapting to iOS constraints to ensure feature parity and smooth experiment rollouts.',
            'experience.role2.company': 'Swiftly',
            'experience.role2.role': 'Senior Kotlin Multiplatform Engineer',
            'experience.role2.dates': '2022 — 2026',
            'experience.role2.bullet1': 'Designed a reusable Ads component inside a Kotlin Multiplatform "App Factory", enabling fast rollout of consistent monetization across multiple white-label client apps.',
            'experience.role2.bullet2': 'Integrated the Xandr Mobile SDK into the shared KMP architecture for seamless ad delivery and inventory management.',
            'experience.role2.bullet3': 'Delivered comprehensive monetization across multiple client apps — video ads, interstitials, and banner formats.',
            'experience.role3.company': 'Mode',
            'experience.role3.role': 'Senior Android Developer',
            'experience.role3.dates': '2021 — 2022',
            'experience.role3.bullet1': 'Built features designed to incentivize and grow daily active users on the application.',
            'experience.role3.bullet2': 'Implemented a robust surveys feature that integrated multiple third-party survey providers.',
            'experience.role3.bullet3': 'Authored architecture documentation, partnered with Product on A/B-tested features, and orchestrated releases across teams.',
            'experience.role4.company': 'Trusona',
            'experience.role4.role': 'Android Developer',
            'experience.role4.dates': '2017 — 2021',
            'experience.role4.bullet1': 'Designed and built the Trusona SDK for Android, enabling third-party apps to adopt the Trusona authentication system.',
            'experience.role4.bullet2': 'Designed and developed the official Trusona app for Android.',
            'experience.role4.bullet3': 'Engineered features and automated release pipelines with Kotlin, Java, TDD, and Fastlane in a Kanban workflow.',
            'projects.heading': 'Personal Projects',
            'projects.subheading': '',
            'projects.frnk.tagline': 'Open-source KMP toolkit',
            'projects.frnk.description': 'A modular Kotlin Multiplatform foundation with headless UI, pluggable backends, and MVI architecture — built to accelerate indie app development. Open-source on GitHub.',
            'projects.still.tagline': 'Food Expiry Tracker',
            'projects.still.description': "Track what's in your fridge and pantry, get timely reminders before food expires, and cut down on waste.",
            'projects.store.getItOn': 'Get it on',
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
            'contact.emailLabel': 'Email',
            'contact.linkedinLabel': 'LinkedIn',
            'contact.githubLabel': 'GitHub',
            'footer.rights': 'All rights reserved.',
            'frnk.meta.title': 'frnk — Kotlin Multiplatform client toolkit',
            'frnk.meta.description': 'frnk is a modular Kotlin Multiplatform + Compose Multiplatform toolkit with headless UI, pluggable Supabase and Firebase backends, MVI architecture, SQLDelight persistence, and RevenueCat monetization — built for indie and small-team mobile devs.',
            'frnk.hero.logoAlt': 'frnk logo',
            'frnk.hero.eyebrow': 'Open-source KMP client toolkit',
            'frnk.hero.statusChip': 'v0.1.0 · pre-1.0',
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
            'meta.title': 'JD Garita · Ingeniero Móvil Senior',
            'meta.description': 'Ingeniero móvil senior con más de 10 años de experiencia construyendo apps Android y Kotlin Multiplatform.',
            'a11y.themeToggle': 'Cambiar tema claro / oscuro',
            'a11y.langToggle': 'Cambiar idioma',
            'a11y.menuToggle': 'Abrir menú de navegación',
            'a11y.frnkLanding': 'Landing page de frnk',
            'a11y.frnkSource': 'Código fuente de frnk en GitHub',
            'a11y.frnkViewSource': 'Ver frnk en GitHub',
            'a11y.frnkChangelog': 'Ver el changelog de frnk en GitHub',
            'nav.about': 'Sobre Mí',
            'nav.experience': 'Experiencia',
            'nav.projects': 'Proyectos',
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
            'experience.role1.bullet1': 'Lidero el equipo de Experimentación, ejecutando A/B tests y experimentos de UI/UX para optimizar el engagement y los flujos en las apps móviles.',
            'experience.role1.bullet2': 'Desarrollo capacidades multiplataforma, adaptándome a las restricciones de iOS para asegurar paridad de funciones y despliegues de experimentos sin fricciones.',
            'experience.role2.company': 'Swiftly',
            'experience.role2.role': 'Ingeniero Senior de Kotlin Multiplatform',
            'experience.role2.dates': '2022 — 2026',
            'experience.role2.bullet1': 'Diseñé un componente de anuncios reutilizable dentro de un "App Factory" de Kotlin Multiplatform, permitiendo lanzar de forma rápida funciones de monetización consistentes en múltiples apps white-label.',
            'experience.role2.bullet2': 'Integré el SDK móvil de Xandr en la arquitectura KMP compartida para una entrega de anuncios e inventario sin fricciones.',
            'experience.role2.bullet3': 'Entregué funciones de monetización integrales en múltiples apps cliente — video ads, interstitials y banners.',
            'experience.role3.company': 'Mode',
            'experience.role3.role': 'Desarrollador Android Senior',
            'experience.role3.dates': '2021 — 2022',
            'experience.role3.bullet1': 'Desarrollé funciones diseñadas para incentivar y aumentar los usuarios activos diarios de la aplicación.',
            'experience.role3.bullet2': 'Implementé una robusta función de encuestas que integró múltiples proveedores de encuestas de terceros.',
            'experience.role3.bullet3': 'Redacté documentación de arquitectura, colaboré con Producto en funciones validadas con A/B testing y coordiné releases entre equipos.',
            'experience.role4.company': 'Trusona',
            'experience.role4.role': 'Desarrollador Android',
            'experience.role4.dates': '2017 — 2021',
            'experience.role4.bullet1': 'Diseñé y construí el SDK de Trusona para Android, permitiendo a apps de terceros adoptar el sistema de autenticación de Trusona.',
            'experience.role4.bullet2': 'Diseñé y desarrollé la app oficial de Trusona para Android.',
            'experience.role4.bullet3': 'Desarrollé funciones y automaticé pipelines de publicación con Kotlin, Java, TDD y Fastlane en un flujo Kanban.',
            'projects.heading': 'Proyectos Personales',
            'projects.subheading': '',
            'projects.frnk.tagline': 'Toolkit KMP de código abierto',
            'projects.frnk.description': 'Una base modular para Kotlin Multiplatform con UI headless, backends intercambiables y arquitectura MVI — pensada para acelerar el desarrollo de apps indie. Código abierto en GitHub.',
            'projects.still.tagline': 'Rastreador de caducidad de alimentos',
            'projects.still.description': 'Lleva el control de lo que hay en tu refri y alacena, recibe recordatorios antes de que los alimentos caduquen y reduce el desperdicio.',
            'projects.store.getItOn': 'Disponible en',
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
            'contact.emailLabel': 'Correo',
            'contact.linkedinLabel': 'LinkedIn',
            'contact.githubLabel': 'GitHub',
            'footer.rights': 'Todos los derechos reservados.',
            'frnk.meta.title': 'frnk — Toolkit cliente para Kotlin Multiplatform',
            'frnk.meta.description': 'frnk es un toolkit modular de Kotlin Multiplatform + Compose Multiplatform con UI headless, backends intercambiables de Supabase y Firebase, arquitectura MVI, persistencia con SQLDelight y monetización con RevenueCat — pensado para desarrolladores móviles indie y equipos pequeños.',
            'frnk.hero.logoAlt': 'Logo de frnk',
            'frnk.hero.eyebrow': 'Toolkit cliente KMP de código abierto',
            'frnk.hero.statusChip': 'v0.1.0 · pre-1.0',
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

    /* ---------- Firebase Analytics ---------- */
    var analytics = null;
    function logEvent(name, params) {
        if (analytics) { try { analytics.logEvent(name, params); } catch (e) {} }
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
        // Firebase init (deferred SDK scripts have executed by now)
        if (typeof firebase !== 'undefined' && firebase.initializeApp) {
            try {
                firebase.initializeApp({
                    apiKey: 'AIzaSyB4OruGxSx4X-AV9OOcwRULNcharw6kNuw',
                    authDomain: 'jdgarita-site.firebaseapp.com',
                    projectId: 'jdgarita-site',
                    storageBucket: 'jdgarita-site.firebasestorage.app',
                    messagingSenderId: '319136318898',
                    appId: '1:319136318898:web:88b2842ffefa0e20c250ab',
                    measurementId: 'G-NYVB5C810D'
                });
                analytics = firebase.analytics();
            } catch (e) {}
        }

        // Initial language (the inline head script already set <html lang>)
        var lang = document.documentElement.getAttribute('lang') || 'en';
        if (lang !== 'en' && lang !== 'es') lang = 'en';
        setLang(lang);

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
        // they group in GA4. content_id still distinguishes each target.
        $$('.store-btn--play').forEach(function (link) {
            link.addEventListener('click', function () {
                logEvent('select_content', {
                    content_type: 'project_link',
                    content_id: 'google_play_still'
                });
            });
        });

        $$('.store-btn--github').forEach(function (link) {
            link.addEventListener('click', function () {
                logEvent('select_content', {
                    content_type: 'project_link',
                    content_id: 'github_frnk'
                });
            });
        });

        $$('.store-btn--site').forEach(function (link) {
            link.addEventListener('click', function () {
                logEvent('select_content', {
                    content_type: 'project_link',
                    content_id: 'landing_frnk'
                });
            });
        });
    });
})();
