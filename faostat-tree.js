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
            url_rest: 'http://faostat3.fao.org/wds/rest/groupsanddomains',
            max_label_width: null,
            onClick_group: null,
            onClick_domain: null
        };

    }

    TREE.prototype.init = function(config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        this.CONFIG.lang = this.CONFIG.lang != null ? this.CONFIG.lang : 'E';

        /* this... */
        var _this = this;

        /* Store JQuery object.. */
        this.tree = $('#' + _this.CONFIG.placeholder_id);

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

                /* Buffer. */
                var buffer = [];
                var payload = [];

                /* Iterate over domains. */
                for (var i = 0 ; i < json.length ; i++) {

                    /* Create group node. */
                    if ($.inArray(json[i][0], buffer) < 0) {
                        buffer.push(json[i][0]);
                        payload.push({
                            id: json[i][0],
                            text: json[i][1],
                            parent: '#'
                        });
                    }

                    /* Add domain node. */
                    payload.push({
                        id: json[i][2],
                        text: json[i][3],
                        parent: json[i][0]
                    });

                }

                /* Init JSTree. */
                _this.tree.jstree({

                    'plugins': ['unique', 'search', 'types', 'wholerow'],

                    'core': {
                        'data': payload,
                        'themes': {
                            'icons': false,
                            'responsive': true
                        }
                    },

                    'search': {
                        'show_only_matches': true,
                        'close_opened_onclear': false
                    }

                });

                _this.tree.on('changed.jstree', function (e, data) {
                    if (data.node.parent == '#') {
                        _this.CONFIG.onClick_group != null ? _this.CONFIG.onClick_group(data.node.id) : _this.onClick_group(data.node.id);
                    } else {
                        _this.CONFIG.onClick_domain != null ? _this.CONFIG.onClick_domain(data.node.id) : _this.onClick_domain(data.node.id);
                    }
                });

            }

        });

    };

    TREE.prototype.onClick_group = function(id) {
        sweetAlert('You have selected group ' + id);
    };

    TREE.prototype.onClick_domain = function(id) {
        sweetAlert('You have selected domain ' + id);
    };

    return TREE;

});