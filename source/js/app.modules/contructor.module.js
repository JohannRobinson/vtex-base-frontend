
window.B2B = window.B2B || {},

    B2B.pages = {},
    B2B.modules = {},
    B2B.services = {},

    B2B.init = function () {
        B2B.pages.common.init(),
            i2bmod.MasterData.setStore('vvee'),
            $.each(B2B.pages, function () {
                $("section#page").hasClass(this.pageClass) && this.hasOwnProperty("init") && this.init()
            })
    }

B2B.constructor = {},
    B2B.constructor.page = function (pageClass) {
        this.pageClass = pageClass,
            this.DOMReady = function () { },
            this.winLoad = function () { },
            this.ajaxStop = function () { },
            this.common = function () { },

            this._winLoad = function () {
                var e = this;
                $(window).load(function () {
                    e.winLoad()
                })
            },
            this._DOMReady = function () {
                var e = this;
                $(document).ready(function () {
                    e.common(), e.DOMReady()
                })
            },
            this._ajaxStop = function () {
                var e = this;
                $(document).ajaxStop(function () {
                    e.common(), e.ajaxStop()
                })
            },
            this._common = function () {
                var e = this;
                e.common()
            },
            this.init = function () {
                this._DOMReady(), this._winLoad(), this._ajaxStop()
            }
    }