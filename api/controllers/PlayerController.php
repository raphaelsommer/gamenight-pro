<?php
// controllers/PlayerController.php

class PlayerController {

    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getPlayers() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
        $stmt = $this->pdo->prepare("SELECT * FROM players WHERE active = 1");
        $stmt->execute();
        echo json_encode($stmt->fetchAll());
    }

    public function createPlayer() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Player name required']);
            exit;
        }

        $stmt = $this->pdo->prepare("INSERT INTO players (name, active) VALUES (:name, 1)");
        $stmt->execute([':name' => htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8')]);
        echo json_encode(['success' => true, 'player_id' => $this->pdo->lastInsertId()]);
    }
}
?>