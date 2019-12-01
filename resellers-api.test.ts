import 'jest'
import * as request from 'supertest'
import { Server } from './server/server'
import { environment } from './common/environment'
import { ressellersRouter } from './ressellers/ressellers.router'
import { Resseller } from './ressellers/resellers.model'
import { ordersRouter } from './orders/orders.router'
import { Order } from './orders/orders.model'


let server: Server
let address: string = (<any>global).address

beforeAll(() => {
    environment.db.url = process.env.DB_URL || 'mongodb://localhost/reseller-api-test-db'
    environment.server.port = process.env.SERVER_PORT || 3001
    server = new Server()
    return server.bootstrap([
        ressellersRouter,
        ordersRouter
    ])
        .then(() => Resseller.remove({}).exec())
        .then(() => Order.remove({}).exec())
        .catch(console.error)
})

afterAll(() => {
    return server.shutdown()
})

/**
 * Inicio dos testes dos Revendedores
 */
test('post /ressellers', () => {
    return request(address)
        .post('/ressellers')
        .send({
            nome: "Revendedor 01",
            cpf: "15350946056",
            email: "revendedor01@email.com",
            password: "123",
            genero: "Femino"
        })
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body._id).toBeDefined()
            expect(response.body.nome).toBe('Revendedor 01')
            expect(response.body.email).toBe('revendedor01@email.com')
            expect(response.body.cpf).toBe('15350946056')
            expect(response.body.password).toBeUndefined()
        }).catch(fail)
})

test('post /ressellers - CPF Required', () => {
    return request(address)
        .post('/ressellers')
        .send({
            nome: "Revendedor 02",
            email: "revendedor02@email.com",
            password: "123",
            genero: "Femino"
        })
        .then(response => {
            expect(response.status).toBe(400)
            expect(response.body.errors).toBeInstanceOf(Array)
        }).catch(fail)
})

test('get /ressellers', () => {
    return request(address)
        .get('/ressellers')
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body).toBeInstanceOf(Array)
        }).catch(fail)
})

test('get /ressellers/aaaaa - not found', () => {
    return request(address)
        .get('/ressellers/aaaaa')
        .then(response => {
            expect(response.status).toBe(404)
        }).catch(fail)
})

test('patch /ressellers/aaaaa - not found', () => {
    return request(address)
        .patch(`/ressellers/aaaaa`)
        .then(response => {
            expect(response.status).toBe(404)
        }).catch(fail)
})

test('patch /ressellers/:id', () => {
    return request(address)
        .post('/ressellers')
        .send({
            nome: "Revendedor 03",
            cpf: "53477760565",
            email: "revendedor03@email.com",
            password: "123",
            genero: "Masculino"
        })
        .then(response => request(address)
            .patch(`/ressellers/${response.body._id}`)
            .send({
                nome: 'Revendedor 03 - patch'
            }))
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body._id).toBeDefined()
            expect(response.body.nome).toBe('Revendedor 03 - patch')
            expect(response.body.email).toBe('revendedor03@email.com')
            expect(response.body.password).toBeUndefined()
        })
        .catch(fail)
})

test('get /ressellers/:cpf/cashback', () => {
    return request(address)
        .get('/ressellers/15350946056/cashback')
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body.credit).toBeGreaterThan(0)
        }).catch(fail)
})


/**
 * Inicio dos testes dos Pedidos
 */
test('post /orders - Status Aprovado - cashback 10%', () => {
    return request(address)
        .post('/orders')
        .send({
            codigo: 1,
            valor: 200,
            data: "2019-11-30T10:36",
            qtde_itens: 1,
            cpf: "15350946056"
        })
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body._id).toBeDefined()
            expect(response.body.codigo).toBe(1)
            expect(response.body.cashback).toBe(0.1)
            expect(response.body.status).toBe('Aprovado')
        }).catch(fail)
})
