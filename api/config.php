<?php
// config.php

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', '');
define('DB_USER', '');
define('DB_PASS', '');

// OAuth configuration (example: Google)
define('OAUTH_GOOGLE_CLIENT_ID', 'your_google_client_id');
define('OAUTH_GOOGLE_CLIENT_SECRET', 'your_google_client_secret');
define('OAUTH_REDIRECT_URI', 'https://gamenight-pro.raphael-sommer.de/api/oauth/callback');

// Disable error display in production
ini_set('display_errors', 0);
error_reporting(E_ALL);
?>