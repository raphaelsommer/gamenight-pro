<?php
header('Content-Type: application/json');
require_once '../db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['round_id'])) {
        $stmt = $pdo->prepare("SELECT * FROM teams WHERE round_id = ?");
        $stmt->execute([$_GET['round_id']]);
        echo json_encode($stmt->fetchAll());
    } else {
        $stmt = $pdo->query("SELECT * FROM teams");
        echo json_encode($stmt->fetchAll());
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['round_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing round_id']);
        exit;
    }
    // Use an optional name; if empty, we will set it later.
    $name = (isset($data['name']) && trim($data['name']) !== '') ? $data['name'] : null;
    $stmt = $pdo->prepare("INSERT INTO teams (round_id, name) VALUES (?, ?)");
    try {
        $stmt->execute([$data['round_id'], $name]);
        $team_id = $pdo->lastInsertId();
        if ($name === null) {
            $defaultName = "Team " . $team_id;
            $stmt = $pdo->prepare("UPDATE teams SET name = ? WHERE team_id = ?");
            $stmt->execute([$defaultName, $team_id]);
            $name = $defaultName;
        }
        echo json_encode(['success' => true, 'team_id' => $team_id, 'name' => $name]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}