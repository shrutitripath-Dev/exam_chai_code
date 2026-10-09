import mongoose ,  {Schema} from 'mongoose';

const subscripthionSchema = new Schema({
    subscriber :{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }},{
    timestamps:true
})

export const Subscripthion = mongoose.model("Subscripthion",subscripthionSchema)