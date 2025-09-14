-- db/create_database.sql

DROP DATABASE IF EXISTS trading_sprint1;
CREATE DATABASE trading_sprint1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE trading_sprint1;

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stockTicker VARCHAR(16) NOT NULL,
  price DECIMAL(14,4) NOT NULL,
  volume INT NOT NULL,
  buyOrSell ENUM('BUY','SELL') NOT NULL,
  statusCode TINYINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Some dummy data
INSERT INTO orders (stockTicker, price, volume, buyOrSell, statusCode) VALUES
('AAPL', 174.2500, 10, 'BUY', 0),
('AMZN', 160.5000, 2,  'SELL', 0),
('TSLA', 210.0000, 5,  'BUY', 0),
('NFLX', 415.3000, 1,  'SELL', 0),
('GOOGL', 125.7500, 3, 'BUY', 0),
('MSFT', 290.1000, 4, 'SELL', 0),
('FB', 330.2000, 6, 'BUY', 0),
('NVDA', 195.6000, 8, 'SELL', 0),
('BABA', 105.4000, 7, 'BUY', 0),
('ORCL', 85.9000, 9, 'SELL', 0),
('INTC', 52.3000, 12, 'BUY', 0),
('CSCO', 48.7500, 15, 'SELL', 0),
('ADBE', 620.5000, 2, 'BUY', 0),
('CRM', 250.4000, 3, 'SELL', 0),
('PYPL', 75.2000, 11, 'BUY', 0),
('UBER', 45.6000, 14, 'SELL', 0),
('LYFT', 55.3000, 13, 'BUY', 0),
('SQ', 240.7000, 1, 'SELL', 0),
('TWTR', 65.8000, 4, 'BUY', 0),
('SNAP', 70.9000, 5, 'SELL', 0);

