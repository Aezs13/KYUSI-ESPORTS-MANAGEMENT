<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../src/config/database.php';
require_once __DIR__ . '/../src/auth/session.php';
require_once __DIR__ . '/../src/auth/authorization.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

function respond(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function readJsonBody(): array
{
    $body = json_decode(file_get_contents('php://input'), true);
    return is_array($body) ? $body : [];
}

if ($method === 'GET' && $path === '/api/me') {
    try {
        $pdo = getDatabaseConnection();
        $user = currentAuthenticatedUser($pdo);

        if (!$user) {
            respond(401, [
                'success' => false,
                'message' => 'Not logged in.',
            ]);
        }

        respond(200, [
            'success' => true,
            'user' => $user,
        ]);
    } catch (Throwable $error) {
        error_log($error->__toString());

        respond(500, [
            'success' => false,
            'message' => 'Unable to check your session.',
        ]);
    }
}

if ($method === 'POST' && $path === '/api/login') {
    $input = readJsonBody();
    $username = trim((string) ($input['username'] ?? ''));
    $password = (string) ($input['password'] ?? '');

    if ($username === '' || $password === '') {
        respond(422, [
            'success' => false,
            'message' => 'Username and password are required.',
        ]);
    }

    try {
        $pdo = getDatabaseConnection();

        $stmt = $pdo->prepare(
            'SELECT id, username, email, password_hash, full_name, role, status
             FROM users
             WHERE username = :username OR email = :email
             LIMIT 1'
        );

        $stmt->execute([
            'username' => $username,
            'email' => $username,
        ]);

        $user = $stmt->fetch();

        if (
            !$user ||
            !password_verify($password, $user['password_hash']) ||
            $user['status'] !== 'active'
        ) {
            respond(401, [
                'success' => false,
                'message' => 'Invalid credentials or inactive account.',
            ]);
        }

        startSecureSession();
        session_regenerate_id(true);

        $_SESSION['user'] = [
            'id' => (int) $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'full_name' => $user['full_name'],
            'role' => $user['role'],
        ];

        respond(200, [
            'success' => true,
            'message' => 'Login successful.',
            'user' => $_SESSION['user'],
        ]);
    } catch (Throwable $error) {
        error_log($error->__toString());
        respond(500, [
            'success' => false,
            'message' => 'Unable to process login right now.',
        ]);
    }
}

if ($method === 'GET' && $path === '/api/me') {
    startSecureSession();

    if (!isset($_SESSION['user'])) {
        respond(401, [
            'success' => false,
            'message' => 'Not logged in.',
        ]);
    }

    respond(200, [
        'success' => true,
        'user' => $_SESSION['user'],
    ]);
}

if ($method === 'POST' && $path === '/api/logout') {
    startSecureSession();

    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();

        setcookie(session_name(), '', [
            'expires' => time() - 42000,
            'path' => $params['path'],
            'domain' => $params['domain'],
            'secure' => $params['secure'],
            'httponly' => $params['httponly'],
            'samesite' => 'Lax',
        ]);
    }

    session_destroy();

    respond(200, [
        'success' => true,
        'message' => 'Logged out successfully.',
    ]);
}

if (
    $method === 'GET' &&
    $path === '/api/admin/access-check'
) {
    try {
        $pdo = getDatabaseConnection();

        $user = requirePermission(
            $pdo,
            'users.manage'
        );

        respond(200, [
            'success' => true,
            'message' => 'President-level access confirmed.',
            'user' => [
                'username' => $user['username'],
                'role' => $user['role'],
            ],
        ]);
    } catch (Throwable $error) {
        error_log($error->__toString());

        respond(500, [
            'success' => false,
            'message' => 'Unable to verify permissions.',
        ]);
    }
}

// Helper: make sure count columns are real integers in the JSON output.
function castIntFields(array $row, array $fields): array
{
    foreach ($fields as $field) {
        if (array_key_exists($field, $row)) {
            $row[$field] = (int) $row[$field];
        }
    }

    return $row;
}

// True when MySQL reports a duplicate value on a UNIQUE key.
function isDuplicateKeyError(Throwable $error): bool
{
    return $error instanceof PDOException
        && (int) ($error->errorInfo[1] ?? 0) === 1062;
}

