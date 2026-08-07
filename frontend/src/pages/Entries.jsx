import { useEffect, useState } from "react";
import api from "../services/api";

function Entries() {
  const [products, setProducts] = useState([]);
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/products")
      .then((res) => {
        setProducts(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement entrées :", err);
        setLoading(false);
      });
  }, []);


  const filteredProducts = products.filter((item) => {

    if (period === "all") return true;

    const date = new Date(item.created_at);
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
    <div className="page-container" style={{padding:"20px",color:"white"}}>

      <h2>📥 Entrées de Stock</h2>

      <p style={{color:"#aaa"}}>
        Historique des produits ajoutés dans le stock.
      </p>


      <div style={{display:"flex",gap:10,margin:"20px 0"}}>

        {[
          ["all","Tout"],
          ["day","Aujourd'hui"],
          ["week","7 jours"],
          ["month","Ce mois"]
        ].map(([value,label]) => (

          <button
            key={value}
            onClick={()=>setPeriod(value)}
            style={{
              padding:"8px 15px",
              borderRadius:8,
              border:"1px solid #333",
              background:period===value?"#00ff88":"#222",
              color:period===value?"#000":"white"
            }}
          >
            {label}
          </button>

        ))}

      </div>


      {loading ? (
        <p>Chargement...</p>

      ) : (

        <div style={{overflowX:"auto"}}>

          <table
            style={{
              width:"100%",
              borderCollapse:"collapse",
              background:"#161616"
            }}
          >

            <thead>

              <tr style={{background:"#222"}}>
                <th>Produit</th>
                <th>Code-barres</th>
                <th>Lot</th>
                <th>Quantité</th>
                <th>Fabrication</th>
                <th>Expiration</th>
              </tr>

            </thead>


            <tbody>

              {filteredProducts.map((item)=>(

                <tr
                  key={item.id}
                  style={{borderBottom:"1px solid #333"}}
                >

                  <td>{item.name}</td>

                  <td>
                    {item.barcode || "-"}
                  </td>

                  <td>
                    {item.lot_number || "-"}
                  </td>

                  <td style={{color:"#00ff88"}}>
                    +{item.quantity}
                  </td>

                  <td>
                    {item.manufacture_date
                    ? new Date(item.manufacture_date)
                    .toLocaleDateString()
                    : "-"
                    }
                  </td>

                  <td>
                    {item.expiry_date
                    ? new Date(item.expiry_date)
                    .toLocaleDateString()
                    : "-"
                    }
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default Entries;
