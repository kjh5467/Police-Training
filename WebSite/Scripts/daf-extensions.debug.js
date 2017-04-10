/*! 
 * Data Aquarium Framework - Extensions for Desktop UI
 * Copyright 2008-2017 Code On Time LLC; Licensed MIT; http://codeontime.com/license
 */
(function () {

    var _web = Web,
        $body = $('body'),
        $window = $(window);

    _web.SmartTag = function () {
        this.initialize();
    }

    _web.SmartTag.prototype = {
        isVisible: function () {
            return this._visible == true;
        },
        initialize: function () {
            this._visible = false;
        },
        _hideMenu: function () {
            //if (this._skipHideMenu) {
            //    this._skipHideMenu = false;
            //    return;
            //}
            var tag = this._tag;
            if (tag && tag.menu) {
                $(tag.menu).menu('destroy').remove();
                $(tag.markerSelector).removeClass(tag.markerClassName);
                this.unmark();
                tag.menu = null;
                tag.items = null;
            }
        },
        _createTag: function () {
            var that = this;
            var hoverFunc = function () {
            }
            var unhoverFunc = function (event) {
                _web.SmartTag._instance.hide(event);

            }
            var uniqueId = (new Date().getTime() * 10000) + 621355968000000000;
            var tagClickFunc = function () {
                that.open();
                return false;
            }
            var tag = {
                left: $('<div class="web-smart-tag left"></div>').appendTo($body).css({ position: 'absolute', width: '1px' }).hide().hover(hoverFunc, unhoverFunc).click(tagClickFunc),
                top: $('<div class="web-smart-tag top"></div>').appendTo($body).css({ position: 'absolute', height: '1px' }).hide().hover(hoverFunc, unhoverFunc).click(tagClickFunc),
                right: $('<div class="web-smart-tag right"></div>').appendTo($body).css({ position: 'absolute', width: '1px' }).hide().hover(hoverFunc, unhoverFunc).click(tagClickFunc),
                bottom: $('<div class="web-smart-tag bottom"></div>').appendTo($body).css({ position: 'absolute', height: '1px' }).hide().hover(hoverFunc, unhoverFunc).click(tagClickFunc),
                arrow: $('<div class="web-smart-tag arrow"><span class="button"></span></div>').appendTo($body).css({ position: 'absolute' }).hide().hover(hoverFunc, unhoverFunc).click(tagClickFunc),
                className: null,
                uniqueClassName: 'st-' + uniqueId,
                markerClassName: 'm-' + uniqueId
            };
            tag.selector = '.' + tag.uniqueClassName;
            tag.markerSelector = '.' + tag.markerClassName;
            $(document).click(function (event) {
                //if ($(event.target).closest('ul.web-smart-tag.menu').length == 0)
                that._hideMenu();
            });

            return tag;
        },
        exec: function (event) {
            var tag = this._tag;
            if (!tag._callback) return;
            var clickTarget = $(tag.selector);
            var result = tag._callback(clickTarget);
            if (result) {
                this._hideMenu();
                result[0].select();
            }
        },
        open: function (event) {
            if (event && !$(event.currentTarget).is('.smart-tag'))
                return;
            var that = this;
            var tag = that._tag;
            if (!tag._callback) return;
            var clickTarget = $(tag.selector);
            var result = tag._callback(clickTarget);
            if (result) {
                var ownerOfMenu = clickTarget.is(tag.markerSelector);
                if (tag.menu)
                    that._hideMenu();
                if (!ownerOfMenu) {
                    clickTarget.addClass(tag.markerClassName);
                    tag.items = result;
                    var taggedElement = $(tag.selector);
                    var menu = tag.menu = that._buildMenu(result, $([]), 0);
                    menu.menu({
                        select: function (event, ui) {
                            var path = $(ui.item).data('path');
                            var items = tag.items;
                            var selectedItem = null;
                            for (var i = 0; i < path.length; i++) {
                                selectedItem = items[path[i]];
                                if (selectedItem.children)
                                    items = selectedItem.children;
                            }
                            //if (!selectedItem.select) {
                            //    that._skipHideMenu = true;
                            //    return false;
                            //}
                            //else
                            //    selectedItem.select();
                            if (!selectedItem.select)
                                return false;
                            that._hideMenu();
                            selectedItem.select();
                        }
                    })
                    .position({ my: 'left top', at: 'left bottom', of: taggedElement })
                    var tagWidth = taggedElement.outerWidth();
                    if (tagWidth > menu.outerWidth())
                        menu.outerWidth(tagWidth);
                    // position and resize the menu when needed
                    var menuPos = taggedElement.offset();
                    var windowLeft = $window.scrollLeft();
                    var windowWidth = $window.width();
                    var menuWidth = menu.outerWidth();
                    if (menuPos.left + menuWidth > windowLeft + windowWidth) {
                        menu.position({ my: 'left top', at: String.format('left-{0} bottom', menuWidth - ((windowLeft + windowWidth) - menuPos.left)), of: taggedElement, collision: 'none' });
                        menuPos = menu.offset();
                    }
                    var menuHeight = menu.outerHeight();
                    var windowTop = $window.scrollTop();
                    var windowBottom = windowTop + $window.height();
                    if (menuPos.top + menuHeight > windowBottom) {
                        // determine space above and below
                        var tagPos = taggedElement.offset();
                        var spaceAbove = tagPos.top - windowTop;
                        var spaceBelow = windowBottom - tagPos.top + taggedElement.outerHeight();
                        if (spaceAbove > spaceBelow) {
                            menu.outerHeight(menuHeight > spaceAbove ? spaceAbove : menuHeight);
                            menu.position({ my: 'left bottom', at: 'left top', of: tag.selector });
                        }
                        else
                            menu.outerHeight(windowBottom - menuPos.top);
                        menu.css('overflow', 'auto');
                    }
                    menu.find('a:first').focus();

                }
            }
        },
        _buildMenu: function (items, path, depth) {
            var that = this;
            var menu = $(String.format('<ul class="web-smart-tag menu level{0}">', depth));
            if (path.length == 0)
                menu.appendTo($body)
            $(items).each(function (index) {
                var item = this;
                if (!item.text && item.select)
                    return;
                var itemPath = path.add(index);
                var li = $('<li></li>').appendTo(menu).data('path', itemPath);
                if (item.text)
                    $('<a href="javascript:"><span class="outer"><span class="inner"></span></span></a>')
                        .appendTo(li)
                        .find('span.inner')
                        .text(item.text);
                else
                    $('<div class="divider"></div>').appendTo(li);
                if (item.checked)
                    li.addClass('selected');
                if (item.icon)
                    li.addClass(item.icon);
                if (item.children)
                    that._buildMenu(item.children, itemPath).appendTo(li);
            });
            return menu;
        },
        show: function (over, className, container, callback) {
            if (this._paused == true)
                return;
            var tag = this._tag;
            if (!tag)
                tag = this._tag = this._createTag();
            tag._callback = null;

            if (className) {
                var sameClass = tag.className == className;
                var removeOldClass = tag.className && !sameClass;
                if (removeOldClass)
                    tag.left.removeClass(tag.className);
                if (!sameClass)
                    tag.left.addClass(className)
                if (removeOldClass)
                    tag.top.removeClass(tag.className);
                if (!sameClass)
                    tag.top.addClass(className);
                if (removeOldClass)
                    tag.right.removeClass(tag.className);
                if (!sameClass)
                    tag.right.addClass(className);
                if (removeOldClass)
                    tag.bottom.removeClass(tag.className);
                if (!sameClass)
                    tag.bottom.addClass(className);
                if (removeOldClass)
                    tag.arrow.removeClass(tag.className);
                if (!sameClass)
                    tag.arrow.addClass(className);
                tag.className = className;
            }
            this._visible = true;
            var element = $(over).addClass(tag.uniqueClassName).addClass('smart-tag');
            var tagWidth = element.outerWidth();
            var tagHeight = element.outerHeight() - 1;
            var arrowHOffset = -1;
            var hDelta = 0;
            if (element.is('.ui-resizable'))
                hDelta = 3;
            tagWidth -= hDelta;
            arrowHOffset -= hDelta;
            if (container) {
                tag.containerSelector = '#' + container.attr('id');
                var cPos = container.offset();
                var cWidth = container.outerWidth();
                var cRight = cPos.left + cWidth - 1 - 16;
                var tPos = element.offset();
                if (tPos.left + tagWidth - 1 > cRight) {
                    var visibleTagWidth = cRight - tPos.left;
                    if (visibleTagWidth < 20) {
                        this.hide();
                        return;
                    }
                    else {
                        arrowHOffset = visibleTagWidth - tagWidth;
                        tagWidth = visibleTagWidth;
                    }
                }
                tag.width = tagWidth;
            }
            tag.left.height(tagHeight).show().position({ my: 'left top', at: 'left top', of: element, collision: 'none' });
            tag.top.width(tagWidth).show().position({ my: 'left top', at: 'left top', of: element, collision: 'none' });
            tag.right.height(tagHeight).show().position({ my: 'left top', at: String.format('right{0} top', arrowHOffset), of: element, collision: 'none' });
            tag.bottom.width(tagWidth).show().position({ my: 'left top', at: 'left bottom-1', of: element, collision: 'none' });
            tag.arrow.height(tagHeight).show().position({ my: 'right top', at: String.format('right{0} top', arrowHOffset), of: element, collision: 'none' });
            tag._callback = callback;
        },
        is: function (element) {
            if (!this._visible)
                return false;
            var tag = this._tag;
            return tag.left[0] == element || tag.top[0] == element || tag.right[0] == element || tag.bottom[0] == element || tag.arrow[0] == element;
        },
        hide: function (event) {
            if (this._paused == true)
                return;

            //if (!this._visible)
            //    return;

            var over = null;
            if (event) {
                over = event.relatedTarget;
                if (!over)
                    over = event.toElement;
            }

            var tag = this._tag;
            if (over && tag) {
                var $toElement = $(over);
                if (this.is(over) || $toElement.is(tag.selector))
                    return;
            }
            this._visible = false;
            if (tag) {
                this.mark();
                tag.left.hide();
                tag.top.hide();
                tag.right.hide();
                tag.bottom.hide();
                tag.arrow.hide();
                $(tag.selector).removeClass(tag.uniqueClassName).removeClass('smart-tag');
            }
        },
        pause: function () {
            this.hide();
            this._hideMenu();
            this._paused = true;
        },
        resume: function () {
            this._paused = false;
        },
        mark: function () {
            var tag = this._tag;
            if (!tag) return;
            var element = $(tag.markerSelector);
            if (element.length == 0) return;
            var marker = this._marker;
            if (!marker)
                marker = this._marker = this._createMarker();
            if (!marker.visible) {
                marker.visible = true;
                marker.className = tag.className;
                marker.containerSelector = tag.containerSelector;
                marker._callback = tag._callback;
                // show the marker
                var tagWidth = element.outerWidth();
                var tagHeight = element.outerHeight() - 1;
                var arrowHOffset = -1;
                var hDelta = 0;
                if (element.is('.ui-resizable'))
                    hDelta = 3;
                tagWidth -= hDelta;
                arrowHOffset -= hDelta;
                if (tag.width < tagWidth) {
                    arrowHOffset = tag.width - tagWidth;
                    tagWidth = tag.width;
                }
                marker.left.addClass(tag.className).height(tagHeight).show().position({ my: 'left top', at: 'left top', of: element, collision: 'none' });
                marker.top.addClass(tag.className).width(tagWidth).show().position({ my: 'left top', at: 'left top', of: element, collision: 'none' });
                marker.right.addClass(tag.className).height(tagHeight).show().position({ my: 'left top', at: String.format('right{0} top', arrowHOffset), of: element, collision: 'none' });
                marker.bottom.addClass(tag.className).width(tagWidth).show().position({ my: 'left top', at: 'left bottom-1', of: element, collision: 'none' });
                marker.arrow.addClass(tag.className).height(tagHeight).show().position({ my: 'right top', at: String.format('right{0} top', arrowHOffset), of: element, collision: 'none' });
            }
        },
        _createMarker: function () {
            var that = this;
            var marker = this._marker;
            var tag = this._tag;
            var hoverFunc = function () {
                that.unmark();
                that.show($(tag.markerSelector), marker.className, $(marker.containerSelector), marker._callback);
            }
            var unhoverFunc = function (event) {
            }
            if (!marker)
                marker = {
                    left: $('<div class="web-smart-tag left marker"></div>').appendTo($body).css({ position: 'absolute', width: '1px' }).hide().hover(hoverFunc, unhoverFunc),
                    top: $('<div class="web-smart-tag top marker"></div>').appendTo($body).css({ position: 'absolute', height: '1px' }).hide().hover(hoverFunc, unhoverFunc),
                    right: $('<div class="web-smart-tag right marker"></div>').appendTo($body).css({ position: 'absolute', width: '1px' }).hide().hover(hoverFunc, unhoverFunc),
                    bottom: $('<div class="web-smart-tag bottom marker"></div>').appendTo($body).css({ position: 'absolute', height: '1px' }).hide().hover(hoverFunc, unhoverFunc),
                    arrow: $('<div class="web-smart-tag arrow marker"><span class="button"></span></div>').appendTo($body).css({ position: 'absolute' }).hide().hover(hoverFunc, unhoverFunc)
                };
            return marker;
        },
        unmark: function () {
            var marker = this._marker;
            if (marker && marker.visible) {
                marker.visible = false;
                marker.left.hide().removeClass(marker.className);
                marker.top.hide().removeClass(marker.className);
                marker.right.hide().removeClass(marker.className);
                marker.bottom.hide().removeClass(marker.className);
                marker.arrow.hide().removeClass(marker.className);
            }
        }
    }

    _web.SmartTag._instance = new _web.SmartTag();


    jQuery.fn.smartTag = function (selector, options /*container, itemEnumerator, test*/) {
        /// <summary>
        ///     Attaches a smart tag to elements in the queue
        ///     &#10;    1.1 - jQuery.smartTag(className, options)
        ///     &#10;Executes a smart tag method.
        ///     &#10;
        ///     &#10;    2.1 - jQuery.smartTag(method) 
        /// </summary>
        /// <param name="selector" type="String">
        ///     1. The CSS class name associated with the smart tag. 2. The name of the method.
        /// </param>
        /// <param name="options" type="Function">
        ///     A list of options defining 'container', 'items' function, 'test' function, and 'select' function.
        /// </param>
        /// <param name="container" type="jQuery">
        ///     A container that restricts visibility of the smart tag.
        /// </param>
        /// <param name="itemEnumerator" type="Function">
        ///     A function returning a list of smart tag menu items.
        /// </param>
        /// <param name="test" type="Function">
        ///     A function that determines if the smart must be activated.
        /// </param>
        /// <returns type="jQuery" />
        var args = arguments;
        var instance = _web.SmartTag._instance;
        if (args.length == 2) {
            this.hover(
                    function () {
                        var showTag = true;
                        if (options.test)
                            showTag = options.test();
                        if (showTag)
                            instance.show(this, selector, options.container, options.items);
                    },
                    function (event) {
                        instance.hide(event);
                    }
                )
                .click(function (event) {
                    var $target = $(event.target);
                    if ($target.is('.node-button,:input'))
                        return true;
                    if (options.select)
                        options.select();
                    if ($target.is('.button,.status'))
                        instance.exec(event);
                    else
                        instance.open(event);
                    return false;
                });
        }
        else {
            switch (selector) {
                case 'pause':
                    instance.pause();
                    break;
                case 'resume':
                    instance.resume();
                    instance.hide();
                    break;
                case 'hide':
                    instance.hide();
                    instance._hideMenu();
                    break;
                case 'destroy':
                    this.off('mouseenter mouseleave click');
                    break;
                default:
                    throw Error(String.format('Method "{0}" is not supported', selector));
            }
        }
        return this;
    }

    /* implementation of extensions */

    _web.DataView.Extensions = {}

    $(document)
        .mousedown(function (event) {
            var activated = false;
            var $target = $(event.target);
            if ($target.parent().length == 0)
                return;
            var container = $target.closest('.resizable-data-view');
            if (container.length == 0)
                container = $target.closest('.DataViewContainer').parent().children('.resizable-data-view');
            if (container.length == 0 && $target.closest('.HoverMenu,.web-smart-tag').length > 0)
                return;
            if (container.length > 0) {
                var dataViewId = container.attr('id');
                dataViewId = dataViewId ? dataViewId.match(/^(.+?)_[a-z]+$/i) : null;
                dataViewId = dataViewId ? dataViewId[1] : null;
                var dataView = dataViewId ? $find(dataViewId) : null;
                if (dataView) {
                    _web.DataView.Extensions.active(dataView.extension(), true);
                    activated = true;
                }
            }
            if (!activated)
                _web.DataView.Extensions.active(null, false);
        })
        .keydown(function (event) {
            var extension = _web.DataView.Extensions.activeTarget(event);
            if (extension)
                extension.keydown(event);
        })
        .keyup(function (event) {
            var extension = _web.DataView.Extensions.activeTarget(event);
            if (extension)
                extension.keyup(event);
        })
        .keypress(function (event) {
            var extension = _web.DataView.Extensions.activeTarget(event);
            if (extension)
                extension.keydown(event);
        });

    _web.DataView.Extensions.activeTarget = function (event) {
        var extension = _web.DataView.Extensions.active();
        if (extension && $(event.target).closest('input,select,textarea,.HoverMenu,.web-smart-tag,.Group,.horizontal-scroll-bar-wrap,.vertical-scroll-bar-wrap').length == 0)
            return extension;
        return null;
    }

    _web.DataView.Extensions.active = function (extension, activate) {
        if (arguments.length == 0) {
            var activeExtensionId = _web.DataView._activeExtensionId;
            if (!activeExtensionId)
                return null;
            var activeDataView = $find(activeExtensionId);
            return activeDataView ? activeDataView.extension() : null;
        }
        if (extension == 0) return;
        if (activate == null)
            return _web.DataView._activeExtensionId == extension.dataView().get_id();
        else {
            if (activate && this.active(extension))
                return;
            var activeExtension = this.active();
            if (activate) {
                if (activeExtension)
                    activeExtension.deactivate();
                _web.DataView._activeExtensionId = extension.dataView().get_id();
                extension.activate();
            }
            else {
                _web.DataView._activeExtensionId = null;
                if (activeExtension)
                    activeExtension.deactivate();
                if (extension)
                    extension.deactivate();
            }
        }
    }

    if (Sys.Browser.agent != Sys.Browser.InternetExplorer || Sys.Browser.version > 7)
        _web.DataView.Extensions.DataSheet = function (dataView) {
            return new _web.DataView.DataSheet(dataView);
        }

    _web.DataView.DataSheet = function (dataView) {
        this.dataView(dataView);
    }

    _web.DataView.DataSheet.prototype = {
        initialize: function () {
            var dataView = this._dataView;
            this._rowHeight = 15;
            for (var i = 0; i < dataView._fields.length; i++)
                if (dataView._fields[i].OnDemand) {
                    this._rowHeight = 75;
                }
            this._headerHeight = 15;
            this._createContainer();
            this._frozenFieldName = dataView.readContext('dataSheetFrozenField');
        },
        options: function () {
            return { actionBar: true, description: true };
        },
        _createContainer: function () {
            var dataView = this._dataView;
            var id = this._id = dataView.get_id() + '_DataSheet';
            this._selector = '#' + id;
            var element = dataView._element;
            this.$that().remove();
            var container = $('<div></div>').attr('id', id).addClass('container data-sheet resizable-data-view').appendTo(element);
            if (this.showRowNumber())
                container.addClass('show-row-numbers');
        },
        _reset: function () {
            this._refreshSpeed = null;
            $().smartTag('hide');
            var cellMap = this._cellMap;
            var gapMap = this._gapMap;
            var headerMap = this._headerMap;
            var rowMap = this._rowMap;
            for (var i = 0; i < cellMap.length; i++) {
                delete cellMap[i];
                if (gapMap)
                    delete gapMap[i];
                if (headerMap)
                    delete headerMap[i];
                if (rowMap)
                    delete rowMap[i];
            }
            this._$horizontalScrollbar.slider('destroy');
            this._$verticalScrollbar.slider('destroy');
            this.$that().find('.header-cell,.data-cell,span.showing').smartTag('destroy');
            this._$dataRows.unbind();
            this._viewId = null;
            this._dataView._lastExtension = null;
            this._cursor = null;
            this.rowRange(null);
        },
        rowRange: function (name, value) {
            if (name == 'current') {
                if (!value)
                    return this._currentRowRange;
                this._lastRowRange = this._currentRowRange;
                this._currentRowRange = value;
            }
            else if (name == 'last') {
                if (!value)
                    return this._lastRowRange;
                this._lastRowRange = value;
            }
            else {
                this._lastRowRange = null;
                this._currentRowRange = null;
            }
        },
        rowHeight: function () {
            return this._rowHeight;
        },
        headerHeight: function () {
            return this._headerHeight;
        },
        charWidth: function (columns) {
            if (columns == 0)
                columns = 15;
            var wdvds = _web.DataView.DataSheet;
            var charWidth = wdvds._charWidth;
            if (charWidth == null) {
                var text = 'abcdefghijklmnopqrstuvwzyz0123456789';
                var testRow = $('<div class="data-row"><div class="data-cell"><div class="data-item"></div></div></div>').appendTo(this.$that());
                var textWidth = testRow.find('.data-item').text(text).width();
                wdvds._charWidth = charWidth = Math.ceil(textWidth / text.length);
                testRow.remove();
            }
            return columns ? charWidth * columns : charWidth;
        },
        $that: function (selector) {
            var sel = this._selector;
            if (selector) {
                if (selector.charAt(0) != '_')
                    selector = ' ' + selector;
                sel += selector;
            }
            return $(sel);
        },
        dataView: function (owner) {
            if (owner == null)
                return this._dataView;
            else
                this._dataView = owner;
        },
        show: function () {
            var dataView = this._dataView;
            var viewId = dataView.get_viewId();
            if (this._viewId != viewId || this.pageSize() != this._lastPageSize) {
                this._viewId = viewId;
                this._allocateCells();
            }
            else
                this.$that().show();
            this._$sliderPageInfo.hide();
            if (this.lookup()) {
                var $dataSheet = this.$that();
                var headerText = $dataSheet.parents('.ModalPlaceholder').find('.HeaderText table:first');
                headerText.width('100%');
                var lastHeaderCell = this.$that('.header-row .header-cell:last');
                var p = lastHeaderCell.position()
                var w = lastHeaderCell.outerWidth();
                var expectedWidth = p.left + w;
                var dataSheetWidth = $dataSheet.outerWidth();
                var maxWidth = $window.width() / 5 * 4;
                if (expectedWidth > maxWidth)
                    expectedWidth = maxWidth;
                var delta = maxWidth - dataSheetWidth;
                if (delta > 0) {
                    headerText.parent().outerWidth(headerText.outerWidth() + delta);
                    this.autoSize(false);
                }
                this.cursor(true);
            }
            this.autoSize(false);
        },
        hide: function () {
            this.$that().hide();
        },
        activate: function () {
            this.cursor(true);
        },
        deactivate: function () {
            this.cursor(false);
        },
        keydown: function (event, force) {
            if (this._skipKeyDown) {
                this._skipKeyDown = false;
                return;
            }
            var handled = false;
            if (this.busy())
                handled = true;
            else {
                var horizontalScrollbar = this._$horizontalScrollbar;
                var cursor = this.cursor();
                var totalRowCount = this.totalRowCount();
                var topRowIndex = this.topRowIndex();
                var pageSize = this.pageSize();
                var fields = this.dataView()._fields;
                var maxRightColIndex = fields.length - 1;
                var col = cursor.col;
                var row = cursor.row;
                var key = null;
                switch (event.keyCode) {
                    case 40:
                        key = 'Down';
                        break;
                    case 38:
                        key = 'Up';
                        break;
                    case 39:
                        key = 'Right';
                        break;
                    case 37:
                        key = 'Left';
                        break;
                    case 34:
                        key = 'PageDown';
                        break;
                    case 33:
                        key = 'PageUp';
                        break;
                    case 13:
                        key = event.shiftKey ? 'ShiftEnter' : 'Enter';
                        break;
                    case 9:
                        key = event.shiftKey ? 'ShiftTab' : 'Tab';
                        break;
                    case 36:
                        key = event.ctrlKey ? 'CtrlHome' : 'Home';
                        break;
                    case 35:
                        key = event.ctrlKey ? 'CtrlEnd' : 'End';
                        break;
                }
                if (key && !force && navigator.userAgent.match(/webkit/)/* $.browser.webkit*/) {
                    var sameKey = this._lastKey == key;
                    this._lastKey = key;
                    var t = new Date().getTime();
                    var speed = this._refreshSpeed;
                    speed = speed ? speed * 1.5 : 100;
                    if (sameKey && t - this._lastKeyTime < speed) {
                        key = null;
                        handled = true;
                    }
                    else
                        this._lastKeyTime = t;
                }
                switch (key) {
                    case 'Down':
                    case 'Enter':
                        if (key == 'Enter' && event.ctrlKey) {
                            this.rowCommand(cursor.row - topRowIndex, 'Select');
                        }
                        else if (cursor.row < totalRowCount - 1) {
                            row++;
                            this.cursor(true, row, col);
                            if (topRowIndex + pageSize - 1 < row)
                                this.scrollTopRow(row - pageSize + 1);
                            else if (row < topRowIndex)
                                this.scrollTopRow(row);
                        }
                        handled = true;
                        break;
                    case 'Up':
                    case 'ShiftEnter':
                        if (row > 0) {
                            row--;
                            this.cursor(true, row, col);
                            if (row < topRowIndex)
                                this.scrollTopRow(row);
                            else if (row > topRowIndex + pageSize - 1)
                                this.scrollTopRow(row - pageSize + 1);
                        }
                        handled = true;
                        break;
                    case 'Right':
                    case 'Tab':
                        if (cursor.col < maxRightColIndex || force) {
                            col++;
                            if (col > maxRightColIndex)
                                col = maxRightColIndex;
                            this.cursor(true, row, col);
                            var cell = this.cell(0, col);
                            var vsbOffset = this._$verticalScrollbar.offset();
                            var options = horizontalScrollbar.slider('option');
                            var scrollValue = cell.is(':visible') ? options.value : -1;
                            while (true) {
                                var cellOffset = cell.offset();
                                if (!cell.is(':visible') || cellOffset.left + cell.outerWidth() >= vsbOffset.left) {
                                    if (scrollValue == options.max)
                                        break;
                                    scrollValue++;
                                    horizontalScrollbar.slider('option', 'value', scrollValue);
                                    this.hScroll(scrollValue);
                                }
                                else
                                    break;
                            }
                        }
                        else if (key == 'Tab' && row < totalRowCount - 1) {
                            this.cursor(true, row, 0);
                            event.keyCode = 37; // Left
                            this.keydown(event, true);
                            event.keyCode = 40; // Down
                            this.keydown(event);
                        }
                        if (!event.ctrlKey && (row < topRowIndex || row > topRowIndex + pageSize - 1))
                            this.makeCursorVisible();
                        handled = true;
                        break;
                    case 'Left':
                    case 'ShiftTab':
                        if (cursor.col > 0 || force) {
                            col--;
                            if (col < 0)
                                col = 0;
                            this.cursor(true, row, col);
                            cell = this.cell(0, col);
                            vsbOffset = this._$verticalScrollbar.offset();
                            options = horizontalScrollbar.slider('option');
                            scrollValue = options.value;
                            while (true) {
                                cellOffset = cell.offset();
                                if (cell.is(':visible') && cellOffset.left + cell.outerWidth() < vsbOffset.left)
                                    break;
                                scrollValue--;
                                if (scrollValue < 0)
                                    break;
                                horizontalScrollbar.slider('option', 'value', scrollValue);
                                this.hScroll(scrollValue);
                            }
                            if (!cell.is(':visible') || cellOffset.left + cell.outerWidth() >= vsbOffset.left) {
                                scrollValue = options.max;
                                while (true) {
                                    cellOffset = cell.offset();
                                    if (cell.is(':visible') && cellOffset.left + cell.outerWidth() < vsbOffset.left)
                                        break;
                                    scrollValue--;
                                    if (scrollValue < 0)
                                        break;
                                    horizontalScrollbar.slider('option', 'value', scrollValue);
                                    this.hScroll(scrollValue);
                                }
                            }
                        }
                        else if (key == 'ShiftTab' && row > 0) {
                            this.cursor(true, row, maxRightColIndex);
                            event.keyCode = 39; // Right
                            this.keydown(event, true);
                            event.keyCode = 38; // Up
                            this.keydown(event);
                        }
                        if (!event.ctrlKey && (row < topRowIndex || row > topRowIndex + pageSize - 1))
                            this.makeCursorVisible();
                        handled = true;
                        break;
                    case 'PageDown':
                        row += pageSize;
                        if (row > totalRowCount - 1)
                            row = totalRowCount - 1;
                        this.cursor(true, row, col);
                        topRowIndex += pageSize;
                        if (topRowIndex + pageSize > totalRowCount)
                            topRowIndex = totalRowCount - pageSize;
                        if (topRowIndex < 0)
                            topRowIndex = 0;
                        this.scrollTopRow(topRowIndex);
                        handled = true;
                        break;
                    case 'PageUp':
                        row -= pageSize;
                        if (row < 0)
                            row = 0;
                        this.cursor(true, row, col);
                        topRowIndex -= pageSize;
                        if (topRowIndex < 0)
                            topRowIndex = 0;
                        this.scrollTopRow(topRowIndex);
                        handled = true;
                        break;
                    case 'Home':
                    case 'CtrlHome':
                        if (event.ctrlKey)
                            row = 0;
                        this.cursor(true, row, 0);
                        event.keyCode = 37; // Left
                        this.keydown(event, true);
                        if (event.ctrlKey)
                            this.makeCursorVisible();
                        break;
                    case 'End':
                    case 'CtrlEnd':
                        if (event.ctrlKey)
                            row = totalRowCount - 1;
                        this.cursor(true, row, maxRightColIndex);
                        event.keyCode = 39; // Right
                        this.keydown(event, true);
                        if (event.ctrlKey)
                            this.makeCursorVisible();
                        break;
                }
            }
            if (handled && event.preventDefault) {
                event.preventDefault();
                event.stopPropagation();
                this._skipKeyDown = /*$.browser.mozilla == true*/navigator.userAgent.match(/Firefox/) && !force;
            }
        },
        makeCursorVisible: function () {
            var cursor = this.cursor();
            var topRowIndex = this.topRowIndex();
            var pageSize = this.pageSize();
            var row = cursor.row;
            var totalRowCount = this.totalRowCount();
            if (row < topRowIndex || row > topRowIndex + pageSize - 1) {
                topRowIndex = row - Math.floor(pageSize / 2);
                if (topRowIndex + pageSize >= totalRowCount)
                    topRowIndex = totalRowCount - pageSize;
                if (topRowIndex < 0)
                    topRowIndex = 0;
                this.scrollTopRow(topRowIndex);
            }
            var cell = this.cell(cursor.row - topRowIndex, cursor.col);
            if (cell.length > 0) {
                var cellOffset = cell.offset();
                var vsbOffset = this._$verticalScrollbar.offset();
                if (cellOffset.left + cell.outerWidth() >= vsbOffset.left) {
                    var horizontalScrollbar = this._$horizontalScrollbar;
                    var options = horizontalScrollbar.slider('option');
                    if (options.value++ < options.max - 1) {
                        horizontalScrollbar.slider('option', 'value', options.value);
                        this.hScroll(options.value);
                    }
                }
            }
        },
        keypress: function (event) {
        },
        keyup: function (event) {
            var which = event.which;
            var handled = false;
            // '-'; numeric '-'; '+'; numeric '+'
            var testNodeButton = which == 189 || which == 109 || which == 187 || which == 107 || which == 173 || which == 61;
            if (testNodeButton && event.altKey && event.shiftKey) {
                var topRowIndex = this.topRowIndex();
                var cursor = this.cursor();
                var cell = this.cell(cursor.row - topRowIndex, cursor.col);
                var nodeButton = cell.find('.node-button');
                var collapsed = nodeButton.is('.collapsed');
                if (nodeButton.length > 0 && !nodeButton.is('.terminal') && ((!collapsed && (which == 189 || which == 109 || which == 173)) || (collapsed && (which == 187 || which == 107 || which == 61)))) {
                    $().smartTag('hide');
                    this.execute('node-button', cursor.row - topRowIndex, cursor.col, 'click', nodeButton[0]);
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            else {
            }
        },
        field: function (fieldName) {
            return this._dataView.findField(fieldName);
        },
        fieldUnderAlias: function (fieldName) {
            return this._dataView.findFieldUnderAlias(this.field(fieldName));
        },
        hierarchyField: function () {
            return this._hierarchyField;
        },
        visibleDataRows: function (pageIndex) {
            var dataView = this._dataView;
            var page = null;
            var nextPage = null;
            var prevPage = null;
            var index = pageIndex;
            if (index == null)
                index = this.pageIndex();
            var cachedPages = dataView._cachedPages;
            var pageCount = this.pageCount();
            //var recalcPageOffset = index == pageCount - 1 && pageCount < 2;
            //if (recalcPageOffset)
            //    this.pageOffset(0);
            if (pageCount == 1)
                this.pageOffset(0);
            var pageOffset = this.pageOffset();
            var requiresNextPage = pageOffset > 0 && index < pageCount - 1;
            var optionalNextPage = this.hierarchyField() != null;
            var requiresPrevPage = index == pageCount - 1 && index > 0;
            for (var i = 0; i < cachedPages.length; i++) {
                var p = cachedPages[i];
                if (p.index == index)
                    page = p;
                else if (requiresNextPage && p.index == index + 1)
                    nextPage = p;
                else if ((requiresPrevPage || optionalNextPage) && p.index == index - 1)
                    prevPage = p;
                if (page && (requiresNextPage && nextPage || requiresPrevPage && prevPage))
                    break;
            }
            if (!page || requiresNextPage && !nextPage || requiresPrevPage && !prevPage)
                return null;
            if (pageIndex != null)
                dataView.set_pageIndex(pageIndex);
            var rows = [];
            var firstRowIndex = page.index * this.pageSize() + pageOffset;
            var lastRowIndex = firstRowIndex - 1;
            for (i = pageOffset; i < page.rows.length; i++) {
                Array.add(rows, page.rows[i]);
                lastRowIndex++;
            }
            this._bottomInvisibleRow = null;
            if (nextPage) {
                var nextPageRows = nextPage.rows;
                var nextPageRowCount = nextPageRows.length;
                if (nextPageRowCount > pageOffset)
                    nextPageRowCount = pageOffset;
                for (i = 0; i < nextPageRowCount; i++) {
                    Array.add(rows, nextPageRows[i]);
                    lastRowIndex++;
                }
                this._bottomInvisibleRow = nextPageRows[nextPageRowCount];
            }
            /*if (prevPage)
            for (i = prevPage.rows.length - 1; i >= page.rows.length; i--) {
            Array.insert(rows, 0, prevPage.rows[i]);
            firstRowIndex--;
            }*/

            /*if (recalcPageOffset && pageCount > 1) {
            var pageSize = this.pageSize();
            var totalRowCount = this.totalRowCount();
            var newPageOffset = pageSize - (pageSize * pageCount - totalRowCount) + (pageSize - rows.length);
            this.pageOffset(newPageOffset);
            }*/

            //this._lastRowRange = this._currentRowRange;
            //this.rowRange('last', this.rowRange('current'));
            //this._currentRowRange = { first: firstRowIndex, last: lastRowIndex, rows: rows };
            this.rowRange('current', { first: firstRowIndex, last: lastRowIndex, rows: rows });
            return rows;
        },
        wait: function (showProgress) {
            var indicator = this._$pagerRefresh; // this.$that('_Pager a.refresh');
            if (indicator)
                if (showProgress || showProgress == null)
                    indicator.addClass('wait');
                else
                    indicator.removeClass('wait');
        },
        busy: function () {
            return this._dataView._isBusy;
        },
        row: function (rowIndex) {
            var rowMap = this._rowMap;
            if (!rowMap)
                rowMap = this._rowMap = [];
            var row = rowMap[rowIndex];
            if (!row) {
                var $row = this.$that(String.format('_R{0}', rowIndex));
                row = rowMap[rowIndex] = $row;
            }
            return row;
        },
        cell: function (rowIndex, colIndex) {
            var cellMap = this._cellMap;
            if (!cellMap)
                cellMap = this._cellMap = [];
            var $row = cellMap[rowIndex];
            var $cell = $row ? $row[colIndex] : null;
            if (!$cell) {
                if (!$row)
                    $row = cellMap[rowIndex] = [];
                $cell = $row[colIndex] = this.$that(String.format('_R{0}_C{1}', rowIndex, colIndex));
            }
            return $cell;
        },
        gap: function (rowIndex) {
            var gapMap = this._gapMap;
            if (!gapMap)
                gapMap = this._gapMap = [];
            var gap = gapMap[rowIndex];
            if (!gap) {
                var $gap = this.$that(String.format('_RG{0}', rowIndex));
                gap = gapMap[rowIndex] = { gap: $gap, status: $gap.find('.status'), number: $gap.find('.number') };
            }
            return gap;
        },
        header: function (colIndex) {
            var headerMap = this._headerMap;
            if (!headerMap)
                headerMap = this._headerMap = [];
            var header = headerMap[colIndex];
            if (!header) {
                var $header = this.$that(String.format('_H{0}', colIndex));
                header = headerMap[colIndex] = $header;
            }
            return header;
        },
        refresh: function (dataRows) {
            var dataView = this._dataView;
            var fields = dataView._fields;
            if (!dataRows) {
                dataRows = this.visibleDataRows();
                if (dataRows == null) {
                    dataView.goToPage(dataView.get_pageIndex(), true);
                    return;
                }
            }
            var lastRowRange = this.rowRange('last'); // this._lastRowRange;
            var currentRowRange = this.rowRange('current'); // this._currentRowRange;
            var rowsToSkip = [];
            var pageSize = this.pageSize();
            var showRowNumber = this.showRowNumber();
            var multiSelect = this.multiSelect();
            var topRowIndex = this.topRowIndex();
            var hierarchyField = this.hierarchyField();
            var keyField = this.keyField();
            var sb = new Sys.StringBuilder();
            dataView._disableObjectRef = true;
            var systemFilter = this.systemFilter();
            var dvr = _web.DataViewResources.Form;
            var hasKey = dataView._hasKey();
            var updateRefreshSpeed = !this._refreshSpeed;
            if (updateRefreshSpeed)
                this._refreshSpeed = new Date().getTime();

            //var t = new Date().getTime();

            if (lastRowRange && currentRowRange) {
                if (lastRowRange.first == currentRowRange.first && lastRowRange.last == currentRowRange.last) {
                    for (var i = 0; i < pageSize; i++)
                        rowsToSkip.push(i);
                }
                else {
                    var currentRowIndex = currentRowRange.first < lastRowRange.first ? currentRowRange.last : currentRowRange.first;
                    var step = currentRowIndex == currentRowRange.last ? -1 : 1;
                    while (step > 0 && currentRowIndex <= currentRowRange.last || step < 0 && currentRowIndex >= currentRowRange.first) {
                        if (lastRowRange.first <= currentRowIndex && currentRowIndex <= lastRowRange.last) {
                            var rowIndex = currentRowIndex - currentRowRange.first;
                            var lastRowIndex = currentRowIndex - lastRowRange.first;
                            if (0 <= lastRowIndex && lastRowIndex < pageSize) {
                                for (var j = 0; j < fields.length; j++) {
                                    var currentCell = this.cell(rowIndex, j);
                                    var lastCell = this.cell(lastRowIndex, j);
                                    currentCell.empty();
                                    var children = lastCell[0].childNodes;
                                    if (children.length > 0)
                                        currentCell[0].appendChild(children[0]);
                                }
                                rowsToSkip.push(rowIndex);
                            }
                        }
                        currentRowIndex += step;
                    }
                }
            }

            for (i = 0; i < dataRows.length; i++) {
                var row = dataRows[i];
                if (rowsToSkip.length == 0 || !Array.contains(rowsToSkip, i))
                    for (j = 0; j < fields.length; j++) {
                        var f = fields[j];
                        f = dataView._allFields[f.Index];
                        sb.append('<div class="data-item">');
                        var clickableLink = false;
                        if (j == 0) {
                            if (multiSelect) {
                                sb.appendFormat('<input type="checkbox" class="checkbox"/>');
                            }
                            if (hasKey)
                                clickableLink = true;
                            if (hierarchyField) {
                                var v = row[hierarchyField.Index];
                                if (v) {
                                    var path = v.split('/');
                                    var nextRow = dataRows[i + 1];
                                    if (!nextRow)
                                        nextRow = this._bottomInvisibleRow;
                                    var v2 = nextRow ? nextRow[hierarchyField.Index] : null;
                                    var collapsed = systemFilter && Array.contains(systemFilter, row[keyField.Index]);
                                    sb.appendFormat('<span style="margin-left:{0}px;" class="button node-button{1}{2}" title="{3}"></span>', (path.length - 1) * 16,
                                        (!v2 || v.length >= v2.length) && !collapsed ? ' terminal' : '', collapsed ? ' collapsed' : '', collapsed ? dvr.Maximize : dvr.Minimize);
                                }
                            }
                        }
                        if (clickableLink) {
                            sb.append('<span class="button">');
                        }
                        dataView._renderItem(sb, f, row, false, null, false);
                        if (clickableLink) {
                            sb.append('</span>');
                        }
                        sb.append('</div>');
                        //this.cell(i, j).html(sb.toString());
                        var cell = this.cell(i, j);
                        cell[0].innerHTML = sb.toString();
                        sb.clear();
                    }
                var $row = this.row(i).removeClass('empty');
                if (hasKey) {
                    if (dataView.rowIsSelected(row))
                        $row.addClass('selected');
                    else
                        $row.removeClass('selected');
                }
                if (showRowNumber)
                    this.gap(i).number.text(topRowIndex + i + 1);
            }
            dataView._disableObjectRef = false;
            for (i = dataRows.length; i < pageSize; i++) {
                for (j = 0; j < fields.length; j++) {
                    this.cell(i, j).empty();
                }
                this.row(i).removeClass('selected').addClass('empty');
                if (showRowNumber)
                    this.gap(i).number.text('');
            }

            //document.title = new Date().getTime() - t;

            this._syncVScrollBar();
            this.wait(false);
            if (updateRefreshSpeed)
                this._refreshSpeed = new Date().getTime() - this._refreshSpeed;
            var cursor = this.cursor();
            var totalRowCount = this.totalRowCount();
            if (cursor && cursor.row >= totalRowCount)
                this.cursor(true, totalRowCount - 1, cursor.col);
            else
                this.cursor(true);

        },
        reset: function (full) {
            if (full)
                this.pageOffset(0);
            this.rowRange(null);
        },
        fixedColumns: function () {
            var frozenFieldName = this._frozenFieldName;
            var fields = this._dataView._fields;
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                if (field.Name == frozenFieldName || !frozenFieldName && field.tagged("data-sheet-freeze"))
                    return i + 1;
            }
            return 0;
        },
        freeze: function (fieldName) {
            var dataView = this._dataView;
            if (fieldName == null) {
                var fixedColumns = this.fixedColumns();
                if (fixedColumns == 0)
                    return null;
                return dataView._fields[fixedColumns - 1].Name;
            }
            if (fieldName == '')
                fieldName = null;
            dataView.writeContext('dataSheetFrozenField', fieldName);
            this._frozenFieldName = fieldName;
            this._reset();
            this.show();
            this.refresh();
        },
        _freeze: function () {
            var fixedColumns = this.fixedColumns();
            this.$that().find('div.data-row').each(function (index) {
                $(String.format('div.data-cell:lt({0})', fixedColumns), this).addClass('fixed');
            });
        },
        _allocateCells: function () {
            // read data view properties
            var that = this;
            this._createContainer();
            var dataView = this._dataView;
            var fields = dataView._fields;
            var allFields = dataView._allFields;
            var dataRows = dataView._rows;
            var pageCount = dataView.get_pageCount();
            var pageSize = dataView.get_pageSize();
            this._lastPageSize = pageSize;
            var totalRowCount = this.totalRowCount();
            var headerHeight = this.headerHeight();
            var rowHeight = this.rowHeight();
            var topOfDataRow = 0;

            // analyze field tags
            for (var i = 0; i < allFields.length; i++) {
                var f = allFields[i];
                if (f.tagged("hierarchy-organization"))
                    this._hierarchyField = f;
            }

            // render a table
            var cellWidth = dataView.readContext('dataSheetColumnWidth');
            var calcColumnWidth = cellWidth == null;
            if (calcColumnWidth)
                cellWidth = [];
            var totalWidth = 0;
            var selector = this._id;
            var sb = new Sys.StringBuilder();


            var gapWidth = 3;
            if (this.showRowNumber())
                gapWidth += totalRowCount.toString().length;
            gapWidth = this.charWidth(gapWidth);
            // render header
            sb.appendFormat('<div id="{0}_H" class="header-row"><div id="{0}_HG" class="header-gap" style="position:relative;height:{1}px;width:{2}px"><span></span></div>', selector, headerHeight, gapWidth);
            for (i = 0; i < fields.length; i++) {
                f = fields[i];
                f = dataView._allFields[f.AliasIndex];
                if (calcColumnWidth) {
                    var w = this.charWidth(f.Columns);
                    cellWidth[i] = w;
                }
                else
                    w = cellWidth[i];
                totalWidth += w;
                sb.appendFormat('<div id="{0}_H{1}" class="header-cell c{1}" style="position:relative;width:{2}px;height:{3}px"></div>', selector, i, w, headerHeight);
            }
            sb.append('</div>');

            // render rows
            for (var j = 0; j < pageSize; j++) {
                var rowType = '';
                if (j == 0)
                    rowType += ' first';
                if (j == pageSize - 1)
                    rowType += ' last';
                if (j % 2 != 0)
                    rowType += ' alternating';
                sb.appendFormat('<div id="{0}_R{1}" class="data-row{3}"><div id="{0}_RG{1}" class="data-gap" style="position:relative;height:{2}px;width:{4}px"><div class="gap-item"><span class="status">&nbsp;</span><span class="number"></span></div></div>', selector, j, rowHeight, rowType, gapWidth);
                for (i = 0; i < fields.length; i++) {
                    f = fields[i];
                    f = dataView._allFields[f.AliasIndex];
                    sb.appendFormat('<div id="{0}_R{1}_C{2}" class="data-cell c{2}" style="position:relative;width:{3}px;height:{4}px"><!--r{1}, c{2}--></div>', selector, j, i, cellWidth[i], rowHeight);
                }
                sb.append('</div>');
            }
            sb.append('</div>');
            sb.appendFormat('<div id="{0}_HSB" class="horizontal-scroll-bar-wrap"><div class="scroll-bar"></div></div>', selector);
            sb.appendFormat('<div id="{0}_Pager" class="pager"><span class="showing"></span><span title="Refresh" class="refresh"></span></div>', selector);
            sb.appendFormat('<div id="{0}_VSB" class="vertical-scroll-bar-wrap"><div class="scroll-bar"></div></div>', selector);
            var $dataSheet = this.$that();
            var dataSheetWidth = $dataSheet.outerWidth();
            $dataSheet.show().html(sb.toString());
            var sortInfo = that.sort();
            $('.header-cell', $dataSheet).each(function (index) {
                var f = that._dataView._fields[index];
                f = that._dataView._allFields[f.AliasIndex];
                if (index == 0 && that.multiSelect())
                    $('<input type="checkbox" class="checkbox"/>').appendTo(this);
                if (f.AllowSorting) {
                    var sortButton = $('<span class="button"></span>').appendTo(this).text(f.HeaderText).attr('title', String.format(_web.DataViewResources.HeaderFilter.SortBy, f.HeaderText));
                    var statusIndicator = $('<span class="status"></span>').appendTo(sortButton);
                    if (sortInfo && sortInfo.fieldName == f.Name)
                        statusIndicator.addClass(sortInfo.order != 'desc' ? 'sort-asc' : 'sort-desc');
                }
                else
                    $(this).text(f.HeaderText);
            });
            sb.clear();

            // position cells in the header row
            var headerRow = this.$that('div.header-row');
            var l = 0;
            var h;
            this._$headerCells = $(headerRow).find('div.header-cell,div.header-gap').each(function (index) {
                var cell = $(this)/*.position({
                my: 'left top',
                at: 'left top',
                of: headerRow,
                offset: l + ' 0',
                collision: 'none'
            })*/;
                l += cell.outerWidth();
                if (index == 0)
                    h = cell.outerHeight();
                if (index > 0) {
                    cell.resizable({
                        handles: 'e',
                        maxWidth: dataSheetWidth - 50,
                        alsoResize: String.format('#{0} div.data-cell.c{1}', selector, index - 1),
                        resize: function (event, ui) {
                            cellWidth[index - 1] = ui.size.width;
                            dataView.writeContext('dataSheetColumnWidth', cellWidth);
                            that.cursor(true);
                        },
                        start: function () {
                        },
                        stop: function () {
                            that.autoSize(true);
                            $().smartTag('resume');
                        }
                    })
                    .find('.ui-resizable-handle')
                        .mousedown(function () {
                            $().smartTag('pause');
                        })
                        .mouseup(function () {
                            $().smartTag('resume');
                        })
                        .dblclick(function (event) {
                            var handle = $(event.target);
                            var cursor = handle.css('cursor');
                            handle.css('cursor', 'default');
                            var maxWidth = 0;
                            that.$that(String.format('div.data-cell.c{0} div.data-item', index - 1)).each(function () {
                                var dataItem = $(this);
                                var position = dataItem.css('position');
                                dataItem.css('position', 'absolute');
                                var w = dataItem.outerWidth();
                                dataItem.css('position', position);
                                if (w > maxWidth)
                                    maxWidth = w;
                            });
                            if (maxWidth < dataSheetWidth - 20) {
                                cellWidth[index - 1] = maxWidth;
                                $(String.format('#{0} div.header-cell.c{1}, #{0} div.data-cell.c{1}', selector, index - 1)).width(maxWidth);
                                that.autoSize(true);
                                $().smartTag('resume');
                                dataView.writeContext('dataSheetColumnWidth', cellWidth);
                                that.cursor(true);
                            }
                            handle.css('cursor', cursor);
                        });
                }
            })
            headerRow.height(h);

            // position cells in the data rows
            var $dataRows = this._$dataRows = this.$that('div.data-row').each(function (index) {
                var dataRow = this;
                l = 0;
                var cells = $('div.data-cell,div.data-gap', dataRow).each(function (index) {
                    var cell = $(this)/*.position({
                    my: 'left top',
                    at: 'left top',
                    of: dataRow,
                    offset: l + ' 0',
                    collision: 'none'
                })*/;
                    l += cell.outerWidth();
                    if (index == 0)
                        h = cell.outerHeight();
                });
                $(dataRow).height(h);
                cells.css('top', 0);
            }).click(function (event) {
                var $target = $(event.target);
                var rowIndex = parseInt($(this).attr('id').match(/_R(\d+)$/)[1]);
                var colIndex = that.cellIndex($target);
                var target = 'row';
                action = 'click';
                if ($target.is('.node-button'))
                    target = 'node-button';
                that.execute(target, rowIndex, colIndex, action, event.target);
            });
            this._$dataGaps = this.$that('div.data-gap');
            var isMozilla = navigator.userAgent.match(/Firefox/)/* $.browser.mozilla */ == true;
            var mouseWheelEvent = isMozilla ? "wheel" : "mousewheel";
            $dataRows.bind(mouseWheelEvent, function (event) {
                var wheelDelta = event.originalEvent ? event.originalEvent.wheelDelta / 120 : null;
                if (wheelDelta == null)
                    wheelDelta = event.originalEvent.deltaY != null ? event.originalEvent.deltaY : null
                if (wheelDelta != null && that.pageCount() > 1) {
                    $().smartTag('pause');
                    if (!that.busy()) {
                        var delta = Math.ceil(Math.abs(wheelDelta));
                        var wheelDeltaX = event.originalEvent.wheelDeltaX;
                        if (wheelDeltaX == null)
                            wheelDeltaX = event.originalEvent.deltaX != null ? event.originalEvent.deltaX : null
                        if (wheelDeltaX != null && wheelDeltaX != 0) {
                            if (!isMozilla)
                                wheelDeltaX *= -1;
                            event.keyCode = wheelDeltaX > 0 ? 37 : 39 // 'Left' : 'Right'
                            event.ctrlKey = true;
                            that.keydown(event);
                        }
                        else {
                            if (isMozilla)
                                wheelDelta *= -1;
                            var topRowIndex = that.topRowIndex();
                            var pageSize = that.pageSize();
                            if (wheelDelta < 0) {
                                topRowIndex = topRowIndex + delta;
                                var totalRowCount = that.totalRowCount();
                                if (topRowIndex + pageSize > totalRowCount)
                                    topRowIndex = totalRowCount - pageSize;
                                if (topRowIndex < 0)
                                    topRowIndex = 0;
                                that.scrollTopRow(topRowIndex);
                            }
                            else {
                                topRowIndex = topRowIndex - delta;
                                if (topRowIndex < 0)
                                    topRowIndex = 0;
                                that.scrollTopRow(topRowIndex);
                            }
                        }
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    $().smartTag('resume');
                }
            });
            // attach smart tags to columns, data cells, and pager
            this.$that('.header-cell').each(function (index) {
                $(this).smartTag('header-cell', {
                    container: $dataSheet,
                    items: function () {
                        return that._contextMenuOfColumn(index);
                    }
                });
            });
            $dataRows.each(function (index) {
                $(this).find('.data-cell.c0').smartTag('data-cell', {
                    container: $dataSheet,
                    items: function () {
                        return that._contextMenuOfDataRow(index);
                    },
                    test: function () {
                        var testIndex = that.absoluteRowIndex(index);
                        return testIndex < that.totalRowCount();
                    },
                    select: function () {
                        var absoluteRowIndex = that.absoluteRowIndex(index);
                        totalRowCount = that.totalRowCount();
                        if (absoluteRowIndex >= totalRowCount)
                            absoluteRowIndex = totalRowCount - 1;
                        that.cursor(true, absoluteRowIndex, 0);
                    }
                });
            });
            this._$pageShowing = this.$that('div.pager span.showing').smartTag('pager-menu', {
                container: $dataSheet,
                items: function () {
                    var items = [];
                    $(_web.DataViewResources.Pager.PageSizes).each(function (index) {
                        var pageSize = this;
                        items.push({
                            text: String.format('{0} {1}', _web.DataViewResources.Pager.ItemsPerPage, this),
                            checked: this == dataView.get_pageSize(),
                            select: function () {
                                that.pageSize(pageSize);
                            }
                        }
                        );
                    });
                    return items;
                }
            });

            /// freeze "fixed" columns
            this._freeze();

            // initialize horizontal scroll bar
            var horizontalScrollbar = this._$horizontalScrollbar = this.$that('_HSB .scroll-bar');
            horizontalScrollbar
                .slider({
                    orientation: 'horizontal',
                    min: 0,
                    max: 0,
                    value: 0,
                    animate: 100,
                    slide: function (event, ui) {
                        that.hScroll(ui.value);
                    },
                    start: function () {
                        $().smartTag('pause');
                    },
                    stop: function () {
                        $().smartTag('resume');
                        horizontalScrollbar.width('100%');
                    }
                });

            var hSliderHandle = horizontalScrollbar.find('.ui-slider-handle').mousedown(function () {
                horizontalScrollbar.width(hSliderHandleParent.width());
            });
            var hSliderHandleParent = hSliderHandle.append('<div class="ui-handle-helper"></div>').wrap('<div class="ui-slider-handle-parent"></div>').parent();

            // position and initialize the vertical scroll bar
            var lastRow = this.$that('div.data-row.last');
            var $sliderPageInfo = this._$sliderPageInfo = $('<div></div>')
                .addClass('data-sheet pager-info-popup')
                .css({ position: 'absolute' })
                .hide()
                .appendTo($body);

            that._pageInfoTimeout = -1;
            that.pageInfoSlideTimeout = null;

            var verticalScrollbar = this._$verticalScrollbar = this.$that('_VSB .scroll-bar')
                .slider({
                    orientation: 'vertical',
                    min: 0,
                    max: totalRowCount <= pageSize ? 0 : totalRowCount - pageSize,
                    animate: 100,
                    value: dataView.get_pageIndex() * pageSize + that.pageOffset(),
                    slide: function (event, ui) {
                        that._skipSyncVScrollBar = true;
                        var topRowIndex = that.scrollTopRow(ui.value, true);
                        if (!that._pageInfoSlideTimeout)
                            that._pageInfoSlideTimeout = setTimeout(function () {
                                $sliderPageInfo.show().position({ my: 'right-8 middle', at: 'left middle', of: vSliderHandle });
                                that._pageInfoSlideTimeout = null;
                            }, 50);
                        if (that._pageInfoTimeout != -1)
                            clearTimeout(that._pageInfoTimeout);
                        that._updatePageInfo(topRowIndex);
                    },
                    change: function (event, ui) {
                        $sliderPageInfo.show().position({ my: 'right-8 middle', at: 'left middle', of: $(this).find('.ui-slider-handle') });
                    },
                    start: function (event, ui) {
                        if (that.busy())
                            return false;
                        $().smartTag('pause');
                    },
                    stop: function (event, ui) {
                        $().smartTag('resume');
                        that._pageInfoTimeout = setTimeout(function () {
                            $sliderPageInfo.hide();
                        }, 1000);
                        if (that.resetVScrollBar) {
                            that.$that('_VSB .scroll-bar').height('100%').css({ 'margin-top': 0 });
                            that._$vSliderHandleParent.css('margin-top', +vSliderHandle.height() / 2);
                            that.resetVScrollBar = false;
                        }
                    }
                });
            var vSliderHandle = this._$vSliderHandle = verticalScrollbar.find('.ui-slider-handle').mousedown(function (event) {
                if (verticalScrollbar.slider('option', 'max') > 0) {
                    that.resetVScrollBar = true;
                    that.$that('_VSB .scroll-bar').height(that._$vSliderHandleParent.height()).css({ 'margin-top': +vSliderHandle.height() / 2 });
                    that._$vSliderHandleParent.css('margin-top', 0);
                }
            });
            var vSliderHandleParent = this._$vSliderHandleParent = vSliderHandle.append('<div class="ui-handle-helper"></div>').wrap('<div class="ui-slider-handle-parent"></div>').parent();

            this._$pagerRefresh = this.$that('_Pager .refresh').click(function () {
                if (!that.busy())
                    if (dataView._hasSearchAction)
                        dataView.search();
                    else
                        dataView.sync();
                return false;
            });

            // resize the data sheet to fill the page
            this.autoSize();
            if (Sys.Browser.agent != Sys.Browser.InternetExplorer || Sys.Browser.version >= 9)
                $window.resize(function () {
                    that.autoSize(true);
                });
        },
        cellIndex: function (elem) {
            var targetId = $(elem).parent('.data-cell', '.data-cell').andSelf().attr('id');
            var colIndex = targetId ? targetId.match(/_C(\d+)$/) : null;
            colIndex = colIndex == null ? -1 : parseInt(colIndex[1]);
            return colIndex;
        },
        hScroll: function (value) {
            var that = this;
            var fixedColumns = that.fixedColumns();
            var fixedFilter = fixedColumns == 0 ? '' : String.format(':gt({0})', fixedColumns - 1);
            that.$that('div.data-cell').show();
            that.$that('div.header-cell').show();
            that.$that(String.format('div.header-row div.header-cell:lt({0}){1}', value + fixedColumns, fixedFilter)).hide();
            this._$dataRows.each(function (index) {
                $(this).find(String.format('div.data-cell:lt({0}){1}', value + fixedColumns, fixedFilter)).hide();
            });
            $().smartTag('hide');
            that.cursor(true);
        },
        keyField: function () {
            var dataView = this._dataView;
            var keyFields = dataView._keyFields;
            return keyFields.length > 0 ? keyFields[0] : null;
        },
        topRowIndex: function () {
            return this.pageIndex() * this.pageSize() + this.pageOffset();
        },
        absoluteRowIndex: function (rowIndex) {
            return rowIndex + this.topRowIndex();
        },
        execute: function (target, rowIndex, colIndex, action, elem) {
            if (this.busy()) return;
            var dataView = this._dataView;
            if (target == 'node-button') {
                var keyField = this.keyField();
                var dataRows = this.rowRange('current').rows; //this.visibleDataRows();
                var keyValue = dataRows[rowIndex][keyField.Index];
                if (action == 'click') {
                    this.systemFilter(/*dataView.convertFieldValueToString(keyField, keyValue)*/keyValue);
                    dataView._clearCache(false);
                    //this.rowRange(null);
                    dataView._requiresRowCount = true;
                    dataView.goToPage(this.pageIndex());
                }
            }
            else {
                var totalRowCount = this.totalRowCount();
                var absoluteRowIndex = this.absoluteRowIndex(rowIndex);
                if (absoluteRowIndex >= totalRowCount)
                    absoluteRowIndex = totalRowCount - 1;
                if (colIndex >= 0) {
                    this.cursor(true, absoluteRowIndex, colIndex);
                    this.makeCursorVisible();
                }
                else {
                    var cursor = this.cursor();
                    colIndex = cursor.col;
                    var cell = this.cell(rowIndex, colIndex);
                    if (!cell.is(':visible') || (cell.offset().left > this._$verticalScrollbar.offset().left)) {
                        var visibleCell = $(this._$dataRows[rowIndex]).find('.data-cell:visible');
                        if (visibleCell.length > 0)
                            colIndex = this.cellIndex(visibleCell[0]);
                    }
                    //else if (cursor.row == absoluteRowIndex && this.cell(rowIndex, 0).is(':visible') && cell.parent().is('.selected'))
                    //    colIndex = 0;
                    this.cursor(true, absoluteRowIndex, colIndex);
                    this.rowCommand(rowIndex, 'Select');
                }
            }
        },
        rowCommand: function (rowIndex, commandName, commandArgument) {
            var dataView = this._dataView;
            var dataRows = this.rowRange('current').rows; // this.visibleDataRows();
            if (rowIndex >= dataRows.length)
                rowIndex = dataRows.length - 1;
            var row = dataRows[rowIndex];
            dataView.rowCommand(row, 'Select', commandArgument);
            $().smartTag('hide');
        },
        systemFilter: function (value) {
            var nodeFilter = this._nodeFilter;
            if (value == null || value == true)
                return nodeFilter;
            else {
                if (value == false)
                    this._nodeFilter = null;
                else {
                    if (!nodeFilter)
                        nodeFilter = this._nodeFilter = ['collapse-nodes'];
                    var index = Array.indexOf(nodeFilter, value);
                    if (index == -1)
                        Array.add(nodeFilter, value);
                    else
                        Array.remove(nodeFilter, value);
                }
            }
        },
        pageIndex: function () {
            var dataView = this._dataView;
            return dataView.get_pageIndex();
        },
        pageCount: function () {
            var dataView = this._dataView;
            return dataView.get_pageCount();
        },
        pageOffset: function (value) {
            var dataView = this._dataView;
            if (value == null)
                return this._pageOffset != null ? this._pageOffset : 0;
            else
                this._pageOffset = value;
        },
        scrollTopRow: function (topRow, delayRefresh) {
            if (delayRefresh == null)
                delayRefresh = false;
            var that = this;
            var dataView = this._dataView;
            var totalRowCount = this.totalRowCount();
            var pageSize = dataView.get_pageSize();
            var topRowIndex = delayRefresh ? (totalRowCount - pageSize) - topRow : topRow;
            var pageIndex = Math.floor(topRowIndex / pageSize);
            var pageOffset = topRowIndex - pageIndex * pageSize;
            if (that._goToPageTimeout != -1)
                clearTimeout(that._goToPageTimeout);
            that.pageOffset(pageOffset);
            var dataRows = that.visibleDataRows(pageIndex);
            var goToPageFunc = function () {
                if (dataRows)
                    that.refresh(dataRows);
                else
                    dataView.goToPage(pageIndex, false);
            };
            var delay = 100;
            var refreshSpeed = this._refreshSpeed;
            if (refreshSpeed == null || refreshSpeed < 75 || delayRefresh == false) {
                // conditional refresh with delay
                if (delayRefresh && !dataRows)
                    that._goToPageTimeout = window.setTimeout(goToPageFunc, 500);
                else
                    goToPageFunc();
            }
            else {
                // delay with dynamic interval
                if (delayRefresh && !dataRows)
                    delay = 500;
                that._goToPageTimeout = window.setTimeout(goToPageFunc, delay);
            }

            return topRowIndex;
        },
        autoSize: function (delayed) {
            var that = this;
            that._refreshSpeed = null;
            if (delayed == true) {
                if (this._autoSizeTimeout)
                    clearTimeout(this._autoSizeTimeout);
                this._autoSizeTimeout = setTimeout(function () {
                    that.autoSize();
                    this._autoSizeTimeout = null;
                }, 50);
                return;
            }
            var oldScrollTop = $window.scrollTop();
            // temporary hide all resizable data views on the page to evaluate available page width width
            var $dataSheet = this.$that();
            if (!$dataSheet.is(':visible'))
                return;
            var dataView = this._dataView;
            var fields = dataView._fields;
            var visibleDataViewContainers = $('.container.resizable-data-view:visible');
            visibleDataViewContainers.hide();
            $dataSheet.outerWidth($(dataView._element).width());
            visibleDataViewContainers.show();

            // position horizontal scroll bar
            var horizontalScrollbar = this._$horizontalScrollbar;
            var hSliderHandle = horizontalScrollbar.find('.ui-slider-handle')
            var hSliderHandleParent = horizontalScrollbar.find('.ui-slider-handle-parent');

            var verticalScrollbarWidth = 1 + this.$that('_VSB').outerWidth();
            this.$that('_HSB').outerWidth($dataSheet.outerWidth() - verticalScrollbarWidth);

            var firstInvisibleColumn = -1;
            var rightMostFirstInvisibleColumn = -1;
            var visibleWidth = $dataSheet.width() - verticalScrollbarWidth - $dataSheet.find('div.header-cell.c0').position().left;
            $dataSheet.find('div.data-row.first div.data-cell.fixed').each(function () {
                var fixedColumnWidth = $(this).width();
                visibleWidth -= fixedColumnWidth;
                l += fixedColumnWidth;
            });
            var numberOfFixedColums = this.fixedColumns();
            var l = 0;
            // measure the cell width regardless of visibility
            var cellWidth = function (elem) {
                var cell = $(elem);
                var visible = cell.is(':visible');
                if (!visible)
                    cell.show();
                var w = cell.outerWidth();
                if (!visible)
                    cell.hide();
                return w;
            }
            var dataCellsInFirstRow = $dataSheet.find('div.data-row.first div.data-cell').each(function (index) {
                if (index >= numberOfFixedColums) {
                    var w = cellWidth(this);
                    var r = l + w;
                    if (r >= visibleWidth) {
                        firstInvisibleColumn = index;
                        return false;
                    }
                    l += w;
                }
            })
            var r = 0;
            $(dataCellsInFirstRow.get().reverse()).each(function (index) {
                var w = cellWidth(this);
                var l = r + w;
                if (l >= visibleWidth) {
                    rightMostFirstInvisibleColumn = fields.length - index - numberOfFixedColums;
                    return false;
                }
                r += w;
            });


            var hMax = firstInvisibleColumn != -1 ? fields.length - firstInvisibleColumn : 0;
            if (hMax < rightMostFirstInvisibleColumn)
                hMax = rightMostFirstInvisibleColumn;
            this._rightMostFirstInvisibleColumn = rightMostFirstInvisibleColumn;
            horizontalScrollbar.slider('option', 'max', hMax);
            if (horizontalScrollbar.slider('option', 'value') > hMax)
                horizontalScrollbar.slider('option', 'value', hMax);

            var scrollbarWidth = horizontalScrollbar.width();
            var hHandleWidth = scrollbarWidth;
            if (hMax > 0)
                hHandleWidth = ((fields.length - hMax) / fields.length) * hHandleWidth;
            else {
                this.$that('div.data-cell').show();
                this.$that('div.header-cell').show();
            }
            hSliderHandle.css({ width: hHandleWidth, 'margin-left': -hHandleWidth / 2 });
            hSliderHandleParent.width(scrollbarWidth - hHandleWidth);


            // position vertical scroll bar
            var headerRow = this.$that('.header-row');
            var lastRow = this.$that('div.data-row.last');
            this.$that('_VSB').css({ position: 'absolute' }).height(lastRow.position().top + lastRow.outerHeight()/*lastRow.position().top - headerRow.position().top + headerRow.outerHeight() - 1*/)
                .position({
                    my: 'right top',
                    at: 'right top',
                    of: headerRow,
                    collision: 'none'
                });

            // update page information
            this._updatePageInfo();
            $window.scrollTop(oldScrollTop)
        },
        _syncVScrollBar: function () {
            if (this._skipSyncVScrollBar) {
                this._skipSyncVScrollBar = false;
                return;
            }
            var dataView = this._dataView;
            var verticalScrollbar = this._$verticalScrollbar;

            var totalRowCount = this.totalRowCount();
            var pageSize = dataView.get_pageSize();
            var max = totalRowCount <= pageSize ? 0 : totalRowCount - pageSize;


            var options = verticalScrollbar.slider('option');
            var topRowIndex = this.topRowIndex();
            var expectedValue = totalRowCount > pageSize ? (totalRowCount - pageSize) - topRowIndex : 0;

            if (/*options.max == max && */expectedValue < 0) {
                //this.scrollTopRow(totalRowCount - pageSize);
                //return;
                expectedValue = 0;
            }
            if (options.max != max) {
                verticalScrollbar.slider('option', 'max', max);
                if (expectedValue > max)
                    expectedValue = max - 1;
                verticalScrollbar.slider('option', 'value', expectedValue);
                this._$sliderPageInfo.hide();
            }
            else if (options.value != expectedValue) {
                verticalScrollbar.slider('option', 'value', expectedValue);
                this._$sliderPageInfo.hide();
            }
            this._updatePageInfo(topRowIndex);

            var scrollbarHeight = verticalScrollbar.height();

            var sliderHeight = 0;

            if (totalRowCount > pageSize)
                sliderHeight = scrollbarHeight * (pageSize / totalRowCount);

            if (sliderHeight < 10)
                sliderHeight = 10;

            this.$that('_VSB .scroll-bar').height('100%');

            if (verticalScrollbar.slider('option', 'max') == 0) {
                this._$vSliderHandleParent.height('100%').css('margin-top', 0);
                this._$vSliderHandle.css({ 'height': scrollbarHeight, 'margin-bottom': 0 });
            }
            else {
                this._$vSliderHandleParent.height(scrollbarHeight - sliderHeight).css('margin-top', sliderHeight / 2);
                this._$vSliderHandle.css({ 'height': sliderHeight, 'margin-bottom': -sliderHeight / 2 });
            }
        },
        _updatePageInfo: function (firstRow) {
            var dataView = this._dataView;
            var totalRowCount = this.totalRowCount();
            var pageSize = dataView.get_pageSize();
            if (pageSize > totalRowCount)
                pageSize = totalRowCount;
            if (firstRow == null)
                firstRow = dataView.get_pageIndex() * pageSize + this.pageOffset()/* dataView.get_pageOffset()*/;
            var lastRow = firstRow + pageSize;
            if (lastRow >= totalRowCount) {
                lastRow = totalRowCount;
                firstRow = totalRowCount - pageSize;
            }
            firstRow++;
            this._$sliderPageInfo[0].innerHTML = String.format('{0} - {1}', firstRow, lastRow);
            var dvr = _web.DataViewResources;
            this._$pageShowing[0].innerHTML =
                totalRowCount > 0 ? String.format(dvr.Pager.ShowingItems, firstRow, lastRow, totalRowCount) : dvr.Data.NoRecords;
            this._$pagerRefresh.css({ position: 'absolute' }).position({ my: 'right middle', at: 'right middle', of: this.$that('_Pager'), collision: 'none' });
        },
        lookup: function () {
            return this.dataView().get_lookupField();
        },
        _contextMenuOfDataRow: function (index) {
            var that = this;
            return [
                    {
                        text: 'Select',
                        select: function () {
                            if (that.lookup())
                                that.rowCommand(index, 'Select');
                            else
                                that.rowCommand(index, 'Select', 'editForm1');
                        }
                    }
            /*
            {
            text: String.format('Row {0} / Item 1', index),
            select: function () {
            alert('row 1');
            }
            },
            {
            text: String.format('Row {0} / Item 2', index),
            select: function () {
            alert('row 2');
            }
            },
            {
            },
            {
            text: String.format('Row {0} / Item 3', index),
            icon: 'Edit',
            select: function () {
            alert('row 3');
            }
            },
            {
            text: String.format('Row {0} / Item 4', index),
            select: function () {
            alert('row 4');
            }
            },
            {
            text: String.format('Row {0} / Item 5', index),
            icon: 'Delete',
            select: function () {
            alert('row 5');
            }
            }
            ,
            {
            text: String.format('Row {0} / Item 6', index),
            select: function () {
            alert('row 6');
            }
            },
            {
            text: String.format('Row {0} / Item 7', index),
            select: function () {
            alert('row 7');
            }
            },
            {
            text: String.format('Row {0} / Item 8', index),
            select: function () {
            alert('row 8');
            }
            },
            {
            text: String.format('Row {0} / Item 9', index),
            select: function () {
            alert('row 9');
            }
            },
            {
            text: String.format('Row {0} / Item 10', index),
            select: function () {
            alert('row 10');
            }
            },
            {
            text: String.format('Row {0} / Item 11', index),
            select: function () {
            alert('row 11');
            }
            }*/
            ];
        },
        sort: function (sortExpression) {
            var dataView = this._dataView;
            if (sortExpression == null) {
                sortExpression = dataView.get_sortExpression();
                var sortInfo = sortExpression ? sortExpression.match(/^(\w+?)(\s+(asc|desc))?$/) : null;
                return { fieldName: sortInfo ? sortInfo[1] : null, order: sortInfo ? sortInfo[3] : null };
            }
            else {
                if (this.busy()) return;
                this.pageOffset(0);
                dataView.sort(sortExpression);
                this._$headerCells.find('.status').removeClass('sort-asc sort-desc');
                sortInfo = this.sort();
                if (sortInfo.fieldName) {
                    var field = this.fieldUnderAlias(sortInfo.fieldName);
                    if (field)
                        this.header(field.Index).find('.status').addClass(sortInfo.order != 'desc' ? 'sort-asc' : 'sort-desc')
                }
            }
        },
        showRowNumber: function () {
            return this._dataView.get_showRowNumber() == true;
        },
        multiSelect: function () {
            return this._dataView.get_showMultipleSelection();
        },
        totalRowCount: function () {
            var dataView = this._dataView;
            return dataView._totalRowCount;
        },
        pageSize: function (pageSize) {
            if (this.busy()) return;
            var dataView = this._dataView;
            if (pageSize == null)
                return dataView.get_pageSize();
            else {
                this._reset();
                dataView._clearCache();
                dataView.set_pageSize(pageSize);
            }
        },
        _contextMenuOfColumn: function (index) {
            var options = [];
            var that = this;
            var dataView = that._dataView;
            var fields = dataView._fields;
            var originalField = fields[index];
            var field = dataView._allFields[originalField.AliasIndex];
            var dvr = _web.DataViewResources;
            var headerFilterResources = dvr.HeaderFilter;
            var gridResources = dvr.Grid;
            // sort options
            if (field.AllowSorting) {
                var ascending = headerFilterResources.GenericSortAscending;
                var descending = headerFilterResources.GenericSortDescending;
                switch (field.FilterType) {
                    case 'Text':
                        ascending = headerFilterResources.StringSortAscending;
                        descending = headerFilterResources.StringSortDescending;
                        break;
                    case 'Date':
                        ascending = headerFilterResources.DateSortAscending;
                        descending = headerFilterResources.DateSortDescending;
                        break;
                }
                var sortInfo = this.sort();
                var fieldName = field.Name;
                options.push({
                    select: function () {
                        that.sort(fieldName);
                    }
                });
                options.push({
                    text: ascending, icon: 'sort-asc', checked: sortInfo.fieldName == fieldName && sortInfo.order != 'desc', select: function () {
                        that.sort(fieldName + ' asc');
                    }
                });
                options.push({
                    text: descending, icon: 'sort-desc', checked: sortInfo.fieldName == fieldName && sortInfo.order == 'desc', select: function () {
                        that.sort(fieldName + ' desc');
                    }
                });
            }
            // freeze / unfreeze opions
            var frozen = this.freeze() == originalField.Name;
            options.push({
                text: frozen ? gridResources.Unfreeze : gridResources.Freeze, select: function () {
                    that.freeze(frozen ? '' : originalField.Name);
                }
            });


            if (options.length > 0)
                return options;
            else
                return [
                    {
                        text: 'Header Item 1',
                        select: function () {
                            alert('header 1');
                        }
                    },
                    {
                        text: 'Header item number 2',
                        select2: function () {
                            alert('header 2');
                        },
                        children: [
                            {
                                text: 'Header Sub Item 1',
                                select: function () {
                                    alert('header sub item 1');
                                }
                            },
                            {
                                text: 'Header Sub Item 2',
                                select: function () {
                                    alert('header sub item 2');
                                }
                            },
                            {
                                text: 'Header Sub Item 3',
                                select: function () {
                                    alert('header sub item 3');
                                }
                            },
                            {
                                text: 'Header Sub Item 4',
                                select: function () {
                                    alert('header sub item 4');
                                }
                            },
                            {
                                text: 'Header Sub Item 5',
                                select: function () {
                                    alert('header sub item 5');
                                }
                            }
                        ]
                    },
                    {
                        text: 'item #3',
                        select: function () {
                            alert('header 3');
                        }
                    }
                ];
        },
        cursor: function (show, row, col) {
            var dataView = this._dataView;
            if (!_web.DataView.Extensions.active(this))
                show = false;
            var $dataSheet = this.$that();
            var cursor = this._cursor;
            if (!cursor)
                cursor = this._cursor = {
                    left: $('<div class="cursor left"></div>').appendTo($dataSheet).css({ position: 'absolute', width: '3px' }).hide(),
                    top: $('<div class="cursor top"></div>').appendTo($dataSheet).css({ position: 'absolute', height: '3px' }).hide(),
                    right: $('<div class="cursor right"></div>').appendTo($dataSheet).css({ position: 'absolute', width: '3px' }).hide(),
                    bottom: $('<div class="cursor bottom"></div>').appendTo($dataSheet).css({ position: 'absolute', height: '3px' }).hide(),
                    row: 0,
                    col: 0
                };
            if (show == null)
                return cursor;
            this._$dataGaps.removeClass('cursor');
            this._$headerCells.removeClass('cursor');
            if (show) {
                if (row != null)
                    cursor.row = row;
                if (col != null)
                    cursor.col = col;
                var pageSize = this.pageSize();
                var topRowIndex = this.topRowIndex(); // dataView.get_pageIndex() * pageSize + this.pageOffset();
                var rowIndex = cursor.row - topRowIndex;
                if (rowIndex < 0 || rowIndex >= pageSize)
                    this.cursor(false);
                else {
                    var $cell = this.cell(rowIndex, cursor.col);
                    var cellHeight = $cell.outerHeight() - 3;
                    var cellWidth = $cell.outerWidth() + 3;
                    cursor.left.height(cellHeight).show().position({ my: 'left top', at: 'left-2 top+1', of: $cell, collision: 'none' });
                    cursor.top.width(cellWidth).show().position({ my: 'left top', at: 'left-2 top-2', of: $cell, collision: 'none' });
                    cursor.right.height(cellHeight).show().position({ my: 'left top', at: 'right-2 top+1', of: $cell, collision: 'none' });
                    cursor.bottom.width(cellWidth).show().position({ my: 'left top', at: 'left-2 bottom-2', of: $cell, collision: 'none' });
                    this.gap(rowIndex).gap.addClass('cursor');
                    this.header(cursor.col).addClass('cursor');
                }
            }
            else {
                cursor.left.hide();
                cursor.top.hide();
                cursor.right.hide();
                cursor.bottom.hide();
            }
        }
    }
})();