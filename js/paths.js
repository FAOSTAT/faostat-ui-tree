define(function() {

    var config = {
        paths: {
            FAOSTAT_UI_TREE: 'faostat-ui-tree'
        },
        shim: {
            jstree: {
                deps: ['jquery']
            }
        }
    };

    return config;

});