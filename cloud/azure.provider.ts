import { ComputeManagementClient } from "@azure/arm-compute";
import { DefaultAzureCredential } from "@azure/identity";
import { ICloudProvider, VmStatus } from "./cloud-provider.interface";

export class AzureProvider implements ICloudProvider {
  private client: ComputeManagementClient;
  private defaultResourceGroup: string;

  constructor() {
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
    this.defaultResourceGroup = process.env.AZURE_RESOURCE_GROUP || "";

    if (!subscriptionId) {
      throw new Error("AZURE_SUBSCRIPTION_ID is missing from environment variables");
    }

    // DefaultAzureCredential automatically looks for AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET in the .env
    const credential = new DefaultAzureCredential();
    this.client = new ComputeManagementClient(credential, subscriptionId);
  }

  async getVmStatus(vmId: string, resourceGroup?: string): Promise<VmStatus> {
    const rg = resourceGroup || this.defaultResourceGroup;
    try {
      // We must query 'instanceView' specifically to get real-time power states
      const vm = await this.client.virtualMachines.instanceView(rg, vmId);
      
      const statuses = vm.statuses || [];
      const powerState = statuses.find(s => s.code?.startsWith('PowerState/'));

      if (!powerState) return 'UNKNOWN';

      switch (powerState.code) {
        case 'PowerState/running': return 'ON';
        case 'PowerState/deallocated':
        case 'PowerState/stopped': return 'OFF';
        case 'PowerState/starting': return 'STARTING';
        case 'PowerState/stopping':
        case 'PowerState/deallocating': return 'STOPPING';
        default: return 'UNKNOWN';
      }
    } catch (error) {
      console.error(`AzureProvider: Failed to get status for VM ${vmId}`, error);
      return 'UNKNOWN';
    }
  }

  async startVm(vmId: string, resourceGroup?: string): Promise<void> {
    const rg = resourceGroup || this.defaultResourceGroup;
    console.log(`AzureProvider: Sending START command to VM ${vmId} in ${rg}...`);
    await this.client.virtualMachines.beginStart(rg, vmId);
  }

  async stopVm(vmId: string, resourceGroup?: string): Promise<void> {
    const rg = resourceGroup || this.defaultResourceGroup;
    console.log(`AzureProvider: Sending DEALLOCATE command to VM ${vmId} in ${rg}...`);
    // We explicitly Deallocate instead of PowerOff to ensure compute billing stops
    await this.client.virtualMachines.beginDeallocate(rg, vmId);
  }
}
