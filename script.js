// ArqTermo - script principal
// Siga AGENTS.md: mantenha as 16 palavras permitidas e escreva as pistas abaixo.

/* ====== CONFIGURE AQUI AS PALAVRAS E AS PISTAS ======
   - Termos em MAIÚSCULAS, sem acento e sem espaço, conforme AGENTS.md
   - Cada objeto: {term: 'PALAVRA', pista: 'sua pista (max 15 palavras)'}
   - Substitua as strings "ESCREVA_AQUI" com suas pistas.
*/
const WORDS = [
  { term: 'CPU', pista: 'Executa instruções e controla o fluxo de operações do sistema' },
  { term: 'ULA', pista: 'Realiza operações aritméticas e lógicas entre operandos' },
  { term: 'UC', pista: 'Coordena sinais e passos do ciclo de execução de instruções' },
  { term: 'REGISTRADORES', pista: 'Pequenos locais de armazenamento dentro da unidade central para dados temporários' },
  { term: 'RAM', pista: 'Memória volátil usada por programas enquanto estão em execução' },
  { term: 'ROM', pista: 'Memória não volátil cujo conteúdo vem pré-gravado pelo fabricante' },
  { term: 'EEPROM', pista: 'Memória não volátil regravável eletricamente, usada para armazenar firmware' },
  { term: 'FLASH', pista: 'Tipo de memória não volátil regravável em blocos, comum em dispositivos' },
  { term: 'CACHE', pista: 'Memória rápida entre a unidade central e a memória principal' },
  { term: 'MEMORIADEMASSA', pista: 'Armazenamento permanente de grande capacidade para arquivos e programas' },
  { term: 'DMA', pista: 'Controlador que transfere dados entre periféricos sem intervenção contínua da CPU' },
  { term: 'ADDRESSBUS', pista: 'Linhas que informam qual local de armazenamento será acessado' },
  { term: 'DATABUS', pista: 'Caminho elétrico que transporta bits entre componentes do sistema' },
  { term: 'MICROCONTROLADOR', pista: 'Chip que integra processador, memória e periféricos em um único pacote' },
  { term: 'DUALCORE', pista: 'Processador com duas unidades de processamento para executar tarefas paralelas' },
  { term: 'QUADCORE', pista: 'Processador com quatro núcleos independentes para maior paralelismo' }
];

// NÃO altere abaixo, a menos que saiba o que faz.
const boardEl = document.getElementById('board');
const pistaText = document.getElementById('pista-text');
const contadorEl = document.getElementById('contador');
const keyboardEl = document.getElementById('keyboard');
const btnCheck = document.getElementById('btn-check');
const btnNext = document.getElementById('btn-next');
const btnRestart = document.getElementById('btn-restart');

let currentIndex = 0;
let correctCount = 0;
let currentWord = WORDS[0].term;
let currentGuess = '';
let rows = []; // array of guesses for current word
let maxAttempts = 6; // padrão tipo Wordle
// modal elements
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalIcon = document.getElementById('modal-icon');
const modalMsg = document.getElementById('modal-msg');
const modalActions = document.getElementById('modal-actions');

// validação das pistas (<=15 palavras)
function validatePistas(){
  const warnings = [];
  WORDS.forEach((w, i) => {
    if(!w.pista || !w.pista.trim()) { warnings.push({i, msg: 'Pista vazia'}); return; }
    const count = w.pista.trim().split(/\s+/).length;
    if(count > 15) warnings.push({i, msg: `Pista tem ${count} palavras (>15)`});
  });
  return warnings;
}

// controla bloqueio do jogo quando houver validações
let isBlocked = false;
function setBlocked(flag){
  isBlocked = flag;
  btnCheck.disabled = flag;
  btnNext.disabled = flag || btnNext.disabled; // don't re-enable next if already enabled
  btnRestart.disabled = flag;
}

