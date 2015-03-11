define(function() {

    var config = {
        paths: {
            FAOSTAT_TREE: 'faostat-tree',
            faostat_tree: 'faostat-tree'
        },
        shim: {
            jstree: {
                deps: ['jquery']
            }
        }
    };

    return config;

});