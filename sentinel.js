 /* 
  * Sentinel JS 
  * Author : Kartik Rao - kartikeya.rao@gmail.com 
  * Version : 1.0 
  * 
  * MIT Licensed for Non Commercial Use 
  * 
  * For commercial use please contact the author 
  * 
  */
(function () {
	window.sentinel = {};
	
	/* Event handling code is based on Dean Edward's event js*/
	
	/**
	 * Attach an event to the given element 
	 * 
	 * @name addEvent
	 * @param {DOMElement} element The element to attach the event to
	 * @param {string} type The element name sans 'on' prefix
	 * @param {function} handler Event handler
	 */
	var addEvent = function (element, type, handler) {
  	  if (!handler.$$guid) handler.$$guid = addEvent.guid++;
  	  if (!element.events) element.events = {};
  	  var handlers = element.events[type];
  	  if (!handlers) {
  	    handlers = element.events[type] = {};
  	    if (element["on" + type]) {
  	      handlers[0] = element["on" + type];
  	    }
  	  }
  	  handlers[handler.$$guid] = handler;
  	  element["on" + type] = handleEvent;
  	};

  	addEvent.guid = 1;

	/**
	 * Remove an event previously attached 
	 * 
	 * @name removeEvent
	 * @param {DOMElement} element The element on which the event was attached
	 * @param {string} type The element name sans 'on' prefix
	 * @param {function} handler Event handler
	 */
  	var removeEvent = function (element, type, handler) {
  	  if (element.events && element.events[type]) {
  	    delete element.events[type][handler.$$guid];
  	  }
  	};

	/**
	 * Event handler proxy, recieves events and fires the registered handler 
	 * 
	 * @name handleEvent
	 * @param {object} event The event to handle
	 */
  	var handleEvent = function (event) {
  	  event = event || window.event;
  	  var handlers = this.events[event.type];
  	  for (var i in handlers) {
  	    this.$$handleEvent = handlers[i];
  	    this.$$handleEvent(event);
  	  }
  	};
  	
  	var support = { innerHeight : (typeof( window.innerHeight ) == 'number'),
			docElemClientHeight : document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ),
				docClientHeight : document.body && ( document.body.clientWidth || document.body.clientHeight )};
  	
  	var config = { guid : 0, defaultDistance : 100 };
  	
  	var stack = {};
  	
  	var CONSTANTS = { HASH : 'hash', SCROLL : 'scroll' };
  	
  	var elementInViewport = function(el, distance) {
    	var top = (document.documentElement.scrollTop ? 
              document.documentElement.scrollTop :
              document.body.scrollTop);
    	
    	var height = 0;
				
  	    if( support.innerHeight ) {
  	        //Non-IE
  	    	height = window.innerHeight;
  	    } else if( support.docElemClientHeight ) {
  	        //IE 6+ in 'standards compliant mode'
  	    	height = document.documentElement.clientHeight;
  	    } else if( support.docClientHeight ) {
  	        //IE 4 compatible
  	    	height = document.body.clientHeight;
  	    }
  	    
  	    var y = parseInt(el.offsetTop);
  	    var view = parseInt(height + top);
  	    
  	    if (view >= (y - distance)) {
  	    	return true;
  	    }
  	    return false;
	};
  	
  	var handler = function () {
      var hash;
      for(hash in stack) {
        if(stack.hasOwnProperty(hash)) {
      	  var element = stack[hash].element;
      	  var distance = stack[hash].distance;
            if(element.getAttribute(CONSTANTS.HASH) && elementInViewport(element, distance)) {
          	  try {
          		stack[hash].callback.call();
          		unwatchElement(hash);
          	  } catch(e) {
          		  throw e;
          	  }
            } 
        }
      }
    };
    
	/**
	 * Watch an element, execute the callback when it is within px distance
	 * 
	 * @name watchElement
	 * @param {DOMElement} el The element to watch
	 * @param {function} fn The callback to execute
	 * @param {number} px Execute callback when user is px distance away from scrolling into the element
	 */
    sentinel.watchElement = function(el, fn, px) {
  	  if (elementInViewport(el, px || config.defaultDistance)) {
  		  try {
  		    fn.call();
  		  } catch (e) {
  			throw e;
  		  }
  		  return;
	  }
	  if(!el.getAttribute(CONSTANTS.HASH)) {
  		var hash = config.guid++;
  	    el.setAttribute(CONSTANTS.HASH, hash);
  		stack[hash] = { element : el, callback : fn, distance : px || config.defaultDistance };
	  }
	};
    
	/**
	 * Unwatch the element
	 * 
	 * @private
	 * @name unwatchElement
	 * @param {string} hash Unique tracking id of the element
	 */
	sentinel.unwatchElement = function(hash) {
    	var item = stack[hash];
    	if(item) {
  	    	item.element.setAttribute(CONSTANTS.HASH, ''); 
  	        delete stack[hash];
  	        if(stack.length === 0) {
  	          removeEvent(window, CONSTANTS.SCROLL, handler);
  	        }
    	}
	};
	
	/**
	 * Initialises sentinel
	 * 
	 * @name init
	 * @param {object} user Object with distance parameter
	 */
	sentinel.init = function(user) {
      if(user && typeof user.distance == "number") {
    	  config.defaultDistance = user.distance; 
      }
      
      addEvent(window, CONSTANTS.SCROLL, handler);
      config.init = true;
	};
})();  	