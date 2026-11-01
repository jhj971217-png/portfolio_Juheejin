(function(){
  var body=document.body;

  /* nav border on scroll */
  var nav=document.querySelector('.nav');
  function onScroll(){ if(nav) nav.classList.toggle('scrolled', window.scrollY>8); }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  /* 확인 필요(더미) 카운터 · 표시 토글 · 다음 항목 이동 */
  var todos=[].slice.call(document.querySelectorAll('.todo,.todo-block'));
  var cnt=document.querySelectorAll('[data-todo-count]');
  cnt.forEach(function(el){ el.textContent=todos.length; });
  var idx=-1;
  var nextBtn=document.querySelector('[data-todo-next]');
  if(nextBtn) nextBtn.addEventListener('click',function(){
    if(!todos.length) return;
    if(body.classList.contains('hide-todo')) body.classList.remove('hide-todo');
    idx=(idx+1)%todos.length;
    var t=todos[idx];
    t.scrollIntoView({behavior:'smooth',block:'center'});
    t.animate && t.animate([{boxShadow:'0 0 0 0 rgba(229,138,0,.6)'},{boxShadow:'0 0 0 10px rgba(229,138,0,0)'}],{duration:900,iterations:2});
  });
  var hideBtn=document.querySelector('[data-todo-toggle]');
  if(hideBtn) hideBtn.addEventListener('click',function(){
    body.classList.toggle('hide-todo');
    hideBtn.textContent = body.classList.contains('hide-todo') ? '더미 표시' : '더미 숨기기';
    requestAnimationFrame(drawAll);
  });

  /* 어노테이션 연결선 (Concept A) */
  var NS='http://www.w3.org/2000/svg';
  var annos=[].slice.call(document.querySelectorAll('.anno'));
  function draw(a){
    var svg=a.querySelector('.anno-lines');
    if(!svg){ svg=document.createElementNS(NS,'svg'); svg.setAttribute('class','anno-lines'); svg.setAttribute('aria-hidden','true'); a.appendChild(svg); }
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    if(getComputedStyle(svg).display==='none') return;
    var ar=a.getBoundingClientRect();
    var flip=a.classList.contains('flip');
    a.querySelectorAll('.note[data-n]').forEach(function(n){
      var pin=a.querySelector('.pin[data-n="'+n.dataset.n+'"]'); if(!pin||!pin.offsetParent) return;
      var pr=pin.getBoundingClientRect(), nr=n.getBoundingClientRect();
      var px=pr.left+pr.width/2-ar.left, py=pr.top+pr.height/2-ar.top;
      var ex=(flip? nr.right+13 : nr.left-13)-ar.left, ey=nr.top+31-ar.top;
      var kx=flip? ex+30 : ex-30;
      var p=document.createElementNS(NS,'path');
      p.setAttribute('d','M'+px+' '+py+' L'+kx+' '+ey+' L'+ex+' '+ey);
      p.dataset.n=n.dataset.n;
      svg.appendChild(p);
    });
  }
  function drawAll(){ annos.forEach(draw); }
  function sync(a,n,on){
    a.querySelectorAll('[data-n="'+n+'"]').forEach(function(el){ el.classList.toggle('on',on); });
  }
  annos.forEach(function(a){
    a.querySelectorAll('.note[data-n],.pin[data-n]').forEach(function(el){
      el.addEventListener('mouseenter',function(){ sync(a,el.dataset.n,true); });
      el.addEventListener('mouseleave',function(){ sync(a,el.dataset.n,false); });
    });
    a.querySelectorAll('img').forEach(function(img){ if(!img.complete) img.addEventListener('load',function(){ draw(a); }); });
  });
  /* 어노테이션 이미지 넘기기 */
  document.querySelectorAll('[data-slider]').forEach(function(m){
    var a=m.closest('.anno'), frames=[].slice.call(m.querySelectorAll('[data-slide]')), cur=0;
    var prev=m.querySelector('[data-dir="-1"]'), next=m.querySelector('[data-dir="1"]'), cnt=m.querySelector('.slide-count b');
    function go(i){
      cur=Math.max(0,Math.min(frames.length-1,i));
      frames.forEach(function(f,k){ f.classList.toggle('is-on',k===cur); });
      var id=frames[cur].dataset.slide;
      a.querySelectorAll('.note[data-slide]').forEach(function(n){ n.classList.toggle('off',n.dataset.slide!==id); });
      if(cnt) cnt.textContent=cur+1; var tt=m.querySelector('.slide-title'); if(tt) tt.textContent=frames[cur].dataset.title||''; prev.disabled=cur===0; next.disabled=cur===frames.length-1;
      draw(a);
    }
    prev.addEventListener('click',function(){ go(cur-1); });
    next.addEventListener('click',function(){ go(cur+1); });
    a.querySelectorAll('.note[data-slide]').forEach(function(n){
      n.addEventListener('click',function(){ if(n.classList.contains('off')) go(frames.findIndex(function(f){return f.dataset.slide===n.dataset.slide;})); });
    });
    go(0);
  });
  window.addEventListener('resize',function(){ requestAnimationFrame(drawAll); });
  window.addEventListener('load',drawAll);
  drawAll();

  /* 라이트박스: 원본 전체 보기 */
  var lb=document.createElement('div'); lb.className='lb';
  lb.innerHTML='<button type="button" aria-label="닫기">×</button><img alt="">';
  document.body.appendChild(lb);
  var lbImg=lb.querySelector('img');
  function close(){ lb.classList.remove('open'); document.documentElement.style.overflow=''; }
  lb.addEventListener('click',function(e){ if(e.target===lb||e.target.tagName==='BUTTON') close(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') close(); });
  document.querySelectorAll('[data-zoom]').forEach(function(b){
    b.addEventListener('click',function(){
      lbImg.src=b.getAttribute('data-zoom'); lbImg.alt=b.getAttribute('aria-label')||'';
      lb.classList.add('open'); lb.scrollTop=0; document.documentElement.style.overflow='hidden';
    });
  });

  /* 등장 모션 */
  var rv=[].slice.call(document.querySelectorAll('.rv'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); setTimeout(drawAll,750); } });
    },{rootMargin:'0px 0px -8% 0px'});
    rv.forEach(function(el){ io.observe(el); });
  } else rv.forEach(function(el){ el.classList.add('in'); });

  /* 영상: 화면에 보일 때만 재생 */
  var vids=[].slice.call(document.querySelectorAll('video[data-autoplay]'));
  if('IntersectionObserver' in window){
    var vo=new IntersectionObserver(function(es){
      es.forEach(function(e){ var v=e.target; if(e.isIntersecting){ var p=v.play(); p&&p.catch&&p.catch(function(){}); } else v.pause(); });
    },{threshold:.35});
    vids.forEach(function(v){ vo.observe(v); });
  }
})();
