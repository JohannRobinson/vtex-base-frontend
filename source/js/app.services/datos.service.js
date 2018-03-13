APP.services.datos = {},
    APP.services.datos.consultarUsuarios = function() {
        return new Promise((resolve,reject)=>{
            if (window.localStorage.getItem('usuarios')==null) {
                $.ajax({
                    url:'https://reqres.in/api/users?page=1',
                    type:'GET'
                })
                    .done(function (data){
                        window.localStorage.setItem('usuarios',JSON.stringify(data));
                        resolve(data)
                    })
            }else{
                var data = window.localStorage.getItem('usuarios')
                resolve(JSON.parse(data))
            }
        });
    },
    APP.services.datos.consultarUsuarios2 = function () {
        return new Promise((resolve, reject) => {
            if (window.localStorage.getItem('usuarios2') == null) {
                $.ajax({
                    url: 'https://reqres.in/api/users?page=1',
                    type: 'GET'
                })
                    .done(function (data) {
                        window.localStorage.setItem('usuarios2', JSON.stringify(data));
                        resolve(data)
                    })
            } else {
                var data = window.localStorage.getItem('usuarios2')
                resolve(JSON.parse(data))
            }
        });
    },
    APP.services.datos.consultarUsuarios3 = function () {
        return new Promise((resolve, reject) => {
            if (window.localStorage.getItem('usuarios3') == null) {
                $.ajax({
                    url: 'https://reqres.in/api/users?page=1',
                    type: 'GET'
                })
                    .done(function (data) {
                        window.localStorage.setItem('usuarios3', JSON.stringify(data));
                        resolve(data)
                    })
            } else {
                var data = window.localStorage.getItem('usuarios3')
                resolve(JSON.parse(data))
            }
        });
    } 