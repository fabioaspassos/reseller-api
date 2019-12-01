import * as restify from 'restify'
import * as jwt from 'jsonwebtoken'
import { NotAuthorizedError } from 'restify-errors'
import { environment } from '../common/environment'
import { Resseller } from '../ressellers/resellers.model'

export const authenticate: restify.RequestHandler = (req, resp, next) => {
    const { email, password } = req.body
    Resseller.findByEmail(email, '+password')
        .then(resseller => {
            if (resseller && resseller.matches(password)) {
                const token = jwt.sign({ sub: resseller.email, iss: 'resseller-api' },
                    environment.security.apiSecret)
                resp.json({
                    name: resseller.nome, 
                    email: resseller.email, 
                    accessToken: token 
                })
                return next(false)
            } else {
                return next(new NotAuthorizedError('Invalid Credentials'))
            }
        }).catch(next)
}
