
/* site.js – carrega acervo.txt, gera categorias, busca e grid */
const ARQUIVO_TXT = 'acervo.txt';
let gifs = [];

window.addEventListener('DOMContentLoaded', () => {
  verificarIdade();
  carregarAcervo();
});

function verificarIdade(){
  const aceito = localStorage.getItem('idadeOk');
  const popup = document.getElementById('age-popup');
  if(aceito){
    popup.style.display = 'none';
  }else{
    popup.style.display = 'flex';
  }
}

function aceitarIdade(){
  localStorage.setItem('idadeOk','sim');
  document.getElementById('age-popup').style.display = 'none';
}

async function carregarAcervo(){
  try{
    const resp = await fetch(ARQUIVO_TXT);
    if(!resp.ok) throw new Error('Erro ao buscar acervo');
    const txt = await resp.text();
    gifs = txt.trim().split('\n').filter(l=>l).map(l=>{
      const [title,src,categoria,tagsStr,fonte] = l.split('|').map(s=>s.trim());
      return {title,src,categoria,tags:tagsStr.split(',').map(t=>t.trim()),fonte};
    });
    inicializarSite();
  }catch(e){
    console.error(e);
    document.getElementById('gifs-grid').innerHTML='<p style="color:#f66">Falha ao carregar acervo</p>';
  }
}

function inicializarSite(){
  const cats = [...new Set(gifs.map(g=>g.categoria))].sort();
  const ul = document.getElementById('categorias');
  ul.innerHTML='';
  cats.forEach(cat=>{
    const li=document.createElement('li');
    li.textContent=cat;
    li.onclick=()=>{document.querySelectorAll('#categorias li').forEach(x=>x.classList.remove('selected'));li.classList.add('selected');renderGifs(gifs.filter(g=>g.categoria===cat));};
    ul.appendChild(li);
  });
  renderGifs(gifs);
}

function renderGifs(lista){
  const grid=document.getElementById('gifs-grid');
  const nada=document.getElementById('sem-resultados');
  grid.innerHTML='';
  if(!lista.length){nada.style.display='block';return;}
  nada.style.display='none';
  lista.forEach(g=>{
    const card=document.createElement('div');card.className='gif-card';
    const vid=document.createElement('video');vid.src=g.src;vid.autoplay=true;vid.loop=true;vid.muted=true;vid.playsInline=true;
    const title=document.createElement('div');title.className='gif-title';title.textContent=g.title;
    const cat=document.createElement('div');cat.className='gif-categoria';cat.textContent=g.categoria;
    const tags=document.createElement('div');tags.className='gif-tags';tags.textContent=g.tags.join(', ');
    const fonte=document.createElement('a');fonte.className='gif-fonte';fonte.href=g.fonte;fonte.target='_blank';fonte.rel='noopener';fonte.textContent='Ver na fonte';
    const btns=document.createElement('div');btns.className='gif-btns';
    const copy=document.createElement('button');copy.textContent='Copiar link';copy.onclick=()=>copiarLink(g.src,copy);
    btns.appendChild(copy);
    card.append(vid,title,cat,tags,fonte,btns);
    grid.appendChild(card);
  });
}

function buscarGifs(){
  const termo=document.getElementById('busca').value.trim().toLowerCase();
  const selected=document.querySelector('#categorias .selected');
  let base=selected?gifs.filter(g=>g.categoria===selected.textContent):gifs;
  if(!termo){renderGifs(base);return;}
  renderGifs(base.filter(g=>g.title.toLowerCase().includes(termo)||g.tags.some(t=>t.toLowerCase().includes(termo))));
}

function copiarLink(url,btn){
  navigator.clipboard.writeText(url).then(()=>{btn.textContent='Copiado!';setTimeout(()=>btn.textContent='Copiar link',1500);});
}

