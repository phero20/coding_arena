import { ICloudProvider } from "./cloud-provider.interface";
import { AzureProvider } from "./azure.provider";

export class CloudFactory {
  private static instance: ICloudProvider;

  /**
   * Returns a singleton instance of the active cloud provider
   */
  public static getProvider(): ICloudProvider {
    if (this.instance) {
      return this.instance;
    }

    const providerName = process.env.ACTIVE_CLOUD_PROVIDER || "AZURE";

    switch (providerName.toUpperCase()) {
      case "AZURE":
        this.instance = new AzureProvider();
        break;
      case "GCP":
        throw new Error("GCPProvider is not yet implemented");
      case "AWS":
        throw new Error("AWSProvider is not yet implemented");
      default:
        console.warn(`Unknown ACTIVE_CLOUD_PROVIDER: ${providerName}. Falling back to AZURE.`);
        this.instance = new AzureProvider();
    }

    return this.instance;
  }
}