// modal helper: options {title, text, type:'info'|'error'|'success', buttons:[{label, className, onClick, close:true}]}
function showModal(options){
  modalTitle.textContent = options.title || 'Mensagem';
  modalMsg.textContent = options.text || '';
  // icon
  modalIcon.textContent = options.type === 'error' ? '!' : (options.type==='success' ? '✓' : 'i');
  modalIcon.style.background = options.type === 'error' ? '#7f1d1d' : (options.type==='success' ? 'rgba(16,185,129,0.12)' : 'rgba(124,58,237,0.06)');
  // actions
  modalActions.innerHTML = '';
  const buttons = options.buttons && options.buttons.length ? options.buttons : [{label:'OK', className:'', onClick:()=>{}, close:true}];
  buttons.forEach((b, idx) => {
    const btn = document.createElement('button');
    btn.className = 'btn ' + (b.className||'');
    btn.textContent = b.label;
    btn.addEventListener('click', ()=>{
      if(b.close) closeModal();
      if(typeof b.onClick === 'function') b.onClick();
    });
    modalActions.appendChild(btn);
    if(idx===0) setTimeout(()=>btn.focus(),50);
  });
  modal.setAttribute('aria-hidden','false');
  // trap minimal: close on Escape
  function onKey(e){ if(e.key === 'Escape'){ if(options.escCloses) closeModal(); } }
  document.addEventListener('keydown', onKey);
  // provide close function capture
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    document.removeEventListener('keydown', onKey);
  }
  // expose close for caller if needed
  return { close: ()=>{ modal.setAttribute('aria-hidden','true'); document.removeEventListener('keydown', onKey); } };
}

function startRound(){
  currentWord = WORDS[currentIndex].term.toUpperCase();
  pistaText.textContent = WORDS[currentIndex].pista;
  // validação da pista atual: indica visualmente se excede 15 palavras
  const count = WORDS[currentIndex].pista ? WORDS[currentIndex].pista.trim().split(/\s+/).length : 0;
  if(count > 15){
    pistaText.style.color = '#ffb4a2';
    pistaText.title = `Atenção: sua pista tem ${count} palavras (máx 15)`;
  } else {
    pistaText.style.color = '';
    pistaText.title = '';
  }
  // mostrar comprimento da palavra em destaque
  const pistaLenEl = document.getElementById('pista-length');
  if(pistaLenEl) pistaLenEl.textContent = currentWord.length + ' letras';
  rows = Array.from({length: maxAttempts}, () => Array(currentWord.length).fill(''));
  currentGuess = '';
  renderBoard();
  renderKeyboard();
  updateCounter();
  btnNext.disabled = true;
}

function renderBoard(){
  boardEl.innerHTML = '';
  boardEl.style.gridTemplateRows = `repeat(${maxAttempts}, auto)`;
  boardEl.style.gridTemplateColumns = `repeat(1, auto)`;
  // ajustar grid para ter o número exato de colunas por linha
  for(let r=0;r<maxAttempts;r++){
    const row = document.createElement('div');
    row.className = 'row';
    for(let c=0;c<currentWord.length;c++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r; cell.dataset.col = c;
      cell.textContent = rows[r][c] || '';
      const icon = document.createElement('span');
      icon.className = 'state-icon';
      cell.appendChild(icon);
      row.appendChild(cell);
    }
    boardEl.appendChild(row);
  }
}

// keyboard layout simples (A-Z rows)
const KBD_ROWS = ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];

function renderKeyboard(){
  keyboardEl.innerHTML = '';
  KBD_ROWS.forEach((rowStr,ri)=>{
    const row = document.createElement('div');
    row.className = 'kbd-row';
    if(ri===2){
      const enter = makeKey('ENTER','wide'); row.appendChild(enter);
    }
    for(const ch of rowStr){
      row.appendChild(makeKey(ch));
    }
    if(ri===2){
      const back = makeKey('BACK','wide'); row.appendChild(back);
    }
    keyboardEl.appendChild(row);
  });
}

function makeKey(label, extra){
  const el = document.createElement('button');
  el.className = 'key' + (extra? ' '+extra : '');
  el.textContent = label;
  el.dataset.key = label;
  el.addEventListener('click', ()=>handleKey(label));
  return el;
}

function handleKey(key){
  if(isBlocked) return;
  if(key === 'ENTER') return submitGuess();
  if(key === 'BACK') return deleteLetter();
  if(/^[A-Z]$/.test(key)) addLetter(key);
}

function addLetter(ch){
  if(currentGuess.length >= currentWord.length) return;
  currentGuess += ch;
  updateRowUI();
}

function deleteLetter(){
  if(currentGuess.length === 0) return;
  currentGuess = currentGuess.slice(0,-1);
  updateRowUI();
}

function updateRowUI(){
  const rowIndex = rows.findIndex(r => r.join('') === '' || r.join('') === undefined || r.join('') === null);
  // find first empty row index: simplified tracking using currentGuess and filled rows
  let target = 0;
  for(let i=0;i<maxAttempts;i++){
    const joined = rows[i].join('');
    if(!joined || joined.trim() === ''){ target = i; break; }
    target = i+1;
  }
  // write currentGuess into target row
  for(let c=0;c<currentWord.length;c++){
    rows[target][c] = currentGuess[c] || '';
    const cell = boardEl.querySelector(`.cell[data-row='${target}'][data-col='${c}']`);
    if(cell) cell.firstChild && (cell.firstChild.textContent = ''); // clear icon
    if(cell) cell.childNodes[0].textContent = rows[target][c] || '';
  }
}

