CREATE DATABASE IF NOT EXISTS crypto_investment;
USE crypto_investment;

CREATE TABLE cryptocurrencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE price_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crypto_id INT NOT NULL,
    price DECIMAL(18,8) NOT NULL,
    volume DECIMAL(18,8),
    percent_change_24h DECIMAL(6,2),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crypto_id) REFERENCES cryptocurrencies(id)
);
CREATE TABLE watchlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT 1,  -- varios usuarios
  symbol VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
