import * as restify from 'restify'
import { PreconditionRequiredError } from 'restify-errors'
import { Order } from '../orders/orders.model'
import { ModelRouter } from '../common/model-router'
import { ressellersRouter } from '../ressellers/ressellers.router'

class OrdersRouter extends ModelRouter<Order> {

    constructor() {
        super(Order)
        this.on('beforeRender', document => {
            document.password = undefined
        })
    }

    canEditOrDelete = (req, resp, next) => {
        this.model.findById(req.params.id).then(order => {
            if (order.status === 'Em Validação') {
                next()
            } else {
                next(new PreconditionRequiredError('Compra com status aprova não pode ser alterada ou excluida.'))
            }
        }).catch(next)
    }

    existResseller = (req, resp, next) => {
        ressellersRouter.model.find({ cpf: req.body.cpf }).then(resseller => {
            if (resseller.length === 0) {
                next(new PreconditionRequiredError('CPF do revendedor informado não existe na base'))
            }
            next()
        }).catch(next)
    }

    applyRoutes(application: restify.Server) {
        application.get('/orders', this.findAll)
        application.post('/orders', [this.existResseller, this.save])
        application.get('/orders/:id', [this.validateId, this.findById])
        application.patch('/orders/:id', [this.validateId, this.canEditOrDelete, this.update])
        application.del('/orders/:id', [this.validateId, this.canEditOrDelete, this.delete])
    }
}

export const ordersRouter = new OrdersRouter()