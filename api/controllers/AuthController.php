<?php
// controllers/AuthController.php

use League\OAuth2\Client\Provider\Google;

class AuthController {

    private $provider;

    public function __construct() {
        // Initialize Google OAuth2 Provider
        $this->provider = new Google([
            'clientId'     => OAUTH_GOOGLE_CLIENT_ID,
            'clientSecret' => OAUTH_GOOGLE_CLIENT_SECRET,
            'redirectUri'  => OAUTH_REDIRECT_URI,
        ]);
    }

    // In AuthController.php
    public function redirect() {
        // Clear any previous state
        unset($_SESSION['oauth2state']);

        // Generate the authorization URL and new state
        $authUrl = $this->provider->getAuthorizationUrl();
        $_SESSION['oauth2state'] = $this->provider->getState();

        // Optionally, you can also regenerate the session ID to prevent session fixation
        session_regenerate_id(true);

        header('Location: ' . $authUrl);
        exit;
    }

    public function callback() {
        // Validate state parameter
        if (empty($_GET['state']) || ($_GET['state'] !== $_SESSION['oauth2state'])) {
            unset($_SESSION['oauth2state']);
            http_response_code(400);
            echo json_encode(['error' => 'Invalid OAuth state']);
            exit;
        }

        try {
            $token = $this->provider->getAccessToken('authorization_code', [
                'code' => $_GET['code']
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to get access token']);
            exit;
        }

        try {
            $user = $this->provider->getResourceOwner($token);
            $userData = $user->toArray();
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to retrieve user details']);
            exit;
        }

        // Use global PDO ($pdo from db.php)
        // Check if user exists
        $stmt = $GLOBALS['pdo']->prepare("SELECT * FROM users WHERE oauth_provider = :provider AND oauth_provider_id = :provider_id");
        $stmt->execute([
            ':provider' => 'google',
            ':provider_id' => $userData['id']
        ]);
        $existingUser = $stmt->fetch();

        if ($existingUser) {
            $userId = $existingUser['user_id'];
        } else {
            // Create new user
            $stmt = $GLOBALS['pdo']->prepare("INSERT INTO users (oauth_provider, oauth_provider_id, created_at) VALUES (:provider, :provider_id, NOW())");
            $stmt->execute([
                ':provider' => 'google',
                ':provider_id' => $userData['id']
            ]);
            $userId = $GLOBALS['pdo']->lastInsertId();
        }

        // Set session for authentication (or issue a JWT if preferred)
        $_SESSION['user_id'] = $userId;

        // Redirect to frontend SPA
        header('Location: /scoreboard/');
        exit;
    }
}
?>