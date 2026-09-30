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

const ChartPie = (req, res) => {
    const userId = req.user.user_id;
    const { period } = req.query;

    let interval;

    switch (period) {
        case "7d":
            interval = 7;
            break;

        case "1m":
            interval = 30;
            break;

        case "3m":
            interval = 90;
            break;

        default:
            return res.status(400).json({
                message: "Period tidak valid"
            });
    }

    const sql = `
        SELECT
            c.name_categories AS category,
            SUM(t.amount) AS expenses,
            ROUND(
                SUM(t.amount) /
                (
                    SELECT SUM(t2.amount)
                    FROM transactions t2
                    JOIN categories c2
                        ON t2.id_categories = c2.categories_id
                    WHERE c2.type_categories = 'Expanses'
                      AND t2.id_user = ?
                      AND t2.created_at >= NOW() - INTERVAL ${interval} DAY
                ) * 100,
                2
            ) AS percentage
        FROM transactions t
        JOIN categories c
            ON t.id_categories = c.categories_id
        WHERE c.type_categories = 'Expanses'
          AND t.id_user = ?
          AND t.created_at >= NOW() - INTERVAL ${interval} DAY
        GROUP BY c.categories_id, c.name_categories
        ORDER BY expenses DESC
    `;

    connectDB.query(sql, [userId, userId], (error, data) => {
        if (error) {
            console.error("Chart Pie Error:", error);

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

const Progressbar = (req, res) => {
  const userid = req.user.user_id;

  // Ambil period dari query
  const { period = "1m" } = req.query;

  // Tentukan interval
  let interval;

  switch (period) {
    case "7d":
      interval = "7 DAY";
      break;

    case "1m":
      interval = "1 MONTH";
      break;

    case "3m":
      interval = "3 MONTH";
      break;

    default:
      return res.status(400).json({
        message: "Period harus 7d, 1m, atau 3m",
      });
  }

  const sql = `
    SELECT
      b.id_budgets,
      u.user_id,
      u.email_user,
      c.categories_id,
      c.name_categories,
      c.type_categories,
      b.budget_amount,
      b.period,
      b.start_date,
      b.end_date,
      b.created_at,

      COALESCE(
        SUM(
          CASE
            WHEN t.created_at BETWEEN b.start_date AND b.end_date
            THEN t.amount
            ELSE 0
          END
        ),
        0
      ) AS used_amount

    FROM budgets b

    INNER JOIN user_cermat u
      ON b.budget_user = u.user_id

    INNER JOIN categories c
      ON b.budget_category = c.categories_id

    LEFT JOIN transactions t
      ON t.id_user = b.budget_user
      AND t.id_categories = b.budget_category

    WHERE b.budget_user = ?

      AND b.start_date >= DATE_SUB(
        NOW(),
        INTERVAL ${interval}
      )

    GROUP BY
      b.id_budgets

    ORDER BY
      b.created_at DESC
  `;

  connectDB.query(sql, [userid], (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Gagal mengambil data budgeting",
        error: err.message,
      });
    }

    const data = result.map((item) => {
      const used = Number(item.used_amount);
      const budget = Number(item.budget_amount);

      const remaining = budget - used;

      const progress =
        budget === 0
          ? 0
          : Math.min((used / budget) * 100, 100);

      return {
        ...item,
        budget_amount: budget,
        used_amount: used,
        remaining,
        progress,
      };
    });

    return res.status(200).json({
      period,
      data,
      message: "Memuat data budgeting",
    });
  });
};

module.exports = {
    Chart,
    ChartPie, 
    Progressbar,
};