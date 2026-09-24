import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Search, SlidersHorizontal, Star, Trophy, Zap } from 'lucide-react';
import { squads } from './squads.js';

const portraits = {
  'Kylian Mbappé':'https://commons.wikimedia.org/wiki/Special:FilePath/Kylian%20Mbapp%C3%A9%20(cropped).png?width=700',
  'Jude Bellingham':'https://commons.wikimedia.org/wiki/Special:FilePath/Jude%20Bellingham%20Laureus%202024%20(cropped2).jpg?width=700',
  'Erling Haaland':'https://commons.wikimedia.org/wiki/Special:FilePath/Erling%20Haaland%202023%20(fullcropped-v2).jpg?width=700',
  'Vinícius Júnior':'https://commons.wikimedia.org/wiki/Special:FilePath/Ldc-20241028150142-9822.jpg?width=700',
  'Lamine Yamal':'https://commons.wikimedia.org/wiki/Special:FilePath/Lamine%20Yamal%20in%202025%20(cropped2).jpg?width=700',
  'Thibaut Courtois':'https://commons.wikimedia.org/wiki/Special:FilePath/Thibaut%20Courtois%20WC2022.jpg?width=700',
};
const allPlayers = squads.flatMap((team,teamIndex)=>team.players.map((player,index)=>({
  ...player, club:team.team, teamIndex, id:`${team.team}-${player.number}-${player.name}-${index}`,
  image:portraits[player.name], no:String(player.number).padStart(2,'0'), color:['#dcff48','#c9adff','#8ee5ff','#ff9775','#ff8ba7','#ffd46a'][teamIndex%6],
  shape:['sun','orb','bolt','flare','star'][index%5],
})));

function PlayerCard({player,index}) {
  const [saved,setSaved]=useState(false);
  const [portrait,setPortrait]=useState(player.image||'');
  const cardRef=useRef(null);
  const initials=player.name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase();
  useEffect(()=>{
    if(player.image||!cardRef.current)return;
    let cancelled=false;
    const observer=new IntersectionObserver(entries=>{
      if(!entries.some(entry=>entry.isIntersecting))return;
      observer.disconnect();
      const params=new URLSearchParams({action:'query',format:'json',prop:'pageimages',piprop:'thumbnail',pithumbsize:'600',titles:player.name,origin:'*'});
      fetch(`https://en.wikipedia.org/w/api.php?${params}`).then(response=>response.json()).then(data=>{
        const page=Object.values(data.query?.pages||{})[0];
        if(!cancelled&&page?.thumbnail?.source)setPortrait(page.thumbnail.source);
      }).catch(()=>{});
    },{rootMargin:'180px'});
    observer.observe(cardRef.current);
    return()=>{cancelled=true;observer.disconnect()};
  },[player.id,player.image,player.name]);
  return <article ref={cardRef} className="player-card" style={{'--accent':player.color,'--delay':`${Math.min(index*10,280)}ms`}}>
    <div className="card-top"><span className="edition">UCL / 26—27</span><button className={`save ${saved?'saved':''}`} aria-label={`Save ${player.name}`} onClick={()=>setSaved(!saved)}><Star size={17} fill={saved?'currentColor':'none'}/></button></div>
    <div className={`art art-${player.shape}`}><div className="halo"/><div className="rings"/><span className="player-number">{player.no}</span>{portrait?<img src={portrait} alt={player.name} loading="lazy" referrerPolicy="no-referrer" onError={()=>setPortrait('')}/>:<div className="initials-art" aria-hidden="true"><span>{initials}</span><i>{player.no}</i></div>}<span className="art-caption">{player.nationality} <b>•</b> OFFICIAL SQUAD</span></div>
    <div className="card-content"><div className="player-heading"><div><span className="role">{player.role}</span><h2>{player.name}</h2></div><div className="rating"><small>NO.</small><strong>{player.no}</strong></div></div>
      <div className="club-line"><span className="nation-code">{player.nationality}</span><span>{player.club}</span><ArrowUpRight size={14}/></div>
      <div className="card-bottom"><span className="tag">✳ UEFA CHAMPIONS LEAGUE</span><div className="featured-stat"><span>SQUAD</span><strong>26/27</strong></div></div>
    </div>
    <div className="card-index">{String(index+1).padStart(4,'0')} <span>— PLAYER CARD</span></div>
  </article>
}

