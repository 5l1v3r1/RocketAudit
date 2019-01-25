//salva os valores para a sessão
const saveToStorage = (key, value) => sessionStorage.setItem(key, JSON.stringify(value));

//retorna os valores salvos na sessão
const getFromStorage = (key) => JSON.parse(sessionStorage.getItem(key));

//exclui os valores salvos na sessão
const removeFromStorage = (key) => sessionStorage.removeItem(key);

//formata o horário
const formataData = (data) => {
    console.log(typeof data)
    if (typeof data === 'string') {
        let dataFormatada = data.split("T")[0].split("-");

        let ano = dataFormatada[0];
        let mes = dataFormatada[1];
        let dia = dataFormatada[2];
        return `${dia}/${mes}/${ano}`
    } else if (typeof data === 'object') {
        let ano = data.getFullYear();
        let mes = ("0" + (data.getMonth() + 1)).slice(-2);
        let dia = ("0" + data.getDate()).slice(-2);

        return `${dia}/${mes}/${ano}`
    }
}



const REST = {
    listaUsuarios: URL + '/api/v1/users.list',
    loga: URL + '/api/v1/login',
    listaMensagensDiretas: URL + '/api/v1/im.list.everyone',
    listaHistoricoMensagensDiretas: URL + '/api/v1/im.messages.others'
};


class API {
    constructor(http, token = '', scope = '') {
        this.http = http;
        this.token = token;
        this.scope = scope;
    }

    /* 
        FAZ O LOGIN DA API E RETORNA O TOKEN
     */
    logar(usuario, senha) {
        console.log('teste')
        this.http({
            method: 'POST',
            url: REST.loga,
            data: {
                username: usuario,
                password: senha
            },
            headers: {
                "Content-Type": "application/json"
            }
        }).then(
            (success => {
                console.log(success);
                if (success.data.data.me.roles.indexOf('admin') < 0) {
                    alert("Acesso negado!");
                } else {
                    let token = {
                        userid: success.data.data.me._id,
                        authToken: success.data.data.authToken,
                        role: success.data.data.me.roles
                    };

                    saveToStorage('token', token);
                    window.location = 'dashboard.html';
                };

            }),
            (error => alert("Acesso negado")));
    }

    /* 
        TRAZ A LISTA DE USUÁRIOS NO CHAT
    */
    listarUsuarios() {
        this.http({
            method: 'GET',
            url: REST.listaUsuarios,
            headers: {
                'X-Auth-Token': this.token.authToken,
                'X-User-Id': this.token.userid,
                "Content-Type": "application/json"
            }
        }).then((success => {
            let users = [];
            success.data.users.map(u => {
                if (u.username == 'rlima' || u.username == 'flima' || u.username == 'acepeda') {
                    return;
                } else {
                    users.push(u);
                }
            })
            saveToStorage('users', users);
        }), (error => console.log(error)));
    }

    /*
        TRAZ A LISTA DE TODAS AS MENSAGENS DIRETAS DO CHAT
    */
    pegarMensagensDiretas() {
        this.http({
            method: 'GET',
            url: REST.listaMensagensDiretas,
            headers: {
                'X-Auth-Token': this.token.authToken,
                'X-User-Id': this.token.userid,
                "Content-Type": "application/json"
            }
        }).then((data => saveToStorage('dm', data.data)),
            (error => console.log(error)));
    }

    /*
        RETORNA O HISTORICO DE UMA MENSAGEM DIRETA ESPECIFICA
    */
    pegarHistorico(roomId) {
        this.http({
            method: 'GET',
            url: REST.listaHistoricoMensagensDiretas,
            params: {
                'roomId': roomId
            },
            headers: {
                'X-Auth-Token': this.token.authToken,
                'X-User-Id': this.token.userid,
                "Content-Type": "application/json"
            }
        }).then((data => {
            // apaga o antigo historico da memoria
            removeFromStorage('historico');

            // converte a data da mensagem para um objeto data
            let messages = [];
            data.data.messages.reverse().map(msg => {
                msg.ts = new Date(msg.ts)
                messages.push(msg);
            })
            // salva o novo historico
            saveToStorage('historico', messages);

            this.scope.messages = getFromStorage('historico');
        }), (error => console.log(error)));
    }
}
