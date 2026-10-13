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
  ArrowLeft,
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

const API_BASE_URL = "http://localhost:8000";

function formatRole(role) {
  if (!role) return "Member";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

// ---------------------------------------------------------------
// Dashboard helpers
// ---------------------------------------------------------------

// "2 minutes ago", "3 hours ago", ...
function formatTimeAgo(seconds) {
  const s = Math.max(0, Number(seconds) || 0);

  if (s < 60) return "just now";

  const minutes = Math.floor(s / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

// startsAt looks like "2026-10-15 18:00:00". It is read as plain text,
// so the browser's time zone can never shift it.
function formatEventDate(startsAt, daysAway) {
  if (daysAway === 0) return "Today";
  if (daysAway === 1) return "Tomorrow";

  const [year, month, day] = String(startsAt)
    .slice(0, 10)
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatEventTime(startsAt) {
  const time = String(startsAt).split(/[ T]/)[1] || "00:00";
  const [hours, minutes] = time.split(":").map(Number);
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;

  return `${hour12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

function capitalize(text) {
  const value = String(text || "");
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// "Mobile Legends" -> "ML", "Valorant" -> "V"
function gameInitials(name) {
  const words = String(name || "")
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "G";

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

// Colors for the dashboard badges. Valorant and Mobile Legends keep their
// colors; every other game gets one from the list, based on its id.
const GAME_COLORS = ["lol", "cod", "violet", "teal"];

function gameColor(gameId, gameName) {
  const name = String(gameName || "").toLowerCase();

  if (name.includes("valorant")) return "valorant";
  if (name.includes("mobile legends") || name.includes("mlbb")) return "ml";

  return GAME_COLORS[Number(gameId) % GAME_COLORS.length];
}

const ACTIVITY_STYLES = {
  team: { icon: Shield, color: "green" },
  roster: { icon: CircleCheck, color: "green" },
  event: { icon: CalendarDays, color: "yellow" },
  request: { icon: ClipboardList, color: "red" },
  review_approved: { icon: CircleCheck, color: "green" },
  review_rejected: { icon: CircleAlert, color: "red" },
};

// Game logo from the database, or fallback text if there is none.
function GameMark({ logo, text, alt }) {
  const [failed, setFailed] = useState(false);

  if (logo && !failed) {
    return (
      <img
        src={logo}
        alt={alt}
        className="game-mark-img"
        onError={() => setFailed(true)}
      />
    );
  }

  return <>{text}</>;
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

function Dashboard({ setActivePage, user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    apiRequest("/api/dashboard")
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function retry() {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  }

  const stats = data?.stats;
  const schedule = data?.schedule || [];
  const activity = data?.activity || [];
  const teams = data?.teams || [];
  const ownTeamsOnly = data?.scope === "team";
  const pending = stats?.pending_requests ?? 0;
  const canReview = stats?.can_review_requests ?? false;

  // "–" is shown until the numbers arrive.
  const show = (value) => (value === undefined || value === null ? "–" : value);

  const firstName = (user?.full_name || user?.username || "")
    .trim()
    .split(/\s+/)[0];

  return (
    <>
      <SectionHeading
        eyebrow="ORGANIZATION OVERVIEW"
        title="Dashboard"
        description={
          ownTeamsOnly
            ? "Here's what's happening on your teams."
            : "Here's what's happening across your organization."
        }
        action="Schedule event"
        onAction={() => setActivePage("Scrims")}
      />

      {error && (
        <div className="inline-notice">
          {error}
          <button type="button" onClick={retry}>
            Retry
          </button>
        </div>
      )}

      <div className="welcome-banner">
        <div className="welcome-content">
          <span className="welcome-tag">
            <span className="red-dot" /> ORGANIZATION STATUS: ACTIVE
          </span>

          <h2>Welcome back{firstName ? `, ${firstName}` : ""}.</h2>

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
          value={show(stats?.active_teams)}
          note={
            stats
              ? `Across ${stats.game_titles} game title${stats.game_titles === 1 ? "" : "s"}`
              : "Loading..."
          }
          color="red"
        />

        <StatCard
          icon={Users}
          label="Total Players"
          value={show(stats?.total_players)}
          note={ownTeamsOnly ? "On your teams" : "Across active rosters"}
          color="blue"
        />

        <StatCard
          icon={CalendarDays}
          label="Scheduled Events"
          value={show(stats?.scheduled_events)}
          note="Next 7 days"
          color="purple"
        />

        <StatCard
          icon={ClipboardList}
          label="Pending Requests"
          value={show(stats?.pending_requests)}
          note={canReview ? "Awaiting your review" : "Submitted by you"}
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
            {loading && <p className="dashboard-empty">Loading schedule...</p>}

            {!loading && schedule.length === 0 && (
              <p className="dashboard-empty">No upcoming events scheduled.</p>
            )}

            {schedule.map((event) => (
              <div className="schedule-item" key={event.id}>
                <div
                  className={`game-badge ${gameColor(event.game_id, event.game_name)}`}
                >
                  <GameMark
                    logo={event.logo_path}
                    text={gameInitials(event.game_name)}
                    alt={`${event.game_name} logo`}
                  />
                </div>

                <div className="match-details">
                  <strong>{event.opponent || event.title}</strong>

                  <span>{String(event.game_name).toUpperCase()}</span>
                </div>

                <div className="match-time">
                  <span>
                    <CalendarDays size={13} />{" "}
                    {formatEventDate(event.starts_at, event.days_away)}
                  </span>

                  <span>
                    <Clock size={13} /> {formatEventTime(event.starts_at)}
                  </span>
                </div>

                <span className={`event-type ${event.event_type}`}>
                  {capitalize(event.event_type)}
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
            {loading && <p className="dashboard-empty">Loading activity...</p>}

            {!loading && activity.length === 0 && (
              <p className="dashboard-empty">No activity yet.</p>
            )}

            {activity.map((item, index) => {
              const style = ACTIVITY_STYLES[item.kind] || ACTIVITY_STYLES.team;
              const Icon = style.icon;

              return (
                <div className="activity-item" key={`${item.kind}-${index}`}>
                  <div className={`activity-icon ${style.color}`}>
                    <Icon size={17} />
                  </div>

                  <div>
                    <strong>{item.title}</strong>

                    <span>
                      {item.detail} · {formatTimeAgo(item.seconds_ago)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="notice-card">
            <CircleAlert size={18} />

            <div>
              <strong>
                {pending === 0
                  ? "No pending requests"
                  : canReview
                    ? `${pending} request${pending === 1 ? "" : "s"} need${pending === 1 ? "s" : ""} attention`
                    : `${pending} of your request${pending === 1 ? " is" : "s are"} pending`}
              </strong>

              <p>
                {pending === 0
                  ? "You're all caught up."
                  : canReview
                    ? "Review scrim and roster requests."
                    : "A manager will review them soon."}
              </p>

              {pending > 0 && (
                <button onClick={() => setActivePage("Requests")}>
                  {canReview ? "Review requests" : "View requests"}{" "}
                  <ArrowUpRight size={14} />
                </button>
              )}
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

        {loading && <p className="dashboard-empty">Loading teams...</p>}

        {!loading && teams.length === 0 && (
          <p className="dashboard-empty">
            No teams yet. Add a game, then create your first team from the Teams
            page.
          </p>
        )}

        {teams.length > 0 && (
          <div className="teams-grid">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                name={team.name}
                subtitle={
                  team.description
                    ? team.description.length > 60
                      ? `${team.description.slice(0, 57)}...`
                      : team.description
                    : `${team.game_name} division`
                }
                tag={String(team.game_name).toUpperCase()}
                code={gameInitials(team.game_name)}
                color={gameColor(team.game_id, team.game_name)}
                players={`${team.member_count} player${team.member_count === 1 ? "" : "s"}`}
                status={team.status}
                logo={team.logo_path}
              />
            ))}
          </div>
        )}
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

function TeamCard({
  name,
  subtitle,
  tag,
  code,
  color,
  players,
  status = "active",
  logo,
}) {
  return (
    <div className="team-card">
      <div className={`team-emblem ${color}`}>
        <GameMark logo={logo} text={code} alt={`${tag} logo`} />
      </div>

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
          {status === "active" && <span className="live-dot" />}{" "}
          {capitalize(status)}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Teams page: Games overview  ->  one game's teams
// ---------------------------------------------------------------

// Small helper so every request handles errors the same way.
async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      ...options,
    });
  } catch {
    throw new Error(
      "Unable to reach the server. Make sure the PHP backend and MySQL are running.",
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || !data || !data.success) {
    throw new Error(data?.message || "Something went wrong. Please try again.");
  }

  return data;
}

function jsonRequest(method, body) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

// Shows the game's logo from the database, or its first letter.
function GameAvatar({ name, logoPath }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="teams-game-avatar">
      {logoPath && !failed ? (
        <img
          src={logoPath}
          alt={`${name} logo`}
          className="teams-game-logo"
          onError={() => setFailed(true)}
        />
      ) : (
        (name || "G").charAt(0).toUpperCase()
      )}
    </span>
  );
}

function TeamsSummaryCard({ icon: Icon, label, value, active }) {
  return (
    <div className="teams-summary-card">
      <div className={`teams-summary-icon${active ? " active" : ""}`}>
        <Icon size={24} />
      </div>

      <div>
        <p>{label}</p>
        <h3>{value}</h3>
      </div>
    </div>
  );
}

function TeamsNotices({ notice, error, onDismissNotice, onDismissError }) {
  return (
    <>
      {notice && (
        <div className="inline-notice success">
          {notice}
          <button type="button" onClick={onDismissNotice}>
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="inline-notice">
          {error}
          <button type="button" onClick={onDismissError}>
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}

// Level 1: all games + the summary cards.
function GamesOverview({ onSelectGame }) {
  const [games, setGames] = useState([]);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [gameName, setGameName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    apiRequest("/api/games")
      .then((data) => {
        if (cancelled) return;
        setGames(data.games || []);
        setSummary(data.summary || null);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function reload() {
    setLoading(true);
    setReloadKey((key) => key + 1);
  }

  async function handleAddGame(event) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    try {
      const data = await apiRequest(
        "/api/games",
        jsonRequest("POST", { name: gameName }),
      );

      setNotice(`${data.game.name} was added.`);
      setGameName("");
      setShowForm(false);
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const searchText = search.trim().toLowerCase();
  const filteredGames = games.filter((game) =>
    (game.name || "").toLowerCase().includes(searchText),
  );
  const loadFailed = !loading && summary === null;

  return (
    <div className="teams-workspace">
      <SectionHeading
        eyebrow="ORGANIZATION MANAGEMENT"
        title="Teams"
        description="Choose a game to manage its teams."
        action="Add Game"
        onAction={() => {
          setShowForm((current) => !current);
          setNotice("");
          setError("");
        }}
      />

      <TeamsNotices
        notice={notice}
        error={error}
        onDismissNotice={() => setNotice("")}
        onDismissError={() => setError("")}
      />

      {summary && (
        <div className="teams-summary teams-summary-4">
          <TeamsSummaryCard
            icon={Gamepad2}
            label="Total Games"
            value={summary.total_games}
          />
          <TeamsSummaryCard
            icon={Shield}
            label="Total Teams"
            value={summary.total_teams}
          />
          <TeamsSummaryCard
            icon={CircleCheck}
            label="Active Teams"
            value={summary.active_teams}
            active
          />
          <TeamsSummaryCard
            icon={Users}
            label="Total Members"
            value={summary.total_members}
          />
        </div>
      )}

      {showForm && (
        <section className="panel team-form-panel">
          <div className="teams-toolbar">
            <div>
              <h2>Add a game</h2>
              <p>Teams are created inside a game, so add the game first.</p>
            </div>
          </div>

          <form onSubmit={handleAddGame}>
            <div className="teams-form-grid">
              <div className="teams-form-field full-width">
                <label htmlFor="game-name">Game name</label>
                <input
                  id="game-name"
                  value={gameName}
                  onChange={(event) => setGameName(event.target.value)}
                  placeholder="e.g. League of Legends"
                  maxLength={100}
                  required
                />
              </div>
            </div>

            <div className="teams-form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving ? "Adding..." : "Add game"}
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

      <section className="panel teams-list-panel">
        <div className="teams-toolbar">
          <div>
            <h2>Games</h2>
            <p>{games.length} game(s). Select one to manage its teams.</p>
          </div>

          <div className="teams-search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search games..."
              aria-label="Search games"
            />
          </div>
        </div>

        {loading ? (
          <div className="teams-loading-state">
            <div className="loading-spinner"></div>
            <p>Loading games...</p>
          </div>
        ) : loadFailed ? (
          <div className="teams-empty-state">
            <h3>Could not load games</h3>
            <p>Check the message above, then try again.</p>
            <button type="button" className="primary-button" onClick={reload}>
              Try again
            </button>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="teams-empty-state">
            <div className="empty-state-icon">
              <Gamepad2 size={48} />
            </div>
            <h3>{search ? "No matching games" : "No games yet"}</h3>
            <p>
              {search
                ? "Try a different game name."
                : "Add your first game to start creating teams."}
            </p>

            {!search && (
              <button
                type="button"
                className="primary-button"
                onClick={() => setShowForm(true)}
              >
                <Plus size={20} /> Add your first game
              </button>
            )}
          </div>
        ) : (
          <div className="teams-card-grid">
            {filteredGames.map((game) => (
              <button
                type="button"
                className="teams-data-card game-card"
                key={game.id}
                onClick={() => onSelectGame(game)}
              >
                <span className="teams-data-card-header">
                  <GameAvatar name={game.name} logoPath={game.logo_path} />
                </span>

                <span className="game-card-name">{game.name}</span>

                <span className="game-card-meta">
                  {game.team_count} team(s), {game.active_team_count} active
                </span>

                <span className="teams-card-divider" />

                <span className="teams-data-card-footer">
                  <span className="teams-member-count">
                    <Users size={17} />
                    <span>
                      <strong>{game.member_count}</strong> Members
                    </span>
                  </span>

                  <span className="game-card-cta">
                    Manage teams <ArrowUpRight size={14} />
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// Level 2: the teams of one selected game.
function GameTeams({ game, onBack }) {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    team_tag: "",
    game_id: "",
    manager_id: "",
    logo: null,
    status: "active",
    description: "",
  });
  const [manager, setManager] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    apiRequest(`/api/teams?game_id=${game.id}`)
      .then((data) => {
        if (cancelled) return;
        setTeams(data.teams || []);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [game.id, reloadKey]);

  async function handleCreateTeam(event) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    try {
      await apiRequest(
        "/api/teams",
        jsonRequest("POST", {
          name: form.name.trim(),
          description: form.description.trim(),
          game_id: game.id,
          status: form.status,
        }),
      );

      setNotice("Team created successfully!");
      setForm({
        name: "",
        team_tag: "",
        game_id: String(game.id),
        manager_id: "",
        logo: null,
        status: "active",
        description: "",
      });
      setShowForm(false);
      setLoading(true);
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const searchText = search.trim().toLowerCase();
  const filteredTeams = teams.filter((team) =>
    (team.name || "").toLowerCase().includes(searchText),
  );

  return (
    <div className="teams-workspace">
      <button
        type="button"
        className="secondary-button game-back-button"
        onClick={onBack}
      >
        <ArrowLeft size={16} /> All games
      </button>

      <SectionHeading
        eyebrow={`TEAMS / ${game.name.toUpperCase()}`}
        title={game.name}
        description={`Manage the ${game.name} teams in your organization.`}
        action="Add team"
        onAction={() => {
          setShowForm((current) => !current);
          setNotice("");
          setError("");
        }}
      />

      <TeamsNotices
        notice={notice}
        error={error}
        onDismissNotice={() => setNotice("")}
        onDismissError={() => setError("")}
      />

      {showForm && (
        <section className="panel team-form-panel">
          <div className="teams-toolbar">
            <div>
              <h2>Create a {game.name} team</h2>
              <p>Add a new competitive division for this game.</p>
            </div>
          </div>
          <form onSubmit={handleCreateTeam}>
            <div className="teams-form-grid">
              <div className="teams-form-field full-width">
                <label htmlFor="team-name">Team name</label>
                <input
                  id="team-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. KE Tiddles"
                  maxLength={100}
                  required
                />
              </div>

              <div className="teams-form-field full-width">
                <label htmlFor="team-tag">Team tag</label>
                <input
                  id="team-tag"
                  value={form.team_tag}
                  onChange={(event) =>
                    setForm({ ...form, team_tag: event.target.value })
                  }
                  placeholder="e.g. KYSI"
                  maxLength={20}
                />
              </div>

              <div className="teams-form-field full-width">
                <label htmlFor="team-game">Game</label>
                <input id="team-game" type="text" value={game.name} readOnly />
                <p className="field-hint">
                  This team will be created under the selected game.
                </p>
              </div>

              <div className="teams-form-field full-width">
                <label htmlFor="team-logo">Team logo</label>
                <input
                  id="team-logo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (!file) return;

                    if (!file.type.startsWith("image/")) {
                      alert("Please select a valid image.");
                      event.target.value = "";
                      return;
                    }

                    if (file.size > 5 * 1024 * 1024) {
                      alert("The logo must be 5 MB or smaller.");
                      event.target.value = "";
                      return;
                    }

                    setForm({ ...form, logo: file });
                    setLogoPreview(URL.createObjectURL(file));
                  }}
                />

                {logoPreview && (
                  <div className="teams-logo-preview">
                    <img
                      src={logoPreview}
                      alt="Team logo preview"
                      className="teams-logo-image"
                    />
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setForm({ ...form, logo: null });
                        setLogoPreview("");
                        const input = document.getElementById("team-logo");
                        if (input) input.value = "";
                      }}
                    >
                      Remove logo
                    </button>
                  </div>
                )}
              </div>

              <div className="teams-form-field full-width">
                <label htmlFor="team-status">Team status</label>
                <select
                  id="team-status"
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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

      <section className="panel teams-list-panel">
        <div className="teams-toolbar">
          <div>
            <h2>{game.name} teams</h2>
            <p>{teams.length} team(s) in this game</p>
          </div>

          <div className="teams-search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search teams by name..."
              aria-label="Search teams"
            />
          </div>
        </div>

        {loading ? (
          <div className="teams-loading-state">
            <div className="loading-spinner"></div>
            <p>Loading teams...</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="teams-empty-state">
            <div className="empty-state-icon">
              <Users size={48} />
            </div>
            <h3>{search ? "No matching teams" : "No teams yet"}</h3>
            <p>
              {search
                ? "Try a different team name."
                : `Create the first ${game.name} team to get started.`}
            </p>

            {!search && (
              <button
                type="button"
                className="primary-button"
                onClick={() => setShowForm(true)}
              >
                <Plus size={20} /> Add your first team
              </button>
            )}
          </div>
        ) : (
          <div className="teams-card-grid">
            {filteredTeams.map((team) => (
              <article className="teams-data-card" key={team.id}>
                <div className="teams-data-card-header">
                  <GameAvatar name={game.name} logoPath={game.logo_path} />

                  <span className={`teams-status-badge ${team.status || ""}`}>
                    {team.status || "Unknown"}
                  </span>
                </div>

                <span className="teams-game-name">{game.name}</span>

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

// Teams page: shows the games list, or one game's teams.
function Teams() {
  const [selectedGame, setSelectedGame] = useState(null);

  if (selectedGame) {
    return (
      <GameTeams
        key={selectedGame.id}
        game={selectedGame}
        onBack={() => setSelectedGame(null)}
      />
    );
  }

  return <GamesOverview onSelectGame={setSelectedGame} />;
}

function PlaceholderPage({ page, setActivePage }) {
  const descriptions = {
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
            <Dashboard setActivePage={setActivePage} user={user} />
          ) : activePage === "Teams" ? (
            <Teams />
          ) : (
            <PlaceholderPage page={activePage} setActivePage={setActivePage} />
          )}
        </div>
      </main>
    </div>
  );
}
