<?php
header('Content-Type: application/json');
require_once '../db.php';

$stmt = $pdo->query("SELECT * FROM game_types");
$game_types = $stmt->fetchAll();
echo json_encode($game_types);