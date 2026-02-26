"use client";
import { useState, useRef, useEffect, createContext, useContext, useCallback } from "react";

const C = {bg:"#0a0a0a",white:"#fff",dim:"#9ca3af",dimmer:"#6b7280",blue:"#3b82f6",red:"#ef4444",gold:"#d4a853"};
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const lerp = (a,b,t)=>a+(b-a)*t;
const clamp = (v,lo,hi)=>Math.max(lo,Math.min(hi,v));

const PHONE_W=375, PHONE_H=780, HEADER_H=84, NAV_H=56;
const SCROLL_H = PHONE_H - HEADER_H - NAV_H;
const HERO_SCROLL=300, RUNWAY=220, CARD_SCROLL=400;

const CAT_STYLE = {
  TOP:{badge:"BREAKING",bc:"#dc2626",bg:"linear-gradient(135deg,#1a1f2e,#0d1117 40%,#1a1520)"},
  POLITICS:{badge:"POLITICS",bc:"#7c3aed",bg:"linear-gradient(135deg,#1a1a2e,#0d1117 40%,#15152a)"},
  WORLD:{badge:"WORLD",bc:"#0891b2",bg:"linear-gradient(135deg,#0a2535,#0d1117 40%,#0a1a2a)"},
  US:{badge:"US NEWS",bc:"#2563eb",bg:"linear-gradient(135deg,#0a1a3a,#0d1117 40%,#0a1530)"},
  HEALTH:{badge:"HEALTH",bc:"#059669",bg:"linear-gradient(135deg,#0a2a1a,#0d1117 40%,#0a2015)"},
  TECH:{badge:"TECH",bc:"#8b5cf6",bg:"linear-gradient(135deg,#1a1530,#0d1117 40%,#15102a)"},
  SPORTS:{badge:"SPORTS",bc:"#ea580c",bg:"linear-gradient(135deg,#2a1a0a,#0d1117 40%,#1a1008)"},
};
const fallbackStyle = CAT_STYLE.TOP;
const DataCtx = createContext({timeline:[],topics:[],articles:[]});

/* ─── NBC Peacock ─── */
const PeacockNav = () => {
  const cx=50,cy=58,r=38;
  const cols=["#e1a91a","#6db335","#009fdb","#6e44a0","#e45a28","#cc2027"];
  return <svg width="28" height="28" viewBox="0 0 100 100">{cols.map((c,i)=>{
    const a0=Math.PI+i*(Math.PI/6),a1=a0+Math.PI/6;
    return <path key={i} d={`M${cx},${cy} L${cx+r*Math.cos(a0)},${cy+r*Math.sin(a0)} A${r},${r} 0 0,1 ${cx+r*Math.cos(a1)},${cy+r*Math.sin(a1)} Z`} fill={c}/>;
  })}<ellipse cx={cx} cy={cy-2} rx="5" ry="7" fill="#fff"/></svg>;
};

/* ─── Image background with fallback ─── */
const ImgBg = ({src,category}) => src
  ? <div style={{position:"absolute",inset:0,backgroundImage:`url("${src}")`,backgroundSize:"cover",backgroundPosition:"center"}}/>
  : <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:(CAT_STYLE[category]||fallbackStyle).bg}}>
      <div style={{opacity:.08,fontSize:120,fontWeight:900,color:"#fff",letterSpacing:"-0.05em",userSelect:"none"}}>NBC</div>
    </div>;

/* ─── Tab bar (always Briefing / Insider / Signal) ─── */
const SLOTS = ["Briefing","middle","Signal"];
const TabBar = ({active,onChange}) => {
  const labels=["Briefing","Insider","Signal"];
  const idx=SLOTS.indexOf(active);
  return <div style={{display:"flex",background:"rgba(255,255,255,.07)",borderRadius:22,padding:3,position:"relative"}}>
    <div style={{position:"absolute",top:3,bottom:3,borderRadius:18,background:"rgba(255,255,255,.13)",width:`calc((100% - 6px)/3)`,left:`calc(3px + ${idx}*(100% - 6px)/3)`,transition:"left .25s cubic-bezier(.4,0,.2,1)",pointerEvents:"none"}}/>
    {SLOTS.map((s,i)=><button key={s} onClick={()=>onChange(s)} style={{flex:1,padding:"7px 0",fontSize:11.5,fontWeight:active===s?700:500,color:active===s?C.white:"rgba(255,255,255,.4)",background:"transparent",border:"none",borderRadius:18,cursor:"pointer",position:"relative",zIndex:1}}>{labels[i]}</button>)}
  </div>;
};

