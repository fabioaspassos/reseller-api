import { Server } from './server/server'
import { ressellersRouter } from './ressellers/ressellers.router'
import { ordersRouter } from './orders/orders.router'

const server = new Server()
server.bootstrap([
    ressellersRouter,
    ordersRouter
]).then(server => {
    console.log('Server is listening on:', server.application.address())
}).catch(error => {
    console.log('Server failed to start')
    console.error(error)
    process.exit(1)
})