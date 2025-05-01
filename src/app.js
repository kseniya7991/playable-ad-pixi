import { Application} from "pixi.js";
import { initResizeManager } from "./resizeManager";

(async () => {
    const app = new Application();
    await app.init({ background: 0x00000000, resizeTo: window });
    document.body.appendChild(app.canvas);

    initResizeManager();

})();
