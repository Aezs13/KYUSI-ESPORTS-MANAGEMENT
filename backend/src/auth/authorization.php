<?php

function permissionsForRole(string $role): array
{
    $permissions = [
        'president' => [
            'organization.view',
            'users.manage',
            'teams.manage',
            'rosters.manage',
            'events.manage',
            'requests.review',
            'reports.view',
            'settings.manage',
            'team.view',
            'profile.view',
        ],

        'manager' => [
            'organization.view',
            'teams.manage',
            'rosters.manage',
            'events.manage',
            'requests.review',
            'reports.view',
            'team.view',
            'profile.view',
        ],

        'captain' => [
            'team.view',
            'team.roster.manage',
            'team.events.manage',
            'profile.view',
        ],

        'player' => [
            'team.view',
            'profile.view',
        ],
    ];

    return $permissions[$role] ?? [];
}

function userHasPermission(
    string $role,
    string $permission
): bool {
    return in_array(
        $permission,
        permissionsForRole($role),
        true
    );
}

function currentAuthenticatedUser(PDO $pdo): ?array
{
    startSecureSession();

    if (!isset($_SESSION['user']['id'])) {
        return null;
    }

    $stmt = $pdo->prepare(
        'SELECT id, username, email, full_name, role, status
         FROM users
         WHERE id = :id
         LIMIT 1'
    );

    $stmt->execute([
        'id' => $_SESSION['user']['id'],
    ]);

    $user = $stmt->fetch();

    if (!$user || $user['status'] !== 'active') {
        $_SESSION = [];
        session_destroy();

        return null;
    }

    // Refresh role and account details from MySQL.
    $_SESSION['user'] = [
        'id' => (int) $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'full_name' => $user['full_name'],
        'role' => $user['role'],
    ];

    return $_SESSION['user'];
}

function requireAuthenticatedUser(PDO $pdo): array
{
    $user = currentAuthenticatedUser($pdo);

    if (!$user) {
        respond(401, [
            'success' => false,
            'message' => 'Authentication required.',
        ]);
    }

    return $user;
}

function requirePermission(
    PDO $pdo,
    string $permission
): array {
    $user = requireAuthenticatedUser($pdo);

    if (!userHasPermission($user['role'], $permission)) {
        respond(403, [
            'success' => false,
            'message' => 'You do not have permission to perform this action.',
        ]);
    }

    return $user;
}