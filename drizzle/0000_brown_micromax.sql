CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`storage` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`customer` text NOT NULL,
	`service` text NOT NULL,
	`date` text NOT NULL,
	`slot` text NOT NULL,
	`note` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `external_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`synced_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`request_key` text NOT NULL,
	`code` integer NOT NULL,
	`customer` text NOT NULL,
	`items` text NOT NULL,
	`subtotal` integer NOT NULL,
	`shipping` integer NOT NULL,
	`total` integer NOT NULL,
	`method` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_status` text DEFAULT 'unpaid' NOT NULL,
	`payment_url` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_request_key_unique` ON `orders` (`request_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_code_unique` ON `orders` (`code`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`price` integer NOT NULL,
	`original_price` integer NOT NULL,
	`stock` integer NOT NULL,
	`image` text NOT NULL,
	`description` text NOT NULL,
	`specs` text NOT NULL,
	`tag` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`external_id` text
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TRIGGER validate_order_stock BEFORE INSERT ON orders BEGIN
 SELECT CASE WHEN EXISTS (SELECT 1 FROM json_each(NEW.items) AS item LEFT JOIN products p ON p.id=json_extract(item.value,'$.id') WHERE p.id IS NULL OR p.active!=1 OR p.stock<json_extract(item.value,'$.quantity')) THEN RAISE(ABORT,'INSUFFICIENT_STOCK') END;
 SELECT CASE WHEN EXISTS (SELECT 1 FROM json_each(NEW.items) AS item JOIN products p ON p.id=json_extract(item.value,'$.id') WHERE p.price!=json_extract(item.value,'$.price')) THEN RAISE(ABORT,'PRICE_CHANGED') END;
END;
--> statement-breakpoint
CREATE TRIGGER reserve_order_stock AFTER INSERT ON orders BEGIN
 UPDATE products SET stock=stock-(SELECT json_extract(value,'$.quantity') FROM json_each(NEW.items) WHERE json_extract(value,'$.id')=products.id) WHERE id IN (SELECT json_extract(value,'$.id') FROM json_each(NEW.items));
END;
--> statement-breakpoint
CREATE TRIGGER restore_cancelled_stock AFTER UPDATE OF status ON orders WHEN NEW.status='cancelled' AND OLD.status!='cancelled' BEGIN
 UPDATE products SET stock=stock+(SELECT json_extract(value,'$.quantity') FROM json_each(OLD.items) WHERE json_extract(value,'$.id')=products.id) WHERE id IN (SELECT json_extract(value,'$.id') FROM json_each(OLD.items));
END;
