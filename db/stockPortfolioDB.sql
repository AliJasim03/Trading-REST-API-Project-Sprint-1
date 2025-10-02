-- MySQL dump 10.13  Distrib 8.0.27, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: stock_portfolio
-- ------------------------------------------------------
-- Server version	9.0.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `portfolio_id` int NOT NULL,
  `stock_id` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `volume` int NOT NULL,
  `buy_or_sell` enum('BUY','SELL') NOT NULL,
  `order_type` enum('Market','Limit','Stop') DEFAULT 'Market',
  `fees` decimal(10,2) DEFAULT '0.00',
  `status_code` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `portfolio_id` (`portfolio_id`),
  KEY `stock_id` (`stock_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios` (`portfolio_id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`stock_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,1,150.25,100,'BUY','Market',9.99,1,'2025-09-19 08:38:37'),(2,1,4,720.50,20,'BUY','Limit',7.50,1,'2025-09-19 08:38:37'),(3,2,5,135.00,50,'BUY','Market',5.00,1,'2025-09-19 08:38:37'),(4,3,2,310.10,30,'BUY','Market',8.00,1,'2025-09-19 08:38:37'),(5,3,6,2800.00,5,'BUY','Limit',10.00,0,'2025-09-19 08:38:37'),(6,4,7,95.75,200,'BUY','Market',12.50,1,'2025-09-19 08:38:37'),(7,1,3,3300.00,2,'SELL','Market',6.00,1,'2025-09-19 08:38:37');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `portfolios`
--

DROP TABLE IF EXISTS `portfolios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `portfolios` (
  `portfolio_id` int NOT NULL AUTO_INCREMENT,
  `portfolio_name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `portfolio_type` enum('Personal','Retirement','Speculative') DEFAULT 'Personal',
  `risk_profile` enum('Low','Medium','High') DEFAULT 'Medium',
  `initial_capital` decimal(15,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`portfolio_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `portfolios`
--

LOCK TABLES `portfolios` WRITE;
/*!40000 ALTER TABLE `portfolios` DISABLE KEYS */;
INSERT INTO `portfolios` VALUES (1,'Growth Fund','Aggressive stock picks for high return potential','Speculative','High',50000.00,'2025-09-19 08:38:37'),(2,'Retirement Plan','Long-term safe investments for retirement','Retirement','Low',200000.00,'2025-09-19 08:38:37'),(3,'Tech Focus','Focused on technology sector stocks','Personal','Medium',75000.00,'2025-09-19 08:38:37'),(4,'Dividend Income','Stable dividend-paying stocks','Personal','Low',100000.00,'2025-09-19 08:38:37');
/*!40000 ALTER TABLE `portfolios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `price_history`
--

DROP TABLE IF EXISTS `price_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `price_history` (
  `price_id` int NOT NULL AUTO_INCREMENT,
  `stock_id` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `recorded_at` date NOT NULL,
  PRIMARY KEY (`price_id`),
  KEY `stock_id` (`stock_id`),
  CONSTRAINT `price_history_ibfk_1` FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`stock_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_history`
--

LOCK TABLES `price_history` WRITE;
/*!40000 ALTER TABLE `price_history` DISABLE KEYS */;
INSERT INTO `price_history` VALUES (1,1,148.50,'2025-09-15'),(2,1,150.25,'2025-09-16'),(3,1,151.00,'2025-09-17'),(4,4,710.00,'2025-09-15'),(5,4,715.75,'2025-09-16'),(6,4,720.50,'2025-09-17'),(7,5,134.00,'2025-09-15'),(8,5,135.00,'2025-09-16'),(9,5,136.50,'2025-09-17');
/*!40000 ALTER TABLE `price_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stocks`
--

DROP TABLE IF EXISTS `stocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stocks` (
  `stock_id` int NOT NULL AUTO_INCREMENT,
  `stock_ticker` varchar(10) NOT NULL,
  `stock_name` varchar(100) NOT NULL,
  `sector` varchar(50) DEFAULT NULL,
  `market` varchar(20) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'USD',
  `isin` varchar(12) DEFAULT NULL,
  `cusip` varchar(9) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`stock_id`),
  UNIQUE KEY `stock_ticker` (`stock_ticker`),
  UNIQUE KEY `isin` (`isin`),
  UNIQUE KEY `cusip` (`cusip`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stocks`
--

LOCK TABLES `stocks` WRITE;
/*!40000 ALTER TABLE `stocks` DISABLE KEYS */;
INSERT INTO `stocks` VALUES (1,'AAPL','Apple Inc.','Technology','NASDAQ','USD','US0378331005','037833100','2025-09-19 08:38:37'),(2,'MSFT','Microsoft Corp.','Technology','NASDAQ','USD','US5949181045','594918104','2025-09-19 08:38:37'),(3,'AMZN','Amazon.com Inc.','Consumer Discretionary','NASDAQ','USD','US0231351067','023135106','2025-09-19 08:38:37'),(4,'TSLA','Tesla Inc.','Automotive','NASDAQ','USD','US88160R1014','88160R101','2025-09-19 08:38:37'),(5,'JPM','JPMorgan Chase & Co.','Financials','NYSE','USD','US46625H1005','46625H100','2025-09-19 08:38:37'),(6,'GOOGL','Alphabet Inc. Class A','Technology','NASDAQ','USD','US02079K3059','02079K305','2025-09-19 08:38:37'),(7,'XOM','Exxon Mobil Corp.','Energy','NYSE','USD','US30231G1022','30231G102','2025-09-19 08:38:37');
                          
/*!40000 ALTER TABLE `stocks` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-19 11:40:35
