


import {RuntimeKeeper} from "./timeKeepers";


//worker control thread stuff
//used to control if the stats worker thread is running
let backgroundThreadRunning= true;


//thing i dont understand that lets the thread be forced awake
let wakeUpResolve: (() => void) | null = null;



let runtimeTimer:RuntimeKeeper=new RuntimeKeeper();
runtimeTimer.start();
//start the worker thread
export async function startStatsWorker(wakeUpIntervalSeconds:number): Promise<void> {
    console.log("stats worker started!");

    backgroundThreadRunning=true;
    while (backgroundThreadRunning===true) {
        await sleep(wakeUpIntervalSeconds); // sleep 1 minute
        runtimeTimer.update();
        statsWorker();

    }
    if((backgroundThreadRunning===false) || (backgroundThreadRunning!==true)) {
        console.log("stats worker stopped!");
    }
}

//used to stop the stats worker thread
export function stopStatsWorker() : void {
    backgroundThreadRunning = false;
    wakeUpResolve?.(); // wakes the worker immediately

}

// Manual trigger thread wake
export function wakeStatsWorker() : void {
    wakeUpResolve?.(); // wakes the worker immediately
}



// Helper function for sleeping
function sleep(seconds: number): Promise<void> {
    return new Promise<void>((resolve) => {
        const timeout = setTimeout(resolve, seconds * 1000);
        wakeUpResolve = () => {
            clearTimeout(timeout); // stop waiting
            resolve();            // continue immediately
        };
    });
}




//the logic for the stats worker thread
function statsWorker() : void{
    console.log("\n\n\n");
    console.log("server telemetry:")
    console.log("current date: "+(new Date(Date.now()).toDateString())+" current time: "+(new Date(Date.now()).toTimeString()));
    console.log("server has been running for: "+runtimeTimer.getTimeString())
    console.log("stats worker running!");




}
