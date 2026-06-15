import { config } from "../../configs/env";
import { CloudFactory } from "@slavecode/cloud";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("cloud-wake-util");

/**
 * Utility to inspect network errors and automatically wake up the Cloud VM if it's offline.
 * Throws a "VM_WAKING_UP" error if the VM is currently booting.
 */
export async function handleCloudWakeOnNetworkError(error: any): Promise<void> {
  const isNetworkFailure =
    error?.cause?.code === "ECONNREFUSED" ||
    error?.cause?.code === "EHOSTUNREACH" ||
    error?.cause?.code === "ENETUNREACH" ||
    error?.cause?.code === "ConnectionRefused" || // Bun specific
    error?.message?.includes("Unable to connect") || // Bun fetch specific
    (error instanceof Error && error.name === "AbortError");

  if (isNetworkFailure && config.judge0VmName) {
    logger.info("Network failure detected. Checking VM status via Azure...");
    try {
      const cloud = CloudFactory.getProvider();
      const status = await cloud.getVmStatus(config.judge0VmName);
      
      if (status === "OFF" || status === "STOPPING" || status === "UNKNOWN") {
        logger.info(`VM ${config.judge0VmName} is offline. Sending wake command...`);
        await cloud.startVm(config.judge0VmName);
        throw new Error("VM_WAKING_UP");
      } else if (status === "STARTING" || status === "ON") {
        logger.info(`VM is ${status}, but network failed. This means Judge0 internal docker is booting.`);
        throw new Error("VM_WAKING_UP");
      }
    } catch (cloudError: any) {
      if (cloudError?.message === "VM_WAKING_UP") {
        throw cloudError; // Rethrow our custom polling trigger
      }
      logger.error("Failed to check or wake up Cloud VM:", cloudError);
    }
  }
}
