
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

// GET /api/teams
// List teams for authorized users.
if ($method === 'GET' && $path === '/api/teams') {
    try {
        $pdo = getDatabaseConnection();

        $user = requirePermission(
            $pdo,
            'organization.view'
        );

        $stmt = $pdo->query(
            "SELECT
                t.id,
                t.name,
                t.game_title,
                t.description,
                t.status,
                t.created_at,
                COUNT(tm.user_id) AS member_count
             FROM teams t
             LEFT JOIN team_members tm
                ON tm.team_id = t.id
             GROUP BY
                t.id,
                t.name,
                t.game_title,
                t.description,
                t.status,
                t.created_at
             ORDER BY t.created_at DESC"
        );

        respond(200, [
            'success' => true,
            'teams' => $stmt->fetchAll(),
        ]);
    } catch (Throwable $error) {
        error_log($error->__toString());

        respond(500, [
            'success' => false,
            'message' => 'Unable to retrieve teams.',
        ]);
    }
}

if ($method === 'POST' && $path === '/api/teams') {
    try {
        $pdo = getDatabaseConnection();

        $user = requirePermission(
            $pdo,
            'teams.manage'
        );

        $input = readJsonBody();

        $name = trim((string) ($input['name'] ?? ''));
        $gameTitle = trim(
            (string) ($input['game_title'] ?? '')
        );
        $description = trim(
            (string) ($input['description'] ?? '')
        );

        if ($name === '' || $gameTitle === '') {
            respond(422, [
                'success' => false,
                'message' => 'Team name and game title are required.',
            ]);
        }

        if (
            mb_strlen($name) > 100 ||
            mb_strlen($gameTitle) > 100
        ) {
            respond(422, [
                'success' => false,
                'message' => 'Team name and game title must be 100 characters or fewer.',
            ]);
        }

        if (mb_strlen($description) > 5000) {
            respond(422, [
                'success' => false,
                'message' => 'Description must be 5000 characters or fewer.',
            ]);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO teams
                (name, game_title, description, created_by)
             VALUES
                (:name, :game_title, :description, :created_by)'
        );

        $stmt->execute([
            'name' => $name,
            'game_title' => $gameTitle,
            'description' => $description !== ''
                ? $description
                : null,
            'created_by' => $user['id'],
        ]);

        $teamId = (int) $pdo->lastInsertId();

        respond(201, [
            'success' => true,
            'message' => 'Team created successfully.',
            'team' => [
                'id' => $teamId,
                'name' => $name,
                'game_title' => $gameTitle,
                'description' => $description !== ''
                    ? $description
                    : null,
                'status' => 'active',
                'created_by' => $user['id'],
            ],
        ]);
    } catch (Throwable $error) {
        error_log($error->__toString());

        respond(500, [
            'success' => false,
            'message' => 'Unable to create team.',
        ]);
    }
}

respond(404, [
    'success' => false,
    'message' => 'Endpoint not found.',
]);


