
function getStateController(stepFn=(v,i)=>{}, initStepTime=100) {
    let stateController = (() => {
        let r = { state: {
            index: 0,
            direction: 1,
            playing: false,
            started: false,
            doStep: false,
            justFinished: false,
            refreshTime: 10,
            stepTime: initStepTime,
            list: null,
            togglePlay: () => {},
            updateList: () => {},
            resetUI: () => {},
        }};

        let isWaiting = () => !r.state.playing && !r.state.doStep;
        let isReset = () => !r.state.started;
        let isDone = () => (r.state.direction >= 0) ?
            !r.state.list || r.state.index == r.state.list.length : // forwards
            r.state.index == 0; // backwards
        let reverse = () => r.state.direction = -1 * r.state.direction;
        let setUpdateList = update => {
            r.state.updateList = () => r.state.list = update();
        };
        let setResetUI = resetUI => r.state.resetUI = resetUI;
        let updateStepTime = time => r.state.stepTime = time;

        function step() {
            // Take a step
            r.state.doStep = false;
            let value = r.state.list[r.state.index];
            stepFn(value, r.state.index);
            r.state.index += r.state.direction;
            setTimeout(loop, r.state.stepTime);
        }

        function loop() {
            if (isReset())
                return ;
            if (isWaiting())
                return setTimeout(loop, r.state.refreshTime);
            if (isDone()) {
                r.state.justFinished = true;
                return reset();
            }
            return step();
        }

        function play() {
            r.state.updateList();
            r.state.started = true;
            r.state.playing = true;
            loop();
        }

        function getTogglePlay(then=(playing, started)=>{}) {
            r.state.togglePlay = () => {
                if (r.state.started) {
                    // Signal to Play/Pause execution
                    r.state.playing = !r.state.playing;
                } else {
                    play();
                }
                then(r.state.playing, r.state.started);
            };
            return r.state.togglePlay;
        }

        function manualStep() {
            if (r.state.started) {
                // Signal to perform a step
                r.state.doStep = true;
            } else {
                // First start and pause before manual stepping
                play();
                r.state.togglePlay();
            }
        }

        function reset() {
            r.state.resetUI();
            r.state = {...r.state,
                index: 0,
                direction: 1,
                refreshTime: 10,
                list: null,
                playing: false,
                started: false,
                justFinished: false,
            };
        }

        return {
            r,
            play,
            loop,
            reverse,
            setUpdateList,
            getTogglePlay,
            manualStep,
            setResetUI,
            reset,
            updateStepTime,
        };
    })();
    return stateController;
}