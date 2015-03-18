define(['jquery',
        'handlebars',
        'FAOSTAT_UI_COMMONS',
        'bootstrap',
        'jstree',
        'sweetAlert'], function ($, Handlebars, Commons) {

    'use strict';

    function TREE() {

        this.CONFIG = {
            lang: 'en',
            lang_faostat: 'E',
            datasource: 'faostat',
            max_label_width: null,
            prefix: 'faostat_tree_',
            placeholder_id: 'placeholder',
            url_rest: 'http://faostat3.fao.org/wds/rest/groupsanddomains'
        };

    }

    TREE.prototype.init = function(config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        this.CONFIG.lang = this.CONFIG.lang != null ? this.CONFIG.lang : 'en';

        /* Store FAOSTAT language. */
        this.CONFIG.lang_faostat = Commons.iso2faostat(this.CONFIG.lang);

        /* this... */
        var _this = this;

        /* Store JQuery object.. */
        this.tree = $('#' + _this.CONFIG.placeholder_id);

        /* REST URL */
        var url = this.CONFIG.url_rest + '/' + this.CONFIG.datasource + '/' + this.CONFIG.lang_faostat;

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

                _this.tree.on('select_node.jstree', function (e, data) {
                    var node = $('#' + data.node.id);
                    if (data.node.parent == '#')
                        _this.tree.jstree().is_open() ? _this.tree.jstree().close_node(node) : _this.tree.jstree().open_node(node);
                });

                _this.tree.on('changed.jstree', function (e, data) {

                    /* Check whether is group or domain. */
                    if (data.node.parent == '#') {

                        amplify.publish(_this.CONFIG.prefix + 'group_event', {id: data.node.id});

                    } else {

                        amplify.publish(_this.CONFIG.prefix + 'domain_event', {id: data.node.id});

                    }

                });

            }

        });

    };

    TREE.prototype.onGroupClick = function(callback) {
        amplify.subscribe(this.CONFIG.prefix + 'group_event', function(event_data) {
            callback(event_data.id);
        });
    };

    TREE.prototype.onDomainClick = function(callback) {
        amplify.subscribe(this.CONFIG.prefix + 'domain_event', function(event_data) {
            callback(event_data.id);
        });
    };

    return TREE;

});