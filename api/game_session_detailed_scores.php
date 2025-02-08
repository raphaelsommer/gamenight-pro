<?php
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_GET['game_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing game_id parameter']);
    exit;
}

$game_id = $_GET['game_id'];

try {
    // For each round in the session, get each player's points (if any)
    $sql = "SELECT 
                r.round_number, 
                p.player_id, 
                p.name AS player_name, 
                IFNULL(tr.points, 0) AS points
            FROM rounds r
            JOIN teams t ON r.round_id = t.round_id
            JOIN team_players tp ON t.team_id = tp.team_id
            JOIN players p ON tp.player_id = p.player_id
            LEFT JOIN transactions tr ON t.team_id = tr.team_id AND r.round_id = tr.round_id
            WHERE r.game_id = ?
            ORDER BY r.round_number, p.player_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$game_id]);
    $rows = $stmt->fetchAll();
    echo json_encode($rows);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}