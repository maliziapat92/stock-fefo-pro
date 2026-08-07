import { useEffect, useState } from "react";
import api from "../services/api";

function Outputs() {
  const [history, setHistory] = useState([]);
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/history")
      .then((res) => {
        setHistory(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur historique :", err);
        setHistory([]);
        setLoading(false);
      });
  }, []);


  const filteredHistory = history.filter((item) => {

    if (period === "all") return true;

    const date = new Date(item.date);
    const today = new Date();

    const diff =
      (today - date) /
      (1000 * 60 * 60 * 24);


    if (period === "day") {
      return date.toDateString() === today.toDateString();
    }

    if (period === "week") {
      return diff <= 7;
    }

    if (period === "month") {
      return (
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }

    return true;
  });


  return (
    <div
      className="page-container"
      style={{ padding: "20px", color: "white" }}
    >

      <h2>📤 Sorties de Stock</h2>

      <p style={{ color: "#aaa" }}>
        Historique des ventes et mouvements de stock.
      </p>


      <div
        style={{
          display: "flex",
          gap: "10px",
          margin: "20px 0"
        }}
      >

        {[
          ["all", "Tout"],
          ["day", "Aujourd'hui"],
          ["week", "7 jours"],
          ["month", "Ce mois"]
        ].map(([value, label]) => (

          <button
            key={value}
            onClick={() => setPeriod(value)}
            style={{
              padding: "8px 15px",
              borderRadius: "8px",
              border: "1px solid #333",
              cursor: "pointer",
              background:
                period === value ? "#ff0044" : "#222",
              color: "white"
            }}
          >
            {label}
          </button>

        ))}

      </div>


      {loading ? (

        <p>Chargement des mouvements...</p>

      ) : (

        <div style={{ overflowX: "auto" }}>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#161616"
            }}
          >

            <thead>

              <tr style={{ background: "#222" }}>
                <th>Type</th>
                <th>Produit</th>
                <th>Code-barres</th>
                <th>Lot</th>
                <th>Quantité</th>
                <th>Date</th>
              </tr>

            </thead>


            <tbody>

              {filteredHistory.length === 0 ? (

                <tr>
                  <td
                    colSpan="6"
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#888"
                    }}
                  >
                    Aucun mouvement enregistré.
                  </td>
                </tr>

              ) : (

                filteredHistory.map((item, index) => (

                  <tr
                    key={item.id || index}
                    style={{
                      borderBottom: "1px solid #333"
                    }}
                  >

                    <td>
                      {item.type || "MOUVEMENT"}
                    </td>


                    <td style={{ fontWeight: "bold" }}>
                      {item.produit || item.name || "Produit"}
                    </td>


                    <td>
                      {item.barcode || "-"}
                    </td>


                    <td>
                      {item.lot_number || "-"}
                    </td>


                    <td
                      style={{
                        color: "#ff0044",
                        fontWeight: "bold"
                      }}
                    >
                      -{item.quantity || 0}
                    </td>


                    <td>
                      {item.date
                        ? new Date(item.date)
                            .toLocaleDateString()
                        : "-"
                      }
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default Outputs;
