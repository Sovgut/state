export type ISupportedPrimitive =
  | "bigint"
  | "boolean"
  | "number"
  | "object"
  | "string";

export interface IProvider {
  getItem(key: string): string | null | undefined;
  setItem(key: string, value: unknown): void;
  removeItem(key: string): void;
  clear(): void;
  has?(key: string): boolean;
}

export interface IProviderEvent {
  provider: string;
  key: string;
  value?: any;
}