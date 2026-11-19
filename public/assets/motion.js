
(() => {
  const stage = document.querySelector('#opening .op-s1');
  new IntersectionObserver(([entry]) => entry.isIntersecting ? stage.removeAttribute('data-paused') : stage.setAttribute('data-paused', '')).observe(stage);
})();


(() => {
const live = document.documentElement.hasAttribute('data-8b-live');
const measures = new Set();
let queued = false;
const run = fn => { try { fn(); } catch (error) { console.error('[motion-kit] measure failed', error); } };
const remeasure = () => {
if (queued) return;
queued = true;
requestAnimationFrame(() => { queued = false; measures.forEach(run); realign(); });
};
const realign = () => document.getAnimations().forEach(animation => {
if (animation.timeline && animation.timeline !== document.timeline && animation.playState === 'running') { animation.pause(); animation.play(); }
});
window.motionKit = {
live,
box(element) {
if (!(element instanceof HTMLElement)) { const r = element.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; }
let x = 0, y = 0, node = element;
while (node) { x += node.offsetLeft; y += node.offsetTop; node = node.offsetParent; }
return { x, y, w: element.offsetWidth, h: element.offsetHeight };
},
set(element, vars) { for (const [name, value] of Object.entries(vars)) element.style.setProperty(name, String(value)); },
measure(fn) { if (!live) return; measures.add(fn); run(fn); },
scene(id, fn) {
if (!live) return;
try { fn(); } catch (error) {
console.error(`[motion-kit] scene ${id} failed; its section stays static`, error);
document.querySelector(`style[data-8b-part="scene:${id}"]`)?.setAttribute('media', 'not all');
}
}
};
if (!live) { window.motionReady = Promise.resolve(); return; }
const number = () => document.querySelectorAll('[data-8b-items]').forEach(group => {
let items;
try { items = [...group.querySelectorAll(group.getAttribute('data-8b-items'))]; } catch { return; }
items.forEach((item, index) => { item.style.setProperty('--i', index); item.style.setProperty('--n', items.length); });
});
number();
measures.add(number);
requestAnimationFrame(realign);
new ResizeObserver(remeasure).observe(document.body);
document.fonts?.ready.then(remeasure);
addEventListener('load', remeasure);
window.motionReady = (document.fonts?.ready ?? Promise.resolve()).then(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
})();
(() => {
const kit = window.motionKit;
if (!kit.live || !matchMedia('(pointer: fine)').matches) return;
let target = scrollY, current = scrollY, last = 0, running = false, paused = false;
const inner = (node, dy) => {
for (; node && node !== document.body && node !== document.documentElement; node = node.parentElement) {
if (!/(auto|scroll)/.test(getComputedStyle(node).overflowY) || node.scrollHeight <= node.clientHeight) continue;
if (dy > 0 ? node.scrollTop + node.clientHeight < node.scrollHeight - 1 : node.scrollTop > 0) return true;
}
return false;
};
const step = now => {
current += (target - current) * (1 - Math.exp(-5.3 * Math.min(0.05, (now - last) / 1000)));
last = now;
if (Math.abs(target - current) < 0.5) current = target;
scrollTo({ top: current, behavior: 'instant' });
if (current !== target) requestAnimationFrame(step); else running = false;
};
addEventListener('wheel', event => {
if (paused || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || inner(event.target, event.deltaY)) return;
event.preventDefault();
if (!running) target = current = scrollY;
const unit = event.deltaMode === 1 ? 40 : event.deltaMode === 2 ? innerHeight : 1;
target = Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, target + event.deltaY * unit * 0.95));
if (!running) { running = true; last = performance.now(); requestAnimationFrame(step); }
}, { passive: false });
kit.wheel = { stop() { paused = true; }, start() { paused = false; } };
})();
(() => {
const kit = window.motionKit;
if (!kit.live) return;
const at = element => {
const own = /^(\d{1,3}(?:\.\d+)?)%$/.exec((element.getAttribute('data-8b-enter') || '').trim());
return own && +own[1] <= 100 ? own[1] / 100 : 0.88;
};
let pending = [...document.querySelectorAll('[data-8b-motion]')].map(element => ({ element, y: 0, at: at(element) }));
let queued = false;
const check = () => {
queued = false;
pending = pending.filter(item => {
if (item.y > scrollY + innerHeight * item.at) return true;
item.element.classList.add('is-in');
return false;
});
};
const queue = () => { if (!queued) { queued = true; requestAnimationFrame(check); } };
kit.measure(() => { pending.forEach(item => { item.y = kit.box(item.element).y; }); queue(); });
addEventListener('scroll', queue, { passive: true });
})();
(() => {
if (!window.motionKit.live) return;
const sheet = new CSSStyleSheet();
sheet.replaceSync('[data-8b-off],[data-8b-off]::before,[data-8b-off]::after{animation-play-state:paused!important}');
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
const watch = new IntersectionObserver(entries => entries.forEach(entry => entry.target.toggleAttribute('data-8b-off', !entry.isIntersecting)));
const watched = new WeakSet();
const scan = () => document.getAnimations().forEach(animation => {
const element = animation.effect?.target;
if (!element || watched.has(element) || animation.effect.getTiming().iterations !== Infinity || animation.timeline !== document.timeline) return;
watched.add(element);
watch.observe(element);
});
scan();
addEventListener('load', scan);
document.addEventListener('animationstart', scan, true);
})();
(() => {
const kit = window.motionKit;
kit.track = () => {};
if (!kit.live) return;
const named = { top: 0, center: 0.5, bottom: 1 };
const point = text => text.trim().split(/\s+/).map(word => named[word] ?? parseFloat(word) / 100);
kit.track = (element, start, end, fn) => {
const [s0, v0] = point(start), [s1, v1] = point(end);
let queued = false;
const run = () => {
queued = false;
const box = element.getBoundingClientRect(), vh = innerHeight;
const d0 = box.top + box.height * s0 - vh * v0, d1 = box.top + box.height * s1 - vh * v1;
fn(d1 === d0 ? (d0 <= 0 ? 1 : 0) : Math.min(1, Math.max(0, -d0 / (d1 - d0))));
};
addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(run); } }, { passive: true });
kit.measure(run);
};
})();