// GET /api/games
// List games with their team counts, plus overall summary numbers.
if ($method === 'GET' && $path === '/api/games') {
    try {
        $pdo = getDatabaseConnection();

        requirePermission(
            $pdo,
            'organization.view'
        );

        $stmt = $pdo->query(
            "SELECT
                g.id,
                g.name,
                g.logo_path,
                g.created_at,
                COUNT(DISTINCT t.id) AS team_count,
                COUNT(DISTINCT CASE WHEN t.status = 'active' THEN t.id END)
                    AS active_team_count,
                COUNT(DISTINCT tm.user_id) AS member_count
             FROM games g
             LEFT JOIN teams t
                ON t.game_id = g.id
             LEFT JOIN team_members tm
                ON tm.team_id = t.id
             GROUP BY
                g.id,
                g.name,
                g.logo_path,
                g.created_at
             ORDER BY g.name ASC"
        );

        $games = array_map(
            fn(array $row): array => castIntFields($row, [
                'id',
                'team_count',
                'active_team_count',
                'member_count',
            ]),
            $stmt->fetchAll()
        );

        $summary = $pdo->query(
            "SELECT
                (SELECT COUNT(*) FROM games) AS total_games,
                (SELECT COUNT(*) FROM teams) AS total_teams,
                (SELECT COUNT(*) FROM teams WHERE status = 'active')
                    AS active_teams,
                (SELECT COUNT(DISTINCT user_id) FROM team_members)
                    AS total_members"
        )->fetch();

        respond(200, [
            'success' => true,
            'games' => $games,
            'summary' => castIntFields($summary, [
                'total_games',
                'total_teams',
                'active_teams',
                'total_members',
            ]),
        ]);
    } catch (Throwable $error) {
        error_log($error->__toString());

        respond(500, [
            'success' => false,
            'message' => 'Unable to retrieve games.',
        ]);
    }
}

// POST /api/games
// Add a game. Requires teams.manage (president or manager).
if ($method === 'POST' && $path === '/api/games') {
    try {
        $pdo = getDatabaseConnection();

        $user = requirePermission(
            $pdo,
            'teams.manage'
        );

        $input = readJsonBody();

        $name = trim((string) ($input['name'] ?? ''));

        if ($name === '') {
            respond(422, [
                'success' => false,
                'message' => 'Game name is required.',
            ]);
        }

        if (mb_strlen($name) > 100) {
            respond(422, [
                'success' => false,
                'message' => 'Game name must be 100 characters or fewer.',
            ]);
        }

        $stmt = $pdo->prepare(
            'SELECT id FROM games WHERE name = :name LIMIT 1'
        );

        $stmt->execute(['name' => $name]);

        if ($stmt->fetch()) {
            respond(409, [
                'success' => false,
                'message' => 'A game with that name already exists.',
            ]);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO games (name, created_by)
             VALUES (:name, :created_by)'
        );

        $stmt->execute([
            'name' => $name,
            'created_by' => $user['id'],
        ]);

        respond(201, [
            'success' => true,
            'message' => 'Game added successfully.',
            'game' => [
                'id' => (int) $pdo->lastInsertId(),
                'name' => $name,
                'logo_path' => null,
                'team_count' => 0,
                'active_team_count' => 0,
                'member_count' => 0,
            ],
        ]);
    } catch (Throwable $error) {
        if (isDuplicateKeyError($error)) {
            respond(409, [
                'success' => false,
                'message' => 'A game with that name already exists.',
            ]);
        }

        error_log($error->__toString());

        respond(500, [
            'success' => false,
            'message' => 'Unable to add game.',
        ]);
    }
}

// GET /api/teams            -> all teams
// GET /api/teams?game_id=3  -> only the teams of game 3
if ($method === 'GET' && $path === '/api/teams') {
    try {
        $pdo = getDatabaseConnection();

        requirePermission(
            $pdo,
            'organization.view'
        );

        $gameId = isset($_GET['game_id'])
            ? (int) $_GET['game_id']
            : 0;

        $sql =
            "SELECT
                t.id,
                t.name,
                t.game_id,
                g.name AS game_name,
                g.logo_path,
                t.description,
                t.status,
                t.created_at,
                COUNT(tm.user_id) AS member_count
             FROM teams t
             INNER JOIN games g
                ON g.id = t.game_id
             LEFT JOIN team_members tm
                ON tm.team_id = t.id";

        $params = [];

        if ($gameId > 0) {
            $sql .= " WHERE t.game_id = :game_id";
            $params['game_id'] = $gameId;
        }

        $sql .=
            " GROUP BY
                t.id,
                t.name,
                t.game_id,
                g.name,
                g.logo_path,
                t.description,
                t.status,
                t.created_at
             ORDER BY t.created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        $teams = array_map(
            fn(array $row): array => castIntFields($row, [
                'id',
                'game_id',
                'member_count',
            ]),
            $stmt->fetchAll()
        );

        respond(200, [
            'success' => true,
            'teams' => $teams,
        ]);
    } catch (Throwable $error) {
        error_log($error->__toString());

        respond(500, [
            'success' => false,
            'message' => 'Unable to retrieve teams.',
        ]);
    }
}

