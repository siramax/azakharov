

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
    this.f = obj.sudoku;
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
    var p;
    
    var od = [ obj.offsetWidth, obj.offsetHeight ];//cell dimensions

    /// the most silly thing - coords and positioning of cypher panel
    this.cypher.style.display = "block";
    var cd = [ this.cypher.offsetWidth , this.cypher.offsetHeight ];//cypher dimen
    
    if ( 'absolute' === this.cypher.style.position ) {
      p = getPos( obj, this.cypher );
      var cleft = p[0] + ( od[ 0 ] / 2 ) - ( cd[0] / 2 ) ;

      this.cypher.style.top =  p[1] + ( od[ 1 ] / 2 ) - ( cd[1] / 2 ) + "px";
      if ( "undefined" !== this.f.wrapper.style.left ) { console.log( this.f.wrapper.style.left ); cleft -= this.f.wrapper.style.left; }
      
      this.cypher.style.left = cleft  + "px";
      
    } else {
      p = getPos( obj ); //position of left top corner of cell
      this.cypher.style.marginLeft =  p[0] + ( od[ 0 ] / 2 ) - ( cd[ 0 ] / 2 ) + "px";
      this.cypher.style.marginTop =   p[1] - ( od[ 1 ] / 2 ) - ( cd[ 1 ] / 2 ) -  this.f.wrapper.offsetHeight + "px" ;
    }
    //console.log( p, cd, od );//anim? TODO

  },

  onclick: function( e ) {
//SOLVING AROUND e and this TODO

// REMOVE disable flag TODO


    d = window.event ? window.event.srcElement : e.target;
    var n = parseInt( d.getAttribute( "value" ), 10 );

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

/**
 * Safari contains is broken, but appears to be fixed in WebKit 522+
 * @type {Boolean}
 * @private
 */
/*goog_dom_BAD_CONTAINS_SAFARI_ = goog.userAgent.SAFARI &&
   goog.userAgent.compare(goog.userAgent.VERSION, '521') <= 0;*/
goog = { dom: {} }
/**
 * Enumeration for DOM node types (for reference)
 * @enum {Number}
 */
goog.dom.NodeType = {
  ELEMENT: 1,
  ATTRIBUTE: 2,
  TEXT: 3,
  CDATA_SECTION: 4,
  ENTITY_REFERENCE: 5,
  ENTITY: 6,
  PROCESSING_INSTRUCTION: 7,
  COMMENT: 8,
  DOCUMENT: 9,
  DOCUMENT_TYPE: 10,
  DOCUMENT_FRAGMENT: 11,
  NOTATION: 12
};
/**
 * Whether a node contains another node
 * @param {Node} parent The node that should contain the other node
 * @param {Node} descendant The node to test presence of
 * @return {Boolean}
 */
goog.dom.contains = function(parent, descendant) {
  // We use browser specific methods for this if available since it is faster
  // that way.

  // IE / Safari(some) DOM
  if (typeof parent.contains != 'undefined' && /*!goog.dom.BAD_CONTAINS_SAFARI_ &&*/
      descendant.nodeType == goog.dom.NodeType.ELEMENT) {
    return parent == descendant || parent.contains(descendant);
  }

  // W3C DOM Level 3
  if (typeof parent.compareDocumentPosition != 'undefined') {
    return parent == descendant ||
        Boolean(parent.compareDocumentPosition(descendant) & 16);
  }

  // W3C DOM Level 1
  while (descendant && parent != descendant) {
    descendant = descendant.parentNode;
  }
  return descendant == parent;
};

getPos = function( obj, stopOn ) {
/// avoid empty calls to this revursive, 
/// so no getPos( null ) will be
/// bitty but pleasure :)
  //console.log( obj, obj.offsetLeft, stopOn, goog.dom.contains( obj, stopOn ) );
  if ( "undefined" !== typeof stopOn && stopOn && goog.dom.contains( obj, stopOn ) ) {
    return [ 0, 0 ]
  }
  
  if ( obj.offsetParent && 
    "undefined" !== typeof( obj.offsetParent.offsetLeft ) && 
    "undefined" !== typeof( obj.offsetParent.offsetTop ) ) {
    var pp = getPos( obj.offsetParent, stopOn );

    //console.log( "parent: ", pp );
    //console.log( "this: x,y: ", obj, obj.offsetLeft + pp[0]- obj.scrollLeft, obj.offsetTop + pp[1] - obj.scrollTop );
    return [ obj.offsetLeft + pp[0], obj.offsetTop + pp[1] ];

  } else {//dummy
    //console.log( "no parent" , obj );
    return [ obj.offsetLeft, obj.offsetTop ];
  }
};