const connectDB = require("../DB/connections");

const Chart = (req, res) => {
    const userId = req.user.user_id;
    const { period } = req.query;

    let interval;
    let groupBy;

    switch (period) {
        case "7d":
            interval = 7;
            groupBy = "DATE(t.created_at)";
            break;

        case "1m":
            interval = 30;
            groupBy = "DATE(t.created_at)";
            break;

        case "3m":
            interval = 90;
            groupBy = "YEARWEEK(t.created_at, 1)";
            break;

        default:
            return res.status(400).json({
                message: "Period harus 7d, 1m, atau 3m",
            });
    }

    const sql = `
        SELECT
            ${groupBy} AS period,

            COALESCE(
                SUM(
                    CASE
                        WHEN c.type_categories = 'Income'
                        THEN t.amount
                        ELSE 0
                    END
                ),
                0
            ) AS income,

            COALESCE(
                SUM(
                    CASE
                        WHEN c.type_categories = 'Expanses'
                        THEN t.amount
                        ELSE 0
                    END
                ),
                0
            ) AS expenses

        FROM transactions t

        JOIN categories c
            ON t.id_categories = c.categories_id

        WHERE t.id_user = ?
            AND t.created_at >= DATE_SUB(
                CURDATE(),
                INTERVAL ${interval} DAY
            )

        GROUP BY ${groupBy}

        ORDER BY MIN(t.created_at) ASC
    `;

    connectDB.query(sql, [userId], (error, data) => {
        if (error) {
            console.error("Chart Error:", error);

            return res.status(500).json({
                message: "Gagal mengambil data analytics",
                error: error.message,
            });
        }

        return res.status(200).json({
            period,
            data,
        });
    });
};

module.exports = {
    Chart,
};