//used to control if the stats worker thread is running
let backgroundThreadRunning= true;
//thing i dont understand that lets the thread be forced awake
let wakeUpResolve: (() => void) | null = null;

//start the worker thread
export async function startStatsWorker(wakeUpIntervalSeconds:number) {
    console.log("stats worker started!");
    while (backgroundThreadRunning===true) {
        await sleep(wakeUpIntervalSeconds); // sleep 1 minute
        statsWorker();

    }
    if((backgroundThreadRunning ===false) || (backgroundThreadRunning!==true)) {
        console.log("stats worker stopped!");
    }
}

//used to stop the stats worker thread
export function stopStatsWorker() {
    backgroundThreadRunning = false;
    wakeUpResolve?.(); // wakes the worker immediately

}

// Manual trigger thread wake
export function wakeStatsWorker() {
    wakeUpResolve?.(); // wakes the worker immediately
}

//the logic for the stats worker thread
function statsWorker(){
    console.log("stats worker running!");
}

// Helper function for sleeping
function sleep(seconds: number) {
    return new Promise<void>((resolve) => {
        const timeout = setTimeout(resolve, seconds * 1000);
        wakeUpResolve = () => {
            clearTimeout(timeout); // stop waiting
            resolve();            // continue immediately
        };
    });
}