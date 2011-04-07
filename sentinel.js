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
	
	/**
	 * Attach an event to the given element 
	 * 
	 * @name addEvent
	 * @param {DOMElement} element The element to attach the event to
	 * @param {string} type The element name sans 'on' prefix
	 * @param {function} handler Event handler
	 */
	var addEvent = function (element, type, handler) {
  	  // assign each event handler a unique ID
  	  if (!handler.$$guid) handler.$$guid = addEvent.guid++;
  	  // create a hash table of event types for the element
  	  if (!element.events) element.events = {};
  	  // create a hash table of event handlers for each element/event pair
  	  var handlers = element.events[type];
  	  if (!handlers) {
  	    handlers = element.events[type] = {};
  	    // store the existing event handler (if there is one)
  	    if (element["on" + type]) {
  	      handlers[0] = element["on" + type];
  	    }
  	  }
  	  // store the event handler in the hash table
  	  handlers[handler.$$guid] = handler;
  	  // assign a global event handler to do all the work
  	  element["on" + type] = handleEvent;
  	};

  	// a counter used to create unique IDs
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
  	  // delete the event handler from the hash table
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
  	  // grab the event object (IE uses a global event object)
  	  event = event || window.event;
  	  // get a reference to the hash table of event handlers
  	  var handlers = this.events[event.type];
  	  // execute each event handler
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
	
	sentinel.init = function(user) {
      if(user && typeof user.distance == "number") {
    	  config.defaultDistance = user.distance; 
      }
      
      addEvent(window, CONSTANTS.SCROLL, handler);
      config.init = true;
	};
	
	
})();  	