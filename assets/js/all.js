/*!
 * jQuery.scrollTo
 * Copyright (c) 2007-2015 Ariel Flesler - aflesler ○ gmail • com | http://flesler.blogspot.com
 * Licensed under MIT
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 * @projectDescription Lightweight, cross-browser and highly customizable animated scrolling with jQuery
 * @author Ariel Flesler
 * @version 2.1.2
 */
;(function(factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof module !== 'undefined' && module.exports) {
		// CommonJS
		module.exports = factory(require('jquery'));
	} else {
		// Global
		factory(jQuery);
	}
})(function($) {
	'use strict';

	var $scrollTo = $.scrollTo = function(target, duration, settings) {
		return $(window).scrollTo(target, duration, settings);
	};

	$scrollTo.defaults = {
		axis:'xy',
		duration: 0,
		limit:true
	};

	function isWin(elem) {
		return !elem.nodeName ||
			$.inArray(elem.nodeName.toLowerCase(), ['iframe','#document','html','body']) !== -1;
	}		

	$.fn.scrollTo = function(target, duration, settings) {
		if (typeof duration === 'object') {
			settings = duration;
			duration = 0;
		}
		if (typeof settings === 'function') {
			settings = { onAfter:settings };
		}
		if (target === 'max') {
			target = 9e9;
		}

		settings = $.extend({}, $scrollTo.defaults, settings);
		// Speed is still recognized for backwards compatibility
		duration = duration || settings.duration;
		// Make sure the settings are given right
		var queue = settings.queue && settings.axis.length > 1;
		if (queue) {
			// Let's keep the overall duration
			duration /= 2;
		}
		settings.offset = both(settings.offset);
		settings.over = both(settings.over);

		return this.each(function() {
			// Null target yields nothing, just like jQuery does
			if (target === null) return;

			var win = isWin(this),
				elem = win ? this.contentWindow || window : this,
				$elem = $(elem),
				targ = target, 
				attr = {},
				toff;

			switch (typeof targ) {
				// A number will pass the regex
				case 'number':
				case 'string':
					if (/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)) {
						targ = both(targ);
						// We are done
						break;
					}
					// Relative/Absolute selector
					targ = win ? $(targ) : $(targ, elem);
					/* falls through */
				case 'object':
					if (targ.length === 0) return;
					// DOMElement / jQuery
					if (targ.is || targ.style) {
						// Get the real position of the target
						toff = (targ = $(targ)).offset();
					}
			}

			var offset = $.isFunction(settings.offset) && settings.offset(elem, targ) || settings.offset;

			$.each(settings.axis.split(''), function(i, axis) {
				var Pos	= axis === 'x' ? 'Left' : 'Top',
					pos = Pos.toLowerCase(),
					key = 'scroll' + Pos,
					prev = $elem[key](),
					max = $scrollTo.max(elem, axis);

				if (toff) {// jQuery / DOMElement
					attr[key] = toff[pos] + (win ? 0 : prev - $elem.offset()[pos]);

					// If it's a dom element, reduce the margin
					if (settings.margin) {
						attr[key] -= parseInt(targ.css('margin'+Pos), 10) || 0;
						attr[key] -= parseInt(targ.css('border'+Pos+'Width'), 10) || 0;
					}

					attr[key] += offset[pos] || 0;

					if (settings.over[pos]) {
						// Scroll to a fraction of its width/height
						attr[key] += targ[axis === 'x'?'width':'height']() * settings.over[pos];
					}
				} else {
					var val = targ[pos];
					// Handle percentage values
					attr[key] = val.slice && val.slice(-1) === '%' ?
						parseFloat(val) / 100 * max
						: val;
				}

				// Number or 'number'
				if (settings.limit && /^\d+$/.test(attr[key])) {
					// Check the limits
					attr[key] = attr[key] <= 0 ? 0 : Math.min(attr[key], max);
				}

				// Don't waste time animating, if there's no need.
				if (!i && settings.axis.length > 1) {
					if (prev === attr[key]) {
						// No animation needed
						attr = {};
					} else if (queue) {
						// Intermediate animation
						animate(settings.onAfterFirst);
						// Don't animate this axis again in the next iteration.
						attr = {};
					}
				}
			});

			animate(settings.onAfter);

			function animate(callback) {
				var opts = $.extend({}, settings, {
					// The queue setting conflicts with animate()
					// Force it to always be true
					queue: true,
					duration: duration,
					complete: callback && function() {
						callback.call(elem, targ, settings);
					}
				});
				$elem.animate(attr, opts);
			}
		});
	};

	// Max scrolling position, works on quirks mode
	// It only fails (not too badly) on IE, quirks mode.
	$scrollTo.max = function(elem, axis) {
		var Dim = axis === 'x' ? 'Width' : 'Height',
			scroll = 'scroll'+Dim;

		if (!isWin(elem))
			return elem[scroll] - $(elem)[Dim.toLowerCase()]();

		var size = 'client' + Dim,
			doc = elem.ownerDocument || elem.document,
			html = doc.documentElement,
			body = doc.body;

		return Math.max(html[scroll], body[scroll]) - Math.min(html[size], body[size]);
	};

	function both(val) {
		return $.isFunction(val) || $.isPlainObject(val) ? val : { top:val, left:val };
	}

	// Add special hooks so that window scroll properties can be animated
	$.Tween.propHooks.scrollLeft = 
	$.Tween.propHooks.scrollTop = {
		get: function(t) {
			return $(t.elem)[t.prop]();
		},
		set: function(t) {
			var curr = this.get(t);
			// If interrupt is true and user scrolled, stop animating
			if (t.options.interrupt && t._last && t._last !== curr) {
				return $(t.elem).stop();
			}
			var next = Math.round(t.now);
			// Don't waste CPU
			// Browsers don't render floating point scroll
			if (curr !== next) {
				$(t.elem)[t.prop](next);
				t._last = this.get(t);
			}
		}
	};

	// AMD requirement
	return $scrollTo;
});

