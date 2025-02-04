<?php
class ScoreboardController {
    private $pdo;
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    public function getScoreboard() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }

        $gameTypeId = isset($_GET['game_type_id']) ? $_GET['game_type_id'] : null;

        if ($gameTypeId) {
            // Aggregate for a specific game type.
            $stmt = $this->pdo->prepare("
                SELECT p.player_id, p.name AS player_name, gt.name AS game_type, gt.score_direction, SUM(t.points) AS total_points
                FROM transactions t
                JOIN rounds r ON t.round_id = r.round_id
                JOIN games g ON r.game_id = g.game_id
                JOIN game_types gt ON g.game_type_id = gt.id
                JOIN players p ON t.player_id = p.player_id
                WHERE gt.id = :game_type_id
                GROUP BY p.player_id, gt.name, gt.score_direction
            ");
            $stmt->execute([':game_type_id' => $gameTypeId]);
            $result = $stmt->fetchAll();
            if (!empty($result)) {
                $direction = $result[0]['score_direction'];
                usort($result, function($a, $b) use ($direction) {
                    return ($direction === 'higher')
                        ? $b['total_points'] <=> $a['total_points']
                        : $a['total_points'] <=> $b['total_points'];
                });
            }
            echo json_encode($result);
        } else {
            // Overall aggregation: return separate score groups by game type.
            $stmt = $this->pdo->query("
                SELECT gt.id AS game_type_id, gt.name AS game_type, gt.score_direction, p.player_id, p.name AS player_name, SUM(t.points) AS total_points
                FROM transactions t
                JOIN rounds r ON t.round_id = r.round_id
                JOIN games g ON r.game_id = g.game_id
                JOIN game_types gt ON g.game_type_id = gt.id
                JOIN players p ON t.player_id = p.player_id
                GROUP BY gt.id, p.player_id
                ORDER BY gt.id
            ");
            $rows = $stmt->fetchAll();
            $result = [];
            foreach ($rows as $row) {
                $type = $row['game_type'];
                if (!isset($result[$type])) {
                    $result[$type] = [
                        'score_direction' => $row['score_direction'],
                        'scores' => []
                    ];
                }
                $result[$type]['scores'][] = [
                    'player_id'   => $row['player_id'],
                    'player_name' => $row['player_name'],
                    'total_points'=> $row['total_points']
                ];
            }
            foreach ($result as $type => &$data) {
                if ($data['score_direction'] === 'higher') {
                    usort($data['scores'], function($a, $b) {
                        return $b['total_points'] <=> $a['total_points'];
                    });
                } else {
                    usort($data['scores'], function($a, $b) {
                        return $a['total_points'] <=> $b['total_points'];
                    });
                }
            }
            echo json_encode($result);
        }
    }
}
?>