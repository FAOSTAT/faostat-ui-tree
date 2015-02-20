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
        var url = this.CONFIG.url_rest + '/' + this.CONFIG.datasource + '/' + this.CONFIG.lang;

        /* Load groups and domains from the DB. */
        $.ajax({

            type: 'GET',
            url: url,

            success: function (response) {

                /* Cast the response to JSON, if needed. */
                var json = response;
                if (typeof json == 'string')
                    json = $.parseJSON(response);

                var payload = [];
                payload.push({
                    id: 'Q',
                    text: 'Production',
                    parent: '#'
                });
                payload.push({
                    id: 'QC',
                    text: 'Crops',
                    parent: 'Q'
                });

                /* Init JSTree. */
                $('#' + _this.CONFIG.placeholder_id).jstree({

                    'plugins': ['unique', 'search', 'types', 'wholerow'],

                    'core': {
                        'data': payload,
                        'themes': {
                            'icons': false
                        }
                    },

                    'search': {
                        'show_only_matches': true,
                        'close_opened_onclear': false
                    }

                });

            }

        });

    };

    return TREE;

});