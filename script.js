(function(){
  const scene = document.getElementById('scene');
  const hint = document.getElementById('hint');
  const mailboxWrap = document.getElementById('mailbox-wrap');
  const envelopeStage = document.getElementById('envelope-stage');
  const envelope = document.getElementById('envelope');
  const dragHandle = document.getElementById('drag-handle');
  const letter = document.getElementById('letter');
  const fullLetter = document.getElementById('full-letter');
  const decoLayer = document.getElementById('deco-layer');
  const soundToggle = document.getElementById('sound-toggle');

  // ---------- bintang background ----------
  for(let i=0;i<60;i++){
    const s = document.createElement('div');
    s.className='star';
    s.style.left = Math.random()*100+'%';
    s.style.top = Math.random()*70+'%';
    s.style.animationDelay = (Math.random()*2.5)+'s';
    document.getElementById('stars').appendChild(s);
  }

  let stage = 'mailbox'; // mailbox -> taken -> opening -> pulling -> done

  // ---------- STAGE 1: klik kotak surat ----------
  mailboxWrap.addEventListener('click', () => {
    if(stage !== 'mailbox') return;
    stage = 'taken';
    mailboxWrap.style.transition = 'transform .5s ease, opacity .5s ease';
    mailboxWrap.style.transform = 'translateY(30px) scale(.8)';
    mailboxWrap.style.opacity = '0';
    setTimeout(()=>{ mailboxWrap.style.display='none'; }, 500);

    envelopeStage.classList.add('show');
    envelope.classList.add('taken');
    hint.textContent = 'Ketuk atau geser sedikit bagian tengah amplop ke atas';
  });

  // ---------- STAGE 2: geser (atau cukup ketuk) tengah amplop untuk buka ----------
  let dragStartY = null;
  let envelopeOpened = false;
  const OPEN_THRESHOLD = 12; // sangat kecil, mudah terpicu

  function onDragStart(e){
    if(stage !== 'taken' || envelopeOpened) return;
    dragStartY = getY(e);
    document.addEventListener('pointermove', onDragMove);
    document.addEventListener('pointerup', onDragEnd);
    e.preventDefault();
  }
  function getY(e){ return e.touches ? e.touches[0].clientY : e.clientY; }

  function onDragMove(e){
    if(dragStartY === null || envelopeOpened) return;
    const diff = dragStartY - getY(e);
    if(diff > OPEN_THRESHOLD){
      openEnvelope();
      return;
    }
    if(diff > 0){
      dragHandle.style.transform = `translate(-50%, calc(-50% - ${diff}px))`;
    }
  }
  function onDragEnd(){
    // Ketukan/klik biasa (tanpa geser jauh) juga langsung membuka amplop
    if(!envelopeOpened && stage === 'taken'){
      openEnvelope();
    }
    dragStartY = null;
    document.removeEventListener('pointermove', onDragMove);
    document.removeEventListener('pointerup', onDragEnd);
  }

  dragHandle.addEventListener('pointerdown', onDragStart);
  envelope.addEventListener('pointerdown', onDragStart);

  function openEnvelope(){
    if(envelopeOpened) return;
    envelopeOpened = true;
    stage = 'opening';
    envelope.classList.add('opened');
    document.removeEventListener('pointermove', onDragMove);
    document.removeEventListener('pointerup', onDragEnd);
    setTimeout(()=>{
      letter.classList.add('visible');
      stage = 'pulling';
      hint.textContent = 'Ketuk atau tarik sedikit surat ke atas untuk membacanya';
      setupLetterDrag();
    }, 550);
  }

  // ---------- STAGE 3: tarik (atau cukup ketuk) surat ke atas ----------
  function setupLetterDrag(){
    let startY = null;
    let currentOffset = 0;
    const PULL_THRESHOLD = 20; // sangat kecil, mudah terpicu

    function start(e){
      if(stage !== 'pulling') return;
      startY = getY(e);
      currentOffset = 0;
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', end);
      e.preventDefault();
    }
    function move(e){
      if(startY === null) return;
      const diff = startY - getY(e);
      currentOffset = Math.max(0, diff);
      letter.style.transform = `translateX(-50%) translateY(${-currentOffset}px)`;
      if(currentOffset > PULL_THRESHOLD){
        finishPull();
      }
    }
    function end(){
      // Ketukan/klik biasa (tanpa geser jauh) juga langsung menarik surat keluar
      if(stage === 'pulling'){
        finishPull();
      }
      startY = null;
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', end);
    }
    letter.addEventListener('pointerdown', start);
  }

  function finishPull(){
    if(stage !== 'pulling') return;
    stage = 'done';
    document.removeEventListener('pointermove', null);
    letter.style.transition = 'transform .5s ease, opacity .5s ease';
    letter.style.transform = 'translateX(-50%) translateY(-260px) scale(1.05)';
    letter.style.opacity = '0';
    envelopeStage.style.transition = 'opacity .6s ease';
    envelopeStage.style.opacity = '0';
    hint.style.transition = 'opacity .4s ease';
    hint.style.opacity = '0';

    setTimeout(()=>{
      envelopeStage.style.display = 'none';
      scene.classList.add('celebrate');
      fullLetter.classList.add('show');
      startCelebration();
      startMusic();
      soundToggle.classList.add('show');
    }, 550);
  }

  // ---------- Dekorasi: balon & confetti ----------
  function startCelebration(){
    const balloonColors = ['#ff6b6b','#ffd93d','#6bcB77','#4d96ff','#f78fb3','#ff9f43'];
    for(let i=0;i<16;i++){
      setTimeout(()=>{
        const b = document.createElement('div');
        b.className = 'balloon';
        b.style.left = (Math.random()*90)+'%';
        b.style.background = `radial-gradient(circle at 30% 25%, #fff8, ${balloonColors[i%balloonColors.length]})`;
        b.style.setProperty('--drift', (Math.random()*140-70)+'px');
        b.style.animationDuration = (7+Math.random()*4)+'s';
        decoLayer.appendChild(b);
        setTimeout(()=>b.remove(), 12000);
      }, i*350);
    }
    const confettiColors = ['#ff6b6b','#ffd93d','#6bcB77','#4d96ff','#f78fb3','#a66bff'];
    function dropConfetti(){
      for(let i=0;i<6;i++){
        const c = document.createElement('div');
        c.className='confetti';
        c.style.left = Math.random()*100+'%';
        c.style.background = confettiColors[Math.floor(Math.random()*confettiColors.length)];
        c.style.animationDuration = (3+Math.random()*2.5)+'s';
        c.style.borderRadius = Math.random()>.5 ? '50%' : '2px';
        decoLayer.appendChild(c);
        setTimeout(()=>c.remove(), 6000);
      }
    }
    dropConfetti();
    setInterval(dropConfetti, 900);
  }

  // ---------- Musik instrumental "Happy Birthday" (disintesis, bebas hak cipta) ----------
  let audioCtx = null;
  let musicMuted = false;
  let musicTimer = null;

  const notes = { // frekuensi nada (G major)
    D4:293.66, E4:329.63, Fs4:369.99, G4:392.00, A4:440.00, B4:493.88,
    C5:523.25, D5:587.33
  };
  // melodi [frekuensi, durasi(detik)]
  const melody = [
    [notes.D4,.3],[notes.D4,.2],[notes.E4,.5],[notes.D4,.5],[notes.G4,.5],[notes.Fs4,1],
    [notes.D4,.3],[notes.D4,.2],[notes.E4,.5],[notes.D4,.5],[notes.A4,.5],[notes.G4,1],
    [notes.D4,.3],[notes.D4,.2],[notes.D5,.5],[notes.B4,.5],[notes.G4,.5],[notes.Fs4,.5],[notes.E4,1],
    [notes.C5,.3],[notes.C5,.2],[notes.B4,.5],[notes.G4,.5],[notes.A4,.5],[notes.G4,1.2]
  ];

  function playNote(freq, dur, startTime){
    if(!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(.22, startTime + .04);
    gain.gain.exponentialRampToValueAtTime(.001, startTime + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + dur + .05);
  }

  function scheduleMelody(){
    if(musicMuted || !audioCtx) return;
    let t = audioCtx.currentTime + .1;
    let total = 0;
    melody.forEach(([freq,dur])=>{
      playNote(freq, dur*0.92, t);
      t += dur;
      total += dur;
    });
    musicTimer = setTimeout(scheduleMelody, total*1000 + 900);
  }

  function startMusic(){
    try{
      audioCtx = new (window.AudioContext||window.webkitAudioContext)();
      scheduleMelody();
    }catch(e){ /* audio tidak tersedia */ }
  }

  soundToggle.addEventListener('click', ()=>{
    musicMuted = !musicMuted;
    soundToggle.textContent = musicMuted ? '🔇' : '🔊';
    if(musicMuted){
      clearTimeout(musicTimer);
      if(audioCtx){ audioCtx.suspend(); }
    } else {
      if(audioCtx){ audioCtx.resume(); }
      scheduleMelody();
    }
  });

})();
