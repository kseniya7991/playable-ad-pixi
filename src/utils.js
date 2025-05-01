export const getOS = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    return "unknown";
};

export function debounce(func, delay) {
    let lastCall = 0;
    let lastCallTimer;
  
    return function perform(...args) {
        const now = Date.now();
        if (lastCall && now - lastCall <= delay) {
            clearTimeout(lastCallTimer);
        }
  
        lastCall = now;
        lastCallTimer = setTimeout(() => func(...args), delay);
    };
  }
  