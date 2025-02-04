<?php
header('Content-Type: application/json');
require_once '../db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['round_id'])) {
        $stmt = $pdo->prepare("SELECT * FROM transactions WHERE round_id = ?");
        $stmt->execute([$_GET['round_id']]);
        echo json_encode($stmt->fetchAll());
    } else {
        $stmt = $pdo->query("SELECT * FROM transactions");
        echo json_encode($stmt->fetchAll());
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['round_id'], $data['team_id'], $data['points'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }
    $stmt = $pdo->prepare("INSERT INTO transactions (round_id, team_id, points, created_at) VALUES (?, ?, ?, NOW())");
    try {
        $stmt->execute([$data['round_id'], $data['team_id'], $data['points']]);
        echo json_encode(['success' => true, 'transaction_id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}