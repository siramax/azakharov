

cypher = {

  /**
   * Create common form of cypher and hides it
   * Call by some event? :)
   */
  init: function( parent, sudoku ) {

    if( "undefined" !== typeof( this.cypher ) ){ return ; }//already done

    //inject to DOM
    // in IE it hangs
    //this.cypher = document.body.appendChild( this.cypher );

    this.cypher =  document.createElement( "form" );

    if( "undefined" != typeof( parent )) { 
      parent.appendChild( this.cypher );

    } else {
      if( document.body.appendChild ) document.body.appendChild( this.cypher );
      else document.appendChild( this.cypher );
    }

    this.cypher.setAttribute( "id", "cypher" );
    this.cypher.className = "cypher";
    this.cypher.style.display = "none";
    this.cypher.style.position = "absolute";
    //to speed up 
    // we dont need now this 
    this.cypher.buttons = [];
    
    for ( var i = 1; i < 10; i++ ) {
      var b = document.createElement( "input" );
      b.cypher = this;//how about mem... TODO bench
      b.setAttribute( "type", "button" );
      sudoku.ae( b, "click", this.onclick );//callbaack 
      b.setAttribute( "value", i );
      this.cypher.buttons[ i ] =  //need this for cycle through cypher buttons
        this.cypher.appendChild( b );

      if ( 0 === ( i % 3 ) ) {
        this.cypher.appendChild( document.createElement( "div" ) ).className = "clear-right";
      }
    }
//CLEAR BUTTON
    b = document.createElement( "input" );
    b.cypher = this;
    b.setAttribute( "type", "button" );
    b.setAttribute( "value", "0" );
    b.className= "fit";
    sudoku.ae( b, "click", this.onclick );
    this.cypher.buttons['clear'] = //need this for cycle through cypher buttons
    this.cypher.appendChild( b );
//CLOSE BUTTON
    b =  document.createElement( "input" );
    b.cypher = this;
    b.setAttribute( "type", "button" );
    b.setAttribute( "value", "X" );
    b.className =  "bold" ;
    sudoku.ae( b, "click" , this.close );
    this.cypher.buttons['close'] = 
    this.cypher.appendChild( b );

  },

  /**
   * @param obj TD invoker of ask
   */
  ask: function( obj ) {//TODO method of DOM #cypher. which cloning if this is needed 
/// different fields of page, END TODO

/// here we have egg and mother dillema
    if ( "undefined" === typeof( this.cypher ) ) { this.init( obj.sudoku.wrapper ); }//error
    this.invoker = obj;
    this.f = this.invoker.sudoku;
    
    this.f.f.className += " asking";////HMMMMMMMMMMMMMMMMMMM
    
//HERE MUST BE
///check for avalaibility of numbers
    var buttons = this.cypher.buttons;

// loop thru all child nodes
    for ( var i = 1; i < buttons.length; i++ ) {
      buttons[ i ].disabled = !this.f.canbe( i , obj.cx, obj.cy );
            // do something with node here
    }

/// MOVING TO POS

    //console.log( obj, getPos( obj ) );
    // below works for absolute poss, but in TD :)
    var p = getPos( obj );//position of left top corner of cell
    
    var od = [ obj.offsetWidth, obj.offsetHeight ];//cell dimensions

    /// the most silly thing - coords and positioning of cypher panel
    this.cypher.style.display = "block";
    var cd = [ this.cypher.offsetWidth , this.cypher.offsetHeight ];//cypher dimen
    
    if ( 'absolute' == this.cypher.style.position ) {
      this.cypher.style.left = p[0] + ( od[ 0 ] / 2 ) - ( cd[0] / 2 ) + "px";
      this.cypher.style.top =  p[1] + ( od[ 1 ] / 2 ) - ( cd[1] / 2 ) + "px";

    } else {
      this.cypher.style.marginLeft =  p[0] + ( od[ 0 ] / 2 ) - ( cd[ 0 ] / 2 ) + "px";
      this.cypher.style.marginTop =   p[1] - ( od[ 1 ] / 2 ) - ( cd[ 1 ] / 2 ) -  this.f.wrapper.offsetHeight + "px" ;
    }
    //console.log( p, cd, od );//anim? TODO

  },

  onclick: function( e ) {
//SOLVING AROUND e and this TODO

// REMOVE disable flag TODO


    d = window.event ? window.event.srcElement : e.target;
    var n = parseInt( d.getAttribute( "value" ) );

    if ( !isNaN( n ) && ( "undefined" !== typeof( this.cypher ) ) ) {// here invoke chyper client NOW

      if( "undefined" == typeof( this.cypher.invoker )){
        error( "Cannot find target field" );
        return false;
      }
      var td = this.cypher.invoker;

      td.sudoku.set( td.cx, td.cy, n );
      this.cypher.close( e );
    } else {
      error( "Sorry. Smthg wrong with me" );
    }
  },//onclick

  close: function( e ){//close dialog

    if( "object" === typeof( arguments[0] )) {//MouSEEVENT?
      d = window.event ? window.event.srcElement : e.target;
    } else {
      d = this;//i dont know :)
    }

    d.parentNode.style.display = "none";

    d.cypher.invoker.sudoku.f.className=
    d.cypher.invoker.sudoku.f.className.replace(/\basking\b/g, "" );

  }
};

getPos = function( obj ) {
/// avoid empty calls to this revursive, 
/// so no getPos( null ) will be
/// bitty but pleasure :)
  if ( obj.offsetParent && 
    "undefined" !== typeof( obj.offsetParent.offsetLeft ) && 
    "undefined" !== typeof( obj.offsetParent.offsetTop ) ) {
    pp = getPos( obj.offsetParent );

    //console.log( "parent: ", pp );
    //console.log( "this: x,y: ", obj, obj.offsetLeft + pp[0]- obj.scrollLeft, obj.offsetTop + pp[1] - obj.scrollTop );
    return [ obj.offsetLeft + pp[0], obj.offsetTop + pp[1] ];

  } else {//dummy
    //console.log( "no parent" , obj );
    return [ obj.offsetLeft, obj.offsetTop ];
  }
};