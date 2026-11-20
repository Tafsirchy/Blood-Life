import mongoose, { Model, Document } from "mongoose";

export interface PaginationOptions {
  limit?: number;
  cursor?: string; // ObjectId string
  sortOrder?: 1 | -1;
  sortField?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount?: number;
}

/**
 * Keyset / Cursor-based pagination utility for high-scale MongoDB queries.
 * Replaces expensive .skip() with O(log N) indexed comparisons.
 */
export async function paginateWithCursor<T extends Document>(
  model: Model<T>,
  filter: Record<string, unknown> = {},
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
  const { limit = 12, cursor, sortField = "_id", sortOrder = -1 } = options;

  const queryFilter: Record<string, unknown> = { ...filter };

  if (cursor) {
    try {
      const parsedCursor = mongoose.Types.ObjectId.isValid(cursor)
        ? new mongoose.Types.ObjectId(cursor)
        : cursor;

      if (sortOrder === -1) {
        queryFilter[sortField] = { $lt: parsedCursor };
      } else {
        queryFilter[sortField] = { $gt: parsedCursor };
      }
    } catch {
      // Invalid cursor fallback, start from top
    }
  }

  // Fetch limit + 1 to detect if next page exists without extra count query
  const records = await model
    .find(queryFilter)
    .sort({ [sortField]: sortOrder } as Record<string, 1 | -1>)
    .limit(limit + 1)
    .lean<T[]>();

  const hasMore = records.length > limit;
  const data = hasMore ? records.slice(0, limit) : records;

  let nextCursor: string | null = null;
  if (hasMore && data.length > 0) {
    const lastItem = data[data.length - 1];
    nextCursor = String((lastItem as unknown as { _id: unknown })._id);
  }

  return {
    data,
    nextCursor,
    hasMore,
  };
}