motionKit.scene('disciplines', () => {
  const grid = document.querySelector('#disciplines .ds-grid');
  const tiles = [...grid.querySelectorAll('.ds-tile')];
  motionKit.measure(() => {
    const height = grid.offsetHeight, view = innerHeight;
    motionKit.set(grid, { '--disciplines-end': height > view ? '98vh' : height > view * 0.8 ? '62vh' : 'calc(50% - 2vh)' });
    const centreY = Math.min(grid.clientHeight, view * 0.9) / 2;
    tiles.forEach(tile => motionKit.set(tile, {
      '--disciplines-x': `${grid.clientWidth / 2 - (tile.offsetLeft + tile.offsetWidth / 2)}px`,
      '--disciplines-y': `${centreY - (tile.offsetTop + tile.offsetHeight / 2)}px`,
      '--disciplines-s': Math.min(1, 210 / tile.offsetWidth, 240 / tile.offsetHeight)
    }));
  });
});


motionKit.scene('week', () => {
  const section = document.getElementById('week');
  const stage = section.querySelector('.wk-stage');
  const view = section.querySelector('.wk-view');
  const track = section.querySelector('.wk-track');
  section.setAttribute('data-scrubbed', '');
  motionKit.measure(() => {
    const pad = parseFloat(getComputedStyle(view).paddingLeft) || 0;
    const distance = Math.max(0, track.offsetWidth - (view.clientWidth - pad * 2));
    motionKit.set(section, { '--week-distance': `${distance}px`, '--wk-height': `${stage.offsetHeight + distance}px` });
  });
  const leaning = () => Math.atan(new DOMMatrixReadOnly(getComputedStyle(track).transform).c) * 180 / Math.PI;
  let last = null, lean = null;
  motionKit.track(section, 'top 0%', 'bottom 100%', progress => {
    const now = performance.now(), y = scrollY;
    if (last && progress !== last.progress && now > last.now) {
      const velocity = (y - last.y) / (now - last.now) * 1000;
      const to = Math.max(-9, Math.min(9, velocity / -260)), from = leaning();
      lean?.cancel();
      lean = track.animate([
        { transform: `skewX(${from}deg)`, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' },
        { transform: `skewX(${from + (to - from) * 0.673}deg)`, offset: 0.237, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' },
        { transform: 'skewX(0deg)' }
      ], { duration: 590 });
    }
    last = { now, y, progress };
  });
});


motionKit.scene('faq', () => {
  const section = document.getElementById('faq');
  const rail = section.querySelector('.fq-rail');
  const ball = section.querySelector('.fq-ball');
  motionKit.measure(() => {
    const travel = Math.max(0, rail.clientHeight - ball.offsetHeight);
    motionKit.set(ball, { '--faq-travel': `${travel}px`, '--faq-turn': `${travel / (Math.PI * ball.offsetWidth) * 360}deg` });
  });
});


motionKit.scene('contact', () => {
  const run = document.querySelector('#contact .ct-run');
  const title = run.querySelector('.ct-title');
  motionKit.measure(() => motionKit.set(run, { '--contact-travel': `${title.offsetWidth - run.clientWidth}px`, '--contact-line': title.offsetWidth / run.clientWidth }));
});
