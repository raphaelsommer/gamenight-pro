<?php
header('Content-Type: application/json');
require_once '../db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['player_id'])) {
            $stmt = $pdo->prepare("SELECT * FROM players WHERE player_id = ?");
            $stmt->execute([$_GET['player_id']]);
            echo json_encode($stmt->fetch() ?: []);
        } else {
            $stmt = $pdo->query("SELECT * FROM players");
            echo json_encode($stmt->fetchAll());
        }
        break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Name is required']);
            exit;
        }
        $stmt = $pdo->prepare("INSERT INTO players (name, email) VALUES (?, ?)");
        try {
            $stmt->execute([$data['name'], $data['email'] ?? null]);
            echo json_encode(['success' => true, 'player_id' => $pdo->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error']);
        }
        break;
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['player_id'], $data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'player_id and name are required']);
            exit;
        }
        $stmt = $pdo->prepare("UPDATE players SET name = ?, email = ? WHERE player_id = ?");
        try {
            $stmt->execute([$data['name'], $data['email'] ?? null, $data['player_id']]);
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error']);
        }
        break;
    case 'DELETE':
        if (!isset($_GET['player_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'player_id is required']);
            exit;
        }
        $stmt = $pdo->prepare("DELETE FROM players WHERE player_id = ?");
        try {
            $stmt->execute([$_GET['player_id']]);
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error']);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}