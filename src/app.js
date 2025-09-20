// src/app.js - small bootstrap that wires module pieces created during refactor

window.FEEDBACKS = window.FEEDBACKS || [];
window.HEAT = window.HEAT || { update: function(){ /* noop */ } };
window.ASPECTS = ["Communication","Scheduling","Clarity","Respect","Conduct","Feedback"];

function initAspects(){
  try{
    const $ = window.__HELPERS && window.__HELPERS.$ ? window.__HELPERS.$ : (s=>document.querySelector(s));
    const wrap = $("#aspects"); if(!wrap) return;
    wrap.innerHTML = "";
    window.ASPECTS.forEach(a=>{
      const el = document.createElement("button");
      el.className = "chip";
      el.type = "button";
      el.textContent = a;
      el.onclick = ()=>el.classList.toggle("active");
      wrap.appendChild(el);
    });
  }catch(e){ console.log("initAspects error", e); }
}

function exportFeedbacksCSV(){
  if(!window.FEEDBACKS || window.FEEDBACKS.length===0){ window.__UI && window.__UI.setFeedbackStatus && window.__UI.setFeedbackStatus("No feedback to export"); return; }
  const cols = ["time","stage","role","nss","idx","aspects","headline","well","better","overall","fairness","conflict","resched","consent","savedToServer","savedError"];
  const rows = window.FEEDBACKS.map(f=>cols.map(c=>{
    let v = f[c];
    if(Array.isArray(v)) v = v.join("; ");
    if(typeof v === "boolean") v = v ? "1" : "0";
    return "\""+String(v===undefined?"":v).replace(/"/g,"\"\"")+"\"";
  }).join(","));
  const csv = cols.join(",") + "\n" + rows.join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "cxi_feedbacks.csv"; document.body.appendChild(a); a.click();
  setTimeout(()=>{ document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
}
window.exportFeedbacksCSV = exportFeedbacksCSV;

function score(){
  const helpers = window.__HELPERS || {};
  const clamp = helpers.clamp || ((n,min,max)=>Math.max(min,Math.min(max,n)));
  const wc = helpers.wc || (t=>String(t||"").trim().split(/\s+/).filter(Boolean).length);
  const overall = parseInt(document.getElementById("overall")?.value,10) || 3;
  const fairness = parseInt(document.getElementById("fairness")?.value,10) || 3;
  const well = document.getElementById("well")?.value || "";
  const better = document.getElementById("better")?.value || "";
  const headline = (document.getElementById("headline")?.value || "").trim();
  const aspects = Array.from(document.querySelectorAll("#aspects .chip.active")||[]).map(el=>el.textContent);
  const stage = (document.getElementById("stage")||{value:""}).value;
  const role = (document.getElementById("role")||{value:""}).value;
  const consent = (document.getElementById("consent")||{checked:false}).checked;
  const conflict = (document.getElementById("conflict")||{value:""}).value;
  const resched = (document.getElementById("resched")||{value:""}).value;
  const errs = [];
  if(wc(well) < 15) errs.push("\"What went well\" needs ≥ 15 words.");
  if(wc(better) < 15) errs.push("\"Could be better\" needs ≥ 15 words.");
  if(errs.length){ alert(errs.join("\n")); return; }
  let nss = (overall-3)/2; nss += (fairness-3)/4; nss = clamp(nss,-1,1);
  const richness = wc(well) + wc(better) + aspects.length*20;
  let idx = (nss+1)/2; idx = clamp((idx*0.75) + (Math.min(richness,250)/250)*0.25, 0, 1);
  const kpiNss = document.getElementById("kpi-nss"); if(kpiNss) kpiNss.textContent = nss.toFixed(2);
  const kpiIndex = document.getElementById("kpi-index"); if(kpiIndex) kpiIndex.textContent = idx.toFixed(2);
  const explain = document.getElementById("explain"); if(explain) explain.innerHTML = `<div><b>Headline:</b> ${headline||"(none)"} </div><div class="mt-8"><b>Went well:</b> <span style="color:var(--good)">${[] /* highlights omitted */.join(", ")||"—"}</span></div><div class="mt-8"><b>Could be better:</b> <span style="color:var(--bad)">${[] .join(", ")||"—"}</span></div><div class="mt-8"><b>Aspect tags (ABSA):</b> ${(aspects).join(", ")||"—"}</div>`;
  window.HEAT.update(stage, aspects, idx);
  if(idx >= 0.60){ const c = document.createElement("div"); c.style.position = "fixed"; c.style.inset = "0"; c.style.pointerEvents = "none"; c.innerHTML = "<canvas id=\"conf\" style=\"width:100%;height:100%\"></canvas>"; document.body.appendChild(c); setTimeout(()=>document.body.removeChild(c), 1200); }
  window.FEEDBACKS.push({ nss, idx, stage, role, aspects, headline, well, better, overall, fairness, conflict, resched, consent, time: new Date().toLocaleString() });
  try{ window.__STORAGE && window.__STORAGE.saveFeedbacks && window.__STORAGE.saveFeedbacks(); }catch(e){ console.log("storage error", e); }
  window.__lastScore = { nss, idx, stage, role, aspects, headline };
  window.__UI && window.__UI.renderFeedbacks && window.__UI.renderFeedbacks();
  try{ const lastIdx = window.FEEDBACKS.length - 1; window.__RETRY && window.__RETRY.sendToServer && window.__RETRY.sendToServer(lastIdx); }catch(e){ console.log("server push error", e); }
}
window.score = score;

document.addEventListener("DOMContentLoaded", ()=>{
  try{ window.__STORAGE && window.__STORAGE.loadFeedbacks && window.__STORAGE.loadFeedbacks(); }catch(e){ console.log("load feedbacks error", e); }
  try{ window.__UI && window.__UI.renderFeedbacks && window.__UI.renderFeedbacks(); }catch(e){ console.log("render feedbacks error", e); }
  try{ initAspects(); }catch(e){ console.log("init aspects error", e); }
  try{ window.__UI && window.__UI.wireUI && window.__UI.wireUI(); }catch(e){ console.log("wire UI error", e); }
  try{ window.__RETRY && window.__RETRY.backgroundRetryLoop && window.__RETRY.backgroundRetryLoop(); }catch(e){ console.log("retry loop error", e); }
  try{ window.CXI_HELPERS = window.CXI_HELPERS || {}; window.CXI_HELPERS.sendToServer = window.__RETRY && window.__RETRY.sendToServer; window.CXI_HELPERS.retryFeedback = window.__RETRY && window.__RETRY.retryFeedback; window.CXI_HELPERS.pushAllUnsent = window.__RETRY && window.__RETRY.pushAllUnsent; }catch(e){ console.log("CXI helpers error", e); }
});

// Pipeline hook: process fields via PIPELINE (if present) before calling score()
(function(){
  const originalScore = window.score;
  window.score = function(){
    const well = document.getElementById("well")?.value || "";
    const better = document.getElementById("better")?.value || "";
    const headline = (document.getElementById("headline")?.value || "").trim();
    try{
      const pWell = window.PIPELINE ? window.PIPELINE.processResponse({text: well, meta: {field: "well"}}) : {redactedText: well};
      const pBetter = window.PIPELINE ? window.PIPELINE.processResponse({text: better, meta: {field: "better"}}) : {redactedText: better};
      const pHead = window.PIPELINE ? window.PIPELINE.processResponse({text: headline, meta: {field: "headline"}}) : {redactedText: headline};
      if(pWell && pWell.redactedText !== undefined) document.getElementById("well").value = pWell.redactedText;
      if(pBetter && pBetter.redactedText !== undefined) document.getElementById("better").value = pBetter.redactedText;
      if(pHead && pHead.redactedText !== undefined) document.getElementById("headline").value = pHead.redactedText;
      originalScore && originalScore();
      const q = window.PIPELINE ? window.PIPELINE.readQueue() : [];
      if(q && q.length) window.__UI && window.__UI.setFeedbackStatus && window.__UI.setFeedbackStatus(`Some items queued for human review (${q.length}) — PII redacted.`, 8000);
    }catch(e){ console.log("pipeline hook error", e); originalScore && originalScore(); }
  };
})();
