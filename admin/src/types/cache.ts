export interface CacheKeyItem {
  key: string;
}

export interface CacheKeyDetails {
  key: string;
  type: string;
  ttl: number;
  value: any;
}

export interface GetCacheKeysParams {
  cursor?: string;
  pattern?: string;
  count?: number;
}

export interface GetCacheKeysResponse {
  nextCursor: string;
  keys: string[];
}
