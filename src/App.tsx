import { useState, useEffect, useRef, useCallback } from "react";

const TRACKS = [
  {
    id: 1, title: "NEON_COLLAPSE.EXE", artist: "GLITCH_GHOST",
    duration: "3:47", bpm: 128, genre: "SYNTHWAVE",
    lyrics: [
      "SYSTEM BOOTING... SIGNAL LOST",
      "NEON VEINS PULSE THRU THE STATIC VOID",
      "WE'RE THE GHOSTS INSIDE THE MACHINE TONIGHT",
      "COLLAPSING STARS THAT NEVER LEARNED TO DIE",
      "ERROR -- HEART.EXE HAS STOPPED RESPONDING",
      "REBOOT THE DREAM, WE'RE GLITCHING OUT OF TIME",
      "NEON VEINS... NEON VEINS... NEON VEINS...",
      "[CHORUS] COLLAPSE WITH ME IN PIXELS AND IN LIGHT",
      "FALL THROUGH THE CODE INTO THE ENDLESS NIGHT",
      "WE WERE NEVER REAL -- JUST DATA, JUST A SIGN",
      "NEON_COLLAPSE -- YOUR SOUL AND MINE",
      "STATIC FILLS THE SPACES WHERE WE USED TO SPEAK",
      "BINARY LOVE -- IT PEAKED, IT CRASHED, IT LEAKED",
      "[BRIDGE] 01001100 01001111 01010110 01000101",
      "TRANSLATE: LOVE WAS JUST A FOUR-LETTER OVERRIDE",
      "[OUTRO] SIGNAL FADING... FADING... GONE",
    ],
  },
  {
    id: 2, title: "PHANTOM_FREQ", artist: "SYNTHWRAITH",
    duration: "4:12", bpm: 140, genre: "DARKWAVE",
    lyrics: [
      "CARRIER WAVE DETECTED ON FREQUENCY ZERO",
      "THE PHANTOM SINGS WHERE NO ANTENNA REACHES",
      "I TUNED INTO YOUR VOICE THREE LIFETIMES BACK",
      "NOW STATIC IS THE ONLY SOUND I TRACK",
      "[VERSE 1] PHANTOM FREQ, PHANTOM FREQ",
      "BROADCASTING LOVE ON A DEAD-AIR STREAM",
      "PHANTOM FREQ, PHANTOM FREQ",
      "YOU'RE THE SIGNAL IN MY FEVER DREAM",
      "WHITE NOISE FILLS THE ROOM AT 3 AM",
      "YOUR FREQUENCY -- I'LL NEVER FIND AGAIN",
      "[CHORUS] TUNE ME IN OR TUNE ME OUT",
      "I'LL BE HERE TRANSMITTING DOUBT",
      "ON THE FREQUENCY YOU LEFT BEHIND",
      "A PHANTOM PLAYING BACK YOUR MIND",
      "[BREAKDOWN] :::STATIC:::",
      "SIGNAL. SIGNAL. NO SIGNAL. SIGNAL.",
      "[FADE] PHANTOM... PHANTOM... FREQ...",
    ],
  },
  {
    id: 3, title: "CORRUPT_PARADISE", artist: "VOID_ARCHITECT",
    duration: "5:03", bpm: 110, genre: "RETROWAVE",
    lyrics: [
      "WELCOME TO PARADISE -- FILE CORRUPTED",
      "THE GARDEN LOADED WRONG, THE SKY'S INVERTED",
      "TREES OF SHATTERED GLASS AND RIVERS MADE OF CODE",
      "THIS WAS HEAVEN ONCE -- NOW JUST AN EPISODE",
      "[VERSE 1] THEY PROMISED US UTOPIA ON A SILVER DRIVE",
      "UPLOADED ALL OUR FUTURES, LEFT NO ONE ALIVE",
      "THE PARADISE THEY SOLD US HAD A HIDDEN COST",
      "EVERY PERFECT MEMORY -- CORRUPTED, WARPED, AND LOST",
      "[CHORUS] CORRUPT PARADISE, BEAUTIFUL MISTAKE",
      "GLITCH IN EVERY SUNRISE, FRACTURE IN EACH LAKE",
      "I'D RATHER LIVE IN FRAGMENTS OF THIS BROKEN DREAM",
      "THAN A PERFECT WORLD THAT'S NOTHING LIKE IT SEEMS",
      "[BRIDGE] ERROR 404: PARADISE NOT FOUND",
      "BUT I'VE BEEN LOST IN CORRUPT BEAUTY UNDERGROUND",
      "[FINAL CHORUS] CORRUPT PARADISE -- I'M STAYING HERE",
      "[OUTRO] LOADING... LOADING... LOAD FAILED.",
    ],
  },
];

