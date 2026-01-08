import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JsonStorageService {
  private readonly dataPath = path.join(process.cwd(), '..', 'data');

  constructor() {
    // 确保数据目录存在
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
  }

  private getFilePath(fileName: string): string {
    return path.join(this.dataPath, `${fileName}.json`);
  }

  read<T>(fileName: string): T[] {
    const filePath = this.getFilePath(fileName);
    try {
      if (!fs.existsSync(filePath)) {
        return [];
      }
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${fileName}:`, error);
      return [];
    }
  }

  write<T>(fileName: string, data: T[]): void {
    const filePath = this.getFilePath(fileName);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error(`Error writing ${fileName}:`, error);
      throw error;
    }
  }

  findById<T extends { id: string }>(fileName: string, id: string): T | null {
    const items = this.read<T>(fileName);
    return items.find((item) => item.id === id) || null;
  }

  create<T extends { id: string }>(fileName: string, item: T): T {
    const items = this.read<T>(fileName);
    items.push(item);
    this.write(fileName, items);
    return item;
  }

  update<T extends { id: string }>(fileName: string, id: string, updates: Partial<T>): T | null {
    const items = this.read<T>(fileName);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    items[index] = { ...items[index], ...updates };
    this.write(fileName, items);
    return items[index];
  }

  delete<T extends { id: string }>(fileName: string, id: string): boolean {
    const items = this.read<T>(fileName);
    const filteredItems = items.filter((item) => item.id !== id);
    if (filteredItems.length === items.length) return false;

    this.write(fileName, filteredItems);
    return true;
  }

  // 分页查询方法
  paginate<T>(items: T[], page: number = 1, pageSize: number = 10): { data: T[], total: number, page: number, pageSize: number } {
    const total = items.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const data = items.slice(startIndex, endIndex);

    return {
      data,
      total,
      page,
      pageSize
    };
  }
}
