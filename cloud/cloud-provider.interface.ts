export type VmStatus = 'ON' | 'OFF' | 'STARTING' | 'STOPPING' | 'UNKNOWN';

export interface ICloudProvider {
  /**
   * Retrieves the current power state of the Virtual Machine.
   */
  getVmStatus(vmId: string, resourceGroup?: string): Promise<VmStatus>;

  /**
   * Sends a start command to the Virtual Machine.
   */
  startVm(vmId: string, resourceGroup?: string): Promise<void>;

  /**
   * Sends a stop/deallocate command to the Virtual Machine to stop billing.
   */
  stopVm(vmId: string, resourceGroup?: string): Promise<void>;
}
