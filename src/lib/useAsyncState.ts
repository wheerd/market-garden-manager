import { useState } from "react";

export function useAsyncState<Args extends unknown[]>(callback: (...args: Args) => Promise<void>): [boolean, (...args: Args) => void] {
    const [running, setRunning] = useState(false);
    const wrapped = (...args: Args) => {
        setRunning(true);
        callback(...args).then(() => { setRunning(false); }, () => { setRunning(false); });
    };
    return [running, wrapped];
}
