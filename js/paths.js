define(function() {

    var config = {
        paths: {
            FAOSTAT_TREE: 'faostat-tree'
        },
        shim: {
            jstree: {
                deps: ['jquery']
            }
        }
    };

    return config;

});