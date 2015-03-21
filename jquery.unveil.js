/**
 * jQuery Unveil
 * A very lightweight jQuery plugin to lazy load images
 * http://wcarle.github.com/unveil
 *
 * Licensed under the MIT license.
 * Copyright 2015 William Carle
 * https://github.com/wcarle
 *
 * Forked from: https://github.com/luis-almeida/unveil
 *
 * Licensed under the MIT license.
 * Copyright 2013 Luís Almeida
 * https://github.com/luis-almeida
 */

;(function($) {
    /**
     * Lazy load given elements when viewport scrolls near element by replacing placeholder tag with specified tag or setting image src from data-src
     * @param  {Object} optional settings for replacement process
     * @param  {Number} options.threshold load elements before they come into the viewport by x pixels (1000)
     * @param  {String} options.replaceTag the tag type to replace the placeholder (<iframe>)
     * @param  {Number} options.delay time delay element must remain in viewport before being loaded (0)
     * @param  {String} options.mode replace mode 'img': copy data-src to src attribute, 'placeholder': replace tag and copy all attributes (img)
     * @param  {String} options.loadingClasse CSS class to be removed from element when replaced (loading)
     * @param  {Function} callback function to execute when elemet scrolls into view
     */
    $.fn.unveil = function(options, callback) {
        var timer = 0;
        var $w = $(window),
            retina = window.devicePixelRatio > 1,
            attrib = retina? "data-src-retina" : "data-src",
            placeholders = this,
            loaded;
        var settings = $.extend({
            threshold: 1000,
            replaceTag: '<iframe>',
            delay: 0,
            mode: 'img',
            loadingClass: 'loading'
        }, options);
        // Attach unveil handler to be called when an element comes into view
        this.one("unveil", function() {
            // Image mode, only set src attribute
            if (settings.mode === 'img'){
                var source = this.getAttribute(attrib);
                source = source || this.getAttribute("data-src");
                if (source) {
                    this.setAttribute("src", source);
                    if (typeof callback === "function") callback.call(this);
                }
            }
            // Placeholder mode, replace entire tag and copy attributes
            else {
                var $embed = $(settings.replaceTag);
                var $placeholder = $(this);
                var attributes = $placeholder.prop('attributes');
                // Copy all attributes from placeholder
                $.each(attributes, function(){
                        $embed.attr(this.name, this.value);
                });
                $embed.removeClass(settings.loadingClass);
                $placeholder.replaceWith($embed);
                if (typeof callback === "function") callback.call(this);
            }
        });
        /**
         * Filter callback, return only elements within the viewport
         * @return {Object} jQuery elements currently in the viewport
         */
        function filterView() {
                var $e = $(this);
                if ($e.is(":hidden")) return;

                var wt = $w.scrollTop(),
                        wb = wt + $w.height(),
                        et = $e.offset().top,
                        eb = et + $e.height();

                return eb >= wt - settings.threshold && et <= wb + settings.threshold;
        }
        /**
         * Unveil callback called any time scroll event is detected
         */
        function unveil() {
            var inview = placeholders.filter(filterView);
            // Wait for delay if element is still in view unveil it
            if (settings.delay > 0) {
                timer = setTimeout(function(){
                    stillInView = inview.filter(filterView);
                    loaded = stillInView.trigger("unveil");
                }, settings.delay);
            }
            else {
                loaded = inview.trigger("unveil");
            }
            
            placeholders = placeholders.not(loaded);
        }

        $w.on("scroll.unveil resize.unveil lookup.unveil", unveil);

        unveil();

        return this;

    };

})(window.jQuery || window.Zepto);