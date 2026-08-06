import { useEffect, useState } from "react";
import { TriangleAlert, Bell, BellOff } from "lucide-react";
import axios from "axios";

function Alerts() {
  const [produits, setProduits] = useState([]);
  const [alarmeActive, setAlarmeActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const chargerProduits = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProduits(res.data);
    } catch (err) {
      console.error("Erreur chargement alertes :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerProduits();

    const interval = setInterval(chargerProduits, 60000);
    return () => clearInterval(interval);
  }, []);

  const alertes = produits.filter((produit) => {
    if (!produit.expiry_date) return false;

    const aujourd = new Date();
    const expiration = new Date(produit.expiry_date);

    const jours =
      Math.ceil((expiration - aujourd) / (1000 * 60 * 60 * 24));

    return jours <= 30;
  });

  const jouerAlarme = () => {
    if (!alarmeActive && alertes.length > 0) {
      const audio = new Audio("/alert.mp3");
      audio.loop = true;
      audio.play()
        .catch((err) => console.log("Son bloqué :", err));

      window.alerteAudio = audio;
      setAlarmeActive(true);
    }
  };

  const arreterAlarme = () => {
    if (window.alerteAudio) {
      window.alerteAudio.pause();
      window.alerteAudio.currentTime = 0;
      window.alerteAudio = null;
    }

    setAlarmeActive(false);
  };

  useEffect(() => {
    if (alertes.length > 0) {
      jouerAlarme();
    }
  }, [alertes]);

  if (loading) {
    return (
      <div className="page-container">
        Chargement des alertes...
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: 20, color: "white" }}>

      <h2>
        <TriangleAlert color="#ffcc00" />
        Alertes FEFO
      </h2>

      <p style={{ color: "#aaa" }}>
        Surveillance automatique des produits proches de péremption.
      </p>

      {alertes.length > 0 && (
        <button
          onClick={arreterAlarme}
          style={{
            margin: "20px 0",
            padding: "12px 20px",
            background: "#ff0044",
            color: "white",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          <BellOff size={18} />
          Arrêter la sonnette
        </button>
      )}

      {alertes.length === 0 ? (
        <div style={{
          marginTop: 30,
          padding: 20,
          background: "#052e16",
          borderRadius: 12
        }}>
          ✅ Aucun produit en alerte
        </div>
      ) : (

        <div style={{ marginTop: 20 }}>

          <h3>
            <Bell color="#ffcc00" />
            {alertes.length} produit(s) à surveiller
          </h3>

          {alertes.map((produit) => {

            const jours = Math.ceil(
              (new Date(produit.expiry_date) - new Date()) /
              (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={produit.id}
                style={{
                  background: jours < 0 ? "#450a0a" : "#3b2500",
                  border: "1px solid #ffcc00",
                  padding: 15,
                  borderRadius: 12,
                  marginBottom: 12
                }}
              >

                <strong>
                  {produit.name}
                </strong>

                <br />

                Lot : {produit.lot_number || "-"}

                <br />

                Quantité : {produit.quantity}

                <br />

                Expiration :
                {" "}
                {new Date(produit.expiry_date)
                  .toLocaleDateString()}

                <br />

                <span style={{
                  color: jours < 0 ? "#ff0044" : "#ffcc00",
                  fontWeight: "bold"
                }}>
                  {jours < 0
                    ? "❌ PRODUIT EXPIRÉ"
                    : `⚠️ Expire dans ${jours} jour(s)`
                  }
                </span>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default Alerts;
