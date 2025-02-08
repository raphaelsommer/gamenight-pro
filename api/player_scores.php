<?php
header('Content-Type: application/json');
require_once '../db.php';

try {
    $sql = "SELECT 
                p.player_id, 
                p.name,
                COUNT(DISTINCT r.round_id) AS rounds_played,
                IFNULL(SUM(tr.points),0) AS total_points,
                IF(COUNT(DISTINCT r.round_id)=0,0, SUM(tr.points)/COUNT(DISTINCT r.round_id)) AS average_points
            FROM players p
            LEFT JOIN team_players tp ON p.player_id = tp.player_id
            LEFT JOIN teams t ON tp.team_id = t.team_id
            LEFT JOIN rounds r ON t.round_id = r.round_id
            LEFT JOIN transactions tr ON t.team_id = tr.team_id AND r.round_id = tr.round_id
            GROUP BY p.player_id
            ORDER BY average_points ASC
            LIMIT 10";
    $stmt = $pdo->query($sql);
    $results = $stmt->fetchAll();
    echo json_encode($results);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}