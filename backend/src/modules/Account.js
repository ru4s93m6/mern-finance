import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    accountType:{
        type: String,
        required: true,
        // enum:[] // Later we can add some values to limit the account type 
    },
    balance:{
        type: Number,
        required: true,
         default: 0 
    },
    currency:{
        type: String,
        required: false,
        default: 'TWD'
    },
    note:{
        type: String,
        required: false,
        default:''
    }
}, {timestamps: true})

const Account = mongoose.model('Account', AccountSchema);

export default Account;