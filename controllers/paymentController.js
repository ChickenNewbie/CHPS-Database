import paymemtModel from "../models/paymentModel.js";

export default class paymentController{
    static async all(req, res){
        try {
            const payments = await paymemtModel.fetchPayments();
            res.status(200).json({
                success: true,
                data: payments 
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}