/*global define*/
define(['jquery',
        'loglevel',
        'faostat_commons',
        'faostatapiclient',
        'q',
        'jstree',
        'amplify'
], function ($, log, FAOSTATCommons, FAOSTATAPIClient) {

    'use strict';

    function TREE() {

        this.CONFIG = {

            w: null,
            code: null,
            lang: 'en',
            group: null,
            domain: null,

            //datasource: 'faostat',
            max_label_width: null,
            prefix: 'faostat_tree_',
            placeholder_id: 'placeholder',
            blacklist: [],
            whitelist: [],
            section: 'download',

            placeholder_search: null,

            /* Events to destroy. */
            callback: {
                onClick: null,
                onGroupClick: null,
                onDomainClick: null,
                onTreeRendered: null
            }

        };

    }

    TREE.prototype.init = function (config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        if (!this.CONFIG.lang) {
            console.warn('Language for FAOSTAT-TREE is no set', this.CONFIG.lang);
        }

        this.CONFIG.lang = this.CONFIG.lang !== null ? this.CONFIG.lang : 'en';

        /* Initiate FAOSTAT API's client. */
        this.CONFIG.api = new FAOSTATAPIClient();

        /* Render. */
        this.render();

    };

    TREE.prototype.render = function () {

        /* Variables. */
        var self = this;

        if (this.CONFIG.placeholder_id instanceof $) {
            this.tree = this.CONFIG.placeholder_id;
        }else{
            /* Store JQuery object.. */
            this.tree = $(this.CONFIG.placeholder_id).length > 0 ? $(this.CONFIG.placeholder_id) : $("#" + this.CONFIG.placeholder_id);
        }

        // add tree class
        this.tree.addClass('fs-tree');

        this.CONFIG.lang_faostat = FAOSTATCommons.iso2faostat(this.CONFIG.lang);

        if (this.CONFIG.custom) {
            // create a custom tree
            self.createTree(this.CONFIG.custom);
        }
        else {
            /* Fetch FAOSTAT groups and domains. */
            this.CONFIG.api.domainstree({
                lang: this.CONFIG.lang,
                datasource: this.CONFIG.datasource,
                section: this.CONFIG.section
            }).then(function (json) {
                self.createTree(self.prepareAPIData(json));
            });
        }

    };

    TREE.prototype.prepareAPIData = function (json) {

        var payload = [];

        if (this.CONFIG.whitelist.length > 0) {
            payload = this.filterDataWhitelist(json);
        }
        else {
            payload = this.filterData(json);
        }

        return payload;
    };

    TREE.prototype.filterDataWhitelist = function (json) {

        /* Buffer. */
        var buffer = [],
            payload = [];

        for (var i = 0; i < json.data.length; i++) {

            /* Create group node. */
            if ($.inArray(json.data[i].GroupCode, this.CONFIG.whitelist) >= 0) {
                if ($.inArray(json.data[i].GroupCode, buffer) < 0) {
                    buffer.push(json.data[i].GroupCode);
                    payload.push({
                        id: json.data[i].GroupCode,
                        text: json.data[i].GroupName,
                        li_attr: {
                            id: json.data[i].GroupCode,
                            label: json.data[i].GroupName,
                            dateUpdate: json.data[i].DateUpdate
                        },
                        parent: '#'
                    });
                }

                /* Add domain node. */
                if ($.inArray(json.data[i].DomainCode, this.CONFIG.whitelist) >= 0) {
                    payload.push({
                        id: json.data[i].DomainCode,
                        text: json.data[i].DomainName,
                        li_attr: {
                            id: json.data[i].DomainCode,
                            label: json.data[i].DomainName,
                            dateUpdate: json.data[i].DateUpdate
                        },
                        parent: json.data[i].GroupCode
                    });
                }
            }
        }

        return payload;

    };

    TREE.prototype.filterData = function (json) {

        /* Buffer. */
        var buffer = [],
            payload = [];

        for (var i = 0; i < json.data.length; i++) {
            /* Create group node. */
            if ($.inArray(json.data[i].GroupCode, this.CONFIG.blacklist) < 0) {
                if ($.inArray(json.data[i].GroupCode, buffer) < 0) {
                    buffer.push(json.data[i].GroupCode);
                    payload.push({
                        id: json.data[i].GroupCode,
                        text: json.data[i].GroupName,
                        li_attr: {
                          id: json.data[i].GroupCode,
                          label: json.data[i].GroupName,
                          dateUpdate: json.data[i].DateUpdate
                        },
                        parent: '#'
                    });
                }

                /* Add domain node. */
                if ($.inArray(json.data[i].DomainCode, this.CONFIG.blacklist) < 0) {
                    payload.push({
                        id: json.data[i].DomainCode,
                        text: json.data[i].DomainName,
                        li_attr: {
                            id: json.data[i].DomainCode,
                            label: json.data[i].DomainName,
                            dateUpdate: json.data[i].DateUpdate
                        },
                        parent: json.data[i].GroupCode
                    });
                }
            }
        }

        return payload;

    },

    TREE.prototype.createTree = function (data) {

        var self = this;

        /* Init JSTree. */
        this.tree.jstree({

            plugins: ['unique', 'search', 'types', 'wholerow'],

            core: {
                data: data,
                themes: {
                    icons: false,
                    responsive: false
                }
            },

            search: {
                show_only_matches: true,
                close_opened_onclear: false
            }

        });

        /* Implement node selection. */
        this.tree.on('activate_node.jstree', function (e, data) {

            //log.info('activate_node.jstree')

            /* Fetch node. */
            var node = data.node;


            /* Generic click listener, or specific listeners for groups and domains. */
            if (self.CONFIG.callback.onClick) {
                if (node.parent === '#') {
                    node.parent === '#' && self.tree.jstree().is_open() ? self.tree.jstree().close_node(node) : self.tree.jstree().open_node(node);
                }
                if (self.CONFIG.callback.onClick) {
                    self.CONFIG.callback.onClick(self.getNodeAttributes(node));
                }
            } else {
                if (node.parent === '#') {
                    node.parent === '#' && self.tree.jstree().is_open() ? self.tree.jstree().close_node(node) : self.tree.jstree().open_node(node);
                    if (self.CONFIG.callback.onGroupClick) {
                        self.CONFIG.callback.onGroupClick(self.getNodeAttributes(node));
                    }
                } else {
                    if (self.CONFIG.callback.onDomainClick) {
                        self.CONFIG.callback.onDomainClick(self.getNodeAttributes(node));
                    }
                }
            }

        });

        /* Show required domain. */
        this.tree.on('ready.jstree', function (data) {

            //log.info('ready.jstree')

            log.info(data);

            /* set and select default code. */
            self.selectDefaultCode();

            // options
            if (self.CONFIG.options) {
                if (self.CONFIG.options.open_all) {
                    // open all tree nodes
                    self.tree.jstree("open_all");
                }
            }

            /* Invoke onTreeRendered function. */
            if (self.CONFIG.callback.onTreeRendered) {

                // TODO: fix workaround for default code
                var node = self.tree.jstree().get_selected(true);

                log.info(node)
                if (node !== undefined && node.length > 0) {
                    self.CONFIG.callback.onTreeRendered(self.getNodeAttributes(node[0]));
                }
            }

        });

        // added search
        if ( this.CONFIG.placeholder_search !== null) {
            this.$search = $(this.CONFIG.placeholder_search).length > 0 ? $(this.CONFIG.placeholder_search) : $("#" + this.CONFIG.placeholder_search)

            this.$search.keyup(function (e) {
                setTimeout(function () {
                    self.tree.jstree(true).search(self.$search.val());
                }, 250);
            });

        }

    };

    TREE.prototype.selectDefaultCode = function () {
        if (this.CONFIG.code) {
            this.CONFIG.default_code = this.CONFIG.code;
        } else if (this.CONFIG.domain) {
            this.CONFIG.default_code = this.CONFIG.domain;
        } else if (this.CONFIG.group) {
            this.CONFIG.default_code = this.CONFIG.group;
        } else {
            // TODO: no default selection
        }


        //log.info(this.CONFIG.code, this.CONFIG.default_code, this.tree.jstree())

        if (this.CONFIG.default_code) {
            if ( this.tree) {
                //log.info(this.CONFIG.default_code)
                try {
                    this.tree.jstree().select_node(this.CONFIG.default_code);
                    this.tree.jstree().open_node(this.CONFIG.default_code);
                }catch(e) {
                    log.error(e);
                }
            }
        }
    };

    TREE.prototype.getNodeAttributes = function (node) {

        // overriding the node attributes to in case add the label and/or text attributes on return
        if (!node.li_attr.hasOwnProperty('label')) {
            node.li_attr.label = node.text;
        }

        if (!node.li_attr.hasOwnProperty('text')) {
            node.li_attr.text = node.text;
        }

        return node.li_attr;

    };

    TREE.prototype.getCodeType = function () {
        var node = $('#' + this.tree.jstree('get_selected'));
        return this.tree.jstree().is_leaf(node) ? 'domain' : 'group';
    };

    TREE.prototype.destroy = function () {
        this.tree.jstree('destroy');
    };

    TREE.prototype.dispose = function () {
        this.destroy();
    };

    return TREE;

});