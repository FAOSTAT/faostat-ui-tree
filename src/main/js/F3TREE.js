var F3TREE = (function() {

    var CONFIG = {
        lang            :   'E',
        lang_ISO2       :   'EN',
        I18N_prefix     :   '',
        prefix          :   '',
        placeholderID   :   '',
        labelID         :   '_default',
        min_height      :   '20px',
        delay           :   250,
        box_distance    :   16,
        mode1_open      :   false,
        mode1_height    :   '348px',
        mode1_width     :   '298px',
        mode2_open      :   false,
        mode2_height    :   '148px',
        mode2_width     :   '398px',
        mode3_open      :   false,
        mode3_height    :   '248px',
        mode3_width     :   '248px',
        v_tree_height   :   '346px',
        v_tree_width    :   '296px',
        v_tree_data     :   null
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

        /* Load vertical tree data. */
        $.getJSON('/faostat-tree/config/FAOSTAT_New.json', function (data) {
            F3TREE.CONFIG.v_tree_data = data;
        })

        /* Create the placeholder. */
        createPlaceholder();

    };

    function createPlaceholder() {
        var s = '<div class="placeholder">'
        s += '<h1 style="display: inline-block;" class="placeholder h1">';
        s += $.i18n.prop(F3TREE.CONFIG.labelID);
        s += '</h1>';
        s += '<div class="h-space">&nbsp;</div>';
        s += '<img id="vertical" onclick="F3TREE.mode1();" src="images/mode1.png" class="image" title="' + $.i18n.prop('_vertical_tree') + '">';
        s += '<div class="h-space">&nbsp;</div>';
        s += '<img id="horizontal" onclick="F3TREE.mode2();" src="images/mode2.png" class="image" title="' + $.i18n.prop('_horizontal_tree') + '">';
        s += '<div class="h-space">&nbsp;</div>';
        s += '<img id="alphabetical" onclick="F3TREE.mode3();" src="images/mode3.png" class="image" title="' + $.i18n.prop('_alphabetical_order') + '">';
        s += '</div>';
        document.getElementById(F3TREE.CONFIG.placeholderID).innerHTML = s;
    };

    function mode1() {
        if (F3TREE.CONFIG.mode1_open == true) {
            F3TREE.CONFIG.mode1_open = false;
            close();
        } else {
            F3TREE.CONFIG.mode1_open = true;
            open('vertical', F3TREE.CONFIG.mode1_width, F3TREE.CONFIG.mode1_height, buildVerticalTree);
        }
    };

    function mode2() {
        if (F3TREE.CONFIG.mode2_open == true) {
            F3TREE.CONFIG.mode2_open = false;
            close();
        } else {
            F3TREE.CONFIG.mode2_open = true;
            open('horizontal', F3TREE.CONFIG.mode2_width, F3TREE.CONFIG.mode2_height, buildHorizontalTree);
        }
    };

    function mode3() {
        if (F3TREE.CONFIG.mode3_open == true) {
            F3TREE.CONFIG.mode3_open = false;
            close();
        } else {
            F3TREE.CONFIG.mode3_open = true;
            open('alphabetical', F3TREE.CONFIG.mode3_width, F3TREE.CONFIG.mode3_height, buildAlphabeticalTree);
        }
    };

    function open(iconID, boxWidth, boxHeight, callback) {
        createTreeBox();
        var position = $('#' + iconID).position();
        var top = position.top;
        var left = position.left;
        var height = px2int($('#fnx-tree-box').css('height'));
        var width = px2int($('#fnx-tree-box').css('width'));
        var icon_width = px2int($('.image').css('width'));
        var icon_height = px2int($('.image').css('height'));
        $('#fnx-tree-box').css('display', 'inline');
        $('#fnx-tree-box').css('top', top);
        $('#fnx-tree-box').css('left', (icon_width / 2) + left - (width / 2));
        $('#fnx-tree-box').animate(
            {
                top: '+=' + (parseInt(F3TREE.CONFIG.box_distance) + parseInt(height)) + 'px'
            }, F3TREE.CONFIG.delay).animate(
            {
                width   : boxWidth,
                height  : boxHeight
            }, F3TREE.CONFIG.delay, function() {
                callback();
            });
    };

    function close() {
        var height = px2int(F3TREE.CONFIG.min_height);
        $('#fnx-tree-box').animate(
            {
                height: F3TREE.CONFIG.min_height
            }, F3TREE.CONFIG.delay, function() {
                destroyTreeBox();
            }).animate(
            {
                top: '-=' + (parseInt(F3TREE.CONFIG.box_distance) + parseInt(height)) + 'px'
            }, F3TREE.CONFIG.delay);
    };

    function createTreeBox() {
        $('#' + F3TREE.CONFIG.placeholderID).append('<div id="fnx-tree-box" class="fnx-tree-box"><div id="vertical_tree"></div></div>');
    };

    function destroyTreeBox() {
        $('#fnx-tree-box').remove();
    };

    function px2int(s) {
        return s.substring(0, s.indexOf('px'));
    }

    function buildHorizontalTree() {
        alert('buildHorizontalTree');
    };

    function buildAlphabeticalTree() {
        alert('buildAlphabeticalTree');
    };

    function buildVerticalTree() {
        var source = {
            datatype: 'json',
            datafields: [
                {name: 'value'},
                {name: 'name'},
                {name: 'parent'}
            ],
            id: 'value',
            localdata: F3TREE.CONFIG.v_tree_data
        };
        var dataAdapter = new $.jqx.dataAdapter(source);
        dataAdapter.dataBind();
        var records = dataAdapter.getRecordsHierarchy('value', 'parent', 'items', [{name: 'name', map: 'label'}]);
        $('#vertical_tree').jqxTree({
            source  :   records,
            width   :   F3TREE.CONFIG.v_tree_width,
            height  :   F3TREE.CONFIG.v_tree_height
        });
    };

    return {
        CONFIG  :   CONFIG,
        init    :   init,
        mode1   :   mode1,
        mode2   :   mode2,
        mode3   :   mode3
    };

})();