function submitGuess(){
  if(currentGuess.length !== currentWord.length){
    showModal({ title: 'Erro', text: 'A palavra deve ter ' + currentWord.length + ' letras.', type: 'error', buttons:[{label:'OK', close:true}], escCloses:true });
    return;
  }
  // validate against currentWord
  const guess = currentGuess;
  const evaluation = evaluateGuess(guess, currentWord);
  // apply styles to row (first empty/active row)
  let target = 0;
  for(let i=0;i<maxAttempts;i++){
    const joined = rows[i].join('');
    if(!joined || joined.trim() === ''){ target = i; break; }
    target = i+1;
  }
  // reveal with flip animation and stagger
  for(let c=0;c<currentWord.length;c++){
    ((col, state)=>{
      const cell = boardEl.querySelector(`.cell[data-row='${target}'][data-col='${col}']`);
      if(!cell) return;
      // clear previous state classes
      cell.classList.remove('correct','present','absent');
      // trigger flip: add revealing, then after timeout set state and mark revealed
      const delay = col * 200; // stagger
      setTimeout(()=>{
        cell.classList.add('revealing');
        // after half the animation, set state and icon
        setTimeout(()=>{
          cell.classList.remove('revealing');
          cell.classList.add('revealed');
          cell.classList.add(state);
          const icon = cell.querySelector('.state-icon');
          icon.textContent = state === 'correct' ? '✓' : (state==='present' ? '↺' : '✕');
        }, 180);
      }, delay);
    })(c, evaluation[c]);
  }
  // update keyboard keys
  updateKeyboardStates(guess, evaluation);

  // mark row as filled
  rows[target] = guess.split('');
  currentGuess = '';
  // win check
  // check win after reveal delay (wait full row reveal)
  const totalRevealTime = currentWord.length * 200 + 220;
  if(evaluation.every(s => s==='correct')){
    setTimeout(()=>{
      correctCount++;
      updateCounter();
      btnNext.disabled = false;
      btnCheck.disabled = true;
      saveProgress();
      showModal({ title: 'Correto!', text: 'A palavra era ' + currentWord, type: 'success', buttons:[{label:'OK', close:true}], escCloses:true });
    }, totalRevealTime);
    // mark row as filled immediately for logic
    rows[target] = guess.split('');
    currentGuess = '';
    return;
  }
  // lose or continue
  const filledRows = rows.filter(r=>r.join('').length===currentWord.length).length;
  if(filledRows >= maxAttempts){
    btnNext.disabled = false;
    btnCheck.disabled = true;
    setTimeout(()=> showModal({ title: 'Fim das tentativas', text: 'Acabaram as tentativas. A palavra era: ' + currentWord, type:'error', buttons:[{label:'OK', close:true}], escCloses:true }), totalRevealTime);
  }
}

// returns array of 'correct'|'present'|'absent'
function evaluateGuess(guess, answer){
  const res = Array(guess.length).fill('absent');
  const answerChars = answer.split('');
  const used = Array(answer.length).fill(false);
  // first pass: correct
  for(let i=0;i<guess.length;i++){
    if(guess[i] === answer[i]){ res[i] = 'correct'; used[i]=true; }
  }
  // second pass: present
  for(let i=0;i<guess.length;i++){
    if(res[i] === 'correct') continue;
    for(let j=0;j<answer.length;j++){
      if(!used[j] && guess[i] === answer[j]){ res[i]='present'; used[j]=true; break; }
    }
  }
  return res;
}

// removed duplicate simple updateKeyboardStates earlier; using enhanced version below

function updateCounter(){
  contadorEl.textContent = `Acertos: ${correctCount} de ${WORDS.length}`;
}

function nextWord(){
  currentIndex++;
  btnCheck.disabled = false;
  if(currentIndex >= WORDS.length){
    showModal({ title: 'Fim', text: 'Fim das palavras. Parabéns! Acertos: ' + correctCount + ' de ' + WORDS.length, type:'info', buttons:[{label:'OK', close:true}], escCloses:true });
    // reset index to cycle again
    currentIndex = 0; correctCount = 0;
  }
  saveProgress();
  startRound();
}

function restartGame(){
  currentIndex = 0; correctCount = 0;
  btnCheck.disabled = false;
  clearProgress();
  startRound();
}

// removed earlier global keydown (we add a blocked-aware listener later)

