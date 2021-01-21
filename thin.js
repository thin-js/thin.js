/*  thin.js - a light-weight web front-end framework,
    
    Copyright (C)2018, Li Wei
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// 常用缩写 c=container,t=template,d=data;

function thin(routeTable) {
    // thin.config = config; //保存配置
    thin.href = thin.parseUrl(document.location.href); //初始化 thin.href;
    thin.routeTable = routeTable;
    $(function () {
        // 捕获链接点击
        $(document).on('click', 'a', function (e) {
            e.preventDefault();
            //preprocess(e.target.href);
            if (thin.routeTo(e.currentTarget.href, false)) {
                // 如果模板渲染成功
                window.history.pushState(null, null, e.currentTarget.href);
            } else {
                window.location = e.currentTarget.href;
            }
        });

        $(window).on('popstate', function (e) {
            thin.routeTo(document.location.href, true);
        });

        thin.routeTo(document.location.href, true);
        console.log(document.location);
    });
}

thin.global = {};

thin.routeTo = function (href, force_rerender) {
    let target = thin.parseUrl(href);
    if (target.origin !== thin.href.origin) {
        //如果路由目标的origin不同,则直接返回false,重新刷新页面.
        return false;
    } else {
        thin.href = target;
    }

    thin.global.cookie = parseCookie();
    thin.global.query = parseQuery();
    thin.global.param = {}; //初始化参数容器.

    //console.log({ token: thin.cookie.get('token1') });

    return route(thin.href.pathname, thin.routeTable);

    function parseCookie() {
        let result = {};
        document.cookie.split(';').forEach(function (item) {
            console.log(item);
            if ((m = /^([^=]+)=([^=]+)$/gi.exec(item))) {
                console.log(m);
                //result[m.groups.name] = m.groups.value;
            }
            // if (m = /^(?<name>[^=]+)=(?<value>[^=]+)$/gi.exec(item)) {
            //     result[m.groups.name] = m.groups.value;
            // }
        });
        return result;
    }

    function parseQuery() {
        let result = {};
        if (thin.href.search) {
            thin.href.search
                .substring(1)
                .split('&')
                .forEach(function (item) {
                    // 暂时禁用，因ie不支持命名分组，这段代码需要重写。
                    // if (m = /^(?<name>[^=]+)=(?<value>[^=]+)$/gi.exec(item)) {
                    //     result[m.groups.name] = m.groups.value;
                    // }
                });
            return result;
        }
        return undefined;
    }

    function route(path, routeTable) {
        console.log({ path: path, routeTable: routeTable });
        // 渲染当级模板
        if (force_rerender || !routeTable.route) thin.render(routeTable.layout);
        // 渲染子路由
        let result = do_route();
        // onload callback
        if (routeTable.onload) routeTable.onload();
        return result;

        function do_route() {
            if (routeTable.route) {
                //如果存在子路由表,则渲染之.
                //遍历路由项
                for (let key in routeTable.route) {
                    let routeItem = routeTable.route[key];
                    // 生成正则表达式
                    regstr = '^'.concat(
                        //从头匹配起
                        key === '/' && routeItem.route
                            ? ''
                            : key.replace(/:\w+/g, function (match) {
                                  //param[match.substring(1)] = '';
                                  return '(?<' + match.substring(1) + '>[^/]*)';
                              }), //匹配路径定义
                        routeItem.route ? '(?<subpath>.*)?' : '', //如果有子路由则匹配出子路径
                        '$' //匹配到结束
                    );
                    let reg = new RegExp(regstr, 'g');
                    let m = reg.exec(path);
                    if (m) {
                        // 这里应渲染相应子路由.
                        if (m.groups)
                            Object.keys(m.groups).forEach(function (key) {
                                if (key !== 'subpath') thin.global.param[key] = m.groups[key];
                            }); // 路径参数记录.
                        if (routeItem.route) {
                            route(m.groups.subpath || '/', routeItem);
                        } else {
                            route(undefined, routeItem);
                        }
                        routeTable.current = routeItem; // 记录当前路由
                        return true; //返回真,表示匹配到子路由,并退出路由渲染.
                    }
                }
                // 如果走到这里表示未匹配到子路由.
                if (routeTable.route.default) {
                    // 这里应渲染默认路由
                    //renderViews(routeTable.route.default);
                    route(null, routeTable.route.default, true);
                    routeTable.current = routeTable.route.default; //记录当前路由
                    return true; // 返回真,表示匹配到默认路由,
                } else {
                    routeTable.current = undefined;
                    // route(null, thin.routeTable.error, true);
                    thin.render(thin.routeTable.error, { error: 'path not routed.', message: '' });
                    return false; // 返回假表示未匹配到任何路由
                }
            }
            return true;
        }
    }
};

thin.parseUrl = function (url) {
    let m = /^((https?:)\/\/[^\/]+)([^\?]*)(\?(.*))?/.exec(url);
    return {
        href: m[0],
        origin: m[1],
        pathname: m[3],
        search: m[4]
    };
};
thin.cookie = {
    get: function (name) {
        let m = document.cookie.match(name + '=(?<value>[^;]*)');
        return m ? m.groups.value : undefined;
    },
    set: function (name, value) {
        document.cookie = name.concat('=', value, ';');
    }
};

thin.render = function (view, data) {
    console.log(view, data);
    if (Array.isArray(view)) {
        view.forEach(function (v) {
            render(v);
        });
    } else {
        render(view);
    }

    function render(view) {
        if (typeof view == 'function') view();
        else if (typeof view == 'object') {
            Object.keys(view).forEach(function (selector, i) {
                $(selector).empty().render({
                    data: data,
                    template: view[selector]
                });
            });
        } else {
            console.log({ 'thin.render': 'unknow view define', view: view });
        }
    }
};

// V1.1

$(function () {
    $(document).on('click', 'tab-nav', function () {
        // 标签切换
        $('tab-nav', this.parentElement).removeClass('active');
        $(this).addClass('active');

        // 调用标签函数
        let fun = this.getAttribute('function');
        if (typeof window[fun] === 'function') {
            window[fun]();
        }

        // 视图切换
        var view = this.getAttribute('view');
        if (view !== null) {
            var mv = $(this).parents('multiview:first');
            $('view', mv).removeClass('active');
            $('view#' + view, mv).addClass('active');
        }
    });
});

$.fn.extend({
    render: function (p) {
        if (!this[0]) {
            console.log({ 'container not found': p });
            return;
        }

        let readyQueue = []; // 函数堆栈，用于将需要渲染完成后执行的操作压栈，并在渲染完成后执行。

        if (!p.template || Array.isArray(p)) {
            // 语法糖,参数直接使用模板或者模板数组
            render_by_templates({ c: this[0], t: p });
        } else {
            if (p.data === undefined) {
                p.data = {};
            }

            if (
                Array.isArray(p.template) ||
                Array.isArray(p.data) ||
                typeof p.template === 'function' ||
                Object.prototype.toString.call(p.template) === '[object Object]'
            ) {
                render_by_data({
                    c: this[0],
                    t: p.template,
                    d: p.data
                });
            } else {
                this[0].data_of_thin = p.data; //将数据附加到容器。
                render_by_templates({ c: this[0], t: p.template });
            }
        }

        // 在这里把readyQueue中的函授逐个pop出来执行一遍。
        let f;
        while ((f = readyQueue.shift())) {
            f();
        }

        function render_by_data(p) {
            // console.log({ pos: 'render_by_data', p: p });
            if (Array.isArray(p.d)) {
                p.d.forEach(function (d) {
                    // console.log({ d });
                    render_by_templates({ c: p.c, t: p.t, d: d });
                });
            } else {
                render_by_templates(p);
            }
        }

        function render_by_templates(p) {
            if (Array.isArray(p.t)) {
                // 模板是数组的场景。
                p.t.forEach(function (t) {
                    render_template({ t: t, c: p.c, d: p.d });
                });
            } else {
                if (p.t) render_template(p);
            }
        }

        function render_template(p) {
            let container = p.c;
            let datacontainer = nearest_datacontainer(container);
            //let data = p.d || (datacontainer ? datacontainer.data_of_thin : undefined);
            let data = p.d !== undefined ? p.d : datacontainer ? datacontainer.data_of_thin : undefined;
            let template = p.t;
            // console.log({
            //     pos: 'render_template',
            //     p: p,
            //     data: data,
            //     template: template
            // })
            if (typeof template === 'string') {
                // 模板是字符串的场景
                let e = document.createDocumentFragment();
                $(e).append(render_content({ t: template, c: container }));
                p.c.appendChild(e);
            } else if (typeof template === 'object') {
                //模板是对象的场景
                //render_object_template({ c: p.c, t: p.t, d: p.d });
                return render_object_template();
            } else if (typeof template === 'function') {
                // let datacontainer = nearest_datacontainer(p.c);
                let result = template({
                    container: container,
                    data: data
                    //data: p.d || (datacontainer ? datacontainer.data_of_thin : undefined)
                });

                if (result) {
                    let e = document.createDocumentFragment();
                    $(e).append(render_content({ t: result, c: container }));
                    p.c.appendChild(e);
                }
            } else {
                // 不支持的场景。
                console.log(Object.prototype.toString.call(p.t));
            }

            function render_object_template() {
                // if (template.hasOwnProperty('datapath') && !p.hasOwnProperty('d')) {
                if (template.hasOwnProperty('datapath') && (!p.hasOwnProperty('d') || p.d == undefined)) {
                    let d = dataWalker(template.datapath);
                    // console.log(d);
                    if (d != null) render_by_data({ c: container, d: d, t: template });
                } else if (template.hasOwnProperty('data') && (!p.hasOwnProperty('d') || p.d == undefined)) {
                    // console.log(p)
                    if (template.data != null) render_by_data({ c: container, d: template.data, t: template });
                } else {
                    // console.log(p)
                    // let data_container = nearest_datacontainer(p.c);
                    if (p.t.if !== undefined) {
                        template_if();
                    } else if (p.t.switch !== undefined) {
                        template_switch();
                    } else if (p.t.foreach !== undefined) {
                        template_foreach();
                    } else if (p.t.tab) {
                        template_tab();
                    } else if (p.t.ajax) {
                        template_ajax();
                    } else if (p.t.multiview) {
                        template_multiview();
                    } else if (Object.keys(p.t)[0] === 'a') {
                        template_a();
                    } else {
                        return template_object();
                    }

                    function getdata() {
                        if (p.t.data) {
                            return p.t.data;
                        } else if (p.data) {
                            return p.data;
                        } else return datacontainer.data_of_thin;
                    }

                    function template_a() {
                        // render_object_template({
                        //     c: p.c,
                        //     d: p.d,
                        //     t: {
                        //         e: 'a',
                        //         t: p.t.t || p.t.a,
                        //         a: { href: p.t.a },
                        //         class: p.t.class,
                        //         event: p.c.event,
                        //         click: p.t.click
                        //     }
                        // });
                        render_template({
                            c: p.c,
                            d: p.d,
                            t: {
                                e: 'a',
                                t: p.t.t || p.t.a,
                                a: p.t.attr ? Object.assign(p.t.attr, { href: p.t.a }) : { href: p.t.a },
                                class: p.t.class,
                                event: p.c.event,
                                click: p.t.click
                            }
                        });
                    }

                    function template_ajax() {
                        let thin_ajax_loading;
                        if (p.t.loading) {
                            thin_ajax_loading = document.createElement('thin_ajax_loading');
                            p.c.appendChild(thin_ajax_loading);
                            render_by_templates({ c: thin_ajax_loading, t: p.t.loading, d: p.d });
                        }
                        jQuery.ajax({
                            url: p.t.ajax,
                            data: p.t.query,
                            dataType: 'json',
                            contentType: 'application/json',
                            method: p.t.method || 'post',
                            success: function (data) {
                                if (p.t.debug) console.log({ ajax: data });
                                if (thin_ajax_loading) {
                                    $(thin_ajax_loading).remove(), (thin_ajax_loading = undefined);
                                }
                                render_by_data({ c: p.c, t: p.t.success, d: data });
                            },
                            error: function (error, statusText) {
                                if (p.t.debug) console.log({ error: error, statusText: statusText });
                                if (thin_ajax_loading) {
                                    $(thin_ajax_loading).remove(), (thin_ajax_loading = undefined);
                                }
                                render_by_data({ c: p.c, t: p.t.error, d: error });
                            }
                        });
                        // container.thin_template = template; //锚定模板，以备rerender。
                        // let loading;
                        // if (template.loading) {
                        //     loading = document.createElement("loading");
                        //     container.appendChild(loading);
                        //     thin.render_by_template(loading, template.loading);
                        // }
                        // container.thin_query = template.query;
                        // thin.ajax({
                        //     url: template.ajax,
                        //     data: JSON.stringify(container.thin_query),
                        //     dataType: template.dataType || "json",
                        //     contentType: template.contentType || "application/json",
                        //     success: data => {
                        //         if (template.debug) { console.log({ data }) };
                        //         if (template.loading) thin(loading).remove();
                        //         container.thin_data = data;
                        //         thin.render_by_template(container, template.success);
                        //         if (template.pager) render_pager(container, template.pager);
                        //     },
                        //     error: (error, statusText) => {
                        //         //console.log({ error, statusText });
                        //         if (template.loading) thin(loading).remove();
                        //         if (template.error) {
                        //             template.error.data = error;
                        //             thin.render_by_template(container, template.error);
                        //         } else {
                        //             let err_template = { e: "error", t: "[[responseText]]", data: error }
                        //             thin.render_by_template(container, err_template);
                        //         }
                        //     }
                        // });
                    }

                    function template_switch() {
                        //swtich 模板
                        let v =
                            typeof p.t.switch === 'function'
                                ? p.t.switch({
                                      container: p.c,
                                      data: getdata()
                                  })
                                : render_content({ t: p.t.switch, c: p.c });
                        if (p.t.case === undefined) {
                        } else if (p.t.case[v] !== undefined) {
                            render_by_templates({
                                c: p.c,
                                t: p.t.case[v]
                                // d: p.d
                            });
                        } else if (p.t.case.default !== undefined) {
                            render_by_templates({
                                c: p.c,
                                t: p.t.case.default
                                // d: p.d
                            });
                        }
                    }

                    function template_if() {
                        switch (typeof template.if) {
                            case 'function':
                                if (p.t.if({ container: p.c, data: getdata() })) render_by_templates({ c: container, t: template.then, d: p.d });
                                else if (p.t.else) render_by_templates({ c: container, t: template.else, d: p.d });
                                break;
                            case 'string':
                                //let d = p.d || datarover({ path: p.t.if, container: p.c });
                                let d = dataWalker(template.if);
                                if (d) render_by_templates({ c: container, t: template.then, d: p.d });
                                else if (p.t.else) render_by_templates({ c: container, t: template.else, d: p.d });
                                break;
                            default:
                                if (p.t.if) render_by_templates({ c: container, t: template.then, d: p.d });
                                else if (p.t.else) render_by_templates({ c: container, t: template.else, d: p.d });
                                break;
                        }
                    }

                    function template_foreach() {
                        let d = null;
                        if (typeof template.foreach === 'function') {
                            d = p.t.foreach({ container: p.c, data: p.d });
                        } else if (typeof template.foreach === 'string') {
                            // d = datarover({ container: p.c, path: p.t.foreach });
                            d = dataWalker(template.foreach);
                        } else if (Array.isArray(template.foreach)) {
                            d = template.foreach;
                        }
                        if (d) render_by_data({ c: container, d: d, t: template.t });
                    }

                    function template_tab() {
                        let t = { e: 'tab', id: p.t.tab.id, class: p.t.tab.class, t: [] };
                        // for (let key in p.t.tab.nav) {
                        // IE11 不兼容
                        $.each(p.t.tab.nav, function (key, item) {
                            let nav = { e: 'tab-nav', t: key };
                            if (typeof p.t.tab.nav[key] === 'function') {
                                nav.click = p.t.tab.nav[key];
                            } else {
                                nav.click = p.t.tab.nav[key].click;
                                nav.a = p.t.tab.nav[key].a || {};
                                nav.class = p.t.tab.nav[key].class;
                                if (p.t.tab.nav[key].hashpath) {
                                    nav.a.hashpath = p.t.tab.nav[key].hashpath;
                                    nav.click = function (para) {
                                        // console.log({ click: para })
                                        history.pushState(null, null, nav.a.hashpath);
                                        p.t.tab.nav[key].click(para);
                                    };
                                } else {
                                    nav.click = p.t.tab.nav[key].click;
                                }
                            }
                            t.t.push(nav);
                        });

                        // let ele = render_object_template({ c: p.c, t: t, d: p.d }); //获取渲染出来的tab元素
                        let ele = render_template({ c: p.c, t: t, d: p.d }); //获取渲染出来的tab元素
                        // console.log(ele);
                        switchtab();

                        function switchtab() {
                            let activeindex = p.t.tab.default || 1;
                            for (let i = 0; i < ele.children.length; i++) {
                                let regstr = new RegExp('^'.concat(ele.children[i].getAttribute('hashpath') || 'undefined$'));
                                // console.log(regstr);
                                if (document.location.hash.match(regstr)) {
                                    // console.log('match');
                                    activeindex = i + 1;
                                    break;
                                }
                            }
                            let key = Object.keys(p.t.tab.nav)[activeindex - 1];
                            $(ele.children[activeindex - 1]).addClass('active');
                            // console.log({ hash: document.location.hash, activeindex: activeindex, ele, key });
                            readyQueue.push(p.t.tab.nav[key].click);
                        }

                        function popstatehandler() {
                            if ($(ele).parents('body')[0]) {
                                //判断容器是否仍然存在于dom树中。
                                for (let i = 0; i < ele.children.length; i++) {
                                    // 先把所有标签的活跃标志清除
                                    $(ele.children[i]).removeClass('active');
                                }
                                switchtab();
                                let f;
                                while ((f = readyQueue.shift())) {
                                    f();
                                }
                            } else {
                                $(window).off('popstate', popstatehandler); //如果该节点已经不在文档树中，则解绑事件。
                            }
                        }
                        $(window).on('popstate', popstatehandler);
                    }

                    function template_multiview() {
                        template_object();
                    }

                    function template_object() {
                        // console.log({ pos: 'template_object', p: p });
                        // 模板是对象的场景
                        // 语法糖
                        if (!p.t.e) {
                            if (p.t.input) {
                                p.t.e = 'input';
                                p.t.id = p.t.id || p.t.textarea;
                                p.t.name = p.t.name || p.t.input;
                            } else if (p.t.textarea) {
                                p.t.e = 'textarea';
                                p.t.id = p.t.id || p.t.textarea;
                                p.t.name = p.t.textarea;
                            } else if (p.t.button) {
                                p.t.e = 'button';
                                p.t.t = p.t.t || p.t.button;
                            } else if (p.t.select) {
                                p.t.e = 'select';
                                p.t.id = p.t.id || p.t.select;
                                p.t.name = p.t.name || p.t.select;
                                // 避免options.add方法和thin自身渲染冲突，目前先注释掉
                                // p.t.t = p.t.t || p.t.options;
                            } else if (p.t.div) {
                                p.t.t = p.t.t || p.t.div;
                                p.t.e = 'div';
                            } else if (p.t.img) {
                                p.t.e = 'img';
                                if (p.t.a) p.t.a.src = p.t.img;
                                else p.t.a = { src: p.t.img };
                            } else if (!p.t.e) {
                                p.t.e = Object.keys(p.t)[0];
                                p.t.t = p.t[p.t.e];
                            }
                        }

                        if (p.t.hasOwnProperty('when')) {
                            if (typeof p.t.when === 'function' && !p.t.when({ container: p.c, data: getdata() })) return;
                            else if (typeof p.t.when === 'string' && !dataWalker(p.t.when)) return;
                            else if (!p.t.when) return;
                        }

                        let element = document.createElement(p.t.e ? p.t.e : 'div');
                        p.c.appendChild(element);

                        // if (p.t.data) {
                        //     element.data_of_thin = p.t.data;
                        // } else if (p.d !== undefined) {
                        //     element.data_of_thin = p.d; //数据附着到当前节点。
                        // }

                        if (p.d !== undefined) element.data_of_thin = p.d;

                        let data_container = nearest_datacontainer(element);

                        if (p.t.name !== undefined) {
                            element.setAttribute('name', p.t.name);
                        }
                        if (p.t.id !== undefined) {
                            element.setAttribute('id', p.t.id);
                        } //V1.1 设置ID
                        if (p.t.class !== undefined) {
                            element.setAttribute('class', p.t.class);
                        } //V1.1 设置class
                        if (p.t.width !== undefined) {
                            element.style.setProperty('width', typeof p.t.width === 'number' ? p.t.width + 'px' : p.t.width);
                        } //V1.1 设置宽度
                        if (p.t.height !== undefined) {
                            element.style.setProperty('height', typeof p.t.height === 'number' ? p.t.height + 'px' : p.t.height);
                        } //V1.1 设置高度

                        // 添加options
                        if (p.t.options !== undefined) {
                            if (Array.isArray(p.t.options)) {
                                p.t.options.forEach(function (o) {
                                    element.options.add(new Option(o));
                                });
                            } else if (typeof p.t.options === 'object') {
                                for (let key in p.t.options) {
                                    element.options.add(new Option(key, p.t.options[key]));
                                }
                            } else if (typeof p.t.options === 'string') {
                                p.t.options.split(',').forEach(function (o) {
                                    element.options.add(new Option(o));
                                });
                            }
                        }

                        //V1.1 数据绑定
                        if (p.t.bind) {
                            //let data_container = nearest_datacontainer(element);
                            if (data_container) {
                                let data = data_container.data_of_thin;
                                let patharray = p.t.bind.split('/');
                                for (let i = 0; i < patharray.length - 1; i++) {
                                    data = data[patharray[i]];
                                }
                                $(element).val(data[patharray[patharray.length - 1]]);
                                $(element).on('change', function (e) {
                                    let data = data_container.data_of_thin;
                                    for (let i = 0; i < patharray.length - 1; i++) {
                                        if (!data[patharray[i]]) {
                                            data[patharray[i]] = {};
                                        }
                                        data = data[patharray[i]];
                                    }
                                    data[patharray[patharray.length - 1]] = $(element).val();
                                });
                            }
                        }

                        // interval 循环定时

                        if (p.t.timer) {
                            if (Array.isArray(p.t.timer)) {
                                p.t.timer.forEach(function (timer, index) {
                                    setTimer(timer);
                                });
                            } else setTimer(p.t.timer);

                            function setTimer(timer) {
                                if (timer.interval && timer.do) {
                                    if (!p.c.interval) p.c.interval = [];
                                    p.c.interval.push(setInterval(intervalhandler, timer.interval));
                                } else if (timer.delay && timer.do) {
                                    setTimeout(timeouthandler, timer.delay);
                                }

                                function intervalhandler() {
                                    if ($(p.c).parents('body')[0]) {
                                        //判断容器是否仍然存在于dom树中。
                                        //如果在，则执行定时函数。
                                        timer.do({ container: p.c, data: nearest_datacontainer(p.c).data_of_thin });
                                    } else {
                                        //如果该节点已经不在文档树中，则解绑所有定时事件。
                                        p.c.interval.forEach(function (handler) {
                                            clearInterval(handler);
                                        });
                                        delete p.c.interval;
                                    }
                                }

                                function timeouthandler() {
                                    if ($(p.c).parents('body')[0]) {
                                        //判断容器是否仍然存在于dom树中。
                                        timer.do({ container: p.c, data: nearest_datacontainer(p.c).data_of_thin });
                                    } else {
                                    }
                                }
                            }
                        }

                        // click 绑定click用户事件处理函数

                        if (p.t.click !== undefined) {
                            $(element).on('click', function (e) {
                                // console.log(e);
                                eventprocessor(e, p.t.click);
                            });
                        }

                        //  event 绑定事件侦听器

                        if (p.t.event !== undefined) {
                            Object.keys(p.t.event).forEach(function (key) {
                                $(element).on(key, function (e) {
                                    eventprocessor(e, p.t.event[key]);
                                });
                            });
                        }

                        function eventprocessor(e, handler) {
                            // e.stopPropagation(); // 阻止事件冒泡;
                            // 防止keydown事件被阻止，导致的输入框被禁止
                            if (e.type != 'keydown') {
                                e.preventDefault(); // 阻止默认行为;
                            }
                            // console.log(e);
                            let data_container = nearest_datacontainer(e.target);
                            // console.log({ data_container })
                            let new_data = {};
                            let checkValue = [];
                            // 获取全部input的值：
                            $('input,select,textarea', data_container).each(function (i, e) {
                                if (this.attributes['name'] !== undefined) {
                                    let name = this.attributes['name'].value;
                                    // 改善对checkbox的支持
                                    if (this.attributes['type'].value === 'checkbox') {
                                        checkValue.push($(this).val());
                                        if (!new_data[name]) new_data[name] = checkValue;
                                    } else {
                                        if (!new_data[name]) new_data[name] = $(this).val(); //bugfix: 只取第一个，后续的忽略。
                                    }
                                }
                            });

                            $('*[contenteditable=true]', data_container).each(function (i, e) {
                                if (this.attributes['name'] !== undefined) {
                                    let name = this.attributes['name'].value;
                                    if (!new_data[name]) new_data[name] = $(this).text(); //bugfix: 只取第一个，后续的忽略。
                                }
                            });

                            if (typeof handler === 'function') {
                                // console.log({ handler });
                                // console.log({
                                //     sender: e.currentTarget || e.target,
                                //     type: e.type,
                                //     event: e,
                                //     org_data: data_container.data_of_thin,
                                //     new_data: new_data
                                // })
                                handler({
                                    sender: e.currentTarget || e.target,
                                    type: e.type,
                                    event: e,
                                    org_data: data_container.data_of_thin,
                                    new_data: new_data
                                });
                            } else if (handler.e) {
                                if (e.target.nextSibling && e.target.nextSibling.thin_dynflag) {
                                    e.target.nextSibling.remove();
                                } else if (e.target.lastChild && e.target.lastChild.thin_dynflag) {
                                    e.target.lastChild.remove();
                                } else {
                                    let freg = document.createDocumentFragment();
                                    $(freg).render({
                                        data: data_container.data_of_thin,
                                        template: handler
                                    });

                                    freg.firstChild.thin_dynflag = true;

                                    if (typeof handler.closeon === 'string') {
                                        handler.closeon.split(',').forEach(function (ev, i) {
                                            $(freg.firstChild).on(ev, function (event) {
                                                $(event.currentTarget).remove();
                                            });
                                        });
                                    }
                                    // 添加在哪里？如果指定了after或者before选择器，则添加在指定位置，否则添加在当前元素后面。
                                    if (handler.after) {
                                        $(handler.after, data_container).after(freg);
                                    } else if (handler.before) {
                                        $(handler.before, data_container).before(freg);
                                    } else if (handler.in) {
                                        $(handler.in, data_container).append(freg);
                                    } else {
                                        $(e.target).append(freg);
                                    }
                                }
                            }
                        }

                        // V1.1
                        switch (p.t.e) {
                            case 'fieldset':
                                // V1.1 增加当e为fieldset时对title属性的支持
                                if (p.t.title !== undefined) {
                                    let legend = document.createElement('legend');
                                    legend.innerText = render_content({ t: p.t.title, c: element });
                                    element.appendChild(legend);
                                }
                                break;

                            case 'field':
                            case 'f1':
                            case 'f2':
                            case 'f3':
                                //V1.1 增加当e为field/f1/f2/f3时对title属性的支持
                                if (p.t.title !== undefined) {
                                    let label = document.createElement('label');
                                    label.innerText = render_content({ t: p.t.title, c: element });
                                    element.appendChild(label);
                                }
                                break;
                            default:
                                break;
                        }

                        // t 渲染节点的内容
                        if (p.t.t) {
                            render_by_templates({ c: element, t: p.t.t });
                        }

                        // 设置选中值移到渲染节点内容之下

                        // 设置选中值
                        if (p.t.selected !== undefined) {
                            $(element).val(render_content({ t: p.t.selected, c: element }));
                        }

                        //V1.1 设置值
                        if (p.t.value !== undefined) {
                            $(element).val(
                                typeof p.t.value === 'function'
                                    ? p.t.value({ container: p.c, data: data_container.data_of_thin })
                                    : render_content({ t: p.t.value, c: element })
                            );
                        }

                        //a 设置节点attribute
                        if (p.t.a !== undefined) {
                            Object.keys(p.t.a).forEach(function (key) {
                                if (typeof p.t.a[key] === 'function') {
                                    //let data_container = nearest_datacontainer(element);
                                    element.setAttribute(
                                        key,
                                        p.t.a[key]({
                                            container: element,
                                            data: data_container ? data_container.data_of_thin : null
                                        })
                                    );
                                } else {
                                    element.setAttribute(
                                        key,
                                        render_content({
                                            t: p.t.a[key],
                                            c: element
                                        })
                                    );
                                }
                            });
                        }

                        //style 设置节点样式
                        if (p.t.style !== undefined) {
                            Object.keys(p.t.style).forEach(function (key) {
                                if (typeof p.t.style[key] === 'function') {
                                    //let data_container = nearest_datacontainer(element);
                                    element.style.setProperty(
                                        key,
                                        p.t.style[key]({
                                            container: element,
                                            data: data_container ? data_container.data_of_thin : null
                                        })
                                    );
                                } else {
                                    element.style.setProperty(
                                        key,
                                        render_content({
                                            t: p.t.style[key],
                                            c: element
                                        })
                                    );
                                }
                            });
                        }
                        // console.log({ pos: "end template_object", p })
                        return element;
                    }
                }
            }

            //
            //  根据模板串和数据容器生成字符串
            //
            function render_content(p) {
                if (!p.t) return '';
                let result =
                    typeof p.t !== 'string'
                        ? p.t.toString()
                        : p.t.replace(/\[\[[a-zA-Z0-9\-\./_]*\]\]/gi, function (m) {
                              // console.log({ p, m })
                              let path = m.replace('[[', '').replace(']]', '');
                              // return datarover({ container: p.c, path: path });
                              let value = dataWalker(path, p.c);
                              // console.log(value);
                              return value == undefined ? '' : value;
                          });
                // IE正则表达式不支持命名分组，暂时禁用。
                // result = result.replace(/{{(?<path>[a-zA-Z0-9\-\./_]+)}}/gi, function(m) {
                //     let path = m.substring(2, m.length - 2);
                //     return globalrover(path);
                // });
                return result;
            }

            //
            // 查找最近的数据容器
            //
            function nearest_datacontainer(container) {
                while (!container.hasOwnProperty('data_of_thin')) {
                    if (!container || !container.parentNode) return null;
                    container = container.parentNode;
                }
                // console.log({ container });
                return container;
            }

            function globalrover(path) {
                let data = thin.global;
                let pa = path.split('.');
                for (let i = 0; i < pa.length; i++) {
                    let key = pa[i];
                    if (!data[key]) return undefined;
                    else data = data[key];
                }
                return data;
            }

            // // @param  { any } p  参数
            // //    p.path      { sting } 查找路径
            // //    p.container { HTMLElement } 数据容器
            // // @return { any } 返回查找到的数据数据
            // function datarover(p) {
            //     let pa = p.path.split("/"); //路径数组
            //     let dp = nearest_datacontainer(p.container); //找到最近数据容器

            //     if (p.path === '.') {
            //         return dp.data_of_thin;
            //     }

            //     for (let i = 0; i < pa.length; i++) {
            //         if (pa[i] === "..") {
            //             if (isDOMElement(dp)) {
            //                 dp = nearest_datacontainer(dp.parentNode); //上溯到上一个数据容器节
            //             } else {
            //                 return null;
            //             }
            //         } else {
            //             if (isDOMElement(dp)) {
            //                 //如果dp是文档节点，则从文档节点中取其包含数据为dp。
            //                 if (dp.data_of_thin === undefined) {
            //                     return null;
            //                 } else {
            //                     dp = dp.data_of_thin;
            //                 }
            //             }
            //             if (dp === null) {
            //                 return null;
            //             }
            //             if (pa[i] in dp) {
            //                 dp = dp[pa[i]];
            //             } else {
            //                 return null;
            //             }
            //         }
            //     }
            //     return dp;
            // }
            // // 判断一个对象是否dom element;
            // function isDOMElement(obj) {
            //     return !!(obj && typeof window !== "undefined" && (obj === window || obj.nodeType));
            // }

            function dataWalker(path, element) {
                let d = data,
                    c = nearest_datacontainer(element || container),
                    pa = path.split('/'); //路径数组
                for (let i = 0; i < pa.length; i++) {
                    let key = pa[i];
                    switch (key) {
                        case '.':
                            return d;
                            break;
                        case '..':
                            if (c) c = nearest_datacontainer(c.parentNode);
                            if (c) d = c.data_of_thin;
                            else return undefined;
                            break;
                        default:
                            if (key in d) {
                                d = d[key];
                            } else return undefined;
                            if (d == undefined) return undefined;
                            break;
                    }
                }
                return d;
            }
        }
    }
});

//弹窗
function poplayer(p) {
    //蒙版层
    var popmask = document.createElement('popmask');
    popmask.style.zIndex = 1000;

    //弹出框
    var modaldialog = document.createElement('popdialog');
    modaldialog.style.width = typeof p.width === 'number' ? p.width + 'px' : p.width;
    popmask.appendChild(modaldialog);
    //弹出框-标题
    var header;
    if (p.header !== undefined) {
        header = document.createElement('popheader');
        $(header).html(p.header);
        var closeicon = document.createElement('closeicon');
        closeicon.innerText = '✕';
        closeicon.onclick = closepop;
        closeicon.onmouseover = function () {
            this.style.filter = 'alpha(opacity=80)';
            this.style.opacity = '.8';
        };
        closeicon.onmouseout = function () {
            this.style.filter = 'alpha(opacity=50)';
            this.style.opacity = '.5';
        };
        header.appendChild(closeicon);
        modaldialog.appendChild(header);
    }
    //弹出框-内容
    var popcontainer = document.createElement('popbody');

    switch (typeof p.height) {
        case 'string':
            popcontainer.style.height = p.height;
            break;
        case 'number':
            popcontainer.style.height = p.height + 'px';
            break;
        default:
            popcontainer.style.maxHeight = '600px';
            break;
    }
    popcontainer.style.overflowY = 'scroll';

    modaldialog.appendChild(popcontainer);
    document.body.appendChild(popmask);

    if (p.render !== undefined) {
        p.render({ container: popcontainer });
    } else {
        $(popcontainer).render({
            data: p.data,
            template: p.template
        });
    }
    //绑定拖拽
    popDrag(header, modaldialog);

    popmask.close = closepop; //绑定关闭函数

    return popmask;

    function closepop() {
        //关闭弹窗
        //如果定义了onclose回调函数，则调用一下。
        if (p.onclose !== undefined) {
            p.onclose();
        }
        $(popmask).remove();
    }
}

// poplayer.close = function(element) {
//     //tobe done
//     console.log({ pos: "poplayer.close", element: element });
// };

//拖拽函数
function popDrag(bar, target, callback) {
    //拖动事件参数对象
    var popDragParams = {
        left: 0,
        top: 0,
        currentX: 0,
        currentY: 0,
        flag: false,
        resetPosition: function () {
            var target_style_left = $(target).css('left');
            var target_style_top = $(target).css('top');
            if (target_style_left !== 'auto') {
                this.left = target_style_left;
            }
            if (target_style_top !== 'auto') {
                this.top = target_style_top;
            }
        }
    };
    popDragParams.resetPosition();
    bar.onmousedown = function (event) {
        popDragParams.flag = true;
        if (!event) {
            event = window.event;
            //防止IE文字选中
            bar.onselectstart = function () {
                return false;
            };
        }
        var e = event;
        popDragParams.currentX = e.clientX;
        popDragParams.currentY = e.clientY;
    };
    document.onmouseup = function () {
        popDragParams.flag = false;
        popDragParams.resetPosition();
    };
    document.onmousemove = function (event) {
        var e = event ? event : window.event;
        if (popDragParams.flag) {
            var nowX = e.clientX,
                nowY = e.clientY;
            var disX = nowX - popDragParams.currentX,
                disY = nowY - popDragParams.currentY;
            target.style.left = parseInt(popDragParams.left) + disX + 'px';
            target.style.top = parseInt(popDragParams.top) + disY + 'px';

            if (typeof callback == 'function') {
                callback((parseInt(popDragParams.left) || 0) + disX, (parseInt(popDragParams.top) || 0) + disY);
            }

            if (event.preventDefault) {
                event.preventDefault();
            }
            return false;
        }
    };
}

thin.jsonPath = function (obj, path) {};
