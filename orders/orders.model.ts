import * as mongoose from 'mongoose'
import { validateCPF } from '../common/validators'

export interface Order extends mongoose.Document {
    codigo: number,
    valor: number,
    data: Date,
    status: String,
    cpf: String,
    cashback: number
}

const orderSchema = new mongoose.Schema({
    codigo: {
        type: Number,
        required: true
    },
    valor: {
        type: Number,
        required: true
    },
    data: {
        type: Date,
        required: true
    },
    qtde_itens: {
        type: Number,
        required: false
    },
    cpf: {
        type: String,
        required: true,
        validate: {
            validator: validateCPF,
            message: `{PATH}: Invalid CPF ({VALUE})`
        }
    },
    status: {
        type: String,
        required: true,
        enum: ['Aprovado', 'Em Validação'],
        default: 'Em Validação'
    },
    cashback: {
        type: Number,
        required: true,
        default: 0
    }
})

const saveMiddleware = function (next) {
    const order: Order = this
    if (order.isModified('cpf')) {
        let cpf = order.cpf.replace('.', '').replace('-', '')
        if (cpf === '15350946056') {
            order.status = 'Aprovado'
            if (order.valor <= 1000){
                order.cashback = 0.1    
            }else if (order.valor >= 1001 && order.valor <= 1500){
                order.cashback = 0.15    
            }else if (order.valor > 1500){
                order.cashback = 0.2
            }
        } else {
            order.status = 'Em Validação'
            order.cashback = 0
        }
    }
    next()
}

orderSchema.pre('save', saveMiddleware)

export const Order = mongoose.model<Order>('Order', orderSchema)