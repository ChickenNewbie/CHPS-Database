import { BASE_URL } from "../config/constants.js";
import { execute } from "../config/db.js";
export default class BannerModel{
    static async fetchBanner() {
            try {
                const query = `
                    SELECT * FROM banner
                   `;
                const [rows] = await execute(query);
                return rows.map(row =>({
                    ...row,
                    UrlBanner : row.UrlBanner ? `${BASE_URL}${row.UrlBanner}` : null
                }))
            } catch (error) {
                throw new Error('Database query failed in cartItemModel: ' + error.message);
            }
        }
}