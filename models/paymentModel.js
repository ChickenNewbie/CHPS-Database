import { BASE_URL } from "../config/constants.js";
import { execute } from "../config/db.js";
export default class paymemtModel{
    static async fetchPayments() {
            try {
                const query = `
                    SELECT * FROM phuongthucthanhtoan
                   `;
                const [rows] = await execute(query);
                return rows.map(row =>({
                    ...row,
                    HinhAnh : row.HinhAnh ? `${BASE_URL}${row.HinhAnh}` : null
                }))
            } catch (error) {
                throw new Error('Database query failed in cartItemModel: ' + error.message);
            }
        }
}