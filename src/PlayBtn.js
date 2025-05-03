import { Assets, Sprite } from "pixi.js";
import { getOS } from "./utils";

export default class PlayBtn extends Sprite {
    constructor(app){
        super();
        this.app = app;
        this.init();
    }

    async init() {
        const texture = Assets.get('playBtn');
        this.texture = texture;

        const scale = 200 / texture.width;
        this.scale.set(scale);
        this.position.set(40, 180);

        this.addListeners();
    }

    addListeners() {
        this.eventMode = "static";
        this.cursor = "pointer";

        this.on('pointerdown', (e) => {
            const os = getOS();
            if(os === 'Android') {
                window.open("https://play.google.com/store/apps/details?id=com.awem.cradleofempires.andr&hl=en")
            } else {
                window.open("https://apps.apple.com/us/app/cradle-of-empires-match-3-game/id738480930")
            }
       })
    
        this.on('pointerover', (e) => {
            this.alpha = 0.8;
        })
    
        this.on('pointerout', (e) => {
            this.alpha = 1;
        })
    }
}