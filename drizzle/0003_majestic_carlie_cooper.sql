ALTER TABLE `items` ADD `fastingRequirement` varchar(200);--> statement-breakpoint
ALTER TABLE `items` ADD `dietaryRestrictions` text;--> statement-breakpoint
ALTER TABLE `items` ADD `medicationNotes` text;--> statement-breakpoint
ALTER TABLE `items` ADD `positionRequirement` varchar(100);--> statement-breakpoint
ALTER TABLE `items` ADD `collectionSequence` varchar(200);--> statement-breakpoint
ALTER TABLE `items` ADD `collectionTiming` varchar(200);--> statement-breakpoint
ALTER TABLE `items` ADD `operationNotes` text;--> statement-breakpoint
ALTER TABLE `items` ADD `storageLimit` varchar(100);--> statement-breakpoint
ALTER TABLE `items` ADD `specialRequirements` text;--> statement-breakpoint
ALTER TABLE `items` ADD `rejectionDetails` json;