// Persistência de progresso
function saveProgress(){
  const data = { currentIndex, correctCount };
  try{ localStorage.setItem('arqtermo_progress', JSON.stringify(data)); }catch(e){}
}
function loadProgress(){
  try{ const raw = localStorage.getItem('arqtermo_progress'); return raw ? JSON.parse(raw) : null; }catch(e){ return null; }
}
function clearProgress(){ try{ localStorage.removeItem('arqtermo_progress'); }catch(e){} }

// Atualiza teclado: adiciona animação curta quando recebe estado
function animateKey(keyBtn){
  keyBtn.classList.add('animate');
  setTimeout(()=> keyBtn.classList.remove('animate'), 260);
}

// atualiza estados do teclado e anima
function updateKeyboardStates(guess, evaluation){
  for(let i=0;i<guess.length;i++){
    const ch = guess[i];
    const state = evaluation[i];
    const keyBtn = keyboardEl.querySelector(`.key[data-key='${ch}']`);
    if(!keyBtn) continue;
    // priority: correct > present > absent
    if(state === 'correct'){
      keyBtn.classList.remove('present','absent'); keyBtn.classList.add('correct');
    } else if(state === 'present'){
      if(!keyBtn.classList.contains('correct')){ keyBtn.classList.remove('absent'); keyBtn.classList.add('present'); }
    } else {
      if(!keyBtn.classList.contains('correct') && !keyBtn.classList.contains('present')) keyBtn.classList.add('absent');
    }
    animateKey(keyBtn);
  }
  // persistir pequenas atualizações se quiser
  saveProgress();
}

// substitui mensagens simples: usa modal configurável
function showMessageModal(text, title, type){
  showModal({ title: title || 'Mensagem', text, type: type||'info', buttons:[{label:'OK', className:'', onClick:()=>{}, close:true}], escCloses:true });
}

// inicialização com validação bloqueante e checagem de progresso salvo
function proceedAfterValidation(forced){
  // se veio forçado, libera
  if(forced) setBlocked(false);
  // checa se existe progresso salvo
  const progress = loadProgress();
  if(progress && !forced){
    // perguntar se retomar
    showModal({
      title: 'Progresso encontrado',
      text: `Existe progresso salvo: palavra ${progress.currentIndex+1} / ${WORDS.length}, acertos ${progress.correctCount}. Deseja retomar?`,
      type: 'info',
      buttons:[
        { label: 'Retomar', className:'', onClick:()=>{ currentIndex = progress.currentIndex; correctCount = progress.correctCount; setBlocked(false); startRound(); }, close:true },
        { label: 'Novo jogo', className:'', onClick:()=>{ clearProgress(); currentIndex = 0; correctCount = 0; setBlocked(false); startRound(); }, close:true }
      ],
      escCloses:false
    });
  } else {
    // sem progresso, apenas inicia
    setBlocked(false);
    startRound();
  }
}

// run pista validations on load and act accordingly
const pistaWarnings = validatePistas();
if(pistaWarnings.length){
  // bloquear jogo e mostrar modal com lista
  setBlocked(true);
  console.warn('Avisos nas pistas:', pistaWarnings);
  const list = pistaWarnings.map(w => `#${w.i+1}: ${w.msg}`).join('\n');
  showModal({
    title: 'Pistas inválidas',
    text: `Foram encontradas problemas nas pistas:\n${list}\nCorrija antes de publicar. Deseja iniciar mesmo assim?`,
    type: 'error',
    buttons:[
      { label: 'Corrigir pistas', className:'', onClick:()=>{ /* permanece bloqueado */ }, close:true },
      { label: 'Iniciar mesmo assim', className:'', onClick:()=>{ proceedAfterValidation(true); }, close:true }
    ],
    escCloses:false
  });
} else {
  // sem avisos: prossegue e checa progresso salvo
  proceedAfterValidation(false);
}

// listeners
btnCheck.addEventListener('click', ()=>{ if(!isBlocked) submitGuess(); });
btnNext.addEventListener('click', ()=>{ if(!isBlocked) nextWord(); });
btnRestart.addEventListener('click', ()=>{ if(!isBlocked){ clearProgress(); restartGame(); } });

// keyboard physical handling com bloqueio
document.addEventListener('keydown', (ev)=>{
  if(isBlocked) return;
  const k = ev.key.toUpperCase();
  if(k === 'ENTER') { ev.preventDefault(); submitGuess(); return; }
  if(k === 'BACKSPACE') { ev.preventDefault(); deleteLetter(); return; }
  if(/^[A-Z]$/.test(k)) { ev.preventDefault(); addLetter(k); }
});

/* DICA: Edite apenas o array WORDS no topo para inserir suas pistas.
   Cada pista deve apontar unicamente para o termo e não conter a resposta.
 */
