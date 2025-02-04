<?php
class GameTypeController {
    private $pdo;
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    public function getGameTypes() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
        $stmt = $this->pdo->query("SELECT * FROM game_types");
        echo json_encode($stmt->fetchAll());
    }
}
?>