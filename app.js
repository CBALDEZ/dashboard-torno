const DEMO_MODE=true;
const SUPABASE_URL="COLE_AQUI_SUA_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY="COLE_AQUI_SUA_PUBLISHABLE_KEY";
const LIMITS={rmsWarn:.25,rmsAlarm:.40,tempWarn:60,tempAlarm:70};
const MACHINES=[
{id:"TORNO_01",name:"Torno 01",type:"Torno mecânico",icon:"⚙️"},{id:"TORNO_02",name:"Torno 02",type:"Torno mecânico",icon:"⚙️"},{id:"TORNO_03",name:"Torno 03",type:"Torno mecânico",icon:"⚙️"},{id:"TORNO_04",name:"Torno 04",type:"Torno mecânico",icon:"⚙️"},{id:"FRESADORA_01",name:"Fresadora 01",type:"Fresadora",icon:"🛠️"},{id:"FRESADORA_02",name:"Fresadora 02",type:"Fresadora",icon:"🛠️"},{id:"FURADEIRA_01",name:"Furadeira 01",type:"Furadeira de coluna",icon:"🔩"},{id:"FURADEIRA_02",name:"Furadeira 02",type:"Furadeira de coluna",icon:"🔩"},{id:"RETIFICA_CIL",name:"Retífica cilíndrica",type:"Retífica",icon:"🧰"},{id:"TORNO_CNC",name:"Torno CNC",type:"CNC",icon:"🖥️"},{id:"CENTRO_CNC",name:"Centro de usinagem CNC",type:"Centro de usinagem",icon:"🏭"}];
let allRecords=[],latest={},selected=null;
const fmt=(n,d=2)=>Number.isFinite(Number(n))?Number(n).toLocaleString("pt-BR",{minimumFractionDigits:d,maximumFractionDigits:d}):"--";
const meta=id=>MACHINES.find(m=>m.id===id)||{id,name:id,type:"Máquina",icon:"⚙️"};
function state(r){if(!r)return"stopped";const rms=+r.rms||0,t=+r.temperatura||0;if(rms>=LIMITS.rmsAlarm||t>=LIMITS.tempAlarm)return"alarm";if(rms>=LIMITS.rmsWarn||t>=LIMITS.tempWarn)return"warning";return r.running?"running":"stopped"}
const label=s=>({running:"Em operação",stopped:"Parada",warning:"Atenção",alarm:"Alarme"}[s]||"Sem dados");
function technicalIcon(machine){
  const t=(machine?.type||"").toLowerCase();
  const id=(machine?.id||"").toLowerCase();

  if(t.includes("torno") || id.includes("torno_0")){
    return `<span class="tech-icon" aria-hidden="true"><svg viewBox="0 0 92 60">
      <rect class="body" x="8" y="37" width="76" height="9" rx="2"/>
      <rect class="metal" x="14" y="18" width="17" height="20" rx="2"/>
      <circle class="dark" cx="30" cy="28" r="8"/><circle class="accent" cx="30" cy="28" r="3"/>
      <rect class="body" x="39" y="25" width="28" height="10" rx="2"/>
      <rect class="metal" x="67" y="20" width="10" height="18" rx="2"/>
      <path class="line" d="M42 30h20M18 50h58"/>
      <rect class="accent" x="45" y="18" width="14" height="5" rx="1"/>
    </svg></span>`;
  }

  if(t.includes("fresadora")){
    return `<span class="tech-icon" aria-hidden="true"><svg viewBox="0 0 92 60">
      <rect class="body" x="18" y="46" width="58" height="7" rx="2"/>
      <rect class="body" x="28" y="12" width="15" height="35" rx="2"/>
      <rect class="metal" x="35" y="14" width="33" height="8" rx="2"/>
      <rect class="accent" x="60" y="20" width="6" height="18" rx="2"/>
      <path class="line" d="M20 38h48M47 25v18"/>
      <rect class="metal" x="40" y="34" width="32" height="7" rx="2"/>
      <circle class="dark" cx="34" cy="29" r="4"/>
    </svg></span>`;
  }

  if(t.includes("furadeira")){
    return `<span class="tech-icon" aria-hidden="true"><svg viewBox="0 0 92 60">
      <rect class="body" x="23" y="48" width="48" height="6" rx="2"/>
      <rect class="metal" x="44" y="14" width="7" height="35" rx="2"/>
      <rect class="body" x="34" y="10" width="29" height="13" rx="5"/>
      <rect class="accent" x="46" y="23" width="4" height="17" rx="1"/>
      <path class="line" d="M48 40v8M55 27h13"/>
      <circle class="dark" cx="68" cy="27" r="4"/>
      <rect class="metal" x="31" y="37" width="33" height="5" rx="2"/>
    </svg></span>`;
  }

  if(t.includes("retífica") || t.includes("retifica")){
    return `<span class="tech-icon" aria-hidden="true"><svg viewBox="0 0 92 60">
      <rect class="body" x="10" y="43" width="72" height="9" rx="2"/>
      <rect class="body" x="18" y="24" width="20" height="18" rx="2"/>
      <circle class="metal" cx="31" cy="33" r="9"/><circle class="dark" cx="31" cy="33" r="4"/>
      <rect class="metal" x="48" y="28" width="25" height="8" rx="2"/>
      <circle class="accent" cx="67" cy="32" r="9" opacity=".9"/>
      <circle class="dark" cx="67" cy="32" r="4"/>
      <path class="line" d="M39 32h12"/>
    </svg></span>`;
  }

  if(t.includes("centro") || id.includes("centro")){
    return `<span class="tech-icon" aria-hidden="true"><svg viewBox="0 0 92 60">
      <rect class="body" x="16" y="9" width="60" height="45" rx="3"/>
      <rect class="dark" x="22" y="15" width="31" height="28" rx="2"/>
      <rect class="metal" x="57" y="15" width="13" height="28" rx="2"/>
      <circle class="glow" cx="63.5" cy="20" r="2"/>
      <circle class="accent" cx="63.5" cy="27" r="2"/>
      <path class="line" d="M27 38V21h21M30 47h31"/>
      <rect class="accent" x="32" y="25" width="13" height="4" rx="1"/>
    </svg></span>`;
  }

  if(t.includes("cnc") || id.includes("cnc")){
    return `<span class="tech-icon" aria-hidden="true"><svg viewBox="0 0 92 60">
      <rect class="body" x="10" y="13" width="72" height="38" rx="3"/>
      <rect class="dark" x="16" y="19" width="42" height="24" rx="2"/>
      <rect class="metal" x="62" y="18" width="14" height="25" rx="2"/>
      <circle class="glow" cx="69" cy="23" r="2"/>
      <circle class="accent" cx="69" cy="30" r="2"/>
      <path class="line" d="M21 38h31M23 33l7-8 7 4 9-7"/>
      <rect class="metal" x="26" y="51" width="40" height="4" rx="1"/>
    </svg></span>`;
  }

  return `<span class="tech-icon" aria-hidden="true"><svg viewBox="0 0 92 60">
    <circle class="body" cx="46" cy="30" r="19"/><circle class="accent" cx="46" cy="30" r="8"/>
    <path class="line" d="M46 6v9M46 45v9M22 30h9M61 30h9M29 13l6 7M57 40l6 7M63 13l-6 7M35 40l-6 7"/>
  </svg></span>`;
}

