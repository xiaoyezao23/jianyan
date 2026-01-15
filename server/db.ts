import { eq, like, or, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, items, versions, imports, favorites, recentViews, InsertItem, InsertVersion, InsertImport, InsertFavorite, InsertRecentView } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ User Functions ============
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Items Functions ============
export async function createItem(item: InsertItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(items).values(item);
  return result;
}

export async function createItems(itemList: InsertItem[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (itemList.length === 0) return;
  await db.insert(items).values(itemList);
}

export async function getItemByItemId(itemId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(items).where(eq(items.itemId, itemId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getItemsByVersionId(versionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(items).where(eq(items.versionId, versionId));
  return result;
}

export async function getPublishedItems() {
  const db = await getDb();
  if (!db) return [];
  
  // 获取最新发布版本的所有项目
  const latestVersion = await db.select()
    .from(versions)
    .where(eq(versions.status, "published"))
    .orderBy(desc(versions.publishTime))
    .limit(1);
  
  if (latestVersion.length === 0) {
    // 如果没有发布版本，返回所有启用的项目
    return await db.select().from(items).where(eq(items.enabled, true));
  }
  
  return await db.select()
    .from(items)
    .where(and(
      eq(items.versionId, latestVersion[0].id),
      eq(items.enabled, true)
    ));
}

export async function searchItems(keyword: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  const searchPattern = `%${keyword}%`;
  
  const result = await db.select()
    .from(items)
    .where(and(
      eq(items.enabled, true),
      or(
        like(items.itemName, searchPattern),
        like(items.alias, searchPattern),
        like(items.pinyinAbbr, searchPattern),
        like(items.enAbbr, searchPattern),
        like(items.tubeColor, searchPattern),
        like(items.specimenType, searchPattern),
        like(items.itemGroup, searchPattern)
      )
    ))
    .orderBy(desc(items.frequencyScore))
    .limit(limit);
  
  return result;
}

export async function getAllItems() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(items);
}

export async function deleteItemsByVersionId(versionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(items).where(eq(items.versionId, versionId));
}

export async function updateItem(id: number, data: Partial<InsertItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(items).set(data).where(eq(items.id, id));
}

// ============ Version Functions ============
export async function createVersion(version: InsertVersion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(versions).values(version);
  return result;
}

export async function getVersionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(versions).where(eq(versions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLatestPublishedVersion() {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(versions)
    .where(eq(versions.status, "published"))
    .orderBy(desc(versions.publishTime))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getDraftVersion() {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(versions)
    .where(eq(versions.status, "draft"))
    .orderBy(desc(versions.createdAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllVersions() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(versions).orderBy(desc(versions.createdAt));
}

export async function updateVersion(id: number, data: Partial<InsertVersion>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(versions).set(data).where(eq(versions.id, id));
}

export async function getNextVersionCode() {
  const db = await getDb();
  if (!db) return "1.0.0";
  
  const latestPublished = await db.select()
    .from(versions)
    .where(eq(versions.status, "published"))
    .orderBy(desc(versions.publishTime))
    .limit(1);
  
  if (latestPublished.length === 0) {
    return "1.0.0";
  }
  
  const currentCode = latestPublished[0].versionCode;
  const parts = currentCode.split('.').map(Number);
  parts[2] = (parts[2] || 0) + 1;
  return parts.join('.');
}

// ============ Import Functions ============
export async function createImport(importRecord: InsertImport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(imports).values(importRecord);
  return result;
}

export async function getImportById(importId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(imports).where(eq(imports.importId, importId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllImports() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(imports).orderBy(desc(imports.createdAt));
}

// ============ Favorites Functions ============
export async function addFavorite(userId: number, itemId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 检查是否已收藏
  const existing = await db.select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.itemId, itemId)))
    .limit(1);
  
  if (existing.length > 0) return existing[0];
  
  await db.insert(favorites).values({ userId, itemId });
  const result = await db.select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.itemId, itemId)))
    .limit(1);
  return result[0];
}

export async function removeFavorite(userId: number, itemId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.itemId, itemId)));
}

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const favs = await db.select()
    .from(favorites)
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));
  
  if (favs.length === 0) return [];
  
  const itemIds = favs.map(f => f.itemId);
  const itemList = await db.select()
    .from(items)
    .where(sql`${items.itemId} IN (${sql.join(itemIds.map(id => sql`${id}`), sql`, `)})`);
  
  return itemList;
}

export async function isFavorite(userId: number, itemId: string) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.itemId, itemId)))
    .limit(1);
  
  return result.length > 0;
}

// ============ Recent Views Functions ============
export async function addRecentView(userId: number, itemId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 删除旧的相同记录
  await db.delete(recentViews).where(and(eq(recentViews.userId, userId), eq(recentViews.itemId, itemId)));
  
  // 添加新记录
  await db.insert(recentViews).values({ userId, itemId });
  
  // 保留最近50条
  const allViews = await db.select()
    .from(recentViews)
    .where(eq(recentViews.userId, userId))
    .orderBy(desc(recentViews.viewedAt));
  
  if (allViews.length > 50) {
    const toDelete = allViews.slice(50);
    for (const view of toDelete) {
      await db.delete(recentViews).where(eq(recentViews.id, view.id));
    }
  }
}

export async function getUserRecentViews(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  const views = await db.select()
    .from(recentViews)
    .where(eq(recentViews.userId, userId))
    .orderBy(desc(recentViews.viewedAt))
    .limit(limit);
  
  if (views.length === 0) return [];
  
  const itemIds = views.map(v => v.itemId);
  const itemList = await db.select()
    .from(items)
    .where(sql`${items.itemId} IN (${sql.join(itemIds.map(id => sql`${id}`), sql`, `)})`);
  
  // 按浏览顺序排序
  const itemMap = new Map(itemList.map(item => [item.itemId, item]));
  return itemIds.map(id => itemMap.get(id)).filter(Boolean);
}
