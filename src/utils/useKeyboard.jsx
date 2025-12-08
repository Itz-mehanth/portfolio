
import { useEffect, useState } from "react";

export default function useKeyboard() {
    const [keys, setKeys] = useState({
        forward: false,
        backward: false,
        left: false,
        right: false,
        shift: false,
        space: false,
        punch: false,
        q: false,
        e: false
    });

    useEffect(() => {
        const handleKeyDown = (e) => {
            switch (e.code) {
                case "KeyW":
                case "ArrowUp":
                    setKeys((k) => ({ ...k, forward: true }));
                    break;
                case "KeyS":
                case "ArrowDown":
                    setKeys((k) => ({ ...k, backward: true }));
                    break;
                case "KeyA":
                case "ArrowLeft":
                    setKeys((k) => ({ ...k, left: true }));
                    break;
                case "KeyD":
                case "ArrowRight":
                    setKeys((k) => ({ ...k, right: true }));
                    break;
                case "KeyQ":
                    setKeys((k) => ({ ...k, q: true }));
                    break;
                case "KeyE":
                    setKeys((k) => ({ ...k, e: true }));
                    break;
                case "ShiftLeft":
                case "ShiftRight":
                    setKeys((k) => ({ ...k, shift: true }));
                    break;
                case "Space":
                    setKeys((k) => ({ ...k, space: true }));
                    break;
            }
        };
        const handleKeyUp = (e) => {
            switch (e.code) {
                case "KeyW":
                case "ArrowUp":
                    setKeys((k) => ({ ...k, forward: false }));
                    break;
                case "KeyS":
                case "ArrowDown":
                    setKeys((k) => ({ ...k, backward: false }));
                    break;
                case "KeyA":
                case "ArrowLeft":
                    setKeys((k) => ({ ...k, left: false }));
                    break;
                case "KeyD":
                case "ArrowRight":
                    setKeys((k) => ({ ...k, right: false }));
                    break;
                case "KeyQ":
                    setKeys((k) => ({ ...k, q: false }));
                    break;
                case "KeyE":
                    setKeys((k) => ({ ...k, e: false }));
                    break;
                case "ShiftLeft":
                case "ShiftRight":
                    setKeys((k) => ({ ...k, shift: false }));
                    break;
                case "Space":
                    setKeys((k) => ({ ...k, space: false }));
                    break;
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    return keys;
}
