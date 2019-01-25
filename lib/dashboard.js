dashboard.controller("dashboard", function ($http, $scope, $q) {

    let ds = this;

    ds.data = {
        de: '',
        ate: '',
        reset: ''
    }

    ds.token = getFromStorage('token');
    let users = getFromStorage('users')

    if (!ds.token) window.location = 'index.html';

    let api = new API($http, ds.token, $scope);

    api.listarUsuarios();

    api.pegarMensagensDiretas();

    ds.pegarHistorico = (roomID) => {
        api.pegarHistorico(roomID);
    }

    ds.mostraData = (data) => {
        let dataFormatada = data.toString().split('T');
        let [ano, mes, dia] = dataFormatada[0].split('-');
        let [hora, minuto, segundo] = dataFormatada[1].split(':');
        return `${dia}-${mes}-${ano} ${hora}:${minuto}:${segundo.split('.')[0]}`;
    }

    ds.converteData = (data) => {
        if (typeof data === 'object') {
            let ano = Number(data.getFullYear());
            let mes = Number(("0" + (data.getMonth())).slice(-2));
            let dia = Number(("0" + data.getDate()).slice(-2));
            return new Date(ano, mes, dia);
        }
    };

    ds.mostrarConversas = (obj) => {
        let channels = angular.element(document.querySelector("#channels"));
        channels.empty();
        let directMessages = getFromStorage('dm');
        let userChannels = [];

        let reg = new RegExp(obj._id)
        directMessages.ims.map(item => {
            if (reg.test(item._id)) {
                let other = item._id.replace(obj._id, '');
                users.map(u => {
                    if (other == u._id) {
                        let tmp = new Object();
                        tmp.name = u.name;
                        tmp.chat_id = item._id;
                        tmp.username = u.username
                        userChannels.push(tmp);
                    };
                })
            }
        })
        userChannels.sort((a, b) => a.name.localeCompare(b.name))
        $scope.rooms = userChannels;
    };

    $scope.listaUsuario = () => {
        if ($scope.busca == '') {
            $scope.users = String.empty;
        } else {
            let userList = []
            users.map(u => (u.name.toUpperCase().match($scope.busca.toUpperCase())) ? userList.push(u) : null);
            $scope.users = userList.sort((a, b) => a.name.localeCompare(b.name));
        }
    };

    $scope.filtraMensagens = () => {
        ds.data.ate = ds.data.ate;
        if (ds.data.de == undefined || ds.data.ate == undefined) {
            alert("Complete all dates.");
        } else if (ds.data.ate < ds.data.de) {
            alert("The start date can not be greater than the due date.");
        } else {
            let messages = getFromStorage('historico')  
            let filteredMessages = [];
            ds.data.ate = new Date(ds.data.ate.setHours(23,59,59))
            messages.map(msg => {
                let data = msg.ts;
                if ((moment(data).isAfter(ds.data.de)) && moment(data).isBefore(ds.data.ate)) {
                    filteredMessages.push(msg);
                }
            })
            $scope.messages = filteredMessages;
        }
    };

    $scope.resetaFiltro = () => {
        ds.data.de = '';
        ds.data.ate = '';
        $scope.messages = getFromStorage('historico')
    }
    // $http({
    //     method: 'GET',
    //     url: URL + "/api/v1/groups.listAll",
    //     // params:{
    //     //     'roomId': 'mAMCKWKJwenA52dcq'
    //     // },
    //     headers: {
    //         'X-Auth-Token': this.token.authToken,
    //         'X-User-Id': this.token.userid,
    //         "Content-Type": "application/json"
    //     }
    // }).then((data => console.log(data.data)),
    //     (error => console.log(error)));
});