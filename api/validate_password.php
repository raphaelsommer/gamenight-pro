<?php
// Enable error reporting (for development only)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__) . '/../');
$dotenv->load();

// Read and decode JSON input
$input = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

if (!isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Password not provided']);
    exit;
}

$providedPassword = $input['password'];
// You can use an environment variable for the expected password if desired.
$expectedPassword = trim($_ENV['SECRET_KEY']); // Replace with your actual password

if ($providedPassword === $expectedPassword) {
    echo json_encode(['valid' => true]);
} else {
    echo json_encode(['valid' => false]);
}
?>