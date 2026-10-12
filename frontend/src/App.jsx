import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Users,
  Shield,
  CalendarDays,
  Swords,
  ClipboardList,
  ChartNoAxesCombined,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  Plus,
  ArrowUpRight,
  Clock,
  MapPin,
  Trophy,
  CircleCheck,
  CircleAlert,
  Gamepad2,
  LogOut,
  Activity,
} from "lucide-react";

import "./App.css";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, section: "MAIN" },

  { label: "Teams", icon: Shield, section: "MAIN" },

  { label: "Rosters", icon: Users, section: "MAIN" },

  { label: "Scrims", icon: CalendarDays, section: "COMPETITION" },

  { label: "Matches", icon: Swords, section: "COMPETITION" },

  { label: "Requests", icon: ClipboardList, section: "COMPETITION", count: 4 },

  { label: "Reports", icon: ChartNoAxesCombined, section: "MANAGEMENT" },

  { label: "Settings", icon: Settings, section: "MANAGEMENT" },
];

const matches = [
  {
    game: "VALORANT",

    opponent: "Team Nemesis",

    date: "Today",

    time: "7:00 PM",

    type: "Scrim",

    color: "valorant",
  },

  {
    game: "MOBILE LEGENDS",

    opponent: "Nova Esports",

    date: "Tomorrow",

    time: "8:30 PM",

    type: "Match",

    color: "ml",
  },

  {
    game: "VALORANT",

    opponent: "Phantom Core",

    date: "Oct 15",

    time: "6:00 PM",

    type: "Scrim",

    color: "valorant",
  },
];

const activities = [
  {
    icon: CircleCheck,

    color: "green",

    title: "Roster updated",

    detail: "VALORANT · 2 minutes ago",
  },

  {
    icon: ClipboardList,

    color: "red",

    title: "New scrim request",

    detail: "Mobile Legends · 18 minutes ago",
  },

  {
    icon: Trophy,

    color: "yellow",

    title: "Match result recorded",

    detail: "VALORANT · 1 hour ago",
  },
];

const API_BASE_URL = "http://localhost:8000";

function formatRole(role) {
  if (!role) return "Member";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onLogin(username.trim(), password);
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const pageStyle = {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "24px",
    background:
      "radial-gradient(circle at top right, #351014 0, #111114 45%, #09090b 100%)",
    color: "#f5f5f5",
    fontFamily: "inherit",
  };
  const cardStyle = {
    width: "100%",
    maxWidth: "430px",
    boxSizing: "border-box",
    padding: "36px",
    background: "rgba(23, 23, 27, 0.96)",
    border: "1px solid #3a2528",
    borderRadius: "18px",
    boxShadow: "0 24px 80px rgba(0,0,0,.35)",
  };
  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    marginTop: "8px",
    borderRadius: "9px",
    border: "1px solid #3c3c43",
    background: "#111114",
    color: "#fff",
    fontSize: "15px",
    outlineColor: "#ef4444",
  };

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              display: "grid",
              placeItems: "center",
              borderRadius: "12px",
              background: "#b91c1c",
            }}
          >
            <Gamepad2 size={27} />
          </div>
          <div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 800,
                letterSpacing: "2px",
              }}
            >
              KYUSI
            </div>
            <div
              style={{
                color: "#a1a1aa",
                fontSize: "11px",
                letterSpacing: "1.5px",
              }}
            >
              ESPORTS MANAGEMENT
            </div>
          </div>
        </div>
        <p
          style={{
            color: "#ef4444",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "1.5px",
            marginBottom: "8px",
          }}
        >
          WELCOME BACK
        </p>
        <h1 style={{ fontSize: "28px", margin: "0 0 8px" }}>
          Sign in to your account
        </h1>
        <p style={{ color: "#a1a1aa", margin: "0 0 26px", lineHeight: 1.5 }}>
          Manage your teams, matches, and organization in one place.
        </p>
        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "18px",
            }}
          >
            Username or email
            <input
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter your username or email"
              style={inputStyle}
            />
          </label>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "18px",
            }}
          >
            Password
            <input
              autoComplete="current-password"
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              style={inputStyle}
            />
          </label>
          {error && (
            <div
              role="alert"
              style={{
                background: "#3b1116",
                border: "1px solid #7f1d1d",
                color: "#fecaca",
                padding: "11px 12px",
                borderRadius: "8px",
                marginBottom: "18px",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "14px",
              border: 0,
              borderRadius: "9px",
              background: submitting ? "#7f1d1d" : "#dc2626",
              color: "white",
              fontSize: "15px",
              fontWeight: 700,
              cursor: submitting ? "wait" : "pointer",
            }}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p
          style={{
            color: "#71717a",
            fontSize: "12px",
            textAlign: "center",
            margin: "24px 0 0",
          }}
        >
          Authorized KYUSI ESPORTS members only
        </p>
      </section>
    </main>
  );
}

