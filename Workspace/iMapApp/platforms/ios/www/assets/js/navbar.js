;(function($){
    $.fn.navbar = function(options) {
    
        var defaults = {
            dropDownLabel : '<span class="icon"></span>',
            mainClassName : 'navbar',
            breakPoint : '',
            toggleSpeed : 'fast'
        };
    
        if (this.length === 0) {
            return this;
        } else if(this.length > 1) {
            this.each(function() {
                $(this).navbar(options);
            });
            return this;
        }

        var navbar = this;
        navbar.plugin = this;
        navbar.config = {};
        
        // Init function
        var init = function() {
        
            // Merge user options with default configuration
            navbar.config = $.extend({}, defaults, options);

            // Setup
            createDropDown();
            navbar.checkMenu();

            // Triggers
            $(window).resize(function() {
                navbar.checkMenu();
            });
            if (navbar.config.toggleSpeed === 0) {
                navbar.plugin.find('.js_DropDown').click(function(e) {
                navbar.enableDropDown();
                e.stopPropagation();
                });
                $(document).click(function() {
                    navbar.disableDropDown();
                });
            } else {
                $(document).ready(function(){
                $(".js_DropDown").click(function(){
                      $("ul").slideToggle(navbar.config.toggleSpeed, function() {
                        $('a.dropdown-btn').toggleClass('active', $(this).is(':visible'));
                      });
                    });
                });
            } // jshint ignore:line            
        };
        
        // Create drop down
        var createDropDown = function() { // jshint ignore:line       
            var wrapClass = navbar.config.mainClassName;
            navbar.plugin.removeClass();
            navbar.plugin.wrap('<div class="' + wrapClass + '"></div>');
            navbar.plugin = navbar.plugin.parent();
            navbar.plugin.prepend('<div class="js_DropDown"><a class="dropdown-btn" href="javascript:void(0)">' + navbar.config.dropDownLabel + '</a></div>');
        };

        // Check menu
        navbar.checkMenu = function() {
            var menuMaxWidth = navbar.plugin.width();

            function getContentWidth() {
                var menuContentWidth = 0;
                navbar.plugin.find('ul').removeClass('mobile').show();
                navbar.plugin.find('ul li').each(function() {
                    menuContentWidth += $(this).width();
                });
                return menuContentWidth;
            }

            function switchMenu(type) {
                if (type === 'dropdown') {
                    navbar.plugin.find('ul').addClass('mobile').hide();
                    navbar.plugin.find('.js_DropDown').show();
                } else {
                    navbar.plugin.find('ul').removeClass('mobile').show();
                    navbar.plugin.find('.js_DropDown').hide();
                }
                navbar.plugin.find('.js_DropDown a').removeClass('active');
            }

            if (navbar.config.breakPoint !== 0) {
                var ScreenWidth = $(window).width() < navbar.config.breakPoint;
                if (ScreenWidth) {
                    switchMenu('dropdown');
                } else {
                    switchMenu('normal');
                }
            } else {
                if (getContentWidth() > menuMaxWidth) {
                switchMenu('dropdown');
                } else {
                    switchMenu('normal');
                }
            }
        };// jshint ignore:line   

        // Enable drop down
        navbar.enableDropDown = function() {
            if (navbar.plugin.find('.js_DropDown a').hasClass('active')) {
                navbar.disableDropDown();
                return false;
            }
            navbar.plugin.find('.js_DropDown a').addClass('active');
            navbar.plugin.find('ul').show();
        };

        // Disable drop down
        navbar.disableDropDown = function() {
            if (navbar.plugin.find('.js_DropDown a').hasClass('active')) {
                navbar.plugin.find('.js_DropDown a').removeClass('active');
                navbar.plugin.find('ul').hide();
            }
        };
        // Menu initialization
        init();
        return this;
    };
})(window.Zepto || window.jQuery);