/* ─── Hero ─── */
const BriefingHero = () => {
  const ref=useRef(null);
  useEffect(()=>{
    const c=ref.current; if(!c) return;
    const W=750,H=760; c.width=W; c.height=H;
    const ctx=c.getContext("2d");
    let seed=42;const rng=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
    const wood=ctx.createLinearGradient(0,0,W,H);
    wood.addColorStop(0,"#18120c");wood.addColorStop(.3,"#14100a");wood.addColorStop(.6,"#100e08");wood.addColorStop(1,"#18140e");
    ctx.fillStyle=wood;ctx.fillRect(0,0,W,H);
    for(let i=0;i<80;i++){let x=rng()*W;ctx.strokeStyle=`rgba(${55+rng()*35},${40+rng()*25},${25+rng()*15},${.03+rng()*.04})`;ctx.lineWidth=.5+rng()*1.5;ctx.beginPath();ctx.moveTo(x,0);for(let y=0;y<H;y+=20){x+=(rng()-.5)*4;ctx.lineTo(x,y);}ctx.stroke();}
    for(let i=0;i<4000;i++){ctx.fillStyle=`rgba(${rng()>.5?255:0},${rng()>.5?255:0},${rng()>.5?255:0},${.005+rng()*.01})`;ctx.fillRect(rng()*W,rng()*H,1,1);}
    const lamp=ctx.createRadialGradient(W*.78,H*.05,20,W*.78,H*.05,350);lamp.addColorStop(0,"rgba(255,210,140,.10)");lamp.addColorStop(.4,"rgba(255,190,110,.04)");lamp.addColorStop(1,"transparent");ctx.fillStyle=lamp;ctx.fillRect(0,0,W,H);
    const dp=(x,y,w,h,ang,br)=>{ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate(ang*Math.PI/180);ctx.shadowColor="rgba(0,0,0,.35)";ctx.shadowBlur=18;ctx.shadowOffsetY=6;const pg=ctx.createLinearGradient(-w/2,-h/2,w/2,h/2);pg.addColorStop(0,`rgb(${225*br},${220*br},${210*br})`);pg.addColorStop(1,`rgb(${208*br},${203*br},${193*br})`);ctx.fillStyle=pg;ctx.fillRect(-w/2,-h/2,w,h);ctx.shadowColor="transparent";for(let i=0;i<12;i++){const ly=-h/2+28+i*(h*.065);if(ly>h/2-20)break;ctx.fillStyle=`rgba(50,42,35,${i<2?.22:.1})`;ctx.fillRect(-w/2+24,ly,(.4+rng()*.45)*w,2);}ctx.restore();};
    const fX=W*.1,fY=H*.09,fW=W*.8,fH=H*.52;ctx.save();ctx.translate(fX+fW/2,fY+fH/2);ctx.rotate(-1.8*Math.PI/180);ctx.shadowColor="rgba(0,0,0,.5)";ctx.shadowBlur=30;ctx.shadowOffsetY=10;const fg=ctx.createLinearGradient(-fW/2,-fH/2,fW/2,fH/2);fg.addColorStop(0,"#c9aa68");fg.addColorStop(1,"#9e7e40");ctx.fillStyle=fg;ctx.beginPath();ctx.roundRect(-fW/2,-fH/2,fW,fH,4);ctx.fill();ctx.shadowColor="transparent";ctx.fillStyle="#c8aa6a";ctx.beginPath();ctx.roundRect(-fW/2+45,-fH/2-28,130,30,[5,5,0,0]);ctx.fill();ctx.restore();
    dp(W*.15,H*.1,W*.48,H*.38,-2.5,.96);dp(W*.3,H*.07,W*.52,H*.42,1.2,1.0);
    ctx.save();ctx.translate(fX+fW/2,fY+fH/2);ctx.rotate(-1.8*Math.PI/180);const flap=ctx.createLinearGradient(0,fH*.15,0,fH/2);flap.addColorStop(0,"rgba(185,150,82,0)");flap.addColorStop(1,"rgba(170,138,72,.85)");ctx.fillStyle=flap;ctx.fillRect(-fW/2,fH*.15,fW,fH*.36);ctx.restore();
    const vig=ctx.createLinearGradient(0,H*.42,0,H);vig.addColorStop(0,"rgba(10,10,10,0)");vig.addColorStop(.3,"rgba(10,10,10,.5)");vig.addColorStop(1,"rgba(10,10,10,.97)");ctx.fillStyle=vig;ctx.fillRect(0,H*.42,W,H*.58);
    const ev=ctx.createRadialGradient(W/2,H*.35,W*.25,W/2,H*.35,W*.8);ev.addColorStop(0,"transparent");ev.addColorStop(1,"rgba(0,0,0,.3)");ctx.fillStyle=ev;ctx.fillRect(0,0,W,H);
  },[]);
  const now=new Date(), h=now.getHours(), m=now.getMinutes();
  const time=`${((h+11)%12)+1}:${String(m).padStart(2,"0")}${h>=12?"PM":"AM"}`;
  return <div style={{width:"100%",height:"100%",position:"relative"}}>
    <canvas ref={ref} style={{width:"100%",height:"100%",display:"block"}}/>
    <div style={{position:"absolute",top:0,left:0,right:0,height:"55%",background:"linear-gradient(to bottom,rgba(10,10,10,.85),transparent)",pointerEvents:"none"}}/>
    <div style={{position:"absolute",top:28,left:0,right:0,textAlign:"center",padding:"0 24px"}}>
      <div style={{fontSize:23,fontWeight:300,color:C.white,lineHeight:1.35,letterSpacing:"-.02em"}}>It's {time}.</div>
      <div style={{fontSize:23,fontWeight:300,color:C.white,lineHeight:1.35,letterSpacing:"-.02em"}}>Here's your briefing.</div>
    </div>
  </div>;
};

