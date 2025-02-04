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
    $sql = "SELECT p.player_id, p.name, IFNULL(SUM(tr.points), 0) AS total_score
            FROM players p
            LEFT JOIN team_players tp ON p.player_id = tp.player_id
            LEFT JOIN teams t ON tp.team_id = t.team_id
            LEFT JOIN rounds r ON t.round_id = r.round_id
            LEFT JOIN transactions tr ON t.team_id = tr.team_id AND t.round_id = tr.round_id
            WHERE r.game_id = ?
            GROUP BY p.player_id
            ORDER BY total_score DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$game_id]);
    $results = $stmt->fetchAll();
    echo json_encode($results);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}