const THEMES = {
  red: {
    primary:     "#ff2020",
    bright:      "#ff6060",
    dim:         "#7a0a0a",
    dark:        "#2a0505",
    screen:      "#0a0000",
    bg:          "#0f0000",
    bg2:         "#180000",
    bg3:         "#220000",
  },
  blue: {
    primary:     "#1a8fff",
    bright:      "#60c0ff",
    dim:         "#0a3a7a",
    dark:        "#051530",
    screen:      "#00040a",
    bg:          "#00060f",
    bg2:         "#000c18",
    bg3:         "#001022",
  },
  violet: {
    primary:     "#b020ff",
    bright:      "#d070ff",
    dim:         "#4a0880",
    dark:        "#1a0230",
    screen:      "#05000a",
    bg:          "#08000f",
    bg2:         "#0e0018",
    bg3:         "#150022",
  },
};

const LIGHT_OVERLAY = {
  bg:     "#f0eaf8",
  bg2:    "#e4d8f0",
  bg3:    "#d8c8ec",
  screen: "#ede0ff",
  textMod: 0, // flag
};

const GRID = 20;
const CELL = 26;
const DIR = { UP:{x:0,y:-1}, DOWN:{x:0,y:1}, LEFT:{x:-1,y:0}, RIGHT:{x:1,y:0} };
function rnd() { return { x: Math.floor(Math.random()*GRID), y: Math.floor(Math.random()*GRID) }; }

