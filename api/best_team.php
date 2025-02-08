<?php
header('Content-Type: application/json');
require_once '../db.php';

try {
    // First, get for each team the combination and its total points.
    // Note: We assume that each team (row in teams) has an associated set of players.
    $sql = "SELECT 
                t.team_id,
                (SELECT GROUP_CONCAT(tp.player_id ORDER BY tp.player_id SEPARATOR ',') 
                 FROM team_players tp 
                 WHERE tp.team_id = t.team_id) AS team_combination,
                IFNULL(SUM(tr.points), 0) AS total_points,
                COUNT(*) AS rounds_played
            FROM teams t
            LEFT JOIN transactions tr ON t.team_id = tr.team_id AND t.round_id = tr.round_id
            GROUP BY t.team_id";
    $stmt = $pdo->query($sql);
    $teamsData = $stmt->fetchAll();

    // Aggregate by team combination (order-insensitive).
    $aggregated = [];
    foreach ($teamsData as $row) {
        $combo = $row['team_combination'];
        if ($combo === null) continue; // Skip teams without assignments
        if (!isset($aggregated[$combo])) {
            $aggregated[$combo] = [
                'rounds_played' => 0,
                'total_points' => 0,
                'team_combination' => $combo
            ];
        }
        $aggregated[$combo]['rounds_played'] += $row['rounds_played'];
        $aggregated[$combo]['total_points'] += $row['total_points'];
    }
    
    // Compute average points per round for each team combination.
    $result = [];
    foreach ($aggregated as $combo => $data) {
        $avg = $data['rounds_played'] > 0 ? $data['total_points'] / $data['rounds_played'] : 0;
        $result[] = [
            'team_combination' => $combo,
            'rounds_played' => $data['rounds_played'],
            'average_points' => round($avg, 2)
        ];
    }
    
    // Sort by average_points ascending
    usort($result, function($a, $b) {
        return $a['average_points'] <=> $b['average_points'];
    });
    
    // Return top 3 best team combinations.
    $top3 = array_slice($result, 0, 3);
    echo json_encode($top3);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}