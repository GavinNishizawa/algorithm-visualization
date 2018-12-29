
const StateController = stateList => (() => {
    let index = 0;
    const change = (check, fn) => {
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
    const onChange = fn => onChangeFn = fn;
    const beforeEnd = () => (index < stateList.length - 1);
    const afterStart = () => (index > 0);
    const doIncrement = () => index++;
    const doDecrement = () => index--;
    const increment = () => change(beforeEnd, doIncrement);
    const decrement = () => change(afterStart, doDecrement);
    const reset = newStateList => {
        index = 0;
        stateList = newStateList;
    };
    let onDoneFn = () => {};
    const onDone = fn => onDoneFn = fn;

    return {
        increment,
        decrement,
        reset,
        stateList,
        onChange,
        onDone,
    };
})();

const PlayController = (updateList, getStepTime) => (() => {
    const stateController = StateController(updateList());
    let stepTime = 1000;
    let interval = null;
    let started = false;
    const reset = () => {
        clear();
        started = false;
        stateController.reset(updateList());
    };
    const clear = () => {
        if (interval) interval = clearInterval(interval);
    };
    const clearSet = (fn, time) => {
        clear();
        interval = setInterval(fn, time);
    };
    const play = () => clearSet(stepForward, stepTime);
    const pause = clear;
    const start = fn => (...args) => {
        if (!started) reset();
        started = true;
        return fn(...args);
    };
    const isStarted = () => started;
    const togglePlay = start(() => {
        if (interval) {
            pause();
            togglePlayUI(false);
        } else {
            play();
            togglePlayUI(true);
        }
    });
    const step = start(doStep => {
        if (!doStep()) reset(); else started = true;
    });
    const stepForward = () => step(() => stateController.increment());
    const manualStep = () => {
        togglePlayUI(false);
        stepForward();
    };
    const stepBackward = () => step(() => stateController.decrement());
    const rewind = () => clearSet(stepBackward, stepTime);
    const updateStepTime = () => {
        stepTime = getStepTime();
        if (interval) play(); // play with new step time
    };
    const setOnChange = fn => {
        stateController.onChange(fn);
    };
    const setOnDone = fn => stateController.onDone(fn);
    let togglePlayUI = playing => {};
    const setTogglePlayUI = fn => togglePlayUI = fn;

    return {
        isStarted,
        togglePlay,
        manualStep,
        reset,
        updateStepTime,
        setOnChange,
        setOnDone,
        setTogglePlayUI,
    };
})();
