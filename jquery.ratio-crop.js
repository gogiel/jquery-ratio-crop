;
(function ($, window, document, undefined) {

    var pluginName = 'ratioCrop',
        defaults = {
            propertyName: 'value'
        };

    // The actual plugin constructor
    var Plugin = function (element, options) {
        this.element = element;
        this.settings = $.extend({
            target: element,
            noEmpty: true,
            viewportHeight: 250,
            viewportWidth: 500
        }, Plugin.defaults, options);
        this.init();
    };

    Plugin.defaults = defaults;

    $[pluginName] = Plugin;

    Plugin.prototype = {
        initialHTML: function () {
            return '<div class="ratio-crop-box"><div class="ratio-crop-viewport"></div></div>';
        },
        init: function () {
            this.readSize();
            var newTarget = $(this.initialHTML()),
                image = this.element;
            this.scale = 1;

            this.settings.target.replaceWith(newTarget);
            this.target = newTarget;
            this.targetOffset = this.target.offset();
            $('.ratio-crop-viewport', newTarget)
                .css({position: 'absolute'})
                .append(image);
            newTarget.css({position: 'relative', width: this.settings.viewportWidth, height: this.settings.viewportHeight, overflow: 'hidden'});

            this.bindEvents();
            this.enableDraggable();
            this.enableMouseWheel();
        },
        enableDraggable: function () {
            var element = this.element;

            var stopDragging = function () {
                element.removeClass('draggable').off('mousemove');
            };
            var self = this;
            element
                .on('mousedown', function (e) {
                    var $drag = $(this).addClass('draggable'),
                        drg_h = $drag.outerHeight(),
                        drg_w = $drag.outerWidth(),
                        pos_y = $drag.offset().top + drg_h - e.pageY,
                        pos_x = $drag.offset().left + drg_w - e.pageX;

                    element
                        .on('mousemove', function (e) {
                            
                            var newTop = e.pageY + pos_y - drg_h,
                                newLeft = e.pageX + pos_x - drg_w;
                            
                            
                            if (self.isValidLeftPosition(newLeft)) {
                                element.offset({
                                    left: newLeft
                                });
                            }
                            if (self.isValidTopPosition(newTop)) {
                                element.offset({
                                    top: newTop
                                });
                            }
                        });
                    e.preventDefault(); // disable selection
                })
                .on('mouseup', stopDragging);
            this.target.mouseleave(stopDragging);
        },
        isValidTopPosition: function (top, height) {
            top = top || this.element.offset().top;
            height = height || this.height();
            if (!this.settings.noEmpty) return true;
            top -= this.targetOffset.top;
            
            return top <= 0 && this.settings.viewportHeight <= top + height;
        },
        isValidLeftPosition: function (left, width) {
            left = left || this.element.offset().left;
            width = width || this.width();
            if (!this.settings.noEmpty) return true;
            left -= this.targetOffset.left;

            return left <= 0 && this.settings.viewportWidth <= left + width;
        },
        enableMouseWheel: function () {
            this.target.mousewheel($.proxy(function (e, delta) {
                this.element.trigger(delta > 0 ? 'zoom-in' : 'zoom-out')
            }, this));
        },
        readSize: function () {
            this.imageWidth = this.element.width();
            this.imageHeight = this.element.height();
        },
        bindEvents: function () {
            this.element
                .on('zoom-in', $.proxy(this, 'zoomIn'))
                .on('zoom-out', $.proxy(this, 'zoomOut'));
        },
        zoomIn: function () {
            this.scale *= 1.1;
            this.rescaleImage();
        },
        zoomOut: function () {
            if(this.isValidTopPosition(undefined, this.height()/1.1) && this.isValidLeftPosition(undefined, this.width()/1.1) )
            this.scale /= 1.1;
            this.rescaleImage();
        },
        width: function(){
            return this.imageWidth * this.scale;    
        },
        height: function(){
            return this.imageHeight * this.scale;    
        },
        rescaleImage: function () {
            this.element.css({width: this.imageWidth * this.scale, height: this.imageHeight * this.scale});
        },

        handleCall: function (args) {
        }
    };

    $.fn[ pluginName ] = function (options) {
        var args = arguments;
        return this.each(function () {
            var pluginData = !$.data(this, 'plugin_' + pluginName);
            if (pluginData) {
                $.data(this, 'plugin_' + pluginName, new Plugin($(this), options));
            } else {
                pluginData.handleCall(args);
            }
        });
    };

})(jQuery, window, document);