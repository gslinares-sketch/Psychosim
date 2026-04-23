"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";

const MODALITY_COLORS = { transpersonal:"#7c6fcd", cbt:"#4a90a4", humanistic:"#5a9e6f", psychodynamic:"#c4875a", existential:"#a05a7c", somatic:"#7a9e5a" };

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile(prof);
    const { data: sess } = await supabase.from("sessions").select("*").eq("student_id", user.id).order("created_at", { ascending: false }).limit(20);
    setSessions(sess || []);
    const { data: memberships } = await supabase.from("group_members").select("groups(*)").eq("student_id", user.id);
    setGroups(memberships?.map(m => m.groups) || []);
    setLoading(false);
  }

  async function joinGroup() {
    if (!joinCode.trim()) return;
    setJoining(true); setJoinError("");
    const { data: group } = await supabase.from("groups").select("*").eq("code", joinCode.toUpperCase()).single();
    if (!group) { setJoinError("Group not found. Check the code."); setJoining(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("group_members").insert({ group_id: group.id, student_id: user.id });
    if (error) { setJoinError("Already in this group or error joining."); }
    else { setJoinCode(""); loadData(); }
    setJoining(false);
  }

  async function signOut() { await supabase.auth.signOut(); router.push("/auth"); }

  function formatDate(d) { return new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" }); }
  function formatTime(s) { return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0f1117", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ display:"flex", gap:8 }}>{[0,1,2].map(i=><div key={i} style={{ width:8, height:8, borderRadius:"50%", background:"#4a90a4", animation:`pulse 1s ${i*.2}s infinite` }}/>)}</div>
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
    </div>
  );

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f1117; font-family: 'Inter', sans-serif; }
    input { font-family: 'Inter', sans-serif; }
    @keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    .fu { animation: fadeUp .4s ease forwards; }
    .card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); border-radius: 14px; padding: 20px 24px; }
    .sess-row { background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.06); border-radius: 10px; padding: 14px 18px; transition: all .2s; cursor: pointer; }
    .sess-row:hover { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.1); }
    .btn-p { background: linear-gradient(135deg,#4a90a4,#357a8a); color: white; border: none; padding: 11px 22px; border-radius: 9px; font-family: 'Inter',sans-serif; font-weight: 600; font-size: 13px; cursor: pointer; transition: all .2s; }
    .btn-p:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(74,144,164,.3); }
    .btn-g { background: transparent; color: #8892a4; border: 1px solid rgba(255,255,255,.1); padding: 10px 18px; border-radius: 8px; font-family: 'Inter',sans-serif; font-size: 13px; cursor: pointer; transition: all .2s; }
    .btn-g:hover { background: rgba(255,255,255,.05); color: #cdd5e0; }
    .inp { background: rgba(255,255,255,.05); border: 1.5px solid rgba(255,255,255,.1); border-radius: 9px; padding: 11px 14px; color: #e2e8f0; font-size: 13px; outline: none; transition: border-color .2s; }
    .inp:focus { border-color: rgba(74,144,164,.6); }
    .inp::placeholder { color: #4a5568; }
    .tag { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 500; }
    ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #2a2d3a; border-radius: 4px; }
  `;

  const avgFeedbackScore = sessions.length;

  return (
    <div style={{ minHeight:"100vh", background:"#0f1117", color:"#e2e8f0", fontFamily:"'Inter',sans-serif" }}>
      <style>{css}</style>

      {/* Nav */}
      <nav style={{ background:"rgba(15,17,23,.9)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,.06)", padding:"0 28px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#4a90a4,#7c6fcd)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"white" }}>P</div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:600 }}>PsychoSim</span>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <span style={{ fontSize:13, color:"#4a5568" }}>{profile?.name}</span>
          <button className="btn-g" style={{ fontSize:12, padding:"7px 14px" }} onClick={signOut}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 28px" }}>
        <div className="fu">
          {/* Header */}
          <div style={{ marginBottom:36 }}>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:600, marginBottom:6 }}>
              Welcome back, {profile?.name?.split(" ")[0]} 👋
            </h1>
            <p style={{ fontSize:14, color:"#4a5568" }}>{sessions.length} sessions completed · Keep practicing</p>
          </div>

          {/* Stats row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:36 }}>
            {[
              { label:"Total Sessions", value:sessions.length, icon:"🎯" },
              { label:"This Week", value:sessions.filter(s => new Date(s.created_at) > new Date(Date.now()-7*24*60*60*1000)).length, icon:"📅" },
              { label:"Groups Joined", value:groups.length, icon:"👥" },
            ].map(stat => (
              <div key={stat.label} className="card">
                <div style={{ fontSize:24, marginBottom:8 }}>{stat.icon}</div>
                <div style={{ fontSize:28, fontWeight:700, color:"#e2e8f0", marginBottom:4 }}>{stat.value}</div>
                <div style={{ fontSize:12, color:"#4a5568" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20 }}>
            {/* Sessions list */}
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <h2 style={{ fontSize:16, fontWeight:600 }}>Recent Sessions</h2>
                <button className="btn-p" onClick={() => router.push("/")}>+ New Session</button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {sessions.length === 0 && (
                  <div className="card" style={{ textAlign:"center", padding:"40px 24px", color:"#4a5568" }}>
                    <div style={{ fontSize:32, marginBottom:12 }}>🧠</div>
                    <p>No sessions yet. Start your first one!</p>
                  </div>
                )}
                {sessions.map(s => (
                  <div key={s.id} className="sess-row">
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span className="tag" style={{ background:MODALITY_COLORS[s.modality]+"22", color:MODALITY_COLORS[s.modality], border:`1px solid ${MODALITY_COLORS[s.modality]}44` }}>
                          {s.modality}
                        </span>
                        <span className="tag" style={{ background:"rgba(255,255,255,.05)", color:"#64748b", border:"1px solid rgba(255,255,255,.08)" }}>{s.difficulty}</span>
                      </div>
                      <span style={{ fontSize:12, color:"#4a5568" }}>{formatDate(s.created_at)}</span>
                    </div>
                    <div style={{ fontSize:13, color:"#94a3b8", marginBottom:4 }}>
                      Patient: <span style={{ color:"#e2e8f0" }}>{s.patient_name}</span> · {s.exchange_count} exchanges · {formatTime(s.duration_seconds)}
                    </div>
                    {s.feedback && (
                      <div style={{ fontSize:12, color:"#4a5568", marginTop:6, overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                        {s.feedback.replace(/\*\*/g,"").replace(/##/g,"").substring(0,180)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Groups sidebar */}
            <div>
              <h2 style={{ fontSize:16, fontWeight:600, marginBottom:16 }}>My Groups</h2>
              <div className="card" style={{ marginBottom:14 }}>
                <p style={{ fontSize:13, color:"#64748b", marginBottom:12 }}>Join a class with a group code from your professor</p>
                <div style={{ display:"flex", gap:8 }}>
                  <input className="inp" placeholder="Enter code" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} style={{ flex:1, letterSpacing:2, fontWeight:600 }} maxLength={6}/>
                  <button className="btn-p" onClick={joinGroup} disabled={joining||!joinCode.trim()} style={{ padding:"10px 14px", flexShrink:0 }}>
                    {joining?"...":"Join"}
                  </button>
                </div>
                {joinError && <p style={{ fontSize:12, color:"#f87171", marginTop:8 }}>{joinError}</p>}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {groups.length === 0 && <p style={{ fontSize:13, color:"#4a5568" }}>No groups yet</p>}
                {groups.map(g => (
                  <div key={g?.id} className="card" style={{ padding:"14px 16px" }}>
                    <div style={{ fontSize:14, fontWeight:600, color:"#e2e8f0", marginBottom:4 }}>{g?.name}</div>
                    <div style={{ fontSize:12, color:"#4a5568" }}>Code: <span style={{ color:"#4a90a4", fontWeight:600, letterSpacing:1 }}>{g?.code}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
