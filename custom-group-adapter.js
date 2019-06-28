$.fn.select2.amd.define("CustomResultsAdapter", [
    "select2/core",
    "select2/utils",
    "select2/options",
    "select2/results",
    "select2/dropdown/closeOnSelect",
    "select2/dropdown/search",
    "select2/dropdown"
], function (Select2, Utils, Options, Results, CloseOnSelect, Search, Dropdown) {

    Utils.Extend(CustomResults, Results);

    function CustomResults($element, options, dataAdapter) {

        options.options.data = createSequenceHierarchy(options.options.data);

        this.$element = $element;
        this.data = dataAdapter;
        this.options = options;

        Results.__super__.constructor.call(this);
    }

    function createSequenceHierarchy(addChildAttrData) {

        var newData = [];
        var tmpArr = [];
        var lv;
        var pk;
        var pp;
        var _currLevel = 0;
        var keepFirstLevel = 0;

        for (var i in addChildAttrData) {

            var v = addChildAttrData[i];

            // shift first blank data
            var shiftFirstCount = 0;
            if (!v.id) {
                shiftFirstCount = 1;
                continue;
            }
            i -= shiftFirstCount

            var k, p, search;

            if (i == 0) {
                keepFirstLevel = v.level;
            }
            if (v.level == keepFirstLevel) {

                if (tmpArr.length == 0) {
                    k = "" + v.level;
                    p = "-1";
                    tmpArr[_currLevel] = v.level;
                } else {
                    _currLevel = keepFirstLevel;
                    k = "" + (parseInt(tmpArr[_currLevel]) + 1);
                    p = "-1";
                    tmpArr[_currLevel] = k;
                }
            } else {
                if (v.level > lv) {
                    _currLevel++;
                    k = pk + "-" + _currLevel;
                    p = pk;
                    tmpArr[_currLevel] = k;
                }
                if (v.level == lv) {
                    k = pk;
                    p = pp;
                }
                if (v.level < lv) {
                    var _downLevel = _currLevel - v.level == 0 ? 1 : _currLevel - v.level;
                    _currLevel = _currLevel - _downLevel;
                    var ppp = parseInt(pp.split("-")[_currLevel]) + 1;
                    k = parseInt(pp.split("-")[_currLevel - 1]) + "-" + ppp;
                    p = tmpArr[_currLevel - 1];
                }
            }

            lv = v.level;
            pk = k;
            pp = p;

            if (i != 0
                && addChildAttrData[i - 1].level != addChildAttrData[i].level
                && addChildAttrData[i].level > addChildAttrData[i - 1].level) {
                addChildAttrData[i - 1].hasChild = true;
            }
            addChildAttrData[i].k = k;
            addChildAttrData[i].p = p;
            addChildAttrData[i].currLevel = _currLevel;
        }
        return addChildAttrData;
    }

    CustomResults.prototype.option = function (data) {

        var isSearching = $(".select2-search__field").val() == '' ? false : true;
        var collapseIcon = "+";
        if (isSearching) {
            collapseIcon = "-";
        }

        var option = Results.prototype.option.call(this, data);
        if (data.element == undefined) {
            return option;
        }

        var index = data.element.index;

        var hasChild;
        if (this.data.options.options.data[index] != undefined) {
            hasChild = this.data.options.options.data[index].hasChild;
        }

        // use customized data hierarchy
        var data = this.data.options.options.data[index];
        var level = 0;
        if (data && data.level !== undefined) {
            level = (data.level);
        }

        option.setAttribute("k", data.k);
        option.setAttribute("p", data.p);
        option.setAttribute("level", data.level);

        if (hasChild) {

            var aNode = document.createElement("a");

            aNode.setAttribute("id", level);

            var cssString = "margin-right: 5px; color:#8a589d; font-weight:bold; "
                + "font-size: 20px; "
                + "display: inline-block; "
                + "width: 15px; ";
            var spanNode = document.createElement("span");
            spanNode.setAttribute("style", cssString);
            // spanNode.appendChild(document.createTextNode("+"));
            spanNode.appendChild(document.createTextNode(collapseIcon));
            aNode.appendChild(spanNode);

            aNode.addEventListener('mouseup', function (evt) {
                evt.stopPropagation();
            });
            aNode.addEventListener('click', function (evt) {

                var currentId = $(this).attr("id");
                var currentOption = $(this).parents("li");
                var parentWrapperUl = $(this).parents("ul");

                var k = currentOption.attr("k");
                var checkCollapse = currentOption.find("span").html();
                if (checkCollapse == "+") {
                    currentOption.find("span").html("-");
                    parentWrapperUl.find("li[p=" + k + "]").show();
                } else {
                    currentOption.find("span").html("+");
                    hideNextLi(parentWrapperUl, currentOption.attr("k"));
                }

            });
            $(option).prepend(aNode);
        }

        if (data.level > 1) {
            option.setAttribute("style", "padding-left: " + (20 * data.level) + "px; display: none;");
        }

        $.data(option, 'data', data);
        return option;
    };

    function hideNextLi(ulObj, k) {
        var list = ulObj.find("li[p=" + k + "]");
        if (list.length == 0) {
            return false;
        }
        list.each(function () {
            $(this).hide();
            $(this).find("span").html("+");
            hideNextLi(ulObj, $(this).attr("k"));
        });
    }

    return CustomResults;

});