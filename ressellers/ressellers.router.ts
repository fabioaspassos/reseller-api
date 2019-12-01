import * as restify from 'restify'
import * as request from 'request'
import { ModelRouter } from '../common/model-router'
import {Resseller} from './resellers.model'
import {authenticate} from '../security/auth.handler'

class RessellersRouter extends ModelRouter<Resseller> {

    constructor(){
        super(Resseller)
        this.on('beforeRender', document=>{
            document.password = undefined
        })
    }

    applyRoutes(application: restify.Server) {
        application.get('/ressellers', this.findAll)
        application.post('/ressellers', this.save)
        application.get('/ressellers/:id', [this.validateId, this.findById])
        application.patch('/ressellers/:id', [this.validateId, this.update])
        application.post('/ressellers/authenticate', authenticate)

        application.get('/ressellers/:cpf/cashback', (req, resp, next) =>{
            /**
             * Opcionalmente posso localizar o revendedor e informar o cpf dele pra consulta
             */
            
            let options = {
                url: `https://mdaqk8ek5j.execute-api.us-east-1.amazonaws.com/v1/cashback?cpf=${req.params.cpf}`,
                headers: {
                    'token': 'ZXPURQOARHiMc6Y0flhRC1LVlZQVFRnm'
                  }
            }
            request.get(options, function(error, response, body) {
                if (!error && response.statusCode === 200) {
                    const result = JSON.parse(body);
                    //retorna apenas o saldo.
                    resp.send(result.body)
              } else {
                  resp.send({ 'error' : error })
                }
             })
            next()
        }) 
    }
}

export const ressellersRouter = new RessellersRouter()