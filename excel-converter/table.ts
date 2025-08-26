
enum AccessType {
  /** Only accessed directly by other cells */
  FREE,

  /** Accessed as a range with VLOOKUP or HLOOKUP */
  RANGE,
}

const DEFAULT_GETTER = '0';

class Table {
  private cells: Record<string, AccessType> = {};

  public getterFor(col: number, row: number) {
    
  }

  constructor(public name: string) {}
}

export class TableHolder {
  private static tables: Record<string, Table> = {};

  public static getTable(name: string): Table {
    if (!(name in this.tables)) this.tables[name] = new Table(name);
    return this.tables[name];
  }
}
