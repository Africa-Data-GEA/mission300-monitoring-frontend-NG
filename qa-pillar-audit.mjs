const BASE='http://localhost:3001'
const login = await fetch(`${BASE}/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@m300.local',password:'ChangeMe123!'})})
const { accessToken } = await login.json()
const H = { Authorization:`Bearer ${accessToken}` }
const PILLARS=['generation-network','last-mile-access','financially-viable-utilities','private-sector-participation','regional-integration','clean-cooking']
const issues=[]
for (const p of PILLARS) {
  const r = await fetch(`${BASE}/pillars/${p}`,{headers:H})
  if(!r.ok){ issues.push([p,'CRITICAL',`HTTP ${r.status}`]); continue }
  const j = await r.json()
  const hc = j.headlineCards||[]
  const ci = j.coreIndicators||[]
  const withData = ci.filter(k=>k.current !== null && k.current !== undefined)
  console.log(`\n=== ${p.toUpperCase()} ===`)
  console.log(`  headline cards: ${hc.length} | core indicators: ${ci.length} (${withData.length} with a value)`)
  hc.forEach(c=>{
    const empty = !c.value || /no data|not yet|awaiting/i.test(String(c.value))
    console.log(`   ${empty?'[EMPTY]':'[ ok  ]'} ${String(c.title).slice(0,44).padEnd(46)} ${c.value}`)
    if(empty) issues.push([p,'headline-empty',c.title])
  })
  // integrity scans
  for (const k of ci) {
    const v = String(k.currentLabel ?? '')
    if (/\d+\.\d{5,}/.test(v)) issues.push([p,'precision',`${k.title}: ${v}`])
    if (/\bq[1-4]-\d{4}\b/.test(v+String(k.reportingPeriod??''))) issues.push([p,'raw-period',`${k.title}`])
    if (/undefined|NaN|\[object/.test(v)) issues.push([p,'bad-value',`${k.title}: ${v}`])
    const pct = parseFloat(v)
    if (String(k.unit)==='%' && !Number.isNaN(pct) && (pct<0||pct>100)) issues.push([p,'pct-range',`${k.title}: ${v}`])
  }
  console.log(`  projects: ${(j.projects||[]).length} | programmes: ${(j.programmes||[]).length} | bottlenecks: ${(j.bottlenecks||[]).length}`)
}
console.log('\n\n================ ISSUES ================')
if(!issues.length) console.log('none')
for(const [p,k,d] of issues) console.log(`[${k}] ${p}: ${d}`)
