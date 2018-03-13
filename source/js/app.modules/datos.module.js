APP.modules.datos = {},
    APP.modules.datos.cargarUsuarios = function () {
        
        Promise.all(
            [
                APP.services.datos.consultarUsuarios(),
                APP.services.datos.consultarUsuarios2(),
                APP.services.datos.consultarUsuarios3() 
            ]
        ).then(function (dataConsultas) {
            console.log(dataConsultas) // [rspDistrito,rspDistrito2,rspDistrito2]
         })

    },
    APP.modules.datos.cargarEmpresas = function () {
        console.log('Cargar');
    },
    APP.modules.datos.actualizar = function () {
        console.log('Actualizar');
    },
    APP.modules.datos.init = function () {
        APP.modules.datos.cargarUsuarios(),
        APP.modules.datos.cargarEmpresas()
    }