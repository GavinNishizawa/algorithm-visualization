
let getStateController = stateList => (() => {
    let index = 0;
    let change = (check, fn) => {
        if (check()) {
            fn();
            onChangeFn(stateList[index], index);
            return true;
        } else {
            onDoneFn();
            return false;
        }
    }
    let onChangeFn = (v, i) => {};
    let onChange = fn => onChangeFn = fn;
    let beforeEnd = () => (index < stateList.length - 1);
    let afterStart = () => (index > 0);
    let doIncrement = () => index++;
    let doDecrement = () => index--;
    let increment = () => change(beforeEnd, doIncrement);
    let decrement = () => change(afterStart, doDecrement);
    let reset = () => index = 0;
    let onDoneFn = () => {};
    let onDone = fn => onDoneFn = fn;

    return {
        increment,
        decrement,
        reset,
        stateList,
        onChange,
        onDone,
    };
})();

let getPlayController = (updateList, getStepTime, onChange, onDone, onStart) => (() => {
    let stateController;
    let stepTime = 1000;
    let interval = null;
    let started = false;
    let init = (didStart=false) => {
        clear();
        started = didStart;
        if (started) onStart();
        stateController = getStateController(updateList());
        stateController.onChange(onChange);
        stateController.onDone(onDone);
    };
    let clear = () => {
        if (interval) interval = clearInterval(interval);
    };
    let clearSet = (fn, time) => {
        clear();
        interval = setInterval(fn, time);
    };
    let play = () => clearSet(stepForward, stepTime);
    let pause = clear;
    let start = fn => (...args) => {
        if (!started) init(true);
        return fn(...args);
    };
    let isStarted = () => started;
    let togglePlay = start(() => {
        if (interval) {
            pause();
            return false;
        } else {
            play();
            return true;
        }
    });
    let step = start(doStep => {
        if (!doStep()) reset(); else started = true;
    });
    let stepForward = () => step(() => stateController.increment());
    let stepBackward = () => step(() => stateController.decrement());
    let rewind = () => clearSet(stepBackward, stepTime);
    let reset = init;
    let updateStepTime = () => {
        stepTime = getStepTime();
        if (interval) play(); // play with new step time
    };

    return {
        isStarted,
        togglePlay,
        stepForward,
        reset,
        updateStepTime,
    };
})();
