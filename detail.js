(function(){
const g=window.gsap,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,$=s=>document.querySelector(s);
/* ---- premium hamburger menu ---- */
const mb=$('#menuBtn'),menu=$('#menu'),mc=$('#menuClose');
let menuReturnFocus=null;
function toggleMenu(open){
  if(!mb||!menu)return;
  const isOpen=menu.classList.contains('open');
  if(open===isOpen)return;
  if(open){
    menuReturnFocus=document.activeElement;
    menu.classList.add('open');mb.classList.add('open');
    mb.setAttribute('aria-expanded','true');menu.setAttribute('aria-hidden','false');
    document.body.classList.add('lock');
    window.setTimeout(()=>{if(menu.classList.contains('open'))mc&&mc.focus({preventScroll:true})},120);
  }else{
    menu.classList.remove('open');mb.classList.remove('open');
    mb.setAttribute('aria-expanded','false');menu.setAttribute('aria-hidden','true');
    document.body.classList.remove('lock');
    if(menuReturnFocus&&menuReturnFocus.focus)menuReturnFocus.focus({preventScroll:true});
  }
}
if(mc)mc.addEventListener('click',()=>toggleMenu(false));
if(mb)mb.addEventListener('click',()=>toggleMenu(!menu.classList.contains('open')));
if(menu){
  menu.addEventListener('click',e=>{if(e.target.closest('a'))toggleMenu(false)});
  menu.addEventListener('keydown',e=>{
    if(e.key!=='Tab')return;
    const focusables=[...menu.querySelectorAll('a[href],button:not([disabled])')].filter(el=>el.offsetParent!==null);
    if(!focusables.length)return;
    const first=focusables[0],last=focusables[focusables.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });
}
/* ---- case study content ---- */
const INFO={
p1:{t:'The easiest way into iPhone.',w:['Lowest price in the lineup at Rs 35,000','64 GB covers calls, WhatsApp, social and everyday photos','A sensible first iPhone or a reliable backup phone'],s:'A budget-friendly entry point for anyone moving to iPhone. Simple, familiar and easy on the wallet.'},
p2:{t:'Pro finish in Desert Titanium.',w:['512 GB of space for photos, video and apps','Desert Titanium colour with a premium, understated look','Flagship-tier choice for heavy daily users'],s:'For people who want a Pro iPhone with plenty of storage and a refined colour that stands out from the usual black.'},
p3:{t:'The everyday flagship.',w:['256 GB gives comfortable room without paying for a Pro','Classic black that suits any case or style','Balanced pick between price and premium feel'],s:'A strong all-rounder for buyers who want a current iPhone without stepping up to the Pro price tier.'},
p4:{t:'The collector’s piece.',w:['1 TB of storage, the most space-per-phone in the Rs 10 lakh bracket','Midnight Blue finish','Top of the lineup, built for people who want the very best'],s:'A statement phone for collectors and power users who never want to think about storage again.'},
p5:{t:'Maximum storage, bold Burgundy.',w:['2 TB, the biggest storage option we stock','Burgundy colour that is instantly recognisable','Pro Max tier for those who want everything'],s:'A rare configuration for buyers who want maximum capacity and a colour that makes the phone unmistakably theirs.'},
p6:{t:'Proven and value-priced.',w:['128 GB is plenty for most people','Rs 80,000 puts it in the value tier','A well-known model that is easy to live with'],s:'A dependable mid-range choice when you want a good iPhone experience at a friendlier price.'}};
const tierName={low:'Value',mid:'Flagship',high:'Collector'};
let pd,state={};
function build(){pd=document.createElement('div');pd.className='pd';pd.setAttribute('role','dialog');pd.setAttribute('aria-modal','true');
pd.innerHTML='<div class="pd-bg"></div><div class="pd-panel"><button class="pd-close" aria-label="Close">✕</button><div class="pd-media"><div class="pd-glow"></div><img class="pd-img" alt=""></div><div class="pd-body"></div></div>';
document.body.appendChild(pd);
pd.querySelector('.pd-bg').addEventListener('click',close);pd.querySelector('.pd-close').addEventListener('click',close);

document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(pd.classList.contains('open'))close();else toggleMenu(false)}})}
function open(card,ev){
  const p=PRODUCTS.find(x=>x.id===card.dataset.id);if(!p)return;if(!pd)build();const d=INFO[p.id];
  const img=pd.querySelector('.pd-img');img.src=p.img;img.alt=p.name;pd.querySelector('.pd-glow').style.setProperty('--c',p.hex==='#1c1c1e'?'#f26a21':p.hex);
  pd.querySelector('.pd-body').innerHTML=`<span class="pd-kicker" data-a>${tierName[p.tier]} · Case study</span><h2 class="pd-title" data-a>${p.model}</h2><p class="pd-tagline" data-a>${d.t}</p><div class="pd-price" data-a><span class="cnt">${p.price}</span></div>
  <div class="pd-chips" data-a><span><i class="dot" style="background:${p.hex}"></i>${p.color}</span><span>${p.storage}</span><span>Shop B8, Johar Mor</span><span>Open until 12 AM</span></div>
  <div class="pd-sec" data-a><h4>Overview</h4><p>${d.s}</p></div>
  <div class="pd-sec" data-a><h4>Why this phone</h4><ul>${d.w.map(x=>'<li>'+x+'</li>').join('')}</ul></div>
  <div class="pd-sec" data-a><h4>Buying at Sulehri Mobiles</h4><p>Visit us at Saima Drive-In Mobile Mall, or message on WhatsApp to confirm stock and price before you come.</p></div>
  <div class="pd-actions" data-a><button class="btn btn-primary" id="pdAdd">Add to cart</button><a class="btn btn-whatsapp" target="_blank" rel="noopener" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello! I am interested in '+p.name+' (Rs '+p.price.toLocaleString()+'). Is it available?')}">Ask on WhatsApp</a></div>`;
  pd.querySelector('#pdAdd').onclick=e=>{addToCart(p.id);e.target.textContent='Added ✓';showToast('Added to cart');setTimeout(()=>e.target.textContent='Add to cart',1100)};
  const cnt=pd.querySelector('.cnt'),fmt=n=>'Rs '+Math.round(n).toLocaleString();cnt.textContent=fmt(p.price);
  pd.classList.add('open');document.body.classList.add('lock');
  const detailPanel=pd.querySelector('.pd-panel');detailPanel.scrollTop=0;
  requestAnimationFrame(()=>{detailPanel.scrollTop=0;});
  if(!g||reduce||matchMedia('(max-width: 760px)').matches)return;
  const panel=pd.querySelector('.pd-panel'),bg=pd.querySelector('.pd-bg'),x=ev&&ev.clientX||innerWidth/2,y=ev&&ev.clientY||innerHeight/2;
  const from=card.querySelector('.product-img').getBoundingClientRect(),to=img.getBoundingClientRect();
  g.killTweensOf([panel,bg,img,pd.querySelectorAll('[data-a]')]);
  g.fromTo(bg,{clipPath:`circle(0px at ${x}px ${y}px)`},{clipPath:`circle(160% at ${x}px ${y}px)`,duration:.9,ease:'power3.inOut'});
  g.fromTo(panel,{opacity:0,y:24,scale:.985,filter:'blur(4px)'},{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:.62,ease:'power3.out',delay:.04,clearProps:'filter,transform'});
  g.fromTo(img,{x:from.left+from.width/2-(to.left+to.width/2),y:from.top+from.height/2-(to.top+to.height/2),scale:from.width/to.width,rotation:-8},{x:0,y:0,scale:1,rotation:0,duration:1.1,ease:'expo.out',delay:.12});
  g.fromTo(pd.querySelectorAll('[data-a]'),{opacity:0,y:36},{opacity:1,y:0,duration:.8,ease:'power3.out',stagger:.07,delay:.4});
  g.fromTo(pd.querySelector('.pd-close'),{scale:0,rotation:-90},{scale:1,rotation:0,duration:.6,ease:'back.out(2)',delay:.6});
  const o={v:0};g.to(o,{v:p.price,duration:1.4,ease:'power3.out',delay:.5,onUpdate:()=>cnt.textContent=fmt(o.v)})}
function close(){if(!pd||!pd.classList.contains('open'))return;
  const done=()=>{pd.classList.remove('open');document.body.classList.remove('lock')};
  if(!g||reduce||matchMedia('(max-width: 760px)').matches)return done();
  g.to(pd.querySelector('.pd-panel'),{opacity:0,y:60,scale:.94,duration:.45,ease:'power3.in'});
  g.to(pd.querySelector('.pd-bg'),{opacity:0,duration:.5,delay:.1,onComplete:()=>{done();g.set(pd.querySelector('.pd-bg'),{opacity:1})}})}
document.addEventListener('click',e=>{if(e.target.closest('.add-cart-btn'))return;const c=e.target.closest('.product-card');if(c)open(c,e)});
document.addEventListener('keydown',e=>{if((e.key==='Enter')&&e.target.classList&&e.target.classList.contains('product-card'))open(e.target)});
})();