export default function App(){
  const [filter,setFilter]=useState('ALL POSITIONS'); const [club,setClub]=useState('ALL CLUBS'); const [search,setSearch]=useState(''); const [sort,setSort]=useState(false);
  const roles=['ALL POSITIONS','GOALKEEPER','DEFENDER','MIDFIELDER','FORWARD'];
  const visible=useMemo(()=>{let out=allPlayers.filter(p=>(filter==='ALL POSITIONS'||p.role===filter)&&(club==='ALL CLUBS'||p.club===club)&&`${p.name} ${p.club} ${p.role} ${p.nationality}`.toLowerCase().includes(search.toLowerCase()));return sort?[...out].sort((a,b)=>Number(a.number)-Number(b.number)):out},[filter,club,search,sort]);
  return <main>
    <header className="nav"><a className="wordmark" href="#top"><span className="mark">✳</span> THE XI<span className="period">.</span></a><div className="nav-center"><span className="live-dot"/> CHAMPIONS LEAGUE <span className="nav-year">/ 2026—27</span></div><a className="nav-link" href="#roster">EXPLORE SQUADS <ArrowDown size={14}/></a></header>
    <section className="hero" id="top"><div className="hero-kicker"><span>36 CLUBS</span><span className="kicker-line"/> THE FULL ROSTER</div><div className="hero-title-wrap"><h1>ONE<br/><span>BIG STAGE.</span></h1><div className="hero-aside"><div className="orbit">UCL</div><p>Every club. Every squad.<br/>A card for every player<br/>in the 2026 / 27 edition.</p><a href="#roster" className="circle-link"><ArrowDown size={19}/></a></div></div><div className="hero-foot"><span>1,262 PLAYERS. ONE COLLECTION.</span><span className="hero-foot-right"><Trophy size={14}/> UEFA CHAMPIONS LEAGUE / 2026—27</span></div><div className="hero-scribble">PLAY<br/>BOLD</div></section>
    <section className="roster" id="roster"><div className="section-head"><div><span className="eyebrow">THE COMPLETE ROSTER <span>✳</span> 2026 / 27</span><h2>EVERY <em>PLAYER</em><span className="accent-dot">.</span></h2></div><p>{allPlayers.length.toLocaleString()} registered players<br/>from all 36 league-phase clubs.</p></div>
      <div className="toolbar"><div className="filters">{roles.map(r=><button key={r} className={filter===r?'active':''} onClick={()=>setFilter(r)}>{r}</button>)}</div><div className="tools"><label className="search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a player or club"/></label><select className="club-select" aria-label="Filter by club" value={club} onChange={e=>setClub(e.target.value)}><option>ALL CLUBS</option>{squads.map(team=><option key={team.team}>{team.team}</option>)}</select><button className={`sort ${sort?'is-sorted':''}`} title="Sort by squad number" onClick={()=>setSort(!sort)}><SlidersHorizontal size={16}/><span>SHIRT NO.</span>{sort?<ArrowDown size={13}/>:<ArrowUpRight size={13}/>}</button></div></div>
      <div className="result-count">SHOWING {visible.length.toLocaleString()} PLAYER CARDS</div><div className="grid">{visible.map((p,i)=><PlayerCard key={p.id} player={p} index={i}/>)}</div>{visible.length===0&&<div className="empty">No players found. Try another name or club.</div>}
    </section>
    <section className="manifesto"><div className="manifesto-mark">✳</div><span className="eyebrow">36 CLUBS. ONE CONTINENT.</span><h2>THE BEAUTY OF THE GAME<br/><em>IS IN EVERY PLAYER.</em></h2><div className="manifesto-foot"><span>EVERY SQUAD.<br/>EVERY STORY.</span><span className="manifesto-line"/><span>THE XI — UCL 2026 / 27</span><Zap size={18}/></div></section>
    <footer><a className="wordmark" href="#top"><span className="mark">✳</span> THE XI<span className="period">.</span></a><span>MADE FOR THE LOVE OF THE GAME.</span><a href="#top" className="backtop">BACK TO TOP ↑</a></footer>
  </main>
}
