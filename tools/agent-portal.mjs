/**
 * Agent portal — a live local dashboard over every workflow swarm this session
 * has launched.
 *
 * Reads the harness's own on-disk state (no APIs, no writes):
 *   - subagents/workflows/wf_<id>         one dir per workflow run
 *       agent-<id>.jsonl                   per-agent transcript (mtime = activity)
 *       journal.jsonl                      one {"type":"result"} line per finished agent
 *   - workflows/scripts/<name>-<runid>.js  run id -> human name
 *   - the repo working tree                which files agents are editing right now
 *
 *   node tools/agent-portal.mjs            # serves http://localhost:7777
 */
import { createServer } from "node:http";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SESSION = "/Users/vedantpatnaik/.claude/projects/-Users-vedantpatnaik-yunto/b8c30cb6-7453-45ba-8ba4-35c602e22c41";
const WF_DIR = path.join(SESSION, "subagents", "workflows");
const SCRIPTS = path.join(SESSION, "workflows", "scripts");
const REPO = "/Users/vedantpatnaik/yunto";
const PORT = 7777;

/** Known runs launched from /tmp scripts, which the scripts dir can't name. */
const EXTRA_NAMES = {
  "wf_d6b49163-9da": "visual-audit wave 1",
  "wf_ca540f78-cd5": "visual-audit wave 2",
  "wf_9e80eefa-f7f": "visual-audit wave 3",
  "wf_dbee560a-b50": "visual-audit wave 4",
  "wf_2c15d77f-6d0": "wire-dead-controls (51 files)",
  "wf_dc4af5b9-ff8": "make-forms-persist",
  "wf_911a600e-6e6": "visual-audit pilot",
};

function nameFor(runId) {
  if (EXTRA_NAMES[runId]) return EXTRA_NAMES[runId];
  try {
    const hit = fs.readdirSync(SCRIPTS).find((f) => f.endsWith(`${runId}.js`));
    if (hit) return hit.replace(`-${runId}.js`, "");
  } catch {}
  return runId;
}

/** Newest mtime under a run dir — the liveness signal. */
function lastActivity(dir) {
  let newest = 0;
  for (const f of fs.readdirSync(dir)) {
    const t = fs.statSync(path.join(dir, f)).mtimeMs;
    if (t > newest) newest = t;
  }
  return newest;
}

function snapshot() {
  const now = Date.now();
  const runs = [];
  for (const d of fs.readdirSync(WF_DIR)) {
    if (!d.startsWith("wf_")) continue;
    const dir = path.join(WF_DIR, d);
    const files = fs.readdirSync(dir);
    const agents = files.filter((f) => f.startsWith("agent-") && f.endsWith(".jsonl")).length;

    let results = [];
    try {
      results = fs
        .readFileSync(path.join(dir, "journal.jsonl"), "utf8")
        .trim().split("\n").filter(Boolean)
        .map((l) => { try { return JSON.parse(l); } catch { return null; } })
        .filter((r) => r && r.type === "result");
    } catch {}

    // Per-agent activity: transcript size + how recently it wrote.
    const agentRows = files
      .filter((f) => f.startsWith("agent-") && f.endsWith(".jsonl"))
      .map((f) => {
        const st = fs.statSync(path.join(dir, f));
        return {
          id: f.slice(6, 14),
          kb: Math.round(st.size / 1024),
          idleSec: Math.round((now - st.mtimeMs) / 1000),
        };
      })
      .sort((a, b) => a.idleSec - b.idleSec);

    const last = lastActivity(dir);
    const active = now - last < 120_000;
    const tail = results.slice(-4).map((r) => {
      const v = r.result;
      const s = typeof v === "string" ? v : JSON.stringify(v);
      return s.replace(/\s+/g, " ").slice(0, 150);
    });

    runs.push({
      runId: d,
      name: nameFor(d),
      agentsSpawned: agents,
      agentsDone: results.length,
      status: active ? "RUNNING" : results.length ? "DONE" : "IDLE",
      idleSec: Math.round((now - last) / 1000),
      agents: agentRows.slice(0, 60),
      tail,
    });
  }
  runs.sort((a, b) => a.idleSec - b.idleSec);

  // What agents are editing in the repo right now.
  let editing = [];
  try {
    editing = execSync(`git -C ${REPO} status --porcelain`, { encoding: "utf8" })
      .trim().split("\n").filter(Boolean).slice(0, 40)
      .map((l) => l.slice(3));
  } catch {}
  let recent = [];
  try {
    recent = execSync(
      `find ${REPO}/web/src ${REPO}/mobile/app ${REPO}/server/src -name "*.ts*" -mmin -3 2>/dev/null | head -20`,
      { encoding: "utf8" }
    ).trim().split("\n").filter(Boolean).map((f) => f.replace(REPO + "/", ""));
  } catch {}

  return { at: new Date().toISOString(), runs, editing, recent };
}

