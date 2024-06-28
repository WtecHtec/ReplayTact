
class GlobalState {
	private static _instance: GlobalState
	private state: any = {}
	public static get instance() {
		if (!this._instance) {
			this._instance = new GlobalState()
		}
		return this._instance
	}

	set(key, value) {
		this.state[key] = value
	}

	get(key) {
		return this.state[key]
	}

}

export default GlobalState