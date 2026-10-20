import * as SQLite from 'expo-sqlite';
import { IDatabaseDriver } from './repository';
import { CREATE_TABLES_SQL } from './schema';

class ExpoSQLiteDriver implements IDatabaseDriver {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    try {
      const database = await SQLite.openDatabaseAsync('cuentas_claras.db');
      await database.execAsync('PRAGMA foreign_keys = ON;');
      await database.execAsync(CREATE_TABLES_SQL);
      this.db = database;
    } catch (error) {
      this.db = null;
      console.error('[DatabaseDriver] Failed to initialize database:', error);
      throw error;
    }
  }

  private getDb(): SQLite.SQLiteDatabase {
    if (!this.db) throw new Error('Database not initialized. Call init() first.');
    return this.db;
  }

  async execAsync(sql: string): Promise<void> {
    await this.getDb().execAsync(sql);
  }

  async runAsync(sql: string, params: any[] = []): Promise<{ lastInsertRowId?: number; changes?: number }> {
    const res = await this.getDb().runAsync(sql, params);
    return { lastInsertRowId: res.lastInsertRowId, changes: res.changes };
  }

  async getAllAsync<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return await this.getDb().getAllAsync<T>(sql, params);
  }

  async getFirstAsync<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    return await this.getDb().getFirstAsync<T>(sql, params);
  }

  async withTransactionAsync<T>(callback: () => Promise<T>): Promise<T> {
    let result: T;
    await this.getDb().withTransactionAsync(async () => {
      result = await callback();
    });
    return result!;
  }
}

export const dbDriver = new ExpoSQLiteDriver();
