/*!
 * Data Aquarium Framework - Menus for Desktop UI
 * Copyright 2008-2017 Code On Time LLC; Licensed MIT; http://codeontime.com/license
 */
(function () {
    Type.registerNamespace("Web");

    var _window = window,
        _web = Web;

    function removeIconFromCssClass(cssClass) {
        return cssClass ? cssClass.replace(/glyphicon[\w\-]+/, '') : cssClass;
    }

    var __ie6 = Sys.Browser.agent == Sys.Browser.InternetExplorer && Sys.Browser.version < 7;
    if (__ie6)
        $('body').addClass('IE6');

    _web.Item = function (family, text, description) {
        this._family = family;
        this._text = text;
        this._description = description;
        this._depth = 0;
    }

    _web.Item.prototype = {
        get_family: function () {
            return this._family;
        },
        get_text: function () {
            return this._text;
        },
        set_text: function (value) {
            this._text = value;
        },
        get_description: function () {
            return this._description;
        },
        set_description: function (value) {
            this._description = value;
        },
        get_url: function () {
            return this._url;
        },
        set_url: function (value) {
            this._url = value;
        },
        context: function (value) {
            if (arguments.length == 0)
                return this._context;
            else
                this._context = value;
        },
        get_script: function () {
            return this._script;
        },
        set_script: function (script, args) {
            this._script = args == null ? script : String._toFormattedString(false, arguments);
        },
        get_cssClass: function () {
            return this._cssClass;
        },
        set_cssClass: function (value) {
            this._cssClass = value;
        },
        get_disabled: function () {
            return this._disabled;
        },
        set_disabled: function (value) {
            this._disabled = value;
        },
        get_group: function () {
            return this._group;
        },
        set_group: function (value) {
            this._group = value;
        },
        get_selected: function () {
            return this._selected;
        },
        set_selected: function (value) {
            this._selected = value;
        },
        get_children: function () {
            return this._children;
        },
        get_confirmation: function () {
            return this._confirmation;
        },
        set_confirmation: function (value) {
            this._confirmation = value;
        },
        get_dynamic: function () {
            return this._dynamic;
        },
        set_dynamic: function (value) {
            this._dynamic = value;
            this._cssClass = value ? 'Dynamic' : '';
            this._disabled = value;
        },
        get_depth: function () {
            return this._depth;
        },
        get_parent: function () {
            return this._parent;
        },
        get_path: function () {
            if (!this._path) {
                var path = this._parent ? this._parent.get_path() + '/' : '';
                path += this._parent ? Array.indexOf(this._parent.get_children(), this) : Array.indexOf(_web.HoverMonitor.Families[this._family].items, this);
                this._path = path;
            }
            return this._path;
        },
        get_id: function () {
            if (!this._id)
                this._id = String.format('HoverMonitor${0}$Item${1}', this._family, this.get_path().replace(/\//g, '_'));
            return this._id;
        },
        get_children: function () {
            return this._children;
        },
        addChild: function (item) {
            item._parent = this;
            if (!this._children) {
                this._children = [];
                this._cssClass = 'Parent';
            }
            item._depth = this._depth + 1;
            Array.add(this._children, item);

        },
        dispose: function () {
            this._parent = null;
            if (this._children) {
                for (var i = 0; i < this._children; i++)
                    this._children[i].dispose();
                Array.clear(this._children);
                this._children = null;
            }
        },
        findChild: function (path) {
            return _web.Item.find(this._family, path, this._children);
        }
    }

    _web.Item.find = function (family, path, items) {
        if (String.isNullOrEmpty(path)) return null;
        if (!items) {
            var itemFamily = _web.HoverMonitor.Families[family];
            if (!itemFamily) return null;
            items = itemFamily.items;
        }
        var m = path.match(/^(\d+)(\/(.+?)$|$)/);
        if (!m) return null;
        var index = parseInt(m[1]);
        if (!items || index >= items.length) return null;
        var child = items[index];
        if (m[3] && m[3].length > 0)
            return child.findChild(m[3]);
        else
            return child;
    }

    _web.Menu = function (element) {
        Web.Menu.initializeBase(this, [element]);
        this.set_orientation(Web.MenuOrientation.Horizontal);
        this.set_cssClass('Menu');
        this.set_hoverStyle(Web.HoverStyle.Auto);
        this.set_itemDescriptionStyle(Web.ItemDescriptionStyle.ToolTip);
        this.set_popupPosition(Web.PopupPosition.Left);
    }

    var _menu = _web.Menu;

    _menu.prototype = {
        initialize: function () {
            _menu.callBaseMethod(this, 'initialize');
            // Add custom initialization here
        },
        dispose: function () {
            var nodes = this.get_nodes();
            for (var i = 0; i < nodes.length; i++) {
                var n = nodes[i];
                if (n.children)
                    $unregisterItems(this.get_id() + '_' + i);
            }
            _menu.callBaseMethod(this, 'dispose');
        },
        updated: function () {
            _menu.callBaseMethod(this, 'updated');
            if (!_menu.MainMenuId) {
                _menu.MainMenuId = this.get_id();
                _menu.MainMenuElemId = this._element.id;
            }
            var nodes = this.get_nodes(),
                wdvrm = _web.DataViewResources.Menu;
            if (!nodes) return;
            var style = this.get_presentationStyle();
            if (style > 0 && (typeof __tf == 'undefined' || !(__tf != 4))) {
                Sys.UI.DomElement.addCssClass(this._element, 'menu ' + (style == 1 ? 'two-level' : 'nav-button'));
                this._createMenu(nodes, this._element, 1);
                return;
            }
            var selectedNode = null;
            for (var i = 0; i < nodes.length; i++) {
                var n = nodes[i];
                this._currentNode = n;
                if (n.children) {
                    var family = this.get_id() + '_' + i;
                    var items = [];
                    for (var j = 0; j < n.children.length; j++)
                        Array.add(items, this._createItem(family, n.children[j]));
                    this.set_items(items);
                    $registerItems(family, items, this.get_hoverStyle(), this.get_popupPosition(), this.get_itemDescriptionStyle());
                    if (n.selected) selectedNode = n;
                }
            }
            this._render(nodes);
            if (this.get_showSiteActions()) {
                family = this.get_id() + '_SiteActions';
                items = [];
                if (this._selectedItem) {
                    var peers = this._selectedItem.get_parent() ? this._selectedItem.get_parent().get_children() : _web.HoverMonitor.Families[this._selectedItem.get_family()].items;
                    for (i = 0; i < peers.length; i++) {
                        var peerItem = peers[i];
                        if (!String.isNullOrEmpty(peerItem.get_url()) && peerItem != this._selectedItem) {
                            var item = new _web.Item(family, peerItem.get_text(), peerItem.get_description());
                            item.set_url(peerItem.get_url());
                            item.set_cssClass(peerItem.get_cssClass());
                            Array.add(items, item);
                        }
                    }
                }
                if (items.length == 0) {
                    if (selectedNode && selectedNode.children && !(selectedNode.children.length == 1 && selectedNode.children[0].selected))
                        nodes = selectedNode.children;
                    for (i = 0; i < nodes.length; i++) {
                        n = nodes[i];
                        if (!String.isNullOrEmpty(n.url) && (!n.selected || nodes.length == 1)) {
                            item = new _web.Item(family, n.title, n.description);
                            item.set_url(n.url);
                            item.set_cssClass(n.cssClass);
                            Array.add(items, item);
                        }
                    }
                }
                $registerItems(family, items, _web.HoverStyle.ClickAndStay, _web.PopupPosition.Right, _web.ItemDescriptionStyle.Inline);
                _menu._siteActionsFamily = family;
                var sideBar = $getSideBar(),
                    hasAbout, about = $('head meta[name="description"]'), aboutBox;
                if (sideBar && items.length > 0) {

                    for (i = 0; i < sideBar.childNodes.length; i++) {
                        var elem = sideBar.childNodes[i];
                        if (elem.className && Sys.UI.DomElement.containsCssClass(elem, 'About')) {
                            elem.getElementsByTagName('div')[1].innerHTML = wdvrm.About;
                            hasAbout = true;
                            break;
                        }
                    }
                    var sb = new Sys.StringBuilder();
                    sb.append('<div class="Inner">');
                    sb.appendFormat('<div class="Header">{0}</div>', wdvrm.SeeAlso);
                    for (i = 0; i < items.length; i++) {
                        item = items[i];
                        if (!String.isNullOrEmpty(item.get_url()))
                            sb.appendFormat('<div class="Item"><a href="{0}" title="{2}">{1}</a></div>', item.get_url(), String.trimLongWords(item.get_text()), String.trimLongWords(item.get_description()));
                        if (i > 5) break;
                    }
                    sb.append('</div>');
                    var seeAlso = document.createElement('div');
                    seeAlso.className = 'TaskBox SeeAlso';
                    seeAlso.innerHTML = sb.toString();
                    sb.clear();
                    sideBar.insertBefore(seeAlso, sideBar.childNodes[sideBar.childNodes.length - 1]);
                    if (!hasAbout && about.length) {
                        /*
                     <div class="TaskBox About">
                <div class="Inner">
                  <div class="Header">
                    <xsl:text>About</xsl:text>
                  </div>
                  <div class="Value">
                    <xsl:value-of select="app:about" disable-output-escaping="yes"/>
                  </div>
                </div>
              </div>
                        */
                        aboutBox = $('<div class="TaskBox About"><div class="Inner"><div class="Header"></div><div class="Value"></div></div></div>').insertAfter(seeAlso);
                        aboutBox.find('.Header').text(wdvrm.About);
                        aboutBox.find('.Value').text(about.attr('content'));
                    }
                }
                var tableOfContents = $get('TableOfContents');
                if (tableOfContents) {
                    sb.append('<div class="TableOfContents">');
                    for (i = 0; i < nodes.length; i++) {
                        n = nodes[i];
                        sb.appendFormat('<div class="Header">', n.get_text());

                    }
                    sb.append('</div>');
                }
            }
            else {
                var itemIndex = _web.PageState.read(this.get_id());
                if (itemIndex != null) {
                    var itemElements = this._element.getElementsByTagName('td');
                    this.select(itemIndex, itemElements[itemIndex]);
                }
            }
        },
        get_presentationStyle: function () {
            return this._presentationStyle;
        },
        set_presentationStyle: function (value) {
            this._presentationStyle = value;
        },
        _createNewColumn: function (n, parent, levelClass) {
            if (n.cssClass && n.cssClass.match(/(^|\s*)menu-new-column(\s*|$)/))
                return $('<div>').addClass('column ' + levelClass).appendTo(parent);
            return null;
        },
        _createNavButton: function (nodes) {
            var showTimeout = null;
            var hideTimeout = null;
            var hoveringOverButton = false;
            var hoveringOverMenu = false;
            var $selectedItem = null;
            $('div.PageMenuBar').hide();
            var menu = $('<ul>').attr('id', this._id).addClass('root-level');
            var container = $('<div>').addClass('menu-button-container').css({ position: 'absolute', height: '1px', left: '0px', top: '0px' });
            container.appendTo(document.body);
            menu.appendTo(container);
            var buildMenuLevel = function (items, parentMenu) {
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var $li = $('<li>').appendTo(parentMenu);
                    var $a = $('<a>').attr({ 'href': item.url, title: item.description }).text(item.title).appendTo($li);
                    if (item.selected && !item.children) {
                        $a.addClass('selected');
                        $selectedItem = $a;
                    }
                    if (item.children && item.children.length > 0)
                        buildMenuLevel(item.children, $('<ul>').addClass('menu-level').appendTo($li));
                }
            }
            buildMenuLevel(nodes, menu);
            // figure the width of the first level
            var firstLevelWidth = 0;
            var links = $('#' + this._id + ' > li > a').each(function () {
                var w = $(this).outerWidth();
                if (w > firstLevelWidth)
                    firstLevelWidth = w;
            });
            var menuButton = $('#PageHeaderBar')
                .addClass('menu-button-bar')
                .contents()
                    .wrap('<span class="menu-button"></span>')
                 .parent()
                     .button({ icons: { secondary: 'ui-icon-triangle-1-s' } });
            var menuButtonWidth = menuButton.width() - 4;
            // setup the width of sub-levels
            var subLevels = menu.find('ul').addClass('sub-level');
            for (var i = subLevels.length - 1; i >= 0; i--) {
                var ul = $(subLevels[i]);
                var levelWidth = 0;
                ul.find('> li > a').each(function () {
                    var w = $(this).outerWidth();
                    if (w > levelWidth)
                        levelWidth = w;
                }).width(levelWidth + 25);
            }
            menu.find('ul').each(function () {
                if ($(this).find('ul').length == 0)
                    $(this).addClass('last-level');
            });
            // setup the width of the first level
            firstLevelWidth += 25;
            if (menuButtonWidth > firstLevelWidth)
                menu.width(menuButtonWidth);
            else
                menu.width(firstLevelWidth);
            // create a menu
            var hideMenuFunc = function () {
                if (!hideTimeout) {
                    hideTimeout = setTimeout(function () {
                        if (!hoveringOverMenu) {
                            menu.hide();
                            menuButton.removeClass('menu-button-active');
                        }
                        hideTimeout = null;
                    }, 200);
                }
            }
            var cancelHideMenuFunc = function () {
                if (hideTimeout) {
                    clearTimeout(hideTimeout);
                    hideTimeout = null;
                }
            }
            container.find('ul').hover(
                function () {
                    hoveringOverMenu = true;
                },
                function (event) {
                    if ($(event.toElement).find("li:parent ul.menu-level:parent").length == 0) {
                        hoveringOverMenu = false;
                        hideMenuFunc();
                    }
                });

            menu
                .menu({
                    position: { of: 'ul:has(a.ui-state-focus):last' },
                    select: function (event, ui) {
                        //var link = ui.item.children('a:first');
                        //alert(link.attr('href'));
                        //event.preventDefault();
                    },
                    blur: function (event, ui) {
                        if (!hoveringOverButton)
                            hideMenuFunc();
                    },
                    focus: function (event, ui) {
                        if (hideTimeout) {
                            clearTimeout(hideTimeout);
                            hideTimeout = null;
                        }
                        menu.show();
                    }
                });
            // equalize the height of all menu levels
            var maxHeight = menu.outerHeight();
            menu.find('ul').show().each(function () {
                var h = $(this).outerHeight();
                if (h > maxHeight)
                    maxHeight = h;
            }).andSelf().height(maxHeight).hide();
            menu.hide();
            // configure the menu button
            var hoverCounter = 0;
            menuButton
                .hover(
                    function () {
                        hoveringOverButton = true;
                        cancelHideMenuFunc();
                        showTimeout = setTimeout(function () {
                            menuButton.addClass('menu-button-active');
                            menu.show().position({ my: 'left top', at: 'left bottom', of: menuButton });
                            showTimeout = null;
                            // expand the menus to the selected item
                            if ($selectedItem) {
                                $selectedItem.parentsUntil('div.menu-button-container', 'li').find('a:first').not('a.selected').addClass('ui-state-active');
                                menu.show().position({ my: 'left top', at: 'left bottom', of: menuButton });
                                var openMenus = $selectedItem.parentsUntil('div.menu-button-container', 'ul').show();
                                for (var i = openMenus.length - 2; i >= 0; i--) {
                                    var ul = $(openMenus[i]);
                                    ul.position({ my: 'left top', at: 'right top', of: $(openMenus[i + 1]) });
                                }
                                $selectedItem = null;
                            }
                        }, 500);
                    },
                    function () {
                        hoveringOverButton = false;
                        if (showTimeout) {
                            clearTimeout(showTimeout);
                            showTimeout = null;
                        }
                        hideMenuFunc();
                    }
                 );
        },
        _createMenu: function (nodes, parent, level) {
            var isNavButton = this._presentationStyle == 2;
            var buttonText = null;
            if (level == 1 && isNavButton) {
                this._createNavButton(nodes);
                return;
            }
            var selectedNode = null;
            var levelClass = 'level' + level;
            if (level > 1)
                parent = $('<div>').addClass('children ' + levelClass).appendTo(parent.first());

            var column = null;
            if (level == 2)
                for (var i = 0; i < nodes.length; i++) {
                    var n = nodes[i];
                    column = this._createNewColumn(n, parent, levelClass);
                    if (column) {
                        column.addClass('first');
                        break;
                    }
                }
            var ul = $('<ul>').addClass(levelClass).appendTo(column ? column : parent);
            var firstText = true;
            for (i = 0; i < nodes.length; i++) {
                n = nodes[i];
                if (column && i > 0) {
                    var newColumn = this._createNewColumn(n, parent, levelClass);
                    if (newColumn) {
                        column = newColumn;
                        ul = $('<ul>').addClass(levelClass).appendTo(newColumn);
                        firstText = true;
                    }
                }
                var li = $('<li>').addClass(levelClass).appendTo(ul);
                if (n.selected) {
                    li.addClass('current');
                    selectedNode = n;
                }
                if (i == 0)
                    li.addClass('first');
                if (i == nodes.length - 1)
                    li.addClass('last');
                var url = n.url;
                if (String.isNullOrEmpty(url) && level == 1)
                    url = "javascript:void(0)";
                if (!String.isNullOrEmpty(url)) {
                    var link = $('<a>').attr({ 'href': url, 'class': levelClass, 'tabIndex': $nextTabIndex() }).appendTo(li);
                    if (url.match(_menu.UrlRegex.match)) {
                        link.attr('menuItemUrl', url);
                        link.click(function (event) {
                            event.preventDefault();
                            _menu.navigate(this.getAttribute('menuItemUrl'))
                        });
                    }
                    var span = $('<span>').addClass('outer').appendTo(link);
                    $('<span>').addClass('inner').appendTo(span).text(n.title).attr('title', n.description);
                }
                else {
                    var text = $('<span>').addClass('text ' + levelClass).text(n.title).appendTo(li);
                    if (firstText) {
                        firstText = false;
                        text.addClass('first');
                    }
                }
                if (level == 1)
                    if (isNavButton)
                        li.hover(
                            function () {
                                var item = $(this).addClass('hover');
                                item.siblings('li').addClass('unhover');
                                var menu = $('div.level2:first', this);
                                if (menu.size() == 1) {
                                    var parent = $(this).parents('div.nav-button.menu:first');
                                    var parentPos = parent.offset();
                                    var parentWidth = parent.outerWidth();
                                    var parentHeight = parent.outerHeight();
                                    parentPos.left += parentWidth;
                                    menu.removeAttr('style').offset({ left: 0, top: 0 }).css('width', 'auto');
                                    menu.removeAttr('style').offset(parentPos)
                                }
                            },
                            function () {
                                var item = $(this).removeClass('hover').siblings('li').removeClass('unhover');
                                $('div.level2:first', this).hide();
                            }
                        );
                    else {
                        li.hover(
                            function () {
                                var item = $(this).addClass('hover');
                                item.siblings('li').addClass('unhover');
                                $closeHovers();
                                var menu = $('div.level2:first', this);
                                if (menu.size() == 1) {
                                    var itemPos = item.offset();
                                    itemPos.top += item.outerHeight();
                                    var itemWidth = item.outerWidth();
                                    var clientWidth = $(window).width();
                                    var clientHeight = $(window).height();
                                    menu.removeAttr('style').offset({ left: 0, top: 0 });
                                    var menuWidth = menu.outerWidth();
                                    if (itemPos.left + menuWidth > clientWidth)
                                        itemPos.left = clientWidth - menuWidth - 10;
                                    if (itemPos.left < 0)
                                        itemPos.left = 0;
                                    menu.hide().removeAttr('style').offset(itemPos);
                                }
                            },
                            function () {
                                var item = $(this).removeClass('hover').siblings('li').removeClass('unhover');
                                $('div.level2:first', this).hide();
                            }
                        );
                    }
                var hasChildren = n.children && n.children.length > 0;
                if (hasChildren) {
                    var selectedChild = (this._createMenu(n.children, li, level + 1))
                    if (selectedChild) {
                        selectedNode = selectedChild;
                        li.addClass('selected');
                    }
                    li.addClass('parent');
                    if (level == 1 && n.cssClass)
                        $('div.children:first', li).addClass(n.cssClass);
                }
                else
                    li.addClass('terminal');
                if (level == 2)
                    parent.hide();
            }
            return selectedNode;
        },
        get_nodes: function () {
            if (!this._nodes)
                this._nodes = _menu.Nodes[this.get_id()];
            return this._nodes;
        },
        set_nodes: function (value) {
            this._nodes = value;
        },
        get_orientation: function () {
            return this._orientation;
        },
        set_orientation: function (value) {
            this._orientation = value;
        },
        get_cssClass: function () {
            return this._cssClass;
        },
        set_cssClass: function (value) {
            this._cssClass = value;
        },
        get_hoverStyle: function () {
            return this._hoverStyle;
        },
        set_hoverStyle: function (value) {
            this._hoverStyle = value;
        },
        get_itemDescriptionStyle: function () {
            return this._itemDescriptionStyle;
        },
        set_itemDescriptionStyle: function (value) {
            this._itemDescriptionStyle = value;
        },
        get_popupPosition: function () {
            return this._popupPosition;
        },
        set_popupPosition: function (value) {
            this._popupPosition = value;
        },
        get_showSiteActions: function () {
            return this._showSiteActions;
        },
        set_showSiteActions: function (value) {
            this._showSiteActions = value;
        },
        get_items: function () {
            return this._items;
        },
        set_items: function (value) {
            this._items = value;
        },
        _createItem: function (family, node, parentItem) {
            var item = new _web.Item(family, node.title, node.description);
            item.set_url(node.url);
            if (node.selected) {
                item.set_selected(node.selected);
                this._currentNode.selected = true;
                this._selectedItem = item;
            }
            if (parentItem)
                parentItem.addChild(item);
            if (node.children) {
                for (var i = 0; i < node.children.length; i++)
                    this._createItem(family, node.children[i], item);
            }
            return item;
        },
        _render: function (nodes) {
            $('td.Item', this._element).unbind('mouseover mouseout click');
            $('td.Item a.Link', this._element).unbind('click focus blur');
            var sb = new Sys.StringBuilder();
            sb.appendFormat('<table class="{0}" cellpadding="0" cellspacing="0" style="float:left">', this.get_cssClass());
            if (this.get_orientation() == _web.MenuOrientation.Horizontal)
                sb.append('<tr>');
            for (var i = 0; i < nodes.length; i++) {
                var n = nodes[i];
                if (this.get_orientation() == _web.MenuOrientation.Vertical)
                    sb.append('<tr>');
                sb.appendFormat('<td class="Item{3}" onmouseover2="$showHover(this,&quot;{0}_{1}&quot;,&quot;{4}&quot;)" onmouseout2="$hideHover(this)" onclick2="if(this._skip)this._skip=false;else $find(&quot;{0}&quot).select({1},this);"{7}><span class="Outer"><span class="Inner"><span class="Link"><a href="javascript:" class="Link" onclick2="this.parentNode.parentNode.parentNode.parentNode._skip=true;$hoverOver(this, 4);$find(&quot;{0}&quot).select({1},this);return false;" onfocus2="$showHover(this,&quot;{0}_{1}&quot;,&quot;{4}&quot;, 4)" onblur2="$hideHover(this)" tabIndex="{6}" {5}>{2}</a></span></span></span></td>',
                        this.get_id(), i, $appfactory.htmlEncode(n.title), (n.children ? ' Parent' : '') + (n.selected ? ' Selected' : ''), this.get_cssClass(), String.isNullOrEmpty(n.description) || this.get_itemDescriptionStyle() == _web.ItemDescriptionStyle.None ? '' : String.format(' title="{0}"', $appfactory.htmlAttributeEncode(n.description)), $nextTabIndex(), n.hidden == 'true' ? ' style="display:none"' : '');
                if (this.get_orientation() == _web.MenuOrientation.Vertical)
                    sb.append('</tr>');
            }
            if (this.get_orientation() == _web.MenuOrientation.Horizontal)
                sb.append('</tr>');
            sb.append('</table>');
            if (this.get_showSiteActions()) {
                sb.appendFormat('<table class="Menu SiteActions" cellpadding="0" cellspacing="0" style="float:right"><tr><td class="Item Parent" onmouseover2="$showHover(this,&quot;{0}_SiteActions&quot;,&quot;SiteActions&quot;)" onmouseout2="$hideHover(this)" onclick2="if(this._skip)this._skip=false;else $toggleHover()"><span class="Outer"><span class="Inner"><span class="Link"><a href="javascript:" class="Link" onclick2="this.parentNode.parentNode.parentNode.parentNode._skip=true;$toggleHover();$hoverOver(this, 4);return false" onfocus2="$showHover(this,&quot;{0}_SiteActions&quot;,&quot;SiteActions&quot;, 4)" onblur2="$hideHover(this)" tabIndex="{1}">{2}</a></span></span></span></td></tr></table>',
                    this.get_id(), $nextTabIndex(), _web.DataViewResources.Menu.SiteActions);
                var siteActions = document.createElement('div');
                this._element.parentNode.appendChild(siteActions);
            }
            this._element.innerHTML = sb.toString();
            $('td.Item', this._element)
                .mouseover(function () { return __evalEvent.call(this, 'mouseover'); })
                .mouseout(function () { return __evalEvent.call(this, 'mouseout'); })
                .click(function (e) { e.preventDefault(); return __evalEvent.call(this, 'click'); });
            $('td.Item a.Link', this._element)
                .click(function (e) { e.preventDefault(); return __evalEvent.call(this, 'click'); })
                .focus(function () { return __evalEvent.call(this, 'focus'); })
                .blur(function () { return __evalEvent.call(this, 'blur'); });
            sb.clear();

        },
        select: function (index, source) {
            _body_createPageContext();
            var n = this.get_nodes()[index];
            if (!String.isNullOrEmpty(n.elementId)) {
                _web.PageState.write(this.get_id(), index);
                var elem = $get(n.elementId);
                for (var i = 0; i < this.get_nodes().length; i++) {
                    n = this.get_nodes()[i];
                    if (!String.isNullOrEmpty(n.elementId))
                        Sys.UI.DomElement.setVisible($get(n.elementId), false);
                }
                Sys.UI.DomElement.setVisible(elem, true);
                while (!Sys.UI.DomElement.containsCssClass(source, 'Item'))
                    source = source.parentNode;
                for (i = 0; i < source.parentNode.childNodes.length; i++)
                    Sys.UI.DomElement.removeCssClass(source.parentNode.childNodes[i], 'Selected');
                Sys.UI.DomElement.addCssClass(source, 'Selected');
                _body_performResize();
                try {
                    source.focus();
                }
                catch (err) {
                }
            }
            else
                _menu.navigate(n.url);
        }
    }

    _menu.Nodes = [];

    _menu.findNode = function (url, root) {
        if (!root) root = this.Nodes[this.MainMenuId];
        for (var i = 0; i < root.length; i++) {
            var n = root[i];
            if (n.url.match(url))
                return n;
            if (n.children) {
                var result = _menu.findNode(url, n.children);
                if (result)
                    return result;
            }
        }
        return null;
    }

    _menu.get_siteActionsFamily = function () {
        return _menu._siteActionsFamily;
    }

    _menu.get_siteActions = function () {
        return _web.HoverMonitor.Families[this._siteActionsFamily].items
    }

    _menu.set_siteActions = function (items) {
        _web.HoverMonitor.Families[this._siteActionsFamily].items = items;
    }

    _menu.UrlRegex = /^(_.+?):(.+?)$/;

    _menu.navigate = function (url) {
        if (String.isNullOrEmpty(url)) return;
        var m = url.match(_menu.UrlRegex);
        if (m)
            window.open(m[2], m[1]);
        else {
            $appfactory._navigated = true;
            location.href = url;
        }
    }

    _menu.registerClass('Web.Menu', Sys.UI.Behavior);

    _web.HoverStyle = {
        'None': 0,
        'Auto': 1,
        'Click': 2,
        'ClickAndStay': 3
    }

    _web.PopupPosition = {
        'Left': 0,
        'Right': 1
    }

    _web.MenuOrientation = {
        'Horizontal': 0,
        'Vertical': 1
    }

    _web.ItemDescriptionStyle = {
        'None': 0,
        'Inline': 1,
        'ToolTip': 2
    }

    _web.HoverMonitor = function () {
        _web.HoverMonitor.initializeBase(this);
        this._popups = [];
    }

    _web.HoverMonitor.prototype = {
        initialize: function () {
            _web.HoverMonitor.callBaseMethod(this, 'initialize');
            this._hoverArrowHandlers = {
                'click': this._hoverArrow_click,
                'mouseover': this._hoverArrow_mouseover,
                'mouseout': this._hoverArrow_mouseout
            }
            this._hoverMenuHandlers = {
                'mouseover': this._hoverMenu_mouseover,
                'mouseout': this._hoverMenu_mouseout
            }
            this._documentKeydownHandler = Function.createDelegate(this, this._document_keydown);
            this._documentClickHandler = Function.createDelegate(this, this._document_click);
            $addHandler(document, 'keydown', this._documentKeydownHandler);
            $addHandler(document, 'click', this._documentClickHandler);
            this._tabIndex = 1;
        },
        dispose: function () {
            delete this._factory;
            for (var i = 0; i < _web.HoverMonitor.Families.length; i++)
                $unregisterItems(_web.HoverMonitor.Families[i].family);
            $removeHandler(document, 'click', this._documentClickHandler);
            $removeHandler(document, 'keydown', this._documentKeydownHanlder);
            this.stopClose();
            this.stopCloseItem();
            this.stopOpen();
            for (i = 0; i < this._popups.length; i++)
                this._destroyPopup(i);
            this._destroyFrame(this._hoverFrame);
            this._destroyFrame(this._openFrame);
            _web.HoverMonitor.callBaseMethod(this, 'dispose');
        },
        nextTabIndex: function () {
            return this._tabIndex++;
        },
        _createPopup: function (level) {
            if (!this._popups[level]) {
                var container = document.createElement('div');
                document.body.appendChild(container);
                container.className = 'HoverMenu';
                Sys.UI.DomElement.setVisible(container, false);
                var behavior = $create(AjaxControlToolkit.PopupBehavior, { 'id': 'HoverMonitorPopup' + level }, null, null, container);
                var popup = { 'behavior': behavior, 'container': container };
                this._popups[level] = popup;
                $addHandlers(container, this._hoverMenuHandlers, this);
            }
            return this._popups[level];
        },
        _destroyPopup: function (level) {
            var popup = this._popups[level];
            if (!popup) return;
            popup.behavior.dispose();
            $clearHandlers(popup.container);
            popup.container.parentNode.removeChild(popup.container);
            //document.body.removeChild(popup.container);
            delete popup.container;
            delete this._popups[level]
        },
        _renderPopup: function (popup, family, item, cssClass) {
            var sb = new Sys.StringBuilder();
            popup.container.style.width = '';
            popup.container.style.height = '';
            popup.container.style.overflow = '';
            popup.container.className = String.format('HoverMenu {0}_HoverMenu', cssClass);
            // render items
            var hasDescriptions = false;
            var itemDescriptionStyle = this.get_itemDescriptionStyle(family);
            var f = _web.HoverMonitor.Families[family];
            if (f) {
                var items = item ? item.get_children() : f.items;
                var currentGroup = null;
                for (var i = 0; i < items.length; i++) {
                    item = items[i];
                    if (item.get_group() != currentGroup) {
                        if (currentGroup != null)
                            sb.append('</div>');
                        currentGroup = item.get_group();
                        if (currentGroup != null)
                            sb.append('<div class="Group">');
                    }
                    if (item.get_text()) {
                        var isSelected = item.get_selected();
                        sb.append('<a href="javascript:" class="Item');
                        if (item.get_cssClass())
                            sb.append(' ' + removeIconFromCssClass(item.get_cssClass()));
                        if (isSelected)
                            sb.append(' Selected');
                        if (item.get_disabled())
                            sb.appendFormat(' {0}Disabled Disabled', removeIconFromCssClass(item.get_cssClass()));
                        sb.append('"');
                        if (item.get_disabled())
                            sb.append(' onclick2="return false"');
                        else {
                            path = item.get_path();
                            sb.appendFormat(' onclick2="$selectItem(&quot;{0}&quot;,&quot;{1}&quot);return false"', family, path);
                            sb.appendFormat(' onmouseover2="$activateItem(&quot;{0}&quot;,&quot;{1}&quot;)" onmouseout2="$deactivateItem(&quot;{0}&quot;,&quot;{1}&quot;)"', family, path);
                        }
                        var description = itemDescriptionStyle == _web.ItemDescriptionStyle.None ? null : item.get_description();
                        if (!item.get_children() && description != null && itemDescriptionStyle == _web.ItemDescriptionStyle.ToolTip)
                            sb.appendFormat(' title="{0}"', $appfactory.htmlAttributeEncode(description));
                        sb.appendFormat(' id="{0}"', item.get_id());
                        sb.append('>');
                        if (isSelected && item.get_children())
                            sb.append('<div class="Parent">');
                        var text = String.htmlEncode(item.get_text()),
                            icon = $app.cssToIcon(item.get_cssClass());
                        if (icon && icon.match(/glyphicon /))
                            text = '<span class="' + icon + '"> </span>' + text;
                        if (!String.isNullOrEmpty(description) && itemDescriptionStyle == _web.ItemDescriptionStyle.Inline) {
                            hasDescriptions = true;
                            sb.appendFormat('<span class="Outer"><span class="Inner"><span class="Self"><span class="Text">{0}</span><span class="Description">{1}</span></span></span></span>', text, description);
                        }
                        else
                            sb.appendFormat('<span class="Outer"><span class="Inner"><span class="Self">{0}</span></span></span>', text);
                        if (isSelected && item.get_children())
                            sb.append('</div>');
                        sb.append('</a>');
                        if (item.get_dynamic())
                            window.setTimeout(item.get_script(), 50);

                    }
                    else
                        sb.append('<div class="Break"></div>');

                }
                if (currentGroup != null)
                    sb.append('</div>');
            }
            else
                return null;
            // return popup to the caller
            var factory = this._factory;
            if (!factory)
                factory = this._factory = document.createElement('div');
            $('a.Item', popup.container).unbind('click mouseover mouseout')
            factory.innerHTML = sb.toString();
            popup.container.innerHTML = '';
            i = 0;
            while (factory.childNodes.length > 0) {
                var node = factory.childNodes[0];
                factory.removeChild(node);
                popup.container.appendChild(node);
            }
            sb.clear();
            if (hasDescriptions)
                popup.container.className = popup.container.className + ' ' + popup.container.className.replace(/(\w+)/g, '$1Ex');
            $('a.Item', popup.container)
                .mouseover(function () { return __evalEvent.call(this, 'mouseover'); })
                .mouseout(function () { return __evalEvent.call(this, 'mouseout'); })
                .click(function () { return __evalEvent.call(this, 'click'); });
            return popup;
        },
        _createFrame: function (zIndex) {
            var frame = { 'top': document.createElement('div'), 'right': document.createElement('div'), 'bottom': document.createElement('div'), 'left': document.createElement('div'), 'arrow': document.createElement('div') };
            frame.top.style.position = 'absolute';
            frame.top.style.display = 'none';
            frame.top.style.zIndex = zIndex;
            frame.top.className = 'HoverMonitor_TopLine';
            document.body.appendChild(frame.top);
            frame.right.style.position = 'absolute';
            frame.right.style.display = 'none';
            frame.right.style.zIndex = zIndex;
            frame.right.className = 'HoverMonitor_RightLine';
            document.body.appendChild(frame.right);
            frame.bottom.style.position = 'absolute';
            frame.bottom.style.display = 'none';
            frame.bottom.style.zIndex = zIndex;
            frame.bottom.className = 'HoverMonitor_BottomLine';
            document.body.appendChild(frame.bottom);
            frame.left.style.position = 'absolute';
            frame.left.style.display = 'none';
            frame.left.style.zIndex = zIndex;
            frame.left.className = 'HoverMonitor_LeftLine';
            document.body.appendChild(frame.left);
            frame.arrow.style.position = 'absolute';
            frame.arrow.style.display = 'none';
            frame.arrow.style.zIndex = zIndex;
            frame.arrow.className = 'HoverMonitor_Arrow';
            document.body.appendChild(frame.arrow);
            frame.arrow.innerHTML = String.format('<div style="z-index:{0}"></div>', zIndex + 1);
            return frame;
        },
        _destroyFrame: function (f) {
            if (!f) return;
            document.body.removeChild(f.top);
            delete f.top;
            document.body.removeChild(f.right);
            delete f.right;
            document.body.removeChild(f.bottom);
            delete f.bottom;
            document.body.removeChild(f.left);
            delete f.left;
            $clearHandlers(f.arrow);
            document.body.removeChild(f.arrow);
            delete f.arrow;
            delete f.element;
        },
        get_hoverFrame: function () {
            if (!this._hoverFrame) {
                this._hoverFrame = this._createFrame(_web.HoverMonitor.HoverFrameZIndex);
                $addHandlers(this._hoverFrame.arrow, this._hoverArrowHandlers, this);
            }
            return this._hoverFrame;
        },
        get_openFrame: function () {
            if (!this._openFrame)
                this._openFrame = this._createFrame(_web.HoverMonitor.OpenFrameZIndex);
            return this._openFrame;
        },
        get_hoverItems: function (frame) {
            var family = _web.HoverMonitor.Families[frame.family];
            return family ? family.items : null;

        },
        get_hoverStyle: function (frame) {
            var family = _web.HoverMonitor.Families[frame.family];
            return family ? family.style : _web.HoverStyle.None;
        },
        get_PopupPosition: function (frame) {
            var family = _web.HoverMonitor.Families[frame.family];
            return family ? family.position : _web.HoverStyle.Left;
        },
        get_itemDescriptionStyle: function (family) {
            var f = _web.HoverMonitor.Families[family];
            return f ? f.itemDescriptionStyle : _web.HoverStyle.Inline;
        },
        get_hoverBounds: function (frame) {
            var bounds = $appfactory.bounds(frame.element);
            //        if (Sys.Browser.agent == Sys.Browser.InternetExplorer && Sys.Browser.version > 7) {
            //            bounds.x += 2;
            //            bounds.y += 2;
            //        }
            //        else if (Sys.Browser.agent != Sys.Browser.Firefox) {
            //            bounds.width += 1;
            //        }
            return bounds;
        },
        deactivate: function (family, path) {
            var item = _web.Item.find(family, path);
            if (item) {
                var elem = $get(item.get_id());
                Sys.UI.DomElement.removeCssClass(elem, 'Active')
                this.cancelAutoShow();
            }
        },
        get_activeFamily: function () {
            return this._activeFamily;
        },
        get_activePath: function () {
            return this._activePath;
        },
        get_activeItem: function () {
            return _web.Item.find(this.get_activeFamily(), this.get_activePath());
        },
        get_hoverFamily: function () {
            var family = this.get_hoverFrame().family;
            return _web.HoverMonitor.Families[family];
        },
        get_openFamily: function () {
            var family = this.get_openFrame().family;
            return _web.HoverMonitor.Families[family];
        },
        get_isVisible: function () {
            return this.get_hoverFrame().visible;
        },
        get_isOpen: function () {
            return this.get_openFrame()._open;
        },
        showFrame: function (elem, family, cssClass, frame) {
            //        if (frame.visible)
            //            this.hideFrame(frame);
            frame.cssClass = cssClass;
            frame.family = family;
            frame.element = elem;
            Sys.UI.DomElement.addCssClass(elem, frame.cssClass + '_Hover');
            var bounds = this.get_hoverBounds(frame);
            Sys.UI.DomElement.setVisible(frame.top, true);
            frame.top.style.width = bounds.width + 'px';
            frame.top.style.left = bounds.x + 'px';
            frame.top.style.top = bounds.y + 'px';
            //Sys.UI.DomElement.addCssClass(frame.top, cssClass + '_TopLine');
            frame.top.className = 'HoverMonitor_TopLine ' + cssClass + '_TopLine';
            // show right line
            Sys.UI.DomElement.setVisible(frame.right, true);
            frame.right.style.left = (bounds.x + bounds.width - 1) + 'px';
            frame.right.style.top = bounds.y + 'px';
            frame.right.style.height = bounds.height + 'px';
            //Sys.UI.DomElement.addCssClass(frame.right, cssClass + '_RightLine');
            frame.right.className = 'HoverMonitor_RightLine ' + cssClass + '_RightLine';
            // show bottom line
            Sys.UI.DomElement.setVisible(frame.bottom, true);
            frame.bottom.style.left = bounds.x + 'px';
            frame.bottom.style.top = (bounds.y + bounds.height - 1) + 'px';
            frame.bottom.style.width = bounds.width + 'px';
            //Sys.UI.DomElement.addCssClass(frame.bottom, cssClass + '_BottomLine');
            frame.bottom.className = 'HoverMonitor_BottomLine ' + cssClass + '_BottomLine';
            // show left line
            Sys.UI.DomElement.setVisible(frame.left, true);
            frame.left.style.left = bounds.x + 'px';
            frame.left.style.top = bounds.y + 'px';
            frame.left.style.height = bounds.height + 'px';
            //Sys.UI.DomElement.addCssClass(frame.left, cssClass + '_LeftLine');
            frame.left.className = 'HoverMonitor_LeftLine ' + cssClass + '_LeftLine';
            // show arrow
            var f = _web.HoverMonitor.Families[frame.family];
            if (f) {
                Sys.UI.DomElement.setVisible(frame.arrow, true);
                //Sys.UI.DomElement.addCssClass(frame.arrow, cssClass + '_Arrow');
                frame.arrow.className = 'HoverMonitor_Arrow ' + cssClass + '_Arrow';
                var arrowVisible = Sys.UI.DomElement.getVisible(frame.arrow);
                if (!arrowVisible)
                    Sys.UI.DomElement.setVisible(frame.arrow, true);
                var arrowBounds = $appfactory.borderBox(frame.arrow); // $common.getBorderBox(frame.arrow);
                bounds.width -= arrowBounds.horizontal;
                bounds.height -= arrowBounds.vertical;
                var arrowWidth = frame.arrow.offsetWidth - arrowBounds.horizontal;
                frame.arrow.style.top = (bounds.y + 1) + 'px';
                frame.arrow.style.left = (bounds.x + bounds.width - 1 - arrowWidth) + 'px';
                frame.arrow.style.height = (bounds.height - 2) + 'px';
                if (!arrowVisible)
                    Sys.UI.DomElement.setVisible(frame.arrow, false);
            }
            frame.visible = true;
        },
        hideFrame: function (frame) {
            if (!frame.element) return;
            //Sys.UI.DomElement.removeCssClass(frame.top, frame.cssClass + '_TopLine');
            frame.top.className = 'HoverMonitor_TopLine';
            Sys.UI.DomElement.setVisible(frame.top, false);
            //Sys.UI.DomElement.removeCssClass(frame.right, frame.cssClass + '_RightLine');
            frame.right.className = 'HoverMonitor_RightLine';
            Sys.UI.DomElement.setVisible(frame.right, false);
            //Sys.UI.DomElement.removeCssClass(frame.bottom, frame.cssClass + '_BottomLine');
            frame.bottom.className = 'HoverMonitor_BottomLine';
            Sys.UI.DomElement.setVisible(frame.bottom, false);
            //Sys.UI.DomElement.removeCssClass(frame.left, frame.cssClass + '_LeftLine');
            frame.left.className = 'HoverMonitor_LeftLine';
            Sys.UI.DomElement.setVisible(frame.left, false);
            //Sys.UI.DomElement.removeCssClass(frame.arrow, frame.cssClass + '_Arrow');
            frame.arrow.className = 'HoverMonitor_Arrow';
            frame.arrow.style.width = '';
            Sys.UI.DomElement.setVisible(frame.arrow, false);
            // clean up
            Sys.UI.DomElement.removeCssClass(frame.element, frame.cssClass + '_Hover');
            frame.visible = false;
        },
        hidePopups: function (depth) {
            //if (this.get_activePath() && this.get_activePath().startsWith('5/30/')) debugger
            if (depth == null) depth = 0;
            for (var i = depth; i < this._popups.length; i++) {
                var p = this._popups[i];
                if (p) p.behavior.hide();
            }
            if (depth == 0) {
                var openFrame = this.get_openFrame();
                openFrame._open = false;
                openFrame.family = null;
                openFrame.cssClass = null;
                delete openFrame.element;
                this._activeFamily = null;
                this._activePath = null;
            }
        },
        showPopup: function (frame, item) {
            this.stopOpen();
            var depth = item ? item.get_depth() + 1 : 0;
            this.hidePopups(depth);
            var clientBounds = $appfactory.clientBounds();
            //if (!$appfactory.scrolling()) return;
            var scrolling = $appfactory.scrolling(); // $appfactory.scrolling();
            var popup = this._renderPopup(this._createPopup(depth), frame.family, item, frame.cssClass);
            if (!popup) return;
            var itemElement = item ? $get(item.get_id()) : null;
            var hoverBounds = itemElement ? $appfactory.bounds(itemElement) : this.get_hoverBounds(frame);
            if (item) {
                hoverBounds.x = hoverBounds.x + hoverBounds.width + 2;
                hoverBounds.y = hoverBounds.y - (hoverBounds.height - 2);
            }
            popup.behavior.set_x(hoverBounds.x);
            popup.behavior.set_y(hoverBounds.y + hoverBounds.height);
            popup.behavior.show();
            if (itemElement) {
                var bounds = $appfactory.bounds(popup.container);
                var showOnLeft = scrolling.x + clientBounds.width < bounds.x + bounds.width;
                if (!showOnLeft) {
                    for (var i = depth - 2; i >= 0; i--) {
                        var peerBounds = $appfactory.bounds(this._popups[i].container);
                        var overlap = peerBounds.x < bounds.x && peerBounds.x + peerBounds.width > bounds.x;
                        if (overlap) {
                            showOnLeft = true;
                            break;
                        }
                    }
                }
                hoverBounds = $appfactory.bounds(itemElement);
                if (showOnLeft) {
                    hoverBounds.x = hoverBounds.x - bounds.width;
                    if (hoverBounds.x >= 0)
                        popup.container.style.left = hoverBounds.x + 'px';
                }
            }
            // adjust the menu position
            if (depth == 0 && _web.PopupPosition.Right == this.get_PopupPosition(frame)) {
                //var size = $common.getSize(popup.container);
                popup.container.style.left = (hoverBounds.x + hoverBounds.width - $(popup.container).outerWidth()/* size.width*/) + 'px';
            }
            // reposition the menu if out of the client bounds
            bounds = $appfactory.bounds(popup.container);
            if (bounds.x + bounds.width >= scrolling.x + clientBounds.width)
                popup.container.style.left = (scrolling.x + clientBounds.width - bounds.width) + 'px';
            else if (bounds.x < scrolling.x)
                popup.container.style.left = scrolling.x + 'px';
            if (bounds.y + bounds.height >= scrolling.y + clientBounds.height) {
                var needNewY = true;
                var groups = popup.container.getElementsByTagName('div');
                for (i = 0; i < groups.length; i++) {
                    var g = groups[i];
                    if (g.className == 'Group') {
                        var maxHeight = Math.ceil((scrolling.y + clientBounds.height - hoverBounds.y) / 5 * 4);
                        var gb = $appfactory.bounds(g);
                        var minHeight = gb.height < 100 ? gb.height : 100;
                        gb.height = maxHeight - (gb.y - bounds.y);
                        if (gb.height < minHeight)
                            gb.height = minHeight;
                        else
                            needNewY = false;
                        if (g.offsetHeight > gb.height) {
                            g._autoScrolling = true;
                            g.style.height = gb.height + 'px';
                            g.style.overflow = 'auto';
                            g.style.overflowX = 'hidden';
                            if (g.offsetWidth < gb.width && window.external) {
                                var n = g.childNodes[g.childNodes.length - 1];
                                var paddingBox = $appfactory.paddingBox(n); //$common.getPaddingBox(n);
                                var borderBox = $appfactory.borderBox(n); // $common.getBorderBox(n);
                                n.style.width = (gb.width - paddingBox.horizontal - borderBox.horizontal) + 'px';
                            }
                        }
                        bounds = $appfactory.bounds(popup.container);
                        break;
                    }
                }
                groups = null;
                if (needNewY) {
                    var y = hoverBounds.y + hoverBounds.height - bounds.height;
                    if (y < scrolling.y) y = scrolling.y;
                    popup.container.style.top = y + 'px';
                    if (y + bounds.height > scrolling.y + clientBounds.height) {
                        popup.container.style.top = (scrolling.y + clientBounds.height - bounds.height - 2) + 'px';
                        bounds = $appfactory.bounds(popup.container);
                        if (bounds.y < scrolling.y) {
                            popup.container.style.top = scrolling.y + 'px';
                            if (bounds.height > clientBounds.height) {
                                borderBox = $appfactory.borderBox(popup.container); // $common.getBorderBox(popup.container);
                                paddingBox = $appfactory.paddingBox(popup.container); // $common.getPaddingBox(popup.container);
                                popup.container.style.height = (clientBounds.height - borderBox.vertical - paddingBox.vertical) + 'px';
                                popup.container.style.overflow = 'auto';
                                popup.container.style.overflowX = 'hidden';
                            }
                        }
                    }
                    if (!itemElement) {
                        bounds = $appfactory.bounds(popup.container);
                        bounds.y = hoverBounds.y - bounds.height;
                        if (bounds.y < scrolling.y) {
                            var spaceOnRight = scrolling.x + clientBounds.width - (hoverBounds.x + hoverBounds.width);
                            if (spaceOnRight >= bounds.width)
                                popup.container.style.left = (hoverBounds.x + hoverBounds.width) + 'px';
                            else {
                                bounds.x = hoverBounds.x - bounds.width;
                                if (bounds.x < 0) bounds.x = 0;
                                popup.container.style.left = bounds.x + 'px';
                            }
                            bounds.y = scrolling.y;
                        }
                        popup.container.style.top = bounds.y + 'px';
                        //                    if ($common.overlaps(bounds, hoverBounds)) {
                        //                        var spaceOnRight = scrolling.x + clientBounds.width - (hoverBounds.x + hoverBounds.width);
                        //                        if (spaceOnRight >= bounds.width)
                        //                            popup.container.style.left = (hoverBounds.x + hoverBounds.width) + 'px';
                        //                        else {
                        //                            bounds.x = hoverBounds.x - bounds.width;
                        //                            if (bounds.x < 0) bounds.x = 0;
                        //                            popup.container.style.left = bounds.x + 'px';
                        //                        }
                        //                    }
                    }
                }
            }
            popup.container.style.zIndex = _web.HoverMonitor.HoverMenuZIndex;
            var openFrame = this.get_openFrame();
            // remember the current hover properties in the open frame
            openFrame.family = frame.family;
            openFrame.cssClass = frame.cssClass;
            openFrame.element = frame.element;
            openFrame._open = true;
        },
        hover: function (elem, family, cssClass, depth) {
            var that = this;
            if (that._hoverElement == elem)
                return;
            if (depth == null) depth = 0;
            that.stopOpen();
            that.stopClose();
            while (depth-- > 0 && elem) elem = elem.parentNode;
            var frame = that.get_hoverFrame();
            frame.arrow.className = 'HoverMonitor_Arrow';
            var openStyle = that.get_hoverStyle(that.get_openFrame());
            that.hideFrame(that.get_openFrame());
            that.showFrame(elem, family, cssClass, frame);
            var isOpen = that.get_isOpen();
            if (isOpen) {
                if (that.get_hoverFrame().element != that.get_openFrame().element && openStyle == _web.HoverStyle.Auto || openStyle == _web.HoverStyle.ClickAndStay)
                    that.hidePopups();
            }
            if (that._skipOpen) {
                that._skipOpen = false;
                return;
            }
            var style = that.get_hoverStyle(that.get_hoverFrame());
            if (style == _web.HoverStyle.Auto) {
                that._hoverTimeout = setTimeout(function () {
                    that._hoverElement = null;
                    that.showPopup(that.get_hoverFrame());
                }, 200);
            }
            else if (isOpen && style == _web.HoverStyle.ClickAndStay) {
                that.showPopup(that.get_hoverFrame());
            }
            else {
                if (isOpen) that._showOpenFrame();
            }
        },
        _showOpenFrame: function () {
            var openFrame = this.get_openFrame();
            if (this.get_isOpen()) {
                if (!openFrame.element) openFrame = this.get_hoverFrame();
                this.showFrame(openFrame.element, openFrame.family, openFrame.cssClass, openFrame);
            }
        },
        cancelAutoShow: function () {
            var that = this;
            clearTimeout(that._hoverTimeout);
            that._hoverTimeout = null;
            that._hoverElement = null;
        },
        unhover: function () {
            if (this._skipUnhover)
                this._skipUnhover = false;
            else {
                this.cancelAutoShow();
                this.hideFrame(this.get_hoverFrame());
                if (this.get_isOpen()) {
                    this.startClose();
                    if (this.get_hoverStyle(this.get_openFrame()) != _web.HoverStyle.Click) {
                        this._showOpenFrame();
                    }
                }
            }
        },
        select: function (family, path) {
            try {
                var ev = new Sys.UI.DomEvent(window.event);
                ev.stopPropagation();
                ev.preventDefault();
            }
            catch (err) {
            }
            var item = _web.Item.find(family, path);
            if (item.get_confirmation() && !confirm(item.get_confirmation())) return;
            var script = item.get_script();
            if (script) {
                //if (!String.isNullOrEmpty(item.get_script())) {
                if (typeof script == 'string')
                    eval(item.get_script());
                else
                    script(item.context());
                this.close();
            }
            else if (!String.isNullOrEmpty(item.get_url())) {
                _menu.navigate(item.get_url());
                this.close();
            }
        },
        stopClose: function () {
            if (this._closeInterval)
                window.clearInterval(this._closeInterval);
            this._closeInterval = null;
        },
        startClose: function () {
            this.stopClose();
            this._closeInterval = setInterval(function () {
                var hm = _web.HoverMonitor._instance;
                hm.stopClose();
                hm.close();
            }, 1000);
        },
        closeItem: function (family, path) {
            this.stopCloseItem();
            var item = family != null && path != null ? _web.Item.find(family, path) : this.get_activeItem();
            var activeItem = this.get_activeItem();
            if (item && activeItem && (item != activeItem || !activeItem.get_children()))
                this.hidePopups(activeItem.get_depth() + 1);
        },
        stopCloseItem: function () {
            if (this._closeItemInterval)
                window.clearInterval(this._closeItemInterval);
            this._closeItemInterval = null;
        },
        startCloseItem: function (family, path) {
            this.stopCloseItem();
            this._closeItemInterval = setInterval(function () {
                _web.HoverMonitor._instance.closeItem(family, path);
            }, 1000);
        },
        stopOpen: function () {
            if (this._openInterval)
                window.clearInterval(this._openInterval);
            this._openInterval = null;
        },
        startOpen: function (family, path) {
            this.stopOpen();
            this.stopCloseItem();
            this.stopClose();
            if (!this._skipStartOpen) {
                this._openInterval = setInterval(function () {
                    _web.HoverMonitor._instance.open(family, path);
                }, _web.HoverMonitor._instance._tempOpenDelay != null ? _web.HoverMonitor._instance._tempOpenDelay : 500);
                _web.HoverMonitor._instance._tempOpenDelay = null;
            }
            this._skipStartOpen = false;
        },
        open: function (family, path) {
            this.stopOpen();
            var item = _web.Item.find(family, path);
            if (item) {
                this.hidePopups(item.get_depth() + 1);
                if (item == null || !item.get_children()) return;
                this.showPopup(this.get_openFrame(), item);
            }
        },
        toggle: function () {
            if (_web.HoverMonitor._preventToggleHover) {
                _web.HoverMonitor._preventToggleHover = false;
                return;
            }
            if (this.get_isOpen() && this.get_hoverFrame().family == this.get_openFrame().family) {
                this.hideFrame(this.get_openFrame());
                this.hidePopups();
                var frame = this.get_hoverFrame();
                this.showFrame(frame.element, frame.family, frame.cssClass, frame);
            }
            else {
                this.hideFrame(this.get_openFrame());
                this.showPopup(this.get_hoverFrame());
            }
            this.stopClose();
        },
        refresh: function (family) {
            if (this.get_isOpen() && this.get_openFrame().family == family) {
                this.toggle();
                this.toggle();
            }
        },
        _hoverArrow_click: function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        },
        _hoverArrow_mouseover: function (e) {
            var f = this.get_hoverFrame();
            this.showFrame(f.element, f.family, f.cssClass, f);
        },
        _hoverArrow_mouseout: function (e) {
            this.hideFrame(this.get_hoverFrame());
            this._showOpenFrame();
        },
        close: function () {
            this.hideFrame(this.get_openFrame());
            this.hideFrame(this.get_hoverFrame());
            this.hidePopups();
        },
        activate: function (family, path, direction) {
            this._activeFamily = family;
            this._activePath = path;
            var item = _web.Item.find(family, path);
            if (!item || item.get_children())
                this.startOpen(family, path);
            else if (item) {
                this.stopOpen();
                this.startCloseItem(family, path);
            }
            var first = true;
            while (item) {
                var elem = $get(item.get_id());
                if (first) {
                    first = false;
                    if (elem) {
                        var p = elem.parentNode;
                        if (p.className == 'Group') p = p.parentNode;
                        var peers = p.getElementsByTagName('a');
                        for (var i = 0; i < peers.length; i++)
                            Sys.UI.DomElement.removeCssClass(peers[i], 'Active');
                        peers = null;
                    }
                }
                if (elem) Sys.UI.DomElement.addCssClass(elem, 'Active')
                if (direction && elem.parentNode._autoScrolling) {
                    var parentBounds = $appfactory.bounds(elem.parentNode);
                    var elemBounds = $appfactory.bounds(elem);
                    if (elemBounds.y < parentBounds.y || elemBounds.y + elemBounds.height > parentBounds.y + parentBounds.height - 1)
                        elem.scrollIntoView(!(direction == 'down' || direction == 'end'));
                    elem.parentNode.scrollLeft = 0;
                }
                item = item.get_parent();
            }
        },
        _moveToItem: function (item, direction) {
            if (!item) return;
            var peers = item.get_parent() ? item.get_parent().get_children() : _web.HoverMonitor.Families[item.get_family()].items;
            var index = Array.indexOf(peers, item);
            var activeItem = null;
            switch (direction) {
                case 'down':
                    index = index < peers.length - 1 ? index + 1 : 0;
                    break;
                case 'up':
                    index = index > 0 ? index - 1 : peers.length - 1;
                    break;
                case 'home':
                    index = 0;
                    break;
                case 'end':
                    index = peers.length - 1;
                    break;
            }
            activeItem = peers[index];
            if (activeItem) {
                var originalIndex = index;
                while (String.isNullOrEmpty(activeItem.get_text()) || activeItem.get_disabled()) {
                    index += direction == 'down' || direction == 'home' ? 1 : -1
                    if (index < 0) index = peers.length;
                    else if (index > peers.length - 1) index = 0;
                    if (index == originalIndex) {
                        activeItem = null;
                        break;
                    }
                    else
                        activeItem = peers[index];
                }
            }
            if (activeItem) {
                $activateItem(activeItem.get_family(), activeItem.get_path(), direction);
                //this.hidePopups(activeItem.get_depth() + 1);
                if (!activeItem.get_children())
                    this.startCloseItem(activeItem.get_family(), activeItem.get_path());
            }
        },
        _openItem: function (item) {
            if (item && item.get_children()) {
                this.open(item.get_family(), item.get_path());
                item = item.get_children()[0];
                $activateItem(item.get_family(), item.get_path());
            }
        },
        _openFirstItem: function () {
            var openFamily = this.get_openFamily();
            if (openFamily)
                this._moveToItem(openFamily.items[0], 'home');
        },
        _document_keydown: function (e) {
            if (this.get_isOpen()) {
                this.stopOpen();
                $appfactory._focusedItemIndex = null;
                var activeItem = this.get_activeItem();
                if (!activeItem && (e.keyCode == Sys.UI.Key.down || e.keyCode == Sys.UI.Key.up)) {
                    e.preventDefault();
                    this._openFirstItem();
                }
                else {
                    if (e.keyCode == Sys.UI.Key.tab && !activeItem) {
                        if (this.get_hoverStyle(this.get_hoverFrame()) == _web.HoverStyle.Auto)
                            return;
                        else {
                            e.preventDefault();
                            this._openFirstItem();
                        }
                    }
                    switch (e.keyCode) {
                        case Sys.UI.Key.enter:
                            if (activeItem) {
                                if (String.isNullOrEmpty(activeItem.get_url()) && activeItem.get_children())
                                    this._openItem(activeItem);
                                else
                                    this.select(activeItem.get_family(), activeItem.get_path());
                            }
                            break;
                        case Sys.UI.Key.esc:
                            if (activeItem && activeItem.get_parent()) {
                                this.hidePopups(activeItem.get_depth());
                                activeItem = activeItem.get_parent();
                                $activateItem(activeItem.get_family(), activeItem.get_path());
                                this.stopOpen();
                            }
                            else {
                                var hf = this.get_hoverFrame();
                                var element = hf.element;
                                this.close();
                                if (element) {
                                    if (element.tagName.toLowerCase() != 'a') {
                                        var links = element.getElementsByTagName('a');
                                        if (links && links.length > 0)
                                            element = links[0];
                                        delete links;
                                    }
                                    try { element.focus(); } catch (e) { }
                                }
                                this._skipOpen = true;
                                $showHover(hf.element, hf.family, hf.cssClass);
                            }
                            break;
                        case Sys.UI.Key.down:
                            this._moveToItem(activeItem, 'down');
                            break;
                        case Sys.UI.Key.up:
                            this._moveToItem(activeItem, 'up');
                            break;
                        case Sys.UI.Key.tab:
                            this._moveToItem(activeItem, e.shiftKey ? 'up' : 'down');
                            break;
                        case Sys.UI.Key.home:
                            this._moveToItem(activeItem, 'home');
                            break;
                        case Sys.UI.Key.end:
                            this._moveToItem(activeItem, 'end');
                            break;
                        case Sys.UI.Key.right:
                        case Sys.UI.Key.left:
                            this._openItem(activeItem);
                            break;
                        default:
                            return;
                    }
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
            else if (this.get_isVisible()) {
                switch (e.keyCode) {
                    case Sys.UI.Key.down:
                    case Sys.UI.Key.up:
                        if (this.get_hoverFamily())
                            this.showPopup(this.get_hoverFrame());
                        e.preventDefault();
                        break;
                }
            }
        },
        _document_click: function (e) {
            if (this._openFrame && this._openFrame._open) {
                var elem = e.target;
                while (elem) {
                    if (!String.isNullOrEmpty(elem.className) && elem.className.match(/\s+\w+_Hover/)) return;
                    elem = elem.parentNode;
                }
                this.close();
            }
        },
        _hoverMenu_mouseover: function (e) {
            this.stopClose();
            if (this.get_isOpen() && this.get_hoverStyle(this.get_openFrame()) == _web.HoverStyle.Click)
                this._showOpenFrame();
        },
        _hoverMenu_mouseout: function (e) {
            this.startClose();
        }
    }

    _web.HoverMonitor.Families = [];

    _window.$closeHovers = function () {
        var instance = _web.HoverMonitor._instance;
        if (instance)
            instance.close()
    }

    _window.$hoverOver = function (elem, depth) {
        while (depth-- > 0)
            elem = elem.parentNode;
        elem.focus();
        $skipUnhover();
    }

    _window.$skipUnhover = function () {
        _web.HoverMonitor._instance._skipUnhover = true;
    }

    _window.$nextTabIndex = function () {
        var instance = _web.HoverMonitor._instance;
        return instance ? instance.nextTabIndex() : -1;
    }

    _window.$showHover = function (elem, family, cssClass, depth) {
        _web.HoverMonitor._instance.hover(elem, family, cssClass, depth);
    }

    _window.$hideHover = function (elem) {
        if (__ie6 && event.fromElement && event.fromElement.tagName == 'A' && event.fromElement.parentNode.tagName == 'DIV')
            return;
        _web.HoverMonitor._instance.unhover();
    }

    _window.$selectItem = function (family, path) {
        _web.HoverMonitor._instance.select(family, path);
    }

    _window.$toggleHover = function () {
        _web.HoverMonitor._instance.toggle();
    }

    _window.$preventToggleHover = function () {
        _web.HoverMonitor._preventToggleHover = true;
    }

    _window.$refreshHoverMenu = function (family) {
        _web.HoverMonitor._instance.refresh(family);
    }

    _window.$activateItem = function (family, path, direction) {
        _web.HoverMonitor._instance.activate(family, path, direction);
    }

    _window.$deactivateItem = function (family, path) {
        _web.HoverMonitor._instance.deactivate(family, path);
    }

    _window.$registerItems = function (family, items, hoverStyle, popupPosition, itemDescriptionStyle) {
        if (hoverStyle == null) hoverStyle = _web.HoverStyle.Auto;
        if (popupPosition == null) popupPosition = _web.PopupPosition.Left;
        if (itemDescriptionStyle == null) itemDescriptionStyle = _web.ItemDescriptionStyle.Inline;
        $unregisterItems(family);
        _web.HoverMonitor.Families[family] = { 'items': items, 'style': hoverStyle, 'position': popupPosition, 'itemDescriptionStyle': itemDescriptionStyle }
    }

    _window.$unregisterItems = function (family) {
        var f = _web.HoverMonitor.Families[family];
        if (f && f.items) {
            for (var i = 0; i < f.items.length; i++)
                f.items[i].dispose();
            Array.clear(f.items);
        }
        delete _web.HoverMonitor.Families[family];
    }

    _web.HoverMonitor.registerClass('Web.HoverMonitor', Sys.Component);

    if (!$.mobile)
        _web.HoverMonitor._instance = $create(_web.HoverMonitor, { 'id': 'GlobalHoverMonitor' });

    _web.HoverMonitor.OpenFrameZIndex = 101001;
    _web.HoverMonitor.HoverFrameZIndex = 101002;
    _web.HoverMonitor.HoverMenuZIndex = 101003;


    if (typeof (Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();
})();