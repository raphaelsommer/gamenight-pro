<?php
require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

error_log('DB_HOST: ' . $_ENV['DB_HOST']);
error_log('DB_NAME: ' . $_ENV['DB_NAME']);
error_log('DB_USER: ' . $_ENV['DB_USER']);
error_log('DB_PASSWORD: ' . $_ENV['DB_PASSWORD']);
?>