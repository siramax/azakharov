/**
 * Complex client navigation. for at least mobile
 */

/**
 * Adds drupal behavior
 * @uses activemenu/menu
 * set state = addClass/removeClass
 */
Drupal.behaviors.activeNav = function( context ) {
    //alert('hello');
    //TODO drupal.settings
    var self = this;
    
    if ( "undefined" == typeof( Drupal.behaviors.activeMenu ) ) {//error
        
        if ( console ) {
            console.log( "ERROR: Drupal.behaviors.activeMenu empty. Install activemenu module");
        }
        
        return false;//error
    }
    
    var strTagName = "#breadcrumb:not(.activenav-js)";
    
    if ( ! context ) {
        return strTagName;
    }
    
    //for every ...tree TODO
    $( strTagName ).each( function() {// BTW we need "details list" of choices with iconsets :)
        
        //find all separators THEME specific, TODO ... JSON injecting.. Drupal.settings
        $( this ).find( ".breadcrumb > li" ).
        
            each( function() {
                
                this.anav = 1;
                
                $( this ).click( function ( e ) {//onhover
                    self.toggleSiblingsTip( this, e );//use this request object
                } );
                
            } ).addClass( "collapsed" ).parent( "#breadcrumb" ).addClass( "activenav-js" );
    } );
    
    /**
     * Event Slot of clicking on separator
     * @param sep DOM element attached to 
     * @param e event
     * @type private
     */
    this.toggleSiblingsTip = function ( sep, e ) {
        
//        ajaxSets = {
//                type: 'POST',
//                url: url,
//                data: {path: path},
//                dataType: 'json',
//                complete: function ( data ) {
//                    $( sep ).removeClass('loading');//controller
//                },
//        }
        //CONTROLLER function
        var Show = function( s ) {
            //just show
            return $( s ).addClass( 'animating' ).find( 'ul:first' ).slideDown( 200, function() {
                $( this ).parents( '.animating' ).removeClass( 'animating' )
            } );
        }
        
        //CONTROLLER function
        var Hide = function( s ) {
            return $( s ).
                removeClass( 'expanded' ).
                addClass( 'collapsed' ).
                find( 'ul:first' ).addClass( 'animating' ).//hack move above 
                
                slideUp( 200, function() {
                    $( this ).parents( '.animating' ).removeClass( 'animating' )
                } );
        }
        // Only toggle if this is the element that was clicked.
        // Otherwise, a parent li element might be toggled too.
        // Don't animate multiple times.
        if ( e && sep == e.target && !$( sep ).is( '.animating' ) ) {
            
            if ( $( sep ).is( '.collapsed' ) ) { //fork for already opened and closed
                
                var items = $( sep ). // count possible items to go
                    removeClass( 'collapsed' ).                //sliding animation?
                    addClass( 'expanded' ).
                    find( 'ul:first' ).size();
                
                if ( 0 == items ) { //ajax load by active menu
                    self.loadNextItems( sep, function( sep ) {//success finish by
                        this.Show( sep );
                    } );//async
                    //breadcrumb model - get left (prev) path of breadcrumb link
                } 
                
                this.Show( sep );


              } else {
                  this.Hide( sep );
              }
            //alert( menu );
        }
    };
    
    /**
     * fills the tip for separator in breadcrumb
     */
    this.loadNextItems = function( sep, funcSuccess ) {//getDataPage :)
        //show loading
        //here not just add class, but
        // shows to users < "busy" - operation desc - "cancel" "repeat?">
        $( sep ).addClass( 'anav-processing loading' );
        //here anav-processing is mmore internal thing, so it will faster sep.anav-processing = 1 :)
        console.log( sep, "Start loading for " );
        var url = "/activemenu/menu";
        //console.log( sep );
        var path =  Drupal.getPath(  $( sep ).prev( "li" ).children( "a" ).attr( "href" )  );
        console.log( sep, url, path );
        $.ajax( { // TODO calculate rows, sort,  to retrieve
            type: 'POST',
            url: url,
            data: {path: path},
            dataType: 'json',
            complete: function ( data ) {
                $( sep ).removeClass('loading');//controller
            },
            success: function ( data ) {

                //not replace old results...
                if ( $( sep ).children( 'ul' ).length > 0) {
                    return;
                }

                var dummy = document.createElement('div');
                $( dummy ).html( data.content );//BAAD DEsign

                $( sep ).append(//parse result? jQuery live TODO
                        //TODO calc screen rows and provide "more >" link
                        $( dummy ).find( 'li:has(> a[href*='+ path +'])').find( '> ul') 
                ).removeClass( 'collapsed' ).addClass( 'expanded' ).unbind( 'click' ).

                click( function ( e ) {
                    self.toggleSiblingsTip( this, e );
                } );

                Drupal.attachBehaviors( sep );
                
                if ( funcSuccess ) funcSuccess( sep );//BAAD DEsign
            },
            error: function ( xmlhttp ) {
                
                if( xmlhttp.status >= 400 ) {
                    alert( 'An HTTP error '+ xmlhttp.status +' occured.\n' + url );
                    
                } else {
                    console.log( 'Strange status ', xmlhttp );
                }
                    
                $( sep ).addClass('error collapsed');
            }
        });
    }
    
    //console.log( this );
}


//unit tests
//t1 = Drupal.behaviors.activeNav( null );
//t2 = Drupal.behaviors.activeNav( t1 );
