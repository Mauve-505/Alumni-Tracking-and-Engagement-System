import { useState, useMemo } from "react";
import "./home.css";

const Ic = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d.map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const I = {
  home: ["M3 11l9-8 9 8", "M5 10v10h14V10"],
  users: ["M9 11a3 3 0 100-6 3 3 0 000 6z", "M3 20c0-3 3-5 6-5s6 2 6 5", "M16 5a3 3 0 010 6", "M18 15c2 .5 3 2 3 5"],
  cal: ["M4 6h16v14H4z", "M4 10h16", "M8 3v4", "M16 3v4"],
  user: ["M12 12a4 4 0 100-8 4 4 0 000 8z", "M4 21c0-4 4-6 8-6s8 2 8 6"],
  shield: ["M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"],
  out: ["M9 4H5v16h4", "M16 8l4 4-4 4", "M20 12H9"],
  search: ["M11 18a7 7 0 100-14 7 7 0 000 14z", "M21 21l-5-5"],
  star: ["M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"],
  mark: ["M6 3h12v18l-6-4-6 4z"],
  check: ["M5 12l5 5 9-10"],
  cap: ["M2 9l10-5 10 5-10 5z", "M6 11v5c3 2 9 2 12 0v-5"],
};

const alumni = [
  { n: "Ana Reyes", l: "[Job title] at [Company]", c: "b", v: true },
  { n: "Jonas Cruz", l: "[Job title] at [Company]", c: "b", v: false },
  { n: "Liza Santos", l: "Self-employed · [Business]", c: "r", v: true },
  { n: "Miguel Tan", l: "[Job title] at [Company]", c: "g", v: true },
  { n: "Paula Dizon", l: "Graduate student · [School]", c: "g", v: true },
  { n: "Rafael Villanueva", l: "[Job title] at [Company]", c: "r", v: true },
];
const initials = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("");

const feed = [
  { id: 1, type: "News", when: "Today", title: "Homecoming registration is now open", body: "Registration for this year's Homecoming is open to all batches. Confirm your attendance and update your contact details so we can send your invitation.", likes: 32 },
  { id: 2, type: "Event", when: "Yesterday", title: "You are invited: Batch Reunion Mixer", body: "An evening to reconnect with classmates and faculty. Light dinner provided.", likes: 18, ev: { m: "NOV", d: "14", name: "Batch Reunion Mixer", meta: "Sat · 6:00 PM · [Venue]", going: 42 }, rsvp: "Going" },
  { id: 3, type: "Update", when: "3 days ago", title: "Keep your alumni record up to date", body: "Verified records help us share job leads, mentoring requests and event invitations that match your career. It takes two minutes.", likes: 27 },
  { id: 4, type: "Event", when: "5 days ago", title: "Career Mentoring Night", body: "Meet graduating students and share what you learned on the job. Alumni from every field are welcome.", likes: 21, ev: { m: "DEC", d: "05", name: "Career Mentoring Night", meta: "Fri · 5:30 PM · [Venue]", going: 19 }, rsvp: null },
];

/* ---------- shared ---------- */
function Sidebar({ page, setPage }) {
  const items = [["home", "Home", I.home], ["directory", "Directory", I.users], ["events", "Events", I.cal], ["profile", "My profile", I.user]];
  return (
    <aside className="side">
      <div className="brand"><span className="logo"><Ic d={I.cap} size={20} /></span>Home</div>
      <div className="card me">
        <div className="av r">YN</div>
        <div><b>Your Name</b><small>Batch [Year] · [Program]</small><br />
          <span className="pill ok"><Ic d={I.check} size={12} />Verified</span></div>
      </div>
      <nav className="nav">
        {items.map(([k, label, d]) => (
          <button key={k} className={page === k ? "on" : ""} onClick={() => setPage(k)}><Ic d={d} />{label}</button>
        ))}
        <hr />
        <button onClick={() => setPage("admin")}><Ic d={I.shield} />Admin view</button>
      </nav>
      <nav className="nav logout"><button><Ic d={I.out} />Log out</button></nav>
    </aside>
  );
}

