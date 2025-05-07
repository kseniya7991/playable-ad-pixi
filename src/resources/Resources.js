import { Assets } from "pixi.js";

export default class Resources {
    constructor(sources) {
        this.sources = sources;
        this.data = null;
    }

    async startLoading() {
        
        try {
            this.data = await Assets.load(this.sources);
        } catch (error) {
            console.error(error);
        }
        finally {
            return this.data;
        }
    }
  
}