// POST /api/teams
// Create a team inside a game. Requires teams.manage.
if ($method === 'POST' && $path === '/api/teams') {
    try {
        $pdo = getDatabaseConnection();

        $user = requirePermission($pdo, 'teams.manage');

        $input = readJsonBody();

        $name = trim((string) ($input['name'] ?? ''));
        $gameId = (int) ($input['game_id'] ?? 0);
        $description = trim(
            (string) ($input['description'] ?? '')
        );
        $status = (string) ($input['status'] ?? 'active');

        if ($name === '' || $gameId <= 0) {
            respond(422, [
                'success' => false,
                'message' => 'Team name and game are required.',
            ]);
        }

        if (mb_strlen($name) > 100) {
            respond(422, [
                'success' => false,
                'message' => 'Team name must be 100 characters or fewer.',
            ]);
        }

        if (mb_strlen($description) > 5000) {
            respond(422, [
                'success' => false,
                'message' => 'Description must be 5000 characters or fewer.',
            ]);
        }

        if (!in_array($status, ['active', 'inactive'], true)) {
            respond(422, [
                'success' => false,
                'message' => 'Invalid team status.',
            ]);
        }

        $stmt = $pdo->prepare(
            'SELECT id, name
             FROM games
             WHERE id = :id
             LIMIT 1'
        );

        $stmt->execute(['id' => $gameId]);
        $game = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$game) {
            respond(422, [
                'success' => false,
                'message' => 'The selected game does not exist.',
            ]);
        }

        $stmt = $pdo->prepare(
            'SELECT id
             FROM teams
             WHERE game_id = :game_id
               AND name = :name
             LIMIT 1'
        );

        $stmt->execute([
            'game_id' => $gameId,
            'name' => $name,
        ]);

        if ($stmt->fetch()) {
            respond(409, [
                'success' => false,
                'message' =>
                'This game already has a team with that name.',
            ]);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO teams
                (name, game_id, description, status, created_by)
             VALUES
                (:name, :game_id, :description, :status, :created_by)'
        );

        $stmt->execute([
            'name' => $name,
            'game_id' => $gameId,
            'description' => $description !== ''
                ? $description
                : null,
            'status' => $status,
            'created_by' => $user['id'],
        ]);

        $teamId = (int) $pdo->lastInsertId();

        respond(201, [
            'success' => true,
            'message' => 'Team created successfully.',
            'team' => [
                'id' => $teamId,
                'name' => $name,
                'game_id' => $gameId,
                'game_name' => $game['name'],
                'description' => $description !== ''
                    ? $description
                    : null,
                'status' => $status,
                'created_by' => (int) $user['id'],
                'member_count' => 0,
            ],
        ]);
    } catch (Throwable $error) {
        if (isDuplicateKeyError($error)) {
            respond(409, [
                'success' => false,
                'message' =>
                'This game already has a team with that name.',
            ]);
        }

        error_log($error->__toString());

        respond(500, [
            'success' => false,
            'message' => 'Unable to create team.',
        ]);
    }
}

