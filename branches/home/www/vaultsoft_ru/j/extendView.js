/**
 * @author Andrey Zakharov for vaultsoft.ru
 */
//-------------------------------------
;( function() {

    /*Drupal.behaviors.extendView = function( context ) {
        //console.log( this );
    };*/
/*
We should have two major states - sidebars shown (ss) and sidebars hidden (sh)
When ss, there are another two ministates - user working with sidebars, user working with content /sidebar idling/
When sh, just show shortcut to show sidebars
So. plan is:
    1. Have a shortcut trigger to show/hide sbars
    2. Count idling and graceful hide sidebars
    3. Show sidebars when needed
    4. Timeout onhover

Also, need attension stop pause at the middle of the ride for a .... 3 secs is enoigh to hover over CRAZY sidebar!!!:)

Attach events for hover and click (touch UI)

depend on $.cookie :(
*/


    var extendView = function( paramTable ) {//TODO settings type
        var self = this;
        var params = paramTable                 || {};
        this.trigger = params.trigger           || $( "<div id = triggerView></div>" ).prependTo( "body" ).get( 0 );//DOM
//        var indica = params.indicator || $( "<div id = indicator></div>" ).prependTo( "#footer" ).get( 0 );//DOM
        this.regions = params.regions           || "#sidebar-left, #sidebar-right";
        this.contentClasses =  params.classes   || "narrow-left narrow-right";
        this.content = params.content           || "#content";
        this.cookieName = params.cookieName     || "extendViewState";
        this.initialState = params.initialState || $.cookie( this.cookieName ) || "Shown";
        this.arrowLeft = "&#x25C0;";//&lArr;
        this.arrowRight = "&#x25B6;";// "&rArr;" 

        if ( "undefined" == typeof this.actionTransitionFunctions[ this.initialState ] ) { this.initialState = "Shown"; }

        this.currentState = this.initialState;
        this.currentState = this.doActionTransition( this.initialState, "restore" );

        $( this.regions ).click( function( e ) { self.handleEvent( e ); }/*late binding*/ ).
            mousemove( function( e ) { self.handleEvent( e ); } ).
            mouseout( function( e ) { self.handleEvent( e ); } ).
            find( "input, a" ).
                focus( function( e ) { self.handleEvent( e ); } ).
                blur( function( e ) { self.handleEvent( e ); } );

        $( this.trigger ).removeClass( "hidden" ).
            click( function( e ) { self.handleEvent( e ); e.target.inn = false; } ).
            mouseover( function ( e ) {
                e.target.inn = false;
                if ( self.currentState == "Hidden" ) {
                    e.target.inn = true;
                }
            } ).
            mouseout( function ( e ) {
                e.target.inn = false;
            } ).
            mousemove( function( e ) {
                if ( self.currentState != "Hidden" ) {
                    self.handleEvent( e );
                } else {//only if "in" later
                    if ( e.target.inn ) {
                        self.handleEvent( e );
                    }
                }
                e.target.inn = false;
            } );//some internal code
    };

    extendView.prototype = {
        currentState:               null, // current state of finite state machine (one of "actionTransitionFunctions" properties)
        trace:                      function ( obj ) { if ( "undefined" != typeof(console) ) { console.log( obj ); } },
        actionTransitionFunctions:  { // main table TODO define at level above

            Shown: {
                restore:            function() {//restore this state from cookie
                    $( this.regions ).removeClass( "peep half hidden-by-pos" );
                    $( this.content ).removeClass( "peep half" ).addClass( this.contentClasses );
                    $( this.trigger ).html( this.arrowLeft );
                    this.cancelTimer();
                    this.startTimer( this.timeoutShown * 1000 );//will trigger timeout
                    return this.currentState;
                },
                focus:              function( e ) {//->Stop
                    this.cancelTimer();
                    $( this.regions ).removeClass( "half" ).removeClass( "hidden-by-pos" );
                    $( this.content ).removeClass( "half" ).addClass( this.contentClasses );
                    $( this.trigger ).html( this.arrowLeft );
                    return "Stop";
                },
                mousemove:          function( e ) {//human act on sidebar
                    this.cancelTimer();
                    this.startTimer( this.timeoutShown * 1000 );//will trigger timeout
                    return "Shown";
                },
                click:              function( e ) {
                    if ( e && e.target === this.trigger ) { //->Hidden
                        if ( this.currentState == "Shown" ) {//force hide by trigger
                            this.cancelTimer();
                            return this.doActionTransition( "Half", "timeout", e ); 
                        }
                    }
                    return this.doActionTransition( "Shown", "mousemove", e );
                },
                timeout:            function( e ) {//->Half
                    $( this.regions ).addClass( "half" );
                    $( "#content" ).addClass( "half" );//TODO
                    $( this.trigger ).html( this.arrowRight );//show backward arrow
                    //start timer for hide
                    this.startTimer( this.timeoutHalfShown * 1000 );
                    return "Half";
                }
            },

            Stop : {
                restore:            function() {//restore this state from cookie
                    this.cancelTimer();
                    $( this.regions ).removeClass( "peep half hidden-by-pos" );
                    $( this.content ).removeClass( "peep half" ).addClass( this.contentClasses );
                    $( this.regions ).focus();
                    return this.currentState;
                },//below is a some duck - when user reloads page, blur event occures too.
                blur:               function( e ) { return this.doActionTransition( "Shown", "mousemove", e ); } //-> Shown
            },

            Half: {
                restore:            function() {//restore this state from cookie
                    $( this.regions ).removeClass( "peep hidden-by-pos" ).addClass( "half" );
                    $( this.content ).removeClass( "peep" ).addClass( "half" );
                    this.cancelTimer();
                    this.startTimer( this.timeoutHalfShown * 1000 );
                    $( this.trigger ).html( this.arrowRight );//show backward arrow
                    return this.currentState;
                },
                focus:              function( e ) { return this.doActionTransition( "Shown", "focus", e ); },//->Shown, Stop
                mousemove:          function( e ) { return this.doActionTransition( "Half", "click", e ); },//->Shown
                click:              function( e ) {//->Shown
                    this.cancelTimer();
                    $( this.regions ).removeClass( "half" );
                    $( "#content" ).removeClass( "half" );//TODO
                    $( this.trigger ).html( this.arrowLeft );//show backward arrow
                    return this.doActionTransition( "Shown", "click", e );
                },
                timeout:            function( e ) {//->Hidden
                    $( this.regions ).removeClass( "half" ).addClass( "hidden-by-pos" );
                    $( this.content ).removeClass( "half " + this.contentClasses );
                    $( this.trigger ).html( this.arrowRight );
                    this.cancelTimer();//any
                    return "Hidden";
                }
            },

            Hidden: {
                restore:            function() {//restore this state from cookie
                    $( this.regions ).removeClass( "peep half" ).addClass( "hidden-by-pos" );
                    $( this.content ).removeClass( "peep half " + this.contentClasses );
                    this.cancelTimer();
                    $( this.trigger ).html( this.arrowRight );
                    return this.currentState;
                },
                focus:              function( e ) { return this.doActionTransition( "Shown", "focus", e ); },//->Shown, Stop
                mousemove:          function( e ) {//->Hidden
                    if ( ! this.currentTimer ) {
                        $( this.regions ).addClass( "peep" );
                        $( this.content ).addClass( "peep" );
                        this.startTimer( this.timeoutPause * 1000 ); 
                    }
                },
                mouseout:           function( e ) {//->Hidden
                    $( this.regions ).removeClass( "peep" );
                    $( this.content ).removeClass( "peep" );
                    this.cancelTimer(); 
                },
                click:              function( e ) {//->Shown
                    this.doActionTransition( "Hidden", "mouseout", e );
                    $( this.regions ).removeClass( "hidden-by-pos" );
                    $( this.content ).addClass( this.contentClasses );
                    return this.doActionTransition( "Half", "click", e ); 
                },
                timeout:            function( e ) { return this.doActionTransition( "Hidden", "click", e ); }//->Shown
            }
        }, //end of actionTransitionFunctions
        
        timeoutShown:               5, //5 sec
        timeoutHalfShown:           3, //2 secs to reaction + 1s for transition
        timeoutPause:               1, //1 secs to start show
        /**
         * The 'handleEvent' method handles mouse and timer events as appropriate for 
         * the current state of the finite state machine.  The required 'event' argument 
         * is an object that has (at least) a 'type' property whose value corresponds to 
         * one of the event types in the current state's column of the 
         * 'actionTransitionFunctions' table.  For mouse events, it must also have 
         * 'clientX' and 'clientY' properties that specify the location of the cursor.
         * This method will select the appropriate action/transition function from the 
         * table and call it, passing on the 'event' argument. Note that the
         * action/transition function is invoked via the 'call' method of its Function
         * object, which allows us to set the context for the function so that the 
         * built-in variable 'this' will point at the extendView object.  If we
         * were to call the function directly from the 'actionTransitionFunctions' table, 
         * the 'this' variable would point into the table.  The action/transition function 
         * returns a new state, which this method will store as current state of the finite 
         * state machine.  This method does not return a value.
         */
        handleEvent: function( event ) { 
            var actionTransitionFunction = this.actionTransitionFunctions[ this.currentState ][ event.type ];
            //bubble event
            if ( !actionTransitionFunction ) { return true; } //actionTransitionFunction = this.unexpectedEvent;

            var nextState = actionTransitionFunction.call( this, event ) || this.currentState;
            if ( !this.actionTransitionFunctions[ nextState ] ) { nextState = this.undefinedState( event, nextState ); }
            //if (this.trace) this.trace("'" + event.type + "' event caused transition from '" + this.currentState + "' state to '" + nextState + "' state");
            this.currentState = nextState;
            $.cookie( this.cookieName, null );
            $.cookie( this.cookieName, this.currentState );
        },

        /**
         * The 'unexpectedEvent' method is called by the 'handleEvent' method when the
         * 'actionTransitionFunctions' table does not contain a function for the current
         * event and state.  The required 'event' argument is an object, but only its 
         * 'type' property is required.  The method cancels any active timers, and returns the finite state machine's 
         * initial state.  The unexpected event and state are shown in an "alert" dialog 
         * to the user, who will hopefully send a problem report to the author of this code.
         */
        unexpectedEvent: function( event ) { 
            this.cancelTimer();
            //this.cancelTicker();
            //alert("extendView handled unexpected event '" + event.type + "' in state '" + this.currentState + "' for id='" + this.regions + "' running browser " + window.navigator.userAgent);
            return this.initialState; 
        },  
        
        /**
         * The 'undefinedState' method is called by the 'handleEvent' method when the
         * 'actionTransitionFunctions' table does not contain a column for the next 
         * state returned by the selected function.  The required 'state' argument is 
         * the name of the undefined state.  The method cancels any active timers, and returns the finite state machine's 
         * initial state.  The undefind state is shown in an "alert" dialog to the user, 
         * who will hopefully send a problem report to the author of this code.
         */
        undefinedState: function(event, state) {
            this.cancelTimer();
            //this.cancelTicker();
            //alert("extendView transitioned to undefined state '" + state + "' from state '" + this.currentState + "' due to event '" + event.type + "' from HTML element id='" + this.regions + "' running browser " + window.navigator.userAgent);
            return this.initialState; 
        },
        /**
         * The "doActionTransition" method is used in the "actionTransitionFunctions" 
         * table when one function takes exactly the same actions as another function 
         * in the table.  It selects another function from the table, using the required
         * "anotherState" and "anotherEventType" arguments, and calls that function, passing
         * on the required "event" argument, and then returning its return value.  As with
         * the "handleEvent" method, the function is called via the "call" method of its 
         * Function object, which allows us to set its context so that the build-in "this"
         * variable will point to the FadingTooltip object while the function executes. 
         */
        doActionTransition: function( anotherState, anotherEventType, event ) {
            return this.actionTransitionFunctions[ anotherState ][ anotherEventType ].call( this, event );
        },

        /**
        * The 'startTimer' method starts a one-shot timer.  The required 'timeout'
        * argument specifies the duration of the timer in milliseconds.  The
        * method defines an anonymous function for the timeout event handler.
        * When the browser calls timer event handlers, 'this' points at the 
        * global window object.  Therefore, a pointer to the FadeTooltip object
        * is copied to the 'self' local variable and enclosed with the anonymous
        * function definition so that the timeout event handler can locate the 
        * object when it is called.  The browser does not pass any arguments to
        * timer event handlers, so the timeout event handler creates a simple
        * "timer event" object containing only a 'type' property, and passes
        * it to the 'handleEvent' method (defined above).  So, when the 
        * 'handleEvent' method executes, 'this' will point at the FadingTooltip 
        * object, and the 'type' property of its 'event' argument will identify 
        * it as a 'timeout' event.  The opaque reference to a timer object (returned
        * by the browser when any timer is started) is saved as a state variable 
        * so that the timer can be cancelled prematurely, if necessary.  This method
        * does not return a value.
        */
        startTimer: function( timeout ) { 
            var self = this;
            this.currentTimer = setTimeout( function() { self.handleEvent( { type: "timeout" } ); }, timeout );
        },
        /**
        * The 'cancelTimer' method cancels any one-shot timer that may be
        * running (or recently expired) and then removes the opaque reference to 
        * to the timer object saved in the 'startTimer' method (defined above).
        * This method does not return a value.
        */
        cancelTimer: function() { 
            if ( this.currentTimer ) { clearTimeout( this.currentTimer ); }
            this.currentTimer = null;
        }
    };

    $( document ).ready( function() {
        var sideBars = "" + ($( "#content" ).hasClass( "with-sidebar-left" )? "with-sidebar-left ": "") + 
                ($( "#content" ).hasClass( "with-sidebar-right" )? "with-sidebar-right" :"");

        if ( sideBars.length ) {
            var exv = new extendView( { 
                trigger: $( "#triggerView" ).get( 0 ),
                classes: sideBars //adapt to current layout.. TODO
            } );
        };
    } );
} ) //create anon func
(); //execute


//-------------------------------------


