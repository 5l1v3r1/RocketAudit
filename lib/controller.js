app.controller("login", function ($http, $rootScope) {

    let lg = this;

    lg.login = {
        usuario: "",
        senha: ""
    };

    lg.logar = function () {
       let api = new API($http);
       api.logar(lg.login.usuario, lg.login.senha);
    };

});