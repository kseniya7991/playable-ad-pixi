import { debounce } from "./utils";
const resizeSubscribers = [];

export const initResizeManager = () => {
    window.addEventListener(
        "resize",
        debounce(() => {
            onWindowResize();
        }, 100)
    );
}

export const subscribeToResize = (obj) => {
    if (!resizeSubscribers.includes(obj)) {
        resizeSubscribers.push(obj);
        handleResizeForObj(obj);
    }
};

export const unsubscribeFromResize = (obj) => {
    const index = resizeSubscribers.indexOf(obj);
    if (index !== -1) resizeSubscribers.splice(index, 1);
};

const handleResizeForObj = (obj) => {
    if (!obj || !obj.onResize) return;
    obj.onResize(window.innerWidth, window.innerHeight);
};

export const onWindowResize = () => {
    console.log("размер окна поменялся")
    for (const obj of resizeSubscribers) {
        handleResizeForObj(obj);
    }
};
