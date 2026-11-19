(() => {
  const root=document.getElementById('navigation');
  const bar=root.querySelector('.nav__bar'),toggle=root.querySelector('.nav__menu'),menu=root.querySelector('.menu'),close=root.querySelector('.menu__close');
  const main=document.querySelector('main'),footer=document.querySelector('footer');
  let lastY=scrollY,turnY=scrollY,hidden=false;
  addEventListener('scroll',()=>{const y=scrollY;if(y>lastY){if(hidden)turnY=y;else if(y>160&&y-turnY>24){hidden=true;bar.setAttribute('data-hidden','');turnY=y;}}else if(y<lastY){if(!hidden)turnY=y;else if(turnY-y>24||y<80){hidden=false;bar.removeAttribute('data-hidden');turnY=y;}}lastY=y;},{passive:true});
  bar.addEventListener('focusin',()=>{hidden=false;bar.removeAttribute('data-hidden');});
  function open(state,restore=true){menu.hidden=!state;toggle.setAttribute('aria-expanded',String(state));main.inert=state;footer.inert=state;document.body.style.overflow=state?'hidden':'';if(state){window.motionKit?.wheel?.stop();close.focus();}else{window.motionKit?.wheel?.start();if(restore)toggle.focus();}}
  toggle.addEventListener('click',()=>open(true));close.addEventListener('click',()=>open(false));
  menu.addEventListener('click',event=>{const link=event.target.closest('a');if(link){open(false,false);const target=document.querySelector(link.hash);if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}}});
  addEventListener('keydown',event=>{if(menu.hidden)return;if(event.key==='Escape'){open(false);return;}if(event.key==='Tab'){const focusable=[...menu.querySelectorAll('a,button')];const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
  matchMedia('(min-width:901px)').addEventListener('change',e=>{if(e.matches&&!menu.hidden)open(false);});

  const frame=document.querySelector('.video-frame');
  frame.querySelector('.video-play').addEventListener('click',()=>{
    const iframe=document.createElement('iframe');iframe.src=`https://www.youtube.com/embed/${frame.dataset.videoId}?autoplay=1&rel=0`;
    iframe.title='Vídeo institucional — Avante Núcleo Social';iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';frame.replaceChildren(iframe);iframe.focus();
  });
  // The two equal logo groups form one seamless, continuously moving rail.
  // Reduced-motion handling is a static, manually scrollable CSS fallback.

  const form=document.querySelector('.ct-form'),status=form.querySelector('.ct-status');
  form.querySelector('button[type="submit"]').disabled=false;
  form.addEventListener('input',e=>{if(e.target.validity?.valid){e.target.removeAttribute('aria-invalid');const error=document.getElementById(e.target.getAttribute('aria-describedby'));if(error)error.textContent='';}});
  form.addEventListener('submit',event=>{
    event.preventDefault();let invalid=null;
    for(const name of ['name','email']){const field=form.elements[name];const valid=field.validity.valid&&field.value.trim().length>0;field.setAttribute('aria-invalid',String(!valid));document.getElementById(name+'-error').textContent=valid?'':name==='name'?'Informe seu nome.':'Informe um e-mail válido.';if(!valid&&!invalid)invalid=field;}
    if(invalid){status.textContent='Revise os campos destacados para continuar.';invalid.focus();return;}
    const values=new FormData(form);const message=`Olá, Avante! Sou ${String(values.get('name')).trim()}.\nE-mail: ${String(values.get('email')).trim()}\nInteresse: ${values.get('interest')}${values.get('message')?'\n\n'+String(values.get('message')).trim():''}`;
    const url='https://api.whatsapp.com/send?phone=5511947446597&text='+encodeURIComponent(message);
    window.open(url,'_blank','noopener,noreferrer');
    status.replaceChildren(document.createTextNode('A mensagem está pronta para você revisar e enviar no WhatsApp. '));
    const fallback=document.createElement('a');fallback.href=url;fallback.target='_blank';fallback.rel='noopener noreferrer';fallback.textContent='Abrir a conversa';status.append(fallback);
  });
  // In static/fallback layouts, keyboard arrows provide an explicit horizontal navigation option.
  const week=document.querySelector('.wk-view');week.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const direction=e.key==='ArrowRight'?1:-1;const section=document.getElementById('week');if(section.hasAttribute('data-scrubbed'))window.scrollBy({top:direction*300,behavior:'instant'});else week.scrollBy({left:direction*300,behavior:'instant'});}});
})();
