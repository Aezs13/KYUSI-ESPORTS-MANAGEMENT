
import { useState } from "react";
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

function Sidebar({ activePage, setActivePage, open, close }) {
  return (
    <>
      {open && <button className="mobile-overlay" onClick={close} aria-label="Close menu" />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Gamepad2 size={25} strokeWidth={2.5} />
          </div>
          <div className="brand-copy">
            <span className="brand-name">KYUSI</span>
            <span className="brand-subtitle">ESPORTS MANAGEMENT</span>
          </div>
          <button className="mobile-close icon-button" onClick={close} aria-label="Close menu">
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
                      {item.count && <span className="nav-count">{item.count}</span>}
                    </button>
                  );
                })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="season-card">
            <div className="season-icon"><Trophy size={18} /></div>
            <div>
              <strong>Season 2026</strong>
              <span>Competitive season</span>
            </div>
            <span className="live-dot" />
          </div>

          <button className="profile-card" onClick={() => setActivePage("Settings")}>
            <div className="profile-avatar">G</div>
            <div className="profile-copy">
              <strong>Organization Admin</strong>
              <span>President</span>
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
          <span className="welcome-tag"><span className="red-dot" /> ORGANIZATION STATUS: ACTIVE</span>
          <h2>Welcome back, President.</h2>
          <p>Keep your teams organized. Keep your competition sharp.</p>
          <button className="banner-button" onClick={() => setActivePage("Teams")}>
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
            <button className="text-button" onClick={() => setActivePage("Scrims")}>
              View all <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="schedule-list">
            {matches.map((match) => (
              <div className="schedule-item" key={`${match.opponent}-${match.time}`}>
                <div className={`game-badge ${match.color}`}>
                  {match.color === "valorant" ? "V" : "ML"}
                </div>
                <div className="match-details">
                  <strong>{match.opponent}</strong>
                  <span>{match.game}</span>
                </div>
                <div className="match-time">
                  <span><CalendarDays size={13} /> {match.date}</span>
                  <span><Clock size={13} /> {match.time}</span>
                </div>
                <span className={`event-type ${match.type.toLowerCase()}`}>{match.type}</span>
              </div>
            ))}
          </div>

          <button className="panel-footer-button" onClick={() => setActivePage("Matches")}>
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
              <button onClick={() => setActivePage("Requests")}>Review requests <ArrowUpRight size={14} /></button>
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
          <button className="text-button" onClick={() => setActivePage("Teams")}>
            Manage teams <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="teams-grid">
          <TeamCard name="VALORANT" subtitle="FPS Division" tag="COMPETITIVE" code="V" color="valorant" players="6 players" />
          <TeamCard name="MOBILE LEGENDS" subtitle="MOBA Division" tag="COMPETITIVE" code="ML" color="ml" players="8 players" />
          <TeamCard name="LEAGUE OF LEGENDS" subtitle="MOBA Division" tag="DEVELOPMENT" code="LOL" color="lol" players="6 players" />
          <TeamCard name="CALL OF DUTY" subtitle="FPS Division" tag="COMPETITIVE" code="COD" color="cod" players="5 players" />
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
      <div className={`stat-icon ${color}`}><Icon size={20} /></div>
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
        <span><Users size={14} /> {players}</span>
        <span className="team-status"><span className="live-dot" /> Active</span>
      </div>
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
        action={page === "Teams" || page === "Scrims" || page === "Matches" ? `Add ${page === "Teams" ? "team" : "event"}` : undefined}
        onAction={() => setNotice(`The ${page.toLowerCase()} creation form will be added in the next step.`)}
      />
      {notice && <div className="inline-notice">{notice}<button onClick={() => setNotice("")}>Dismiss</button></div>}
      <section className="panel placeholder-panel">
        <div className="placeholder-icon"><LayoutDashboard size={30} /></div>
        <h2>{page} workspace</h2>
        <p>This section is ready for us to build next. The current dashboard uses sample data and isn't connected to a database yet.</p>
        <div className="placeholder-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Try a search in ${page.toLowerCase()}...`}
            aria-label={`Search ${page}`}
          />
        </div>
        {search && <span className="search-hint">Search input works. We'll connect it to real {page.toLowerCase()} data later.</span>}
        <button className="primary-button" onClick={() => setActivePage("Dashboard")}>
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

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        open={menuOpen}
        close={() => setMenuOpen(false)}
      />

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu icon-button" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </button>
            <div className="breadcrumb">
              <span>Kyusi Esports</span>
              <span className="breadcrumb-separator">/</span>
              <strong>{activePage}</strong>
            </div>
          </div>

          <div className="topbar-right">
            <div className="system-status"><span className="live-dot" /> System operational</div>
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
                  <p><span className="red-dot" /> 4 requests are waiting for review.</p>
                  <p><span className="red-dot" /> Your next scrim is scheduled for today.</p>
                  <button onClick={() => { setActivePage("Requests"); setNotificationsOpen(false); }}>
                    View requests <ArrowUpRight size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="topbar-profile">
              <div className="profile-avatar">G</div>
              <div className="topbar-profile-copy">
                <strong>Admin</strong>
                <span>President</span>
              </div>
              <ChevronDown size={15} className="muted-icon" />
            </div>
          </div>
        </header>

        <div className="page-content">
          {activePage === "Dashboard" ? (
            <Dashboard setActivePage={setActivePage} />
          ) : (
            <PlaceholderPage page={activePage} setActivePage={setActivePage} />
          )}
        </div>
      </main>
    </div>
  );
}
