<?php
header('Content-Type: application/json');
require_once '../db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['round_id'], $data['player_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing round_id or player_id']);
        exit;
    }
    $player_id = $data['player_id'];
    $round_id = $data['round_id'];
    $team_id = !empty($data['team_id']) ? $data['team_id'] : null;
    
    try {
        // Remove any existing assignment for this player in the current round.
        $stmt = $pdo->prepare("DELETE tp FROM team_players tp 
            JOIN teams t ON tp.team_id = t.team_id 
            WHERE t.round_id = ? AND tp.player_id = ?");
        $stmt->execute([$round_id, $player_id]);
        
        if ($team_id) {
            $stmt = $pdo->prepare("INSERT INTO team_players (team_id, player_id) VALUES (?, ?)");
            $stmt->execute([$team_id, $player_id]);
        }
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} elseif ($method === 'GET') {
    if (isset($_GET['round_id'])) {
        $stmt = $pdo->prepare("SELECT tp.team_id, tp.player_id, p.name AS player_name
            FROM team_players tp 
            JOIN teams t ON tp.team_id = t.team_id 
            JOIN players p ON tp.player_id = p.player_id
            WHERE t.round_id = ?");
        $stmt->execute([$_GET['round_id']]);
        echo json_encode($stmt->fetchAll());
    } else {
        $stmt = $pdo->query("SELECT * FROM team_players");
        echo json_encode($stmt->fetchAll());
    }
} elseif ($method === 'DELETE') {
    if (!isset($_GET['round_id']) || !isset($_GET['player_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'round_id and player_id required']);
        exit;
    }
    try {
        $stmt = $pdo->prepare("DELETE tp FROM team_players tp 
            JOIN teams t ON tp.team_id = t.team_id 
            WHERE t.round_id = ? AND tp.player_id = ?");
        $stmt->execute([$_GET['round_id'], $_GET['player_id']]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}