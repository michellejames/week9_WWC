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

	TweenMax.from(".menu-button", 1 ,{scale:"2", yoyo: true, repeat: 4, overwrite:"none"});

	//Women Who Code logo
	TweenMax.from(".hero__wwclogo", 1.5,{scale:"3", opacity:"0", overwrite:"none"});

	//Navbar
	$(".menu-button").on("click", function () {
		$("nav").toggleClass("open");
	});

	//ScrollTo 
	$(".home").on("click", function () {
		$.scrollTo($("header"), 400);
	});

	$(".scroll-to-infowindows").on("click", function () {
		$.scrollTo($(".infowindows"), 400);
	});

	$(".scroll-to-member").on("click", function () {
		$.scrollTo($(".data"), 400);
	});

	//Parallax
	$(".parallax__womantyping").parallax(
		{imageSrc: "assets/img/woman-typing.jpg"});
	$(".parallax__hackathon").parallax(
		{imageSrc: "assets/img/hackathon.jpg"});
});



//Application Wiggl Button
$(".application").waypoint(function () {
	TweenMax.from(".button", 0.2,{rotation:"-3", yoyo: true, repeat:-1, overwrite:"none"});

}, {
	offset: '25%'
})


//Infowindows swipping in from sides
$(".infowindows").waypoint(function () {
	$('.window1').toggleClass('active');
}, {
	offset: '40%'
})

$(".infowindows").waypoint(function () {
	$('.women').toggleClass('active');
}, {
	offset: '30%'
})


$(".infowindows").waypoint(function () {
	$('.window2').toggleClass('active');
}, {
	offset: '20%'
})

$(".infowindows").waypoint(function () {
	$('.window3').toggleClass('active');

}, {
	offset: '0%'
})

$(".infowindows").waypoint(function () {
	$('.window4').toggleClass('active');
}, {
	offset: '-20%'
})

