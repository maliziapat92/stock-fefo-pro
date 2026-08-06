import { useEffect, useState } from "react";
import axios from "axios";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const chargerProduits = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/products"
      );

      setProducts(response.data);
    } catch (error) {
      console.error("Erreur chargement produits :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerProduits();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        Chargement des produits...
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: "20px", color: "white" }}>
      <h2>📦 Gestion des Produits</h2>

      <p style={{ color: "#aaa" }}>
        Liste complète du stock FEFO.
      </p>

      {products.length === 0 ? (
        <p>Aucun produit trouvé.</p>
      ) : (
        <div style={{ overflowX: "auto", marginTop: 20 }}>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#161616"
            }}
          >

            <thead>
              <tr style={{ background: "#222" }}>
                <th>Produit</th>
                <th>Code-barres</th>
                <th>Lot</th>
                <th>Quantité</th>
                <th>Fabrication</th>
                <th>Expiration</th>
                <th>Prix</th>
              </tr>
            </thead>


            <tbody>

              {products.map((product) => (

                <tr
                  key={product.id}
                  style={{
                    borderBottom: "1px solid #333"
                  }}
                >

                  <td style={{ padding: 12 }}>
                    {product.name}
                  </td>


                  <td>
                    {product.barcode || "-"}
                  </td>


                  <td>
                    {product.lot_number || "-"}
                  </td>


                  <td style={{ color:"#00ff88", fontWeight:"bold" }}>
                    {product.quantity}
                  </td>


                  <td>
                    {product.manufacture_date
                      ? new Date(product.manufacture_date)
                        .toLocaleDateString()
                      : "-"
                    }
                  </td>


                  <td>
                    {product.expiry_date
                      ? new Date(product.expiry_date)
                        .toLocaleDateString()
                      : "-"
                    }
                  </td>


                  <td>
                    {product.price
                      ? product.price + " FCFA"
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

export default Products;
