import { ClientSession } from "mongoose";
import { mongoose } from "./connection";
import { createLogger } from "../libs/utils/logger";

const logger = createLogger("mongo-transaction");

/**
 * Executes a callback function within a Mongoose transaction.
 *
 * @param fn Callback function to execute within the transaction
 * @returns The result of the callback function
 * @throws Error if the transaction fails
 */
export async function withTransaction<T>(
  fn: (session: ClientSession) => Promise<T>,
): Promise<T> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await fn(session);
    await session.commitTransaction();
    logger.debug("Transaction committed successfully");
    return result;
  } catch (error) {
    await session.abortTransaction();
    logger.error({ error }, "Transaction aborted due to error");
    throw error;
  } finally {
    session.endSession();
  }
}