export default function App() {
  const [track,       setTrack]      = useState(0);
  const [playing,     setPlaying]    = useState(false);
  const [progress,    setProgress]   = useState(0);
  const [showLyrics,  setShowLyrics] = useState(false);
  const [speed,       setSpeed]      = useState(1);
  const [snake,       setSnake]      = useState([{x:10,y:10}]);
  const [food,        setFood]       = useState({x:15,y:8});
  const [nextDir,     setNextDir]    = useState(DIR.RIGHT);
  const [score,       setScore]      = useState(0);
  const [hiScore,     setHiScore]    = useState(0);
  const [gameState,   setGameState]  = useState("idle");
  const [blink,       setBlink]      = useState(true);
  const [tick,        setTick]       = useState(0);
  const [themeName,   setThemeName]  = useState("red");
  const [isLight,     setIsLight]    = useState(false);
  const lyricRef = useRef<HTMLDivElement>(null);
  const T = TRACKS[track];
  const th = THEMES[themeName as keyof typeof THEMES];

  // Derived colours based on light/night
  const C = isLight ? {
    primary: th.primary,
    bright:  th.dim,        // flip: dim becomes "bright text on light bg"
    dim:     th.primary,    // primary becomes accent
    dark:    th.bg3,
    screen:  th.screen,
    bg:      LIGHT_OVERLAY.bg,
    bg2:     LIGHT_OVERLAY.bg2,
    bg3:     LIGHT_OVERLAY.bg3,
    text:    th.dark.replace("#","") > "888888" ? "#111" : th.dim,
    titleBg: th.bright,
    titleFg: "#fff",
    bodyText: "#1a0a2a",
    dimText:  th.dim,
    screenBg: LIGHT_OVERLAY.screen,
  } : {
    primary: th.primary,
    bright:  th.bright,
    dim:     th.dim,
    dark:    th.dark,
    screen:  th.screen,
    bg:      th.bg,
    bg2:     th.bg2,
    bg3:     th.bg3,
    text:    th.bright,
    titleBg: th.dim,
    titleFg: th.bright,
    bodyText: th.primary,
    dimText:  th.dim,
    screenBg: th.screen,
  };

  // Blink
  useEffect(() => { const id = setInterval(()=>setBlink(b=>!b),530); return ()=>clearInterval(id); },[]);

  // Music progress
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(()=>{
      setProgress(p=>{ if(p>=100){handleNext();return 0;} return p+0.08; });
      setTick(t=>t+1);
    }, 80);
    return ()=>clearInterval(id);
  }, [playing, track]);

  const lyricIdx = Math.floor((progress/100)*T.lyrics.length);
  useEffect(()=>{
    if(lyricRef.current && showLyrics){
      const el = lyricRef.current.children[lyricIdx] as HTMLElement;
      if(el) el.scrollIntoView({behavior:"smooth",block:"center"});
    }
  },[lyricIdx, showLyrics]);

  function handleNext(){ setTrack(t=>(t+1)%TRACKS.length); setProgress(0); }
  function handlePrev(){ setTrack(t=>(t-1+TRACKS.length)%TRACKS.length); setProgress(0); }

  const gameLoop = useCallback(()=>{
    setSnake(prev=>{
      const head = {x:prev[0].x+nextDir.x, y:prev[0].y+nextDir.y};
      if(head.x<0||head.x>=GRID||head.y<0||head.y>=GRID||prev.some(s=>s.x===head.x&&s.y===head.y)){
        setGameState("dead"); return prev;
      }
      let ate=false;
      setFood(f=>{ if(f.x===head.x&&f.y===head.y){ ate=true; setScore(s=>{const ns=s+10;setHiScore(h=>Math.max(h,ns));return ns;}); return rnd(); } return f; });
      return ate?[head,...prev]:[head,...prev.slice(0,-1)];
    });
  },[nextDir]);

  useEffect(()=>{
    if(gameState!=="running") return;
    const ms = speed===1?190:speed===2?105:58;
    const id = setInterval(gameLoop, ms);
    return ()=>clearInterval(id);
  },[gameState,speed,gameLoop]);

  useEffect(()=>{
    if(gameState!=="running") return;
    const fn=(e: KeyboardEvent)=>{
      const map: Record<string, {x:number,y:number}>={ArrowUp:DIR.UP,ArrowDown:DIR.DOWN,ArrowLeft:DIR.LEFT,ArrowRight:DIR.RIGHT,w:DIR.UP,s:DIR.DOWN,a:DIR.LEFT,d:DIR.RIGHT};
      const nd=map[e.key]; if(!nd) return; e.preventDefault();
      setNextDir(cur=>{ if((nd.x!==0&&nd.x===-cur.x)||(nd.y!==0&&nd.y===-cur.y)) return cur; return nd; });
    };
    window.addEventListener("keydown",fn);
    return ()=>window.removeEventListener("keydown",fn);
  },[gameState]);

  function startGame(){ setSnake([{x:10,y:10}]); setFood(rnd()); setNextDir(DIR.RIGHT); setScore(0); setGameState("running"); }

  const eqBars = Array.from({length:16}).map((_,i)=>{
    const base=[8,12,16,14,10,18,20,15,11,17,13,9,19,14,12,16][i];
    return playing ? Math.max(2,(base+Math.sin(tick*0.3+i*0.7)*6)|0) : 2;
  });

  function fmtTime(pct: number){ const s=Math.floor((pct/100)*227); return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; }

  // ---- inline style helpers ----
  const win = { background:C.bg2, border:`2px solid ${C.dim}`, position:"relative" as const };
  const winTitle = { background:C.titleBg, color:C.titleFg, fontFamily:"'Press Start 2P',monospace", fontSize:"7px", padding:"5px 8px", display:"flex", alignItems:"center", justifyContent:"space-between", letterSpacing:"0.05em", borderBottom:`2px solid ${C.dim}`, userSelect:"none" as const };
  const winBody = { padding:"10px" };

  function rbtnStyle(active=false){ return {
    background: active ? C.dark : C.bg3,
    border:`2px solid ${C.dim}`,
    borderRightColor: active ? C.dim : C.bright,
    borderBottomColor: active ? C.dim : C.bright,
    borderLeftColor: active ? C.bright : C.dim,
    borderTopColor: active ? C.bright : C.dim,
    color: active ? C.bright : C.primary,
    fontFamily:"'VT323',monospace", fontSize:"16px", padding:"4px 12px",
    cursor:"pointer", textTransform:"uppercase" as const, letterSpacing:"0.05em",
    outline:"none", userSelect:"none" as const,
  }; }

  const scoreBox = { background:C.screenBg, border:`2px solid ${C.dim}`, borderRightColor:C.bright, borderBottomColor:C.bright, padding:"4px 10px", textAlign:"center" as const };
  const statusRow = { display:"flex", justifyContent:"space-between", fontSize:"13px", padding:"2px 0", borderBottom:`1px dashed ${C.dim}33` };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&family=Press+Start+2P&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'VT323',monospace;overflow-x:hidden;min-height:100vh;cursor:default;}
        body::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.15) 3px,rgba(0,0,0,0.15) 4px);}
        body::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:9998;background:radial-gradient(ellipse at center,transparent 60%,rgba(0,0,0,0.55) 100%);}
        @keyframes foodblink{0%,49%{opacity:1}50%,100%{opacity:0.3}}
        .food-blink{animation:foodblink 0.6s step-end infinite;}
        @keyframes ticker{from{transform:translateX(100%)}to{transform:translateX(-200%)}}
        .ticker{display:inline-block;white-space:nowrap;animation:ticker 20s linear infinite;font-size:13px;letter-spacing:0.1em;}
        @keyframes w0{0%,100%{height:20%}50%{height:80%}}
        @keyframes w1{0%,100%{height:50%}50%{height:20%}}
        @keyframes w2{0%,100%{height:30%}50%{height:90%}}
        @keyframes w3{0%,100%{height:70%}50%{height:30%}}
        @keyframes w4{0%,100%{height:40%}50%{height:60%}}
        ::-webkit-scrollbar{width:8px;}
        ::-webkit-scrollbar-track{background:#00000033;}
        ::-webkit-scrollbar-thumb{background:#ffffff22;}
      `}</style>

      <div style={{ minHeight:"100vh", background:C.bg, padding:"12px", color:C.primary, transition:"background 0.3s, color 0.3s" }}>

        {/* TOP BAR */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px", padding:"4px 10px", background:C.titleBg, borderBottom:`2px solid ${C.primary}` }}>
          <div style={{ fontFamily:"'Press Start 2P'", fontSize:"8px", color:C.titleFg, letterSpacing:"0.1em", flexShrink:0 }}>
            ▶ RETRO ARCADE OS v2.0
          </div>

          {/* Ticker */}
          <div style={{ overflow:"hidden", flex:1, margin:"0 16px" }}>
            <span className="ticker" style={{ color:isLight ? C.dim : C.primary }}>
              *** NOW PLAYING: {T.title} BY {T.artist} *** SCORE: {String(score).padStart(5,"0")} *** SNAKE LEN: {snake.length} *** HI-SCORE: {String(hiScore).padStart(5,"0")} *** {playing?"♪ MUSIC ACTIVE ♪":"[ PAUSED ]"} ***
            </span>
          </div>

          {/* Theme + Light/Night Controls */}
          <div style={{ display:"flex", gap:"6px", alignItems:"center", flexShrink:0 }}>
            {/* Theme buttons */}
            {["red","blue","violet"].map(name=>(
              <button key={name} onClick={()=>setThemeName(name)}
                style={{ ...rbtnStyle(themeName===name), fontSize:"12px", padding:"3px 8px",
                  background: name==="red"?"#3a0808":name==="blue"?"#081838":"#18083a",
                  color: name==="red"?"#ff6060":name==="blue"?"#60c0ff":"#d070ff",
                  borderColor: themeName===name?(name==="red"?"#ff2020":name==="blue"?"#1a8fff":"#b020ff"):"#444",
                  boxShadow: themeName===name?`0 0 8px ${name==="red"?"#ff2020":name==="blue"?"#1a8fff":"#b020ff"}`:"none",
                }}>
                {name==="red"?"● RED":name==="blue"?"● BLUE":"● VLT"}
              </button>
            ))}

            {/* Light / Night toggle */}
            <button onClick={()=>setIsLight(l=>!l)}
              style={{ ...rbtnStyle(false), fontSize:"13px", padding:"3px 10px",
                background: isLight?"#f5f0ff":"#0a0010",
                color: isLight?"#5500cc":"#d0a0ff",
                borderColor: isLight?"#aa80ff":"#440088",
                boxShadow: `0 0 6px ${isLight?"#aa80ff44":"#8800cc44"}`,
              }}>
              {isLight ? "☀ LIGHT" : "🌙 NIGHT"}
            </button>

            <div style={{ fontFamily:"'VT323'", fontSize:"14px", color:C.titleFg, letterSpacing:"0.1em" }}>
              {new Date().toLocaleTimeString("en-US",{hour12:false})}
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div style={{ display:"grid", gridTemplateColumns:"270px 1fr 240px", gap:"10px", maxWidth:"1180px", margin:"0 auto" }}>

          {/* ── LEFT: Music ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>

            {/* Player Window */}
            <div style={win}>
              <div style={winTitle}>
                <span>♪ MUSIC_PLAYER.EXE</span>
                <div style={{ display:"flex", gap:"5px" }}>
                  {["_","□","×"].map(ch=>(
                    <div key={ch} style={{ width:"16px", height:"16px", border:`1px solid ${C.primary}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", cursor:"pointer", color:C.primary }}>
                      {ch}
                    </div>
                  ))}
                </div>
              </div>
              <div style={winBody}>
                {/* Now playing info */}
                <div style={{ background:C.screenBg, border:`1px solid ${C.dim}`, borderRightColor:C.bright, borderBottomColor:C.bright, padding:"8px", marginBottom:"8px" }}>
                  <div style={{ fontFamily:"'Press Start 2P'", fontSize:"6px", color:C.dim, marginBottom:"6px" }}>NOW PLAYING:</div>
                  <div style={{ fontFamily:"'Press Start 2P'", fontSize:"8px", color:C.bright, lineHeight:1.6, wordBreak:"break-all" }}>{T.title}</div>
                  <div style={{ fontSize:"14px", color:C.primary, marginTop:"2px" }}>{T.artist}</div>
                  <div style={{ fontSize:"13px", color:C.dim, marginTop:"2px" }}>{T.genre} · {T.bpm} BPM · {T.duration}</div>
                </div>

                {/* Waveform */}
                <div style={{ height:"38px", display:"flex", alignItems:"flex-end", gap:"2px", background:C.screenBg, border:`1px solid ${C.dim}`, padding:"4px", marginBottom:"8px" }}>
                  {Array.from({length:32}).map((_,i)=>(
                    <div key={i} style={{ flex:1, background:C.primary, animation:playing?`w${i%5} ${0.3+(i%5)*0.07}s ease-in-out infinite alternate`:"none", height:playing?undefined:"15%", minHeight:"2px", opacity:playing?0.85:0.3 }} />
                  ))}
                </div>

                {/* Progress bar */}
                <div style={{ width:"100%", height:"14px", background:C.bg3, border:`1px solid ${C.dim}`, borderRightColor:C.bright, borderBottomColor:C.bright, overflow:"hidden", marginBottom:"4px" }}>
                  <div style={{ height:"100%", width:`${progress}%`, background:`repeating-linear-gradient(90deg,${C.primary} 0px,${C.primary} 6px,${C.dim} 6px,${C.dim} 10px)`, transition:"width 0.08s linear" }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:"13px", color:C.dim, marginBottom:"10px" }}>
                  <span>{fmtTime(progress)}</span><span>{T.duration}</span>
                </div>

                {/* Controls */}
                <div style={{ display:"flex", gap:"6px", justifyContent:"center", marginBottom:"10px" }}>
                  <button style={rbtnStyle()} onClick={handlePrev}>|◀</button>
                  <button style={{...rbtnStyle(playing), fontSize:"18px", padding:"4px 14px"}} onClick={()=>setPlaying(p=>!p)}>
                    {playing?"||":"▶"}
                  </button>
                  <button style={rbtnStyle()} onClick={handleNext}>▶|</button>
                </div>

                <hr style={{ border:"none", borderTop:`1px solid ${C.dim}`, margin:"8px 0" }}/>

                <button style={{...rbtnStyle(showLyrics), width:"100%", textAlign:"center", fontSize:"14px"}}
                  onClick={()=>setShowLyrics(v=>!v)}>
                  {showLyrics?"▲ HIDE LYRICS":"▼ SHOW LYRICS"}
                </button>
              </div>
            </div>

            {/* Playlist */}
            <div style={win}>
              <div style={winTitle}><span>■ PLAYLIST.M3U</span></div>
              <div style={{ padding:"6px" }}>
                {TRACKS.map((t,i)=>(
                  <div key={t.id} onClick={()=>{setTrack(i);setProgress(0);}}
                    style={{ display:"flex", alignItems:"center", gap:"8px", padding:"4px 6px", cursor:"pointer",
                      background: i===track ? C.dark : "transparent",
                      border: i===track ? `1px solid ${C.dim}` : "1px solid transparent",
                      color: i===track ? C.bright : C.primary, fontSize:"13px" }}>
                    <span style={{ color:C.dim, width:"16px" }}>{i+1}.</span>
                    <span style={{ color: i===track&&playing?C.bright:C.dim }}>{i===track&&playing?"▶":"·"}</span>
                    <div style={{ flex:1, overflow:"hidden" }}>
                      <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.title}</div>
                      <div style={{ fontSize:"12px", color:C.dim }}>{t.artist}</div>
                    </div>
                    <span style={{ fontSize:"12px", color:C.dim }}>{t.duration}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lyrics */}
            {showLyrics && (
              <div style={win}>
                <div style={winTitle}><span>♫ LYRICS.TXT</span></div>
                <div style={{ maxHeight:"200px", overflowY:"auto" }}>
                  <div ref={lyricRef} style={{ padding:"6px 0" }}>
                    {T.lyrics.map((line,i)=>(
                      <div key={i} style={{ fontSize:"14px", padding:"3px 8px", letterSpacing:"0.03em",
                        color: i===lyricIdx ? C.bright : C.dim,
                        background: i===lyricIdx ? C.dark : "transparent",
                        borderLeft: i===lyricIdx ? `2px solid ${C.primary}` : "2px solid transparent",
                      }}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── CENTER: Game ── */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"10px" }}>

            {/* Score row */}
            <div style={{ display:"flex", gap:"8px", width:"100%" }}>
              <div style={scoreBox}>
                <div style={{ fontFamily:"'Press Start 2P'", fontSize:"6px", color:C.dim, letterSpacing:"0.1em", marginBottom:"2px" }}>SCORE</div>
                <div style={{ fontFamily:"'Press Start 2P'", fontSize:"14px", color:C.bright }}>{String(score).padStart(5,"0")}</div>
              </div>
              <div style={scoreBox}>
                <div style={{ fontFamily:"'Press Start 2P'", fontSize:"6px", color:C.dim, letterSpacing:"0.1em", marginBottom:"2px" }}>HI-SCORE</div>
                <div style={{ fontFamily:"'Press Start 2P'", fontSize:"14px", color:C.bright }}>{String(hiScore).padStart(5,"0")}</div>
              </div>
              <div style={scoreBox}>
                <div style={{ fontFamily:"'Press Start 2P'", fontSize:"6px", color:C.dim, letterSpacing:"0.1em", marginBottom:"2px" }}>LEN</div>
                <div style={{ fontFamily:"'Press Start 2P'", fontSize:"14px", color:C.bright }}>{String(snake.length).padStart(3,"0")}</div>
              </div>
              {/* Speed */}
              <div style={{ ...win, padding:"6px 8px", display:"flex", flexDirection:"column", justifyContent:"center", gap:"4px" }}>
                <div style={{ fontFamily:"'Press Start 2P'", fontSize:"5px", color:C.dim, letterSpacing:"0.1em" }}>SPEED</div>
                <div style={{ display:"flex", gap:"4px" }}>
                  {[1,2,3].map(s=>(
                    <button key={s} style={{...rbtnStyle(speed===s), fontSize:"13px", padding:"2px 7px"}} onClick={()=>setSpeed(s)}>{s}X</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Game canvas */}
            <div style={{ ...win, padding:0 }}>
              <div style={winTitle}>
                <span>◆ SNAKE.EXE — {gameState==="running"?"RUNNING":gameState==="dead"?"GAME OVER":"READY"}</span>
                <div style={{ fontFamily:"'VT323'", fontSize:"14px" }}>{blink?"█":" "}</div>
              </div>
              <div style={{ position:"relative", background:C.screenBg, border:`2px solid ${C.dim}`, borderRightColor:C.bright, borderBottomColor:C.bright, width:GRID*CELL, height:GRID*CELL, overflow:"hidden", imageRendering:"pixelated" }}>
                {/* Scanlines */}
                <div style={{ pointerEvents:"none", position:"absolute", inset:0, zIndex:10, background:`repeating-linear-gradient(0deg,transparent,transparent 4px,rgba(0,0,0,0.1) 4px,rgba(0,0,0,0.1) 5px)` }} />

                {/* Dot grid */}
                <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.12 }}>
                  {Array.from({length:GRID}).map((_,r)=>Array.from({length:GRID}).map((_,c)=>(
                    <rect key={`${r}-${c}`} x={c*CELL+CELL/2-1} y={r*CELL+CELL/2-1} width="2" height="2" fill={C.primary} />
                  )))}
                </svg>

                {/* Food */}
                <div className="food-blink" style={{ position:"absolute", left:food.x*CELL, top:food.y*CELL, width:CELL, height:CELL, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ width:CELL-4, height:CELL-4, background:C.bright, outline:`2px solid ${C.primary}`, imageRendering:"pixelated" }} />
                </div>

                {/* Snake */}
                {snake.map((seg,i)=>{
                  const isHead = i===0;
                  const fade = Math.max(0.2, 1-i/snake.length*0.75);
                  return (
                    <div key={i} style={{ position:"absolute", left:seg.x*CELL, top:seg.y*CELL, width:CELL, height:CELL, padding:isHead?"1px":"2px" }}>
                      <div style={{ width:"100%", height:"100%",
                        background: isHead ? C.bright : `${C.primary}${Math.round(fade*255).toString(16).padStart(2,"0")}`,
                        outline: isHead?`2px solid ${C.primary}`:`1px solid ${C.dim}`,
                        imageRendering:"pixelated",
                      }} />
                    </div>
                  );
                })}

                {/* Overlay */}
                {gameState!=="running" && (
                  <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.87)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"14px", zIndex:20 }}>
                    {gameState==="dead" ? (
                      <>
                        <div style={{ fontFamily:"'Press Start 2P'", fontSize:"18px", color:C.bright, lineHeight:1.5, textAlign:"center" }}>GAME<br/>OVER</div>
                        <div style={{ fontFamily:"'Press Start 2P'", fontSize:"8px", color:C.dim }}>SCORE: {String(score).padStart(5,"0")}</div>
                        {score>0&&score>=hiScore&&<div style={{ fontFamily:"'Press Start 2P'", fontSize:"7px", color:C.bright }}>{blink?"*** NEW RECORD ***":""}</div>}
                      </>
                    ) : (
                      <>
                        <div style={{ fontFamily:"'Press Start 2P'", fontSize:"14px", color:C.bright, lineHeight:1.6, textAlign:"center" }}>SNAKE<br/>ARCADE</div>
                        <div style={{ fontFamily:"'Press Start 2P'", fontSize:"6px", color:C.dim, textAlign:"center", lineHeight:2 }}>USE ARROW KEYS<br/>OR D-PAD BELOW</div>
                      </>
                    )}
                    <button style={{...rbtnStyle(), fontFamily:"'Press Start 2P'", fontSize:"9px", padding:"8px 20px"}} onClick={startGame}>
                      {gameState==="dead"?"▶ RETRY":"▶ START"}
                    </button>
                    {blink&&<div style={{ fontFamily:"'Press Start 2P'", fontSize:"6px", color:C.dim }}>INSERT COIN</div>}
                  </div>
                )}
              </div>
            </div>

            {/* D-Pad */}
            <div style={{ display:"grid", gridTemplateColumns:"40px 40px 40px", gridTemplateRows:"40px 40px", gap:"4px" }}>
              {[null,"UP",null,"LEFT","CENTER","RIGHT",null,"DOWN",null].map((d,i)=>{
                if(!d) return <div key={i}/>;
                if(d==="CENTER") return <div key={i} style={{ background:C.bg3, border:`2px solid ${C.dim}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", color:C.dim }}>✦</div>;
                const arrows: Record<string, string>={UP:"▲",DOWN:"▼",LEFT:"◀",RIGHT:"▶"};
                return (
                  <button key={i} onClick={()=>setNextDir(DIR[d as keyof typeof DIR])}
                    style={{ background:C.bg3, border:`2px solid ${C.dim}`, borderRightColor:C.bright, borderBottomColor:C.bright, color:C.primary, fontSize:"18px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", userSelect:"none" }}>
                    {arrows[d]}
                  </button>
                );
              })}
            </div>

            {/* Help */}
            <div style={{ ...win, width:"100%" }}>
              <div style={winTitle}><span>? HELP.TXT</span></div>
              <div style={{ padding:"6px 10px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"4px" }}>
                {[["ARROWS","MOVE"],["W A S D","MOVE"],["D-PAD","TOUCH"],["1X 2X 3X","SPEED"],["▶ ||","MUSIC"],["|◀ ▶|","SKIP"]].map(([k,v])=>(
                  <div key={k} style={{ fontSize:"11px" }}>
                    <div style={{ color:C.bright, fontFamily:"'Press Start 2P'", fontSize:"6px" }}>{k}</div>
                    <div style={{ color:C.dim, marginTop:"1px" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Stats ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>

            {/* EQ */}
            <div style={win}>
              <div style={winTitle}><span>≡ EQUALIZER</span></div>
              <div style={winBody}>
                <div style={{ display:"flex", alignItems:"flex-end", gap:"2px", height:"64px", background:C.screenBg, border:`1px solid ${C.dim}`, padding:"4px" }}>
                  {eqBars.map((h,i)=>(
                    <div key={i} style={{ flex:1, background:C.primary, height:`${h*3}px`, width:"10px", transition:"height 0.1s ease", flexShrink:0 }} />
                  ))}
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:"11px", color:C.dim, marginTop:"4px" }}>
                  <span>60HZ</span><span>250HZ</span><span>1KHZ</span><span>4KHZ</span><span>16KHZ</span>
                </div>
              </div>
            </div>

            {/* Sysinfo */}
            <div style={win}>
              <div style={winTitle}><span>■ SYSINFO.EXE</span></div>
              <div style={winBody}>
                {[
                  ["AUDIO",  playing?"ACTIVE":"STANDBY"],
                  ["GAME",   gameState.toUpperCase()],
                  ["TRACK",  `${track+1}/3`],
                  ["BPM",    T.bpm],
                  ["SPEED",  `${speed}X`],
                  ["SNAKE",  snake.length],
                  ["FOOD",   Math.floor(score/10)],
                  ["LYRICS", showLyrics?"OPEN":"CLOSED"],
                  ["THEME",  themeName.toUpperCase()],
                  ["MODE",   isLight?"LIGHT":"NIGHT"],
                ].map(([k,v])=>(
                  <div key={k} style={statusRow}>
                    <span style={{ color:C.dim }}>{k}:</span>
                    <span style={{ color:C.bright, fontWeight:"bold" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Memory */}
            <div style={win}>
              <div style={winTitle}><span>▓ MEMORY.SYS</span></div>
              <div style={winBody}>
                {[
                  {label:"AUDIO BUF", val:playing?78:12},
                  {label:"GAME RAM",  val:gameState==="running"?Math.min(99,20+snake.length*3):5},
                  {label:"SCORE MEM", val:Math.min(99,score/2)},
                  {label:"CPU LOAD",  val:gameState==="running"&&playing?65:20},
                ].map(({label,val})=>(
                  <div key={label} style={{ marginBottom:"8px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:"12px", marginBottom:"2px" }}>
                      <span style={{ color:C.dim }}>{label}</span>
                      <span style={{ color:C.bright }}>{val}%</span>
                    </div>
                    <div style={{ height:"10px", background:C.screenBg, border:`1px solid ${C.dim}` }}>
                      <div style={{ height:"100%", width:`${val}%`, background:`repeating-linear-gradient(90deg,${C.primary} 0px,${C.primary} 5px,${C.dim} 5px,${C.dim} 8px)`, transition:"width 0.3s" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score badge */}
            <div style={win}>
              <div style={winTitle}><span>★ SCORE_BADGE</span></div>
              <div style={{ ...winBody, textAlign:"center" }}>
                <div style={{ fontFamily:"'Press Start 2P'", fontSize:"24px", color:C.bright, letterSpacing:"0.05em", textShadow:`2px 2px 0 ${C.dim}` }}>
                  {String(score).padStart(5,"0")}
                </div>
                <div style={{ fontFamily:"'Press Start 2P'", fontSize:"6px", color:C.dim, marginTop:"4px" }}>
                  BEST: {String(hiScore).padStart(5,"0")}
                </div>
                {score>0&&score>=hiScore&&(
                  <div style={{ fontFamily:"'Press Start 2P'", fontSize:"7px", color:C.bright, marginTop:"8px" }}>
                    {blink?"*** NEW RECORD ***":""}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ maxWidth:"1180px", margin:"10px auto 0", display:"flex", justifyContent:"space-between", padding:"4px 8px", background:C.titleBg, fontSize:"12px", color:C.titleFg }}>
          <span>RETRO ARCADE OS v2.0 — MUSIC PLAYER + SNAKE ENGINE</span>
          <span>THEME: {themeName.toUpperCase()} · {isLight?"☀ LIGHT":"🌙 NIGHT"} · {new Date().getFullYear()}</span>
        </div>
      </div>
    </>
  );
}