// GET /api/dashboard
// Everything the Dashboard page shows, in one request.
// Presidents and managers see the whole organization.
// Captains and players only see the teams they belong to.
if ($method === 'GET' && $path === '/api/dashboard') {
    try {
        $pdo = getDatabaseConnection();

        $user = requireAuthenticatedUser($pdo);

        $orgWide = userHasPermission(
            $user['role'],
            'organization.view'
        );

        $canReview = userHasPermission(
            $user['role'],
            'requests.review'
        );

        // Added to queries that use the alias "t" (teams).
        $teamScope = $orgWide
            ? ''
            : ' AND t.id IN (
                   SELECT team_id
                   FROM team_members
                   WHERE user_id = :scope_user
               )';

        $teamParams = $orgWide
            ? []
            : ['scope_user' => $user['id']];

        // Added to queries that use the alias "r" (requests).
        // People who cannot review only see their own requests.
        $requestScope = $canReview
            ? ''
            : ' AND r.requested_by = :request_user';

        $requestParams = $canReview
            ? []
            : ['request_user' => $user['id']];

        $query = function (
            string $sql,
            array $params = []
        ) use ($pdo): array {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            return $stmt->fetchAll();
        };

        // ---- Stat cards ----
        $teamStats = $query(
            "SELECT
                COUNT(*) AS active_teams,
                COUNT(DISTINCT t.game_id) AS game_titles
             FROM teams t
             WHERE t.status = 'active'" . $teamScope,
            $teamParams
        )[0];

        $playerStats = $query(
            "SELECT COUNT(DISTINCT tm.user_id) AS total_players
             FROM team_members tm
             INNER JOIN teams t
                ON t.id = tm.team_id
             WHERE t.status = 'active'" . $teamScope,
            $teamParams
        )[0];

        $eventStats = $query(
            "SELECT COUNT(*) AS scheduled_events
             FROM events e
             INNER JOIN teams t
                ON t.id = e.team_id
             WHERE e.status = 'scheduled'
               AND e.starts_at >= NOW()
               AND e.starts_at < DATE_ADD(NOW(), INTERVAL 7 DAY)"
                . $teamScope,
            $teamParams
        )[0];

        $requestStats = $query(
            "SELECT COUNT(*) AS pending_requests
             FROM requests r
             WHERE r.status = 'pending'" . $requestScope,
            $requestParams
        )[0];

        // ---- Upcoming schedule ----
        $schedule = array_map(
            fn(array $row): array => castIntFields($row, [
                'id',
                'game_id',
                'days_away',
            ]),
            $query(
                "SELECT
                    e.id,
                    e.title,
                    e.event_type,
                    e.opponent,
                    e.starts_at,
                    DATEDIFF(DATE(e.starts_at), CURDATE()) AS days_away,
                    t.name AS team_name,
                    g.id AS game_id,
                    g.name AS game_name,
                    g.logo_path
                 FROM events e
                 INNER JOIN teams t
                    ON t.id = e.team_id
                 INNER JOIN games g
                    ON g.id = t.game_id
                 WHERE e.status = 'scheduled'
                   AND e.starts_at >= NOW()" . $teamScope . "
                 ORDER BY e.starts_at ASC
                 LIMIT 5",
                $teamParams
            )
        );

        // ---- Your teams ----
        $teams = array_map(
            fn(array $row): array => castIntFields($row, [
                'id',
                'game_id',
                'member_count',
            ]),
            $query(
                "SELECT
                    t.id,
                    t.name,
                    t.description,
                    t.status,
                    t.game_id,
                    g.name AS game_name,
                    g.logo_path,
                    COUNT(tm.user_id) AS member_count
                 FROM teams t
                 INNER JOIN games g
                    ON g.id = t.game_id
                 LEFT JOIN team_members tm
                    ON tm.team_id = t.id
                 WHERE 1 = 1" . $teamScope . "
                 GROUP BY
                    t.id,
                    t.name,
                    t.description,
                    t.status,
                    t.created_at,
                    t.game_id,
                    g.name,
                    g.logo_path
                 ORDER BY t.status ASC, t.created_at DESC
                 LIMIT 4",
                $teamParams
            )
        );

        // ---- Recent activity (built from real rows, newest first) ----
        $activity = [];

        foreach (
            $query(
                "SELECT
                t.name AS team_name,
                g.name AS game_name,
                TIMESTAMPDIFF(SECOND, t.created_at, NOW()) AS seconds_ago
             FROM teams t
             INNER JOIN games g
                ON g.id = t.game_id
             WHERE 1 = 1" . $teamScope . "
             ORDER BY t.created_at DESC
             LIMIT 6",
                $teamParams
            ) as $row
        ) {
            $activity[] = [
                'kind' => 'team',
                'title' => 'Team created',
                'detail' => $row['team_name']
                    . ' (' . $row['game_name'] . ')',
                'seconds_ago' => max(0, (int) $row['seconds_ago']),
            ];
        }

        foreach (
            $query(
                "SELECT
                u.full_name,
                t.name AS team_name,
                g.name AS game_name,
                TIMESTAMPDIFF(SECOND, tm.joined_at, NOW()) AS seconds_ago
             FROM team_members tm
             INNER JOIN users u
                ON u.id = tm.user_id
             INNER JOIN teams t
                ON t.id = tm.team_id
             INNER JOIN games g
                ON g.id = t.game_id
             WHERE 1 = 1" . $teamScope . "
             ORDER BY tm.joined_at DESC
             LIMIT 6",
                $teamParams
            ) as $row
        ) {
            $activity[] = [
                'kind' => 'roster',
                'title' => 'Roster updated',
                'detail' => $row['full_name'] . ' joined '
                    . $row['team_name']
                    . ' (' . $row['game_name'] . ')',
                'seconds_ago' => max(0, (int) $row['seconds_ago']),
            ];
        }

        foreach (
            $query(
                "SELECT
                e.event_type,
                e.opponent,
                t.name AS team_name,
                g.name AS game_name,
                TIMESTAMPDIFF(SECOND, e.created_at, NOW()) AS seconds_ago
             FROM events e
             INNER JOIN teams t
                ON t.id = e.team_id
             INNER JOIN games g
                ON g.id = t.game_id
             WHERE 1 = 1" . $teamScope . "
             ORDER BY e.created_at DESC
             LIMIT 6",
                $teamParams
            ) as $row
        ) {
            $detail = $row['team_name']
                . ' (' . $row['game_name'] . ')';

            if ($row['opponent'] !== null && $row['opponent'] !== '') {
                $detail .= ' vs ' . $row['opponent'];
            }

            $activity[] = [
                'kind' => 'event',
                'title' => ucfirst($row['event_type']) . ' scheduled',
                'detail' => $detail,
                'seconds_ago' => max(0, (int) $row['seconds_ago']),
            ];
        }

        foreach (
            $query(
                "SELECT
                r.title,
                r.request_type,
                r.status,
                g.name AS game_name,
                TIMESTAMPDIFF(SECOND, r.created_at, NOW())
                    AS submitted_seconds_ago,
                TIMESTAMPDIFF(SECOND, r.reviewed_at, NOW())
                    AS reviewed_seconds_ago
             FROM requests r
             LEFT JOIN teams t
                ON t.id = r.team_id
             LEFT JOIN games g
                ON g.id = t.game_id
             WHERE 1 = 1" . $requestScope . "
             ORDER BY r.created_at DESC
             LIMIT 6",
                $requestParams
            ) as $row
        ) {
            $detail = $row['title'];

            if ($row['game_name'] !== null) {
                $detail .= ' (' . $row['game_name'] . ')';
            }

            $activity[] = [
                'kind' => 'request',
                'title' => $row['request_type'] === 'other'
                    ? 'New request'
                    : 'New ' . $row['request_type'] . ' request',
                'detail' => $detail,
                'seconds_ago' => max(
                    0,
                    (int) $row['submitted_seconds_ago']
                ),
            ];

            if (
                $row['reviewed_seconds_ago'] !== null
                && $row['status'] !== 'pending'
            ) {
                $activity[] = [
                    'kind' => 'review_' . $row['status'],
                    'title' => 'Request ' . $row['status'],
                    'detail' => $detail,
                    'seconds_ago' => max(
                        0,
                        (int) $row['reviewed_seconds_ago']
                    ),
                ];
            }
        }

        usort(
            $activity,
            fn(array $a, array $b): int =>
            $a['seconds_ago'] <=> $b['seconds_ago']
        );

        respond(200, [
            'success' => true,
            'scope' => $orgWide ? 'organization' : 'team',
            'stats' => [
                'active_teams' => (int) $teamStats['active_teams'],
                'game_titles' => (int) $teamStats['game_titles'],
                'total_players' => (int) $playerStats['total_players'],
                'scheduled_events' =>
                (int) $eventStats['scheduled_events'],
                'pending_requests' =>
                (int) $requestStats['pending_requests'],
                'can_review_requests' => $canReview,
            ],
            'schedule' => $schedule,
            'activity' => array_slice($activity, 0, 6),
            'teams' => $teams,
        ]);
    } catch (Throwable $error) {
        error_log($error->__toString());

        respond(500, [
            'success' => false,
            'message' => 'Unable to load the dashboard.',
        ]);
    }
}

respond(404, [
    'success' => false,
    'message' => 'Endpoint not found.',
]);
