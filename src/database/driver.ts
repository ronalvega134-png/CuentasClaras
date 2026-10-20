import * as SQLite from 'expo-sqlite';
import { IDatabaseDriver } from './repository';
import { CREATE_TABLES_SQL } from './schema';

class ExpoSQLiteDriver implements IDatabaseDriver {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync('cuentas_claras.db');
      await this.db.execAsync(CREATE_TABLES_SQL);
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
    return await this.getDb().withTransactionAsync(callback);
  }
}

export const dbDriver = new ExpoSQLiteDriver();
