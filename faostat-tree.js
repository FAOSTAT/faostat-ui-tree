define(['jquery',
        'handlebars',
        'text!faostat_tree/html/templates.html',
        'i18n!faostat_tree/nls/translate',
        'bootstrap',
        'jstree',
        'sweet-alert'], function ($, Handlebars, templates, translate) {

    'use strict';

    function TREE() {

        this.CONFIG = {
            lang: 'E',
            placeholder_id: 'placeholder',
            datasource: 'faostat',
            url_rest: 'http://faostat3.fao.org/wds/rest/groupsanddomains'
        };

    }

    TREE.prototype.init = function(config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        this.CONFIG.lang = this.CONFIG.lang != null ? this.CONFIG.lang : 'E';

        /* this... */
        var _this = this;

        /* Test. */
        $('#' + this.CONFIG.placeholder_id).html('I am a tree');

        /* REST URL */
        var url = this.CONFIG.data.url_rest + '/' + this.CONFIG.data.datasource + '/' + this.CONFIG.data.lang;

    };

    return TREE;

});