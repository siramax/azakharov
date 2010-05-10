/**
 * @author Andrey Zakharov for vaultsoft.ru
 */
//-------------------------------------
( function() {


    Drupal.behaviors.extendView = function( context ) {
        //console.log( this );
    }
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
*/


    var extendView = function( params ) {//TODO settings type
        var self = this;
        var params = params || {};
        var trigger = params.trigger || $( "<div id = triggerView></div>" ).prependTo( "body" ).get( 0 );//DOM
        var indica = params.indicator || $( "<div id = indicator></div>" ).prependTo( "#footer" ).get( 0 );//DOM
        var init_timeout = params.init_timeout || 7000; //5s
        var tick = params.tick || 100;
        var regions = params.regions ||  "#sidebar-left, #sidebar-right";
        var contentClasses =  params.classes || "narrow-left narrow-right";
        var toShow;//to cancel
        //console.log( contentClasses );
        this.state = 0;     // 0 - off 1 - shown, 2 - hidden
        this.timeout = init_timeout;   //to count hidding, of == 0 and shown - hide
        this.timeoutShow = init_timeout / 10;
        /** 
         * off - entire timer off
         * on - timer on, shown
         * out - timer on, hidden 
         */
        this.turnOff =  function( e ) { var oldState = state; state = 0; return (function() {state = oldState}); }//PI
        this.turnOn =   function( e ) { self.state = 1; self.adjust(); self.timeout = init_timeout; setTimeout( self.loop, tick ); }
        this.turnOut =  function( e ) { self.state = 2; self.adjust(); self.timeoutShow = init_timeout / 10; }
        this.breakShow = function( e ) { console.log( "breakShow" );if ( state == 2 && toShow ) { clearTimeout( toShow ) } }
        this.triggerView = function( e ) { (state == 1)? turnOut(): turnOn(); return state }

        this.adjust = function() {

            if ( self.state == 1 ) {//shown
                $( regions ).removeClass( "hidden-by-pos" );
                $( "#content" ).addClass( contentClasses );//TODO
                $( trigger ).html(  "&lArr;" );//show backward arrow

            } else {//hidden? show!
                $( regions ).addClass( "hidden-by-pos" );
                $( "#content" ).removeClass( contentClasses );
                $( trigger ).html(  "&rArr;" );
            }
        }
        
        /* abstract action that reset the timer */
        this.humanAct = function( e ) {//always turn widget ON
console.log( "humanAct" );
            if ( self.state == 2 ) {
                toShow = setTimeout( loop, this );
                //turnOn();
            }

            self.timeout = init_timeout;
        }

        this.loop = function() {//state machine

            if( state > 0 ) {//not off - update time
                
                if ( state == 1 ) {//shown
                    indica.innerHTML = self.timeout + " / " + self.timeoutShow;
                    self.timeout -= tick;

                    if ( self.timeout > 0 ) {
                        //1 - shown and counting further
                        setTimeout( loop, tick );
                    } else {//new state
                        self.turnOut();// no timeout? //CustomEvent?
                    }
                } else {//hidden
                    indica.innerHTML = self.timeout + " / " + self.timeoutShow;
                    self.timeoutShow -= tick;

                    if ( self.timeoutShow > 0 ) {
                        //1 - shown and counting further
                        toShow = setTimeout( loop, tick );
                    } else {//new state
                        self.turnOn();// no timeout? //CustomEvent?
                    }
                }

            } else {
                setTimeout( loop, tick );//check for switch on
            }
        }

        $( regions ).click( humanAct ).mousemove( humanAct ).mouseout( breakShow ).
            find( "input, a" ).focus( turnOff ).blur( turnOn );

        //trigger.state = this.state;//&rArr;
        $( trigger ).removeClass( "hidden" ).click( self.triggerView );//some internal code

        turnOn();//here we go...
    };

    extendView.prototype = {
        currentState: null, // current state of finite state machine (one of "actionTransitionF
        Shown: {
            focus: function( e ) {
                this.cancelTimer();
                return "Stop";
            },
            mousemove : function( e ) {
                this.cancelTimer();
                return this.currentState;
            }
        },
    };

    $( document ).ready( function() {
        var sideBars = "" + ($( "#content" ).hasClass( "with-sidebar-left" )? "with-sidebar-left ": "") + 
                ($( "#content" ).hasClass( "with-sidebar-right" )? "with-sidebar-right" :"");

        if ( sideBars.length ) {
            extendView( { 
                trigger: $( "#triggerView" ).get( 0 ),
                classes: sideBars, //adapt to current layout.. TODO
            
            } );
        }
    } );
} ) //create anon func
(); //execute


//-------------------------------------


