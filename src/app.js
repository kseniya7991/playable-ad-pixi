import { Application } from "pixi.js";
import { initResizeManager } from "./utils/resizeManager";
import { Scene } from "./Scene";

(async () => {
    const app = new Application();
    await app.init({ background: 0x00000000, resizeTo: window });
    document.body.appendChild(app.canvas);

    const scene = new Scene(app);
    initResizeManager();
})();
