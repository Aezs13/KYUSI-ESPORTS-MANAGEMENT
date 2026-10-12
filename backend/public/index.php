
<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($method === 'GET' && $path === '/api/health') {
    try {
        require_once __DIR__ . '/../src/config/database.php';

        $pdo = getDatabaseConnection();
        $pdo->query('SELECT 1');

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'KYUSI API is running.',
            'database' => 'connected',
        ]);
    } catch (Throwable $error) {
        error_log($error->__toString());

        http_response_code(503);
        echo json_encode([
            'success' => false,
            'message' => 'The API is running, but the database is unavailable.',
        ]);
    }

    exit;
}

http_response_code(404);
echo json_encode([
    'success' => false,
    'message' => 'Endpoint not found.',
]);
