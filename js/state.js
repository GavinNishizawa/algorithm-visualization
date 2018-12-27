
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
    };
    let onChangeFn = (v, i) => {};
    let onChange = fn => onChangeFn = fn;
    let beforeEnd = () => (index < stateList.length - 1);
    let afterStart = () => (index > 0);
    let doIncrement = () => index++;
    let doDecrement = () => index--;
    let increment = () => change(beforeEnd, doIncrement);
    let decrement = () => change(afterStart, doDecrement);
    let reset = newStateList => {
        index = 0;
        stateList = newStateList;
    };
    let onDoneFn = () => {};
    let onDone = fn => onDoneFn = fn;

    return {
        increment,
        decrement,
        reset,
        stateList,
        onChange,
        onChangeFn,
        onDone,
    };
})();

let getPlayController = (updateList, getStepTime) => (() => {
    let stateController = getStateController(updateList());
    let stepTime = 1000;
    let interval = null;
    let started = false;
    let reset = () => {
        clear();
        started = false;
        stateController.reset(updateList());
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
        if (!started) reset();
        started = true;
        return fn(...args);
    };
    let isStarted = () => started;
    let togglePlay = start(() => {
        if (interval) {
            pause();
            togglePlayUI(false);
        } else {
            play();
            togglePlayUI(true);
        }
    });
    let step = start(doStep => {
        if (!doStep()) reset(); else started = true;
    });
    let stepForward = () => step(() => stateController.increment());
    let stepBackward = () => step(() => stateController.decrement());
    let rewind = () => clearSet(stepBackward, stepTime);
    let updateStepTime = () => {
        stepTime = getStepTime();
        if (interval) play(); // play with new step time
    };
    let setOnChange = fn => {
        stateController.onChange(fn);
    };
    let setOnDone = fn => stateController.onDone(fn);
    let togglePlayUI = playing => {};
    let setTogglePlayUI = fn => togglePlayUI = fn;

    return {
        isStarted,
        togglePlay,
        stepForward,
        reset,
        updateStepTime,
        setOnChange,
        setOnDone,
        setTogglePlayUI,
    };
})();
