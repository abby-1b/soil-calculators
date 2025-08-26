
type AddressType =
  | 'string'
  | 'number';

/** The information inside an address (its type and user-defined name) */
interface AddressInfo {
  type: AddressType
  name?: string
}

export class Table {
  public addresses: Map<string, AddressInfo> = new Map();
  public get(address: string): AddressInfo {
    return this.addresses.get(address)!;
  }
  public set(address: string, info: AddressInfo) {
    this.addresses.set(address, info);
  }
}

const t = new Table();