function Sidebar({ activePage, setActivePage, open, close, user }) {
  return (
    <>
      {open && (
        <button
          className="mobile-overlay"
          onClick={close}
          aria-label="Close menu"
        />
      )}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Gamepad2 size={25} strokeWidth={2.5} />
          </div>

          <div className="brand-copy">
            <span className="brand-name">KYUSI</span>

            <span className="brand-subtitle">ESPORTS MANAGEMENT</span>
          </div>

          <button
            className="mobile-close icon-button"
            onClick={close}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="organization-switcher">
          <div className="org-avatar">K</div>

          <div className="org-copy">
            <strong>Kyusi Esports</strong>

            <span>Organization</span>
          </div>

          <ChevronDown size={16} className="muted-icon" />
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {["MAIN", "COMPETITION", "MANAGEMENT"].map((section) => (
            <div className="nav-section" key={section}>
              <p className="nav-heading">{section}</p>

              {navigation

                .filter((item) => item.section === section)

                .map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.label}
                      className={`nav-item ${activePage === item.label ? "active" : ""}`}
                      onClick={() => {
                        setActivePage(item.label);

                        close();
                      }}
                    >
                      <Icon size={19} />

                      <span>{item.label}</span>

                      {item.count && (
                        <span className="nav-count">{item.count}</span>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="season-card">
            <div className="season-icon">
              <Trophy size={18} />
            </div>

            <div>
              <strong>Season 2026</strong>

              <span>Competitive season</span>
            </div>

            <span className="live-dot" />
          </div>

          <button
            className="profile-card"
            onClick={() => setActivePage("Settings")}
          >
            <div className="profile-avatar">G</div>

            <div className="profile-copy">
              <strong>{user?.full_name || user?.username || "Account"}</strong>
              <span>{formatRole(user?.role)}</span>
            </div>

            <LogOut size={17} className="muted-icon" />
          </button>
        </div>
      </aside>
    </>
  );
}

function SectionHeading({ eyebrow, title, description, action, onAction }) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>

        <h1>{title}</h1>

        <p className="page-description">{description}</p>
      </div>

      {action && (
        <button className="primary-button" onClick={onAction}>
          <Plus size={17} />

          {action}
        </button>
      )}
    </div>
  );
}

function Dashboard({ setActivePage }) {
  return (
    <>
      <SectionHeading
        eyebrow="ORGANIZATION OVERVIEW"
        title="Dashboard"
        description="Here's what's happening across your organization."
        action="Schedule event"
        onAction={() => setActivePage("Scrims")}
      />

      <div className="welcome-banner">
        <div className="welcome-content">
          <span className="welcome-tag">
            <span className="red-dot" /> ORGANIZATION STATUS: ACTIVE
          </span>

          <h2>Welcome back, President.</h2>

          <p>Keep your teams organized. Keep your competition sharp.</p>

          <button
            className="banner-button"
            onClick={() => setActivePage("Teams")}
          >
            Manage organization <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="banner-emblem">
          <Gamepad2 size={112} strokeWidth={1.1} />

          <span>KYUSI</span>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={Shield}
          label="Active Teams"
          value="4"
          note="Across 3 game titles"
          color="red"
        />

        <StatCard
          icon={Users}
          label="Total Players"
          value="32"
          note="Across all rosters"
          color="blue"
        />

        <StatCard
          icon={CalendarDays}
          label="Scheduled Events"
          value="08"
          note="Next 7 days"
          color="purple"
        />

        <StatCard
          icon={ClipboardList}
          label="Pending Requests"
          value="04"
          note="Awaiting your review"
          color="yellow"
        />
      </div>

      <div className="content-grid">
        <section className="panel schedule-panel">
          <div className="panel-header">
            <div>
              <h3>Upcoming Schedule</h3>

              <p>Your organization's next events</p>
            </div>

            <button
              className="text-button"
              onClick={() => setActivePage("Scrims")}
            >
              View all <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="schedule-list">
            {matches.map((match) => (
              <div
                className="schedule-item"
                key={`${match.opponent}-${match.time}`}
              >
                <div className={`game-badge ${match.color}`}>
                  {match.color === "valorant" ? "V" : "ML"}
                </div>

                <div className="match-details">
                  <strong>{match.opponent}</strong>

                  <span>{match.game}</span>
                </div>

                <div className="match-time">
                  <span>
                    <CalendarDays size={13} /> {match.date}
                  </span>

                  <span>
                    <Clock size={13} /> {match.time}
                  </span>
                </div>

                <span className={`event-type ${match.type.toLowerCase()}`}>
                  {match.type}
                </span>
              </div>
            ))}
          </div>

          <button
            className="panel-footer-button"
            onClick={() => setActivePage("Matches")}
          >
            Open match calendar <ArrowUpRight size={15} />
          </button>
        </section>

        <section className="panel activity-panel">
          <div className="panel-header">
            <div>
              <h3>Recent Activity</h3>

              <p>Latest organization updates</p>
            </div>

            <Activity size={19} className="muted-icon" />
          </div>

          <div className="activity-list">
            {activities.map((activity) => {
              const Icon = activity.icon;

              return (
                <div className="activity-item" key={activity.title}>
                  <div className={`activity-icon ${activity.color}`}>
                    <Icon size={17} />
                  </div>

                  <div>
                    <strong>{activity.title}</strong>

                    <span>{activity.detail}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="notice-card">
            <CircleAlert size={18} />

            <div>
              <strong>4 requests need attention</strong>

              <p>Review scrim and roster requests.</p>

              <button onClick={() => setActivePage("Requests")}>
                Review requests <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </section>
      </div>

      <section className="panel teams-panel">
        <div className="panel-header">
          <div>
            <h3>Your Teams</h3>

            <p>A quick look at your competitive divisions</p>
          </div>

          <button
            className="text-button"
            onClick={() => setActivePage("Teams")}
          >
            Manage teams <ArrowUpRight size={15} />
          </button>
        </div>

        <div className="teams-grid">
          <TeamCard
            name="VALORANT"
            subtitle="FPS Division"
            tag="COMPETITIVE"
            code="V"
            color="valorant"
            players="6 players"
          />

          <TeamCard
            name="MOBILE LEGENDS"
            subtitle="MOBA Division"
            tag="COMPETITIVE"
            code="ML"
            color="ml"
            players="8 players"
          />

          <TeamCard
            name="LEAGUE OF LEGENDS"
            subtitle="MOBA Division"
            tag="DEVELOPMENT"
            code="LOL"
            color="lol"
            players="6 players"
          />

          <TeamCard
            name="CALL OF DUTY"
            subtitle="FPS Division"
            tag="COMPETITIVE"
            code="COD"
            color="cod"
            players="5 players"
          />
        </div>
        
      </section>

      <footer className="dashboard-footer">
        <span>KYUSI ESPORTS MANAGEMENT</span>

        <span>Built for competition. Designed for teams.</span>
      </footer>
    </>
  );
}

function StatCard({ icon: Icon, label, value, note, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <Icon size={20} />
      </div>

      <span className="stat-label">{label}</span>

      <div className="stat-value">{value}</div>

      <span className="stat-note">{note}</span>
    </div>
  );
}

function TeamCard({ name, subtitle, tag, code, color, players }) {
  return (
    <div className="team-card">
      <div className={`team-emblem ${color}`}>{code}</div>

      <div className="team-card-info">
        <span className={`team-tag ${color}`}>{tag}</span>

        <strong>{name}</strong>

        <span>{subtitle}</span>
      </div>

      <div className="team-card-bottom">
        <span>
          <Users size={14} /> {players}
        </span>

        <span className="team-status">
          <span className="live-dot" /> Active
        </span>
      </div>
    </div>
  );
}


function Teams({ setActivePage }) {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    game_title: "",
    description: "",
  });

  const API_BASE_URL = "http://localhost:8000";

  async function loadTeams() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/teams`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load teams.");
      }

      setTeams(data.teams || []);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeams();
  }, []);

  const filteredTeams = teams.filter((team) => {
    const searchText = search.toLowerCase();

    return (
      (team.name || "").toLowerCase().includes(searchText) ||
      (team.game_title || "").toLowerCase().includes(searchText)
    );
  });

  async function handleCreateTeam(event) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/teams`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to create team.");
      }

      setNotice("Team created successfully!");
      setForm({
        name: "",
        game_title: "",
        description: "",
      });
      setShowForm(false);

      await loadTeams();
    } catch (err) {
      setError(err.message || "Unable to create team.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="teams-workspace">
      <SectionHeading
        eyebrow="ORGANIZATION MANAGEMENT"
        title="Teams"
        description="Manage your organization's competitive divisions."
        action="Add team"
        onAction={() => {
          setShowForm((current) => !current);
          setNotice("");
          setError("");
        }}
      />

      {notice && (
        <div className="inline-notice">
          {notice}
          <button onClick={() => setNotice("")}>Dismiss</button>
        </div>
      )}

      {error && (
        <div className="inline-notice">
          {error}
          <button onClick={() => setError("")}>Dismiss</button>
        </div>
      )}

      {showForm && (
        <section className="panel" style={{ padding: 24 }}>
          <div className="teams-toolbar">
            <div>
              <h2>Create a team</h2>
              <p>Add a new competitive division to your organization.</p>
            </div>
          </div>

          <form onSubmit={handleCreateTeam}>
            <div className="teams-form-grid">
              <div className="teams-form-field">
                <label htmlFor="team-name">Team name</label>
                <input
                  id="team-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Kyusi Valorant"
                  maxLength={100}
                  required
                />
              </div>

              <div className="teams-form-field">
                <label htmlFor="team-game">Game title</label>
                <input
                  id="team-game"
                  value={form.game_title}
                  onChange={(event) =>
                    setForm({ ...form, game_title: event.target.value })
                  }
                  placeholder="e.g. Valorant"
                  maxLength={100}
                  required
                />
              </div>

              <div className="teams-form-field full-width">
                <label htmlFor="team-description">Description</label>
                <textarea
                  id="team-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Describe this team's goals or competitive division..."
                  rows={4}
                  maxLength={5000}
                />
              </div>
            </div>

            <div className="teams-form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving ? "Creating..." : "Create team"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel" style={{ padding: 20 }}>
        <div className="teams-toolbar">
          <div>
            <h2>Your teams</h2>
            <p>{teams.length} team(s) in your organization</p>
          </div>

          <div className="teams-search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search teams by name or game..."
              aria-label="Search teams"
            />
          </div>
        </div>

        {loading ? (
          <div className="teams-empty-state">
            <p>Loading teams...</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="teams-empty-state">
            <Users size={32} />
            <h3>{search ? "No matching teams" : "No teams yet"}</h3>
            <p>
              {search
                ? "Try a different team name or game title."
                : "Create your first team to get started."}
            </p>

            {!search && (
              <button
                className="primary-button"
                onClick={() => setShowForm(true)}
              >
                Add your first team
              </button>
            )}
          </div>
        ) : (
          <div className="teams-card-grid">
            {filteredTeams.map((team) => (
              <article className="teams-data-card" key={team.id}>
                <div className="teams-data-card-header">
                  <div className="teams-game-avatar">
                    {(team.game_title || "G").charAt(0).toUpperCase()}
                  </div>

                  <span
                    className={`teams-status-badge ${
                      team.status !== "active" ? team.status : ""
                    }`}
                  >
                    {team.status || "Unknown"}
                  </span>
                </div>

                <span className="teams-game-name">
                  {team.game_title || "Game not specified"}
                </span>

                <h3>{team.name}</h3>

                <p className="teams-data-card-description">
                  {team.description || "No description added yet."}
                </p>

                <div className="teams-card-divider" />

                <div className="teams-data-card-footer">
                  <div className="teams-member-count">
                    <Users size={17} />
                    <span>
                      <strong>{team.member_count ?? 0}</strong> Members
                    </span>
                  </div>

                  <span>Team #{team.id}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}



function PlaceholderPage({ page, setActivePage }) {
  const descriptions = {
    Teams: "Manage your organization's competitive divisions.",

    Rosters: "Review players and manage team membership.",

    Scrims: "Coordinate practice sessions with other teams.",

    Matches: "Track upcoming fixtures and match results.",

    Requests: "Review and process organization requests.",

    Reports: "Monitor team activity and competitive performance.",

    Settings: "Manage your organization preferences.",
  };

  const [search, setSearch] = useState("");

  const [notice, setNotice] = useState("");

  return (
    <>
      <SectionHeading
        eyebrow="ORGANIZATION MANAGEMENT"
        title={page}
        description={descriptions[page] || "Manage your organization."}
        action={
          page === "Teams" || page === "Scrims" || page === "Matches"
            ? `Add ${page === "Teams" ? "team" : "event"}`
            : undefined
        }
        onAction={() =>
          setNotice(
            `The ${page.toLowerCase()} creation form will be added in the next step.`,
          )
        }
      />

      {notice && (
        <div className="inline-notice">
          {notice}
          <button onClick={() => setNotice("")}>Dismiss</button>
        </div>
      )}

      <section className="panel placeholder-panel">
        <div className="placeholder-icon">
          <LayoutDashboard size={30} />
        </div>

        <h2>{page} workspace</h2>

        <p>
          This section is ready for us to build next. The current dashboard uses
          sample data and isn't connected to a database yet.
        </p>

        <div className="placeholder-search">
          <Search size={17} />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Try a search in ${page.toLowerCase()}...`}
            aria-label={`Search ${page}`}
          />
        </div>

        {search && (
          <span className="search-hint">
            Search input works. We'll connect it to real {page.toLowerCase()}{" "}
            data later.
          </span>
        )}

        <button
          className="primary-button"
          onClick={() => setActivePage("Dashboard")}
        >
          <LayoutDashboard size={17} /> Back to dashboard
        </button>
      </section>
    </>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/me`, { method: "GET", credentials: "include" })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok && data.success && !cancelled) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCheckingSession(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogin(username, password) {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok || !data.success)
      throw new Error(data.message || "Login failed.");
    setUser(data.user);
    setActivePage("Dashboard");
  }

  async function handleLogout() {
    try {
      await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      setActivePage("Dashboard");
    }
  }

  if (checkingSession)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#09090b",
          color: "#f5f5f5",
        }}
      >
        Checking your session…
      </div>
    );
  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        open={menuOpen}
        close={() => setMenuOpen(false)}
        user={user}
      />

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu icon-button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div className="breadcrumb">
              <span>Kyusi Esports</span>

              <span className="breadcrumb-separator">/</span>

              <strong>{activePage}</strong>
            </div>
          </div>

          <div className="topbar-right">
            <div className="system-status">
              <span className="live-dot" /> System operational
            </div>

            <div className="notification-wrap">
              <button
                className="icon-button notification-button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Toggle notifications"
                aria-expanded={notificationsOpen}
              >
                <Bell size={19} />

                <span className="notification-dot" />
              </button>

              {notificationsOpen && (
                <div className="notification-popover">
                  <strong>Notifications</strong>

                  <p>
                    <span className="red-dot" /> 4 requests are waiting for
                    review.
                  </p>

                  <p>
                    <span className="red-dot" /> Your next scrim is scheduled
                    for today.
                  </p>

                  <button
                    onClick={() => {
                      setActivePage("Requests");
                      setNotificationsOpen(false);
                    }}
                  >
                    View requests <ArrowUpRight size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="topbar-profile">
              <div className="profile-avatar">
                {(user.full_name || user.username || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="topbar-profile-copy">
                <strong>{user.full_name || user.username}</strong>
                <span>{formatRole(user.role)}</span>
              </div>
              <button
                className="icon-button"
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </header>

        <div className="page-content">
          {activePage === "Dashboard" ? (
            <Dashboard setActivePage={setActivePage} />
          ) : activePage === "Teams" ? (
            <Teams setActivePage={setActivePage} />
          ) : (
            <PlaceholderPage page={activePage} setActivePage={setActivePage} />
          )}
        </div>
      </main>
    </div>
  );
}