/*!
Waypoints - 4.0.1
Copyright © 2011-2016 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
(function() {
  'use strict'

  var keyCounter = 0
  var allWaypoints = {}

  /* http://imakewebthings.com/waypoints/api/waypoint */
  function Waypoint(options) {
    if (!options) {
      throw new Error('No options passed to Waypoint constructor')
    }
    if (!options.element) {
      throw new Error('No element option passed to Waypoint constructor')
    }
    if (!options.handler) {
      throw new Error('No handler option passed to Waypoint constructor')
    }

    this.key = 'waypoint-' + keyCounter
    this.options = Waypoint.Adapter.extend({}, Waypoint.defaults, options)
    this.element = this.options.element
    this.adapter = new Waypoint.Adapter(this.element)
    this.callback = options.handler
    this.axis = this.options.horizontal ? 'horizontal' : 'vertical'
    this.enabled = this.options.enabled
    this.triggerPoint = null
    this.group = Waypoint.Group.findOrCreate({
      name: this.options.group,
      axis: this.axis
    })
    this.context = Waypoint.Context.findOrCreateByElement(this.options.context)

    if (Waypoint.offsetAliases[this.options.offset]) {
      this.options.offset = Waypoint.offsetAliases[this.options.offset]
    }
    this.group.add(this)
    this.context.add(this)
    allWaypoints[this.key] = this
    keyCounter += 1
  }

  /* Private */
  Waypoint.prototype.queueTrigger = function(direction) {
    this.group.queueTrigger(this, direction)
  }

  /* Private */
  Waypoint.prototype.trigger = function(args) {
    if (!this.enabled) {
      return
    }
    if (this.callback) {
      this.callback.apply(this, args)
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/destroy */
  Waypoint.prototype.destroy = function() {
    this.context.remove(this)
    this.group.remove(this)
    delete allWaypoints[this.key]
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/disable */
  Waypoint.prototype.disable = function() {
    this.enabled = false
    return this
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/enable */
  Waypoint.prototype.enable = function() {
    this.context.refresh()
    this.enabled = true
    return this
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/next */
  Waypoint.prototype.next = function() {
    return this.group.next(this)
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/previous */
  Waypoint.prototype.previous = function() {
    return this.group.previous(this)
  }

  /* Private */
  Waypoint.invokeAll = function(method) {
    var allWaypointsArray = []
    for (var waypointKey in allWaypoints) {
      allWaypointsArray.push(allWaypoints[waypointKey])
    }
    for (var i = 0, end = allWaypointsArray.length; i < end; i++) {
      allWaypointsArray[i][method]()
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/destroy-all */
  Waypoint.destroyAll = function() {
    Waypoint.invokeAll('destroy')
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/disable-all */
  Waypoint.disableAll = function() {
    Waypoint.invokeAll('disable')
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/enable-all */
  Waypoint.enableAll = function() {
    Waypoint.Context.refreshAll()
    for (var waypointKey in allWaypoints) {
      allWaypoints[waypointKey].enabled = true
    }
    return this
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/refresh-all */
  Waypoint.refreshAll = function() {
    Waypoint.Context.refreshAll()
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/viewport-height */
  Waypoint.viewportHeight = function() {
    return window.innerHeight || document.documentElement.clientHeight
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/viewport-width */
  Waypoint.viewportWidth = function() {
    return document.documentElement.clientWidth
  }

  Waypoint.adapters = []

  Waypoint.defaults = {
    context: window,
    continuous: true,
    enabled: true,
    group: 'default',
    horizontal: false,
    offset: 0
  }

  Waypoint.offsetAliases = {
    'bottom-in-view': function() {
      return this.context.innerHeight() - this.adapter.outerHeight()
    },
    'right-in-view': function() {
      return this.context.innerWidth() - this.adapter.outerWidth()
    }
  }

  window.Waypoint = Waypoint
}())
;(function() {
  'use strict'

  function requestAnimationFrameShim(callback) {
    window.setTimeout(callback, 1000 / 60)
  }

  var keyCounter = 0
  var contexts = {}
  var Waypoint = window.Waypoint
  var oldWindowLoad = window.onload

  /* http://imakewebthings.com/waypoints/api/context */
  function Context(element) {
    this.element = element
    this.Adapter = Waypoint.Adapter
    this.adapter = new this.Adapter(element)
    this.key = 'waypoint-context-' + keyCounter
    this.didScroll = false
    this.didResize = false
    this.oldScroll = {
      x: this.adapter.scrollLeft(),
      y: this.adapter.scrollTop()
    }
    this.waypoints = {
      vertical: {},
      horizontal: {}
    }

    element.waypointContextKey = this.key
    contexts[element.waypointContextKey] = this
    keyCounter += 1
    if (!Waypoint.windowContext) {
      Waypoint.windowContext = true
      Waypoint.windowContext = new Context(window)
    }

    this.createThrottledScrollHandler()
    this.createThrottledResizeHandler()
  }

  /* Private */
  Context.prototype.add = function(waypoint) {
    var axis = waypoint.options.horizontal ? 'horizontal' : 'vertical'
    this.waypoints[axis][waypoint.key] = waypoint
    this.refresh()
  }

  /* Private */
  Context.prototype.checkEmpty = function() {
    var horizontalEmpty = this.Adapter.isEmptyObject(this.waypoints.horizontal)
    var verticalEmpty = this.Adapter.isEmptyObject(this.waypoints.vertical)
    var isWindow = this.element == this.element.window
    if (horizontalEmpty && verticalEmpty && !isWindow) {
      this.adapter.off('.waypoints')
      delete contexts[this.key]
    }
  }

  /* Private */
  Context.prototype.createThrottledResizeHandler = function() {
    var self = this

    function resizeHandler() {
      self.handleResize()
      self.didResize = false
    }

    this.adapter.on('resize.waypoints', function() {
      if (!self.didResize) {
        self.didResize = true
        Waypoint.requestAnimationFrame(resizeHandler)
      }
    })
  }

  /* Private */
  Context.prototype.createThrottledScrollHandler = function() {
    var self = this
    function scrollHandler() {
      self.handleScroll()
      self.didScroll = false
    }

    this.adapter.on('scroll.waypoints', function() {
      if (!self.didScroll || Waypoint.isTouch) {
        self.didScroll = true
        Waypoint.requestAnimationFrame(scrollHandler)
      }
    })
  }

  /* Private */
  Context.prototype.handleResize = function() {
    Waypoint.Context.refreshAll()
  }

  /* Private */
  Context.prototype.handleScroll = function() {
    var triggeredGroups = {}
    var axes = {
      horizontal: {
        newScroll: this.adapter.scrollLeft(),
        oldScroll: this.oldScroll.x,
        forward: 'right',
        backward: 'left'
      },
      vertical: {
        newScroll: this.adapter.scrollTop(),
        oldScroll: this.oldScroll.y,
        forward: 'down',
        backward: 'up'
      }
    }

    for (var axisKey in axes) {
      var axis = axes[axisKey]
      var isForward = axis.newScroll > axis.oldScroll
      var direction = isForward ? axis.forward : axis.backward

      for (var waypointKey in this.waypoints[axisKey]) {
        var waypoint = this.waypoints[axisKey][waypointKey]
        if (waypoint.triggerPoint === null) {
          continue
        }
        var wasBeforeTriggerPoint = axis.oldScroll < waypoint.triggerPoint
        var nowAfterTriggerPoint = axis.newScroll >= waypoint.triggerPoint
        var crossedForward = wasBeforeTriggerPoint && nowAfterTriggerPoint
        var crossedBackward = !wasBeforeTriggerPoint && !nowAfterTriggerPoint
        if (crossedForward || crossedBackward) {
          waypoint.queueTrigger(direction)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
      }
    }

    for (var groupKey in triggeredGroups) {
      triggeredGroups[groupKey].flushTriggers()
    }

    this.oldScroll = {
      x: axes.horizontal.newScroll,
      y: axes.vertical.newScroll
    }
  }

  /* Private */
  Context.prototype.innerHeight = function() {
    /*eslint-disable eqeqeq */
    if (this.element == this.element.window) {
      return Waypoint.viewportHeight()
    }
    /*eslint-enable eqeqeq */
    return this.adapter.innerHeight()
  }

  /* Private */
  Context.prototype.remove = function(waypoint) {
    delete this.waypoints[waypoint.axis][waypoint.key]
    this.checkEmpty()
  }

  /* Private */
  Context.prototype.innerWidth = function() {
    /*eslint-disable eqeqeq */
    if (this.element == this.element.window) {
      return Waypoint.viewportWidth()
    }
    /*eslint-enable eqeqeq */
    return this.adapter.innerWidth()
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-destroy */
  Context.prototype.destroy = function() {
    var allWaypoints = []
    for (var axis in this.waypoints) {
      for (var waypointKey in this.waypoints[axis]) {
        allWaypoints.push(this.waypoints[axis][waypointKey])
      }
    }
    for (var i = 0, end = allWaypoints.length; i < end; i++) {
      allWaypoints[i].destroy()
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-refresh */
  Context.prototype.refresh = function() {
    /*eslint-disable eqeqeq */
    var isWindow = this.element == this.element.window
    /*eslint-enable eqeqeq */
    var contextOffset = isWindow ? undefined : this.adapter.offset()
    var triggeredGroups = {}
    var axes

    this.handleScroll()
    axes = {
      horizontal: {
        contextOffset: isWindow ? 0 : contextOffset.left,
        contextScroll: isWindow ? 0 : this.oldScroll.x,
        contextDimension: this.innerWidth(),
        oldScroll: this.oldScroll.x,
        forward: 'right',
        backward: 'left',
        offsetProp: 'left'
      },
      vertical: {
        contextOffset: isWindow ? 0 : contextOffset.top,
        contextScroll: isWindow ? 0 : this.oldScroll.y,
        contextDimension: this.innerHeight(),
        oldScroll: this.oldScroll.y,
        forward: 'down',
        backward: 'up',
        offsetProp: 'top'
      }
    }

    for (var axisKey in axes) {
      var axis = axes[axisKey]
      for (var waypointKey in this.waypoints[axisKey]) {
        var waypoint = this.waypoints[axisKey][waypointKey]
        var adjustment = waypoint.options.offset
        var oldTriggerPoint = waypoint.triggerPoint
        var elementOffset = 0
        var freshWaypoint = oldTriggerPoint == null
        var contextModifier, wasBeforeScroll, nowAfterScroll
        var triggeredBackward, triggeredForward

        if (waypoint.element !== waypoint.element.window) {
          elementOffset = waypoint.adapter.offset()[axis.offsetProp]
        }

        if (typeof adjustment === 'function') {
          adjustment = adjustment.apply(waypoint)
        }
        else if (typeof adjustment === 'string') {
          adjustment = parseFloat(adjustment)
          if (waypoint.options.offset.indexOf('%') > - 1) {
            adjustment = Math.ceil(axis.contextDimension * adjustment / 100)
          }
        }

        contextModifier = axis.contextScroll - axis.contextOffset
        waypoint.triggerPoint = Math.floor(elementOffset + contextModifier - adjustment)
        wasBeforeScroll = oldTriggerPoint < axis.oldScroll
        nowAfterScroll = waypoint.triggerPoint >= axis.oldScroll
        triggeredBackward = wasBeforeScroll && nowAfterScroll
        triggeredForward = !wasBeforeScroll && !nowAfterScroll

        if (!freshWaypoint && triggeredBackward) {
          waypoint.queueTrigger(axis.backward)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
        else if (!freshWaypoint && triggeredForward) {
          waypoint.queueTrigger(axis.forward)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
        else if (freshWaypoint && axis.oldScroll >= waypoint.triggerPoint) {
          waypoint.queueTrigger(axis.forward)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
      }
    }

    Waypoint.requestAnimationFrame(function() {
      for (var groupKey in triggeredGroups) {
        triggeredGroups[groupKey].flushTriggers()
      }
    })

    return this
  }

  /* Private */
  Context.findOrCreateByElement = function(element) {
    return Context.findByElement(element) || new Context(element)
  }

  /* Private */
  Context.refreshAll = function() {
    for (var contextId in contexts) {
      contexts[contextId].refresh()
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-find-by-element */
  Context.findByElement = function(element) {
    return contexts[element.waypointContextKey]
  }

  window.onload = function() {
    if (oldWindowLoad) {
      oldWindowLoad()
    }
    Context.refreshAll()
  }


  Waypoint.requestAnimationFrame = function(callback) {
    var requestFn = window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      requestAnimationFrameShim
    requestFn.call(window, callback)
  }
  Waypoint.Context = Context
}())
;(function() {
  'use strict'

  function byTriggerPoint(a, b) {
    return a.triggerPoint - b.triggerPoint
  }

  function byReverseTriggerPoint(a, b) {
    return b.triggerPoint - a.triggerPoint
  }

  var groups = {
    vertical: {},
    horizontal: {}
  }
  var Waypoint = window.Waypoint

  /* http://imakewebthings.com/waypoints/api/group */
  function Group(options) {
    this.name = options.name
    this.axis = options.axis
    this.id = this.name + '-' + this.axis
    this.waypoints = []
    this.clearTriggerQueues()
    groups[this.axis][this.name] = this
  }

  /* Private */
  Group.prototype.add = function(waypoint) {
    this.waypoints.push(waypoint)
  }

  /* Private */
  Group.prototype.clearTriggerQueues = function() {
    this.triggerQueues = {
      up: [],
      down: [],
      left: [],
      right: []
    }
  }

  /* Private */
  Group.prototype.flushTriggers = function() {
    for (var direction in this.triggerQueues) {
      var waypoints = this.triggerQueues[direction]
      var reverse = direction === 'up' || direction === 'left'
      waypoints.sort(reverse ? byReverseTriggerPoint : byTriggerPoint)
      for (var i = 0, end = waypoints.length; i < end; i += 1) {
        var waypoint = waypoints[i]
        if (waypoint.options.continuous || i === waypoints.length - 1) {
          waypoint.trigger([direction])
        }
      }
    }
    this.clearTriggerQueues()
  }

  /* Private */
  Group.prototype.next = function(waypoint) {
    this.waypoints.sort(byTriggerPoint)
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints)
    var isLast = index === this.waypoints.length - 1
    return isLast ? null : this.waypoints[index + 1]
  }

  /* Private */
  Group.prototype.previous = function(waypoint) {
    this.waypoints.sort(byTriggerPoint)
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints)
    return index ? this.waypoints[index - 1] : null
  }

  /* Private */
  Group.prototype.queueTrigger = function(waypoint, direction) {
    this.triggerQueues[direction].push(waypoint)
  }

  /* Private */
  Group.prototype.remove = function(waypoint) {
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints)
    if (index > -1) {
      this.waypoints.splice(index, 1)
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/first */
  Group.prototype.first = function() {
    return this.waypoints[0]
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/last */
  Group.prototype.last = function() {
    return this.waypoints[this.waypoints.length - 1]
  }

  /* Private */
  Group.findOrCreate = function(options) {
    return groups[options.axis][options.name] || new Group(options)
  }

  Waypoint.Group = Group
}())
;(function() {
  'use strict'

  var $ = window.jQuery
  var Waypoint = window.Waypoint

  function JQueryAdapter(element) {
    this.$element = $(element)
  }

  $.each([
    'innerHeight',
    'innerWidth',
    'off',
    'offset',
    'on',
    'outerHeight',
    'outerWidth',
    'scrollLeft',
    'scrollTop'
  ], function(i, method) {
    JQueryAdapter.prototype[method] = function() {
      var args = Array.prototype.slice.call(arguments)
      return this.$element[method].apply(this.$element, args)
    }
  })

  $.each([
    'extend',
    'inArray',
    'isEmptyObject'
  ], function(i, method) {
    JQueryAdapter[method] = $[method]
  })

  Waypoint.adapters.push({
    name: 'jquery',
    Adapter: JQueryAdapter
  })
  Waypoint.Adapter = JQueryAdapter
}())
;(function() {
  'use strict'

  var Waypoint = window.Waypoint

  function createExtension(framework) {
    return function() {
      var waypoints = []
      var overrides = arguments[0]

      if (framework.isFunction(arguments[0])) {
        overrides = framework.extend({}, arguments[1])
        overrides.handler = arguments[0]
      }

      this.each(function() {
        var options = framework.extend({}, overrides, {
          element: this
        })
        if (typeof options.context === 'string') {
          options.context = framework(this).closest(options.context)[0]
        }
        waypoints.push(new Waypoint(options))
      })

      return waypoints
    }
  }

  if (window.jQuery) {
    window.jQuery.fn.waypoint = createExtension(window.jQuery)
  }
  if (window.Zepto) {
    window.Zepto.fn.waypoint = createExtension(window.Zepto)
  }
}())
;
$(function () {
	$(".parallax-div").parallax(
		{imageSrc: "assets/img/woman-typing.jpg"});
	$(".parallax-div2").parallax(
		{imageSrc: "assets/img/hackathon.jpg"});
});

TweenMax.from(".wwclogo", 1.5,{scale:"2", opacity:"0", overwrite:"none"});


TweenMax.from(".apply_button", 1.5,{rotation:"-10", overwrite:"none"});


$(".infowindows").waypoint(function () {
	TweenMax.from(".window1", 1.5,{left:"150px", opacity:"0", overwrite:"none"});
}, {
	offset: '50%'
})

$(".facts").waypoint(function () {
	$(".counter").each(function() {
	  var $this = $(this),
	      countTo = $this.attr('data-count');
	  
	  $({ countNum: $this.text()}).animate({
	    countNum: countTo
	  },

	  {
	    duration: 2000,
	    easing:'linear',
	    step: function() {
	      $this.text(Math.floor(this.countNum));
	    },
	    complete: function() {
	      $this.text(this.countNum);
	      //alert('finished');
	    }

	  });  
	  
	});

	TweenMax.from(".counter_parent", 1.5,{top:"-150px", opacity:"0", overwrite:"none"});
}, {
	offset: '50%'
})








/*!
 * parallax.js v1.4.2 (http://pixelcog.github.io/parallax.js/)
 * @copyright 2016 PixelCog, Inc.
 * @license MIT (https://github.com/pixelcog/parallax.js/blob/master/LICENSE)
 */

;(function ( $, window, document, undefined ) {

  // Polyfill for requestAnimationFrame
  // via: https://gist.github.com/paulirish/1579671

  (function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
        || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
      window.requestAnimationFrame = function(callback) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
          timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };

    if (!window.cancelAnimationFrame)
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
  }());


  // Parallax Constructor

  function Parallax(element, options) {
    var self = this;

    if (typeof options == 'object') {
      delete options.refresh;
      delete options.render;
      $.extend(this, options);
    }

    this.$element = $(element);

    if (!this.imageSrc && this.$element.is('img')) {
      this.imageSrc = this.$element.attr('src');
    }

    var positions = (this.position + '').toLowerCase().match(/\S+/g) || [];

    if (positions.length < 1) {
      positions.push('center');
    }
    if (positions.length == 1) {
      positions.push(positions[0]);
    }

    if (positions[0] == 'top' || positions[0] == 'bottom' || positions[1] == 'left' || positions[1] == 'right') {
      positions = [positions[1], positions[0]];
    }

    if (this.positionX != undefined) positions[0] = this.positionX.toLowerCase();
    if (this.positionY != undefined) positions[1] = this.positionY.toLowerCase();

    self.positionX = positions[0];
    self.positionY = positions[1];

    if (this.positionX != 'left' && this.positionX != 'right') {
      if (isNaN(parseInt(this.positionX))) {
        this.positionX = 'center';
      } else {
        this.positionX = parseInt(this.positionX);
      }
    }

    if (this.positionY != 'top' && this.positionY != 'bottom') {
      if (isNaN(parseInt(this.positionY))) {
        this.positionY = 'center';
      } else {
        this.positionY = parseInt(this.positionY);
      }
    }

    this.position =
      this.positionX + (isNaN(this.positionX)? '' : 'px') + ' ' +
      this.positionY + (isNaN(this.positionY)? '' : 'px');

    if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
      if (this.imageSrc && this.iosFix && !this.$element.is('img')) {
        this.$element.css({
          backgroundImage: 'url(' + this.imageSrc + ')',
          backgroundSize: 'cover',
          backgroundPosition: this.position
        });
      }
      return this;
    }

    if (navigator.userAgent.match(/(Android)/)) {
      if (this.imageSrc && this.androidFix && !this.$element.is('img')) {
        this.$element.css({
          backgroundImage: 'url(' + this.imageSrc + ')',
          backgroundSize: 'cover',
          backgroundPosition: this.position
        });
      }
      return this;
    }

    this.$mirror = $('<div />').prependTo('body');

    var slider = this.$element.find('>.parallax-slider');
    var sliderExisted = false;

    if (slider.length == 0)
      this.$slider = $('<img />').prependTo(this.$mirror);
    else {
      this.$slider = slider.prependTo(this.$mirror)
      sliderExisted = true;
    }

    this.$mirror.addClass('parallax-mirror').css({
      visibility: 'hidden',
      zIndex: this.zIndex,
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden'
    });

    this.$slider.addClass('parallax-slider').one('load', function() {
      if (!self.naturalHeight || !self.naturalWidth) {
        self.naturalHeight = this.naturalHeight || this.height || 1;
        self.naturalWidth  = this.naturalWidth  || this.width  || 1;
      }
      self.aspectRatio = self.naturalWidth / self.naturalHeight;

      Parallax.isSetup || Parallax.setup();
      Parallax.sliders.push(self);
      Parallax.isFresh = false;
      Parallax.requestRender();
    });

    if (!sliderExisted)
      this.$slider[0].src = this.imageSrc;

    if (this.naturalHeight && this.naturalWidth || this.$slider[0].complete || slider.length > 0) {
      this.$slider.trigger('load');
    }

  };


  // Parallax Instance Methods

  $.extend(Parallax.prototype, {
    speed:    0.2,
    bleed:    0,
    zIndex:   -100,
    iosFix:   true,
    androidFix: true,
    position: 'center',
    overScrollFix: false,

    refresh: function() {
      this.boxWidth        = this.$element.outerWidth();
      this.boxHeight       = this.$element.outerHeight() + this.bleed * 2;
      this.boxOffsetTop    = this.$element.offset().top - this.bleed;
      this.boxOffsetLeft   = this.$element.offset().left;
      this.boxOffsetBottom = this.boxOffsetTop + this.boxHeight;

      var winHeight = Parallax.winHeight;
      var docHeight = Parallax.docHeight;
      var maxOffset = Math.min(this.boxOffsetTop, docHeight - winHeight);
      var minOffset = Math.max(this.boxOffsetTop + this.boxHeight - winHeight, 0);
      var imageHeightMin = this.boxHeight + (maxOffset - minOffset) * (1 - this.speed) | 0;
      var imageOffsetMin = (this.boxOffsetTop - maxOffset) * (1 - this.speed) | 0;

      if (imageHeightMin * this.aspectRatio >= this.boxWidth) {
        this.imageWidth    = imageHeightMin * this.aspectRatio | 0;
        this.imageHeight   = imageHeightMin;
        this.offsetBaseTop = imageOffsetMin;

        var margin = this.imageWidth - this.boxWidth;

        if (this.positionX == 'left') {
          this.offsetLeft = 0;
        } else if (this.positionX == 'right') {
          this.offsetLeft = - margin;
        } else if (!isNaN(this.positionX)) {
          this.offsetLeft = Math.max(this.positionX, - margin);
        } else {
          this.offsetLeft = - margin / 2 | 0;
        }
      } else {
        this.imageWidth    = this.boxWidth;
        this.imageHeight   = this.boxWidth / this.aspectRatio | 0;
        this.offsetLeft    = 0;

        var margin = this.imageHeight - imageHeightMin;

        if (this.positionY == 'top') {
          this.offsetBaseTop = imageOffsetMin;
        } else if (this.positionY == 'bottom') {
          this.offsetBaseTop = imageOffsetMin - margin;
        } else if (!isNaN(this.positionY)) {
          this.offsetBaseTop = imageOffsetMin + Math.max(this.positionY, - margin);
        } else {
          this.offsetBaseTop = imageOffsetMin - margin / 2 | 0;
        }
      }
    },

    render: function() {
      var scrollTop    = Parallax.scrollTop;
      var scrollLeft   = Parallax.scrollLeft;
      var overScroll   = this.overScrollFix ? Parallax.overScroll : 0;
      var scrollBottom = scrollTop + Parallax.winHeight;

      if (this.boxOffsetBottom > scrollTop && this.boxOffsetTop <= scrollBottom) {
        this.visibility = 'visible';
        this.mirrorTop = this.boxOffsetTop  - scrollTop;
        this.mirrorLeft = this.boxOffsetLeft - scrollLeft;
        this.offsetTop = this.offsetBaseTop - this.mirrorTop * (1 - this.speed);
      } else {
        this.visibility = 'hidden';
      }

      this.$mirror.css({
        transform: 'translate3d(0px, 0px, 0px)',
        visibility: this.visibility,
        top: this.mirrorTop - overScroll,
        left: this.mirrorLeft,
        height: this.boxHeight,
        width: this.boxWidth
      });

      this.$slider.css({
        transform: 'translate3d(0px, 0px, 0px)',
        position: 'absolute',
        top: this.offsetTop,
        left: this.offsetLeft,
        height: this.imageHeight,
        width: this.imageWidth,
        maxWidth: 'none'
      });
    }
  });


  // Parallax Static Methods

  $.extend(Parallax, {
    scrollTop:    0,
    scrollLeft:   0,
    winHeight:    0,
    winWidth:     0,
    docHeight:    1 << 30,
    docWidth:     1 << 30,
    sliders:      [],
    isReady:      false,
    isFresh:      false,
    isBusy:       false,

    setup: function() {
      if (this.isReady) return;

      var $doc = $(document), $win = $(window);

      var loadDimensions = function() {
        Parallax.winHeight = $win.height();
        Parallax.winWidth  = $win.width();
        Parallax.docHeight = $doc.height();
        Parallax.docWidth  = $doc.width();
      };

      var loadScrollPosition = function() {
        var winScrollTop  = $win.scrollTop();
        var scrollTopMax  = Parallax.docHeight - Parallax.winHeight;
        var scrollLeftMax = Parallax.docWidth  - Parallax.winWidth;
        Parallax.scrollTop  = Math.max(0, Math.min(scrollTopMax,  winScrollTop));
        Parallax.scrollLeft = Math.max(0, Math.min(scrollLeftMax, $win.scrollLeft()));
        Parallax.overScroll = Math.max(winScrollTop - scrollTopMax, Math.min(winScrollTop, 0));
      };

      $win.on('resize.px.parallax load.px.parallax', function() {
          loadDimensions();
          Parallax.isFresh = false;
          Parallax.requestRender();
        })
        .on('scroll.px.parallax load.px.parallax', function() {
          loadScrollPosition();
          Parallax.requestRender();
        });

      loadDimensions();
      loadScrollPosition();

      this.isReady = true;
    },

    configure: function(options) {
      if (typeof options == 'object') {
        delete options.refresh;
        delete options.render;
        $.extend(this.prototype, options);
      }
    },

    refresh: function() {
      $.each(this.sliders, function(){ this.refresh() });
      this.isFresh = true;
    },

    render: function() {
      this.isFresh || this.refresh();
      $.each(this.sliders, function(){ this.render() });
    },

    requestRender: function() {
      var self = this;

      if (!this.isBusy) {
        this.isBusy = true;
        window.requestAnimationFrame(function() {
          self.render();
          self.isBusy = false;
        });
      }
    },
    destroy: function(el){
      var i,
          parallaxElement = $(el).data('px.parallax');
      parallaxElement.$mirror.remove();
      for(i=0; i < this.sliders.length; i+=1){
        if(this.sliders[i] == parallaxElement){
          this.sliders.splice(i, 1);
        }
      }
      $(el).data('px.parallax', false);
      if(this.sliders.length === 0){
        $(window).off('scroll.px.parallax resize.px.parallax load.px.parallax');
        this.isReady = false;
        Parallax.isSetup = false;
      }
    }
  });


  // Parallax Plugin Definition

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var options = typeof option == 'object' && option;

      if (this == window || this == document || $this.is('body')) {
        Parallax.configure(options);
      }
      else if (!$this.data('px.parallax')) {
        options = $.extend({}, $this.data(), options);
        $this.data('px.parallax', new Parallax(this, options));
      }
      else if (typeof option == 'object')
      {
        $.extend($this.data('px.parallax'), options);
      }
      if (typeof option == 'string') {
        if(option == 'destroy'){
            Parallax['destroy'](this);
        }else{
          Parallax[option]();
        }
      }
    })
  };

  var old = $.fn.parallax;

  $.fn.parallax             = Plugin;
  $.fn.parallax.Constructor = Parallax;


  // Parallax No Conflict

  $.fn.parallax.noConflict = function () {
    $.fn.parallax = old;
    return this;
  };


  // Parallax Data-API

  $(document).on('ready.px.parallax.data-api', function () {
    $('[data-parallax="scroll"]').parallax();
  });

}(jQuery, window, document));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS5zY3JvbGxUby5qcyIsImpxdWVyeS53YXlwb2ludHMuanMiLCJtYWluLmpzIiwicGFyYWxsYXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFsbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogalF1ZXJ5LnNjcm9sbFRvXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxNSBBcmllbCBGbGVzbGVyIC0gYWZsZXNsZXIg4peLIGdtYWlsIOKAoiBjb20gfCBodHRwOi8vZmxlc2xlci5ibG9nc3BvdC5jb21cbiAqIExpY2Vuc2VkIHVuZGVyIE1JVFxuICogaHR0cDovL2ZsZXNsZXIuYmxvZ3Nwb3QuY29tLzIwMDcvMTAvanF1ZXJ5c2Nyb2xsdG8uaHRtbFxuICogQHByb2plY3REZXNjcmlwdGlvbiBMaWdodHdlaWdodCwgY3Jvc3MtYnJvd3NlciBhbmQgaGlnaGx5IGN1c3RvbWl6YWJsZSBhbmltYXRlZCBzY3JvbGxpbmcgd2l0aCBqUXVlcnlcbiAqIEBhdXRob3IgQXJpZWwgRmxlc2xlclxuICogQHZlcnNpb24gMi4xLjJcbiAqL1xuOyhmdW5jdGlvbihmYWN0b3J5KSB7XG5cdCd1c2Ugc3RyaWN0Jztcblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdC8vIEFNRFxuXHRcdGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcblx0fSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdC8vIENvbW1vbkpTXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ2pxdWVyeScpKTtcblx0fSBlbHNlIHtcblx0XHQvLyBHbG9iYWxcblx0XHRmYWN0b3J5KGpRdWVyeSk7XG5cdH1cbn0pKGZ1bmN0aW9uKCQpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciAkc2Nyb2xsVG8gPSAkLnNjcm9sbFRvID0gZnVuY3Rpb24odGFyZ2V0LCBkdXJhdGlvbiwgc2V0dGluZ3MpIHtcblx0XHRyZXR1cm4gJCh3aW5kb3cpLnNjcm9sbFRvKHRhcmdldCwgZHVyYXRpb24sIHNldHRpbmdzKTtcblx0fTtcblxuXHQkc2Nyb2xsVG8uZGVmYXVsdHMgPSB7XG5cdFx0YXhpczoneHknLFxuXHRcdGR1cmF0aW9uOiAwLFxuXHRcdGxpbWl0OnRydWVcblx0fTtcblxuXHRmdW5jdGlvbiBpc1dpbihlbGVtKSB7XG5cdFx0cmV0dXJuICFlbGVtLm5vZGVOYW1lIHx8XG5cdFx0XHQkLmluQXJyYXkoZWxlbS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpLCBbJ2lmcmFtZScsJyNkb2N1bWVudCcsJ2h0bWwnLCdib2R5J10pICE9PSAtMTtcblx0fVx0XHRcblxuXHQkLmZuLnNjcm9sbFRvID0gZnVuY3Rpb24odGFyZ2V0LCBkdXJhdGlvbiwgc2V0dGluZ3MpIHtcblx0XHRpZiAodHlwZW9mIGR1cmF0aW9uID09PSAnb2JqZWN0Jykge1xuXHRcdFx0c2V0dGluZ3MgPSBkdXJhdGlvbjtcblx0XHRcdGR1cmF0aW9uID0gMDtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBzZXR0aW5ncyA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0c2V0dGluZ3MgPSB7IG9uQWZ0ZXI6c2V0dGluZ3MgfTtcblx0XHR9XG5cdFx0aWYgKHRhcmdldCA9PT0gJ21heCcpIHtcblx0XHRcdHRhcmdldCA9IDllOTtcblx0XHR9XG5cblx0XHRzZXR0aW5ncyA9ICQuZXh0ZW5kKHt9LCAkc2Nyb2xsVG8uZGVmYXVsdHMsIHNldHRpbmdzKTtcblx0XHQvLyBTcGVlZCBpcyBzdGlsbCByZWNvZ25pemVkIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuXHRcdGR1cmF0aW9uID0gZHVyYXRpb24gfHwgc2V0dGluZ3MuZHVyYXRpb247XG5cdFx0Ly8gTWFrZSBzdXJlIHRoZSBzZXR0aW5ncyBhcmUgZ2l2ZW4gcmlnaHRcblx0XHR2YXIgcXVldWUgPSBzZXR0aW5ncy5xdWV1ZSAmJiBzZXR0aW5ncy5heGlzLmxlbmd0aCA+IDE7XG5cdFx0aWYgKHF1ZXVlKSB7XG5cdFx0XHQvLyBMZXQncyBrZWVwIHRoZSBvdmVyYWxsIGR1cmF0aW9uXG5cdFx0XHRkdXJhdGlvbiAvPSAyO1xuXHRcdH1cblx0XHRzZXR0aW5ncy5vZmZzZXQgPSBib3RoKHNldHRpbmdzLm9mZnNldCk7XG5cdFx0c2V0dGluZ3Mub3ZlciA9IGJvdGgoc2V0dGluZ3Mub3Zlcik7XG5cblx0XHRyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gTnVsbCB0YXJnZXQgeWllbGRzIG5vdGhpbmcsIGp1c3QgbGlrZSBqUXVlcnkgZG9lc1xuXHRcdFx0aWYgKHRhcmdldCA9PT0gbnVsbCkgcmV0dXJuO1xuXG5cdFx0XHR2YXIgd2luID0gaXNXaW4odGhpcyksXG5cdFx0XHRcdGVsZW0gPSB3aW4gPyB0aGlzLmNvbnRlbnRXaW5kb3cgfHwgd2luZG93IDogdGhpcyxcblx0XHRcdFx0JGVsZW0gPSAkKGVsZW0pLFxuXHRcdFx0XHR0YXJnID0gdGFyZ2V0LCBcblx0XHRcdFx0YXR0ciA9IHt9LFxuXHRcdFx0XHR0b2ZmO1xuXG5cdFx0XHRzd2l0Y2ggKHR5cGVvZiB0YXJnKSB7XG5cdFx0XHRcdC8vIEEgbnVtYmVyIHdpbGwgcGFzcyB0aGUgcmVnZXhcblx0XHRcdFx0Y2FzZSAnbnVtYmVyJzpcblx0XHRcdFx0Y2FzZSAnc3RyaW5nJzpcblx0XHRcdFx0XHRpZiAoL14oWystXT0/KT9cXGQrKFxcLlxcZCspPyhweHwlKT8kLy50ZXN0KHRhcmcpKSB7XG5cdFx0XHRcdFx0XHR0YXJnID0gYm90aCh0YXJnKTtcblx0XHRcdFx0XHRcdC8vIFdlIGFyZSBkb25lXG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gUmVsYXRpdmUvQWJzb2x1dGUgc2VsZWN0b3Jcblx0XHRcdFx0XHR0YXJnID0gd2luID8gJCh0YXJnKSA6ICQodGFyZywgZWxlbSk7XG5cdFx0XHRcdFx0LyogZmFsbHMgdGhyb3VnaCAqL1xuXHRcdFx0XHRjYXNlICdvYmplY3QnOlxuXHRcdFx0XHRcdGlmICh0YXJnLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXHRcdFx0XHRcdC8vIERPTUVsZW1lbnQgLyBqUXVlcnlcblx0XHRcdFx0XHRpZiAodGFyZy5pcyB8fCB0YXJnLnN0eWxlKSB7XG5cdFx0XHRcdFx0XHQvLyBHZXQgdGhlIHJlYWwgcG9zaXRpb24gb2YgdGhlIHRhcmdldFxuXHRcdFx0XHRcdFx0dG9mZiA9ICh0YXJnID0gJCh0YXJnKSkub2Zmc2V0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR2YXIgb2Zmc2V0ID0gJC5pc0Z1bmN0aW9uKHNldHRpbmdzLm9mZnNldCkgJiYgc2V0dGluZ3Mub2Zmc2V0KGVsZW0sIHRhcmcpIHx8IHNldHRpbmdzLm9mZnNldDtcblxuXHRcdFx0JC5lYWNoKHNldHRpbmdzLmF4aXMuc3BsaXQoJycpLCBmdW5jdGlvbihpLCBheGlzKSB7XG5cdFx0XHRcdHZhciBQb3NcdD0gYXhpcyA9PT0gJ3gnID8gJ0xlZnQnIDogJ1RvcCcsXG5cdFx0XHRcdFx0cG9zID0gUG9zLnRvTG93ZXJDYXNlKCksXG5cdFx0XHRcdFx0a2V5ID0gJ3Njcm9sbCcgKyBQb3MsXG5cdFx0XHRcdFx0cHJldiA9ICRlbGVtW2tleV0oKSxcblx0XHRcdFx0XHRtYXggPSAkc2Nyb2xsVG8ubWF4KGVsZW0sIGF4aXMpO1xuXG5cdFx0XHRcdGlmICh0b2ZmKSB7Ly8galF1ZXJ5IC8gRE9NRWxlbWVudFxuXHRcdFx0XHRcdGF0dHJba2V5XSA9IHRvZmZbcG9zXSArICh3aW4gPyAwIDogcHJldiAtICRlbGVtLm9mZnNldCgpW3Bvc10pO1xuXG5cdFx0XHRcdFx0Ly8gSWYgaXQncyBhIGRvbSBlbGVtZW50LCByZWR1Y2UgdGhlIG1hcmdpblxuXHRcdFx0XHRcdGlmIChzZXR0aW5ncy5tYXJnaW4pIHtcblx0XHRcdFx0XHRcdGF0dHJba2V5XSAtPSBwYXJzZUludCh0YXJnLmNzcygnbWFyZ2luJytQb3MpLCAxMCkgfHwgMDtcblx0XHRcdFx0XHRcdGF0dHJba2V5XSAtPSBwYXJzZUludCh0YXJnLmNzcygnYm9yZGVyJytQb3MrJ1dpZHRoJyksIDEwKSB8fCAwO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGF0dHJba2V5XSArPSBvZmZzZXRbcG9zXSB8fCAwO1xuXG5cdFx0XHRcdFx0aWYgKHNldHRpbmdzLm92ZXJbcG9zXSkge1xuXHRcdFx0XHRcdFx0Ly8gU2Nyb2xsIHRvIGEgZnJhY3Rpb24gb2YgaXRzIHdpZHRoL2hlaWdodFxuXHRcdFx0XHRcdFx0YXR0cltrZXldICs9IHRhcmdbYXhpcyA9PT0gJ3gnPyd3aWR0aCc6J2hlaWdodCddKCkgKiBzZXR0aW5ncy5vdmVyW3Bvc107XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHZhciB2YWwgPSB0YXJnW3Bvc107XG5cdFx0XHRcdFx0Ly8gSGFuZGxlIHBlcmNlbnRhZ2UgdmFsdWVzXG5cdFx0XHRcdFx0YXR0cltrZXldID0gdmFsLnNsaWNlICYmIHZhbC5zbGljZSgtMSkgPT09ICclJyA/XG5cdFx0XHRcdFx0XHRwYXJzZUZsb2F0KHZhbCkgLyAxMDAgKiBtYXhcblx0XHRcdFx0XHRcdDogdmFsO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gTnVtYmVyIG9yICdudW1iZXInXG5cdFx0XHRcdGlmIChzZXR0aW5ncy5saW1pdCAmJiAvXlxcZCskLy50ZXN0KGF0dHJba2V5XSkpIHtcblx0XHRcdFx0XHQvLyBDaGVjayB0aGUgbGltaXRzXG5cdFx0XHRcdFx0YXR0cltrZXldID0gYXR0cltrZXldIDw9IDAgPyAwIDogTWF0aC5taW4oYXR0cltrZXldLCBtYXgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gRG9uJ3Qgd2FzdGUgdGltZSBhbmltYXRpbmcsIGlmIHRoZXJlJ3Mgbm8gbmVlZC5cblx0XHRcdFx0aWYgKCFpICYmIHNldHRpbmdzLmF4aXMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdGlmIChwcmV2ID09PSBhdHRyW2tleV0pIHtcblx0XHRcdFx0XHRcdC8vIE5vIGFuaW1hdGlvbiBuZWVkZWRcblx0XHRcdFx0XHRcdGF0dHIgPSB7fTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHF1ZXVlKSB7XG5cdFx0XHRcdFx0XHQvLyBJbnRlcm1lZGlhdGUgYW5pbWF0aW9uXG5cdFx0XHRcdFx0XHRhbmltYXRlKHNldHRpbmdzLm9uQWZ0ZXJGaXJzdCk7XG5cdFx0XHRcdFx0XHQvLyBEb24ndCBhbmltYXRlIHRoaXMgYXhpcyBhZ2FpbiBpbiB0aGUgbmV4dCBpdGVyYXRpb24uXG5cdFx0XHRcdFx0XHRhdHRyID0ge307XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0YW5pbWF0ZShzZXR0aW5ncy5vbkFmdGVyKTtcblxuXHRcdFx0ZnVuY3Rpb24gYW5pbWF0ZShjYWxsYmFjaykge1xuXHRcdFx0XHR2YXIgb3B0cyA9ICQuZXh0ZW5kKHt9LCBzZXR0aW5ncywge1xuXHRcdFx0XHRcdC8vIFRoZSBxdWV1ZSBzZXR0aW5nIGNvbmZsaWN0cyB3aXRoIGFuaW1hdGUoKVxuXHRcdFx0XHRcdC8vIEZvcmNlIGl0IHRvIGFsd2F5cyBiZSB0cnVlXG5cdFx0XHRcdFx0cXVldWU6IHRydWUsXG5cdFx0XHRcdFx0ZHVyYXRpb246IGR1cmF0aW9uLFxuXHRcdFx0XHRcdGNvbXBsZXRlOiBjYWxsYmFjayAmJiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGNhbGxiYWNrLmNhbGwoZWxlbSwgdGFyZywgc2V0dGluZ3MpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHRcdCRlbGVtLmFuaW1hdGUoYXR0ciwgb3B0cyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH07XG5cblx0Ly8gTWF4IHNjcm9sbGluZyBwb3NpdGlvbiwgd29ya3Mgb24gcXVpcmtzIG1vZGVcblx0Ly8gSXQgb25seSBmYWlscyAobm90IHRvbyBiYWRseSkgb24gSUUsIHF1aXJrcyBtb2RlLlxuXHQkc2Nyb2xsVG8ubWF4ID0gZnVuY3Rpb24oZWxlbSwgYXhpcykge1xuXHRcdHZhciBEaW0gPSBheGlzID09PSAneCcgPyAnV2lkdGgnIDogJ0hlaWdodCcsXG5cdFx0XHRzY3JvbGwgPSAnc2Nyb2xsJytEaW07XG5cblx0XHRpZiAoIWlzV2luKGVsZW0pKVxuXHRcdFx0cmV0dXJuIGVsZW1bc2Nyb2xsXSAtICQoZWxlbSlbRGltLnRvTG93ZXJDYXNlKCldKCk7XG5cblx0XHR2YXIgc2l6ZSA9ICdjbGllbnQnICsgRGltLFxuXHRcdFx0ZG9jID0gZWxlbS5vd25lckRvY3VtZW50IHx8IGVsZW0uZG9jdW1lbnQsXG5cdFx0XHRodG1sID0gZG9jLmRvY3VtZW50RWxlbWVudCxcblx0XHRcdGJvZHkgPSBkb2MuYm9keTtcblxuXHRcdHJldHVybiBNYXRoLm1heChodG1sW3Njcm9sbF0sIGJvZHlbc2Nyb2xsXSkgLSBNYXRoLm1pbihodG1sW3NpemVdLCBib2R5W3NpemVdKTtcblx0fTtcblxuXHRmdW5jdGlvbiBib3RoKHZhbCkge1xuXHRcdHJldHVybiAkLmlzRnVuY3Rpb24odmFsKSB8fCAkLmlzUGxhaW5PYmplY3QodmFsKSA/IHZhbCA6IHsgdG9wOnZhbCwgbGVmdDp2YWwgfTtcblx0fVxuXG5cdC8vIEFkZCBzcGVjaWFsIGhvb2tzIHNvIHRoYXQgd2luZG93IHNjcm9sbCBwcm9wZXJ0aWVzIGNhbiBiZSBhbmltYXRlZFxuXHQkLlR3ZWVuLnByb3BIb29rcy5zY3JvbGxMZWZ0ID0gXG5cdCQuVHdlZW4ucHJvcEhvb2tzLnNjcm9sbFRvcCA9IHtcblx0XHRnZXQ6IGZ1bmN0aW9uKHQpIHtcblx0XHRcdHJldHVybiAkKHQuZWxlbSlbdC5wcm9wXSgpO1xuXHRcdH0sXG5cdFx0c2V0OiBmdW5jdGlvbih0KSB7XG5cdFx0XHR2YXIgY3VyciA9IHRoaXMuZ2V0KHQpO1xuXHRcdFx0Ly8gSWYgaW50ZXJydXB0IGlzIHRydWUgYW5kIHVzZXIgc2Nyb2xsZWQsIHN0b3AgYW5pbWF0aW5nXG5cdFx0XHRpZiAodC5vcHRpb25zLmludGVycnVwdCAmJiB0Ll9sYXN0ICYmIHQuX2xhc3QgIT09IGN1cnIpIHtcblx0XHRcdFx0cmV0dXJuICQodC5lbGVtKS5zdG9wKCk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgbmV4dCA9IE1hdGgucm91bmQodC5ub3cpO1xuXHRcdFx0Ly8gRG9uJ3Qgd2FzdGUgQ1BVXG5cdFx0XHQvLyBCcm93c2VycyBkb24ndCByZW5kZXIgZmxvYXRpbmcgcG9pbnQgc2Nyb2xsXG5cdFx0XHRpZiAoY3VyciAhPT0gbmV4dCkge1xuXHRcdFx0XHQkKHQuZWxlbSlbdC5wcm9wXShuZXh0KTtcblx0XHRcdFx0dC5fbGFzdCA9IHRoaXMuZ2V0KHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHQvLyBBTUQgcmVxdWlyZW1lbnRcblx0cmV0dXJuICRzY3JvbGxUbztcbn0pO1xuIiwiLyohXG5XYXlwb2ludHMgLSA0LjAuMVxuQ29weXJpZ2h0IMKpIDIwMTEtMjAxNiBDYWxlYiBUcm91Z2h0b25cbkxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbmh0dHBzOi8vZ2l0aHViLmNvbS9pbWFrZXdlYnRoaW5ncy93YXlwb2ludHMvYmxvYi9tYXN0ZXIvbGljZW5zZXMudHh0XG4qL1xuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCdcblxuICB2YXIga2V5Q291bnRlciA9IDBcbiAgdmFyIGFsbFdheXBvaW50cyA9IHt9XG5cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL3dheXBvaW50ICovXG4gIGZ1bmN0aW9uIFdheXBvaW50KG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gb3B0aW9ucyBwYXNzZWQgdG8gV2F5cG9pbnQgY29uc3RydWN0b3InKVxuICAgIH1cbiAgICBpZiAoIW9wdGlvbnMuZWxlbWVudCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBlbGVtZW50IG9wdGlvbiBwYXNzZWQgdG8gV2F5cG9pbnQgY29uc3RydWN0b3InKVxuICAgIH1cbiAgICBpZiAoIW9wdGlvbnMuaGFuZGxlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBoYW5kbGVyIG9wdGlvbiBwYXNzZWQgdG8gV2F5cG9pbnQgY29uc3RydWN0b3InKVxuICAgIH1cblxuICAgIHRoaXMua2V5ID0gJ3dheXBvaW50LScgKyBrZXlDb3VudGVyXG4gICAgdGhpcy5vcHRpb25zID0gV2F5cG9pbnQuQWRhcHRlci5leHRlbmQoe30sIFdheXBvaW50LmRlZmF1bHRzLCBvcHRpb25zKVxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMub3B0aW9ucy5lbGVtZW50XG4gICAgdGhpcy5hZGFwdGVyID0gbmV3IFdheXBvaW50LkFkYXB0ZXIodGhpcy5lbGVtZW50KVxuICAgIHRoaXMuY2FsbGJhY2sgPSBvcHRpb25zLmhhbmRsZXJcbiAgICB0aGlzLmF4aXMgPSB0aGlzLm9wdGlvbnMuaG9yaXpvbnRhbCA/ICdob3Jpem9udGFsJyA6ICd2ZXJ0aWNhbCdcbiAgICB0aGlzLmVuYWJsZWQgPSB0aGlzLm9wdGlvbnMuZW5hYmxlZFxuICAgIHRoaXMudHJpZ2dlclBvaW50ID0gbnVsbFxuICAgIHRoaXMuZ3JvdXAgPSBXYXlwb2ludC5Hcm91cC5maW5kT3JDcmVhdGUoe1xuICAgICAgbmFtZTogdGhpcy5vcHRpb25zLmdyb3VwLFxuICAgICAgYXhpczogdGhpcy5heGlzXG4gICAgfSlcbiAgICB0aGlzLmNvbnRleHQgPSBXYXlwb2ludC5Db250ZXh0LmZpbmRPckNyZWF0ZUJ5RWxlbWVudCh0aGlzLm9wdGlvbnMuY29udGV4dClcblxuICAgIGlmIChXYXlwb2ludC5vZmZzZXRBbGlhc2VzW3RoaXMub3B0aW9ucy5vZmZzZXRdKSB7XG4gICAgICB0aGlzLm9wdGlvbnMub2Zmc2V0ID0gV2F5cG9pbnQub2Zmc2V0QWxpYXNlc1t0aGlzLm9wdGlvbnMub2Zmc2V0XVxuICAgIH1cbiAgICB0aGlzLmdyb3VwLmFkZCh0aGlzKVxuICAgIHRoaXMuY29udGV4dC5hZGQodGhpcylcbiAgICBhbGxXYXlwb2ludHNbdGhpcy5rZXldID0gdGhpc1xuICAgIGtleUNvdW50ZXIgKz0gMVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBXYXlwb2ludC5wcm90b3R5cGUucXVldWVUcmlnZ2VyID0gZnVuY3Rpb24oZGlyZWN0aW9uKSB7XG4gICAgdGhpcy5ncm91cC5xdWV1ZVRyaWdnZXIodGhpcywgZGlyZWN0aW9uKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBXYXlwb2ludC5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICBpZiAoIXRoaXMuZW5hYmxlZCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmICh0aGlzLmNhbGxiYWNrKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3MpXG4gICAgfVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9kZXN0cm95ICovXG4gIFdheXBvaW50LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jb250ZXh0LnJlbW92ZSh0aGlzKVxuICAgIHRoaXMuZ3JvdXAucmVtb3ZlKHRoaXMpXG4gICAgZGVsZXRlIGFsbFdheXBvaW50c1t0aGlzLmtleV1cbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZGlzYWJsZSAqL1xuICBXYXlwb2ludC5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZW5hYmxlICovXG4gIFdheXBvaW50LnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNvbnRleHQucmVmcmVzaCgpXG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL25leHQgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5ncm91cC5uZXh0KHRoaXMpXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL3ByZXZpb3VzICovXG4gIFdheXBvaW50LnByb3RvdHlwZS5wcmV2aW91cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdyb3VwLnByZXZpb3VzKHRoaXMpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIFdheXBvaW50Lmludm9rZUFsbCA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgIHZhciBhbGxXYXlwb2ludHNBcnJheSA9IFtdXG4gICAgZm9yICh2YXIgd2F5cG9pbnRLZXkgaW4gYWxsV2F5cG9pbnRzKSB7XG4gICAgICBhbGxXYXlwb2ludHNBcnJheS5wdXNoKGFsbFdheXBvaW50c1t3YXlwb2ludEtleV0pXG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBhbGxXYXlwb2ludHNBcnJheS5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgYWxsV2F5cG9pbnRzQXJyYXlbaV1bbWV0aG9kXSgpXG4gICAgfVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9kZXN0cm95LWFsbCAqL1xuICBXYXlwb2ludC5kZXN0cm95QWxsID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuaW52b2tlQWxsKCdkZXN0cm95JylcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZGlzYWJsZS1hbGwgKi9cbiAgV2F5cG9pbnQuZGlzYWJsZUFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIFdheXBvaW50Lmludm9rZUFsbCgnZGlzYWJsZScpXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2VuYWJsZS1hbGwgKi9cbiAgV2F5cG9pbnQuZW5hYmxlQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuQ29udGV4dC5yZWZyZXNoQWxsKClcbiAgICBmb3IgKHZhciB3YXlwb2ludEtleSBpbiBhbGxXYXlwb2ludHMpIHtcbiAgICAgIGFsbFdheXBvaW50c1t3YXlwb2ludEtleV0uZW5hYmxlZCA9IHRydWVcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvcmVmcmVzaC1hbGwgKi9cbiAgV2F5cG9pbnQucmVmcmVzaEFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIFdheXBvaW50LkNvbnRleHQucmVmcmVzaEFsbCgpXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL3ZpZXdwb3J0LWhlaWdodCAqL1xuICBXYXlwb2ludC52aWV3cG9ydEhlaWdodCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodFxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS92aWV3cG9ydC13aWR0aCAqL1xuICBXYXlwb2ludC52aWV3cG9ydFdpZHRoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aFxuICB9XG5cbiAgV2F5cG9pbnQuYWRhcHRlcnMgPSBbXVxuXG4gIFdheXBvaW50LmRlZmF1bHRzID0ge1xuICAgIGNvbnRleHQ6IHdpbmRvdyxcbiAgICBjb250aW51b3VzOiB0cnVlLFxuICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgZ3JvdXA6ICdkZWZhdWx0JyxcbiAgICBob3Jpem9udGFsOiBmYWxzZSxcbiAgICBvZmZzZXQ6IDBcbiAgfVxuXG4gIFdheXBvaW50Lm9mZnNldEFsaWFzZXMgPSB7XG4gICAgJ2JvdHRvbS1pbi12aWV3JzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0LmlubmVySGVpZ2h0KCkgLSB0aGlzLmFkYXB0ZXIub3V0ZXJIZWlnaHQoKVxuICAgIH0sXG4gICAgJ3JpZ2h0LWluLXZpZXcnOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQuaW5uZXJXaWR0aCgpIC0gdGhpcy5hZGFwdGVyLm91dGVyV2lkdGgoKVxuICAgIH1cbiAgfVxuXG4gIHdpbmRvdy5XYXlwb2ludCA9IFdheXBvaW50XG59KCkpXG47KGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCdcblxuICBmdW5jdGlvbiByZXF1ZXN0QW5pbWF0aW9uRnJhbWVTaGltKGNhbGxiYWNrKSB7XG4gICAgd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MClcbiAgfVxuXG4gIHZhciBrZXlDb3VudGVyID0gMFxuICB2YXIgY29udGV4dHMgPSB7fVxuICB2YXIgV2F5cG9pbnQgPSB3aW5kb3cuV2F5cG9pbnRcbiAgdmFyIG9sZFdpbmRvd0xvYWQgPSB3aW5kb3cub25sb2FkXG5cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2NvbnRleHQgKi9cbiAgZnVuY3Rpb24gQ29udGV4dChlbGVtZW50KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFxuICAgIHRoaXMuQWRhcHRlciA9IFdheXBvaW50LkFkYXB0ZXJcbiAgICB0aGlzLmFkYXB0ZXIgPSBuZXcgdGhpcy5BZGFwdGVyKGVsZW1lbnQpXG4gICAgdGhpcy5rZXkgPSAnd2F5cG9pbnQtY29udGV4dC0nICsga2V5Q291bnRlclxuICAgIHRoaXMuZGlkU2Nyb2xsID0gZmFsc2VcbiAgICB0aGlzLmRpZFJlc2l6ZSA9IGZhbHNlXG4gICAgdGhpcy5vbGRTY3JvbGwgPSB7XG4gICAgICB4OiB0aGlzLmFkYXB0ZXIuc2Nyb2xsTGVmdCgpLFxuICAgICAgeTogdGhpcy5hZGFwdGVyLnNjcm9sbFRvcCgpXG4gICAgfVxuICAgIHRoaXMud2F5cG9pbnRzID0ge1xuICAgICAgdmVydGljYWw6IHt9LFxuICAgICAgaG9yaXpvbnRhbDoge31cbiAgICB9XG5cbiAgICBlbGVtZW50LndheXBvaW50Q29udGV4dEtleSA9IHRoaXMua2V5XG4gICAgY29udGV4dHNbZWxlbWVudC53YXlwb2ludENvbnRleHRLZXldID0gdGhpc1xuICAgIGtleUNvdW50ZXIgKz0gMVxuICAgIGlmICghV2F5cG9pbnQud2luZG93Q29udGV4dCkge1xuICAgICAgV2F5cG9pbnQud2luZG93Q29udGV4dCA9IHRydWVcbiAgICAgIFdheXBvaW50LndpbmRvd0NvbnRleHQgPSBuZXcgQ29udGV4dCh3aW5kb3cpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVUaHJvdHRsZWRTY3JvbGxIYW5kbGVyKClcbiAgICB0aGlzLmNyZWF0ZVRocm90dGxlZFJlc2l6ZUhhbmRsZXIoKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIHZhciBheGlzID0gd2F5cG9pbnQub3B0aW9ucy5ob3Jpem9udGFsID8gJ2hvcml6b250YWwnIDogJ3ZlcnRpY2FsJ1xuICAgIHRoaXMud2F5cG9pbnRzW2F4aXNdW3dheXBvaW50LmtleV0gPSB3YXlwb2ludFxuICAgIHRoaXMucmVmcmVzaCgpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmNoZWNrRW1wdHkgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaG9yaXpvbnRhbEVtcHR5ID0gdGhpcy5BZGFwdGVyLmlzRW1wdHlPYmplY3QodGhpcy53YXlwb2ludHMuaG9yaXpvbnRhbClcbiAgICB2YXIgdmVydGljYWxFbXB0eSA9IHRoaXMuQWRhcHRlci5pc0VtcHR5T2JqZWN0KHRoaXMud2F5cG9pbnRzLnZlcnRpY2FsKVxuICAgIHZhciBpc1dpbmRvdyA9IHRoaXMuZWxlbWVudCA9PSB0aGlzLmVsZW1lbnQud2luZG93XG4gICAgaWYgKGhvcml6b250YWxFbXB0eSAmJiB2ZXJ0aWNhbEVtcHR5ICYmICFpc1dpbmRvdykge1xuICAgICAgdGhpcy5hZGFwdGVyLm9mZignLndheXBvaW50cycpXG4gICAgICBkZWxldGUgY29udGV4dHNbdGhpcy5rZXldXG4gICAgfVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5jcmVhdGVUaHJvdHRsZWRSZXNpemVIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgICBmdW5jdGlvbiByZXNpemVIYW5kbGVyKCkge1xuICAgICAgc2VsZi5oYW5kbGVSZXNpemUoKVxuICAgICAgc2VsZi5kaWRSZXNpemUgPSBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMuYWRhcHRlci5vbigncmVzaXplLndheXBvaW50cycsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFzZWxmLmRpZFJlc2l6ZSkge1xuICAgICAgICBzZWxmLmRpZFJlc2l6ZSA9IHRydWVcbiAgICAgICAgV2F5cG9pbnQucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlc2l6ZUhhbmRsZXIpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuY3JlYXRlVGhyb3R0bGVkU2Nyb2xsSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgIGZ1bmN0aW9uIHNjcm9sbEhhbmRsZXIoKSB7XG4gICAgICBzZWxmLmhhbmRsZVNjcm9sbCgpXG4gICAgICBzZWxmLmRpZFNjcm9sbCA9IGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5hZGFwdGVyLm9uKCdzY3JvbGwud2F5cG9pbnRzJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXNlbGYuZGlkU2Nyb2xsIHx8IFdheXBvaW50LmlzVG91Y2gpIHtcbiAgICAgICAgc2VsZi5kaWRTY3JvbGwgPSB0cnVlXG4gICAgICAgIFdheXBvaW50LnJlcXVlc3RBbmltYXRpb25GcmFtZShzY3JvbGxIYW5kbGVyKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmhhbmRsZVJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIFdheXBvaW50LkNvbnRleHQucmVmcmVzaEFsbCgpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmhhbmRsZVNjcm9sbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0cmlnZ2VyZWRHcm91cHMgPSB7fVxuICAgIHZhciBheGVzID0ge1xuICAgICAgaG9yaXpvbnRhbDoge1xuICAgICAgICBuZXdTY3JvbGw6IHRoaXMuYWRhcHRlci5zY3JvbGxMZWZ0KCksXG4gICAgICAgIG9sZFNjcm9sbDogdGhpcy5vbGRTY3JvbGwueCxcbiAgICAgICAgZm9yd2FyZDogJ3JpZ2h0JyxcbiAgICAgICAgYmFja3dhcmQ6ICdsZWZ0J1xuICAgICAgfSxcbiAgICAgIHZlcnRpY2FsOiB7XG4gICAgICAgIG5ld1Njcm9sbDogdGhpcy5hZGFwdGVyLnNjcm9sbFRvcCgpLFxuICAgICAgICBvbGRTY3JvbGw6IHRoaXMub2xkU2Nyb2xsLnksXG4gICAgICAgIGZvcndhcmQ6ICdkb3duJyxcbiAgICAgICAgYmFja3dhcmQ6ICd1cCdcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBheGlzS2V5IGluIGF4ZXMpIHtcbiAgICAgIHZhciBheGlzID0gYXhlc1theGlzS2V5XVxuICAgICAgdmFyIGlzRm9yd2FyZCA9IGF4aXMubmV3U2Nyb2xsID4gYXhpcy5vbGRTY3JvbGxcbiAgICAgIHZhciBkaXJlY3Rpb24gPSBpc0ZvcndhcmQgPyBheGlzLmZvcndhcmQgOiBheGlzLmJhY2t3YXJkXG5cbiAgICAgIGZvciAodmFyIHdheXBvaW50S2V5IGluIHRoaXMud2F5cG9pbnRzW2F4aXNLZXldKSB7XG4gICAgICAgIHZhciB3YXlwb2ludCA9IHRoaXMud2F5cG9pbnRzW2F4aXNLZXldW3dheXBvaW50S2V5XVxuICAgICAgICBpZiAod2F5cG9pbnQudHJpZ2dlclBvaW50ID09PSBudWxsKSB7XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuICAgICAgICB2YXIgd2FzQmVmb3JlVHJpZ2dlclBvaW50ID0gYXhpcy5vbGRTY3JvbGwgPCB3YXlwb2ludC50cmlnZ2VyUG9pbnRcbiAgICAgICAgdmFyIG5vd0FmdGVyVHJpZ2dlclBvaW50ID0gYXhpcy5uZXdTY3JvbGwgPj0gd2F5cG9pbnQudHJpZ2dlclBvaW50XG4gICAgICAgIHZhciBjcm9zc2VkRm9yd2FyZCA9IHdhc0JlZm9yZVRyaWdnZXJQb2ludCAmJiBub3dBZnRlclRyaWdnZXJQb2ludFxuICAgICAgICB2YXIgY3Jvc3NlZEJhY2t3YXJkID0gIXdhc0JlZm9yZVRyaWdnZXJQb2ludCAmJiAhbm93QWZ0ZXJUcmlnZ2VyUG9pbnRcbiAgICAgICAgaWYgKGNyb3NzZWRGb3J3YXJkIHx8IGNyb3NzZWRCYWNrd2FyZCkge1xuICAgICAgICAgIHdheXBvaW50LnF1ZXVlVHJpZ2dlcihkaXJlY3Rpb24pXG4gICAgICAgICAgdHJpZ2dlcmVkR3JvdXBzW3dheXBvaW50Lmdyb3VwLmlkXSA9IHdheXBvaW50Lmdyb3VwXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBncm91cEtleSBpbiB0cmlnZ2VyZWRHcm91cHMpIHtcbiAgICAgIHRyaWdnZXJlZEdyb3Vwc1tncm91cEtleV0uZmx1c2hUcmlnZ2VycygpXG4gICAgfVxuXG4gICAgdGhpcy5vbGRTY3JvbGwgPSB7XG4gICAgICB4OiBheGVzLmhvcml6b250YWwubmV3U2Nyb2xsLFxuICAgICAgeTogYXhlcy52ZXJ0aWNhbC5uZXdTY3JvbGxcbiAgICB9XG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmlubmVySGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gICAgLyplc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cbiAgICBpZiAodGhpcy5lbGVtZW50ID09IHRoaXMuZWxlbWVudC53aW5kb3cpIHtcbiAgICAgIHJldHVybiBXYXlwb2ludC52aWV3cG9ydEhlaWdodCgpXG4gICAgfVxuICAgIC8qZXNsaW50LWVuYWJsZSBlcWVxZXEgKi9cbiAgICByZXR1cm4gdGhpcy5hZGFwdGVyLmlubmVySGVpZ2h0KClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24od2F5cG9pbnQpIHtcbiAgICBkZWxldGUgdGhpcy53YXlwb2ludHNbd2F5cG9pbnQuYXhpc11bd2F5cG9pbnQua2V5XVxuICAgIHRoaXMuY2hlY2tFbXB0eSgpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmlubmVyV2lkdGggPSBmdW5jdGlvbigpIHtcbiAgICAvKmVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xuICAgIGlmICh0aGlzLmVsZW1lbnQgPT0gdGhpcy5lbGVtZW50LndpbmRvdykge1xuICAgICAgcmV0dXJuIFdheXBvaW50LnZpZXdwb3J0V2lkdGgoKVxuICAgIH1cbiAgICAvKmVzbGludC1lbmFibGUgZXFlcWVxICovXG4gICAgcmV0dXJuIHRoaXMuYWRhcHRlci5pbm5lcldpZHRoKClcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvY29udGV4dC1kZXN0cm95ICovXG4gIENvbnRleHQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYWxsV2F5cG9pbnRzID0gW11cbiAgICBmb3IgKHZhciBheGlzIGluIHRoaXMud2F5cG9pbnRzKSB7XG4gICAgICBmb3IgKHZhciB3YXlwb2ludEtleSBpbiB0aGlzLndheXBvaW50c1theGlzXSkge1xuICAgICAgICBhbGxXYXlwb2ludHMucHVzaCh0aGlzLndheXBvaW50c1theGlzXVt3YXlwb2ludEtleV0pXG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBhbGxXYXlwb2ludHMubGVuZ3RoOyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIGFsbFdheXBvaW50c1tpXS5kZXN0cm95KClcbiAgICB9XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2NvbnRleHQtcmVmcmVzaCAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgLyplc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cbiAgICB2YXIgaXNXaW5kb3cgPSB0aGlzLmVsZW1lbnQgPT0gdGhpcy5lbGVtZW50LndpbmRvd1xuICAgIC8qZXNsaW50LWVuYWJsZSBlcWVxZXEgKi9cbiAgICB2YXIgY29udGV4dE9mZnNldCA9IGlzV2luZG93ID8gdW5kZWZpbmVkIDogdGhpcy5hZGFwdGVyLm9mZnNldCgpXG4gICAgdmFyIHRyaWdnZXJlZEdyb3VwcyA9IHt9XG4gICAgdmFyIGF4ZXNcblxuICAgIHRoaXMuaGFuZGxlU2Nyb2xsKClcbiAgICBheGVzID0ge1xuICAgICAgaG9yaXpvbnRhbDoge1xuICAgICAgICBjb250ZXh0T2Zmc2V0OiBpc1dpbmRvdyA/IDAgOiBjb250ZXh0T2Zmc2V0LmxlZnQsXG4gICAgICAgIGNvbnRleHRTY3JvbGw6IGlzV2luZG93ID8gMCA6IHRoaXMub2xkU2Nyb2xsLngsXG4gICAgICAgIGNvbnRleHREaW1lbnNpb246IHRoaXMuaW5uZXJXaWR0aCgpLFxuICAgICAgICBvbGRTY3JvbGw6IHRoaXMub2xkU2Nyb2xsLngsXG4gICAgICAgIGZvcndhcmQ6ICdyaWdodCcsXG4gICAgICAgIGJhY2t3YXJkOiAnbGVmdCcsXG4gICAgICAgIG9mZnNldFByb3A6ICdsZWZ0J1xuICAgICAgfSxcbiAgICAgIHZlcnRpY2FsOiB7XG4gICAgICAgIGNvbnRleHRPZmZzZXQ6IGlzV2luZG93ID8gMCA6IGNvbnRleHRPZmZzZXQudG9wLFxuICAgICAgICBjb250ZXh0U2Nyb2xsOiBpc1dpbmRvdyA/IDAgOiB0aGlzLm9sZFNjcm9sbC55LFxuICAgICAgICBjb250ZXh0RGltZW5zaW9uOiB0aGlzLmlubmVySGVpZ2h0KCksXG4gICAgICAgIG9sZFNjcm9sbDogdGhpcy5vbGRTY3JvbGwueSxcbiAgICAgICAgZm9yd2FyZDogJ2Rvd24nLFxuICAgICAgICBiYWNrd2FyZDogJ3VwJyxcbiAgICAgICAgb2Zmc2V0UHJvcDogJ3RvcCdcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBheGlzS2V5IGluIGF4ZXMpIHtcbiAgICAgIHZhciBheGlzID0gYXhlc1theGlzS2V5XVxuICAgICAgZm9yICh2YXIgd2F5cG9pbnRLZXkgaW4gdGhpcy53YXlwb2ludHNbYXhpc0tleV0pIHtcbiAgICAgICAgdmFyIHdheXBvaW50ID0gdGhpcy53YXlwb2ludHNbYXhpc0tleV1bd2F5cG9pbnRLZXldXG4gICAgICAgIHZhciBhZGp1c3RtZW50ID0gd2F5cG9pbnQub3B0aW9ucy5vZmZzZXRcbiAgICAgICAgdmFyIG9sZFRyaWdnZXJQb2ludCA9IHdheXBvaW50LnRyaWdnZXJQb2ludFxuICAgICAgICB2YXIgZWxlbWVudE9mZnNldCA9IDBcbiAgICAgICAgdmFyIGZyZXNoV2F5cG9pbnQgPSBvbGRUcmlnZ2VyUG9pbnQgPT0gbnVsbFxuICAgICAgICB2YXIgY29udGV4dE1vZGlmaWVyLCB3YXNCZWZvcmVTY3JvbGwsIG5vd0FmdGVyU2Nyb2xsXG4gICAgICAgIHZhciB0cmlnZ2VyZWRCYWNrd2FyZCwgdHJpZ2dlcmVkRm9yd2FyZFxuXG4gICAgICAgIGlmICh3YXlwb2ludC5lbGVtZW50ICE9PSB3YXlwb2ludC5lbGVtZW50LndpbmRvdykge1xuICAgICAgICAgIGVsZW1lbnRPZmZzZXQgPSB3YXlwb2ludC5hZGFwdGVyLm9mZnNldCgpW2F4aXMub2Zmc2V0UHJvcF1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgYWRqdXN0bWVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGFkanVzdG1lbnQgPSBhZGp1c3RtZW50LmFwcGx5KHdheXBvaW50KVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBhZGp1c3RtZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGFkanVzdG1lbnQgPSBwYXJzZUZsb2F0KGFkanVzdG1lbnQpXG4gICAgICAgICAgaWYgKHdheXBvaW50Lm9wdGlvbnMub2Zmc2V0LmluZGV4T2YoJyUnKSA+IC0gMSkge1xuICAgICAgICAgICAgYWRqdXN0bWVudCA9IE1hdGguY2VpbChheGlzLmNvbnRleHREaW1lbnNpb24gKiBhZGp1c3RtZW50IC8gMTAwKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHRNb2RpZmllciA9IGF4aXMuY29udGV4dFNjcm9sbCAtIGF4aXMuY29udGV4dE9mZnNldFxuICAgICAgICB3YXlwb2ludC50cmlnZ2VyUG9pbnQgPSBNYXRoLmZsb29yKGVsZW1lbnRPZmZzZXQgKyBjb250ZXh0TW9kaWZpZXIgLSBhZGp1c3RtZW50KVxuICAgICAgICB3YXNCZWZvcmVTY3JvbGwgPSBvbGRUcmlnZ2VyUG9pbnQgPCBheGlzLm9sZFNjcm9sbFxuICAgICAgICBub3dBZnRlclNjcm9sbCA9IHdheXBvaW50LnRyaWdnZXJQb2ludCA+PSBheGlzLm9sZFNjcm9sbFxuICAgICAgICB0cmlnZ2VyZWRCYWNrd2FyZCA9IHdhc0JlZm9yZVNjcm9sbCAmJiBub3dBZnRlclNjcm9sbFxuICAgICAgICB0cmlnZ2VyZWRGb3J3YXJkID0gIXdhc0JlZm9yZVNjcm9sbCAmJiAhbm93QWZ0ZXJTY3JvbGxcblxuICAgICAgICBpZiAoIWZyZXNoV2F5cG9pbnQgJiYgdHJpZ2dlcmVkQmFja3dhcmQpIHtcbiAgICAgICAgICB3YXlwb2ludC5xdWV1ZVRyaWdnZXIoYXhpcy5iYWNrd2FyZClcbiAgICAgICAgICB0cmlnZ2VyZWRHcm91cHNbd2F5cG9pbnQuZ3JvdXAuaWRdID0gd2F5cG9pbnQuZ3JvdXBcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghZnJlc2hXYXlwb2ludCAmJiB0cmlnZ2VyZWRGb3J3YXJkKSB7XG4gICAgICAgICAgd2F5cG9pbnQucXVldWVUcmlnZ2VyKGF4aXMuZm9yd2FyZClcbiAgICAgICAgICB0cmlnZ2VyZWRHcm91cHNbd2F5cG9pbnQuZ3JvdXAuaWRdID0gd2F5cG9pbnQuZ3JvdXBcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmcmVzaFdheXBvaW50ICYmIGF4aXMub2xkU2Nyb2xsID49IHdheXBvaW50LnRyaWdnZXJQb2ludCkge1xuICAgICAgICAgIHdheXBvaW50LnF1ZXVlVHJpZ2dlcihheGlzLmZvcndhcmQpXG4gICAgICAgICAgdHJpZ2dlcmVkR3JvdXBzW3dheXBvaW50Lmdyb3VwLmlkXSA9IHdheXBvaW50Lmdyb3VwXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBXYXlwb2ludC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICBmb3IgKHZhciBncm91cEtleSBpbiB0cmlnZ2VyZWRHcm91cHMpIHtcbiAgICAgICAgdHJpZ2dlcmVkR3JvdXBzW2dyb3VwS2V5XS5mbHVzaFRyaWdnZXJzKClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5maW5kT3JDcmVhdGVCeUVsZW1lbnQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgcmV0dXJuIENvbnRleHQuZmluZEJ5RWxlbWVudChlbGVtZW50KSB8fCBuZXcgQ29udGV4dChlbGVtZW50KVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnJlZnJlc2hBbGwgPSBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBjb250ZXh0SWQgaW4gY29udGV4dHMpIHtcbiAgICAgIGNvbnRleHRzW2NvbnRleHRJZF0ucmVmcmVzaCgpXG4gICAgfVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9jb250ZXh0LWZpbmQtYnktZWxlbWVudCAqL1xuICBDb250ZXh0LmZpbmRCeUVsZW1lbnQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgcmV0dXJuIGNvbnRleHRzW2VsZW1lbnQud2F5cG9pbnRDb250ZXh0S2V5XVxuICB9XG5cbiAgd2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChvbGRXaW5kb3dMb2FkKSB7XG4gICAgICBvbGRXaW5kb3dMb2FkKClcbiAgICB9XG4gICAgQ29udGV4dC5yZWZyZXNoQWxsKClcbiAgfVxuXG5cbiAgV2F5cG9pbnQucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB2YXIgcmVxdWVzdEZuID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lU2hpbVxuICAgIHJlcXVlc3RGbi5jYWxsKHdpbmRvdywgY2FsbGJhY2spXG4gIH1cbiAgV2F5cG9pbnQuQ29udGV4dCA9IENvbnRleHRcbn0oKSlcbjsoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIGZ1bmN0aW9uIGJ5VHJpZ2dlclBvaW50KGEsIGIpIHtcbiAgICByZXR1cm4gYS50cmlnZ2VyUG9pbnQgLSBiLnRyaWdnZXJQb2ludFxuICB9XG5cbiAgZnVuY3Rpb24gYnlSZXZlcnNlVHJpZ2dlclBvaW50KGEsIGIpIHtcbiAgICByZXR1cm4gYi50cmlnZ2VyUG9pbnQgLSBhLnRyaWdnZXJQb2ludFxuICB9XG5cbiAgdmFyIGdyb3VwcyA9IHtcbiAgICB2ZXJ0aWNhbDoge30sXG4gICAgaG9yaXpvbnRhbDoge31cbiAgfVxuICB2YXIgV2F5cG9pbnQgPSB3aW5kb3cuV2F5cG9pbnRcblxuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZ3JvdXAgKi9cbiAgZnVuY3Rpb24gR3JvdXAob3B0aW9ucykge1xuICAgIHRoaXMubmFtZSA9IG9wdGlvbnMubmFtZVxuICAgIHRoaXMuYXhpcyA9IG9wdGlvbnMuYXhpc1xuICAgIHRoaXMuaWQgPSB0aGlzLm5hbWUgKyAnLScgKyB0aGlzLmF4aXNcbiAgICB0aGlzLndheXBvaW50cyA9IFtdXG4gICAgdGhpcy5jbGVhclRyaWdnZXJRdWV1ZXMoKVxuICAgIGdyb3Vwc1t0aGlzLmF4aXNdW3RoaXMubmFtZV0gPSB0aGlzXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIHRoaXMud2F5cG9pbnRzLnB1c2god2F5cG9pbnQpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5jbGVhclRyaWdnZXJRdWV1ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRyaWdnZXJRdWV1ZXMgPSB7XG4gICAgICB1cDogW10sXG4gICAgICBkb3duOiBbXSxcbiAgICAgIGxlZnQ6IFtdLFxuICAgICAgcmlnaHQ6IFtdXG4gICAgfVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUuZmx1c2hUcmlnZ2VycyA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGRpcmVjdGlvbiBpbiB0aGlzLnRyaWdnZXJRdWV1ZXMpIHtcbiAgICAgIHZhciB3YXlwb2ludHMgPSB0aGlzLnRyaWdnZXJRdWV1ZXNbZGlyZWN0aW9uXVxuICAgICAgdmFyIHJldmVyc2UgPSBkaXJlY3Rpb24gPT09ICd1cCcgfHwgZGlyZWN0aW9uID09PSAnbGVmdCdcbiAgICAgIHdheXBvaW50cy5zb3J0KHJldmVyc2UgPyBieVJldmVyc2VUcmlnZ2VyUG9pbnQgOiBieVRyaWdnZXJQb2ludClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB3YXlwb2ludHMubGVuZ3RoOyBpIDwgZW5kOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIHdheXBvaW50ID0gd2F5cG9pbnRzW2ldXG4gICAgICAgIGlmICh3YXlwb2ludC5vcHRpb25zLmNvbnRpbnVvdXMgfHwgaSA9PT0gd2F5cG9pbnRzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICB3YXlwb2ludC50cmlnZ2VyKFtkaXJlY3Rpb25dKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuY2xlYXJUcmlnZ2VyUXVldWVzKClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIHRoaXMud2F5cG9pbnRzLnNvcnQoYnlUcmlnZ2VyUG9pbnQpXG4gICAgdmFyIGluZGV4ID0gV2F5cG9pbnQuQWRhcHRlci5pbkFycmF5KHdheXBvaW50LCB0aGlzLndheXBvaW50cylcbiAgICB2YXIgaXNMYXN0ID0gaW5kZXggPT09IHRoaXMud2F5cG9pbnRzLmxlbmd0aCAtIDFcbiAgICByZXR1cm4gaXNMYXN0ID8gbnVsbCA6IHRoaXMud2F5cG9pbnRzW2luZGV4ICsgMV1cbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLnByZXZpb3VzID0gZnVuY3Rpb24od2F5cG9pbnQpIHtcbiAgICB0aGlzLndheXBvaW50cy5zb3J0KGJ5VHJpZ2dlclBvaW50KVxuICAgIHZhciBpbmRleCA9IFdheXBvaW50LkFkYXB0ZXIuaW5BcnJheSh3YXlwb2ludCwgdGhpcy53YXlwb2ludHMpXG4gICAgcmV0dXJuIGluZGV4ID8gdGhpcy53YXlwb2ludHNbaW5kZXggLSAxXSA6IG51bGxcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLnF1ZXVlVHJpZ2dlciA9IGZ1bmN0aW9uKHdheXBvaW50LCBkaXJlY3Rpb24pIHtcbiAgICB0aGlzLnRyaWdnZXJRdWV1ZXNbZGlyZWN0aW9uXS5wdXNoKHdheXBvaW50KVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24od2F5cG9pbnQpIHtcbiAgICB2YXIgaW5kZXggPSBXYXlwb2ludC5BZGFwdGVyLmluQXJyYXkod2F5cG9pbnQsIHRoaXMud2F5cG9pbnRzKVxuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICB0aGlzLndheXBvaW50cy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgfVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9maXJzdCAqL1xuICBHcm91cC5wcm90b3R5cGUuZmlyc3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy53YXlwb2ludHNbMF1cbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvbGFzdCAqL1xuICBHcm91cC5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLndheXBvaW50c1t0aGlzLndheXBvaW50cy5sZW5ndGggLSAxXVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5maW5kT3JDcmVhdGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgcmV0dXJuIGdyb3Vwc1tvcHRpb25zLmF4aXNdW29wdGlvbnMubmFtZV0gfHwgbmV3IEdyb3VwKG9wdGlvbnMpXG4gIH1cblxuICBXYXlwb2ludC5Hcm91cCA9IEdyb3VwXG59KCkpXG47KGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCdcblxuICB2YXIgJCA9IHdpbmRvdy5qUXVlcnlcbiAgdmFyIFdheXBvaW50ID0gd2luZG93LldheXBvaW50XG5cbiAgZnVuY3Rpb24gSlF1ZXJ5QWRhcHRlcihlbGVtZW50KSB7XG4gICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudClcbiAgfVxuXG4gICQuZWFjaChbXG4gICAgJ2lubmVySGVpZ2h0JyxcbiAgICAnaW5uZXJXaWR0aCcsXG4gICAgJ29mZicsXG4gICAgJ29mZnNldCcsXG4gICAgJ29uJyxcbiAgICAnb3V0ZXJIZWlnaHQnLFxuICAgICdvdXRlcldpZHRoJyxcbiAgICAnc2Nyb2xsTGVmdCcsXG4gICAgJ3Njcm9sbFRvcCdcbiAgXSwgZnVuY3Rpb24oaSwgbWV0aG9kKSB7XG4gICAgSlF1ZXJ5QWRhcHRlci5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpXG4gICAgICByZXR1cm4gdGhpcy4kZWxlbWVudFttZXRob2RdLmFwcGx5KHRoaXMuJGVsZW1lbnQsIGFyZ3MpXG4gICAgfVxuICB9KVxuXG4gICQuZWFjaChbXG4gICAgJ2V4dGVuZCcsXG4gICAgJ2luQXJyYXknLFxuICAgICdpc0VtcHR5T2JqZWN0J1xuICBdLCBmdW5jdGlvbihpLCBtZXRob2QpIHtcbiAgICBKUXVlcnlBZGFwdGVyW21ldGhvZF0gPSAkW21ldGhvZF1cbiAgfSlcblxuICBXYXlwb2ludC5hZGFwdGVycy5wdXNoKHtcbiAgICBuYW1lOiAnanF1ZXJ5JyxcbiAgICBBZGFwdGVyOiBKUXVlcnlBZGFwdGVyXG4gIH0pXG4gIFdheXBvaW50LkFkYXB0ZXIgPSBKUXVlcnlBZGFwdGVyXG59KCkpXG47KGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCdcblxuICB2YXIgV2F5cG9pbnQgPSB3aW5kb3cuV2F5cG9pbnRcblxuICBmdW5jdGlvbiBjcmVhdGVFeHRlbnNpb24oZnJhbWV3b3JrKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHdheXBvaW50cyA9IFtdXG4gICAgICB2YXIgb3ZlcnJpZGVzID0gYXJndW1lbnRzWzBdXG5cbiAgICAgIGlmIChmcmFtZXdvcmsuaXNGdW5jdGlvbihhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIG92ZXJyaWRlcyA9IGZyYW1ld29yay5leHRlbmQoe30sIGFyZ3VtZW50c1sxXSlcbiAgICAgICAgb3ZlcnJpZGVzLmhhbmRsZXIgPSBhcmd1bWVudHNbMF1cbiAgICAgIH1cblxuICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IGZyYW1ld29yay5leHRlbmQoe30sIG92ZXJyaWRlcywge1xuICAgICAgICAgIGVsZW1lbnQ6IHRoaXNcbiAgICAgICAgfSlcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmNvbnRleHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgb3B0aW9ucy5jb250ZXh0ID0gZnJhbWV3b3JrKHRoaXMpLmNsb3Nlc3Qob3B0aW9ucy5jb250ZXh0KVswXVxuICAgICAgICB9XG4gICAgICAgIHdheXBvaW50cy5wdXNoKG5ldyBXYXlwb2ludChvcHRpb25zKSlcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiB3YXlwb2ludHNcbiAgICB9XG4gIH1cblxuICBpZiAod2luZG93LmpRdWVyeSkge1xuICAgIHdpbmRvdy5qUXVlcnkuZm4ud2F5cG9pbnQgPSBjcmVhdGVFeHRlbnNpb24od2luZG93LmpRdWVyeSlcbiAgfVxuICBpZiAod2luZG93LlplcHRvKSB7XG4gICAgd2luZG93LlplcHRvLmZuLndheXBvaW50ID0gY3JlYXRlRXh0ZW5zaW9uKHdpbmRvdy5aZXB0bylcbiAgfVxufSgpKVxuOyIsIiQoZnVuY3Rpb24gKCkge1xuXHQkKFwiLnBhcmFsbGF4LWRpdlwiKS5wYXJhbGxheChcblx0XHR7aW1hZ2VTcmM6IFwiYXNzZXRzL2ltZy93b21hbi10eXBpbmcuanBnXCJ9KTtcblx0JChcIi5wYXJhbGxheC1kaXYyXCIpLnBhcmFsbGF4KFxuXHRcdHtpbWFnZVNyYzogXCJhc3NldHMvaW1nL2hhY2thdGhvbi5qcGdcIn0pO1xufSk7XG5cblR3ZWVuTWF4LmZyb20oXCIud3djbG9nb1wiLCAxLjUse3NjYWxlOlwiMlwiLCBvcGFjaXR5OlwiMFwiLCBvdmVyd3JpdGU6XCJub25lXCJ9KTtcblxuXG5Ud2Vlbk1heC5mcm9tKFwiLmFwcGx5X2J1dHRvblwiLCAxLjUse3JvdGF0aW9uOlwiLTEwXCIsIG92ZXJ3cml0ZTpcIm5vbmVcIn0pO1xuXG5cbiQoXCIuaW5mb3dpbmRvd3NcIikud2F5cG9pbnQoZnVuY3Rpb24gKCkge1xuXHRUd2Vlbk1heC5mcm9tKFwiLndpbmRvdzFcIiwgMS41LHtsZWZ0OlwiMTUwcHhcIiwgb3BhY2l0eTpcIjBcIiwgb3ZlcndyaXRlOlwibm9uZVwifSk7XG59LCB7XG5cdG9mZnNldDogJzUwJSdcbn0pXG5cbiQoXCIuZmFjdHNcIikud2F5cG9pbnQoZnVuY3Rpb24gKCkge1xuXHQkKFwiLmNvdW50ZXJcIikuZWFjaChmdW5jdGlvbigpIHtcblx0ICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuXHQgICAgICBjb3VudFRvID0gJHRoaXMuYXR0cignZGF0YS1jb3VudCcpO1xuXHQgIFxuXHQgICQoeyBjb3VudE51bTogJHRoaXMudGV4dCgpfSkuYW5pbWF0ZSh7XG5cdCAgICBjb3VudE51bTogY291bnRUb1xuXHQgIH0sXG5cblx0ICB7XG5cdCAgICBkdXJhdGlvbjogMjAwMCxcblx0ICAgIGVhc2luZzonbGluZWFyJyxcblx0ICAgIHN0ZXA6IGZ1bmN0aW9uKCkge1xuXHQgICAgICAkdGhpcy50ZXh0KE1hdGguZmxvb3IodGhpcy5jb3VudE51bSkpO1xuXHQgICAgfSxcblx0ICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHtcblx0ICAgICAgJHRoaXMudGV4dCh0aGlzLmNvdW50TnVtKTtcblx0ICAgICAgLy9hbGVydCgnZmluaXNoZWQnKTtcblx0ICAgIH1cblxuXHQgIH0pOyAgXG5cdCAgXG5cdH0pO1xuXG5cdFR3ZWVuTWF4LmZyb20oXCIuY291bnRlcl9wYXJlbnRcIiwgMS41LHt0b3A6XCItMTUwcHhcIiwgb3BhY2l0eTpcIjBcIiwgb3ZlcndyaXRlOlwibm9uZVwifSk7XG59LCB7XG5cdG9mZnNldDogJzUwJSdcbn0pXG5cblxuXG5cblxuXG5cbiIsIi8qIVxuICogcGFyYWxsYXguanMgdjEuNC4yIChodHRwOi8vcGl4ZWxjb2cuZ2l0aHViLmlvL3BhcmFsbGF4LmpzLylcbiAqIEBjb3B5cmlnaHQgMjAxNiBQaXhlbENvZywgSW5jLlxuICogQGxpY2Vuc2UgTUlUIChodHRwczovL2dpdGh1Yi5jb20vcGl4ZWxjb2cvcGFyYWxsYXguanMvYmxvYi9tYXN0ZXIvTElDRU5TRSlcbiAqL1xuXG47KGZ1bmN0aW9uICggJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkICkge1xuXG4gIC8vIFBvbHlmaWxsIGZvciByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgLy8gdmlhOiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9wYXVsaXJpc2gvMTU3OTY3MVxuXG4gIChmdW5jdGlvbigpIHtcbiAgICB2YXIgbGFzdFRpbWUgPSAwO1xuICAgIHZhciB2ZW5kb3JzID0gWydtcycsICdtb3onLCAnd2Via2l0JywgJ28nXTtcbiAgICBmb3IodmFyIHggPSAwOyB4IDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsreCkge1xuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2ZW5kb3JzW3hdKydSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2ZW5kb3JzW3hdKydDYW5jZWxBbmltYXRpb25GcmFtZSddXG4gICAgICAgIHx8IHdpbmRvd1t2ZW5kb3JzW3hdKydDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICB9XG5cbiAgICBpZiAoIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpXG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGN1cnJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIHZhciB0aW1lVG9DYWxsID0gTWF0aC5tYXgoMCwgMTYgLSAoY3VyclRpbWUgLSBsYXN0VGltZSkpO1xuICAgICAgICB2YXIgaWQgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHsgY2FsbGJhY2soY3VyclRpbWUgKyB0aW1lVG9DYWxsKTsgfSxcbiAgICAgICAgICB0aW1lVG9DYWxsKTtcbiAgICAgICAgbGFzdFRpbWUgPSBjdXJyVGltZSArIHRpbWVUb0NhbGw7XG4gICAgICAgIHJldHVybiBpZDtcbiAgICAgIH07XG5cbiAgICBpZiAoIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSlcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICB9O1xuICB9KCkpO1xuXG5cbiAgLy8gUGFyYWxsYXggQ29uc3RydWN0b3JcblxuICBmdW5jdGlvbiBQYXJhbGxheChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09ICdvYmplY3QnKSB7XG4gICAgICBkZWxldGUgb3B0aW9ucy5yZWZyZXNoO1xuICAgICAgZGVsZXRlIG9wdGlvbnMucmVuZGVyO1xuICAgICAgJC5leHRlbmQodGhpcywgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudCk7XG5cbiAgICBpZiAoIXRoaXMuaW1hZ2VTcmMgJiYgdGhpcy4kZWxlbWVudC5pcygnaW1nJykpIHtcbiAgICAgIHRoaXMuaW1hZ2VTcmMgPSB0aGlzLiRlbGVtZW50LmF0dHIoJ3NyYycpO1xuICAgIH1cblxuICAgIHZhciBwb3NpdGlvbnMgPSAodGhpcy5wb3NpdGlvbiArICcnKS50b0xvd2VyQ2FzZSgpLm1hdGNoKC9cXFMrL2cpIHx8IFtdO1xuXG4gICAgaWYgKHBvc2l0aW9ucy5sZW5ndGggPCAxKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaCgnY2VudGVyJyk7XG4gICAgfVxuICAgIGlmIChwb3NpdGlvbnMubGVuZ3RoID09IDEpIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKHBvc2l0aW9uc1swXSk7XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uc1swXSA9PSAndG9wJyB8fCBwb3NpdGlvbnNbMF0gPT0gJ2JvdHRvbScgfHwgcG9zaXRpb25zWzFdID09ICdsZWZ0JyB8fCBwb3NpdGlvbnNbMV0gPT0gJ3JpZ2h0Jykge1xuICAgICAgcG9zaXRpb25zID0gW3Bvc2l0aW9uc1sxXSwgcG9zaXRpb25zWzBdXTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wb3NpdGlvblggIT0gdW5kZWZpbmVkKSBwb3NpdGlvbnNbMF0gPSB0aGlzLnBvc2l0aW9uWC50b0xvd2VyQ2FzZSgpO1xuICAgIGlmICh0aGlzLnBvc2l0aW9uWSAhPSB1bmRlZmluZWQpIHBvc2l0aW9uc1sxXSA9IHRoaXMucG9zaXRpb25ZLnRvTG93ZXJDYXNlKCk7XG5cbiAgICBzZWxmLnBvc2l0aW9uWCA9IHBvc2l0aW9uc1swXTtcbiAgICBzZWxmLnBvc2l0aW9uWSA9IHBvc2l0aW9uc1sxXTtcblxuICAgIGlmICh0aGlzLnBvc2l0aW9uWCAhPSAnbGVmdCcgJiYgdGhpcy5wb3NpdGlvblggIT0gJ3JpZ2h0Jykge1xuICAgICAgaWYgKGlzTmFOKHBhcnNlSW50KHRoaXMucG9zaXRpb25YKSkpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvblggPSAnY2VudGVyJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucG9zaXRpb25YID0gcGFyc2VJbnQodGhpcy5wb3NpdGlvblgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLnBvc2l0aW9uWSAhPSAndG9wJyAmJiB0aGlzLnBvc2l0aW9uWSAhPSAnYm90dG9tJykge1xuICAgICAgaWYgKGlzTmFOKHBhcnNlSW50KHRoaXMucG9zaXRpb25ZKSkpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvblkgPSAnY2VudGVyJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucG9zaXRpb25ZID0gcGFyc2VJbnQodGhpcy5wb3NpdGlvblkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucG9zaXRpb24gPVxuICAgICAgdGhpcy5wb3NpdGlvblggKyAoaXNOYU4odGhpcy5wb3NpdGlvblgpPyAnJyA6ICdweCcpICsgJyAnICtcbiAgICAgIHRoaXMucG9zaXRpb25ZICsgKGlzTmFOKHRoaXMucG9zaXRpb25ZKT8gJycgOiAncHgnKTtcblxuICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC8oaVBvZHxpUGhvbmV8aVBhZCkvKSkge1xuICAgICAgaWYgKHRoaXMuaW1hZ2VTcmMgJiYgdGhpcy5pb3NGaXggJiYgIXRoaXMuJGVsZW1lbnQuaXMoJ2ltZycpKSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuY3NzKHtcbiAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6ICd1cmwoJyArIHRoaXMuaW1hZ2VTcmMgKyAnKScsXG4gICAgICAgICAgYmFja2dyb3VuZFNpemU6ICdjb3ZlcicsXG4gICAgICAgICAgYmFja2dyb3VuZFBvc2l0aW9uOiB0aGlzLnBvc2l0aW9uXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goLyhBbmRyb2lkKS8pKSB7XG4gICAgICBpZiAodGhpcy5pbWFnZVNyYyAmJiB0aGlzLmFuZHJvaWRGaXggJiYgIXRoaXMuJGVsZW1lbnQuaXMoJ2ltZycpKSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuY3NzKHtcbiAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6ICd1cmwoJyArIHRoaXMuaW1hZ2VTcmMgKyAnKScsXG4gICAgICAgICAgYmFja2dyb3VuZFNpemU6ICdjb3ZlcicsXG4gICAgICAgICAgYmFja2dyb3VuZFBvc2l0aW9uOiB0aGlzLnBvc2l0aW9uXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy4kbWlycm9yID0gJCgnPGRpdiAvPicpLnByZXBlbmRUbygnYm9keScpO1xuXG4gICAgdmFyIHNsaWRlciA9IHRoaXMuJGVsZW1lbnQuZmluZCgnPi5wYXJhbGxheC1zbGlkZXInKTtcbiAgICB2YXIgc2xpZGVyRXhpc3RlZCA9IGZhbHNlO1xuXG4gICAgaWYgKHNsaWRlci5sZW5ndGggPT0gMClcbiAgICAgIHRoaXMuJHNsaWRlciA9ICQoJzxpbWcgLz4nKS5wcmVwZW5kVG8odGhpcy4kbWlycm9yKTtcbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuJHNsaWRlciA9IHNsaWRlci5wcmVwZW5kVG8odGhpcy4kbWlycm9yKVxuICAgICAgc2xpZGVyRXhpc3RlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy4kbWlycm9yLmFkZENsYXNzKCdwYXJhbGxheC1taXJyb3InKS5jc3Moe1xuICAgICAgdmlzaWJpbGl0eTogJ2hpZGRlbicsXG4gICAgICB6SW5kZXg6IHRoaXMuekluZGV4LFxuICAgICAgcG9zaXRpb246ICdmaXhlZCcsXG4gICAgICB0b3A6IDAsXG4gICAgICBsZWZ0OiAwLFxuICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nXG4gICAgfSk7XG5cbiAgICB0aGlzLiRzbGlkZXIuYWRkQ2xhc3MoJ3BhcmFsbGF4LXNsaWRlcicpLm9uZSgnbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFzZWxmLm5hdHVyYWxIZWlnaHQgfHwgIXNlbGYubmF0dXJhbFdpZHRoKSB7XG4gICAgICAgIHNlbGYubmF0dXJhbEhlaWdodCA9IHRoaXMubmF0dXJhbEhlaWdodCB8fCB0aGlzLmhlaWdodCB8fCAxO1xuICAgICAgICBzZWxmLm5hdHVyYWxXaWR0aCAgPSB0aGlzLm5hdHVyYWxXaWR0aCAgfHwgdGhpcy53aWR0aCAgfHwgMTtcbiAgICAgIH1cbiAgICAgIHNlbGYuYXNwZWN0UmF0aW8gPSBzZWxmLm5hdHVyYWxXaWR0aCAvIHNlbGYubmF0dXJhbEhlaWdodDtcblxuICAgICAgUGFyYWxsYXguaXNTZXR1cCB8fCBQYXJhbGxheC5zZXR1cCgpO1xuICAgICAgUGFyYWxsYXguc2xpZGVycy5wdXNoKHNlbGYpO1xuICAgICAgUGFyYWxsYXguaXNGcmVzaCA9IGZhbHNlO1xuICAgICAgUGFyYWxsYXgucmVxdWVzdFJlbmRlcigpO1xuICAgIH0pO1xuXG4gICAgaWYgKCFzbGlkZXJFeGlzdGVkKVxuICAgICAgdGhpcy4kc2xpZGVyWzBdLnNyYyA9IHRoaXMuaW1hZ2VTcmM7XG5cbiAgICBpZiAodGhpcy5uYXR1cmFsSGVpZ2h0ICYmIHRoaXMubmF0dXJhbFdpZHRoIHx8IHRoaXMuJHNsaWRlclswXS5jb21wbGV0ZSB8fCBzbGlkZXIubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy4kc2xpZGVyLnRyaWdnZXIoJ2xvYWQnKTtcbiAgICB9XG5cbiAgfTtcblxuXG4gIC8vIFBhcmFsbGF4IEluc3RhbmNlIE1ldGhvZHNcblxuICAkLmV4dGVuZChQYXJhbGxheC5wcm90b3R5cGUsIHtcbiAgICBzcGVlZDogICAgMC4yLFxuICAgIGJsZWVkOiAgICAwLFxuICAgIHpJbmRleDogICAtMTAwLFxuICAgIGlvc0ZpeDogICB0cnVlLFxuICAgIGFuZHJvaWRGaXg6IHRydWUsXG4gICAgcG9zaXRpb246ICdjZW50ZXInLFxuICAgIG92ZXJTY3JvbGxGaXg6IGZhbHNlLFxuXG4gICAgcmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmJveFdpZHRoICAgICAgICA9IHRoaXMuJGVsZW1lbnQub3V0ZXJXaWR0aCgpO1xuICAgICAgdGhpcy5ib3hIZWlnaHQgICAgICAgPSB0aGlzLiRlbGVtZW50Lm91dGVySGVpZ2h0KCkgKyB0aGlzLmJsZWVkICogMjtcbiAgICAgIHRoaXMuYm94T2Zmc2V0VG9wICAgID0gdGhpcy4kZWxlbWVudC5vZmZzZXQoKS50b3AgLSB0aGlzLmJsZWVkO1xuICAgICAgdGhpcy5ib3hPZmZzZXRMZWZ0ICAgPSB0aGlzLiRlbGVtZW50Lm9mZnNldCgpLmxlZnQ7XG4gICAgICB0aGlzLmJveE9mZnNldEJvdHRvbSA9IHRoaXMuYm94T2Zmc2V0VG9wICsgdGhpcy5ib3hIZWlnaHQ7XG5cbiAgICAgIHZhciB3aW5IZWlnaHQgPSBQYXJhbGxheC53aW5IZWlnaHQ7XG4gICAgICB2YXIgZG9jSGVpZ2h0ID0gUGFyYWxsYXguZG9jSGVpZ2h0O1xuICAgICAgdmFyIG1heE9mZnNldCA9IE1hdGgubWluKHRoaXMuYm94T2Zmc2V0VG9wLCBkb2NIZWlnaHQgLSB3aW5IZWlnaHQpO1xuICAgICAgdmFyIG1pbk9mZnNldCA9IE1hdGgubWF4KHRoaXMuYm94T2Zmc2V0VG9wICsgdGhpcy5ib3hIZWlnaHQgLSB3aW5IZWlnaHQsIDApO1xuICAgICAgdmFyIGltYWdlSGVpZ2h0TWluID0gdGhpcy5ib3hIZWlnaHQgKyAobWF4T2Zmc2V0IC0gbWluT2Zmc2V0KSAqICgxIC0gdGhpcy5zcGVlZCkgfCAwO1xuICAgICAgdmFyIGltYWdlT2Zmc2V0TWluID0gKHRoaXMuYm94T2Zmc2V0VG9wIC0gbWF4T2Zmc2V0KSAqICgxIC0gdGhpcy5zcGVlZCkgfCAwO1xuXG4gICAgICBpZiAoaW1hZ2VIZWlnaHRNaW4gKiB0aGlzLmFzcGVjdFJhdGlvID49IHRoaXMuYm94V2lkdGgpIHtcbiAgICAgICAgdGhpcy5pbWFnZVdpZHRoICAgID0gaW1hZ2VIZWlnaHRNaW4gKiB0aGlzLmFzcGVjdFJhdGlvIHwgMDtcbiAgICAgICAgdGhpcy5pbWFnZUhlaWdodCAgID0gaW1hZ2VIZWlnaHRNaW47XG4gICAgICAgIHRoaXMub2Zmc2V0QmFzZVRvcCA9IGltYWdlT2Zmc2V0TWluO1xuXG4gICAgICAgIHZhciBtYXJnaW4gPSB0aGlzLmltYWdlV2lkdGggLSB0aGlzLmJveFdpZHRoO1xuXG4gICAgICAgIGlmICh0aGlzLnBvc2l0aW9uWCA9PSAnbGVmdCcpIHtcbiAgICAgICAgICB0aGlzLm9mZnNldExlZnQgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucG9zaXRpb25YID09ICdyaWdodCcpIHtcbiAgICAgICAgICB0aGlzLm9mZnNldExlZnQgPSAtIG1hcmdpbjtcbiAgICAgICAgfSBlbHNlIGlmICghaXNOYU4odGhpcy5wb3NpdGlvblgpKSB7XG4gICAgICAgICAgdGhpcy5vZmZzZXRMZWZ0ID0gTWF0aC5tYXgodGhpcy5wb3NpdGlvblgsIC0gbWFyZ2luKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLm9mZnNldExlZnQgPSAtIG1hcmdpbiAvIDIgfCAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmltYWdlV2lkdGggICAgPSB0aGlzLmJveFdpZHRoO1xuICAgICAgICB0aGlzLmltYWdlSGVpZ2h0ICAgPSB0aGlzLmJveFdpZHRoIC8gdGhpcy5hc3BlY3RSYXRpbyB8IDA7XG4gICAgICAgIHRoaXMub2Zmc2V0TGVmdCAgICA9IDA7XG5cbiAgICAgICAgdmFyIG1hcmdpbiA9IHRoaXMuaW1hZ2VIZWlnaHQgLSBpbWFnZUhlaWdodE1pbjtcblxuICAgICAgICBpZiAodGhpcy5wb3NpdGlvblkgPT0gJ3RvcCcpIHtcbiAgICAgICAgICB0aGlzLm9mZnNldEJhc2VUb3AgPSBpbWFnZU9mZnNldE1pbjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnBvc2l0aW9uWSA9PSAnYm90dG9tJykge1xuICAgICAgICAgIHRoaXMub2Zmc2V0QmFzZVRvcCA9IGltYWdlT2Zmc2V0TWluIC0gbWFyZ2luO1xuICAgICAgICB9IGVsc2UgaWYgKCFpc05hTih0aGlzLnBvc2l0aW9uWSkpIHtcbiAgICAgICAgICB0aGlzLm9mZnNldEJhc2VUb3AgPSBpbWFnZU9mZnNldE1pbiArIE1hdGgubWF4KHRoaXMucG9zaXRpb25ZLCAtIG1hcmdpbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5vZmZzZXRCYXNlVG9wID0gaW1hZ2VPZmZzZXRNaW4gLSBtYXJnaW4gLyAyIHwgMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNjcm9sbFRvcCAgICA9IFBhcmFsbGF4LnNjcm9sbFRvcDtcbiAgICAgIHZhciBzY3JvbGxMZWZ0ICAgPSBQYXJhbGxheC5zY3JvbGxMZWZ0O1xuICAgICAgdmFyIG92ZXJTY3JvbGwgICA9IHRoaXMub3ZlclNjcm9sbEZpeCA/IFBhcmFsbGF4Lm92ZXJTY3JvbGwgOiAwO1xuICAgICAgdmFyIHNjcm9sbEJvdHRvbSA9IHNjcm9sbFRvcCArIFBhcmFsbGF4LndpbkhlaWdodDtcblxuICAgICAgaWYgKHRoaXMuYm94T2Zmc2V0Qm90dG9tID4gc2Nyb2xsVG9wICYmIHRoaXMuYm94T2Zmc2V0VG9wIDw9IHNjcm9sbEJvdHRvbSkge1xuICAgICAgICB0aGlzLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgICAgIHRoaXMubWlycm9yVG9wID0gdGhpcy5ib3hPZmZzZXRUb3AgIC0gc2Nyb2xsVG9wO1xuICAgICAgICB0aGlzLm1pcnJvckxlZnQgPSB0aGlzLmJveE9mZnNldExlZnQgLSBzY3JvbGxMZWZ0O1xuICAgICAgICB0aGlzLm9mZnNldFRvcCA9IHRoaXMub2Zmc2V0QmFzZVRvcCAtIHRoaXMubWlycm9yVG9wICogKDEgLSB0aGlzLnNwZWVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiRtaXJyb3IuY3NzKHtcbiAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoMHB4LCAwcHgsIDBweCknLFxuICAgICAgICB2aXNpYmlsaXR5OiB0aGlzLnZpc2liaWxpdHksXG4gICAgICAgIHRvcDogdGhpcy5taXJyb3JUb3AgLSBvdmVyU2Nyb2xsLFxuICAgICAgICBsZWZ0OiB0aGlzLm1pcnJvckxlZnQsXG4gICAgICAgIGhlaWdodDogdGhpcy5ib3hIZWlnaHQsXG4gICAgICAgIHdpZHRoOiB0aGlzLmJveFdpZHRoXG4gICAgICB9KTtcblxuICAgICAgdGhpcy4kc2xpZGVyLmNzcyh7XG4gICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKDBweCwgMHB4LCAwcHgpJyxcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgIHRvcDogdGhpcy5vZmZzZXRUb3AsXG4gICAgICAgIGxlZnQ6IHRoaXMub2Zmc2V0TGVmdCxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmltYWdlSGVpZ2h0LFxuICAgICAgICB3aWR0aDogdGhpcy5pbWFnZVdpZHRoLFxuICAgICAgICBtYXhXaWR0aDogJ25vbmUnXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG5cbiAgLy8gUGFyYWxsYXggU3RhdGljIE1ldGhvZHNcblxuICAkLmV4dGVuZChQYXJhbGxheCwge1xuICAgIHNjcm9sbFRvcDogICAgMCxcbiAgICBzY3JvbGxMZWZ0OiAgIDAsXG4gICAgd2luSGVpZ2h0OiAgICAwLFxuICAgIHdpbldpZHRoOiAgICAgMCxcbiAgICBkb2NIZWlnaHQ6ICAgIDEgPDwgMzAsXG4gICAgZG9jV2lkdGg6ICAgICAxIDw8IDMwLFxuICAgIHNsaWRlcnM6ICAgICAgW10sXG4gICAgaXNSZWFkeTogICAgICBmYWxzZSxcbiAgICBpc0ZyZXNoOiAgICAgIGZhbHNlLFxuICAgIGlzQnVzeTogICAgICAgZmFsc2UsXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5pc1JlYWR5KSByZXR1cm47XG5cbiAgICAgIHZhciAkZG9jID0gJChkb2N1bWVudCksICR3aW4gPSAkKHdpbmRvdyk7XG5cbiAgICAgIHZhciBsb2FkRGltZW5zaW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBQYXJhbGxheC53aW5IZWlnaHQgPSAkd2luLmhlaWdodCgpO1xuICAgICAgICBQYXJhbGxheC53aW5XaWR0aCAgPSAkd2luLndpZHRoKCk7XG4gICAgICAgIFBhcmFsbGF4LmRvY0hlaWdodCA9ICRkb2MuaGVpZ2h0KCk7XG4gICAgICAgIFBhcmFsbGF4LmRvY1dpZHRoICA9ICRkb2Mud2lkdGgoKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBsb2FkU2Nyb2xsUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHdpblNjcm9sbFRvcCAgPSAkd2luLnNjcm9sbFRvcCgpO1xuICAgICAgICB2YXIgc2Nyb2xsVG9wTWF4ICA9IFBhcmFsbGF4LmRvY0hlaWdodCAtIFBhcmFsbGF4LndpbkhlaWdodDtcbiAgICAgICAgdmFyIHNjcm9sbExlZnRNYXggPSBQYXJhbGxheC5kb2NXaWR0aCAgLSBQYXJhbGxheC53aW5XaWR0aDtcbiAgICAgICAgUGFyYWxsYXguc2Nyb2xsVG9wICA9IE1hdGgubWF4KDAsIE1hdGgubWluKHNjcm9sbFRvcE1heCwgIHdpblNjcm9sbFRvcCkpO1xuICAgICAgICBQYXJhbGxheC5zY3JvbGxMZWZ0ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oc2Nyb2xsTGVmdE1heCwgJHdpbi5zY3JvbGxMZWZ0KCkpKTtcbiAgICAgICAgUGFyYWxsYXgub3ZlclNjcm9sbCA9IE1hdGgubWF4KHdpblNjcm9sbFRvcCAtIHNjcm9sbFRvcE1heCwgTWF0aC5taW4od2luU2Nyb2xsVG9wLCAwKSk7XG4gICAgICB9O1xuXG4gICAgICAkd2luLm9uKCdyZXNpemUucHgucGFyYWxsYXggbG9hZC5weC5wYXJhbGxheCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxvYWREaW1lbnNpb25zKCk7XG4gICAgICAgICAgUGFyYWxsYXguaXNGcmVzaCA9IGZhbHNlO1xuICAgICAgICAgIFBhcmFsbGF4LnJlcXVlc3RSZW5kZXIoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdzY3JvbGwucHgucGFyYWxsYXggbG9hZC5weC5wYXJhbGxheCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxvYWRTY3JvbGxQb3NpdGlvbigpO1xuICAgICAgICAgIFBhcmFsbGF4LnJlcXVlc3RSZW5kZXIoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIGxvYWREaW1lbnNpb25zKCk7XG4gICAgICBsb2FkU2Nyb2xsUG9zaXRpb24oKTtcblxuICAgICAgdGhpcy5pc1JlYWR5ID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgY29uZmlndXJlOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgZGVsZXRlIG9wdGlvbnMucmVmcmVzaDtcbiAgICAgICAgZGVsZXRlIG9wdGlvbnMucmVuZGVyO1xuICAgICAgICAkLmV4dGVuZCh0aGlzLnByb3RvdHlwZSwgb3B0aW9ucyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgJC5lYWNoKHRoaXMuc2xpZGVycywgZnVuY3Rpb24oKXsgdGhpcy5yZWZyZXNoKCkgfSk7XG4gICAgICB0aGlzLmlzRnJlc2ggPSB0cnVlO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5pc0ZyZXNoIHx8IHRoaXMucmVmcmVzaCgpO1xuICAgICAgJC5lYWNoKHRoaXMuc2xpZGVycywgZnVuY3Rpb24oKXsgdGhpcy5yZW5kZXIoKSB9KTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdFJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGlmICghdGhpcy5pc0J1c3kpIHtcbiAgICAgICAgdGhpcy5pc0J1c3kgPSB0cnVlO1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYucmVuZGVyKCk7XG4gICAgICAgICAgc2VsZi5pc0J1c3kgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBkZXN0cm95OiBmdW5jdGlvbihlbCl7XG4gICAgICB2YXIgaSxcbiAgICAgICAgICBwYXJhbGxheEVsZW1lbnQgPSAkKGVsKS5kYXRhKCdweC5wYXJhbGxheCcpO1xuICAgICAgcGFyYWxsYXhFbGVtZW50LiRtaXJyb3IucmVtb3ZlKCk7XG4gICAgICBmb3IoaT0wOyBpIDwgdGhpcy5zbGlkZXJzLmxlbmd0aDsgaSs9MSl7XG4gICAgICAgIGlmKHRoaXMuc2xpZGVyc1tpXSA9PSBwYXJhbGxheEVsZW1lbnQpe1xuICAgICAgICAgIHRoaXMuc2xpZGVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgICQoZWwpLmRhdGEoJ3B4LnBhcmFsbGF4JywgZmFsc2UpO1xuICAgICAgaWYodGhpcy5zbGlkZXJzLmxlbmd0aCA9PT0gMCl7XG4gICAgICAgICQod2luZG93KS5vZmYoJ3Njcm9sbC5weC5wYXJhbGxheCByZXNpemUucHgucGFyYWxsYXggbG9hZC5weC5wYXJhbGxheCcpO1xuICAgICAgICB0aGlzLmlzUmVhZHkgPSBmYWxzZTtcbiAgICAgICAgUGFyYWxsYXguaXNTZXR1cCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cblxuICAvLyBQYXJhbGxheCBQbHVnaW4gRGVmaW5pdGlvblxuXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICB2YXIgb3B0aW9ucyA9IHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uO1xuXG4gICAgICBpZiAodGhpcyA9PSB3aW5kb3cgfHwgdGhpcyA9PSBkb2N1bWVudCB8fCAkdGhpcy5pcygnYm9keScpKSB7XG4gICAgICAgIFBhcmFsbGF4LmNvbmZpZ3VyZShvcHRpb25zKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCEkdGhpcy5kYXRhKCdweC5wYXJhbGxheCcpKSB7XG4gICAgICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgJHRoaXMuZGF0YSgpLCBvcHRpb25zKTtcbiAgICAgICAgJHRoaXMuZGF0YSgncHgucGFyYWxsYXgnLCBuZXcgUGFyYWxsYXgodGhpcywgb3B0aW9ucykpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAodHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JylcbiAgICAgIHtcbiAgICAgICAgJC5leHRlbmQoJHRoaXMuZGF0YSgncHgucGFyYWxsYXgnKSwgb3B0aW9ucyk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykge1xuICAgICAgICBpZihvcHRpb24gPT0gJ2Rlc3Ryb3knKXtcbiAgICAgICAgICAgIFBhcmFsbGF4WydkZXN0cm95J10odGhpcyk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIFBhcmFsbGF4W29wdGlvbl0oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH07XG5cbiAgdmFyIG9sZCA9ICQuZm4ucGFyYWxsYXg7XG5cbiAgJC5mbi5wYXJhbGxheCAgICAgICAgICAgICA9IFBsdWdpbjtcbiAgJC5mbi5wYXJhbGxheC5Db25zdHJ1Y3RvciA9IFBhcmFsbGF4O1xuXG5cbiAgLy8gUGFyYWxsYXggTm8gQ29uZmxpY3RcblxuICAkLmZuLnBhcmFsbGF4Lm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgJC5mbi5wYXJhbGxheCA9IG9sZDtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuXG4gIC8vIFBhcmFsbGF4IERhdGEtQVBJXG5cbiAgJChkb2N1bWVudCkub24oJ3JlYWR5LnB4LnBhcmFsbGF4LmRhdGEtYXBpJywgZnVuY3Rpb24gKCkge1xuICAgICQoJ1tkYXRhLXBhcmFsbGF4PVwic2Nyb2xsXCJdJykucGFyYWxsYXgoKTtcbiAgfSk7XG5cbn0oalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KSk7XG4iXX0=
