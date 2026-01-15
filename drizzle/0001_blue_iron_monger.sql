CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`itemId` varchar(32) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`importId` varchar(50) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`versionTarget` varchar(20) DEFAULT 'draft',
	`totalRows` int DEFAULT 0,
	`successRows` int DEFAULT 0,
	`failedRows` int DEFAULT 0,
	`warningRows` int DEFAULT 0,
	`conflictStrategy` enum('OVERWRITE_BY_ID','SKIP_BY_ID','ERROR_BY_ID') DEFAULT 'OVERWRITE_BY_ID',
	`errorSummary` json,
	`warningSummary` json,
	`failedDetailUrl` text,
	`operatorId` int,
	`operatorName` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `imports_id` PRIMARY KEY(`id`),
	CONSTRAINT `imports_importId_unique` UNIQUE(`importId`)
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemId` varchar(32) NOT NULL,
	`itemName` varchar(200) NOT NULL,
	`itemGroup` varchar(200),
	`specimenType` varchar(50) NOT NULL,
	`containerType` varchar(100),
	`tubeColor` varchar(20),
	`tubeAdditive` varchar(50),
	`recommendedVolume` varchar(50),
	`collectionRequirements` text,
	`reportTime` json,
	`needsConfirmation` boolean DEFAULT false,
	`alias` text,
	`enAbbr` varchar(100),
	`pinyinAbbr` varchar(100),
	`scenarioTags` json,
	`storageTemp` varchar(50),
	`transportLimit` varchar(100),
	`handlingSummary` text,
	`rejectionSummary` text,
	`prepSummary` text,
	`tubeImageUrls` json,
	`containerImageUrls` json,
	`frequencyScore` int DEFAULT 0,
	`isHighFreq` boolean DEFAULT false,
	`enabled` boolean NOT NULL DEFAULT true,
	`versionId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recentViews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`itemId` varchar(32) NOT NULL,
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recentViews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`versionCode` varchar(20) NOT NULL,
	`status` enum('draft','pending_review','published','archived') NOT NULL DEFAULT 'draft',
	`publisherId` int,
	`publisherName` varchar(100),
	`publishTime` timestamp,
	`addedCount` int DEFAULT 0,
	`updatedCount` int DEFAULT 0,
	`disabledCount` int DEFAULT 0,
	`changelog` text,
	`summary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `versions_id` PRIMARY KEY(`id`)
);
