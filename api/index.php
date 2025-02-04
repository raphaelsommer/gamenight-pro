<?php
// index.php - API Router
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
session_start();

// Autoload libraries (installed via Composer)
require_once __DIR__ . '/../vendor/autoload.php'; // Adjust path if necessary
require_once 'db.php'; // Contains your PDO connection as $pdo

// Determine the request path and method
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$scriptName = dirname($_SERVER['SCRIPT_NAME']);
$basePath = rtrim($scriptName, '/');
$path = substr($requestUri, strlen($basePath));
$path = trim($path, '/');
$method = $_SERVER['REQUEST_METHOD'];

// Split the path into segments
$segments = explode('/', $path);

// Routing logic
if (isset($segments[0])) {
    switch ($segments[0]) {
        case 'oauth':
            require_once 'controllers/AuthController.php';
            $auth = new AuthController();
            if (isset($segments[1]) && $segments[1] === 'redirect') {
                $auth->redirect();
            } elseif (isset($segments[1]) && $segments[1] === 'callback') {
                $auth->callback();
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Not found']);
            }
            break;

        case 'players':
            require_once 'controllers/PlayerController.php';
            $playerCtrl = new PlayerController($pdo);
            if ($method === 'GET') {
                $playerCtrl->getPlayers();
            } elseif ($method === 'POST') {
                $playerCtrl->createPlayer();
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
            }
            break;

        case 'games':
            require_once 'controllers/GameController.php';
            $gameCtrl = new GameController($pdo);
            if ($method === 'GET') {
                $gameCtrl->getGames();
            } elseif ($method === 'POST') {
                $gameCtrl->createGame();
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
            }
            break;

        case 'game_types':
            require_once 'controllers/GameTypeController.php';
            $gameTypeCtrl = new GameTypeController($pdo);
            if ($method === 'GET') {
                $gameTypeCtrl->getGameTypes();
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
            }
            break;

        case 'scoreboard':
            require_once 'controllers/ScoreboardController.php';
            $scoreboardCtrl = new ScoreboardController($pdo);
            if ($method === 'GET') {
                $scoreboardCtrl->getScoreboard();
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
            }
            break;

        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
            break;
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'No endpoint specified']);
}
?>