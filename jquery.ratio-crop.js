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
            return '<div class="ratio-crop-box"></div>';
        },
        init: function () {
            this.readSize();
            var newTarget = $(this.initialHTML()),
                image = this.element;
            this.scale = 1;

            this.settings.target.replaceWith(newTarget);
            this.target = newTarget;
            this.targetOffset = this.target.offset();
            newTarget
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
        fixTop: function(){
            var newTop, height = this.height();
            var top = newTop = this.element.offset().top;
            if(top > 0) newTop = 0;
            if(this.settings.viewportHeight > top + height) newTop = this.settings.viewportHeight - height;
            this.element.css('top', newTop);
        },
        isValidLeftPosition: function (left, width) {
            left = left || this.element.offset().left;
            width = width || this.width();
            if (!this.settings.noEmpty) return true;
            left -= this.targetOffset.left;

            return left <= 0 && this.settings.viewportWidth <= left + width;
        },
        fixLeft: function(){
            var newLeft, width = this.width();
            var left = newLeft = this.element.offset().left; 
            if(left > 0) newLeft = 0;
            if(this.settings.viewportWidth > left + width) newLeft = this.settings.viewportWidth - width;

            this.element.css('left', newLeft);
        },
        enableMouseWheel: function () {
            this.target.mousewheel($.proxy(function (e, delta) {
                this.element.trigger(delta > 0 ? 'zoom-in' : 'zoom-out', e)
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
        zoomIn: function (_e, e) {
            e.preventDefault();
            var oldScale = this.scale;
            this.scale *= 1.1;
            this.repositionViewBox(oldScale, e.screenX, e.screenY);
            this.rescaleImage();
        },
        zoomOut: function (_e, e) {
            e.preventDefault();
            var oldScale = this.scale,
                newScale = oldScale / 1.1;

            if (this.imageWidth * newScale < this.settings.viewportWidth || this.imageHeight * newScale < this.settings.viewportHeight) return;
            this.scale = newScale;
            this.repositionViewBox(oldScale, e.screenX, e.screenY);
            this.rescaleImage();

        },
        width: function () {
            return this.imageWidth * this.scale;
        },
        height: function () {
            return this.imageHeight * this.scale;
        },
        rescaleImage: function () {
            this.element.css({width: this.imageWidth * this.scale, height: this.imageHeight * this.scale});
            if(!this.isValidTopPosition()) this.fixTop();
            if(!this.isValidLeftPosition()) this.fixLeft();
        },

        repositionViewBox: function (originalScale, xScreen, yScreen) {
            var position = this.element.position(),
                x = position.left,
                y = position.top;
            var offset = this.target.offset();
            xScreen -= offset.left;
            yScreen -= offset.top;

            var xImg = (-x + xScreen) / originalScale,
                yImg = (-y + yScreen) / originalScale,
                newXImg = (-x + xScreen) / this.scale,
                newYImg = (-y + yScreen) / this.scale;

            this.element.css({
                left: x - (xImg - newXImg) * this.scale,
                top: y - (yImg - newYImg) * this.scale
            });
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