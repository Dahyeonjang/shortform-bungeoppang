const films=[...document.querySelectorAll('.film')],audio=document.querySelector('audio'),bar=document.querySelector('.mobile-bar'),ref=document.querySelector('#ref-video');
const media=[...films,audio].filter(Boolean);
const fmt=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
const scriptToggle=document.querySelector('.script-toggle');
scriptToggle?.addEventListener('click',()=>{const expanded=scriptToggle.getAttribute('aria-expanded')!=='true';scriptToggle.setAttribute('aria-expanded',String(expanded));document.querySelectorAll('[data-cut]').forEach(row=>{const n=Number(row.dataset.cut);if(n>=6&&n<=14)row.hidden=!expanded});scriptToggle.innerHTML=expanded?'접기 <span aria-hidden="true">−</span>':'15컷 전부 보기 <span aria-hidden="true">＋</span>'});
// 기준 영상(유튜브)은 공식 플레이어라 postMessage로만 멈춘다. 자동 재생은 없다.
const refCommand=func=>{try{ref?.contentWindow?.postMessage(JSON.stringify({event:'command',func,args:[]}),'*')}catch{}};
let refPlaying=false;
function updateBar(){const hero=document.querySelector('#hero-apply').getBoundingClientRect(),apply=document.querySelector('#apply').getBoundingClientRect(),closing=document.querySelector('#closing').getBoundingClientRect();bar.hidden=!(hero.bottom<0&&!(apply.top<innerHeight&&apply.bottom>0)&&!(closing.top<innerHeight&&closing.bottom>0)&&media.every(m=>m.paused)&&!refPlaying);}
// 영상마다 같은 조작판: 재생 · 시간 · 위치 · 전체 화면
document.querySelectorAll('.player').forEach(fig=>{const film=fig.querySelector('.film');if(!film)return;const play=fig.querySelector('.play'),seek=fig.querySelector('.seek'),time=fig.querySelector('.time'),err=fig.querySelector('.media-error'),full=fig.querySelector('.fullscreen');
play.addEventListener('click',async()=>{if(film.paused){try{await film.play()}catch{err.textContent='영상을 재생할 수 없습니다. assets 폴더를 확인해 주세요.'}}else film.pause()});
film.addEventListener('play',()=>{play.textContent='Ⅱ 일시정지';play.setAttribute('aria-label','영상 일시정지')});film.addEventListener('pause',()=>{play.textContent='▶ 재생';play.setAttribute('aria-label','영상 재생')});
film.addEventListener('loadedmetadata',()=>{if(film.duration){seek.max=film.duration;time.textContent=`${fmt(film.currentTime)} / ${fmt(film.duration)}`}});
film.addEventListener('timeupdate',()=>{seek.value=film.currentTime;time.textContent=`${fmt(film.currentTime)} / ${fmt(film.duration||Number(seek.max))}`});seek.addEventListener('input',()=>film.currentTime=Number(seek.value));
full.addEventListener('click',async()=>{try{if(film.requestFullscreen){film.controls=true;await film.requestFullscreen()}else if(film.webkitEnterFullscreen)film.webkitEnterFullscreen()}catch{film.controls=false}})});
document.addEventListener('fullscreenchange',()=>{for(const f of films)f.controls=document.fullscreenElement===f});
// 한 번에 한 편만: 하나가 재생되면 나머지(영상 · 음성 · 기준 영상)는 멈춘다
for(const m of media){m.addEventListener('play',()=>{for(const o of media)if(o!==m)o.pause();refCommand('pauseVideo');updateBar()});for(const event of ['pause','ended'])m.addEventListener(event,updateBar)}
if(ref){ref.addEventListener('load',()=>{try{ref.contentWindow.postMessage(JSON.stringify({event:'listening',id:'ref-video'}),'*')}catch{}});
addEventListener('message',e=>{if(!/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(e.origin))return;let d;try{d=typeof e.data==='string'?JSON.parse(e.data):e.data}catch{return}const st=d?.info?.playerState;if(st===undefined)return;refPlaying=st===1;if(st===1)for(const m of media)m.pause();updateBar()})}
addEventListener('scroll',updateBar,{passive:true});addEventListener('resize',updateBar);updateBar();
const dialog=document.querySelector('#detail');let opener;document.querySelectorAll('[data-detail]').forEach(b=>b.addEventListener('click',()=>{opener=b;document.querySelector('#detail-content').replaceChildren(document.querySelector(`#${b.dataset.detail}`).content.cloneNode(true));dialog.showModal();document.body.classList.add('modal-open')}));document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');opener?.focus()});
let noticeTimer;document.querySelectorAll('.apply-link').forEach(a=>a.addEventListener('click',e=>{if(a.getAttribute('href').includes('{{')){e.preventDefault();const notice=document.querySelector('#notice');notice.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>notice.hidden=true,3500)}}));
