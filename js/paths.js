define(function() {

    var config = {
        paths: {
            FAOSTAT_UI_TREE: 'start',
            sweetAlert: '{FENIX_CDN}/js/sweet-alert/0.5.0/sweet-alert.min',
            jstree: '{FENIX_CDN}/js/jstree/3.0.8/dist/jstree.min'
        },
        shim: {
            jstree: {
                deps: ['jquery']
            }
        }
    };

    return config;

});