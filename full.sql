-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: e_commerce
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('9cafcb61-fcdc-4b82-9fbe-b869b6fba2f6','99900bebf555622eb52fc188ec5f61ba436f9301ff08d37579a3d65b2c9131c8','2025-06-28 06:16:06.532','20250628061606_add_author_id_to_review',NULL,NULL,'2025-06-28 06:16:06.427',1),('bac59b4c-439f-4294-afb8-38bd0077770a','82a67f19346fd209bd18ec1e6f48cfb9a5893c5cdbb08b672ff4a13f4006538f','2025-06-28 20:15:35.366','20250628201534_change_cartitem_structure',NULL,NULL,'2025-06-28 20:15:34.916',1),('c21b05eb-aadf-40b9-a2f1-d677b07567c3','5091dc49b0cc3f4928ac942a3a7c792cf5f9cae588dbde3425107fa705f105e1','2025-05-08 05:37:46.607','20250508053745_add_favorites_table',NULL,NULL,'2025-05-08 05:37:45.825',1),('f3337280-a626-43b6-ab87-eae9013bd52a','36cc6266461a6ead798001df82cbaf40bcd91dde1946bd23c9c6aba63378b1e5','2025-05-10 02:09:06.991','20250510020906_',NULL,NULL,'2025-05-10 02:09:06.817',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cartitem`
--

DROP TABLE IF EXISTS `cartitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cartitem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `customizationDetails` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `giftWrap` tinyint(1) NOT NULL DEFAULT '0',
  `productId` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CartItem_userId_productId_key` (`userId`,`productId`),
  KEY `CartItem_userId_idx` (`userId`),
  KEY `CartItem_productId_idx` (`productId`),
  CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `CartItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cartitem`
--

LOCK TABLES `cartitem` WRITE;
/*!40000 ALTER TABLE `cartitem` DISABLE KEYS */;
/*!40000 ALTER TABLE `cartitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorite`
--

DROP TABLE IF EXISTS `favorite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorite` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `productId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Favorite_userId_productId_key` (`userId`,`productId`),
  KEY `Favorite_productId_idx` (`productId`),
  KEY `Favorite_userId_idx` (`userId`),
  CONSTRAINT `Favorite_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Favorite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorite`
--

LOCK TABLES `favorite` WRITE;
/*!40000 ALTER TABLE `favorite` DISABLE KEYS */;
INSERT INTO `favorite` VALUES (2,1,2,'2025-05-09 21:26:13.807'),(3,1,3,'2025-05-09 21:38:15.542'),(5,1,11,'2025-05-09 21:56:57.399'),(31,3,1,'2025-05-31 16:32:51.892'),(35,3,3,'2025-05-31 16:46:36.255'),(37,3,91,'2025-06-28 19:34:33.798'),(39,3,4,'2025-06-30 18:12:32.139'),(41,3,6,'2025-07-02 00:34:26.328');
/*!40000 ALTER TABLE `favorite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `giftWrapTotal` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `shippingAddress` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `billingAddress` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `billingEmail` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentMethod` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Order_userId_idx` (`userId`),
  CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES ('ORD-1746817849712-60FKFD',1,10937.91,40.00,10977.91,'Processing','2025-05-09 19:10:49.713','Torre Tagle','Torre Tagle','osoriokalef00@gmail.com','card','2025-05-09 19:10:49.728','2025-05-09 19:10:49.728'),('ORD-1746841213912-2LEJE1',1,4500.00,20.00,4520.00,'Processing','2025-05-10 01:40:13.912','Torre Tagle','Torre Tagle','osoriokalef00@gmail.com','paypal','2025-05-10 01:40:13.923','2025-05-10 01:40:13.923'),('ORD-1747497732069-HTIDXQ',3,3650.00,0.00,3650.00,'Processing','2025-05-17 16:02:12.069','Torre Tagle','Torre Tagle','osoriokalef01@gmail.com','paypal','2025-05-17 16:02:12.083','2025-05-17 16:02:12.083'),('ORD-1748203613743-7U5SQK',1,3730.00,0.00,3730.00,'Processing','2025-05-25 20:06:53.743','Torre Tagle7','Torre Tagle','osoriokalef@gmail.com','card','2025-05-25 20:06:53.764','2025-05-25 20:06:53.764'),('ORD-1748203888210-DDNPWY',1,1280.00,0.00,1280.00,'Shipped','2025-05-25 20:11:28.210','Torre Tagle7','Torre Tagle7','osoriokalef00@gmail.com','paypal','2025-05-25 20:11:28.219','2025-05-29 17:14:11.970'),('ORD-1748204184153-G093T0',1,1250.00,0.00,1250.00,'Shipped','2025-05-25 20:16:24.153','Torre Tagle7','Torre Tagle7','osoriokalef00@gmail.com','yape','2025-05-25 20:16:24.163','2025-05-29 17:14:00.802'),('ORD-1748533000327-X8V5VN',5,2550.00,10.00,2560.00,'Delivered','2025-05-29 15:36:40.327','Jr. Lima 233','Jr. Lima 233','erick_dani@gmail.com','card','2025-05-29 15:36:40.344','2025-05-29 17:14:11.800');
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderitem`
--

DROP TABLE IF EXISTS `orderitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderitem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` int DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `customizationDetails` json DEFAULT NULL,
  `giftWrap` tinyint(1) DEFAULT NULL,
  `image` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `OrderItem_orderId_idx` (`orderId`),
  KEY `OrderItem_productId_idx` (`productId`),
  CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderitem`
--

LOCK TABLES `orderitem` WRITE;
/*!40000 ALTER TABLE `orderitem` DISABLE KEYS */;
INSERT INTO `orderitem` VALUES (1,'ORD-1746817849712-60FKFD',3,'Zen All-in-One PC',2,899.00,'null',0,'https://media.falabella.com/falabellaPE/133317310_01/w=800,h=800,fit=pad'),(2,'ORD-1746817849712-60FKFD',2,'Office Pro Desktop',5,649.99,'null',0,'https://pcya.pe/wp-content/uploads/2024/01/PCRYZENMONI27.png'),(3,'ORD-1746817849712-60FKFD',1,'Gaming Laptop Pro (Customized)',4,1472.49,'{\"os\": \"Linux (Ubuntu)\", \"ram\": 8, \"ssd\": \"1TB NVMe\", \"processor\": \"Intel Core i7\"}',1,'https://media.falabella.com/falabellaPE/883458202_001/w=1500,h=1500,fit=pad'),(4,'ORD-1746841213912-2LEJE1',14,'PC Modelo 3',1,2100.00,'null',0,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad'),(5,'ORD-1746841213912-2LEJE1',2,'Laptop Modelo 1',2,1200.00,'null',1,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad'),(6,'ORD-1747497732069-HTIDXQ',3,'Laptop Modelo 2',1,1250.00,'null',0,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad'),(7,'ORD-1747497732069-HTIDXQ',2,'Laptop Modelo 1',2,1200.00,'null',0,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad'),(8,'ORD-1748203613743-7U5SQK',2,'Laptop Modelo 1',1,1200.00,'null',0,'https://media.falabella.com/falabellaPE/883163886_001/w=1500,h=1500,fit=pad'),(9,'ORD-1748203613743-7U5SQK',3,'Laptop Modelo 2',1,1250.00,'null',0,'https://media.falabella.com/falabellaPE/20142556_01/w=800,h=800,fit=pad'),(10,'ORD-1748203613743-7U5SQK',11,'Laptop Modelo 10',1,1280.00,'null',0,'https://media.falabella.com/falabellaPE/136612085_01/w=1500,h=1500,fit=pad'),(11,'ORD-1748203888210-DDNPWY',11,'Laptop Modelo 10',1,1280.00,'null',0,'https://media.falabella.com/falabellaPE/136612085_01/w=1500,h=1500,fit=pad'),(12,'ORD-1748204184153-G093T0',10,'Laptop Modelo 9',1,1250.00,'null',0,'https://media.falabella.com/falabellaPE/131880615_01/w=1500,h=1500,fit=pad'),(13,'ORD-1748533000327-X8V5VN',4,'Laptop Modelo 3',1,1300.00,'null',0,'https://media.falabella.com/falabellaPE/883237776_001/w=1500,h=1500,fit=pad'),(14,'ORD-1748533000327-X8V5VN',3,'Laptop Modelo 2',1,1250.00,'null',1,'https://media.falabella.com/falabellaPE/20142556_01/w=800,h=800,fit=pad');
/*!40000 ALTER TABLE `orderitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `image` text COLLATE utf8mb4_unicode_ci,
  `additionalImages` json DEFAULT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `customizable` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `baseSpecs` json DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'Gaming Laptop Pro','High-performance gaming laptop with RGB keyboard.',1499.99,'https://media.falabella.com/falabellaPE/137222099_01/w=1500,h=1500,fit=pad','[]','Laptops',6,'computer','{\"ram\": \"16GB\", \"storage\": \"512GB SSD\", \"processor\": \"Intel i7\"}',3.67,'2025-05-08 05:52:42.026','2025-05-10 05:12:38.781'),(2,'Laptop Modelo 1','Descripción de Laptop 1',1200.00,'https://media.falabella.com/falabellaPE/883163886_001/w=1500,h=1500,fit=pad',NULL,'Laptops',0,'',NULL,4.50,'2025-05-08 02:37:48.158','2025-05-25 20:06:53.877'),(3,'Laptop Modelo 2','Descripción de Laptop 2',1250.00,'https://media.falabella.com/falabellaPE/20142556_01/w=800,h=800,fit=pad',NULL,'Laptops',7,'',NULL,4.20,'2025-05-08 02:37:48.158','2025-05-29 15:36:40.378'),(4,'Laptop Modelo 3','Descripción de Laptop 3',1300.00,'https://media.falabella.com/falabellaPE/883237776_001/w=1500,h=1500,fit=pad',NULL,'Laptops',14,'',NULL,4.70,'2025-05-08 02:37:48.158','2025-05-29 15:36:40.367'),(5,'Laptop Modelo 4','Descripción de Laptop 4',1100.00,'https://media.falabella.com/falabellaPE/883458202_001/w=1500,h=1500,fit=pad',NULL,'Laptops',20,'',NULL,4.30,'2025-05-08 02:37:48.158','2025-05-08 02:37:48.158'),(6,'Laptop Modelo 5','Descripción de Laptop 5',1150.00,'https://media.falabella.com/falabellaPE/883406989_01/w=1500,h=1500,fit=pad',NULL,'Laptops',9,'',NULL,4.00,'2025-05-08 02:37:48.158','2025-05-08 02:37:48.158'),(7,'Laptop Modelo 6','Descripción de Laptop 6',1350.00,'https://media.falabella.com/falabellaPE/141024602_01/w=1500,h=1500,fit=pad',NULL,'Laptops',11,'',NULL,4.60,'2025-05-08 02:37:48.158','2025-05-08 02:37:48.158'),(8,'Laptop Modelo 7','Descripción de Laptop 7',1400.00,'https://media.falabella.com/falabellaPE/140604546_01/w=1500,h=1500,fit=pad',NULL,'Laptops',8,'',NULL,4.80,'2025-05-08 02:37:48.158','2025-05-08 02:37:48.158'),(9,'Laptop Modelo 8','Descripción de Laptop 8',1000.00,'https://media.falabella.com/falabellaPE/142679516_01/w=1500,h=1500,fit=pad',NULL,'Laptops',7,'',NULL,3.90,'2025-05-08 02:37:48.158','2025-05-08 02:37:48.158'),(10,'Laptop Modelo 9','Descripción de Laptop 9',1250.00,'https://media.falabella.com/falabellaPE/131880615_01/w=1500,h=1500,fit=pad',NULL,'Laptops',5,'',NULL,4.10,'2025-05-08 02:37:48.158','2025-05-25 20:16:24.176'),(11,'Laptop Modelo 10','Descripción de Laptop 10',1280.00,'https://media.falabella.com/falabellaPE/136612085_01/w=1500,h=1500,fit=pad',NULL,'Laptops',12,'',NULL,4.40,'2025-05-08 02:37:48.158','2025-05-25 20:11:28.232'),(12,'PC Modelo 1','Descripción de PC 1',2000.00,'https://media.falabella.com/falabellaPE/116459749_01/w=1500,h=1500,fit=pad',NULL,'PC',10,'',NULL,4.10,'2025-05-08 02:37:48.158','2025-05-08 02:37:48.158'),(13,'PC Modelo 2','Descripción de PC 2',1900.00,'https://media.falabella.com/falabellaPE/129720434_01/w=1500,h=1500,fit=pad',NULL,'PC',9,'',NULL,4.00,'2025-05-08 02:37:48.158','2025-05-08 02:37:48.158'),(14,'PC Modelo 3','Descripción de PC 3',2100.00,'https://media.falabella.com/falabellaPE/129730979_01/w=1500,h=1500,fit=pad',NULL,'PC',12,'',NULL,4.30,'2025-05-08 02:37:48.158','2025-05-10 01:40:13.945'),(15,'PC Modelo 4','Descripción de PC 4',1950.00,'https://media.falabella.com/falabellaPE/130392820_01/w=1500,h=1500,fit=pad',NULL,'PC',14,'',NULL,4.50,'2025-05-08 02:37:48.158','2025-05-08 02:37:48.158'),(16,'PC Modelo 5','Descripción de PC 5',1800.00,'https://media.falabella.com/falabellaPE/126097407_01/w=1500,h=1500,fit=pad',NULL,'PC',8,'',NULL,3.90,'2025-05-08 02:37:48.158','2025-05-08 02:37:48.158'),(17,'PC Modelo 6','Descripción de PC 6',1850.00,'https://media.falabella.com/falabellaPE/129241396_1/w=1500,h=1500,fit=pad',NULL,'PC',12,'',NULL,4.20,'2025-05-08 02:37:48.158','2025-05-08 02:37:48.158'),(18,'PC Modelo 7','Descripción de PC 7',2200.00,'https://media.falabella.com/falabellaPE/114488225_01/w=1500,h=1500,fit=pad',NULL,'PC',11,'',NULL,4.60,'2025-05-08 02:37:48.158','2025-05-08 02:37:48.158'),(19,'PC Modelo 8','Descripción de PC 8',2250.00,'https://media.falabella.com/falabellaPE/133705038_01/w=1500,h=1500,fit=pad',NULL,'PC',10,'',NULL,4.70,'2025-05-08 02:37:48.158','2025-05-08 02:37:48.158'),(20,'PC Modelo 9','Descripción de PC 9',2150.00,'https://media.falabella.com/falabellaPE/128471138_01/w=1500,h=1500,fit=pad',NULL,'PC',6,'',NULL,4.40,'2025-05-08 02:37:48.158','2025-05-08 02:37:48.158'),(21,'PC Modelo 10','Descripción de PC 10',2300.00,'https://media.falabella.com/falabellaPE/137036856_01/w=1500,h=1500,fit=pad',NULL,'PC',7,'',NULL,4.80,'2025-05-08 02:37:48.158','2025-05-08 02:37:48.158'),(22,'Laptop Modelo 1','Descripción de Laptop 1',1200.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Laptops',10,'',NULL,4.50,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(23,'Laptop Modelo 2','Descripción de Laptop 2',1250.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Laptops',12,'',NULL,4.20,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(24,'Laptop Modelo 3','Descripción de Laptop 3',1300.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Laptops',15,'',NULL,4.70,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(25,'Laptop Modelo 4','Descripción de Laptop 4',1100.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Laptops',20,'',NULL,4.30,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(26,'Laptop Modelo 5','Descripción de Laptop 5',1150.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Laptops',9,'',NULL,4.00,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(27,'Laptop Modelo 6','Descripción de Laptop 6',1350.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Laptops',11,'',NULL,4.60,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(28,'Laptop Modelo 7','Descripción de Laptop 7',1400.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Laptops',8,'',NULL,4.80,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(29,'Laptop Modelo 8','Descripción de Laptop 8',1000.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Laptops',7,'',NULL,3.90,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(30,'Laptop Modelo 9','Descripción de Laptop 9',1250.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Laptops',6,'',NULL,4.10,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(31,'Laptop Modelo 10','Descripción de Laptop 10',1280.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Laptops',14,'',NULL,4.40,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(32,'PC Modelo 1','Descripción de PC 1',2000.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'PC',10,'',NULL,4.10,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(33,'PC Modelo 2','Descripción de PC 2',1900.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'PC',9,'',NULL,4.00,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(34,'PC Modelo 3','Descripción de PC 3',2100.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'PC',13,'',NULL,4.30,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(35,'PC Modelo 4','Descripción de PC 4',1950.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'PC',14,'',NULL,4.50,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(36,'PC Modelo 5','Descripción de PC 5',1800.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'PC',8,'',NULL,3.90,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(37,'PC Modelo 6','Descripción de PC 6',1850.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'PC',12,'',NULL,4.20,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(38,'PC Modelo 7','Descripción de PC 7',2200.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'PC',11,'',NULL,4.60,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(39,'PC Modelo 8','Descripción de PC 8',2250.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'PC',10,'',NULL,4.70,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(40,'PC Modelo 9','Descripción de PC 9',2150.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'PC',6,'',NULL,4.40,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(41,'PC Modelo 10','Descripción de PC 10',2300.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'PC',7,'',NULL,4.80,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(42,'Drone Modelo 1','Descripción de Drone 1',850.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Drone',10,'',NULL,4.20,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(43,'Drone Modelo 2','Descripción de Drone 2',890.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Drone',11,'',NULL,4.00,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(44,'Drone Modelo 3','Descripción de Drone 3',900.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Drone',8,'',NULL,4.40,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(45,'Drone Modelo 4','Descripción de Drone 4',950.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Drone',9,'',NULL,4.50,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(46,'Drone Modelo 5','Descripción de Drone 5',870.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Drone',6,'',NULL,4.10,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(47,'Drone Modelo 6','Descripción de Drone 6',920.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Drone',7,'',NULL,4.30,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(48,'Drone Modelo 7','Descripción de Drone 7',980.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Drone',5,'',NULL,3.90,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(49,'Drone Modelo 8','Descripción de Drone 8',990.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Drone',10,'',NULL,4.70,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(50,'Drone Modelo 9','Descripción de Drone 9',930.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Drone',12,'',NULL,4.00,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(51,'Drone Modelo 10','Descripción de Drone 10',960.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Drone',11,'',NULL,4.60,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(52,'Audifono Modelo 1','Descripción de Audifono 1',120.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Audifono',20,'',NULL,4.10,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(53,'Audifono Modelo 2','Descripción de Audifono 2',110.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Audifono',18,'',NULL,4.00,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(54,'Audifono Modelo 3','Descripción de Audifono 3',115.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Audifono',16,'',NULL,4.20,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(55,'Audifono Modelo 4','Descripción de Audifono 4',130.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Audifono',14,'',NULL,4.30,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(56,'Audifono Modelo 5','Descripción de Audifono 5',125.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Audifono',19,'',NULL,4.40,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(57,'Audifono Modelo 6','Descripción de Audifono 6',140.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Audifono',10,'',NULL,4.50,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(58,'Audifono Modelo 7','Descripción de Audifono 7',135.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Audifono',8,'',NULL,4.60,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(59,'Audifono Modelo 8','Descripción de Audifono 8',100.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Audifono',13,'',NULL,3.90,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(60,'Audifono Modelo 9','Descripción de Audifono 9',105.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Audifono',11,'',NULL,4.00,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(61,'Audifono Modelo 10','Descripción de Audifono 10',150.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Audifono',15,'',NULL,4.70,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(62,'Mouse Modelo 1','Descripción de Mouse 1',45.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Mouse',20,'',NULL,4.00,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(63,'Mouse Modelo 2','Descripción de Mouse 2',50.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Mouse',22,'',NULL,3.90,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(64,'Mouse Modelo 3','Descripción de Mouse 3',60.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Mouse',18,'',NULL,4.10,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(65,'Mouse Modelo 4','Descripción de Mouse 4',55.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Mouse',17,'',NULL,4.20,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(66,'Mouse Modelo 5','Descripción de Mouse 5',52.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Mouse',16,'',NULL,4.30,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(67,'Mouse Modelo 6','Descripción de Mouse 6',48.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Mouse',21,'',NULL,4.40,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(68,'Mouse Modelo 7','Descripción de Mouse 7',58.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Mouse',15,'',NULL,4.50,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(69,'Mouse Modelo 8','Descripción de Mouse 8',62.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Mouse',13,'',NULL,4.60,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(70,'Mouse Modelo 9','Descripción de Mouse 9',47.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Mouse',19,'',NULL,4.00,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(71,'Mouse Modelo 10','Descripción de Mouse 10',53.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Mouse',14,'',NULL,4.10,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(72,'CPU Modelo 1','Descripción de CPU 1',750.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'CPU',12,'',NULL,4.30,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(73,'CPU Modelo 2','Descripción de CPU 2',800.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'CPU',10,'',NULL,4.10,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(74,'CPU Modelo 3','Descripción de CPU 3',780.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'CPU',14,'',NULL,4.50,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(75,'CPU Modelo 4','Descripción de CPU 4',770.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'CPU',9,'',NULL,4.20,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(76,'CPU Modelo 5','Descripción de CPU 5',760.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'CPU',11,'',NULL,4.00,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(77,'CPU Modelo 6','Descripción de CPU 6',820.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'CPU',8,'',NULL,4.60,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(78,'CPU Modelo 7','Descripción de CPU 7',740.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'CPU',13,'',NULL,4.30,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(79,'CPU Modelo 8','Descripción de CPU 8',730.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'CPU',15,'',NULL,4.20,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(80,'CPU Modelo 9','Descripción de CPU 9',790.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'CPU',16,'',NULL,4.40,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(81,'CPU Modelo 10','Descripción de CPU 10',810.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'CPU',7,'',NULL,4.10,'2025-05-08 02:38:58.028','2025-05-08 02:38:58.028'),(82,'Camara Modelo 1','Descripción de Camara 1',450.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Camara',10,'',NULL,4.20,'2025-05-08 02:44:33.267','2025-05-08 02:44:33.267'),(83,'Camara Modelo 2','Descripción de Camara 2',480.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Camara',12,'',NULL,4.10,'2025-05-08 02:44:33.267','2025-05-08 02:44:33.267'),(84,'Nikon 18-55mm','Descripción de Camara 3',470.00,'https://media.falabella.com/falabellaPE/123288662_01/w=1500,h=1500,fit=pad',NULL,'Camara',14,'camera',NULL,4.30,'2025-05-08 02:44:33.267','2025-05-08 02:44:33.267'),(85,'Camara Modelo 4','Descripción de Camara 4',500.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Camara',15,'',NULL,4.40,'2025-05-08 02:44:33.267','2025-05-08 02:44:33.267'),(86,'Camara Modelo 5','Descripción de Camara 5',510.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Camara',11,'',NULL,4.00,'2025-05-08 02:44:33.267','2025-05-08 02:44:33.267'),(87,'Camara Modelo 6','Descripción de Camara 6',530.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Camara',13,'',NULL,4.60,'2025-05-08 02:44:33.267','2025-05-08 02:44:33.267'),(88,'Camara Modelo 7','Descripción de Camara 7',460.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Camara',9,'',NULL,4.10,'2025-05-08 02:44:33.267','2025-05-08 02:44:33.267'),(89,'Camara Modelo 8','Descripción de Camara 8',520.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Camara',10,'',NULL,4.30,'2025-05-08 02:44:33.267','2025-05-08 02:44:33.267'),(90,'Camara Modelo 9','Descripción de Camara 9',490.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Camara',16,'',NULL,4.50,'2025-05-08 02:44:33.267','2025-05-08 02:44:33.267'),(91,'Camara Modelo 10','Descripción de Camara 10',550.00,'https://media.falabella.com/falabellaPE/883407019_001/w=1500,h=1500,fit=pad',NULL,'Camara',8,'',NULL,4.20,'2025-05-08 02:44:33.267','2025-05-08 02:44:33.267'),(92,'Gaming Laptop Pro','High-performance gaming laptop with RGB keyboard.',1499.99,'https://media.falabella.com/falabellaPE/137222099_01/w=1500,h=1500,fit=pad','[]','Laptops',26,'computer','{\"ram\": \"16GB\", \"storage\": \"512GB SSD\", \"processor\": \"Intel i7\"}',3.67,'2025-06-28 18:39:04.492','2025-06-28 18:43:20.477');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review`
--

DROP TABLE IF EXISTS `review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `author` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` tinyint NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `date` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `authorId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Review_productId_idx` (`productId`),
  CONSTRAINT `Review_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review`
--

LOCK TABLES `review` WRITE;
/*!40000 ALTER TABLE `review` DISABLE KEYS */;
INSERT INTO `review` VALUES (1,1,'OsorioJc-01',4,'asd','2025-05-10 05:12:24.275','2025-05-10 05:12:24.278','2025-05-10 05:12:24.278',NULL),(2,1,'OsorioJc-01',4,'kujyhtbgrvfe','2025-05-10 05:12:31.246','2025-05-10 05:12:31.250','2025-05-10 05:12:31.250',NULL),(3,1,'OsorioJc-01',3,'asdvfsd','2025-05-10 05:12:38.769','2025-05-10 05:12:38.771','2025-05-10 05:12:38.771',NULL);
/*!40000 ALTER TABLE `review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dni` varchar(8) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `firstName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lastName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phoneNumber` varchar(9) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photoUrl` text COLLATE utf8mb4_unicode_ci,
  `isAdmin` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_username_key` (`username`),
  UNIQUE KEY `User_email_key` (`email`),
  UNIQUE KEY `User_dni_key` (`dni`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'OsorioJc-07','osoriokalef00@gmail.com','$2b$10$dl.QaxIZXUVtvMQT/WdMiu/rOFJdC09fyqN7C9Pa/UhY.l4LTHAzW','70669937','Kalef7','Osorio7','997443117','Torre Tagle7',NULL,1,'2025-05-09 19:07:39.908','2025-05-23 15:56:42.377'),(2,'OsorioJc-02','osoriokalef02@gmail.com','$2b$10$2FLtx1poe0WDK1lrICJMsuhpal2UJ3FRJC8ANjQaz63gE7IRaFmpu',NULL,NULL,NULL,NULL,NULL,NULL,0,'2025-05-10 13:05:59.872','2025-05-10 13:05:59.872'),(3,'Username_03','osoriokalef01@gmail.com','$2b$10$Tl7giVmC8DYmdAjl/tvPqeqnL7iOM0jNA8sjacL92z1v5dH4Cs65m','70669935','Kalef 0we','Osorio','997443113','Torre Tagle',NULL,0,'2025-05-10 13:16:58.530','2025-05-17 16:33:53.835'),(4,'Lizbeth O C','lizbeth00@gmail.com','$2b$10$pWKRryyNKFI0/HrorjBup.1vr8Pk75DMV2tgJA8H7UBj2D1nWfVpW',NULL,NULL,NULL,NULL,NULL,NULL,0,'2025-05-15 02:11:39.031','2025-05-15 02:11:39.031'),(5,'Erik Danis','erick_dani@gmail.com','$2b$10$Sf/dqayw.XsXxMAtTwq45eaubP6i7nDsYlIz65srZ1s6p8rdqWwwy','77889922','Erick Daniel','Lopez Bravo','997443113','Jr. Lima 233',NULL,0,'2025-05-29 15:12:37.764','2025-05-29 16:26:30.071'),(6,'kalef','kalef@example.com','$2b$10$5gqxLr3sG4WCReS7pD74YemzPsdSOeWPYMc6HoZOQ.ZzMk1ABnuPy','12345678','Kalef','Osorio','987654321','Lima, Perú','',0,'2025-06-28 04:20:50.490','2025-06-28 04:20:50.490');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-01 22:14:13
