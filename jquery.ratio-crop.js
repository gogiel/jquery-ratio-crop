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
            element.on("mousedown", function (e) {
                var $drag;
                    $drag = $(this).addClass('draggable');
                var z_idx = $drag.css('z-index'),
                    drg_h = $drag.outerHeight(),
                    drg_w = $drag.outerWidth(),
                    pos_y = $drag.offset().top + drg_h - e.pageY,
                    pos_x = $drag.offset().left + drg_w - e.pageX;
                $drag.css('z-index', 1000).parents().on("mousemove.drag", function (e) {
                    $('.draggable').offset({
                        top: e.pageY + pos_y - drg_h,
                        left: e.pageX + pos_x - drg_w
                    }).on("mouseup.drag", function () {
                            $(this).removeClass('draggable').css('z-index', z_idx);
                        });
                });
                e.preventDefault(); // disable selection
            }).on("mouseup", function () {
                        $(this).removeClass('draggable');    
                });
            this.target.mouseleave(function(){
                element.removeClass('draggable');
            }) 
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