//
$(".data").waypoint(function () {
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

	$('.counter_parent').toggleClass('active');
}, {
	offset: '20%'
})




	//Member Wiggle Button
	TweenMax.from(".member_button", 0.2,{rotation:"-3", yoyo: true, repeat:-1, overwrite:"none"});



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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS5zY3JvbGxUby5qcyIsImpxdWVyeS53YXlwb2ludHMuanMiLCJtYWluLmpzIiwicGFyYWxsYXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhbGwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqIGpRdWVyeS5zY3JvbGxUb1xuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTUgQXJpZWwgRmxlc2xlciAtIGFmbGVzbGVyIOKXiyBnbWFpbCDigKIgY29tIHwgaHR0cDovL2ZsZXNsZXIuYmxvZ3Nwb3QuY29tXG4gKiBMaWNlbnNlZCB1bmRlciBNSVRcbiAqIGh0dHA6Ly9mbGVzbGVyLmJsb2dzcG90LmNvbS8yMDA3LzEwL2pxdWVyeXNjcm9sbHRvLmh0bWxcbiAqIEBwcm9qZWN0RGVzY3JpcHRpb24gTGlnaHR3ZWlnaHQsIGNyb3NzLWJyb3dzZXIgYW5kIGhpZ2hseSBjdXN0b21pemFibGUgYW5pbWF0ZWQgc2Nyb2xsaW5nIHdpdGggalF1ZXJ5XG4gKiBAYXV0aG9yIEFyaWVsIEZsZXNsZXJcbiAqIEB2ZXJzaW9uIDIuMS4yXG4gKi9cbjsoZnVuY3Rpb24oZmFjdG9yeSkge1xuXHQndXNlIHN0cmljdCc7XG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0XHQvLyBBTURcblx0XHRkZWZpbmUoWydqcXVlcnknXSwgZmFjdG9yeSk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0XHQvLyBDb21tb25KU1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gR2xvYmFsXG5cdFx0ZmFjdG9yeShqUXVlcnkpO1xuXHR9XG59KShmdW5jdGlvbigkKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgJHNjcm9sbFRvID0gJC5zY3JvbGxUbyA9IGZ1bmN0aW9uKHRhcmdldCwgZHVyYXRpb24sIHNldHRpbmdzKSB7XG5cdFx0cmV0dXJuICQod2luZG93KS5zY3JvbGxUbyh0YXJnZXQsIGR1cmF0aW9uLCBzZXR0aW5ncyk7XG5cdH07XG5cblx0JHNjcm9sbFRvLmRlZmF1bHRzID0ge1xuXHRcdGF4aXM6J3h5Jyxcblx0XHRkdXJhdGlvbjogMCxcblx0XHRsaW1pdDp0cnVlXG5cdH07XG5cblx0ZnVuY3Rpb24gaXNXaW4oZWxlbSkge1xuXHRcdHJldHVybiAhZWxlbS5ub2RlTmFtZSB8fFxuXHRcdFx0JC5pbkFycmF5KGVsZW0ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSwgWydpZnJhbWUnLCcjZG9jdW1lbnQnLCdodG1sJywnYm9keSddKSAhPT0gLTE7XG5cdH1cdFx0XG5cblx0JC5mbi5zY3JvbGxUbyA9IGZ1bmN0aW9uKHRhcmdldCwgZHVyYXRpb24sIHNldHRpbmdzKSB7XG5cdFx0aWYgKHR5cGVvZiBkdXJhdGlvbiA9PT0gJ29iamVjdCcpIHtcblx0XHRcdHNldHRpbmdzID0gZHVyYXRpb247XG5cdFx0XHRkdXJhdGlvbiA9IDA7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygc2V0dGluZ3MgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdHNldHRpbmdzID0geyBvbkFmdGVyOnNldHRpbmdzIH07XG5cdFx0fVxuXHRcdGlmICh0YXJnZXQgPT09ICdtYXgnKSB7XG5cdFx0XHR0YXJnZXQgPSA5ZTk7XG5cdFx0fVxuXG5cdFx0c2V0dGluZ3MgPSAkLmV4dGVuZCh7fSwgJHNjcm9sbFRvLmRlZmF1bHRzLCBzZXR0aW5ncyk7XG5cdFx0Ly8gU3BlZWQgaXMgc3RpbGwgcmVjb2duaXplZCBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcblx0XHRkdXJhdGlvbiA9IGR1cmF0aW9uIHx8IHNldHRpbmdzLmR1cmF0aW9uO1xuXHRcdC8vIE1ha2Ugc3VyZSB0aGUgc2V0dGluZ3MgYXJlIGdpdmVuIHJpZ2h0XG5cdFx0dmFyIHF1ZXVlID0gc2V0dGluZ3MucXVldWUgJiYgc2V0dGluZ3MuYXhpcy5sZW5ndGggPiAxO1xuXHRcdGlmIChxdWV1ZSkge1xuXHRcdFx0Ly8gTGV0J3Mga2VlcCB0aGUgb3ZlcmFsbCBkdXJhdGlvblxuXHRcdFx0ZHVyYXRpb24gLz0gMjtcblx0XHR9XG5cdFx0c2V0dGluZ3Mub2Zmc2V0ID0gYm90aChzZXR0aW5ncy5vZmZzZXQpO1xuXHRcdHNldHRpbmdzLm92ZXIgPSBib3RoKHNldHRpbmdzLm92ZXIpO1xuXG5cdFx0cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdC8vIE51bGwgdGFyZ2V0IHlpZWxkcyBub3RoaW5nLCBqdXN0IGxpa2UgalF1ZXJ5IGRvZXNcblx0XHRcdGlmICh0YXJnZXQgPT09IG51bGwpIHJldHVybjtcblxuXHRcdFx0dmFyIHdpbiA9IGlzV2luKHRoaXMpLFxuXHRcdFx0XHRlbGVtID0gd2luID8gdGhpcy5jb250ZW50V2luZG93IHx8IHdpbmRvdyA6IHRoaXMsXG5cdFx0XHRcdCRlbGVtID0gJChlbGVtKSxcblx0XHRcdFx0dGFyZyA9IHRhcmdldCwgXG5cdFx0XHRcdGF0dHIgPSB7fSxcblx0XHRcdFx0dG9mZjtcblxuXHRcdFx0c3dpdGNoICh0eXBlb2YgdGFyZykge1xuXHRcdFx0XHQvLyBBIG51bWJlciB3aWxsIHBhc3MgdGhlIHJlZ2V4XG5cdFx0XHRcdGNhc2UgJ251bWJlcic6XG5cdFx0XHRcdGNhc2UgJ3N0cmluZyc6XG5cdFx0XHRcdFx0aWYgKC9eKFsrLV09Pyk/XFxkKyhcXC5cXGQrKT8ocHh8JSk/JC8udGVzdCh0YXJnKSkge1xuXHRcdFx0XHRcdFx0dGFyZyA9IGJvdGgodGFyZyk7XG5cdFx0XHRcdFx0XHQvLyBXZSBhcmUgZG9uZVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIFJlbGF0aXZlL0Fic29sdXRlIHNlbGVjdG9yXG5cdFx0XHRcdFx0dGFyZyA9IHdpbiA/ICQodGFyZykgOiAkKHRhcmcsIGVsZW0pO1xuXHRcdFx0XHRcdC8qIGZhbGxzIHRocm91Z2ggKi9cblx0XHRcdFx0Y2FzZSAnb2JqZWN0Jzpcblx0XHRcdFx0XHRpZiAodGFyZy5sZW5ndGggPT09IDApIHJldHVybjtcblx0XHRcdFx0XHQvLyBET01FbGVtZW50IC8galF1ZXJ5XG5cdFx0XHRcdFx0aWYgKHRhcmcuaXMgfHwgdGFyZy5zdHlsZSkge1xuXHRcdFx0XHRcdFx0Ly8gR2V0IHRoZSByZWFsIHBvc2l0aW9uIG9mIHRoZSB0YXJnZXRcblx0XHRcdFx0XHRcdHRvZmYgPSAodGFyZyA9ICQodGFyZykpLm9mZnNldCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dmFyIG9mZnNldCA9ICQuaXNGdW5jdGlvbihzZXR0aW5ncy5vZmZzZXQpICYmIHNldHRpbmdzLm9mZnNldChlbGVtLCB0YXJnKSB8fCBzZXR0aW5ncy5vZmZzZXQ7XG5cblx0XHRcdCQuZWFjaChzZXR0aW5ncy5heGlzLnNwbGl0KCcnKSwgZnVuY3Rpb24oaSwgYXhpcykge1xuXHRcdFx0XHR2YXIgUG9zXHQ9IGF4aXMgPT09ICd4JyA/ICdMZWZ0JyA6ICdUb3AnLFxuXHRcdFx0XHRcdHBvcyA9IFBvcy50b0xvd2VyQ2FzZSgpLFxuXHRcdFx0XHRcdGtleSA9ICdzY3JvbGwnICsgUG9zLFxuXHRcdFx0XHRcdHByZXYgPSAkZWxlbVtrZXldKCksXG5cdFx0XHRcdFx0bWF4ID0gJHNjcm9sbFRvLm1heChlbGVtLCBheGlzKTtcblxuXHRcdFx0XHRpZiAodG9mZikgey8vIGpRdWVyeSAvIERPTUVsZW1lbnRcblx0XHRcdFx0XHRhdHRyW2tleV0gPSB0b2ZmW3Bvc10gKyAod2luID8gMCA6IHByZXYgLSAkZWxlbS5vZmZzZXQoKVtwb3NdKTtcblxuXHRcdFx0XHRcdC8vIElmIGl0J3MgYSBkb20gZWxlbWVudCwgcmVkdWNlIHRoZSBtYXJnaW5cblx0XHRcdFx0XHRpZiAoc2V0dGluZ3MubWFyZ2luKSB7XG5cdFx0XHRcdFx0XHRhdHRyW2tleV0gLT0gcGFyc2VJbnQodGFyZy5jc3MoJ21hcmdpbicrUG9zKSwgMTApIHx8IDA7XG5cdFx0XHRcdFx0XHRhdHRyW2tleV0gLT0gcGFyc2VJbnQodGFyZy5jc3MoJ2JvcmRlcicrUG9zKydXaWR0aCcpLCAxMCkgfHwgMDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRhdHRyW2tleV0gKz0gb2Zmc2V0W3Bvc10gfHwgMDtcblxuXHRcdFx0XHRcdGlmIChzZXR0aW5ncy5vdmVyW3Bvc10pIHtcblx0XHRcdFx0XHRcdC8vIFNjcm9sbCB0byBhIGZyYWN0aW9uIG9mIGl0cyB3aWR0aC9oZWlnaHRcblx0XHRcdFx0XHRcdGF0dHJba2V5XSArPSB0YXJnW2F4aXMgPT09ICd4Jz8nd2lkdGgnOidoZWlnaHQnXSgpICogc2V0dGluZ3Mub3Zlcltwb3NdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2YXIgdmFsID0gdGFyZ1twb3NdO1xuXHRcdFx0XHRcdC8vIEhhbmRsZSBwZXJjZW50YWdlIHZhbHVlc1xuXHRcdFx0XHRcdGF0dHJba2V5XSA9IHZhbC5zbGljZSAmJiB2YWwuc2xpY2UoLTEpID09PSAnJScgP1xuXHRcdFx0XHRcdFx0cGFyc2VGbG9hdCh2YWwpIC8gMTAwICogbWF4XG5cdFx0XHRcdFx0XHQ6IHZhbDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIE51bWJlciBvciAnbnVtYmVyJ1xuXHRcdFx0XHRpZiAoc2V0dGluZ3MubGltaXQgJiYgL15cXGQrJC8udGVzdChhdHRyW2tleV0pKSB7XG5cdFx0XHRcdFx0Ly8gQ2hlY2sgdGhlIGxpbWl0c1xuXHRcdFx0XHRcdGF0dHJba2V5XSA9IGF0dHJba2V5XSA8PSAwID8gMCA6IE1hdGgubWluKGF0dHJba2V5XSwgbWF4KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIERvbid0IHdhc3RlIHRpbWUgYW5pbWF0aW5nLCBpZiB0aGVyZSdzIG5vIG5lZWQuXG5cdFx0XHRcdGlmICghaSAmJiBzZXR0aW5ncy5heGlzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRpZiAocHJldiA9PT0gYXR0cltrZXldKSB7XG5cdFx0XHRcdFx0XHQvLyBObyBhbmltYXRpb24gbmVlZGVkXG5cdFx0XHRcdFx0XHRhdHRyID0ge307XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChxdWV1ZSkge1xuXHRcdFx0XHRcdFx0Ly8gSW50ZXJtZWRpYXRlIGFuaW1hdGlvblxuXHRcdFx0XHRcdFx0YW5pbWF0ZShzZXR0aW5ncy5vbkFmdGVyRmlyc3QpO1xuXHRcdFx0XHRcdFx0Ly8gRG9uJ3QgYW5pbWF0ZSB0aGlzIGF4aXMgYWdhaW4gaW4gdGhlIG5leHQgaXRlcmF0aW9uLlxuXHRcdFx0XHRcdFx0YXR0ciA9IHt9O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdGFuaW1hdGUoc2V0dGluZ3Mub25BZnRlcik7XG5cblx0XHRcdGZ1bmN0aW9uIGFuaW1hdGUoY2FsbGJhY2spIHtcblx0XHRcdFx0dmFyIG9wdHMgPSAkLmV4dGVuZCh7fSwgc2V0dGluZ3MsIHtcblx0XHRcdFx0XHQvLyBUaGUgcXVldWUgc2V0dGluZyBjb25mbGljdHMgd2l0aCBhbmltYXRlKClcblx0XHRcdFx0XHQvLyBGb3JjZSBpdCB0byBhbHdheXMgYmUgdHJ1ZVxuXHRcdFx0XHRcdHF1ZXVlOiB0cnVlLFxuXHRcdFx0XHRcdGR1cmF0aW9uOiBkdXJhdGlvbixcblx0XHRcdFx0XHRjb21wbGV0ZTogY2FsbGJhY2sgJiYgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRjYWxsYmFjay5jYWxsKGVsZW0sIHRhcmcsIHNldHRpbmdzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQkZWxlbS5hbmltYXRlKGF0dHIsIG9wdHMpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9O1xuXG5cdC8vIE1heCBzY3JvbGxpbmcgcG9zaXRpb24sIHdvcmtzIG9uIHF1aXJrcyBtb2RlXG5cdC8vIEl0IG9ubHkgZmFpbHMgKG5vdCB0b28gYmFkbHkpIG9uIElFLCBxdWlya3MgbW9kZS5cblx0JHNjcm9sbFRvLm1heCA9IGZ1bmN0aW9uKGVsZW0sIGF4aXMpIHtcblx0XHR2YXIgRGltID0gYXhpcyA9PT0gJ3gnID8gJ1dpZHRoJyA6ICdIZWlnaHQnLFxuXHRcdFx0c2Nyb2xsID0gJ3Njcm9sbCcrRGltO1xuXG5cdFx0aWYgKCFpc1dpbihlbGVtKSlcblx0XHRcdHJldHVybiBlbGVtW3Njcm9sbF0gLSAkKGVsZW0pW0RpbS50b0xvd2VyQ2FzZSgpXSgpO1xuXG5cdFx0dmFyIHNpemUgPSAnY2xpZW50JyArIERpbSxcblx0XHRcdGRvYyA9IGVsZW0ub3duZXJEb2N1bWVudCB8fCBlbGVtLmRvY3VtZW50LFxuXHRcdFx0aHRtbCA9IGRvYy5kb2N1bWVudEVsZW1lbnQsXG5cdFx0XHRib2R5ID0gZG9jLmJvZHk7XG5cblx0XHRyZXR1cm4gTWF0aC5tYXgoaHRtbFtzY3JvbGxdLCBib2R5W3Njcm9sbF0pIC0gTWF0aC5taW4oaHRtbFtzaXplXSwgYm9keVtzaXplXSk7XG5cdH07XG5cblx0ZnVuY3Rpb24gYm90aCh2YWwpIHtcblx0XHRyZXR1cm4gJC5pc0Z1bmN0aW9uKHZhbCkgfHwgJC5pc1BsYWluT2JqZWN0KHZhbCkgPyB2YWwgOiB7IHRvcDp2YWwsIGxlZnQ6dmFsIH07XG5cdH1cblxuXHQvLyBBZGQgc3BlY2lhbCBob29rcyBzbyB0aGF0IHdpbmRvdyBzY3JvbGwgcHJvcGVydGllcyBjYW4gYmUgYW5pbWF0ZWRcblx0JC5Ud2Vlbi5wcm9wSG9va3Muc2Nyb2xsTGVmdCA9IFxuXHQkLlR3ZWVuLnByb3BIb29rcy5zY3JvbGxUb3AgPSB7XG5cdFx0Z2V0OiBmdW5jdGlvbih0KSB7XG5cdFx0XHRyZXR1cm4gJCh0LmVsZW0pW3QucHJvcF0oKTtcblx0XHR9LFxuXHRcdHNldDogZnVuY3Rpb24odCkge1xuXHRcdFx0dmFyIGN1cnIgPSB0aGlzLmdldCh0KTtcblx0XHRcdC8vIElmIGludGVycnVwdCBpcyB0cnVlIGFuZCB1c2VyIHNjcm9sbGVkLCBzdG9wIGFuaW1hdGluZ1xuXHRcdFx0aWYgKHQub3B0aW9ucy5pbnRlcnJ1cHQgJiYgdC5fbGFzdCAmJiB0Ll9sYXN0ICE9PSBjdXJyKSB7XG5cdFx0XHRcdHJldHVybiAkKHQuZWxlbSkuc3RvcCgpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIG5leHQgPSBNYXRoLnJvdW5kKHQubm93KTtcblx0XHRcdC8vIERvbid0IHdhc3RlIENQVVxuXHRcdFx0Ly8gQnJvd3NlcnMgZG9uJ3QgcmVuZGVyIGZsb2F0aW5nIHBvaW50IHNjcm9sbFxuXHRcdFx0aWYgKGN1cnIgIT09IG5leHQpIHtcblx0XHRcdFx0JCh0LmVsZW0pW3QucHJvcF0obmV4dCk7XG5cdFx0XHRcdHQuX2xhc3QgPSB0aGlzLmdldCh0KTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0Ly8gQU1EIHJlcXVpcmVtZW50XG5cdHJldHVybiAkc2Nyb2xsVG87XG59KTtcbiIsIi8qIVxuV2F5cG9pbnRzIC0gNC4wLjFcbkNvcHlyaWdodCDCqSAyMDExLTIwMTYgQ2FsZWIgVHJvdWdodG9uXG5MaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5odHRwczovL2dpdGh1Yi5jb20vaW1ha2V3ZWJ0aGluZ3Mvd2F5cG9pbnRzL2Jsb2IvbWFzdGVyL2xpY2Vuc2VzLnR4dFxuKi9cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnXG5cbiAgdmFyIGtleUNvdW50ZXIgPSAwXG4gIHZhciBhbGxXYXlwb2ludHMgPSB7fVxuXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS93YXlwb2ludCAqL1xuICBmdW5jdGlvbiBXYXlwb2ludChvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIG9wdGlvbnMgcGFzc2VkIHRvIFdheXBvaW50IGNvbnN0cnVjdG9yJylcbiAgICB9XG4gICAgaWYgKCFvcHRpb25zLmVsZW1lbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZWxlbWVudCBvcHRpb24gcGFzc2VkIHRvIFdheXBvaW50IGNvbnN0cnVjdG9yJylcbiAgICB9XG4gICAgaWYgKCFvcHRpb25zLmhhbmRsZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gaGFuZGxlciBvcHRpb24gcGFzc2VkIHRvIFdheXBvaW50IGNvbnN0cnVjdG9yJylcbiAgICB9XG5cbiAgICB0aGlzLmtleSA9ICd3YXlwb2ludC0nICsga2V5Q291bnRlclxuICAgIHRoaXMub3B0aW9ucyA9IFdheXBvaW50LkFkYXB0ZXIuZXh0ZW5kKHt9LCBXYXlwb2ludC5kZWZhdWx0cywgb3B0aW9ucylcbiAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLm9wdGlvbnMuZWxlbWVudFxuICAgIHRoaXMuYWRhcHRlciA9IG5ldyBXYXlwb2ludC5BZGFwdGVyKHRoaXMuZWxlbWVudClcbiAgICB0aGlzLmNhbGxiYWNrID0gb3B0aW9ucy5oYW5kbGVyXG4gICAgdGhpcy5heGlzID0gdGhpcy5vcHRpb25zLmhvcml6b250YWwgPyAnaG9yaXpvbnRhbCcgOiAndmVydGljYWwnXG4gICAgdGhpcy5lbmFibGVkID0gdGhpcy5vcHRpb25zLmVuYWJsZWRcbiAgICB0aGlzLnRyaWdnZXJQb2ludCA9IG51bGxcbiAgICB0aGlzLmdyb3VwID0gV2F5cG9pbnQuR3JvdXAuZmluZE9yQ3JlYXRlKHtcbiAgICAgIG5hbWU6IHRoaXMub3B0aW9ucy5ncm91cCxcbiAgICAgIGF4aXM6IHRoaXMuYXhpc1xuICAgIH0pXG4gICAgdGhpcy5jb250ZXh0ID0gV2F5cG9pbnQuQ29udGV4dC5maW5kT3JDcmVhdGVCeUVsZW1lbnQodGhpcy5vcHRpb25zLmNvbnRleHQpXG5cbiAgICBpZiAoV2F5cG9pbnQub2Zmc2V0QWxpYXNlc1t0aGlzLm9wdGlvbnMub2Zmc2V0XSkge1xuICAgICAgdGhpcy5vcHRpb25zLm9mZnNldCA9IFdheXBvaW50Lm9mZnNldEFsaWFzZXNbdGhpcy5vcHRpb25zLm9mZnNldF1cbiAgICB9XG4gICAgdGhpcy5ncm91cC5hZGQodGhpcylcbiAgICB0aGlzLmNvbnRleHQuYWRkKHRoaXMpXG4gICAgYWxsV2F5cG9pbnRzW3RoaXMua2V5XSA9IHRoaXNcbiAgICBrZXlDb3VudGVyICs9IDFcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLnF1ZXVlVHJpZ2dlciA9IGZ1bmN0aW9uKGRpcmVjdGlvbikge1xuICAgIHRoaXMuZ3JvdXAucXVldWVUcmlnZ2VyKHRoaXMsIGRpcmVjdGlvbilcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgaWYgKCF0aGlzLmVuYWJsZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAodGhpcy5jYWxsYmFjaykge1xuICAgICAgdGhpcy5jYWxsYmFjay5hcHBseSh0aGlzLCBhcmdzKVxuICAgIH1cbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZGVzdHJveSAqL1xuICBXYXlwb2ludC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY29udGV4dC5yZW1vdmUodGhpcylcbiAgICB0aGlzLmdyb3VwLnJlbW92ZSh0aGlzKVxuICAgIGRlbGV0ZSBhbGxXYXlwb2ludHNbdGhpcy5rZXldXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2Rpc2FibGUgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLmRpc2FibGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2VuYWJsZSAqL1xuICBXYXlwb2ludC5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jb250ZXh0LnJlZnJlc2goKVxuICAgIHRoaXMuZW5hYmxlZCA9IHRydWVcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9uZXh0ICovXG4gIFdheXBvaW50LnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ3JvdXAubmV4dCh0aGlzKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9wcmV2aW91cyAqL1xuICBXYXlwb2ludC5wcm90b3R5cGUucHJldmlvdXMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5ncm91cC5wcmV2aW91cyh0aGlzKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBXYXlwb2ludC5pbnZva2VBbGwgPSBmdW5jdGlvbihtZXRob2QpIHtcbiAgICB2YXIgYWxsV2F5cG9pbnRzQXJyYXkgPSBbXVxuICAgIGZvciAodmFyIHdheXBvaW50S2V5IGluIGFsbFdheXBvaW50cykge1xuICAgICAgYWxsV2F5cG9pbnRzQXJyYXkucHVzaChhbGxXYXlwb2ludHNbd2F5cG9pbnRLZXldKVxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gYWxsV2F5cG9pbnRzQXJyYXkubGVuZ3RoOyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIGFsbFdheXBvaW50c0FycmF5W2ldW21ldGhvZF0oKVxuICAgIH1cbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZGVzdHJveS1hbGwgKi9cbiAgV2F5cG9pbnQuZGVzdHJveUFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIFdheXBvaW50Lmludm9rZUFsbCgnZGVzdHJveScpXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2Rpc2FibGUtYWxsICovXG4gIFdheXBvaW50LmRpc2FibGVBbGwgPSBmdW5jdGlvbigpIHtcbiAgICBXYXlwb2ludC5pbnZva2VBbGwoJ2Rpc2FibGUnKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9lbmFibGUtYWxsICovXG4gIFdheXBvaW50LmVuYWJsZUFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIFdheXBvaW50LkNvbnRleHQucmVmcmVzaEFsbCgpXG4gICAgZm9yICh2YXIgd2F5cG9pbnRLZXkgaW4gYWxsV2F5cG9pbnRzKSB7XG4gICAgICBhbGxXYXlwb2ludHNbd2F5cG9pbnRLZXldLmVuYWJsZWQgPSB0cnVlXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL3JlZnJlc2gtYWxsICovXG4gIFdheXBvaW50LnJlZnJlc2hBbGwgPSBmdW5jdGlvbigpIHtcbiAgICBXYXlwb2ludC5Db250ZXh0LnJlZnJlc2hBbGwoKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS92aWV3cG9ydC1oZWlnaHQgKi9cbiAgV2F5cG9pbnQudmlld3BvcnRIZWlnaHQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gd2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHRcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvdmlld3BvcnQtd2lkdGggKi9cbiAgV2F5cG9pbnQudmlld3BvcnRXaWR0aCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGhcbiAgfVxuXG4gIFdheXBvaW50LmFkYXB0ZXJzID0gW11cblxuICBXYXlwb2ludC5kZWZhdWx0cyA9IHtcbiAgICBjb250ZXh0OiB3aW5kb3csXG4gICAgY29udGludW91czogdHJ1ZSxcbiAgICBlbmFibGVkOiB0cnVlLFxuICAgIGdyb3VwOiAnZGVmYXVsdCcsXG4gICAgaG9yaXpvbnRhbDogZmFsc2UsXG4gICAgb2Zmc2V0OiAwXG4gIH1cblxuICBXYXlwb2ludC5vZmZzZXRBbGlhc2VzID0ge1xuICAgICdib3R0b20taW4tdmlldyc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5pbm5lckhlaWdodCgpIC0gdGhpcy5hZGFwdGVyLm91dGVySGVpZ2h0KClcbiAgICB9LFxuICAgICdyaWdodC1pbi12aWV3JzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0LmlubmVyV2lkdGgoKSAtIHRoaXMuYWRhcHRlci5vdXRlcldpZHRoKClcbiAgICB9XG4gIH1cblxuICB3aW5kb3cuV2F5cG9pbnQgPSBXYXlwb2ludFxufSgpKVxuOyhmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnXG5cbiAgZnVuY3Rpb24gcmVxdWVzdEFuaW1hdGlvbkZyYW1lU2hpbShjYWxsYmFjaykge1xuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApXG4gIH1cblxuICB2YXIga2V5Q291bnRlciA9IDBcbiAgdmFyIGNvbnRleHRzID0ge31cbiAgdmFyIFdheXBvaW50ID0gd2luZG93LldheXBvaW50XG4gIHZhciBvbGRXaW5kb3dMb2FkID0gd2luZG93Lm9ubG9hZFxuXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9jb250ZXh0ICovXG4gIGZ1bmN0aW9uIENvbnRleHQoZWxlbWVudCkge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnRcbiAgICB0aGlzLkFkYXB0ZXIgPSBXYXlwb2ludC5BZGFwdGVyXG4gICAgdGhpcy5hZGFwdGVyID0gbmV3IHRoaXMuQWRhcHRlcihlbGVtZW50KVxuICAgIHRoaXMua2V5ID0gJ3dheXBvaW50LWNvbnRleHQtJyArIGtleUNvdW50ZXJcbiAgICB0aGlzLmRpZFNjcm9sbCA9IGZhbHNlXG4gICAgdGhpcy5kaWRSZXNpemUgPSBmYWxzZVxuICAgIHRoaXMub2xkU2Nyb2xsID0ge1xuICAgICAgeDogdGhpcy5hZGFwdGVyLnNjcm9sbExlZnQoKSxcbiAgICAgIHk6IHRoaXMuYWRhcHRlci5zY3JvbGxUb3AoKVxuICAgIH1cbiAgICB0aGlzLndheXBvaW50cyA9IHtcbiAgICAgIHZlcnRpY2FsOiB7fSxcbiAgICAgIGhvcml6b250YWw6IHt9XG4gICAgfVxuXG4gICAgZWxlbWVudC53YXlwb2ludENvbnRleHRLZXkgPSB0aGlzLmtleVxuICAgIGNvbnRleHRzW2VsZW1lbnQud2F5cG9pbnRDb250ZXh0S2V5XSA9IHRoaXNcbiAgICBrZXlDb3VudGVyICs9IDFcbiAgICBpZiAoIVdheXBvaW50LndpbmRvd0NvbnRleHQpIHtcbiAgICAgIFdheXBvaW50LndpbmRvd0NvbnRleHQgPSB0cnVlXG4gICAgICBXYXlwb2ludC53aW5kb3dDb250ZXh0ID0gbmV3IENvbnRleHQod2luZG93KVxuICAgIH1cblxuICAgIHRoaXMuY3JlYXRlVGhyb3R0bGVkU2Nyb2xsSGFuZGxlcigpXG4gICAgdGhpcy5jcmVhdGVUaHJvdHRsZWRSZXNpemVIYW5kbGVyKClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24od2F5cG9pbnQpIHtcbiAgICB2YXIgYXhpcyA9IHdheXBvaW50Lm9wdGlvbnMuaG9yaXpvbnRhbCA/ICdob3Jpem9udGFsJyA6ICd2ZXJ0aWNhbCdcbiAgICB0aGlzLndheXBvaW50c1theGlzXVt3YXlwb2ludC5rZXldID0gd2F5cG9pbnRcbiAgICB0aGlzLnJlZnJlc2goKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5jaGVja0VtcHR5ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGhvcml6b250YWxFbXB0eSA9IHRoaXMuQWRhcHRlci5pc0VtcHR5T2JqZWN0KHRoaXMud2F5cG9pbnRzLmhvcml6b250YWwpXG4gICAgdmFyIHZlcnRpY2FsRW1wdHkgPSB0aGlzLkFkYXB0ZXIuaXNFbXB0eU9iamVjdCh0aGlzLndheXBvaW50cy52ZXJ0aWNhbClcbiAgICB2YXIgaXNXaW5kb3cgPSB0aGlzLmVsZW1lbnQgPT0gdGhpcy5lbGVtZW50LndpbmRvd1xuICAgIGlmIChob3Jpem9udGFsRW1wdHkgJiYgdmVydGljYWxFbXB0eSAmJiAhaXNXaW5kb3cpIHtcbiAgICAgIHRoaXMuYWRhcHRlci5vZmYoJy53YXlwb2ludHMnKVxuICAgICAgZGVsZXRlIGNvbnRleHRzW3RoaXMua2V5XVxuICAgIH1cbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuY3JlYXRlVGhyb3R0bGVkUmVzaXplSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpc1xuXG4gICAgZnVuY3Rpb24gcmVzaXplSGFuZGxlcigpIHtcbiAgICAgIHNlbGYuaGFuZGxlUmVzaXplKClcbiAgICAgIHNlbGYuZGlkUmVzaXplID0gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLmFkYXB0ZXIub24oJ3Jlc2l6ZS53YXlwb2ludHMnLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghc2VsZi5kaWRSZXNpemUpIHtcbiAgICAgICAgc2VsZi5kaWRSZXNpemUgPSB0cnVlXG4gICAgICAgIFdheXBvaW50LnJlcXVlc3RBbmltYXRpb25GcmFtZShyZXNpemVIYW5kbGVyKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmNyZWF0ZVRocm90dGxlZFNjcm9sbEhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICBmdW5jdGlvbiBzY3JvbGxIYW5kbGVyKCkge1xuICAgICAgc2VsZi5oYW5kbGVTY3JvbGwoKVxuICAgICAgc2VsZi5kaWRTY3JvbGwgPSBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMuYWRhcHRlci5vbignc2Nyb2xsLndheXBvaW50cycsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFzZWxmLmRpZFNjcm9sbCB8fCBXYXlwb2ludC5pc1RvdWNoKSB7XG4gICAgICAgIHNlbGYuZGlkU2Nyb2xsID0gdHJ1ZVxuICAgICAgICBXYXlwb2ludC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2Nyb2xsSGFuZGxlcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5oYW5kbGVSZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgICBXYXlwb2ludC5Db250ZXh0LnJlZnJlc2hBbGwoKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5oYW5kbGVTY3JvbGwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdHJpZ2dlcmVkR3JvdXBzID0ge31cbiAgICB2YXIgYXhlcyA9IHtcbiAgICAgIGhvcml6b250YWw6IHtcbiAgICAgICAgbmV3U2Nyb2xsOiB0aGlzLmFkYXB0ZXIuc2Nyb2xsTGVmdCgpLFxuICAgICAgICBvbGRTY3JvbGw6IHRoaXMub2xkU2Nyb2xsLngsXG4gICAgICAgIGZvcndhcmQ6ICdyaWdodCcsXG4gICAgICAgIGJhY2t3YXJkOiAnbGVmdCdcbiAgICAgIH0sXG4gICAgICB2ZXJ0aWNhbDoge1xuICAgICAgICBuZXdTY3JvbGw6IHRoaXMuYWRhcHRlci5zY3JvbGxUb3AoKSxcbiAgICAgICAgb2xkU2Nyb2xsOiB0aGlzLm9sZFNjcm9sbC55LFxuICAgICAgICBmb3J3YXJkOiAnZG93bicsXG4gICAgICAgIGJhY2t3YXJkOiAndXAnXG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgYXhpc0tleSBpbiBheGVzKSB7XG4gICAgICB2YXIgYXhpcyA9IGF4ZXNbYXhpc0tleV1cbiAgICAgIHZhciBpc0ZvcndhcmQgPSBheGlzLm5ld1Njcm9sbCA+IGF4aXMub2xkU2Nyb2xsXG4gICAgICB2YXIgZGlyZWN0aW9uID0gaXNGb3J3YXJkID8gYXhpcy5mb3J3YXJkIDogYXhpcy5iYWNrd2FyZFxuXG4gICAgICBmb3IgKHZhciB3YXlwb2ludEtleSBpbiB0aGlzLndheXBvaW50c1theGlzS2V5XSkge1xuICAgICAgICB2YXIgd2F5cG9pbnQgPSB0aGlzLndheXBvaW50c1theGlzS2V5XVt3YXlwb2ludEtleV1cbiAgICAgICAgaWYgKHdheXBvaW50LnRyaWdnZXJQb2ludCA9PT0gbnVsbCkge1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cbiAgICAgICAgdmFyIHdhc0JlZm9yZVRyaWdnZXJQb2ludCA9IGF4aXMub2xkU2Nyb2xsIDwgd2F5cG9pbnQudHJpZ2dlclBvaW50XG4gICAgICAgIHZhciBub3dBZnRlclRyaWdnZXJQb2ludCA9IGF4aXMubmV3U2Nyb2xsID49IHdheXBvaW50LnRyaWdnZXJQb2ludFxuICAgICAgICB2YXIgY3Jvc3NlZEZvcndhcmQgPSB3YXNCZWZvcmVUcmlnZ2VyUG9pbnQgJiYgbm93QWZ0ZXJUcmlnZ2VyUG9pbnRcbiAgICAgICAgdmFyIGNyb3NzZWRCYWNrd2FyZCA9ICF3YXNCZWZvcmVUcmlnZ2VyUG9pbnQgJiYgIW5vd0FmdGVyVHJpZ2dlclBvaW50XG4gICAgICAgIGlmIChjcm9zc2VkRm9yd2FyZCB8fCBjcm9zc2VkQmFja3dhcmQpIHtcbiAgICAgICAgICB3YXlwb2ludC5xdWV1ZVRyaWdnZXIoZGlyZWN0aW9uKVxuICAgICAgICAgIHRyaWdnZXJlZEdyb3Vwc1t3YXlwb2ludC5ncm91cC5pZF0gPSB3YXlwb2ludC5ncm91cFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgZ3JvdXBLZXkgaW4gdHJpZ2dlcmVkR3JvdXBzKSB7XG4gICAgICB0cmlnZ2VyZWRHcm91cHNbZ3JvdXBLZXldLmZsdXNoVHJpZ2dlcnMoKVxuICAgIH1cblxuICAgIHRoaXMub2xkU2Nyb2xsID0ge1xuICAgICAgeDogYXhlcy5ob3Jpem9udGFsLm5ld1Njcm9sbCxcbiAgICAgIHk6IGF4ZXMudmVydGljYWwubmV3U2Nyb2xsXG4gICAgfVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5pbm5lckhlaWdodCA9IGZ1bmN0aW9uKCkge1xuICAgIC8qZXNsaW50LWRpc2FibGUgZXFlcWVxICovXG4gICAgaWYgKHRoaXMuZWxlbWVudCA9PSB0aGlzLmVsZW1lbnQud2luZG93KSB7XG4gICAgICByZXR1cm4gV2F5cG9pbnQudmlld3BvcnRIZWlnaHQoKVxuICAgIH1cbiAgICAvKmVzbGludC1lbmFibGUgZXFlcWVxICovXG4gICAgcmV0dXJuIHRoaXMuYWRhcHRlci5pbm5lckhlaWdodCgpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKHdheXBvaW50KSB7XG4gICAgZGVsZXRlIHRoaXMud2F5cG9pbnRzW3dheXBvaW50LmF4aXNdW3dheXBvaW50LmtleV1cbiAgICB0aGlzLmNoZWNrRW1wdHkoKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5pbm5lcldpZHRoID0gZnVuY3Rpb24oKSB7XG4gICAgLyplc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cbiAgICBpZiAodGhpcy5lbGVtZW50ID09IHRoaXMuZWxlbWVudC53aW5kb3cpIHtcbiAgICAgIHJldHVybiBXYXlwb2ludC52aWV3cG9ydFdpZHRoKClcbiAgICB9XG4gICAgLyplc2xpbnQtZW5hYmxlIGVxZXFlcSAqL1xuICAgIHJldHVybiB0aGlzLmFkYXB0ZXIuaW5uZXJXaWR0aCgpXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2NvbnRleHQtZGVzdHJveSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFsbFdheXBvaW50cyA9IFtdXG4gICAgZm9yICh2YXIgYXhpcyBpbiB0aGlzLndheXBvaW50cykge1xuICAgICAgZm9yICh2YXIgd2F5cG9pbnRLZXkgaW4gdGhpcy53YXlwb2ludHNbYXhpc10pIHtcbiAgICAgICAgYWxsV2F5cG9pbnRzLnB1c2godGhpcy53YXlwb2ludHNbYXhpc11bd2F5cG9pbnRLZXldKVxuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gYWxsV2F5cG9pbnRzLmxlbmd0aDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICBhbGxXYXlwb2ludHNbaV0uZGVzdHJveSgpXG4gICAgfVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9jb250ZXh0LXJlZnJlc2ggKi9cbiAgQ29udGV4dC5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIC8qZXNsaW50LWRpc2FibGUgZXFlcWVxICovXG4gICAgdmFyIGlzV2luZG93ID0gdGhpcy5lbGVtZW50ID09IHRoaXMuZWxlbWVudC53aW5kb3dcbiAgICAvKmVzbGludC1lbmFibGUgZXFlcWVxICovXG4gICAgdmFyIGNvbnRleHRPZmZzZXQgPSBpc1dpbmRvdyA/IHVuZGVmaW5lZCA6IHRoaXMuYWRhcHRlci5vZmZzZXQoKVxuICAgIHZhciB0cmlnZ2VyZWRHcm91cHMgPSB7fVxuICAgIHZhciBheGVzXG5cbiAgICB0aGlzLmhhbmRsZVNjcm9sbCgpXG4gICAgYXhlcyA9IHtcbiAgICAgIGhvcml6b250YWw6IHtcbiAgICAgICAgY29udGV4dE9mZnNldDogaXNXaW5kb3cgPyAwIDogY29udGV4dE9mZnNldC5sZWZ0LFxuICAgICAgICBjb250ZXh0U2Nyb2xsOiBpc1dpbmRvdyA/IDAgOiB0aGlzLm9sZFNjcm9sbC54LFxuICAgICAgICBjb250ZXh0RGltZW5zaW9uOiB0aGlzLmlubmVyV2lkdGgoKSxcbiAgICAgICAgb2xkU2Nyb2xsOiB0aGlzLm9sZFNjcm9sbC54LFxuICAgICAgICBmb3J3YXJkOiAncmlnaHQnLFxuICAgICAgICBiYWNrd2FyZDogJ2xlZnQnLFxuICAgICAgICBvZmZzZXRQcm9wOiAnbGVmdCdcbiAgICAgIH0sXG4gICAgICB2ZXJ0aWNhbDoge1xuICAgICAgICBjb250ZXh0T2Zmc2V0OiBpc1dpbmRvdyA/IDAgOiBjb250ZXh0T2Zmc2V0LnRvcCxcbiAgICAgICAgY29udGV4dFNjcm9sbDogaXNXaW5kb3cgPyAwIDogdGhpcy5vbGRTY3JvbGwueSxcbiAgICAgICAgY29udGV4dERpbWVuc2lvbjogdGhpcy5pbm5lckhlaWdodCgpLFxuICAgICAgICBvbGRTY3JvbGw6IHRoaXMub2xkU2Nyb2xsLnksXG4gICAgICAgIGZvcndhcmQ6ICdkb3duJyxcbiAgICAgICAgYmFja3dhcmQ6ICd1cCcsXG4gICAgICAgIG9mZnNldFByb3A6ICd0b3AnXG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgYXhpc0tleSBpbiBheGVzKSB7XG4gICAgICB2YXIgYXhpcyA9IGF4ZXNbYXhpc0tleV1cbiAgICAgIGZvciAodmFyIHdheXBvaW50S2V5IGluIHRoaXMud2F5cG9pbnRzW2F4aXNLZXldKSB7XG4gICAgICAgIHZhciB3YXlwb2ludCA9IHRoaXMud2F5cG9pbnRzW2F4aXNLZXldW3dheXBvaW50S2V5XVxuICAgICAgICB2YXIgYWRqdXN0bWVudCA9IHdheXBvaW50Lm9wdGlvbnMub2Zmc2V0XG4gICAgICAgIHZhciBvbGRUcmlnZ2VyUG9pbnQgPSB3YXlwb2ludC50cmlnZ2VyUG9pbnRcbiAgICAgICAgdmFyIGVsZW1lbnRPZmZzZXQgPSAwXG4gICAgICAgIHZhciBmcmVzaFdheXBvaW50ID0gb2xkVHJpZ2dlclBvaW50ID09IG51bGxcbiAgICAgICAgdmFyIGNvbnRleHRNb2RpZmllciwgd2FzQmVmb3JlU2Nyb2xsLCBub3dBZnRlclNjcm9sbFxuICAgICAgICB2YXIgdHJpZ2dlcmVkQmFja3dhcmQsIHRyaWdnZXJlZEZvcndhcmRcblxuICAgICAgICBpZiAod2F5cG9pbnQuZWxlbWVudCAhPT0gd2F5cG9pbnQuZWxlbWVudC53aW5kb3cpIHtcbiAgICAgICAgICBlbGVtZW50T2Zmc2V0ID0gd2F5cG9pbnQuYWRhcHRlci5vZmZzZXQoKVtheGlzLm9mZnNldFByb3BdXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGFkanVzdG1lbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBhZGp1c3RtZW50ID0gYWRqdXN0bWVudC5hcHBseSh3YXlwb2ludClcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgYWRqdXN0bWVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBhZGp1c3RtZW50ID0gcGFyc2VGbG9hdChhZGp1c3RtZW50KVxuICAgICAgICAgIGlmICh3YXlwb2ludC5vcHRpb25zLm9mZnNldC5pbmRleE9mKCclJykgPiAtIDEpIHtcbiAgICAgICAgICAgIGFkanVzdG1lbnQgPSBNYXRoLmNlaWwoYXhpcy5jb250ZXh0RGltZW5zaW9uICogYWRqdXN0bWVudCAvIDEwMClcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZXh0TW9kaWZpZXIgPSBheGlzLmNvbnRleHRTY3JvbGwgLSBheGlzLmNvbnRleHRPZmZzZXRcbiAgICAgICAgd2F5cG9pbnQudHJpZ2dlclBvaW50ID0gTWF0aC5mbG9vcihlbGVtZW50T2Zmc2V0ICsgY29udGV4dE1vZGlmaWVyIC0gYWRqdXN0bWVudClcbiAgICAgICAgd2FzQmVmb3JlU2Nyb2xsID0gb2xkVHJpZ2dlclBvaW50IDwgYXhpcy5vbGRTY3JvbGxcbiAgICAgICAgbm93QWZ0ZXJTY3JvbGwgPSB3YXlwb2ludC50cmlnZ2VyUG9pbnQgPj0gYXhpcy5vbGRTY3JvbGxcbiAgICAgICAgdHJpZ2dlcmVkQmFja3dhcmQgPSB3YXNCZWZvcmVTY3JvbGwgJiYgbm93QWZ0ZXJTY3JvbGxcbiAgICAgICAgdHJpZ2dlcmVkRm9yd2FyZCA9ICF3YXNCZWZvcmVTY3JvbGwgJiYgIW5vd0FmdGVyU2Nyb2xsXG5cbiAgICAgICAgaWYgKCFmcmVzaFdheXBvaW50ICYmIHRyaWdnZXJlZEJhY2t3YXJkKSB7XG4gICAgICAgICAgd2F5cG9pbnQucXVldWVUcmlnZ2VyKGF4aXMuYmFja3dhcmQpXG4gICAgICAgICAgdHJpZ2dlcmVkR3JvdXBzW3dheXBvaW50Lmdyb3VwLmlkXSA9IHdheXBvaW50Lmdyb3VwXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIWZyZXNoV2F5cG9pbnQgJiYgdHJpZ2dlcmVkRm9yd2FyZCkge1xuICAgICAgICAgIHdheXBvaW50LnF1ZXVlVHJpZ2dlcihheGlzLmZvcndhcmQpXG4gICAgICAgICAgdHJpZ2dlcmVkR3JvdXBzW3dheXBvaW50Lmdyb3VwLmlkXSA9IHdheXBvaW50Lmdyb3VwXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZnJlc2hXYXlwb2ludCAmJiBheGlzLm9sZFNjcm9sbCA+PSB3YXlwb2ludC50cmlnZ2VyUG9pbnQpIHtcbiAgICAgICAgICB3YXlwb2ludC5xdWV1ZVRyaWdnZXIoYXhpcy5mb3J3YXJkKVxuICAgICAgICAgIHRyaWdnZXJlZEdyb3Vwc1t3YXlwb2ludC5ncm91cC5pZF0gPSB3YXlwb2ludC5ncm91cFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgV2F5cG9pbnQucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgZ3JvdXBLZXkgaW4gdHJpZ2dlcmVkR3JvdXBzKSB7XG4gICAgICAgIHRyaWdnZXJlZEdyb3Vwc1tncm91cEtleV0uZmx1c2hUcmlnZ2VycygpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQuZmluZE9yQ3JlYXRlQnlFbGVtZW50ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHJldHVybiBDb250ZXh0LmZpbmRCeUVsZW1lbnQoZWxlbWVudCkgfHwgbmV3IENvbnRleHQoZWxlbWVudClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5yZWZyZXNoQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgY29udGV4dElkIGluIGNvbnRleHRzKSB7XG4gICAgICBjb250ZXh0c1tjb250ZXh0SWRdLnJlZnJlc2goKVxuICAgIH1cbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvY29udGV4dC1maW5kLWJ5LWVsZW1lbnQgKi9cbiAgQ29udGV4dC5maW5kQnlFbGVtZW50ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHJldHVybiBjb250ZXh0c1tlbGVtZW50LndheXBvaW50Q29udGV4dEtleV1cbiAgfVxuXG4gIHdpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAob2xkV2luZG93TG9hZCkge1xuICAgICAgb2xkV2luZG93TG9hZCgpXG4gICAgfVxuICAgIENvbnRleHQucmVmcmVzaEFsbCgpXG4gIH1cblxuXG4gIFdheXBvaW50LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIHJlcXVlc3RGbiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZVNoaW1cbiAgICByZXF1ZXN0Rm4uY2FsbCh3aW5kb3csIGNhbGxiYWNrKVxuICB9XG4gIFdheXBvaW50LkNvbnRleHQgPSBDb250ZXh0XG59KCkpXG47KGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCdcblxuICBmdW5jdGlvbiBieVRyaWdnZXJQb2ludChhLCBiKSB7XG4gICAgcmV0dXJuIGEudHJpZ2dlclBvaW50IC0gYi50cmlnZ2VyUG9pbnRcbiAgfVxuXG4gIGZ1bmN0aW9uIGJ5UmV2ZXJzZVRyaWdnZXJQb2ludChhLCBiKSB7XG4gICAgcmV0dXJuIGIudHJpZ2dlclBvaW50IC0gYS50cmlnZ2VyUG9pbnRcbiAgfVxuXG4gIHZhciBncm91cHMgPSB7XG4gICAgdmVydGljYWw6IHt9LFxuICAgIGhvcml6b250YWw6IHt9XG4gIH1cbiAgdmFyIFdheXBvaW50ID0gd2luZG93LldheXBvaW50XG5cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2dyb3VwICovXG4gIGZ1bmN0aW9uIEdyb3VwKG9wdGlvbnMpIHtcbiAgICB0aGlzLm5hbWUgPSBvcHRpb25zLm5hbWVcbiAgICB0aGlzLmF4aXMgPSBvcHRpb25zLmF4aXNcbiAgICB0aGlzLmlkID0gdGhpcy5uYW1lICsgJy0nICsgdGhpcy5heGlzXG4gICAgdGhpcy53YXlwb2ludHMgPSBbXVxuICAgIHRoaXMuY2xlYXJUcmlnZ2VyUXVldWVzKClcbiAgICBncm91cHNbdGhpcy5heGlzXVt0aGlzLm5hbWVdID0gdGhpc1xuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24od2F5cG9pbnQpIHtcbiAgICB0aGlzLndheXBvaW50cy5wdXNoKHdheXBvaW50KVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUuY2xlYXJUcmlnZ2VyUXVldWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50cmlnZ2VyUXVldWVzID0ge1xuICAgICAgdXA6IFtdLFxuICAgICAgZG93bjogW10sXG4gICAgICBsZWZ0OiBbXSxcbiAgICAgIHJpZ2h0OiBbXVxuICAgIH1cbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLmZsdXNoVHJpZ2dlcnMgPSBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBkaXJlY3Rpb24gaW4gdGhpcy50cmlnZ2VyUXVldWVzKSB7XG4gICAgICB2YXIgd2F5cG9pbnRzID0gdGhpcy50cmlnZ2VyUXVldWVzW2RpcmVjdGlvbl1cbiAgICAgIHZhciByZXZlcnNlID0gZGlyZWN0aW9uID09PSAndXAnIHx8IGRpcmVjdGlvbiA9PT0gJ2xlZnQnXG4gICAgICB3YXlwb2ludHMuc29ydChyZXZlcnNlID8gYnlSZXZlcnNlVHJpZ2dlclBvaW50IDogYnlUcmlnZ2VyUG9pbnQpXG4gICAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gd2F5cG9pbnRzLmxlbmd0aDsgaSA8IGVuZDsgaSArPSAxKSB7XG4gICAgICAgIHZhciB3YXlwb2ludCA9IHdheXBvaW50c1tpXVxuICAgICAgICBpZiAod2F5cG9pbnQub3B0aW9ucy5jb250aW51b3VzIHx8IGkgPT09IHdheXBvaW50cy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgd2F5cG9pbnQudHJpZ2dlcihbZGlyZWN0aW9uXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNsZWFyVHJpZ2dlclF1ZXVlcygpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24od2F5cG9pbnQpIHtcbiAgICB0aGlzLndheXBvaW50cy5zb3J0KGJ5VHJpZ2dlclBvaW50KVxuICAgIHZhciBpbmRleCA9IFdheXBvaW50LkFkYXB0ZXIuaW5BcnJheSh3YXlwb2ludCwgdGhpcy53YXlwb2ludHMpXG4gICAgdmFyIGlzTGFzdCA9IGluZGV4ID09PSB0aGlzLndheXBvaW50cy5sZW5ndGggLSAxXG4gICAgcmV0dXJuIGlzTGFzdCA/IG51bGwgOiB0aGlzLndheXBvaW50c1tpbmRleCArIDFdXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5wcmV2aW91cyA9IGZ1bmN0aW9uKHdheXBvaW50KSB7XG4gICAgdGhpcy53YXlwb2ludHMuc29ydChieVRyaWdnZXJQb2ludClcbiAgICB2YXIgaW5kZXggPSBXYXlwb2ludC5BZGFwdGVyLmluQXJyYXkod2F5cG9pbnQsIHRoaXMud2F5cG9pbnRzKVxuICAgIHJldHVybiBpbmRleCA/IHRoaXMud2F5cG9pbnRzW2luZGV4IC0gMV0gOiBudWxsXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5xdWV1ZVRyaWdnZXIgPSBmdW5jdGlvbih3YXlwb2ludCwgZGlyZWN0aW9uKSB7XG4gICAgdGhpcy50cmlnZ2VyUXVldWVzW2RpcmVjdGlvbl0ucHVzaCh3YXlwb2ludClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKHdheXBvaW50KSB7XG4gICAgdmFyIGluZGV4ID0gV2F5cG9pbnQuQWRhcHRlci5pbkFycmF5KHdheXBvaW50LCB0aGlzLndheXBvaW50cylcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgdGhpcy53YXlwb2ludHMuc3BsaWNlKGluZGV4LCAxKVxuICAgIH1cbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZmlyc3QgKi9cbiAgR3JvdXAucHJvdG90eXBlLmZpcnN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMud2F5cG9pbnRzWzBdXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2xhc3QgKi9cbiAgR3JvdXAucHJvdG90eXBlLmxhc3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy53YXlwb2ludHNbdGhpcy53YXlwb2ludHMubGVuZ3RoIC0gMV1cbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAuZmluZE9yQ3JlYXRlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHJldHVybiBncm91cHNbb3B0aW9ucy5heGlzXVtvcHRpb25zLm5hbWVdIHx8IG5ldyBHcm91cChvcHRpb25zKVxuICB9XG5cbiAgV2F5cG9pbnQuR3JvdXAgPSBHcm91cFxufSgpKVxuOyhmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnXG5cbiAgdmFyICQgPSB3aW5kb3cualF1ZXJ5XG4gIHZhciBXYXlwb2ludCA9IHdpbmRvdy5XYXlwb2ludFxuXG4gIGZ1bmN0aW9uIEpRdWVyeUFkYXB0ZXIoZWxlbWVudCkge1xuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpXG4gIH1cblxuICAkLmVhY2goW1xuICAgICdpbm5lckhlaWdodCcsXG4gICAgJ2lubmVyV2lkdGgnLFxuICAgICdvZmYnLFxuICAgICdvZmZzZXQnLFxuICAgICdvbicsXG4gICAgJ291dGVySGVpZ2h0JyxcbiAgICAnb3V0ZXJXaWR0aCcsXG4gICAgJ3Njcm9sbExlZnQnLFxuICAgICdzY3JvbGxUb3AnXG4gIF0sIGZ1bmN0aW9uKGksIG1ldGhvZCkge1xuICAgIEpRdWVyeUFkYXB0ZXIucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgICAgcmV0dXJuIHRoaXMuJGVsZW1lbnRbbWV0aG9kXS5hcHBseSh0aGlzLiRlbGVtZW50LCBhcmdzKVxuICAgIH1cbiAgfSlcblxuICAkLmVhY2goW1xuICAgICdleHRlbmQnLFxuICAgICdpbkFycmF5JyxcbiAgICAnaXNFbXB0eU9iamVjdCdcbiAgXSwgZnVuY3Rpb24oaSwgbWV0aG9kKSB7XG4gICAgSlF1ZXJ5QWRhcHRlclttZXRob2RdID0gJFttZXRob2RdXG4gIH0pXG5cbiAgV2F5cG9pbnQuYWRhcHRlcnMucHVzaCh7XG4gICAgbmFtZTogJ2pxdWVyeScsXG4gICAgQWRhcHRlcjogSlF1ZXJ5QWRhcHRlclxuICB9KVxuICBXYXlwb2ludC5BZGFwdGVyID0gSlF1ZXJ5QWRhcHRlclxufSgpKVxuOyhmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnXG5cbiAgdmFyIFdheXBvaW50ID0gd2luZG93LldheXBvaW50XG5cbiAgZnVuY3Rpb24gY3JlYXRlRXh0ZW5zaW9uKGZyYW1ld29yaykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB3YXlwb2ludHMgPSBbXVxuICAgICAgdmFyIG92ZXJyaWRlcyA9IGFyZ3VtZW50c1swXVxuXG4gICAgICBpZiAoZnJhbWV3b3JrLmlzRnVuY3Rpb24oYXJndW1lbnRzWzBdKSkge1xuICAgICAgICBvdmVycmlkZXMgPSBmcmFtZXdvcmsuZXh0ZW5kKHt9LCBhcmd1bWVudHNbMV0pXG4gICAgICAgIG92ZXJyaWRlcy5oYW5kbGVyID0gYXJndW1lbnRzWzBdXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBmcmFtZXdvcmsuZXh0ZW5kKHt9LCBvdmVycmlkZXMsIHtcbiAgICAgICAgICBlbGVtZW50OiB0aGlzXG4gICAgICAgIH0pXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5jb250ZXh0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIG9wdGlvbnMuY29udGV4dCA9IGZyYW1ld29yayh0aGlzKS5jbG9zZXN0KG9wdGlvbnMuY29udGV4dClbMF1cbiAgICAgICAgfVxuICAgICAgICB3YXlwb2ludHMucHVzaChuZXcgV2F5cG9pbnQob3B0aW9ucykpXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gd2F5cG9pbnRzXG4gICAgfVxuICB9XG5cbiAgaWYgKHdpbmRvdy5qUXVlcnkpIHtcbiAgICB3aW5kb3cualF1ZXJ5LmZuLndheXBvaW50ID0gY3JlYXRlRXh0ZW5zaW9uKHdpbmRvdy5qUXVlcnkpXG4gIH1cbiAgaWYgKHdpbmRvdy5aZXB0bykge1xuICAgIHdpbmRvdy5aZXB0by5mbi53YXlwb2ludCA9IGNyZWF0ZUV4dGVuc2lvbih3aW5kb3cuWmVwdG8pXG4gIH1cbn0oKSlcbjsiLCIkKGZ1bmN0aW9uICgpIHtcblxuXHRUd2Vlbk1heC5mcm9tKFwiLm1lbnUtYnV0dG9uXCIsIDEgLHtzY2FsZTpcIjJcIiwgeW95bzogdHJ1ZSwgcmVwZWF0OiA0LCBvdmVyd3JpdGU6XCJub25lXCJ9KTtcblxuXHQvL1dvbWVuIFdobyBDb2RlIGxvZ29cblx0VHdlZW5NYXguZnJvbShcIi5oZXJvX193d2Nsb2dvXCIsIDEuNSx7c2NhbGU6XCIzXCIsIG9wYWNpdHk6XCIwXCIsIG92ZXJ3cml0ZTpcIm5vbmVcIn0pO1xuXG5cdC8vTmF2YmFyXG5cdCQoXCIubWVudS1idXR0b25cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG5cdFx0JChcIm5hdlwiKS50b2dnbGVDbGFzcyhcIm9wZW5cIik7XG5cdH0pO1xuXG5cdC8vU2Nyb2xsVG8gXG5cdCQoXCIuaG9tZVwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcblx0XHQkLnNjcm9sbFRvKCQoXCJoZWFkZXJcIiksIDQwMCk7XG5cdH0pO1xuXG5cdCQoXCIuc2Nyb2xsLXRvLWluZm93aW5kb3dzXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuXHRcdCQuc2Nyb2xsVG8oJChcIi5pbmZvd2luZG93c1wiKSwgNDAwKTtcblx0fSk7XG5cblx0JChcIi5zY3JvbGwtdG8tbWVtYmVyXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuXHRcdCQuc2Nyb2xsVG8oJChcIi5kYXRhXCIpLCA0MDApO1xuXHR9KTtcblxuXHQvL1BhcmFsbGF4XG5cdCQoXCIucGFyYWxsYXhfX3dvbWFudHlwaW5nXCIpLnBhcmFsbGF4KFxuXHRcdHtpbWFnZVNyYzogXCJhc3NldHMvaW1nL3dvbWFuLXR5cGluZy5qcGdcIn0pO1xuXHQkKFwiLnBhcmFsbGF4X19oYWNrYXRob25cIikucGFyYWxsYXgoXG5cdFx0e2ltYWdlU3JjOiBcImFzc2V0cy9pbWcvaGFja2F0aG9uLmpwZ1wifSk7XG59KTtcblxuXG5cbi8vQXBwbGljYXRpb24gV2lnZ2wgQnV0dG9uXG4kKFwiLmFwcGxpY2F0aW9uXCIpLndheXBvaW50KGZ1bmN0aW9uICgpIHtcblx0VHdlZW5NYXguZnJvbShcIi5idXR0b25cIiwgMC4yLHtyb3RhdGlvbjpcIi0zXCIsIHlveW86IHRydWUsIHJlcGVhdDotMSwgb3ZlcndyaXRlOlwibm9uZVwifSk7XG5cbn0sIHtcblx0b2Zmc2V0OiAnMjUlJ1xufSlcblxuXG4vL0luZm93aW5kb3dzIHN3aXBwaW5nIGluIGZyb20gc2lkZXNcbiQoXCIuaW5mb3dpbmRvd3NcIikud2F5cG9pbnQoZnVuY3Rpb24gKCkge1xuXHQkKCcud2luZG93MScpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcbn0sIHtcblx0b2Zmc2V0OiAnNDAlJ1xufSlcblxuJChcIi5pbmZvd2luZG93c1wiKS53YXlwb2ludChmdW5jdGlvbiAoKSB7XG5cdCQoJy53b21lbicpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcbn0sIHtcblx0b2Zmc2V0OiAnMzAlJ1xufSlcblxuXG4kKFwiLmluZm93aW5kb3dzXCIpLndheXBvaW50KGZ1bmN0aW9uICgpIHtcblx0JCgnLndpbmRvdzInKS50b2dnbGVDbGFzcygnYWN0aXZlJyk7XG59LCB7XG5cdG9mZnNldDogJzIwJSdcbn0pXG5cbiQoXCIuaW5mb3dpbmRvd3NcIikud2F5cG9pbnQoZnVuY3Rpb24gKCkge1xuXHQkKCcud2luZG93MycpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcblxufSwge1xuXHRvZmZzZXQ6ICcwJSdcbn0pXG5cbiQoXCIuaW5mb3dpbmRvd3NcIikud2F5cG9pbnQoZnVuY3Rpb24gKCkge1xuXHQkKCcud2luZG93NCcpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcbn0sIHtcblx0b2Zmc2V0OiAnLTIwJSdcbn0pXG5cbi8vXG4kKFwiLmRhdGFcIikud2F5cG9pbnQoZnVuY3Rpb24gKCkge1xuXHQkKFwiLmNvdW50ZXJcIikuZWFjaChmdW5jdGlvbigpIHtcblx0ICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuXHQgICAgICBjb3VudFRvID0gJHRoaXMuYXR0cignZGF0YS1jb3VudCcpO1xuXHQgIFxuXHQgICQoeyBjb3VudE51bTogJHRoaXMudGV4dCgpfSkuYW5pbWF0ZSh7XG5cdCAgICBjb3VudE51bTogY291bnRUb1xuXHQgIH0sXG5cblx0ICB7XG5cdCAgICBkdXJhdGlvbjogMjAwMCxcblx0ICAgIGVhc2luZzonbGluZWFyJyxcblx0ICAgIHN0ZXA6IGZ1bmN0aW9uKCkge1xuXHQgICAgICAkdGhpcy50ZXh0KE1hdGguZmxvb3IodGhpcy5jb3VudE51bSkpO1xuXHQgICAgfSxcblx0ICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHtcblx0ICAgICAgJHRoaXMudGV4dCh0aGlzLmNvdW50TnVtKTtcblx0ICAgICAgLy9hbGVydCgnZmluaXNoZWQnKTtcblx0ICAgIH1cblxuXHQgIH0pOyAgXG5cdCAgXG5cdH0pO1xuXG5cdCQoJy5jb3VudGVyX3BhcmVudCcpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcbn0sIHtcblx0b2Zmc2V0OiAnMjAlJ1xufSlcblxuXG5cblxuXHQvL01lbWJlciBXaWdnbGUgQnV0dG9uXG5cdFR3ZWVuTWF4LmZyb20oXCIubWVtYmVyX2J1dHRvblwiLCAwLjIse3JvdGF0aW9uOlwiLTNcIiwgeW95bzogdHJ1ZSwgcmVwZWF0Oi0xLCBvdmVyd3JpdGU6XCJub25lXCJ9KTtcblxuXG4iLCIvKiFcbiAqIHBhcmFsbGF4LmpzIHYxLjQuMiAoaHR0cDovL3BpeGVsY29nLmdpdGh1Yi5pby9wYXJhbGxheC5qcy8pXG4gKiBAY29weXJpZ2h0IDIwMTYgUGl4ZWxDb2csIEluYy5cbiAqIEBsaWNlbnNlIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3BpeGVsY29nL3BhcmFsbGF4LmpzL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXG4gKi9cblxuOyhmdW5jdGlvbiAoICQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCApIHtcblxuICAvLyBQb2x5ZmlsbCBmb3IgcmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gIC8vIHZpYTogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vcGF1bGlyaXNoLzE1Nzk2NzFcblxuICAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxhc3RUaW1lID0gMDtcbiAgICB2YXIgdmVuZG9ycyA9IFsnbXMnLCAnbW96JywgJ3dlYmtpdCcsICdvJ107XG4gICAgZm9yKHZhciB4ID0gMDsgeCA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK3gpIHtcbiAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdmVuZG9yc1t4XSsnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdmVuZG9yc1t4XSsnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXVxuICAgICAgICB8fCB3aW5kb3dbdmVuZG9yc1t4XSsnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgfVxuXG4gICAgaWYgKCF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKVxuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjdXJyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICB2YXIgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnJUaW1lIC0gbGFzdFRpbWUpKTtcbiAgICAgICAgdmFyIGlkID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGNhbGxiYWNrKGN1cnJUaW1lICsgdGltZVRvQ2FsbCk7IH0sXG4gICAgICAgICAgdGltZVRvQ2FsbCk7XG4gICAgICAgIGxhc3RUaW1lID0gY3VyclRpbWUgKyB0aW1lVG9DYWxsO1xuICAgICAgICByZXR1cm4gaWQ7XG4gICAgICB9O1xuXG4gICAgaWYgKCF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpXG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihpZCkge1xuICAgICAgICBjbGVhclRpbWVvdXQoaWQpO1xuICAgICAgfTtcbiAgfSgpKTtcblxuXG4gIC8vIFBhcmFsbGF4IENvbnN0cnVjdG9yXG5cbiAgZnVuY3Rpb24gUGFyYWxsYXgoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PSAnb2JqZWN0Jykge1xuICAgICAgZGVsZXRlIG9wdGlvbnMucmVmcmVzaDtcbiAgICAgIGRlbGV0ZSBvcHRpb25zLnJlbmRlcjtcbiAgICAgICQuZXh0ZW5kKHRoaXMsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuXG4gICAgaWYgKCF0aGlzLmltYWdlU3JjICYmIHRoaXMuJGVsZW1lbnQuaXMoJ2ltZycpKSB7XG4gICAgICB0aGlzLmltYWdlU3JjID0gdGhpcy4kZWxlbWVudC5hdHRyKCdzcmMnKTtcbiAgICB9XG5cbiAgICB2YXIgcG9zaXRpb25zID0gKHRoaXMucG9zaXRpb24gKyAnJykudG9Mb3dlckNhc2UoKS5tYXRjaCgvXFxTKy9nKSB8fCBbXTtcblxuICAgIGlmIChwb3NpdGlvbnMubGVuZ3RoIDwgMSkge1xuICAgICAgcG9zaXRpb25zLnB1c2goJ2NlbnRlcicpO1xuICAgIH1cbiAgICBpZiAocG9zaXRpb25zLmxlbmd0aCA9PSAxKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChwb3NpdGlvbnNbMF0pO1xuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbnNbMF0gPT0gJ3RvcCcgfHwgcG9zaXRpb25zWzBdID09ICdib3R0b20nIHx8IHBvc2l0aW9uc1sxXSA9PSAnbGVmdCcgfHwgcG9zaXRpb25zWzFdID09ICdyaWdodCcpIHtcbiAgICAgIHBvc2l0aW9ucyA9IFtwb3NpdGlvbnNbMV0sIHBvc2l0aW9uc1swXV07XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucG9zaXRpb25YICE9IHVuZGVmaW5lZCkgcG9zaXRpb25zWzBdID0gdGhpcy5wb3NpdGlvblgudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAodGhpcy5wb3NpdGlvblkgIT0gdW5kZWZpbmVkKSBwb3NpdGlvbnNbMV0gPSB0aGlzLnBvc2l0aW9uWS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgc2VsZi5wb3NpdGlvblggPSBwb3NpdGlvbnNbMF07XG4gICAgc2VsZi5wb3NpdGlvblkgPSBwb3NpdGlvbnNbMV07XG5cbiAgICBpZiAodGhpcy5wb3NpdGlvblggIT0gJ2xlZnQnICYmIHRoaXMucG9zaXRpb25YICE9ICdyaWdodCcpIHtcbiAgICAgIGlmIChpc05hTihwYXJzZUludCh0aGlzLnBvc2l0aW9uWCkpKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb25YID0gJ2NlbnRlcic7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBvc2l0aW9uWCA9IHBhcnNlSW50KHRoaXMucG9zaXRpb25YKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5wb3NpdGlvblkgIT0gJ3RvcCcgJiYgdGhpcy5wb3NpdGlvblkgIT0gJ2JvdHRvbScpIHtcbiAgICAgIGlmIChpc05hTihwYXJzZUludCh0aGlzLnBvc2l0aW9uWSkpKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb25ZID0gJ2NlbnRlcic7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBvc2l0aW9uWSA9IHBhcnNlSW50KHRoaXMucG9zaXRpb25ZKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnBvc2l0aW9uID1cbiAgICAgIHRoaXMucG9zaXRpb25YICsgKGlzTmFOKHRoaXMucG9zaXRpb25YKT8gJycgOiAncHgnKSArICcgJyArXG4gICAgICB0aGlzLnBvc2l0aW9uWSArIChpc05hTih0aGlzLnBvc2l0aW9uWSk/ICcnIDogJ3B4Jyk7XG5cbiAgICBpZiAobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvKGlQb2R8aVBob25lfGlQYWQpLykpIHtcbiAgICAgIGlmICh0aGlzLmltYWdlU3JjICYmIHRoaXMuaW9zRml4ICYmICF0aGlzLiRlbGVtZW50LmlzKCdpbWcnKSkge1xuICAgICAgICB0aGlzLiRlbGVtZW50LmNzcyh7XG4gICAgICAgICAgYmFja2dyb3VuZEltYWdlOiAndXJsKCcgKyB0aGlzLmltYWdlU3JjICsgJyknLFxuICAgICAgICAgIGJhY2tncm91bmRTaXplOiAnY292ZXInLFxuICAgICAgICAgIGJhY2tncm91bmRQb3NpdGlvbjogdGhpcy5wb3NpdGlvblxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC8oQW5kcm9pZCkvKSkge1xuICAgICAgaWYgKHRoaXMuaW1hZ2VTcmMgJiYgdGhpcy5hbmRyb2lkRml4ICYmICF0aGlzLiRlbGVtZW50LmlzKCdpbWcnKSkge1xuICAgICAgICB0aGlzLiRlbGVtZW50LmNzcyh7XG4gICAgICAgICAgYmFja2dyb3VuZEltYWdlOiAndXJsKCcgKyB0aGlzLmltYWdlU3JjICsgJyknLFxuICAgICAgICAgIGJhY2tncm91bmRTaXplOiAnY292ZXInLFxuICAgICAgICAgIGJhY2tncm91bmRQb3NpdGlvbjogdGhpcy5wb3NpdGlvblxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuJG1pcnJvciA9ICQoJzxkaXYgLz4nKS5wcmVwZW5kVG8oJ2JvZHknKTtcblxuICAgIHZhciBzbGlkZXIgPSB0aGlzLiRlbGVtZW50LmZpbmQoJz4ucGFyYWxsYXgtc2xpZGVyJyk7XG4gICAgdmFyIHNsaWRlckV4aXN0ZWQgPSBmYWxzZTtcblxuICAgIGlmIChzbGlkZXIubGVuZ3RoID09IDApXG4gICAgICB0aGlzLiRzbGlkZXIgPSAkKCc8aW1nIC8+JykucHJlcGVuZFRvKHRoaXMuJG1pcnJvcik7XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLiRzbGlkZXIgPSBzbGlkZXIucHJlcGVuZFRvKHRoaXMuJG1pcnJvcilcbiAgICAgIHNsaWRlckV4aXN0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuJG1pcnJvci5hZGRDbGFzcygncGFyYWxsYXgtbWlycm9yJykuY3NzKHtcbiAgICAgIHZpc2liaWxpdHk6ICdoaWRkZW4nLFxuICAgICAgekluZGV4OiB0aGlzLnpJbmRleCxcbiAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxuICAgICAgdG9wOiAwLFxuICAgICAgbGVmdDogMCxcbiAgICAgIG92ZXJmbG93OiAnaGlkZGVuJ1xuICAgIH0pO1xuXG4gICAgdGhpcy4kc2xpZGVyLmFkZENsYXNzKCdwYXJhbGxheC1zbGlkZXInKS5vbmUoJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghc2VsZi5uYXR1cmFsSGVpZ2h0IHx8ICFzZWxmLm5hdHVyYWxXaWR0aCkge1xuICAgICAgICBzZWxmLm5hdHVyYWxIZWlnaHQgPSB0aGlzLm5hdHVyYWxIZWlnaHQgfHwgdGhpcy5oZWlnaHQgfHwgMTtcbiAgICAgICAgc2VsZi5uYXR1cmFsV2lkdGggID0gdGhpcy5uYXR1cmFsV2lkdGggIHx8IHRoaXMud2lkdGggIHx8IDE7XG4gICAgICB9XG4gICAgICBzZWxmLmFzcGVjdFJhdGlvID0gc2VsZi5uYXR1cmFsV2lkdGggLyBzZWxmLm5hdHVyYWxIZWlnaHQ7XG5cbiAgICAgIFBhcmFsbGF4LmlzU2V0dXAgfHwgUGFyYWxsYXguc2V0dXAoKTtcbiAgICAgIFBhcmFsbGF4LnNsaWRlcnMucHVzaChzZWxmKTtcbiAgICAgIFBhcmFsbGF4LmlzRnJlc2ggPSBmYWxzZTtcbiAgICAgIFBhcmFsbGF4LnJlcXVlc3RSZW5kZXIoKTtcbiAgICB9KTtcblxuICAgIGlmICghc2xpZGVyRXhpc3RlZClcbiAgICAgIHRoaXMuJHNsaWRlclswXS5zcmMgPSB0aGlzLmltYWdlU3JjO1xuXG4gICAgaWYgKHRoaXMubmF0dXJhbEhlaWdodCAmJiB0aGlzLm5hdHVyYWxXaWR0aCB8fCB0aGlzLiRzbGlkZXJbMF0uY29tcGxldGUgfHwgc2xpZGVyLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuJHNsaWRlci50cmlnZ2VyKCdsb2FkJyk7XG4gICAgfVxuXG4gIH07XG5cblxuICAvLyBQYXJhbGxheCBJbnN0YW5jZSBNZXRob2RzXG5cbiAgJC5leHRlbmQoUGFyYWxsYXgucHJvdG90eXBlLCB7XG4gICAgc3BlZWQ6ICAgIDAuMixcbiAgICBibGVlZDogICAgMCxcbiAgICB6SW5kZXg6ICAgLTEwMCxcbiAgICBpb3NGaXg6ICAgdHJ1ZSxcbiAgICBhbmRyb2lkRml4OiB0cnVlLFxuICAgIHBvc2l0aW9uOiAnY2VudGVyJyxcbiAgICBvdmVyU2Nyb2xsRml4OiBmYWxzZSxcblxuICAgIHJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5ib3hXaWR0aCAgICAgICAgPSB0aGlzLiRlbGVtZW50Lm91dGVyV2lkdGgoKTtcbiAgICAgIHRoaXMuYm94SGVpZ2h0ICAgICAgID0gdGhpcy4kZWxlbWVudC5vdXRlckhlaWdodCgpICsgdGhpcy5ibGVlZCAqIDI7XG4gICAgICB0aGlzLmJveE9mZnNldFRvcCAgICA9IHRoaXMuJGVsZW1lbnQub2Zmc2V0KCkudG9wIC0gdGhpcy5ibGVlZDtcbiAgICAgIHRoaXMuYm94T2Zmc2V0TGVmdCAgID0gdGhpcy4kZWxlbWVudC5vZmZzZXQoKS5sZWZ0O1xuICAgICAgdGhpcy5ib3hPZmZzZXRCb3R0b20gPSB0aGlzLmJveE9mZnNldFRvcCArIHRoaXMuYm94SGVpZ2h0O1xuXG4gICAgICB2YXIgd2luSGVpZ2h0ID0gUGFyYWxsYXgud2luSGVpZ2h0O1xuICAgICAgdmFyIGRvY0hlaWdodCA9IFBhcmFsbGF4LmRvY0hlaWdodDtcbiAgICAgIHZhciBtYXhPZmZzZXQgPSBNYXRoLm1pbih0aGlzLmJveE9mZnNldFRvcCwgZG9jSGVpZ2h0IC0gd2luSGVpZ2h0KTtcbiAgICAgIHZhciBtaW5PZmZzZXQgPSBNYXRoLm1heCh0aGlzLmJveE9mZnNldFRvcCArIHRoaXMuYm94SGVpZ2h0IC0gd2luSGVpZ2h0LCAwKTtcbiAgICAgIHZhciBpbWFnZUhlaWdodE1pbiA9IHRoaXMuYm94SGVpZ2h0ICsgKG1heE9mZnNldCAtIG1pbk9mZnNldCkgKiAoMSAtIHRoaXMuc3BlZWQpIHwgMDtcbiAgICAgIHZhciBpbWFnZU9mZnNldE1pbiA9ICh0aGlzLmJveE9mZnNldFRvcCAtIG1heE9mZnNldCkgKiAoMSAtIHRoaXMuc3BlZWQpIHwgMDtcblxuICAgICAgaWYgKGltYWdlSGVpZ2h0TWluICogdGhpcy5hc3BlY3RSYXRpbyA+PSB0aGlzLmJveFdpZHRoKSB7XG4gICAgICAgIHRoaXMuaW1hZ2VXaWR0aCAgICA9IGltYWdlSGVpZ2h0TWluICogdGhpcy5hc3BlY3RSYXRpbyB8IDA7XG4gICAgICAgIHRoaXMuaW1hZ2VIZWlnaHQgICA9IGltYWdlSGVpZ2h0TWluO1xuICAgICAgICB0aGlzLm9mZnNldEJhc2VUb3AgPSBpbWFnZU9mZnNldE1pbjtcblxuICAgICAgICB2YXIgbWFyZ2luID0gdGhpcy5pbWFnZVdpZHRoIC0gdGhpcy5ib3hXaWR0aDtcblxuICAgICAgICBpZiAodGhpcy5wb3NpdGlvblggPT0gJ2xlZnQnKSB7XG4gICAgICAgICAgdGhpcy5vZmZzZXRMZWZ0ID0gMDtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnBvc2l0aW9uWCA9PSAncmlnaHQnKSB7XG4gICAgICAgICAgdGhpcy5vZmZzZXRMZWZ0ID0gLSBtYXJnaW47XG4gICAgICAgIH0gZWxzZSBpZiAoIWlzTmFOKHRoaXMucG9zaXRpb25YKSkge1xuICAgICAgICAgIHRoaXMub2Zmc2V0TGVmdCA9IE1hdGgubWF4KHRoaXMucG9zaXRpb25YLCAtIG1hcmdpbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5vZmZzZXRMZWZ0ID0gLSBtYXJnaW4gLyAyIHwgMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5pbWFnZVdpZHRoICAgID0gdGhpcy5ib3hXaWR0aDtcbiAgICAgICAgdGhpcy5pbWFnZUhlaWdodCAgID0gdGhpcy5ib3hXaWR0aCAvIHRoaXMuYXNwZWN0UmF0aW8gfCAwO1xuICAgICAgICB0aGlzLm9mZnNldExlZnQgICAgPSAwO1xuXG4gICAgICAgIHZhciBtYXJnaW4gPSB0aGlzLmltYWdlSGVpZ2h0IC0gaW1hZ2VIZWlnaHRNaW47XG5cbiAgICAgICAgaWYgKHRoaXMucG9zaXRpb25ZID09ICd0b3AnKSB7XG4gICAgICAgICAgdGhpcy5vZmZzZXRCYXNlVG9wID0gaW1hZ2VPZmZzZXRNaW47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wb3NpdGlvblkgPT0gJ2JvdHRvbScpIHtcbiAgICAgICAgICB0aGlzLm9mZnNldEJhc2VUb3AgPSBpbWFnZU9mZnNldE1pbiAtIG1hcmdpbjtcbiAgICAgICAgfSBlbHNlIGlmICghaXNOYU4odGhpcy5wb3NpdGlvblkpKSB7XG4gICAgICAgICAgdGhpcy5vZmZzZXRCYXNlVG9wID0gaW1hZ2VPZmZzZXRNaW4gKyBNYXRoLm1heCh0aGlzLnBvc2l0aW9uWSwgLSBtYXJnaW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMub2Zmc2V0QmFzZVRvcCA9IGltYWdlT2Zmc2V0TWluIC0gbWFyZ2luIC8gMiB8IDA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzY3JvbGxUb3AgICAgPSBQYXJhbGxheC5zY3JvbGxUb3A7XG4gICAgICB2YXIgc2Nyb2xsTGVmdCAgID0gUGFyYWxsYXguc2Nyb2xsTGVmdDtcbiAgICAgIHZhciBvdmVyU2Nyb2xsICAgPSB0aGlzLm92ZXJTY3JvbGxGaXggPyBQYXJhbGxheC5vdmVyU2Nyb2xsIDogMDtcbiAgICAgIHZhciBzY3JvbGxCb3R0b20gPSBzY3JvbGxUb3AgKyBQYXJhbGxheC53aW5IZWlnaHQ7XG5cbiAgICAgIGlmICh0aGlzLmJveE9mZnNldEJvdHRvbSA+IHNjcm9sbFRvcCAmJiB0aGlzLmJveE9mZnNldFRvcCA8PSBzY3JvbGxCb3R0b20pIHtcbiAgICAgICAgdGhpcy52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICAgICAgICB0aGlzLm1pcnJvclRvcCA9IHRoaXMuYm94T2Zmc2V0VG9wICAtIHNjcm9sbFRvcDtcbiAgICAgICAgdGhpcy5taXJyb3JMZWZ0ID0gdGhpcy5ib3hPZmZzZXRMZWZ0IC0gc2Nyb2xsTGVmdDtcbiAgICAgICAgdGhpcy5vZmZzZXRUb3AgPSB0aGlzLm9mZnNldEJhc2VUb3AgLSB0aGlzLm1pcnJvclRvcCAqICgxIC0gdGhpcy5zcGVlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICAgIH1cblxuICAgICAgdGhpcy4kbWlycm9yLmNzcyh7XG4gICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKDBweCwgMHB4LCAwcHgpJyxcbiAgICAgICAgdmlzaWJpbGl0eTogdGhpcy52aXNpYmlsaXR5LFxuICAgICAgICB0b3A6IHRoaXMubWlycm9yVG9wIC0gb3ZlclNjcm9sbCxcbiAgICAgICAgbGVmdDogdGhpcy5taXJyb3JMZWZ0LFxuICAgICAgICBoZWlnaHQ6IHRoaXMuYm94SGVpZ2h0LFxuICAgICAgICB3aWR0aDogdGhpcy5ib3hXaWR0aFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuJHNsaWRlci5jc3Moe1xuICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwcHgsIDBweCwgMHB4KScsXG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICB0b3A6IHRoaXMub2Zmc2V0VG9wLFxuICAgICAgICBsZWZ0OiB0aGlzLm9mZnNldExlZnQsXG4gICAgICAgIGhlaWdodDogdGhpcy5pbWFnZUhlaWdodCxcbiAgICAgICAgd2lkdGg6IHRoaXMuaW1hZ2VXaWR0aCxcbiAgICAgICAgbWF4V2lkdGg6ICdub25lJ1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuXG4gIC8vIFBhcmFsbGF4IFN0YXRpYyBNZXRob2RzXG5cbiAgJC5leHRlbmQoUGFyYWxsYXgsIHtcbiAgICBzY3JvbGxUb3A6ICAgIDAsXG4gICAgc2Nyb2xsTGVmdDogICAwLFxuICAgIHdpbkhlaWdodDogICAgMCxcbiAgICB3aW5XaWR0aDogICAgIDAsXG4gICAgZG9jSGVpZ2h0OiAgICAxIDw8IDMwLFxuICAgIGRvY1dpZHRoOiAgICAgMSA8PCAzMCxcbiAgICBzbGlkZXJzOiAgICAgIFtdLFxuICAgIGlzUmVhZHk6ICAgICAgZmFsc2UsXG4gICAgaXNGcmVzaDogICAgICBmYWxzZSxcbiAgICBpc0J1c3k6ICAgICAgIGZhbHNlLFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuaXNSZWFkeSkgcmV0dXJuO1xuXG4gICAgICB2YXIgJGRvYyA9ICQoZG9jdW1lbnQpLCAkd2luID0gJCh3aW5kb3cpO1xuXG4gICAgICB2YXIgbG9hZERpbWVuc2lvbnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgUGFyYWxsYXgud2luSGVpZ2h0ID0gJHdpbi5oZWlnaHQoKTtcbiAgICAgICAgUGFyYWxsYXgud2luV2lkdGggID0gJHdpbi53aWR0aCgpO1xuICAgICAgICBQYXJhbGxheC5kb2NIZWlnaHQgPSAkZG9jLmhlaWdodCgpO1xuICAgICAgICBQYXJhbGxheC5kb2NXaWR0aCAgPSAkZG9jLndpZHRoKCk7XG4gICAgICB9O1xuXG4gICAgICB2YXIgbG9hZFNjcm9sbFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB3aW5TY3JvbGxUb3AgID0gJHdpbi5zY3JvbGxUb3AoKTtcbiAgICAgICAgdmFyIHNjcm9sbFRvcE1heCAgPSBQYXJhbGxheC5kb2NIZWlnaHQgLSBQYXJhbGxheC53aW5IZWlnaHQ7XG4gICAgICAgIHZhciBzY3JvbGxMZWZ0TWF4ID0gUGFyYWxsYXguZG9jV2lkdGggIC0gUGFyYWxsYXgud2luV2lkdGg7XG4gICAgICAgIFBhcmFsbGF4LnNjcm9sbFRvcCAgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihzY3JvbGxUb3BNYXgsICB3aW5TY3JvbGxUb3ApKTtcbiAgICAgICAgUGFyYWxsYXguc2Nyb2xsTGVmdCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHNjcm9sbExlZnRNYXgsICR3aW4uc2Nyb2xsTGVmdCgpKSk7XG4gICAgICAgIFBhcmFsbGF4Lm92ZXJTY3JvbGwgPSBNYXRoLm1heCh3aW5TY3JvbGxUb3AgLSBzY3JvbGxUb3BNYXgsIE1hdGgubWluKHdpblNjcm9sbFRvcCwgMCkpO1xuICAgICAgfTtcblxuICAgICAgJHdpbi5vbigncmVzaXplLnB4LnBhcmFsbGF4IGxvYWQucHgucGFyYWxsYXgnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsb2FkRGltZW5zaW9ucygpO1xuICAgICAgICAgIFBhcmFsbGF4LmlzRnJlc2ggPSBmYWxzZTtcbiAgICAgICAgICBQYXJhbGxheC5yZXF1ZXN0UmVuZGVyKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignc2Nyb2xsLnB4LnBhcmFsbGF4IGxvYWQucHgucGFyYWxsYXgnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsb2FkU2Nyb2xsUG9zaXRpb24oKTtcbiAgICAgICAgICBQYXJhbGxheC5yZXF1ZXN0UmVuZGVyKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICBsb2FkRGltZW5zaW9ucygpO1xuICAgICAgbG9hZFNjcm9sbFBvc2l0aW9uKCk7XG5cbiAgICAgIHRoaXMuaXNSZWFkeSA9IHRydWU7XG4gICAgfSxcblxuICAgIGNvbmZpZ3VyZTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09ICdvYmplY3QnKSB7XG4gICAgICAgIGRlbGV0ZSBvcHRpb25zLnJlZnJlc2g7XG4gICAgICAgIGRlbGV0ZSBvcHRpb25zLnJlbmRlcjtcbiAgICAgICAgJC5leHRlbmQodGhpcy5wcm90b3R5cGUsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICQuZWFjaCh0aGlzLnNsaWRlcnMsIGZ1bmN0aW9uKCl7IHRoaXMucmVmcmVzaCgpIH0pO1xuICAgICAgdGhpcy5pc0ZyZXNoID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaXNGcmVzaCB8fCB0aGlzLnJlZnJlc2goKTtcbiAgICAgICQuZWFjaCh0aGlzLnNsaWRlcnMsIGZ1bmN0aW9uKCl7IHRoaXMucmVuZGVyKCkgfSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3RSZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAoIXRoaXMuaXNCdXN5KSB7XG4gICAgICAgIHRoaXMuaXNCdXN5ID0gdHJ1ZTtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgICBzZWxmLnJlbmRlcigpO1xuICAgICAgICAgIHNlbGYuaXNCdXN5ID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgZGVzdHJveTogZnVuY3Rpb24oZWwpe1xuICAgICAgdmFyIGksXG4gICAgICAgICAgcGFyYWxsYXhFbGVtZW50ID0gJChlbCkuZGF0YSgncHgucGFyYWxsYXgnKTtcbiAgICAgIHBhcmFsbGF4RWxlbWVudC4kbWlycm9yLnJlbW92ZSgpO1xuICAgICAgZm9yKGk9MDsgaSA8IHRoaXMuc2xpZGVycy5sZW5ndGg7IGkrPTEpe1xuICAgICAgICBpZih0aGlzLnNsaWRlcnNbaV0gPT0gcGFyYWxsYXhFbGVtZW50KXtcbiAgICAgICAgICB0aGlzLnNsaWRlcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAkKGVsKS5kYXRhKCdweC5wYXJhbGxheCcsIGZhbHNlKTtcbiAgICAgIGlmKHRoaXMuc2xpZGVycy5sZW5ndGggPT09IDApe1xuICAgICAgICAkKHdpbmRvdykub2ZmKCdzY3JvbGwucHgucGFyYWxsYXggcmVzaXplLnB4LnBhcmFsbGF4IGxvYWQucHgucGFyYWxsYXgnKTtcbiAgICAgICAgdGhpcy5pc1JlYWR5ID0gZmFsc2U7XG4gICAgICAgIFBhcmFsbGF4LmlzU2V0dXAgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG5cbiAgLy8gUGFyYWxsYXggUGx1Z2luIERlZmluaXRpb25cblxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvbjtcblxuICAgICAgaWYgKHRoaXMgPT0gd2luZG93IHx8IHRoaXMgPT0gZG9jdW1lbnQgfHwgJHRoaXMuaXMoJ2JvZHknKSkge1xuICAgICAgICBQYXJhbGxheC5jb25maWd1cmUob3B0aW9ucyk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICghJHRoaXMuZGF0YSgncHgucGFyYWxsYXgnKSkge1xuICAgICAgICBvcHRpb25zID0gJC5leHRlbmQoe30sICR0aGlzLmRhdGEoKSwgb3B0aW9ucyk7XG4gICAgICAgICR0aGlzLmRhdGEoJ3B4LnBhcmFsbGF4JywgbmV3IFBhcmFsbGF4KHRoaXMsIG9wdGlvbnMpKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcpXG4gICAgICB7XG4gICAgICAgICQuZXh0ZW5kKCR0aGlzLmRhdGEoJ3B4LnBhcmFsbGF4JyksIG9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYob3B0aW9uID09ICdkZXN0cm95Jyl7XG4gICAgICAgICAgICBQYXJhbGxheFsnZGVzdHJveSddKHRoaXMpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBQYXJhbGxheFtvcHRpb25dKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9O1xuXG4gIHZhciBvbGQgPSAkLmZuLnBhcmFsbGF4O1xuXG4gICQuZm4ucGFyYWxsYXggICAgICAgICAgICAgPSBQbHVnaW47XG4gICQuZm4ucGFyYWxsYXguQ29uc3RydWN0b3IgPSBQYXJhbGxheDtcblxuXG4gIC8vIFBhcmFsbGF4IE5vIENvbmZsaWN0XG5cbiAgJC5mbi5wYXJhbGxheC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4ucGFyYWxsYXggPSBvbGQ7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cblxuICAvLyBQYXJhbGxheCBEYXRhLUFQSVxuXG4gICQoZG9jdW1lbnQpLm9uKCdyZWFkeS5weC5wYXJhbGxheC5kYXRhLWFwaScsIGZ1bmN0aW9uICgpIHtcbiAgICAkKCdbZGF0YS1wYXJhbGxheD1cInNjcm9sbFwiXScpLnBhcmFsbGF4KCk7XG4gIH0pO1xuXG59KGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCkpO1xuIl19
