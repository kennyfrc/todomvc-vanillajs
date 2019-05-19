## TodoMVC - VanillaJS Modified

### A'HAS:

#### remove methods
* to change from methods to functions, you mainly need to remove the `this` keywords
* if you have a separate initialization function, you'll need to initialize them now upfront
* if you're toggling data, there's a difference between rendered data and toggled data (see `renderedTodos` and `todos` in this app)
* instead of intializing at the end, you initialize at the start. also, you just invoke the event listeneres at the end.

#### remove jquery
* event bubbling with arrow functions for binding events: [link](https://gomakethings.com/listening-to-multiple-events-in-vanilla-js/)
* toggling show and hide: [link](https://gomakethings.com/how-to-show-and-hide-elements-with-vanilla-javascript/)
* used if-then statements in lieu of jquery callbacks
