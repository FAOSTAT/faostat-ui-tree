var F3TREE = (function() {

    var CONFIG = {
        lang            :   'E',
        lang_ISO2       :   'EN',
        I18N_prefix     :   '',
        placeholderID   :   '',
        labelID         :   '_default'
    };

    function init(config) {

        /* Store user preferences. */
        F3TREE.CONFIG = $.extend(F3TREE.CONFIG, config);

        /* Set ISO2 language code. */
        switch (F3TREE.CONFIG.lang) {
            case 'F': F3TREE.CONFIG.lang_ISO2 = 'FR'; break;
            case 'S': F3TREE.CONFIG.lang_ISO2 = 'ES'; break;
            default : F3TREE.CONFIG.lang_ISO2 = 'EN'; break;
        }

        /* Initiate multi-language. */
        $.i18n.properties({
            name        :   'I18N',
            mode        :   'both',
            path        :   F3TREE.CONFIG.I18N_prefix + 'I18N/',
            language    :   F3TREE.CONFIG.lang_ISO2
        });

        /* Create the placeholder. */
        var s = '<div class="placeholder">'
        s += '<h1 style="display: inline-block;" class="placeholder h1">';
        s += $.i18n.prop(F3TREE.CONFIG.labelID);
        s += '</h1>';
        s += '<div class="h-space">&nbsp;</div>';
        s += '<img onclick="F3TREE.mode1();" src="images/mode1.png" class="image" title="' + $.i18n.prop('_vertical_tree') + '">';
        s += '<div class="h-space">&nbsp;</div>';
        s += '<img onclick="F3TREE.mode2();" src="images/mode2.png" class="image" title="' + $.i18n.prop('_horizontal_tree') + '">';
        s += '<div class="h-space">&nbsp;</div>';
        s += '<img onclick="F3TREE.mode3();" src="images/mode3.png" class="image" title="' + $.i18n.prop('_alphabetical_order') + '">';
        s += '</div>';
        document.getElementById(F3TREE.CONFIG.placeholderID).innerHTML = s;

    };

    function mode1() {
        alert('1');
    };

    function mode2() {
        alert('2');
    };

    function mode3() {
        alert('3');
    };

    return {
        CONFIG  :   CONFIG,
        init    :   init,
        mode1   :   mode1,
        mode2   :   mode2,
        mode3   :   mode3
    };

})();