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
    // Get number of rounds played in this game session.
    $sqlRounds = "SELECT COUNT(*) AS rounds_played FROM rounds WHERE game_id = ?";
    $stmt = $pdo->prepare($sqlRounds);
    $stmt->execute([$game_id]);
    $roundData = $stmt->fetch();
    $roundsPlayed = $roundData ? (int)$roundData['rounds_played'] : 0;
    
    // Compute average players and teams per round.
    $sqlAvg = "SELECT 
                  AVG(player_count) AS avg_players, 
                  AVG(team_count) AS avg_teams 
               FROM (
                    SELECT r.round_id,
                           COUNT(DISTINCT tp.player_id) AS player_count,
                           COUNT(DISTINCT t.team_id) AS team_count
                    FROM rounds r
                    LEFT JOIN teams t ON r.round_id = t.round_id
                    LEFT JOIN team_players tp ON t.team_id = tp.team_id
                    WHERE r.game_id = ?
                    GROUP BY r.round_id
               ) AS round_stats";
    $stmt = $pdo->prepare($sqlAvg);
    $stmt->execute([$game_id]);
    $avgData = $stmt->fetch();
    $avgPlayers = $avgData ? (float)$avgData['avg_players'] : 0;
    $avgTeams = $avgData ? (float)$avgData['avg_teams'] : 0;
    
    $result = [
        'rounds_played' => $roundsPlayed,
        'avg_players' => round($avgPlayers, 2),
        'avg_teams'   => round($avgTeams, 2)
    ];
    
    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}