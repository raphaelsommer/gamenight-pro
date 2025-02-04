<?php
header('Content-Type: application/json');
require_once '../db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM games");
    $games = $stmt->fetchAll();
    echo json_encode($games);
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['game_type_id'], $data['name'], $data['game_date'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }
    $stmt = $pdo->prepare("INSERT INTO games (game_type_id, name, game_date, created_at) VALUES (?, ?, ?, NOW())");
    try {
        $stmt->execute([$data['game_type_id'], $data['name'], $data['game_date']]);
        echo json_encode(['success' => true, 'game_id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}