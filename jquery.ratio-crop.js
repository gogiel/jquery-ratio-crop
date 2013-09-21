;
(function ($, window, document, undefined) {
 
    var pluginName = "ratioCrop",
        defaults = {
            propertyName: "value"
        };

    // The actual plugin constructor
    var Plugin = function (element, options) {
        this.element = element;
        this.settings = $.extend({
            target: element
        }, Plugin.defaults, options);
        this._name = pluginName;
        this.init();
    };
    
    Plugin.defaults = defaults;
    
    $[pluginName] = Plugin;

    Plugin.prototype = {
        initialHTML: function(){
            return '<div class="ratio-crop-box"><div class="ratio-crop-viewport"></div></div>';
        },
        init: function () {
            var newTarget = $(this.initialHTML()),
                image = this.element;
            this.settings.target.replaceWith(newTarget);
            this.target = newTarget;
            $('.ratio-crop-viewport', newTarget)
                .css({position: 'absolute'})
                .append(image);
            newTarget.css({position: 'relative', width: 150, height: 150, overflow: 'hidden'});
            
            this.enableDraggable();
        },
        enableDraggable: function(){
            var element = this.element;
            
            var stopDragging = function () {
                element.removeClass('draggable');
            };
            element.on("mousedown", function (e) {
                var $drag = $(this).addClass('draggable'), 
                    drg_h = $drag.outerHeight(),
                    drg_w = $drag.outerWidth(),
                    pos_y = $drag.offset().top + drg_h - e.pageY,
                    pos_x = $drag.offset().left + drg_w - e.pageX;
                
                element.off('mousemove').on("mousemove", function (e) {
                    element.filter('.draggable').offset({
                        top: e.pageY + pos_y - drg_h,
                        left: e.pageX + pos_x - drg_w
                    });
                });
                e.preventDefault(); // disable selection
            }).on("mouseup",stopDragging );
            this.target.mouseleave(stopDragging); 
        },
        handleCall: function(args){
            
        }
    };

    $.fn[ pluginName ] = function (options) {
        var args = arguments;
        return this.each(function () {
            var pluginData = !$.data(this, "plugin_" + pluginName);
            if (pluginData) {
                $.data(this, "plugin_" + pluginName, new Plugin($(this), options));
            } else {
                pluginData.handleCall(args);
            }
        });
    };

})(jQuery, window, document);