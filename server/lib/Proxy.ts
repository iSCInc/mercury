class Proxy {
	static index = 0;
	private static _instance: Proxy = null;
	private proxyList: string[] = [];
	private length = 0;

	public static getInstance(): Proxy {
		if (Proxy._instance === null) {
			Proxy._instance = new Proxy();
		}
		return Proxy._instance;
	}

	public init(proxyList: string[]) {
		this.proxyList = proxyList;
		this.length = proxyList.length;
	}

	public reset() {
		this.proxyList = [];
		this.length = 0;
	}

	public testMethod() {
		console.log(1);
	}

	public getProxy(): string {
		var result = '';
		if (this.length > 0) {
			result = this.proxyList[Proxy.index];
			Proxy.index++;
			if (Proxy.index >= this.length) {
				Proxy.index = 0;
			}
		}
		return result;
	}
}

var proxy = Proxy.getInstance();
export = proxy;
