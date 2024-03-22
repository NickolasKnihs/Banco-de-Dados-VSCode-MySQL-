const Sequelize = require ('sequelize');   // requerer o sequelize 

const conexao = new Sequelize('nodejs', 'root', 'root', { // banco, usuario, senha
    host: 'localhost',     // url
    dialect: 'mysql'       // tipod de banco para usar 
});

conexao.authenticate()        // testar a conexão
    .then(() => {        // promessa, obtendo uma resposta 
        console.log('Conectado com sucesso');
    }).catch((erro) => {
        console.log('Deu erro ', erro)
    });

const Cargo = conexao.define('cargos', {      //defina para mim uma tabela chamada cargos
    codigo: {          //apos os {} é o objeto de configuração da coluna [coluna codigo]
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    descricao: {
        type: Sequelize.STRING(150),
        allowNull: false
    }
}, {timestamps: false});  

Cargo.sync({     // sincronizar com o banco 
    // force: true  //  ele faz um "drop table" e depois um "create table"
    alter: true     // vai alterar nossas tabelas "alter table", mas nao exclui os dados
}); 

const Usuario = conexao.define('usuarios', {
    codigo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: Sequelize.STRING(150),
        allowNull: false
    },
    idade: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    cpf: {
        type: Sequelize.STRING(11),
        allowNull: false
    },
    codigoCargo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {   // Chave estrangeira
            model: Cargo,  // Referência à tabela Cargo
            key: 'codigo'  // Chave primária da tabela Cargo
        //  deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED
        }
    }
}, {timestamps: false});

// Usuario.belongsTo(Cargo);
// Cargo.hasMany(Usuario);

Usuario.sync({
    alter: true
});


//--------------------------------------------------------------------

const espresso = require('express');
const meuServidor = espresso();
meuServidor.use(espresso.json());

const listaCargos = [];

// ************************ Usuarios ************************
const listaUsuarios = [];
meuServidor.get('/usuarios', (requisicao, resposta) => {
    let respostaUsuarios = '';
    for (let index = 0; index < listaUsuarios.length; index++) {
        const usuario = listaUsuarios[index];
        respostaUsuarios += '<p>';
        respostaUsuarios += 'CÃ³digo: ';
        respostaUsuarios += usuario.id;
        respostaUsuarios += '</br>Nome: ';
        respostaUsuarios += usuario.nome;
        respostaUsuarios += '</br>Idade: ';
        respostaUsuarios += usuario.idade;
        respostaUsuarios += '</br>CPF: ';
        respostaUsuarios += usuario.CPF;
        respostaUsuarios += '</br>Cargo: ';
        const cargoEncontrado = listaCargos.find((cargoAtual) => {
            return cargoAtual.id == usuario.codigoCargo;
        })
        respostaUsuarios += cargoEncontrado.descricao;
        respostaUsuarios += '</p>';
    }
    resposta.send(respostaUsuarios);
});

meuServidor.post('/usuarios', (requisicao, resposta) => {
    const nome = requisicao.body.nome;
    const idade = requisicao.body.idade;
    const cpf = requisicao.body.cpf;
    const codigoCargo = requisicao.body.codigoCargo;
    let codigo = -99999999999999999;
    for (let index = 0; index < listaUsuarios.length;index++) {
        const usuarioAtual = listaUsuarios[index];
        if (usuarioAtual.id > codigo) {
            codigo = usuarioAtual.id;
        }
    }
    if (codigo < 0) {
        codigo = 0;
    }
    const novoUsuario = {
        id: codigo + 1,
        nome: nome,
        idade: idade,
        CPF: cpf,
        codigoCargo: codigoCargo
    };
    listaUsuarios.push(novoUsuario);
    resposta.send();
});

meuServidor.put('/usuarios/:usuarioId', (requisicao, resposta) => {
    const codigoUsuario = requisicao.params.usuarioId;
    const usuarioEncontrado = listaUsuarios.find((usuarioAtual) => {
        return usuarioAtual.id == codigoUsuario;
    });
    const nome = requisicao.body.nome;
    const idade = requisicao.body.idade;
    const cpf = requisicao.body.cpf;
    const codigoCargo = requisicao.body.codigoCargo;
    usuarioEncontrado.nome = nome;
    usuarioEncontrado.idade = idade;
    usuarioEncontrado.CPF = cpf;  
    usuarioEncontrado.codigoCargo = codigoCargo;
    resposta.send();
});

meuServidor.delete('/usuarios/:usuarioId', (requisicao, resposta) => {
    const codigoUsuario = requisicao.params.usuarioId;
    const indiceUsuario = listaUsuarios.findIndex((usuarioAtual) => {
        return usuarioAtual.id == codigoUsuario;
    });
    listaUsuarios.splice(indiceUsuario, 1);
    resposta.send();
});

meuServidor.get('/usuarios/:usuarioId', (requisicao, resposta) => {
    const codigoUsuario = requisicao.params.usuarioId;
    resposta.send(listaUsuarios.find((usuarioAtual) => {
        return usuarioAtual.id == codigoUsuario;
    }));
    return;
});

// ************************************************************************

// ************************ Cargos ************************

meuServidor.get('/cargos', async (requisicao, resposta) => {
    const cargos = await Cargo.findAll();
    resposta.send(cargos);
});

meuServidor.post('/cargos', async (requisicao, resposta) => {
    const descricao = requisicao.body.descricao;
    Cargo.create({ descricao: descricao }).then(() => {
        resposta.send('Cadastrado com sucesso');
    }). catch((erro) => {
        resposta.send('Ocorreu um erro: ' + erro);
    })
});

meuServidor.put('/cargos/:cargoId', (requisicao, resposta) => {
    const codigoCargo = requisicao.params.cargoId;
    const cargoEncontrado = listaCargos.find((cargoAtual) => {
        return cargoAtual.id == codigoCargo;
    });
    const descricao = requisicao.body.descricao;
    cargoEncontrado.descricao = descricao;
    resposta.send();
});

meuServidor.delete('/cargos/:cargoId', (requisicao, resposta) => {
    const codigoCargo = requisicao.params.cargoId;
    const indiceCargo = listaCargos.findIndex((cargoAtual) => {
        return cargoAtual.id == codigoCargo;
    });
    listaCargos.splice(indiceCargo, 1);
    resposta.send();
});

meuServidor.get('/cargos/:cargoId', (requisicao, resposta) => {
    const codigoCargo = requisicao.params.cargoId;
    resposta.send(listaCargos.find((cargoAtual) => {
        return cargoAtual.id == codigoCargo;
    }));
    return;
});

// ************************************************************************

meuServidor.listen(4300, () => {
    console.log('Meu primeiro servidor na porta 4300.');
});