/* ─── Compact card (in the stack at the bottom) ─── */
const CompactCard = ({item, offset}) => {
  const s = CAT_STYLE[item.category]||fallbackStyle;
  const timeStr = item.pubDate ? new Date(item.pubDate).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}) : "";
  return <div style={{
    position:"absolute",
    bottom: 12 + offset * 8,
    left: 14 + offset * 3,
    right: 14 + offset * 3,
    height: 110,
    borderRadius: 14,
    overflow:"hidden",
    background: s.bg,
    zIndex: 10 - offset,
    opacity: 1 - offset * 0.12,
    transition:"all .35s cubic-bezier(.4,0,.2,1)",
    boxShadow:"0 -2px 12px rgba(0,0,0,.4)",
  }}>
    <ImgBg src={item.image} category={item.category}/>
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.35)"}}/>
    <div style={{position:"absolute",top:10,left:12,display:"flex",alignItems:"center",gap:6,zIndex:3}}>
      <span style={{background:s.bc,color:C.white,fontSize:8,fontWeight:800,padding:"2px 6px",borderRadius:4,letterSpacing:".06em"}}>{s.badge}</span>
      {timeStr&&<span style={{color:"rgba(255,255,255,.8)",fontSize:9,fontWeight:600,textShadow:"0 1px 4px rgba(0,0,0,.8)"}}>{timeStr}</span>}
    </div>
    <div style={{position:"absolute",top:10,right:12,zIndex:3}}>
      <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(0,0,0,.35)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span style={{color:"rgba(255,255,255,.7)",fontSize:10,marginLeft:2}}>▶</span>
      </div>
    </div>
    <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"48px 14px 12px",background:"linear-gradient(to top,rgba(0,0,0,.96) 0%,rgba(0,0,0,.6) 55%,transparent)",zIndex:3}}>
      <div style={{fontSize:13,fontWeight:600,color:C.white,lineHeight:1.35,letterSpacing:"-.01em"}}>{item.title}</div>
    </div>
  </div>;
};

