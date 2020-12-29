/**
 * WalletProvider 
 * @license MIT 
 * @author https://github.com/libertypie
 */

 import Provider from "../interface/Provider";
 import NetworkCodes from "../classes/ErrorCodes"
 import Status from "../classes/Status"
 import ProviderEventRegistry from "../classes/ProviderEventRegistry"

 class Web3Standard  extends ProviderEventRegistry implements Provider {

    protected _provider: any = null

    protected _web3: any;

    protected  chainId: string = null;


    /**
     * isOnconnectEventTriggered
     * This will track if onconnect event was called or not, because on page
     * reopen, we will need to retrigger the event
     * this will prevent multiple events
     */
    isOnconnectEventTriggered = false;

    protected _accounts: Array<string> = [];

    protected _providerPackage: any = null;

    constructor(provider: Object, providerPackage: any = null){
        super()

        this._provider = provider;
        this._providerPackage = providerPackage;

        this.initialize();

    } //end fun

    /**
     * set up provider events
     */
    protected initialize(){

        if(typeof this._provider == 'undefined') return

        this._provider.autoRefreshOnNetworkChange = false;

        //console.log(this._provider)

        //on connect
        this._provider.on('connect', (chainId: string)=>{
            if(!this.isOnconnectEventTriggered) this._onConnectCallback(chainId)
        });

        /**
         * disconnect
         */
        this._provider.on('disconnect', (err: any)=>{
            this._onDisconnectCallback(err)
        });

        this._provider.on('error', (error) => {
            this._onErrorCallback(error)
        });

        this._provider.on('chainChanged', async (chainId) => {
            await this.getAccounts();
            this._onChainChangedCallback(chainId)
        });

        this._provider.on('accountsChanged', async (accounts: Array<string>) => {
            this._accounts = accounts;
            this._onAccountsChangedCallback(accounts);
        });

        this._provider.on('message', (message: string) => {
            this._onMessageCallback(message);
        });

    } //end fun
    


    /**
     * wether the provider is supported in the browser
     */
    isSupported(): boolean {
        return (typeof this._provider !== 'undefined');
    }

    /**
     * connect
     */
    async  connect(): Promise<Status> { 

        if(!this.isSupported()){
            return Status.error("wallet_not_found")
                         .setCode(NetworkCodes.wallet_not_found)
        }

     
        //lets request access 
        try {

             this._accounts = await  this._provider.request({ method: 'eth_requestAccounts' });

            let account = this._accounts[0]

            let resultObj = {
                account,
                chainId: await this.getChainId(),
                provider: this._provider
            }

            if(!this.isOnconnectEventTriggered && this.isConnected()) {
                 this._onConnectCallback(resultObj)
            }
            
            return Status.successPromise("",resultObj)
            
        } catch (e) {
            this._onConnectErrorCallback(e)
            return Promise.resolve(Status.error(e.message).setCode(e.code));
        }
    }

    /**
     * getChainId
     */
    async getChainId(): Promise<string> {
       this.chainId = this._provider.chainId;
       return Promise.resolve(this.chainId);
    }

    /**
     * getAccounts
     */
     getAccounts(): Array<string> {
        return this._accounts || [];
    } //end fun 


    /**
     * isConnected
     */
    isConnected(): boolean {
        return this._provider.isConnected()
    }

    /**
     * disconnect
     * @param callback 
     */
    async disconnect(): Promise<Status> {
        this._provider.disconnect();
        this._onDisconnectCallback()
        return Status.successPromise("")
    }

    /**
     * onConnect
     */
    onConnect(callback: Function = () => {}){
        this._onConnectCallback = callback;
    }


    /** 
     * getProvider
     */
    getProvider(): any {
        return this._provider;
    }

 }

 export default Web3Standard;