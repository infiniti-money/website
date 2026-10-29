import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  original_price: integer("original_price").notNull(),
  stock: integer("stock").notNull(),
  image: text("image").notNull(),
  description: text("description").notNull(),
  specs: text("specs").notNull(),
  tag: text("tag").notNull(),
  active: integer("active").notNull().default(1),
  external_id: text("external_id"),
});
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  request_key: text("request_key").notNull().unique(),
  code: integer("code").notNull().unique(),
  customer: text("customer").notNull(),
  items: text("items").notNull(),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull(),
  total: integer("total").notNull(),
  method: text("method").notNull(),
  status: text("status").notNull().default("pending"),
  payment_status: text("payment_status").notNull().default("unpaid"),
  payment_url: text("payment_url"),
  payment_details: text("payment_details").notNull().default("{}"),
  created_at: text("created_at").notNull(),
});
export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  customer: text("customer").notNull(),
  service: text("service").notNull(),
  date: text("date").notNull(),
  slot: text("slot").notNull(),
  note: text("note").notNull(),
  status: text("status").notNull().default("new"),
  created_at: text("created_at").notNull(),
});
export const assets = sqliteTable("assets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  storage: text("storage").notNull(),
  size: integer("size").notNull(),
  created_at: text("created_at").notNull(),
});
export const externalOrders = sqliteTable("external_orders", {
  id: text("id").primaryKey(),
  data: text("data").notNull(),
  synced_at: text("synced_at").notNull(),
});
export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  seo_title: text("seo_title").notNull().default(""),
  seo_description: text("seo_description").notNull().default(""),
  tags: text("tags").notNull().default("[]"),
  area_key: text("area_key").notNull().default(""),
  cover_image: text("cover_image").notNull().default(""),
  body: text("body").notNull(),
  category: text("category").notNull(),
  author: text("author").notNull(),
  status: text("status").notNull().default("draft"),
  published_at: text("published_at"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});
