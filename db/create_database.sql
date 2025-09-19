DROP DATABASE IF EXISTS stock_portfolio;
CREATE DATABASE stock_portfolio;
USE stock_portfolio;


CREATE TABLE portfolios (
    portfolio_id INT AUTO_INCREMENT PRIMARY KEY,
    portfolio_name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
	portfolio_type ENUM('Personal', 'Retirement', 'Speculative') DEFAULT 'Personal',
    risk_profile ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    initial_capital DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE stocks (
    stock_id INT AUTO_INCREMENT PRIMARY KEY,
    stock_ticker VARCHAR(10) NOT NULL UNIQUE,   -- e.g. AAPL, AMZN
    stock_name VARCHAR(100) NOT NULL,           -- Apple Inc, Amazon
    sector VARCHAR(50),
	market VARCHAR(20),
    currency VARCHAR(10) DEFAULT 'USD',         -- Currency symbol or code
    isin VARCHAR(12) UNIQUE,                    -- International Securities Identification Number
    cusip VARCHAR(9) UNIQUE,                -- 9-character alphanumeric code used in the U.S. and Canada to uniquely identify financial securities
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    portfolio_id INT NOT NULL,
    stock_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,              -- Price per share in USD
    volume INT NOT NULL,                       -- Number of shares
    buy_or_sell ENUM('BUY','SELL') NOT NULL,     -- Transaction type
	order_type ENUM('Market','Limit','Stop') DEFAULT 'Market',
    fees DECIMAL(10,2) DEFAULT 0.00,
    status_code INT DEFAULT 0,                  -- 0=Pending, 1=Filled, 2=Rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(portfolio_id) ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES stocks(stock_id) ON DELETE CASCADE
);

CREATE TABLE price_history (
    price_id INT AUTO_INCREMENT PRIMARY KEY,
    stock_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    recorded_at DATE NOT NULL,
    FOREIGN KEY (stock_id) REFERENCES stocks(stock_id) ON DELETE CASCADE
);


INSERT INTO portfolios (portfolio_name, description, portfolio_type, risk_profile, initial_capital)
VALUES
('Growth Fund', 'Aggressive stock picks for high return potential', 'Speculative', 'High', 50000.00),
('Retirement Plan', 'Long-term safe investments for retirement', 'Retirement', 'Low', 200000.00),
('Tech Focus', 'Focused on technology sector stocks', 'Personal', 'Medium', 75000.00),
('Dividend Income', 'Stable dividend-paying stocks', 'Personal', 'Low', 100000.00);



INSERT INTO stocks (stock_ticker, stock_name, sector, market, currency, isin, cusip)
VALUES
('AAPL', 'Apple Inc.', 'Technology', 'NASDAQ', 'USD', 'US0378331005', '037833100'),
('MSFT', 'Microsoft Corp.', 'Technology', 'NASDAQ', 'USD', 'US5949181045', '594918104'),
('AMZN', 'Amazon.com Inc.', 'Consumer Discretionary', 'NASDAQ', 'USD', 'US0231351067', '023135106'),
('TSLA', 'Tesla Inc.', 'Automotive', 'NASDAQ', 'USD', 'US88160R1014', '88160R101'),
('JPM', 'JPMorgan Chase & Co.', 'Financials', 'NYSE', 'USD', 'US46625H1005', '46625H100'),
('GOOGL', 'Alphabet Inc. Class A', 'Technology', 'NASDAQ', 'USD', 'US02079K3059', '02079K305'),
('XOM', 'Exxon Mobil Corp.', 'Energy', 'NYSE', 'USD', 'US30231G1022', '30231G102');



INSERT INTO orders (portfolio_id, stock_id, price, volume, buy_or_sell, order_type, fees, status_code)
VALUES
(1, 1, 150.25, 100, 'BUY', 'Market', 9.99, 1),      -- Growth Fund buys Apple
(1, 4, 720.50, 20, 'BUY', 'Limit', 7.50, 1),        -- Growth Fund buys Tesla
(2, 5, 135.00, 50, 'BUY', 'Market', 5.00, 1),       -- Retirement Plan buys JPM
(3, 2, 310.10, 30, 'BUY', 'Market', 8.00, 1),       -- Tech Focus buys Microsoft
(3, 6, 2800.00, 5, 'BUY', 'Limit', 10.00, 0),       -- Pending Alphabet order
(4, 7, 95.75, 200, 'BUY', 'Market', 12.50, 1),      -- Dividend Income buys Exxon
(1, 3, 3300.00, 2, 'SELL', 'Market', 6.00, 1);      -- Growth Fund sells Amazon

INSERT INTO price_history (stock_id, price, recorded_at)
VALUES
-- Apple (AAPL)
(1, 148.50, '2025-09-15'),
(1, 150.25, '2025-09-16'),
(1, 151.00, '2025-09-17'),

-- Tesla (TSLA)
(4, 710.00, '2025-09-15'),
(4, 715.75, '2025-09-16'),
(4, 720.50, '2025-09-17'),

-- JPMorgan (JPM)
(5, 134.00, '2025-09-15'),
(5, 135.00, '2025-09-16'),
(5, 136.50, '2025-09-17');


