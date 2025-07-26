
/* site.js – carrega acervo.txt, gera categorias, busca e grid */
const ARQUIVO_TXT = 'acervo.txt';
let gifs = [];
let selectedCategoria = null;
let selectedSubcategoria = null;

window.addEventListener('DOMContentLoaded', () => {
  carregarAcervo();
});

async function carregarAcervo(){
  try{
    const resp = await fetch(ARQUIVO_TXT);
    if(!resp.ok) throw new Error('Erro ao buscar acervo');
    const txt = await resp.text();
    gifs = txt.trim().split('\n').filter(l=>l).map(l=>{
      const [title,src,categoria,subcategoria,tagsStr,fonte] = l.split('|').map(s=>s.trim());
      return {title,src,categoria,subcategoria,tags:tagsStr.split(',').map(t=>t.trim()),fonte};
    });
    inicializarSite();
  }catch(e){
    console.error(e);
    document.getElementById('gifs-grid').innerHTML='<p style="color:#f66">Falha ao carregar acervo</p>';
  }
}

function inicializarSite(){
  // Com a nova sidebar estática, apenas renderizamos todos os GIFs
  buscarGifs();
}

function renderSubcategorias(cat){
  const subUl=document.getElementById('subcategorias');
  subUl.innerHTML='';
  if(!cat){return;}
  const subs=[...new Set(gifs.filter(g=>g.categoria===cat).map(g=>g.subcategoria))].sort();
  const todas=document.createElement('li');
  todas.textContent='Todas';
  todas.classList.add('selected');
  todas.onclick=()=>{
    document.querySelectorAll('#subcategorias li').forEach(x=>x.classList.remove('selected'));
    todas.classList.add('selected');
    selectedSubcategoria=null;
    buscarGifs();
  };
  subUl.appendChild(todas);
  subs.forEach(sub=>{
    const li=document.createElement('li');
    li.textContent=sub;
    li.onclick=()=>{
      document.querySelectorAll('#subcategorias li').forEach(x=>x.classList.remove('selected'));
      li.classList.add('selected');
      selectedSubcategoria=sub;
      buscarGifs();
    };
    subUl.appendChild(li);
  });
}

function renderGifs(lista){
  const grid=document.getElementById('gifs-grid');
  const nada=document.getElementById('sem-resultados');
  grid.innerHTML='';
  if(!lista.length){nada.style.display='block';return;}
  nada.style.display='none';
  lista.forEach(g=>{
    const card=document.createElement('div');card.className='gif-card';
    let media;
    if(/\.(mp4|webm)$/i.test(g.src)){
      media=document.createElement('video');
      media.src=g.src;
      media.autoplay=true;media.loop=true;media.muted=true;media.playsInline=true;
    }else{
      media=document.createElement('img');
      media.src=g.src;
    }
    const title=document.createElement('div');title.className='gif-title';title.textContent=g.title;
    const cat=document.createElement('div');cat.className='gif-categoria';cat.textContent=g.categoria;
    const sub=document.createElement('div');sub.className='gif-subcategoria';sub.textContent=g.subcategoria;
    const tags=document.createElement('div');tags.className='gif-tags';tags.textContent=g.tags.join(', ');
    const fonte=document.createElement('a');fonte.className='gif-fonte';fonte.href=g.fonte;fonte.target='_blank';fonte.rel='noopener';fonte.textContent='Ver na fonte';
    const btns=document.createElement('div');btns.className='gif-btns';
    const copy=document.createElement('button');copy.textContent='Copiar link';copy.onclick=()=>copiarLink(g.src,copy);
    btns.appendChild(copy);
    card.append(media,title,cat,sub,tags,fonte,btns);
    grid.appendChild(card);
  });
}

function buscarGifs(){
  const termo=document.getElementById('busca').value.trim().toLowerCase();
  let base=gifs;
  if(selectedCategoria) base=base.filter(g=>g.categoria===selectedCategoria);
  if(selectedSubcategoria) base=base.filter(g=>g.subcategoria===selectedSubcategoria);
  if(!termo){renderGifs(base);return;}
  renderGifs(base.filter(g=>g.title.toLowerCase().includes(termo)||g.tags.some(t=>t.toLowerCase().includes(termo))));
}

function copiarLink(url,btn){
  navigator.clipboard.writeText(url).then(()=>{btn.textContent='Copiado!';setTimeout(()=>btn.textContent='Copiar link',1500);});
}