/* ─── "Go deeper" pill ─── */
const DeeperPill = ({onClick}) => (
  <button onClick={onClick} style={{
    display:"flex",alignItems:"center",gap:6,
    padding:"8px 18px",borderRadius:20,
    background:"rgba(59,130,246,.12)",
    border:"1px solid rgba(59,130,246,.25)",
    backdropFilter:"blur(8px)",
    cursor:"pointer",
    animation:"pill-glow 2.5s ease-in-out infinite",
  }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
    </svg>
    <span style={{fontSize:11.5,fontWeight:600,color:C.blue,letterSpacing:"-.01em"}}>Go deeper</span>
    <span style={{fontSize:11,color:"rgba(59,130,246,.6)"}}>↑</span>
  </button>
);

/* ─── Active card (expanding to full bleed) ─── */
const ActiveCard = ({progress:p, item, onDeeper}) => {
  const s = CAT_STYLE[item.category]||fallbackStyle;
  const m=lerp(14,0,p), h=lerp(110,SCROLL_H,p), r=lerp(14,0,p);
  const bottomStart = SCROLL_H - 140;
  const topPos = lerp(bottomStart, 0, p);
  const compOp=clamp(1-p*3,0,1), fullOp=clamp((p-.15)/.45,0,1);
  const play=lerp(0,72,clamp((p-.25)/.5,0,1));
  const chyOp=clamp((p-.55)/.3,0,1);
  const pillOp=clamp((p-.75)/.2,0,1);
  const timeStr = item.pubDate ? new Date(item.pubDate).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}) : "";
  return <div style={{position:"absolute",top:topPos,left:m,right:m,height:Math.min(h,SCROLL_H-topPos),borderRadius:r,overflow:"hidden",background:s.bg,zIndex:20,boxShadow:"0 -4px 24px rgba(0,0,0,.5)",transition:"none"}}>
    <ImgBg src={item.image} category={item.category}/>
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.35)"}}/>
    {play>4&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:2,opacity:fullOp}}>
      <div style={{width:play,height:play,borderRadius:"50%",background:"rgba(0,0,0,.5)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid rgba(255,255,255,.2)"}}>
        <span style={{color:"#fff",fontSize:play*.38,marginLeft:play*.04}}>▶</span>
      </div>
    </div>}
    <div style={{position:"absolute",top:lerp(10,14,p),left:lerp(12,14,p),display:"flex",alignItems:"center",gap:6,zIndex:3}}>
      <span style={{background:s.bc,color:C.white,fontSize:lerp(8,9,p),fontWeight:800,padding:`${lerp(2,3,p)}px ${lerp(6,8,p)}px`,borderRadius:4,letterSpacing:".06em"}}>{s.badge}</span>
      {timeStr&&<span style={{color:"rgba(255,255,255,.8)",fontSize:lerp(9,10,p),fontWeight:600,textShadow:"0 1px 4px rgba(0,0,0,.8)"}}>{timeStr}</span>}
    </div>
    <div style={{position:"absolute",top:lerp(10,14,p),right:14,zIndex:3,opacity:fullOp}}>
      <span style={{background:"rgba(0,0,0,.55)",backdropFilter:"blur(4px)",color:"#fff",fontSize:10,fontWeight:600,padding:"3px 10px",borderRadius:8}}>{item.author}</span>
    </div>
    <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"48px 14px 12px",background:"linear-gradient(to top,rgba(0,0,0,.96) 0%,rgba(0,0,0,.6) 55%,transparent)",zIndex:3,opacity:compOp}}>
      <div style={{fontSize:13,fontWeight:600,color:C.white,lineHeight:1.35,letterSpacing:"-.01em"}}>{item.title}</div>
    </div>
    <div style={{position:"absolute",top:10,right:12,zIndex:3,opacity:compOp}}>
      <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(0,0,0,.35)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span style={{color:"rgba(255,255,255,.7)",fontSize:10,marginLeft:2}}>▶</span>
      </div>
    </div>
    {/* Chyron bar */}
    <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:4,opacity:chyOp}}>
      <div style={{display:"flex",alignItems:"stretch"}}>
        <div style={{background:s.bc,padding:"7px 12px",display:"flex",alignItems:"center",flexShrink:0}}>
          <span style={{color:"#fff",fontSize:8.5,fontWeight:800,letterSpacing:".08em"}}>{s.badge}</span>
        </div>
        <div style={{flex:1,background:"rgba(0,0,0,.9)",backdropFilter:"blur(8px)",padding:"7px 12px",display:"flex",alignItems:"center"}}>
          <span style={{color:"#fff",fontSize:10.5,fontWeight:700,lineHeight:1.25,letterSpacing:"-.01em"}}>{item.title?.toUpperCase().slice(0,60)}</span>
        </div>
      </div>
      <div style={{background:"rgba(0,0,0,.8)",padding:"4px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{color:"rgba(255,255,255,.4)",fontSize:8.5,fontWeight:700,letterSpacing:".06em"}}>NBC NEWS</span>
        <span style={{color:"rgba(255,255,255,.35)",fontSize:8.5}}>{item.author} · LIVE</span>
      </div>
    </div>
    {/* "Go deeper" pill — fades in when card is nearly full */}
    {pillOp>0 && <div style={{position:"absolute",bottom:52,left:0,right:0,zIndex:5,display:"flex",justifyContent:"center",opacity:pillOp,transform:`translateY(${lerp(10,0,pillOp)}px)`,transition:"none"}}>
      <DeeperPill onClick={()=>onDeeper(item.id)}/>
    </div>}
  </div>;
};

/* ─── Briefing tab (card stack scroll) ─── */
const BriefingTab = ({scrollEl, onDeeper}) => {
  const {timeline} = useContext(DataCtx);
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [heroOp, setHeroOp] = useState(1);

  const totalH = HERO_SCROLL + timeline.length * CARD_SCROLL + SCROLL_H;

  useEffect(()=>{
    const el=scrollEl.current; if(!el) return;
    const handler=()=>{
      const s=el.scrollTop;
      setHeroOp(clamp(1 - s/HERO_SCROLL, 0, 1));
      const cardStart = Math.max(0, s - HERO_SCROLL * 0.3);
      const idx=Math.min(Math.floor(cardStart/CARD_SCROLL), timeline.length-1);
      const p=clamp((cardStart - idx*CARD_SCROLL)/RUNWAY, 0, 1);
      setActiveIdx(idx);
      setProgress(p);
    };
    el.addEventListener("scroll",handler,{passive:true});
    handler();
    return()=>el.removeEventListener("scroll",handler);
  },[scrollEl,timeline]);

  const upcoming = timeline.slice(activeIdx+1).slice(0,3);

  return <div style={{height:totalH}}>
    <div style={{position:"sticky",top:0,height:SCROLL_H,zIndex:1,overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,zIndex:0,opacity:heroOp,pointerEvents:heroOp<.1?"none":"auto"}}>
        <BriefingHero/>
      </div>
      {timeline[activeIdx] && <ActiveCard progress={progress} item={timeline[activeIdx]} onDeeper={onDeeper}/>}
      {upcoming.map((item,i) => <CompactCard key={item.id} item={item} offset={i}/>)}
    </div>
  </div>;
};

/* ─── Bottom Sheet (Deeper chat) ─── */
const SHEET_MAX = SCROLL_H + HEADER_H + NAV_H - 40;
const DeeperSheet = ({articleId, onClose}) => {
  const {articles} = useContext(DataCtx);
  const article = articles.find(a=>a.id===articleId);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [q, setQ] = useState("");
  const [typing, setTyping] = useState(false);
  const [focused, setFocused] = useState(false);
  const endRef = useRef(null);

  useEffect(()=>{requestAnimationFrame(()=>requestAnimationFrame(()=>setOpen(true)));},[]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,typing]);

  const close = () => { setOpen(false); setTimeout(onClose, 320); };

  const sysPrompt = `You are an NBC News AI assistant. The user is asking about this story: "${article?.title}". Description: ${article?.description}. Category: ${article?.category}. Answer concisely in 2-3 sentences based on what you know about this topic.`;

  const send = async (text) => {
    if(!text.trim()||typing) return;
    const next=[...msgs,{role:"user",text:text.trim()}];
    setMsgs(next); setQ(""); setTyping(true);
    try {
      const res = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system:sysPrompt,messages:next.map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text}))})});
      const d = await res.json();
      setMsgs(m=>[...m,{role:"ai",text:d.reply||"Unable to respond right now."}]);
    } catch { setMsgs(m=>[...m,{role:"ai",text:"Having trouble connecting."}]); }
    setTyping(false);
  };

  const s = article ? (CAT_STYLE[article.category]||fallbackStyle) : fallbackStyle;
  const HEADER=88, INPUT_H=76;

  return <>
    {/* Backdrop */}
    <div onClick={close} style={{
      position:"absolute",inset:0,zIndex:30,
      background:"rgba(0,0,0,.55)",
      opacity:open?1:0,
      transition:"opacity .3s ease",
    }}/>
    {/* Sheet */}
    <div style={{
      position:"absolute",bottom:0,left:0,right:0,zIndex:31,
      height:SHEET_MAX,
      background:C.bg,
      borderRadius:"18px 18px 0 0",
      transform:open?"translateY(0)":`translateY(${SHEET_MAX}px)`,
      transition:"transform .32s cubic-bezier(.4,0,.2,1)",
      display:"flex",flexDirection:"column",
      overflow:"hidden",
      boxShadow:"0 -8px 40px rgba(0,0,0,.6)",
    }}>
      {/* Drag handle */}
      <div style={{display:"flex",justifyContent:"center",padding:"10px 0 6px",flexShrink:0}}>
        <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,.2)"}}/>
      </div>
      {/* Story context header */}
      <div style={{height:HEADER,flexShrink:0,padding:"0 16px 12px",display:"flex",gap:12,alignItems:"center",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        {article?.image && <div style={{width:56,height:56,borderRadius:10,overflow:"hidden",flexShrink:0,position:"relative",background:"#111"}}>
          <ImgBg src={article.image} category={article.category}/>
        </div>}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <span style={{background:s.bc,color:C.white,fontSize:7.5,fontWeight:800,padding:"2px 6px",borderRadius:3,letterSpacing:".06em"}}>{s.badge}</span>
            <span style={{fontSize:8,color:"rgba(255,255,255,.3)",fontWeight:700,letterSpacing:".04em"}}>AI ANALYSIS</span>
          </div>
          <div style={{fontSize:12,fontWeight:600,color:C.white,lineHeight:1.35,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{article?.title}</div>
        </div>
        <button onClick={close} style={{background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.1)",borderRadius:"50%",color:C.white,fontSize:13,cursor:"pointer",padding:0,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
      </div>
      {/* Chat area */}
      <div className="hide-scroll" style={{flex:1,overflowY:"auto",padding:"14px 16px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {msgs.map((m,i)=><div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"85%"}}>
            <div style={{background:m.role==="user"?C.blue:"rgba(255,255,255,.07)",border:m.role==="ai"?"1px solid rgba(255,255,255,.1)":"none",color:C.white,borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"10px 14px",fontSize:13.5,lineHeight:1.6}}>{m.text}</div>
          </div>)}
          {typing&&<div style={{alignSelf:"flex-start"}}><div style={{background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.1)",borderRadius:"16px 16px 16px 4px",padding:"12px 16px",display:"flex",gap:5,alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"rgba(255,255,255,.4)",animation:`pulse-dot 1.2s ease-in-out ${i*.18}s infinite`}}/>)}</div></div>}
          <div ref={endRef}/>
        </div>
        {!typing&&msgs.length===0&&<div style={{display:"flex",flexDirection:"column",gap:6,marginTop:4}}>
          <div style={{fontSize:11,color:C.dimmer,marginBottom:4}}>Suggested questions</div>
          {["What happened?","Why does this matter?","What's next?"].map((sg,i)=><button key={i} onClick={()=>send(sg)} style={{padding:"8px 14px",borderRadius:20,background:"rgba(59,130,246,.07)",border:"1px solid rgba(59,130,246,.18)",color:"#d1d5db",fontSize:12,textAlign:"left",cursor:"pointer"}}>{sg}</button>)}
        </div>}
      </div>
      {/* Input */}
      <div style={{height:INPUT_H,flexShrink:0,padding:"8px 16px 14px",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",flexDirection:"column",justifyContent:"center",gap:5}}>
        <div style={{fontSize:8,color:"rgba(255,255,255,.18)",textAlign:"center",letterSpacing:".04em"}}>POWERED BY AI · NBC SOURCES ONLY</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(q)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} placeholder="Ask about this story"
            style={{flex:1,padding:"10px 16px",borderRadius:22,border:focused?"1.5px solid rgba(59,130,246,.5)":"1.5px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.04)",fontSize:13,color:C.white,outline:"none",transition:"border-color .2s"}}/>
          <button onClick={()=>send(q)} style={{width:36,height:36,borderRadius:"50%",background:q.trim()?C.blue:"rgba(255,255,255,.07)",border:"none",color:C.white,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background .2s"}}>→</button>
        </div>
      </div>
    </div>
  </>;
};

/* ─── Insider tab ─── */
const POSTS = [
  {author:"Hallie Jackson",role:"Chief WH Correspondent",time:"3m ago",messages:["Hearing the briefing is being delayed.","We're expecting new information in 20 mins"],live:256},
  {author:"Peter Alexander",role:"NBC News Correspondent",time:"18m ago",messages:["We're so appreciative of everyone's messages of support. We're continuing to learn more and will share as soon as there are further developments."],live:256},
  {author:"Tom Llamas",role:"NBC News NOW Anchor",time:"34m ago",messages:["Just landed. Our crew is heading to the staging area now.","Expect live updates throughout the afternoon."],live:189},
  {author:"Lester Holt",role:"Nightly News Anchor",time:"1h ago",messages:["Tonight on Nightly we'll have full team coverage. Join us at 6:30."],live:412},
  {author:"Andrea Mitchell",role:"Chief Foreign Affairs Correspondent",time:"2h ago",messages:["Sources on the Hill tell me the vote count is tighter than leadership is letting on. A few swing votes still undecided."],live:198},
];
const InsiderTab = () => <div style={{padding:"18px 16px 100px"}}>
  <div style={{fontSize:21,fontWeight:700,color:C.white,marginBottom:3,letterSpacing:"-.02em"}}>The Newsroom</div>
  <div style={{fontSize:11.5,color:"rgba(255,255,255,.35)",marginBottom:18}}>Exclusive updates from our correspondents</div>
  {POSTS.map((p,i)=><div key={i} style={{marginBottom:20,paddingBottom:20,borderBottom:i<POSTS.length-1?"1px solid rgba(255,255,255,.06)":"none"}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
      <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#2a2a3a,#1a1a24)",border:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{color:"rgba(255,255,255,.4)",fontSize:11,fontWeight:700}}>{p.author.split(" ").map(n=>n[0]).join("")}</span>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:12.5,fontWeight:700,color:C.white}}>{p.author}</div>
        <div style={{fontSize:9.5,color:"rgba(255,255,255,.3)",marginTop:1}}>{p.role}</div>
      </div>
      <span style={{fontSize:9.5,color:"rgba(255,255,255,.25)"}}>{p.time}</span>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:4,marginLeft:46}}>
      {p.messages.map((msg,mi)=><div key={mi} style={{background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.07)",borderRadius:mi===0&&p.messages.length>1?"14px 14px 14px 4px":mi===p.messages.length-1&&p.messages.length>1?"4px 14px 14px 14px":"14px",padding:"9px 13px",alignSelf:"flex-start",maxWidth:"92%"}}>
        <span style={{fontSize:12.5,color:"rgba(255,255,255,.9)",lineHeight:1.5}}>{msg}</span>
      </div>)}
    </div>
    <div style={{marginLeft:46,marginTop:8,display:"flex",alignItems:"center",gap:5}}>
      <div style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",animation:"pulse-dot 1.8s ease-in-out infinite"}}/>
      <span style={{fontSize:9.5,color:"rgba(255,255,255,.3)"}}>{p.live} watching live</span>
    </div>
  </div>)}
</div>;

/* ─── Signal tab ─── */
const SignalTab = ({onDeeper}) => {
  const {articles}=useContext(DataCtx);
  const [expanded, setExpanded] = useState(null);
  const featured = articles.filter(a=>a.image).slice(0,3);
  const grouped = {};
  articles.forEach(a=>{if(!grouped[a.category]) grouped[a.category]=[];grouped[a.category].push(a);});
  const sections = Object.entries(grouped).slice(0,4);

  const expArticle = expanded ? articles.find(a=>a.id===expanded) : null;
  const expStyle = expArticle ? (CAT_STYLE[expArticle.category]||fallbackStyle) : null;

  if(expArticle) return <div style={{height:SCROLL_H,display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <div style={{height:240,flexShrink:0,position:"relative",overflow:"hidden"}}>
      <ImgBg src={expArticle.image} category={expArticle.category}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.85),rgba(0,0,0,.2) 50%,transparent)"}}/>
      <div style={{position:"absolute",top:12,left:12,zIndex:2}}>
        <button onClick={()=>setExpanded(null)} style={{background:"rgba(0,0,0,.45)",backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,.15)",borderRadius:"50%",color:C.white,fontSize:14,cursor:"pointer",padding:0,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center"}}>←</button>
      </div>
      <div style={{position:"absolute",top:12,left:52,zIndex:2}}>
        <span style={{background:expStyle.bc,color:C.white,fontSize:8,fontWeight:800,padding:"3px 8px",borderRadius:4,letterSpacing:".06em"}}>{expStyle.badge}</span>
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"16px",zIndex:2}}>
        <div style={{fontSize:16,fontWeight:700,color:C.white,lineHeight:1.35,letterSpacing:"-.02em",marginBottom:6}}>{expArticle.title}</div>
        <div style={{fontSize:10,color:"rgba(255,255,255,.45)"}}>{expArticle.author} · {expArticle.pubDate ? new Date(expArticle.pubDate).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}) : ""}</div>
      </div>
    </div>
    <div className="hide-scroll" style={{flex:1,overflowY:"auto",padding:"16px"}}>
      <p style={{fontSize:13.5,color:"rgba(255,255,255,.8)",lineHeight:1.7,margin:"0 0 16px"}}>{expArticle.description}</p>
      {/* Go deeper pill */}
      <div style={{display:"flex",justifyContent:"center",padding:"8px 0 20px"}}>
        <DeeperPill onClick={()=>onDeeper(expArticle.id)}/>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"8px 0 24px"}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:"rgba(255,255,255,.06)",border:"2px solid rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <span style={{color:C.white,fontSize:28,marginLeft:4}}>▶</span>
        </div>
      </div>
      <div style={{textAlign:"center",fontSize:10,color:"rgba(255,255,255,.3)",marginBottom:12}}>Watch full coverage</div>
      <a href={expArticle.link} target="_blank" rel="noopener noreferrer" style={{display:"block",textAlign:"center",fontSize:11,color:C.blue,textDecoration:"none",marginTop:8}}>Read full article on NBC News →</a>
    </div>
  </div>;

  return <div style={{paddingBottom:100}}>
    <div style={{padding:"16px 16px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <span style={{fontSize:16,fontWeight:700,color:C.white,letterSpacing:"-.02em"}}>For You</span>
      <span style={{fontSize:9,fontWeight:700,color:C.gold,letterSpacing:".04em"}}>★ AD-FREE</span>
    </div>
    <div style={{padding:"12px 16px 0"}}>
      {featured.map((item,i)=><div key={item.id} onClick={()=>setExpanded(item.id)} style={{marginBottom:10,borderRadius:14,overflow:"hidden",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.07)",cursor:"pointer"}}>
        <div style={{height:100,position:"relative",overflow:"hidden"}}>
          <ImgBg src={item.image} category={item.category}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.75),rgba(0,0,0,.1) 60%,transparent)"}}/>
          <div style={{position:"absolute",bottom:9,left:10,zIndex:1}}>
            <span style={{background:"rgba(255,255,255,.12)",backdropFilter:"blur(6px)",color:C.white,fontSize:7.5,fontWeight:800,padding:"3px 8px",borderRadius:4,letterSpacing:".07em",border:"1px solid rgba(255,255,255,.15)"}}>{(CAT_STYLE[item.category]||fallbackStyle).badge}</span>
          </div>
        </div>
        <div style={{padding:"9px 12px 11px"}}>
          <div style={{fontSize:12.5,fontWeight:600,color:C.white,lineHeight:1.35,marginBottom:4}}>{item.title}</div>
          <div style={{fontSize:9.5,color:"rgba(255,255,255,.35)"}}>{item.author}</div>
        </div>
      </div>)}
    </div>
    {sections.map(([cat,items])=><div key={cat} style={{marginBottom:24}}>
      <div style={{padding:"8px 16px",fontSize:14,fontWeight:700,color:C.white,letterSpacing:"-.02em"}}>{(CAT_STYLE[cat]||fallbackStyle).badge}</div>
      <div className="hide-scroll" style={{display:"flex",gap:10,overflowX:"auto",padding:"0 16px"}}>
        {items.filter(a=>a.image).slice(0,5).map(item=><div key={item.id} onClick={()=>setExpanded(item.id)} style={{flexShrink:0,cursor:"pointer"}}>
          <div style={{width:130,height:84,borderRadius:10,overflow:"hidden",position:"relative",background:"#111"}}>
            <ImgBg src={item.image} category={item.category}/><div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.22)"}}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:1}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:"rgba(0,0,0,.45)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(255,255,255,.15)"}}>
                <span style={{color:"rgba(255,255,255,.8)",fontSize:9,marginLeft:1}}>▶</span>
              </div>
            </div>
          </div>
          <div style={{fontSize:11,fontWeight:600,color:C.white,lineHeight:1.3,marginBottom:2,marginTop:6,width:130,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{item.title}</div>
          <div style={{fontSize:9.5,color:"rgba(255,255,255,.35)",width:130}}>{item.author}</div>
        </div>)}
      </div>
    </div>)}
  </div>;
};

/* ─── Main App ─── */
export default function App() {
  const [tab,setTab]=useState("Briefing");
  const [sheetId,setSheetId]=useState(null);
  const [data,setData]=useState({timeline:[],topics:[],articles:[]});
  const [loading,setLoading]=useState(true);
  const scrollRef=useRef(null);

  useEffect(()=>{
    fetch("/api/feed").then(r=>r.json()).then(d=>{
      const arts = d.articles||[];
      const timeline = arts.filter(a=>a.image).slice(0,8);
      setData({timeline,topics:timeline,articles:arts});
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  useEffect(()=>{if(scrollRef.current) scrollRef.current.scrollTop=0;},[tab]);

  const openDeeper = useCallback(id=>setSheetId(id),[]);

  if(loading) return <div style={{height:"100vh",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
    <span style={{color:"#999",fontSize:11,fontFamily:FONT}}>Loading NBC News…</span>
  </div>;

  const now=new Date(), h=now.getHours(), m=now.getMinutes();
  const timeStr=`${((h+11)%12)+1}:${String(m).padStart(2,"0")}`;

  return <DataCtx.Provider value={data}>
    <style>{`
      body{margin:0;background:#fff}
      @keyframes pulse-badge{0%,100%{opacity:1}50%{opacity:.7}}
      @keyframes pulse-dot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.5}}
      @keyframes fade-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
      @keyframes pill-glow{0%,100%{box-shadow:0 0 8px rgba(59,130,246,.15)}50%{box-shadow:0 0 18px rgba(59,130,246,.35)}}
      .tab-pane{animation:fade-in .18s ease both}
      .hide-scroll{scrollbar-width:none;-ms-overflow-style:none}
      .hide-scroll::-webkit-scrollbar{display:none}
      .phone-scroll{scrollbar-width:thin;scrollbar-color:#444 #0a0a0a}
      .phone-scroll::-webkit-scrollbar{width:4px}
      .phone-scroll::-webkit-scrollbar-track{background:#0a0a0a}
      .phone-scroll::-webkit-scrollbar-thumb{background:#333;border-radius:2px}
    `}</style>
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"30px 20px",fontFamily:FONT}}>
      <div style={{position:"relative"}}>
        <div style={{padding:7,borderRadius:34,background:"linear-gradient(160deg,#2e2e34,#1a1a1e 50%,#26262c)"}}>
          <div style={{width:PHONE_W,height:PHONE_H,background:C.bg,borderRadius:28,overflow:"hidden",position:"relative",fontFamily:FONT}}>
            {/* Header */}
            <div style={{position:"absolute",top:0,left:0,right:0,height:HEADER_H,zIndex:20,background:C.bg}}>
              <div style={{height:34,padding:"10px 22px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:700,color:C.white}}>{timeStr}</span>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  <span style={{fontSize:10,fontWeight:600,color:C.white}}>5G</span>
                  <div style={{width:22,height:11,border:"1.5px solid rgba(255,255,255,.45)",borderRadius:3,padding:"1.5px",display:"flex",alignItems:"center"}}>
                    <div style={{width:"72%",height:"100%",background:C.white,borderRadius:1.5}}/>
                  </div>
                </div>
              </div>
              <div style={{padding:"4px 38px 0"}}>
                <TabBar active={tab} onChange={setTab}/>
              </div>
            </div>
            {/* Scroll */}
            <div ref={scrollRef} className="phone-scroll" style={{position:"absolute",top:HEADER_H,left:0,right:0,bottom:NAV_H,overflowY:"auto",overflowX:"hidden"}}>
              <div key={tab} className="tab-pane">
                {tab==="Briefing"&&<BriefingTab scrollEl={scrollRef} onDeeper={openDeeper}/>}
                {tab==="middle"&&<InsiderTab/>}
                {tab==="Signal"&&<SignalTab onDeeper={openDeeper}/>}
              </div>
            </div>
            {/* Bottom sheet overlay (inside the phone) */}
            {sheetId && <DeeperSheet articleId={sheetId} onClose={()=>setSheetId(null)}/>}
            {/* Bottom nav */}
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:NAV_H,zIndex:20,background:C.bg,borderTop:"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"space-around",padding:"0 4px"}}>
              {[
                {label:"Home",icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>},
                {label:"Live",icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>},
                {label:"Subscribers",active:true,icon:<PeacockNav/>},
                {label:"Shorts",icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><polygo
