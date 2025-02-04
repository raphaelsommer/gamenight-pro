-- Create table for game types
CREATE TABLE IF NOT EXISTS game_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    score_direction ENUM('higher', 'lower') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create table for game sessions
CREATE TABLE IF NOT EXISTS games (
    game_id INT AUTO_INCREMENT PRIMARY KEY,
    game_type_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    game_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_type_id) REFERENCES game_types(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create table for rounds within a game session
CREATE TABLE IF NOT EXISTS rounds (
    round_id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    round_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create table for teams
CREATE TABLE IF NOT EXISTS teams (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50) DEFAULT NULL,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create table for score transactions
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    round_id INT NOT NULL,
    team_id INT NOT NULL,
    points DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (round_id) REFERENCES rounds(round_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;