<?php
// controllers/GameController.php

class GameController {

    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getGames() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
        $stmt = $this->pdo->prepare("SELECT * FROM games ORDER BY date DESC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll());
    }

    public function createGame() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
    
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['name']) || empty($data['date']) || empty($data['game_type_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Game name, date, and game type required']);
            exit;
        }
    
        $stmt = $this->pdo->prepare("INSERT INTO games (name, game_type_id, game_date, creator_id) VALUES (:name, :game_type_id, :date, :creator_id)");
        $stmt->execute([
            ':name'         => htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8'),
            ':game_type_id' => $data['game_type_id'],
            ':date'         => htmlspecialchars($data['date'], ENT_QUOTES, 'UTF-8'),
            ':creator_id'   => $_SESSION['user_id']
        ]);
        echo json_encode(['success' => true, 'game_id' => $this->pdo->lastInsertId()]);
    }
}
?>