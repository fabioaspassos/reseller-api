# Resseler - API
Este é um projeto exemplo de Cashback para Revendedoras.

### Frameworks utilizados
- Mongoose
- Restify
- jsonwebtoken
- bcrypt
- jest
- supertest

### Pré-requisitos
 - Serviço de MongoDB instalado local.

### Execução
As configurações de porta de execução e url de banco são configuradas em /common/environments.ts

### Execução do testes
 Na raiz do diretorio do projeto executar a linha de comando no terminal:
 > npm test

 ### Rotas e exemplos de chamada

#### Revendedora

##### Estrutura do objeto Resseller
{
    nome: string,
    cpf: string,
    email: string,
    password: string,
    genero: enum['Masculino', 'Femino']
}

##### GET /ressellers
Retorna todos os revendedores armazenados na base de dados.

##### GET /ressellers/:id
Retorna o revendedor especifico, caso exista.

##### PATCH /ressellers/:id
Altera o(s) dado(s) de um revendedor existente na base de dados.
Atenção para o envio do Headers, Content-Type=application/merge-patch+json

##### POST /ressellers
Adciona um novorevendedor. Dados obrigatorios nome, cpf, email e password

##### POST /ressellers/authenticate
Autentica um revendedor.
Estrutura do body:
{
	email: string,
	password: string
}

Caso a autenticação retornar com sucesso, o servico irá fornecer um JSON com o atributo 'accessToken'

#### Compras

##### Estrutura do objeto Compras
{
    codigo: number,
    valor: number,
    data: Date,
    status: String,
    cpf: String,
    cashback: number
}

##### GET /orders
Retorna todos os pedidos armazenados na base de dados.

##### GET /orders/:id
Retorna um pedido especifico, caso exista.

##### PATCH /orders/:id
Altera o(s) dado(s) de um pedido existente na base de dados. Os pedidos com status Aprovado, não poderão ser alterados.
Atenção para o envio do Headers, Content-Type=application/merge-patch+json

##### POST /orders
Adciona um novo pedido. Dados obrigatorios codigo, valor, data e cpf

##### DEL /orders/:id
Remove um pedido existente da base de dados. Os pedidos com status Aprovado, não poderão ser removidos.

##### Os critérios de bonificação (cashback)
- Para até 1.000 reais em compras, o revendedor(a) receberá 10% de cashback do valor vendido no período;
- Entre 1.000 e 1.500 reais em compras, o revendedor(a) receberá 15% de cashback do valor vendido no período;
- Acima de 1.500 reais em compras, o revendedor(a) receberá 20% de cashback do valor vendido no período