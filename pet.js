'use strict';
(function(){
  const jokes = [
    'Why do Java developers wear glasses? Because they can\'t C#!',
    'Why did the Java developer quit? He ran out of cache.',
    'There are 2 hard problems in CS: cache invalidation, naming things, and off-by-1 errors.',
    'Why do programmers hate nature? Too many bugs.',
    'I\'d tell you a UDP joke, but you might not get it.',
    'Why do Spring developers love coffee? Because they can\'t Bean without it!',
    'How many programmers does it take to change a light bulb? None, that\'s a hardware issue.',
    'What\'s a JVM\'s favorite food? Byte code!',
    'Why did the Spring Bean break up? It wasn\'t autowired anymore.',
    'API is like a joke. If you have to explain it, it\'s bad.',
    '99 little bugs in the code, 99 little bugs. Take one down, patch it around, 117 little bugs in the code!',
    'When I wrote this code, only God and I understood it. Now only God knows.',
  ];

  const pets = [
    { emoji: '🧑‍💻', alt: 'Me coding' },
    { emoji: '☕', alt: 'Coffee break' },
    { emoji: '🤔', alt: 'Debugging...' },
    { emoji: '😎', alt: 'Shipped it!' },
    { emoji: '💤', alt: 'Waiting for build' },
    { emoji: '🎯', alt: 'Sprint goal' },
    { emoji: '🚀', alt: 'Deploying!' },
  ];

  const el = document.createElement('div');
  el.id = 'pet';
  el.innerHTML = `
    <div class="pet-bubble" id="petBubble">Hi! 👋</div>
    <div class="pet-body" id="petBody">
      <div class="pet-hat"></div>
      <div class="pet-face">
        <img src="https://avatars.githubusercontent.com/u/108076489?v=4" alt="Bot" class="pet-avatar" id="petAvatar">
      </div>
      <div class="pet-torso">
        <div class="pet-coffee" id="petCoffee">☕</div>
      </div>
    </div>
    <div class="pet-shadow"></div>
  `;
  document.body.appendChild(el);

  /* Styles */
  const style = document.createElement('style');
  style.textContent = `
    #pet{position:fixed;bottom:20px;left:20px;right:auto;z-index:9998;cursor:pointer;
      -webkit-user-select:none;user-select:none;transition:transform .3s}
    #pet:hover{transform:scale(1.1) translateY(-4px)}
    #pet:active{transform:scale(0.95)}
    .pet-body{width:60px;height:80px;position:relative}
    .pet-hat{width:30px;height:8px;background:var(--accent,#f97316);border-radius:4px 4px 0 0;
      margin:0 auto 2px;position:relative}
    .pet-hat::after{content:'';position:absolute;top:-6px;left:50%;transform:translateX(-50%);
      width:16px;height:6px;background:var(--accent,#f97316);border-radius:3px 3px 0 0}
    .pet-face{width:48px;height:48px;border-radius:50%;margin:0 auto 2px;
      border:2px solid var(--accent,#f97316);position:relative;overflow:hidden;
      background:#1a1a2e;box-shadow:0 0 12px rgba(249,115,22,0.15)}
    .pet-avatar{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s}
    #pet:hover .pet-avatar{transform:scale(1.15)}
    .pet-torso{width:36px;height:28px;background:#2a2a2a;border-radius:0 0 18px 18px;
      margin:-2px auto 0;border:2px solid #444;border-top:none;
      display:flex;align-items:center;justify-content:center}
    .pet-coffee{font-size:14px;transition:all .3s;animation:petFloat 3s ease-in-out infinite}
    @keyframes petFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
    .pet-shadow{width:40px;height:6px;background:rgba(255,255,255,0.05);border-radius:50%;
      margin:4px auto 0;animation:petShadow 3s ease-in-out infinite}
    @keyframes petShadow{0%,100%{transform:scale(1);opacity:0.5}
      50%{transform:scale(0.85);opacity:0.3}}
    @keyframes bootFlash{
      0%{opacity:0;transform:scale(0.85) translateY(4px);box-shadow:0 0 0 rgba(0,255,136,0)}
      50%{opacity:1;transform:scale(1.05) translateY(-2px);box-shadow:0 0 24px rgba(0,255,136,0.25)}
      100%{opacity:1;transform:scale(1) translateY(0);box-shadow:0 0 12px rgba(0,255,136,0.08)}
    }
    .pet-bubble{position:absolute;bottom:95px;left:70px;transform:none;
      background:#1a1a2e;color:#00ff88;padding:6px 14px;border-radius:6px;
      font-size:11px;line-height:1.3;white-space:nowrap;width:auto;
      border:1px solid rgba(0,255,136,0.15);opacity:0;pointer-events:none;z-index:9999;
      font-family:var(--font-mono,Courier,monospace);
      box-shadow:0 0 12px rgba(0,255,136,0.08),inset 0 0 8px rgba(0,255,136,0.03);
      transition:opacity .25s,transform .25s;}
    .pet-bubble.show{opacity:1;animation:bootFlash .4s ease-out}
    .pet-bubble::after{content:'';position:absolute;top:50%;right:100%;
      margin-top:-6px;border:6px solid transparent;border-right-color:#1a1a2e}
    .pet-bubble.show{opacity:1}
  `;
  document.head.appendChild(style);

  const bubble = el.querySelector('#petBubble');
  const coffee = el.querySelector('#petCoffee');
  let stateTimer;
  let clickJoke = -1;

  function showBubble(text, duration){
    bubble.textContent=text;bubble.classList.add('show');
    clearTimeout(bubble._t);bubble._t=setTimeout(()=>bubble.classList.remove('show'),duration||2000);
  }

  function randomAction(){
    const i=Math.floor(Math.random()*pets.length);
    const pet=pets[i];
    coffee.textContent=pet.emoji;
    showBubble(pet.alt,1500)
  }

  function startActions(){
    clearInterval(stateTimer);
    stateTimer=setInterval(randomAction,6000+Math.random()*4000);
  }

  el.addEventListener('click',()=>{
    let j;
    do{j=Math.floor(Math.random()*jokes.length)}while(j===clickJoke);
    clickJoke=j;
    showBubble(jokes[j],3500);
    clearInterval(stateTimer);
    setTimeout(startActions,4000);
  });

  el.addEventListener('mouseenter',()=>{
    showBubble('Hey you! 👋',1200);
    el.style.transform='scale(1.1) translateY(-4px)';
  });

  el.addEventListener('mouseleave',()=>{
    el.style.transform='';
  });

  /* Init */
  setTimeout(()=>{
    showBubble('Hey! Click me! 👆',3000);
    startActions();
  },4000);
})();
