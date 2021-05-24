/**
 * WalletProvider
 * @license MIT
 * @author https://github.com/libertypie
 */

export default class Utils {
  static async getChainIdByRequest(providerClass: any): Promise<string> {
    try {
      const chainId = (await providerClass._provider.getNetwork()).chainId;
      return chainId;
    } catch (error) {
      return error;
    }
  }

  static logError(error: Error) {
    if (!(window as any)._debug_wallet_provider) return;
    console.log(error, error.stack);
  }
}
