DROP DATABASE IF EXISTS stock_portfolio;
CREATE DATABASE stock_portfolio;
USE stock_portfolio;


CREATE TABLE portfolios (
    portfolio_id INT AUTO_INCREMENT PRIMARY KEY,
    portfolio_name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE stocks (
    stock_id INT AUTO_INCREMENT PRIMARY KEY,
    stock_ticker VARCHAR(10) NOT NULL UNIQUE,   -- e.g. AAPL, AMZN
    stock_name VARCHAR(100) NOT NULL,           -- Apple Inc, Amazon
    sector VARCHAR(50),                        -- Optional (e.g. Tech, Finance)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    portfolio_id INT NOT NULL,
    stock_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,              -- Price per share in USD
    volume INT NOT NULL,                       -- Number of shares
    buy_or_sell ENUM('BUY','SELL') NOT NULL,     -- Transaction type
    status_code INT DEFAULT 0,                  -- 0=Pending, 1=Filled, 2=Rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(portfolio_id) ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES stocks(stock_id) ON DELETE CASCADE
);

INSERT INTO portfolios (portfolio_name, description) VALUES
('Tech Growth', 'Focused on technology companies'),
('Dividend Fund', 'Long-term dividend-paying stocks');


INSERT INTO stocks (stock_ticker, stock_name, sector) VALUES
('AAPL', 'Apple Inc.', 'Technology'),
('AMZN', 'Amazon.com, Inc.', 'E-Commerce'),
('C', 'Citigroup Inc.', 'Financials'),
('NFLX', 'Netflix, Inc.', 'Entertainment');


INSERT INTO orders (portfolio_id, stock_id, price, volume, buy_or_sell, status_code) VALUES
(1, 1, 185.50, 10, 'BUY', 1),   -- Buy Apple into Tech Growth
(1, 4, 390.00, 2, 'BUY', 0),    -- Buy Netflix into Tech Growth
(2, 2, 145.20, 5, 'SELL', 0),   -- Sell Amazon in Dividend Fund
(2, 3, 45.00, 20, 'BUY', 1);    -- Buy Citigroup in Dividend Fund
