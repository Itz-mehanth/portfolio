
import { useEffect, useRef } from "react";

export default function useKeyboard() {
    const keysRef = useRef({
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

    const setKey = (name, value) => {
        if (keysRef.current[name] === value) return;
        keysRef.current[name] = value;
    };

    const handledCodes = new Set([
        "KeyW",
        "ArrowUp",
        "KeyS",
        "ArrowDown",
        "KeyA",
        "ArrowLeft",
        "KeyD",
        "ArrowRight",
        "KeyQ",
        "KeyE",
        "ShiftLeft",
        "ShiftRight",
        "Space",
    ]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (handledCodes.has(e.code)) {
                e.preventDefault();
            }
            switch (e.code) {
                case "KeyW":
                case "ArrowUp":
                    setKey("forward", true);
                    break;
                case "KeyS":
                case "ArrowDown":
                    setKey("backward", true);
                    break;
                case "KeyA":
                case "ArrowLeft":
                    setKey("left", true);
                    break;
                case "KeyD":
                case "ArrowRight":
                    setKey("right", true);
                    break;
                case "KeyQ":
                    setKey("q", true);
                    break;
                case "KeyE":
                    setKey("e", true);
                    break;
                case "ShiftLeft":
                case "ShiftRight":
                    setKey("shift", true);
                    break;
                case "Space":
                    setKey("space", true);
                    break;
            }
        };
        const handleKeyUp = (e) => {
            if (handledCodes.has(e.code)) {
                e.preventDefault();
            }
            switch (e.code) {
                case "KeyW":
                case "ArrowUp":
                    setKey("forward", false);
                    break;
                case "KeyS":
                case "ArrowDown":
                    setKey("backward", false);
                    break;
                case "KeyA":
                case "ArrowLeft":
                    setKey("left", false);
                    break;
                case "KeyD":
                case "ArrowRight":
                    setKey("right", false);
                    break;
                case "KeyQ":
                    setKey("q", false);
                    break;
                case "KeyE":
                    setKey("e", false);
                    break;
                case "ShiftLeft":
                case "ShiftRight":
                    setKey("shift", false);
                    break;
                case "Space":
                    setKey("space", false);
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

    return keysRef;
}
