define(['jquery',
        'faostat_commons',
        'wds_client',
        'jstree',
        'sweetAlert'], function ($, FAOSTATCommons, WDSClient) {

    'use strict';

    function TREE() {

        this.CONFIG = {

            w: null,
            code:null,
            lang: 'en',
            group: null,
            domain: null,

            lang_faostat: 'E',
            datasource: 'faostat',
            max_label_width: null,
            prefix: 'faostat_tree_',
            placeholder_id: 'placeholder',
            url_rest: 'http://faostat3.fao.org/wds/rest',
            url_wds_crud: 'http://fenixapps2.fao.org/wds_5.1/rest/crud',

            /* Events to destroy. */
            callback: {
                onClick: null,
                onGroupClick: null,
                onDomainClick: null
            }

        };

    }

    TREE.prototype.init = function(config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        this.CONFIG.lang = this.CONFIG.lang != null ? this.CONFIG.lang : 'en';

        /* Store FAOSTAT language. */
        this.CONFIG.lang_faostat = FAOSTATCommons.iso2faostat(this.CONFIG.lang);

        /* Initiate the WDS client. */
        this.CONFIG.w = new WDSClient({
            datasource: this.CONFIG.datasource,
            serviceUrl: this.CONFIG.url_wds_crud
        });

        /* Render. */
        this.render();

    };

    TREE.prototype.render = function() {

        /* this... */
        var _this = this;

         /* Store JQuery object.. */
        this.tree = $(this.CONFIG.placeholder_id).length > 0? $(this.CONFIG.placeholder_id): $("#" + this.CONFIG.placeholder_id);

        /* Fetch FAOSTAT groups and domains. */
        this.CONFIG.w.wdsclient('groupsanddomains', this.CONFIG, function(json) {

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

            /* Implement node selection. */
            _this.tree.on('select_node.jstree', function (e, data) {
                var node = $('#' + data.node.id);
                if (data.node.parent == '#')
                    _this.tree.jstree().is_open()? _this.tree.jstree().close_node(node): _this.tree.jstree().open_node(node);
            });

            /* Check whether is group or domain. */
            _this.tree.on('changed.jstree', function (e, data) {
                if (data.node.parent == '#') {
                    if (_this.CONFIG.callback.onGroupClick) {
                        _this.CONFIG.callback.onGroupClick({id: data.node.id});
                    }
                } else {
                    if (_this.CONFIG.callback.onDomainClick) {
                        _this.CONFIG.callback.onDomainClick({id: data.node.id});
                    }
                }
                if (_this.CONFIG.callback.onClick) {
                    _this.CONFIG.callback.onClick({id: data.node.id});
                }
            });

            /* Show required domain. */
            _this.tree.on('ready.jstree', function () {
                _this.selectDefaultCode();
            });

        }, this.CONFIG.url_rest);

    };

    TREE.prototype.selectDefaultCode = function() {
        if (this.CONFIG.code)
            this.tree.jstree().select_node(this.CONFIG.code);
        else if (this.CONFIG.domain)
            this.tree.jstree().select_node(this.CONFIG.domain);
        else if (this.CONFIG.group)
            this.tree.jstree().select_node(this.CONFIG.group);
    };

    TREE.prototype.destroy = function() {
        console.log("destroy");
        this.tree.jstree("destroy");
    };
    return TREE;

});