/*global define*/
define(['jquery',
    'loglevel',
    'underscore',
    'faostatapiclient',
    'faostat_commons',
    'jstree',
    'bootstrap-treeview'
], function ($, log, _, FAOSTATAPIClient, FAOSTATCommons) {

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

        this.CONFIG.lang_faostat = FAOSTATCommons.iso2faostat(this.CONFIG.lang);

        // legacy
        this.selectDefaultCode();

        if (this.CONFIG.custom) {
            // create a custom tree
            self.createTree(this.CONFIG.custom);
        }
        else {
            /* Fetch FAOSTAT groups and domains. */
            this.CONFIG.api.groupsanddomains({
                lang: this.CONFIG.lang,
                datasource: this.CONFIG.datasource
            }).then(function (json) {
                self.createTree(self.prepareAPIData(json));
            });
        }


    };

    TREE.prototype.prepareAPIData = function (json) {

        /* Buffer. */
        var buffer = [],
            payload = [],
            data = json.data,
            self = this;

        _.each(data, function(d) {
            //log.info(d);

            // TODO: remove it! temporary whitelist filter
            if (self.CONFIG.whitelist.length > 0) {
                if( $.inArray(d.code, self.CONFIG.whitelist) >= 0) {
                    if ($.inArray(d.code, buffer) < 0) {
                        buffer.push(d.code);
                        payload.push({
                            id: d.code,
                            text: d.label,
                            nodes: [],
                            state: {
                                expanded: (d.code === self.CONFIG.default_code) || (d.DomainCode === self.CONFIG.default_code),
                                selected: (d.code === self.CONFIG.default_code)
                            }
                        });
                    }else{
                        // TODO: do it better
                        _.each(payload, function(p) {
                            if(p.id === d.code) {
                                if (p.state.expanded === false) {
                                    p.state.expanded = (d.DomainCode === self.CONFIG.default_code);
                                }
                            }
                        });
                    }
                }

                /* Add domain node. */
                if ($.inArray(d.DomainCode, self.CONFIG.whitelist) >= 0) {
                    var c = _.findWhere(payload, {id: d.code});
                    c.nodes.push({
                        id: d.DomainCode,
                        text: d['DomainName' + self.CONFIG.lang_faostat],
                        state: {
                            expanded: (d.DomainCode === self.CONFIG.default_code),
                            selected: (d.DomainCode === self.CONFIG.default_code)
                        }
                    });
                }
            }

            // use the blacklist
            else {
                if ($.inArray(d.code, self.CONFIG.blacklist) < 0) {

                    if ($.inArray(d.code, buffer) < 0) {
                        buffer.push(d.code);
                        payload.push({
                            id: d.code,
                            text: d.label,
                            nodes: [],
                            state: {
                                expanded: (d.code === self.CONFIG.default_code) || (d.DomainCode === self.CONFIG.default_code),
                                selected: (d.code === self.CONFIG.default_code)
                            }
                        });
                    }else{
                        // TODO: do it better
                        _.each(payload, function(p) {
                            if(p.id === d.code) {
                                if (p.state.expanded === false) {
                                    p.state.expanded = (d.DomainCode === self.CONFIG.default_code);
                                }
                            }
                        });
                    }

                    /* Add domain node. */
                    if ($.inArray(d.DomainCode, self.CONFIG.blacklist) < 0) {
                        var c = _.findWhere(payload, {id: d.code});
                        c.nodes.push({
                            id: d.DomainCode,
                            text: d['DomainName' + self.CONFIG.lang_faostat],
                            state: {
                                expanded: (d.DomainCode === self.CONFIG.default_code),
                                selected: (d.DomainCode === self.CONFIG.default_code)
                            }
                        });
                    }
                }
            }

        });

        log.info(payload)
        log.info(this.CONFIG.default_code)


        return payload;
    };

    TREE.prototype.createTree = function (data) {

        var self = this;

        this.tree.treeview({
            showBorder: false,
            data: data,
            expandIcon: 'glyphicon glyphicon-chevron-right',
            collapseIcon: 'glyphicon glyphicon-chevron-down'
        });

        //this.tree.treeview('collapseAll', { silent: true });

        /*        this.tree.treeview('search', [ 'Parent', {
         ignoreCase: true,     // case insensitive
         exactMatch: false,    // like or equals
         revealResults: true,  // reveal matching nodes
         }]);*/


        if (typeof this.CONFIG.callback.onTreeRendered === 'function') {
            var node = this.tree.treeview('getSelected');
            if (node !== undefined && node.length > 0) {
                this.CONFIG.callback.onTreeRendered(
                    {
                        id: node[0].id,
                        label: node[0].text
                    })
            }
        }

        // selection binding
        this.tree.on('nodeSelected', function(event, data) {

            // expand node on selection
            self.tree.treeview('expandNode', data.nodeId);

            /* Generic click listener, or specific listeners for groups and domains. */
            if (self.CONFIG.callback.onClick) {
                if (self.CONFIG.callback.onClick) {
                    self.CONFIG.callback.onClick({id: data.id, label: data.text});
                }
            } else {
                if (data.nodes) {
                    if (self.CONFIG.callback.onGroupClick) {
                        self.CONFIG.callback.onGroupClick({id: data.id, label: data.text});
                    }
                } else {
                    if (self.CONFIG.callback.onDomainClick) {
                        self.CONFIG.callback.onDomainClick({id: data.id, label: data.text});
                    }
                }
            }

        });

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

    };

    TREE.prototype.getCodeType = function () {
        var node = this.tree.treeview('getSelected')[0];
        return (node.nodes)? 'group' : 'domain';
    };

    TREE.prototype.destroy = function () {
       // this.tree.jstree("destroy");
    };

    TREE.prototype.dispose = function () {
        // this.tree.jstree("destroy");
    };

    return TREE;

});