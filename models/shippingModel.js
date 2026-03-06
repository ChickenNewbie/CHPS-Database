import { execute } from "../config/db.js";

export default class shippingModel {

    static async getPriceByAddress(diachi){
        const tinh = layTinh(diachi);
        const quan = layQuan(diachi);

        let rows;

        if(tinh != "Default" && quan){
            [rows] = await execute(
                `SELECT MaPVC, PhiShip
                 FROM phivanchuyen 
                 WHERE TinhThanh = ? AND QuanHuyen = ?
                 LIMIT 1`,
                [tinh, quan]
            );

            if (rows.length > 0) return rows[0];
        }

          if (tinh !== "Default") {
            [rows] = await execute(
                `SELECT MaPVC, PhiShip 
                 FROM phivanchuyen 
                 WHERE TinhThanh = ? AND QuanHuyen IS NULL
                 LIMIT 1`,
                [tinh]
            );

            if (rows.length > 0) return rows[0];
        }

         [rows] = await execute(
            `SELECT MaPVC, PhiShip 
             FROM phivanchuyen 
             WHERE TinhThanh = 'Default'
             LIMIT 1`
        );

        return rows.length > 0 ? rows[0] : { MaPVC: 1, PhiShip: 0 };
    }
}

function layTinh(diachi){
    if(
        diachi.includes("Thành Phố Hồ Chí Minh") ||
        diachi.includes("Thanh Pho Ho Chi Minh") ||
        diachi.includes("TP.HCM") ||
        diachi.includes("TP. Hồ Chí Minh") ||
        diachi.includes("tp. hcm") 

    ){
        return "TP. Hồ Chí Minh"
    }

    return "Default";
}

function layQuan(diaChi) {
    if (diaChi.includes("Quận 1") || diaChi.includes("Quan 1")) {
        return "Quận 1"; 
    }
    return null;
}