const HTML = `<!doctype html><html><head><meta charset="utf-8"><title>Yunto — Agent Portal</title>
<style>
  :root{color-scheme:dark}
  body{margin:0;background:#0d0f14;color:#e6e6e6;font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}
  header{padding:18px 24px;border-bottom:1px solid #23262f;display:flex;align-items:baseline;gap:14px}
  h1{font-size:16px;margin:0;font-weight:600}
  #at{color:#6b7280;font-size:11px}
  main{padding:18px 24px;display:grid;grid-template-columns:1fr 320px;gap:18px}
  .run{border:1px solid #23262f;border-radius:10px;padding:12px 14px;margin-bottom:12px;background:#12141a}
  .run h2{font-size:13px;margin:0 0 6px;display:flex;gap:10px;align-items:center}
  .badge{font-size:10px;padding:1px 8px;border-radius:99px;font-weight:600}
  .RUNNING{background:#0d3321;color:#4ade80}.DONE{background:#1e2a4a;color:#93c5fd}.IDLE{background:#33240d;color:#fbbf24}
  .meta{color:#9ca3af;font-size:11px}
  .bar{height:6px;border-radius:3px;background:#23262f;margin:8px 0;overflow:hidden}
  .bar i{display:block;height:100%;background:linear-gradient(90deg,#4ade80,#22d3ee)}
  .tail{color:#8b93a7;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .agents{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px}
  .dot{width:10px;height:10px;border-radius:3px;background:#374151}
  .dot.hot{background:#4ade80}.dot.warm{background:#a3e635}.dot.cool{background:#6b7280}
  aside .box{border:1px solid #23262f;border-radius:10px;padding:12px 14px;background:#12141a;margin-bottom:12px}
  aside h3{margin:0 0 8px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em}
  aside li{list-style:none;font-size:11px;color:#c9d1e3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  aside ul{margin:0;padding:0}
  .pulse{animation:p 1.6s infinite}@keyframes p{50%{opacity:.45}}
</style></head><body>
<header><h1>⚙︎ Yunto Agent Portal</h1><span id="at"></span></header>
<main><section id="runs"></section>
<aside>
  <div class="box"><h3 class="pulse">files being edited now</h3><ul id="recent"></ul></div>
  <div class="box"><h3>uncommitted changes</h3><ul id="editing"></ul></div>
</aside></main>
<script>
async function tick(){
  try{
    const d = await (await fetch('/api/state')).json();
    document.getElementById('at').textContent = 'updated ' + new Date(d.at).toLocaleTimeString();
    document.getElementById('runs').innerHTML = d.runs.map(r => {
      const pct = r.agentsSpawned ? Math.min(100, Math.round(100*r.agentsDone/Math.max(r.agentsSpawned,1))) : 0;
      const dots = (r.agents||[]).map(a =>
        '<span class="dot '+(a.idleSec<30?'hot':a.idleSec<120?'warm':'cool')+'" title="agent '+a.id+' · '+a.kb+'KB · idle '+a.idleSec+'s"></span>').join('');
      return '<div class="run"><h2><span class="badge '+r.status+'">'+r.status+'</span>'+r.name+
        '<span class="meta">'+r.agentsDone+'/'+r.agentsSpawned+' agents · idle '+r.idleSec+'s</span></h2>'+
        '<div class="bar"><i style="width:'+pct+'%"></i></div>'+
        '<div class="agents">'+dots+'</div>'+
        (r.tail||[]).map(t=>'<div class="tail">'+t.replace(/</g,'&lt;')+'</div>').join('')+
        '</div>';
    }).join('');
    document.getElementById('recent').innerHTML = (d.recent.length? d.recent : ['—']).map(f=>'<li>'+f+'</li>').join('');
    document.getElementById('editing').innerHTML = (d.editing.length? d.editing : ['(clean)']).map(f=>'<li>'+f+'</li>').join('');
  }catch(e){ document.getElementById('at').textContent='reconnecting…'; }
}
tick(); setInterval(tick, 2500);
</script></body></html>`;

createServer((req, res) => {
  if (req.url?.startsWith("/api/state")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(snapshot()));
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(HTML);
}).listen(PORT, () => console.log(`agent portal on http://localhost:${PORT}`));
