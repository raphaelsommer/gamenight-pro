<?php
header('Content-Type: application/json');
require_once '../db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['game_id'])) {
        $stmt = $pdo->prepare("SELECT * FROM rounds WHERE game_id = ?");
        $stmt->execute([$_GET['game_id']]);
        $rounds = $stmt->fetchAll();
        echo json_encode($rounds);
    } else {
        $stmt = $pdo->query("SELECT * FROM rounds");
        echo json_encode($stmt->fetchAll());
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['game_id'], $data['round_number'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }
    $stmt = $pdo->prepare("INSERT INTO rounds (game_id, round_number, created_at) VALUES (?, ?, NOW())");
    try {
        $stmt->execute([$data['game_id'], $data['round_number']]);
        echo json_encode(['success' => true, 'round_id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}