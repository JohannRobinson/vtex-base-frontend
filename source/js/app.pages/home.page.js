APP.pages.home = new APP.constructor.page("home"),
    APP.pages.home.DOMReady = function () {
        console.log('HOME Page');
        APP.modules.datos.cargarUsuarios();
    }