function sparkSvg(values, cls=""){
  const vals=(values||[]).map(Number).filter(Number.isFinite);
  if(vals.length<2) return `<svg viewBox="0 0 100 28"><polyline class="${cls}" points="0,20 100,20"/></svg>`;
  let mn=Math.min(...vals), mx=Math.max(...vals), rg=mx-mn||1;
  const points=vals.map((v,i)=>{
    const x=i/(vals.length-1)*100;
    const y=24-((v-mn)/rg)*19;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return `<svg viewBox="0 0 100 28" preserveAspectRatio="none"><polyline class="${cls}" points="${points}"/></svg>`;
}

function focusPanelHtml(){
  const id=selected || MACHINES.find(m=>latest[m.id])?.id || MACHINES[0].id;
  const m=meta(id), r=latest[id], s=state(r), rs=recs(id,24);
  const rmsVals=rs.map(x=>+x.rms);
  const tempVals=rs.map(x=>+x.temperatura);
  return `<article class="machine-focus" id="machineFocus">
    <div class="focus-head">
      <div><span class="focus-kicker">Máquina selecionada</span><h3>${m.name}</h3></div>
      <span class="focus-live"><i></i>LIVE</span>
    </div>
    <div class="focus-body">
      ${technicalIcon(m)}
      <div class="focus-summary">
        <div class="focus-state ${s}">${r?label(s):"Sem dados"}</div>
        <div class="focus-sub">${m.type} • ${r?new Date(r.created_at).toLocaleTimeString("pt-BR"):"aguardando dados"}</div>
      </div>
    </div>
    <div class="focus-metrics">
      <div><span>Horímetro</span><strong>${r?fmt(r.horimetro,2)+" h":"--"}</strong></div>
      <div><span>RMS</span><strong>${r?fmt(r.rms,3)+" g":"--"}</strong></div>
      <div><span>Temp.</span><strong>${r&&r.temperatura!=null?fmt(r.temperatura,1)+" °C":"--"}</strong></div>
    </div>
    <div class="focus-trend">
      <div class="focus-trend-box"><header><span>Vibração</span><b>${r?fmt(r.rms,3)+" g":"--"}</b></header>${sparkSvg(rmsVals)}</div>
      <div class="focus-trend-box"><header><span>Temperatura</span><b>${r&&r.temperatura!=null?fmt(r.temperatura,1)+" °C":"--"}</b></header>${sparkSvg(tempVals,"temp-line")}</div>
    </div>
    <div class="focus-actions"><button class="focus-button" data-focus-details="${id}">Ver detalhes →</button></div>
  </article>`;
}

function selectMachine(id){
  selected=id;
  cards("machineGrid");
  cards("machineGridLarge");
}

function demo(){const out=[],now=Date.now();MACHINES.forEach((m,k)=>{const base=100+k*43.7;for(let i=59;i>=0;i--){let running=k%4!==2;if(k===5&&i<14)running=false;if(k===8&&i<22)running=false;let rms=running?.035+k*.003+Math.sin((i+k)/5)*.008+Math.random()*.006:.004+Math.random()*.003;let temp=running?31+k*.55+Math.sin(i/9)*1.2+Math.random()*.5:29+Math.random()*.7;if(m.id==="TORNO_04"&&i<5)rms=.46+Math.random()*.04;if(m.id==="FURADEIRA_02"&&i<7)temp=66+Math.random()*2.5;if(m.id==="TORNO_03"&&i<10)running=false;const peak=Math.max(rms*(2+Math.random()*1.8),rms);out.push({id:`${m.id}_${i}`,created_at:new Date(now-i*60000).toISOString(),machine:m.id,running,horimetro:base+(59-i)*(running?1:0)/60,rms,pico:peak,crest:rms?peak/rms:0,temperatura:temp})}});return out}
async function fetchCloud(){const u=`${SUPABASE_URL}/rest/v1/machine_data?select=*&order=created_at.desc&limit=1200`;const r=await fetch(u,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${SUPABASE_PUBLISHABLE_KEY}`}});if(!r.ok)throw Error(`HTTP ${r.status}`);return r.json()}
function rebuild(){latest={};[...allRecords].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).forEach(r=>{if(!latest[r.machine])latest[r.machine]=r})}
function recs(id,n=60){return allRecords.filter(r=>r.machine===id).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)).slice(-n)}
function cards(target){
  const e=document.getElementById(target);
  e.innerHTML=MACHINES.map(m=>{
    const r=latest[m.id],s=state(r),isSelected=(selected===m.id);
    return `<article class="machine ${s} ${isSelected?"selected":""}" data-id="${m.id}">
      <div class="mhead"><h3>${m.name}</h3><span class="pill">${r?label(s):"Sem dados"}</span></div>
      <div class="visual">${technicalIcon(m)}<span>${m.type}</span></div>
      <div class="mainrow">
        <div><span>Horímetro</span><strong>${r?fmt(r.horimetro,2)+" h":"--"}</strong></div>
        <div style="text-align:right"><span>Atualização</span><strong style="font-size:.78rem">${r?new Date(r.created_at).toLocaleTimeString("pt-BR"):"--"}</strong></div>
      </div>
      <div class="metrics">
        <div><span>RMS</span><strong>${r?fmt(r.rms,3)+" g":"--"}</strong></div>
        <div><span>Pico</span><strong>${r?fmt(r.pico,3)+" g":"--"}</strong></div>
        <div><span>Temp.</span><strong>${r&&r.temperatura!=null?fmt(r.temperatura,1)+" °C":"--"}</strong></div>
      </div>
    </article>`;
  }).join("") + focusPanelHtml();

  e.querySelectorAll(".machine").forEach(x=>{
    x.onclick=()=>selectMachine(x.dataset.id);
  });

  const detailBtn=e.querySelector("[data-focus-details]");
  if(detailBtn) detailBtn.onclick=(ev)=>{
    ev.stopPropagation();
    openMachine(detailBtn.dataset.focusDetails);
  };
}
function kpis(){const st=MACHINES.map(m=>state(latest[m.id])),run=st.filter(s=>s!=="stopped").length,stop=st.filter(s=>s==="stopped").length,al=st.filter(s=>s==="warning"||s==="alarm").length,total=MACHINES.length,util=Math.round(run/total*100),hours=MACHINES.reduce((a,m)=>a+(+latest[m.id]?.horimetro||0),0);kTotal.textContent=total;kRun.textContent=run;kStop.textContent=stop;kAlert.textContent=al;kUtil.textContent=util+"%";kHours.textContent=fmt(hours,0)+" h";kRunP.textContent=fmt(run/total*100,1)+"% da oficina";kStopP.textContent=fmt(stop/total*100,1)+"% da oficina";lRun.textContent=run;lStop.textContent=stop;lAlert.textContent=al;donutPct.textContent=util+"%";const gp=run/total*100,op=(run+stop)/total*100;donut.style.background=`conic-gradient(var(--green) 0 ${gp}%,var(--orange) ${gp}% ${op}%,var(--red) ${op}% 100%)`}
function alerts(){const items=MACHINES.map(m=>{const r=latest[m.id],s=state(r);if(!r||!(s==="warning"||s==="alarm"))return null;let reason="Condição fora do limite";if(+r.rms>=LIMITS.rmsAlarm)reason="Vibração acima do limite de alarme";else if(+r.rms>=LIMITS.rmsWarn)reason="Vibração em atenção";else if(+r.temperatura>=LIMITS.tempAlarm)reason="Temperatura acima do limite";else if(+r.temperatura>=LIMITS.tempWarn)reason="Temperatura em atenção";return{m,r,s,reason}}).filter(Boolean);recentAlerts.innerHTML=items.slice(0,5).map(x=>`<div class="alert"><div>⚠</div><div><strong>${x.m.name}</strong><span>${x.reason}</span></div><time>${new Date(x.r.created_at).toLocaleTimeString("pt-BR")}</time></div>`).join("")||`<div class="alert"><div>✓</div><div><strong>Sem alertas ativos</strong><span>Condições dentro dos limites</span></div><time>agora</time></div>`;alertsTable.innerHTML=tableHtml(items.map(x=>[x.m.name,label(x.s),x.reason,fmt(x.r.rms,3)+" g",fmt(x.r.temperatura,1)+" °C",new Date(x.r.created_at).toLocaleString("pt-BR")]),["Máquina","Status","Motivo","RMS","Temperatura","Data/Hora"])}
function tableHtml(rows,heads){return `<table><thead><tr>${heads.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")||`<tr><td colspan="${heads.length}">Sem registros.</td></tr>`}</tbody></table>`}
function history(){const rows=[...allRecords].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,80).map(r=>[new Date(r.created_at).toLocaleString("pt-BR"),meta(r.machine).name,label(state(r)),fmt(r.horimetro,2)+" h",fmt(r.rms,3)+" g",fmt(r.pico,3)+" g",fmt(r.crest,2),r.temperatura!=null?fmt(r.temperatura,1)+" °C":"--"]);historyTable.innerHTML=tableHtml(rows,["Data/Hora","Máquina","Estado","Horímetro","RMS","Pico","Crest","Temperatura"])}
function spark(id,vals){const c=document.getElementById(id),x=c.getContext("2d"),r=c.getBoundingClientRect(),d=devicePixelRatio||1;c.width=Math.max(300,r.width*d);c.height=66*d;x.clearRect(0,0,c.width,c.height);if(vals.length<2)return;const mn=Math.min(...vals),mx=Math.max(...vals),rg=mx-mn||1;x.strokeStyle="#00a8ff";x.lineWidth=2*d;x.beginPath();vals.forEach((v,i)=>{const px=5*d+i/(vals.length-1)*(c.width-10*d),py=c.height-7*d-(v-mn)/rg*(c.height-14*d);i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke()}
function minis(){const L=MACHINES.map(m=>latest[m.id]).filter(Boolean),avg=f=>{const a=L.map(r=>+r[f]).filter(Number.isFinite);return a.reduce((s,v)=>s+v,0)/(a.length||1)};avgRms.textContent=fmt(avg("rms"),3)+" g";avgTemp.textContent=fmt(avg("temperatura"),1)+" °C";avgPeak.textContent=fmt(avg("pico"),3)+" g";avgCrest.textContent=fmt(avg("crest"),2);spark("sRms",L.map(r=>+r.rms));spark("sTemp",L.map(r=>+r.temperatura));spark("sPeak",L.map(r=>+r.pico));spark("sCrest",L.map(r=>+r.crest))}
function line(id,rs,field,dig){const c=document.getElementById(id),x=c.getContext("2d"),r=c.getBoundingClientRect(),D=devicePixelRatio||1;c.width=Math.max(500,r.width*D);c.height=250*D;x.clearRect(0,0,c.width,c.height);const v=rs.map(z=>+z[field]).filter(Number.isFinite);if(!v.length)return;const pl=58*D,pr=15*D,pt=15*D,pb=30*D,pw=c.width-pl-pr,ph=c.height-pt-pb;let mn=Math.min(...v),mx=Math.max(...v),rg=mx-mn||Math.max(Math.abs(mx)*.1,1);mn-=rg*.15;mx+=rg*.15;x.strokeStyle="#1d2c39";x.fillStyle="#8395a8";x.font=`${10*D}px Segoe UI`;for(let i=0;i<5;i++){const py=pt+ph*i/4;x.beginPath();x.moveTo(pl,py);x.lineTo(c.width-pr,py);x.stroke();x.fillText((mx-(mx-mn)*i/4).toFixed(dig),3*D,py+3*D)}x.strokeStyle="#00a8ff";x.lineWidth=2.3*D;x.beginPath();v.forEach((z,i)=>{const px=pl+i/(v.length-1||1)*pw,py=pt+(1-(z-mn)/(mx-mn))*ph;i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke()}
function openMachine(id){selected=id;const m=meta(id),r=latest[id],rs=recs(id);mTitle.textContent=m.name;dStatus.textContent=r?label(state(r)):"Sem dados";dHours.textContent=r?fmt(r.horimetro,2)+" h":"--";dRms.textContent=r?fmt(r.rms,3)+" g":"--";dPeak.textContent=r?fmt(r.pico,3)+" g":"--";dCrest.textContent=r?fmt(r.crest,2):"--";dTemp.textContent=r&&r.temperatura!=null?fmt(r.temperatura,1)+" °C":"--";line("rmsChart",rs,"rms",3);line("tempChart",rs,"temperatura",1);machineHistory.innerHTML=tableHtml([...rs].reverse().slice(0,20).map(z=>[new Date(z.created_at).toLocaleString("pt-BR"),z.running?"Ligada":"Parada",fmt(z.horimetro,2)+" h",fmt(z.rms,3)+" g",fmt(z.pico,3)+" g",fmt(z.crest,2),fmt(z.temperatura,1)+" °C"]),["Data/Hora","Estado","Horímetro","RMS","Pico","Crest","Temp."]);modal.classList.remove("hidden")}
function render(){rebuild();if(!selected)selected=MACHINES.find(m=>latest[m.id])?.id||MACHINES[0].id;kpis();cards("machineGrid");cards("machineGridLarge");alerts();history();minis()}
async function load(){try{if(DEMO_MODE){allRecords=demo();cloud.textContent="MODO DEMONSTRAÇÃO";cloud.className="badge"}else{allRecords=await fetchCloud();cloud.textContent="NUVEM CONECTADA";cloud.className="badge online"}render()}catch(e){console.error(e);cloud.textContent="ERRO NA NUVEM";cloud.className="badge error"}}
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));document.getElementById(b.dataset.view).classList.add("active")});close.onclick=()=>modal.classList.add("hidden");modal.onclick=e=>{if(e.target===modal)modal.classList.add("hidden")};full.onclick=async()=>{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()};function tick(){const d=new Date();clock.textContent=d.toLocaleTimeString("pt-BR");date.textContent=d.toLocaleDateString("pt-BR")}tick();setInterval(tick,1000);window.onresize=()=>{minis();if(selected&&!modal.classList.contains("hidden"))openMachine(selected)};load();if(!DEMO_MODE)setInterval(load,10000);
