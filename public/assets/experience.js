(() => {
  'use strict';

  const root = document.documentElement;
  const preferenceKey = 'avante-theme';
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const revealed = new WeakSet();
  let choice = null;
  let listeners = null;
  let motion = null;
  let smoothScroll = null;
  let ticker = null;
  let scrollSync = null;
  let mounted = false;
  let generation = 0;

  function readPreference() {
    try {
      const value = localStorage.getItem(preferenceKey);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      // A blocked storage API must not prevent the current-session choice.
      return choice;
    }
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const label = theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro';
    document.querySelectorAll('.theme-toggle').forEach(button => {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
      const text = button.querySelector('.sr-only');
      if (text) text.textContent = label;
    });
  }

  function resolveTheme() {
    return choice || (systemTheme.matches ? 'dark' : 'light');
  }

  function mountTheme(signal) {
    if (root.hasAttribute('data-react-theme')) return;
    choice = readPreference();
    applyTheme(resolveTheme());
    document.querySelectorAll('.theme-toggle').forEach(button => {
      button.addEventListener('click', () => {
        choice = root.dataset.theme === 'dark' ? 'light' : 'dark';
        // Change the rendered theme in the same task, without an intermediate palette.
        applyTheme(choice);
        try { localStorage.setItem(preferenceKey, choice); } catch { /* Session-only fallback. */ }
      }, {signal});
    });
    systemTheme.addEventListener('change', () => {
      if (choice === null) applyTheme(resolveTheme());
    }, {signal});
    window.addEventListener('storage', event => {
      if (event.key !== preferenceKey && event.key !== null) return;
      try { if (event.storageArea && event.storageArea !== localStorage) return; } catch { return; }
      choice = readPreference();
      applyTheme(resolveTheme());
    }, {signal});
  }

  function mountMotion(signal, currentGeneration) {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) {
      root.dataset.motion = 'static';
      return;
    }

    try {
      gsap.registerPlugin(ScrollTrigger);
      motion = gsap.matchMedia();
      motion.add({
        reduce: '(prefers-reduced-motion: reduce)',
        animate: '(prefers-reduced-motion: no-preference)'
      }, context => {
        if (context.conditions.reduce) {
          root.dataset.motion = 'reduced';
          return;
        }
        root.dataset.motion = 'gsap';

        // Native touch remains native; smooth wheel scrolling shares GSAP's
        // frame clock so ScrollTrigger never measures a different scroll frame.
        if (window.Lenis && !smoothScroll) {
          smoothScroll = new window.Lenis({ autoRaf: false, smoothWheel: true, syncTouch: false, lerp: 0.11, wheelMultiplier: 0.92 });
          scrollSync = () => ScrollTrigger.update();
          ticker = time => smoothScroll?.raf(time * 1000);
          smoothScroll.on('scroll', scrollSync);
          gsap.ticker.add(ticker);
          gsap.ticker.lagSmoothing(0);
          window.__avanteLenis = smoothScroll;
          root.dataset.lenis = 'active';
        }

        // Register callback-created tweens with this context so a media change or
        // pagehide reverts both pending triggers and animations already in progress.
        context.add('reveal', (elements, kind = 'text') => {
          gsap.fromTo(elements, {y: kind === 'card' ? 28 : 20, opacity: 0.82, ...(kind === 'image' ? {scale: 1.025} : {})}, {
            y: 0,
            opacity: 1,
            ...(kind === 'image' ? {scale: 1} : {}),
            duration: kind === 'image' ? 0.8 : 0.62,
            ease: 'power3.out',
            stagger: {each: kind === 'card' ? 0.11 : 0.065, from: 'start'},
            overwrite: 'auto',
            clearProps: 'transform,opacity,scale'
          });
        });
        context.add('connect', elements => {
          gsap.fromTo(elements, {scaleX: 0.14, opacity: 0.65, transformOrigin: 'left center'}, {
            scaleX: 1,
            opacity: 1,
            duration: 0.72,
            ease: 'power2.out',
            stagger: 0.11,
            clearProps: 'transform,transformOrigin,opacity'
          });
        });

        function enterOnce(container, elements, animation, kind = 'text') {
          if (!container || !elements.length || revealed.has(container)) return;
          ScrollTrigger.create({
            trigger: container,
            start: 'top 90%',
            once: true,
            onEnter: () => {
              if (revealed.has(container)) return;
              revealed.add(container);
              animation(elements, kind);
            }
          });
        }

        const connection = document.querySelector('.connection-mark');
        enterOnce(connection, [...document.querySelectorAll('.connection-mark .connection-line')], context.connect);
        let storyContext;
        const story = document.querySelector('#story-journey');
        if (story) {
          const chars = [...story.querySelectorAll('.story-char')];
          const line = story.querySelector('.story-progress span');
          const stages = [...story.querySelectorAll('.story-stage')];
          storyContext = gsap.context(() => {
            gsap.set(chars, {opacity: 0.72});
            gsap.set(stages, {opacity: 0.88});
            const timeline = gsap.timeline({scrollTrigger: {
              trigger: story, start: 'top 40%', end: 'bottom bottom',
              scrub: 0.25, invalidateOnRefresh: true
            }});
            timeline.to(chars, {opacity: 1, duration: 0.4, stagger: 0.04, ease: 'power2.inOut'}, 0);
            if (line) timeline.to(line, {scaleX: 1, duration: Math.max(1, chars.length * 0.04), ease: 'none'}, 0);
            stages.forEach((stage, index) => timeline.to(stage, {opacity: 1, duration: 0.45, ease: 'power2.out'}, index * chars.length * 0.04 / 3));
          }, story);
        }

        // The horizontal workflow is read one card at a time. Its old group
        // trigger ran offscreen cards together before the visitor reached them.
        const week = document.querySelector('#week');
        const weekView = week?.querySelector('.wk-view');
        const weekCards = [...(weekView?.querySelectorAll('.wk-day') || [])];
        const feedbackEvents = new AbortController();
        let weekVisible = false;
        context.add('revealWeekCard', card => {
          const title = card.querySelector('h3');
          const text = [...card.querySelectorAll('p')];
          const image = card.querySelector('.wk-photo');
          const tl = gsap.timeline({defaults: {ease: 'power3.out'}, overwrite: 'auto'});
          tl.fromTo(card, {y: 22, opacity: 0.86}, {y: 0, opacity: 1, duration: 0.55, clearProps: 'transform,opacity'}, 0);
          if (title) tl.fromTo(title, {y: 12, opacity: 0.86}, {y: 0, opacity: 1, duration: 0.5, clearProps: 'transform,opacity'}, 0.1);
          if (text.length) tl.fromTo(text, {y: 10, opacity: 0.86}, {y: 0, opacity: 1, duration: 0.5, stagger: 0.075, clearProps: 'transform,opacity'}, 0.15);
          if (image) tl.fromTo(image, {scale: 1.035, opacity: 0.84}, {scale: 1, opacity: 1, duration: 0.72, clearProps: 'transform,opacity'}, 0.21);
          return tl;
        });
        const revealWeekVisible = () => {
          if (!weekVisible || !weekView) return;
          const viewport = weekView.getBoundingClientRect();
          for (const card of weekCards) {
            if (revealed.has(card)) continue;
            const box = card.getBoundingClientRect();
            if (box.right <= viewport.left + 28 || box.left >= viewport.right - 28) continue;
            revealed.add(card);
            context.revealWeekCard(card);
          }
        };
        let weekObserver = null;
        if (week && weekView && weekCards.length) {
          ScrollTrigger.create({
            trigger: week,
            start: 'top 88%',
            end: 'bottom 12%',
            onEnter: () => { weekVisible = true; revealWeekVisible(); },
            onEnterBack: () => { weekVisible = true; revealWeekVisible(); },
            onLeave: () => { weekVisible = false; },
            onLeaveBack: () => { weekVisible = false; }
          });
          weekObserver = new IntersectionObserver(revealWeekVisible, {root: weekView, threshold: 0.15});
          weekCards.forEach(card => weekObserver.observe(card));
          weekView.addEventListener('scroll', revealWeekVisible, {passive: true, signal: feedbackEvents.signal});
        }

        // Feedback affects only the surface/image. It does not shift copy or
        // compete with the scroll timelines, and is disabled for reduced motion.
        context.add('feedback', (element, target, vars) => gsap.to(target || element, {
          ...vars, duration: 0.32, ease: 'power2.out', overwrite: 'auto'
        }));
        document.querySelectorAll('.m-btn,.m-btn-2,.m-iconbtn,.video-play').forEach(button => {
          button.addEventListener('pointerenter', () => context.feedback(button, button, {y: -2}), {signal: feedbackEvents.signal});
          button.addEventListener('pointerleave', () => context.feedback(button, button, {y: 0, scale: 1}), {signal: feedbackEvents.signal});
          button.addEventListener('pointerdown', () => context.feedback(button, button, {scale: 0.98, duration: 0.12}), {signal: feedbackEvents.signal});
          button.addEventListener('pointerup', () => context.feedback(button, button, {scale: 1, duration: 0.24}), {signal: feedbackEvents.signal});
        });
        weekCards.forEach(card => {
          const media = card.querySelector('.wk-photo');
          if (!media) return;
          card.addEventListener('pointerenter', () => context.feedback(card, media, {scale: 1.025}), {signal: feedbackEvents.signal});
          card.addEventListener('pointerleave', () => context.feedback(card, media, {scale: 1}), {signal: feedbackEvents.signal});
          card.addEventListener('focusin', () => context.feedback(card, media, {scale: 1.025}), {signal: feedbackEvents.signal});
          card.addEventListener('focusout', () => context.feedback(card, media, {scale: 1}), {signal: feedbackEvents.signal});
        });

        // Every section gets a restrained sequence; text never moves sideways.
        document.querySelectorAll('main > section').forEach(section => {
          const heading = [...section.querySelectorAll('h2')].filter(el => !el.closest('.wk-day') && !el.closest('#story-journey'));
          const intro = [...section.querySelectorAll(':scope > div > p, .mt-foot > p, .ds-copy > p, .co-head > p, .wk-head > p, .mb-head > p, .fq-head > p, .video-heading > p, .partners-head p, .partner-description')].filter(el => !el.closest('.wk-day'));
          if (heading.length) enterOnce(heading[0], heading, context.reveal);
          if (intro.length) enterOnce(intro[0], intro, context.reveal);
        });
        const groups = [
          ['#opening .op-photo', 'img', 'image'],
          ['#opening .op-cols', ':scope > p', 'text'],
          ['#method .mt-steps', ':scope > li', 'card'],
          ['#disciplines .ds-grid', ':scope > .ds-tile', 'card'],
          ['#coaches .co-list', ':scope > li', 'card'],
          ['#video .video-frame', ':scope > .video-play', 'image'],
          ['#lab .lb-lens', 'img', 'image'],
          ['#partners .partners-head', ':scope > *', 'text'],
          ['#stories .st-notes', ':scope > .testimonial-card', 'card'],
          ['#recovery .rc-list', ':scope > li', 'card'],
          ['#recovery .rc-sea', 'img', 'image'],
          ['#membership .mb-plans', ':scope > article', 'card'],
          ['#faq .fq-list', ':scope > details', 'card'],
          ['#contact .ct-info', ':scope > div', 'card']
        ];
        groups.forEach(([selector, children, kind]) => {
          const container = document.querySelector(selector);
          if (container) enterOnce(container, [...container.querySelectorAll(children)], context.reveal, kind);
        });
        return () => {
          storyContext?.revert();
          feedbackEvents.abort();
          weekObserver?.disconnect();
          if (ticker) gsap.ticker.remove(ticker);
          if (smoothScroll && scrollSync) smoothScroll.off('scroll', scrollSync);
          smoothScroll?.destroy();
          smoothScroll = ticker = scrollSync = null;
          window.__avanteLenis = null;
          delete root.dataset.lenis;
        };
      });

      const refresh = () => {
        if (mounted && generation === currentGeneration && motion) ScrollTrigger.refresh();
      };
      // Images have explicit dimensions; the font completion is the remaining
      // source of line-wrap changes after initial trigger measurement.
      document.fonts?.ready.then(refresh).catch(() => {});
      if (document.readyState !== 'complete') window.addEventListener('load', refresh, {once: true, signal});
    } catch {
      motion?.revert();
      motion = null;
      root.dataset.motion = 'static';
    }
  }

  function mount() {
    if (mounted) return;
    mounted = true;
    generation += 1;
    listeners = new AbortController();
    mountTheme(listeners.signal);
    mountMotion(listeners.signal, generation);
  }

  function unmount() {
    if (!mounted) return;
    mounted = false;
    generation += 1;
    listeners?.abort();
    listeners = null;
    motion?.revert();
    motion = null;
    if (ticker) window.gsap?.ticker.remove(ticker);
    if (smoothScroll && scrollSync) smoothScroll.off('scroll', scrollSync);
    smoothScroll?.destroy();
    smoothScroll = ticker = scrollSync = null;
    window.__avanteLenis = null;
    delete root.dataset.lenis;
  }

  // Keep these two lifecycle handlers for BFCache restoration. All feature
  // listeners and GSAP-owned effects are disposed on pagehide.
  window.addEventListener('pagehide', unmount);
  window.addEventListener('pageshow', event => { if (event.persisted) mount(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once: true});
  else mount();
})();
