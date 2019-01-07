
const Main = (() => {

    function init() {
    // Initialize the interface and controllers
        // Prepare the canvas
        Canvas.init();
        // Define the list to contain algorithm points
        const points = [];
        // Define a function to get an updated state list
        const updateList = () => Graham.scan(points);
        // Create the play controller to manage the play state and actions
        const playController = PlayController(updateList, Interface.GetPlayInterval());
        // Initialize the interface
        Interface.init(points, playController);
    }

    return { init };
})();

// Initialize interactive algorithm visualization at window onload event
window.onload = Main.init;