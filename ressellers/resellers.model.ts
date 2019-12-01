import * as mongoose from 'mongoose'
import * as bcrypt from 'bcrypt'

import { validateCPF } from '../common/validators'
import { environment } from '../common/environment'

export interface Resseller extends mongoose.Document {
    nome: String,
    cpf: String,
    email: String,
    genero: String,
    password: String,
    matches(password: string): boolean
}

export interface RessellerModel extends mongoose.Model<Resseller> {
    findByEmail(email: string, projection?: string): Promise<Resseller>
  }

const ressellerSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        minlength: 3
    },
    cpf: {
        type: String,
        required: true,
        validate: {
            validator: validateCPF,
            message: `{PATH}: Invalid CPF ({VALUE})`
        }
    },
    email: {
        type: String,
        match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        unique: true,
        required: true
    },
    password: {
        type: String,
        select: false,
        required: true
    },
    genero: {
        type: String,
        required: false,
        enum: ['Masculino', 'Femino']
    }
})

ressellerSchema.statics.findByEmail = function (email: string, projection: string) {
    return this.findOne({ email }, projection) //{email: email}
}

ressellerSchema.methods.matches = function (password: string): boolean {
    return bcrypt.compareSync(password, this.password)
}

const hashPassword = (obj, next) => {
    bcrypt.hash(obj.password, environment.security.saltRounds)
        .then(hash => {
            obj.password = hash
            next()
        }).catch(next)
}

const saveMiddleware = function (next) {
    const resseller: Resseller = this
    if (!resseller.isModified('password')) {
        next()
    } else {
        hashPassword(resseller, next)
    }
}

const updateMiddleware = function (next) {
    if (!this.getUpdate().password) {
        next()
    } else {
        hashPassword(this.getUpdate(), next)
    }
}

ressellerSchema.pre('save', saveMiddleware)
ressellerSchema.pre('findOneAndUpdate', updateMiddleware)


export const Resseller = mongoose.model<Resseller, RessellerModel>('Resseller', ressellerSchema)