/* ---------- Home ---------- */
function Home({ setPage }) {
  const [tab, setTab] = useState("All");
  const [liked, setLiked] = useState({});
  const [saved, setSaved] = useState({});
  const [rsvp, setRsvp] = useState({ 2: "Going", 4: null });
  const posts = feed.filter((p) => tab === "All" || (tab === "News" ? p.type === "News" : tab === "Updates" ? p.type === "Update" : p.type === "Event"));

  return (
    <>
      <main className="main">
        <h1>Home</h1>
        <p className="sub">News, updates and gatherings from your alma mater.</p>
        <div className="tabs" role="tablist">
          {["All", "News", "Updates", "Events"].map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        {posts.map((p) => (
          <article key={p.id} className="card post">
            <div className="ph">
              <div className="av r">AO</div>
              <div className="t"><b>Alumni Office</b><small>{p.when}</small></div>
              <span className="tag">{p.type}</span>
            </div>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
            {p.ev && (
              <div className="ev">
                <div className="evt">
                  <div className="date"><small>{p.ev.m}</small><b>{p.ev.d}</b></div>
                  <div><b>{p.ev.name}</b><span>{p.ev.meta}</span><span><b style={{ display: "inline" }}>{p.ev.going} alumni going</b></span></div>
                </div>
                <div className="rsvp">
                  {["Going", "Maybe", "Can't go"].map((o) => (
                    <button key={o} className={rsvp[p.id] === o ? "on" : ""} onClick={() => setRsvp({ ...rsvp, [p.id]: o })}>{o}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="foot">
              <button className={liked[p.id] ? "on" : ""} onClick={() => setLiked({ ...liked, [p.id]: !liked[p.id] })}>
                <Ic d={I.star} />{p.likes + (liked[p.id] ? 1 : 0)}
              </button>
              <button className={saved[p.id] ? "on" : ""} onClick={() => setSaved({ ...saved, [p.id]: !saved[p.id] })}>
                <Ic d={I.mark} />{saved[p.id] ? "Saved" : "Save"}
              </button>
            </div>
          </article>
        ))}
      </main>

      <aside className="right">
        <label className="search"><Ic d={I.search} /><input placeholder="Search alumni by name or company" onKeyDown={(e) => e.key === "Enter" && setPage("directory")} /></label>
        <section className="card panel">
          <div className="ph2"><h4>Complete your profile</h4><b style={{ color: "var(--red)", fontSize: 14 }}>70%</b></div>
          <div className="bar"><i style={{ width: "70%" }} /></div>
          <p style={{ margin: "0 0 16px", color: "var(--mut)", lineHeight: 1.5, fontSize: 15 }}>Add your current employer so classmates and the Alumni Office can reach you.</p>
          <button className="btn">Update employment</button>
        </section>
        <section className="card panel">
          <div className="ph2"><h4>Your upcoming events</h4><button className="link" onClick={() => setPage("events")}>See all</button></div>
          {[["NOV", "14", "Batch Reunion Mixer", "You're going"], ["DEC", "05", "Career Mentoring Night", "RSVP pending"]].map(([m, d, n, s]) => (
            <div className="mini" key={n}>
              <div className="date l"><small>{m}</small><b>{d}</b></div>
              <div><b style={{ color: "var(--red)" }}>{n}</b><span>{s}</span></div>
            </div>
          ))}
        </section>
        <section className="card panel">
          <div className="ph2"><h4>From your batch</h4><button className="link" onClick={() => setPage("directory")}>See all</button></div>
          {alumni.filter((a) => ["Ana Reyes", "Miguel Tan"].includes(a.n)).map((a) => (
            <div className="mini" key={a.n}>
              <div className={`av ${a.c}`}>{initials(a.n)}</div>
              <div><b>{a.n}</b><span>[Job title] · [Company]</span></div>
            </div>
          ))}
        </section>
      </aside>
    </>
  );
}

/* ---------- Directory ---------- */
const emptyFilters = { year: "", program: "", industry: "", location: "", status: "", verified: true };

function Directory() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("asc");
  const [draft, setDraft] = useState(emptyFilters);
  const [f, setF] = useState(emptyFilters);
  const [pageNo, setPageNo] = useState(1);

  const list = useMemo(() => {
    let r = alumni.filter((a) => a.n.toLowerCase().includes(q.toLowerCase()) || a.l.toLowerCase().includes(q.toLowerCase()));
    if (f.verified) r = r.filter((a) => a.v);
    r = [...r].sort((a, b) => a.n.localeCompare(b.n) * (sort === "asc" ? 1 : -1));
    return r;
  }, [q, sort, f]);

  const set = (k) => (e) => setDraft({ ...draft, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const clear = () => { setDraft(emptyFilters); setF(emptyFilters); };

  return (
    <>
      <main className="main">
        <h1>Alumni directory</h1>
        <p className="sub">Find classmates, mentors and colleagues across batches.</p>
        <label className="search" style={{ padding: "0 22px" }}>
          <Ic d={I.search} size={22} />
          <input style={{ padding: "20px 0", fontSize: 17 }} placeholder="Search by name, company or job title" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div className="sortrow">
          <b>Showing {list.length} alumni</b>
          <span style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--mut)", fontWeight: 600 }}>
            Sort by
            <select className="sel" style={{ width: "auto" }} value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="asc">Name (A–Z)</option>
              <option value="desc">Name (Z–A)</option>
            </select>
          </span>
        </div>
        {list.length === 0 && <div className="card row">No alumni match your search. Try clearing a filter.</div>}
        {list.map((a) => (
          <article className="card row" key={a.n}>
            <div className={`av ${a.c}`} style={{ width: 56, height: 56, fontSize: 18 }}>{initials(a.n)}</div>
            <div className="t">
              <b>{a.n}</b>
              <div style={{ color: "var(--ink)" }}>{a.l}</div>
              <div>Batch [Year] · [Program] · [City]</div>
            </div>
            {a.v ? <span className="pill ok" style={{ margin: 0 }}><Ic d={I.check} size={12} />Verified</span> : <span className="pill pend">Pending</span>}
            <button className="vp">View profile</button>
          </article>
        ))}
        <div className="pg">
          <button disabled={pageNo === 1} onClick={() => setPageNo(pageNo - 1)}>Previous</button>
          {[1, 2, 3].map((n) => <button key={n} className={pageNo === n ? "on" : ""} onClick={() => setPageNo(n)}>{n}</button>)}
          <button disabled={pageNo === 3} onClick={() => setPageNo(pageNo + 1)}>Next</button>
        </div>
      </main>

      <aside className="right" style={{ width: 340 }}>
        <section className="card filters">
          <div className="ph2"><h4 style={{ fontSize: 20 }}>Filters</h4><button className="link" onClick={clear}>Clear all</button></div>
          <label htmlFor="fy">Batch year</label>
          <select id="fy" className="sel" value={draft.year} onChange={set("year")}>
            <option value="">Any year</option>{[2024, 2023, 2022, 2021, 2020].map((y) => <option key={y}>{y}</option>)}
          </select>
          <label htmlFor="fp">Program</label>
          <select id="fp" className="sel" value={draft.program} onChange={set("program")}><option value="">All programs</option><option>[Program A]</option><option>[Program B]</option></select>
          <label htmlFor="fi">Industry</label>
          <select id="fi" className="sel" value={draft.industry} onChange={set("industry")}><option value="">All industries</option><option>Technology</option><option>Education</option><option>Healthcare</option></select>
          <label htmlFor="fl">Location</label>
          <input id="fl" className="sel" placeholder="City or country" value={draft.location} onChange={set("location")} />
          <label htmlFor="fe">Employment status</label>
          <select id="fe" className="sel" value={draft.status} onChange={set("status")}><option value="">Any</option><option>Employed</option><option>Self-employed</option><option>Student</option></select>
          <label className="chk"><input type="checkbox" checked={draft.verified} onChange={set("verified")} />Verified records only</label>
          <button className="btn" onClick={() => setF(draft)}>Apply filters</button>
        </section>
      </aside>
    </>
  );
}

export default function AlumniHub() {
  const [page, setPage] = useState("home");
  return (
    <div className="ah">
      <Sidebar page={page} setPage={setPage} />
      {page === "directory" ? <Directory /> : page === "home" ? <Home setPage={setPage} /> : (
        <main className="main"><h1>{page === "events" ? "Events" : page === "profile" ? "My profile" : "Admin view"}</h1><p className="sub">This page isn't built yet.</p></main>
      )}
    </div>
  );
}