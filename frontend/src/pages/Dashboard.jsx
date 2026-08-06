import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";import axios from "axios";
import {
  Package,
  Boxes,
  CalendarX,
  TriangleAlert,
  Plus,
  ScanLine,
  FileSpreadsheet,
  ShoppingCart,
  Layers,
  ArrowLeftRight
} from "lucide-react";
import BarcodeScanner from "react-qr-barcode-scanner";
import "../App.css";

function Dashboard() {
const API = "http://localhost:5000";
  ;
const navigate = useNavigate();
  // =====================
  // ETATS GENERAUX
  // =====================

  const [produits, setProduits] = useState([]);

  const [stats, setStats] = useState({
    totalProduits: 0,
    stockTotal: 0,
    produitsExpires: 0,
    produitsUrgents: 0,
    totalLots: 0,
    mouvements: 0
  });

  const [apiStatus, setApiStatus] = useState("Connexion...");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [popup, setPopup] = useState({
    show: false,
    type: "",
    message: ""
  });
const [nombreAlertes, setNombreAlertes] = useState(0);
useEffect(() => {
  const alertes = produits.filter((p) => {
    if (!p.expiry_date) return false;

    const date = new Date(p.expiry_date);
    const aujourdHui = new Date();

    const jours = Math.ceil(
      (date - aujourdHui) / (1000 * 60 * 60 * 24)
    );

    return jours < 30;
  });

  setNombreAlertes(alertes.length);
}, [produits]);

  // =====================
  // FORMULAIRE AJOUT
  // =====================

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [lot_number, setLotNumber] = useState("");
  const [manufacture_date, setManufactureDate] = useState("");
  const [expiry_date, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  // =====================
  // SCANNER
  // =====================

  const [showScanner, setShowScanner] = useState(false);

  // =====================
  // CSV
  // =====================

  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);

  // =====================
  // ALARME EXPIRATION
  // =====================

  const [alarmeCoupee, setAlarmeCoupee] = useState(false);

  // =====================
  // RAFRAICHIR DONNEES
  // =====================

  const refreshData = async () => {
    try {
      const products = await axios.get(
        `${API}/api/products`
      );

      setProduits(products.data);

      try {
        const dashboard = await axios.get(
          `${API}/api/dashboard`
        );

        setStats(dashboard.data);
      } catch {
        setStats({
          totalProduits: products.data.length,
          stockTotal: products.data.reduce(
            (a, p) => a + p.quantity, 0
          ),
          produitsExpires: 0,
          produitsUrgents: 0,
          totalLots: 0,
          mouvements: 0
        });
      }

      setApiStatus("Serveur connecté ✅");
    } catch (error) {
      console.error(error);
      setApiStatus(
        "Serveur indisponible ❌"
      );
    }
  };

  // =====================
  // POPUP
  // =====================

  const showPopup = (type, message) => {
    setPopup({
      show: true,
      type,
      message
    });

    setTimeout(() => {
      setPopup({
        show: false,
        type: "",
        message: ""
      });
    }, 3000);
  };

  // =====================
  // VERIFICATION EXPIRATION + SONNETTE
  // =====================

  const verifierPeremption = () => {
    const maintenant = new Date();

    const produitPerime = produits.find(
      p =>
        p.expiry_date &&
        new Date(p.expiry_date) < maintenant
    );

    if (produitPerime) {
      if (!window.alerteAudio && !alarmeCoupee) {
        const audio = new Audio("/alert.mp3");
        audio.loop = true;
        audio.play()
          .catch(err =>
            console.log(
              "Son bloqué",
              err
            )
          );

        window.alerteAudio = audio;
      }

      showPopup(
        "error",
        `⚠️ Produit périmé : ${produitPerime.name}`
      );
    } else {
      if (window.alerteAudio) {
        window.alerteAudio.pause();
        window.alerteAudio = null;
      }
    }
  };

  const arreterAlarme = () => {
    if (window.alerteAudio) {
      window.alerteAudio.pause();
      window.alerteAudio.currentTime = 0;
      window.alerteAudio = null;
    }
    setAlarmeCoupee(true);
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    verifierPeremption();
    const timer = setInterval(
      verifierPeremption,
      60000
    );

    return () => clearInterval(timer);
  }, [produits]);

  // =====================
  // AJOUT PRODUIT
  // =====================

  const enregistrerProduit = async () => {
    if (!name.trim()) {
      setMessage(
        "❌ Le nom du produit est obligatoire"
      );
      return;
    }

    try {
      await axios.post(
        `${API}/api/products`,
        {
          name,
          barcode: barcode.trim() || null,
          lot_number: lot_number || null,
          manufacture_date: manufacture_date || null,

          expiry_date: expiry_date || null,
          quantity: Number(quantity) || 0,
          price: Number(price) || null
        }
      );

      setMessage(
        "✅ Produit enregistré avec succès"
      );

      setTimeout(
        () => setMessage(""),
        3000
      );

      setShowAddForm(false);

setName("");
setBarcode("");
setLotNumber("");
setManufactureDate("");
setExpiryDate("");
setQuantity("");
setPrice("");
      refreshData();
    } catch (error) {
      console.error(
        error.response?.data || error
      );

      setMessage(
        "❌ Erreur ajout produit"
      );
    }
  };

  // =====================
  // SUPPRESSION PRODUIT
  // =====================

  const supprimerProduit = async (product) => {
    if (
      !window.confirm(
        `Supprimer ${product.name} ?`
      )
    )
      return;

    try {
      await axios.delete(
        `${API}/api/products/${product.id}`
      );

      showPopup(
        "success",
        "Produit supprimé 🗑️"
      );

      refreshData();
    } catch (error) {
      showPopup(
        "error",
        "Erreur suppression"
      );
    }
  };

  // =====================
  // RECHERCHE + TRI FEFO
  // =====================

  const produitsFiltres = useMemo(() => {
    return produits
      .filter(p => p.name)
      .filter(p => {
        const texte =
          search.toLowerCase();

        return (
          p.name
            ?.toLowerCase()
            .includes(texte)
          ||
          p.barcode
            ?.toLowerCase()
            .includes(texte)
          ||
          p.lot_number
            ?.toLowerCase()
            .includes(texte)
        );
      })
      .sort(
        (a, b) =>
          new Date(a.expiry_date)
          -
          new Date(b.expiry_date)
      );
  }, [produits, search]);

  // =====================
  // IMPORT CSV
  // =====================

  const importerCSV = async () => {
    if (!csvFile) {
      showPopup(
        "error",
        "Choisir un fichier CSV"
      );
      return;
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      csvFile
    );

    try {
      await axios.post(
        `${API}/api/upload-csv`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }
      );

      showPopup(
        "success",
        "Import réussi ✅"
      );

      setShowCsvModal(false);
      refreshData();
    } catch (error) {
      showPopup(
        "error",
        "Erreur import CSV"
      );
    }
  };

  return (
    <div className="dashboard-dark">

      {popup.show && (
        <div className="popup-alert">
          {popup.message}

          {popup.type === "error" && (
            <button onClick={arreterAlarme}>
              🔇 Arrêter la sonnette
            </button>
          )}
        </div>
      )}

      <header className="fefo-banner">
        <div className="brand-title">
          <h1>GESTION DE<br />STOCK FEFO</h1>

          <div className="box-3d">
            <div className="cube">
              <div className="face front"></div>
              <div className="face back"></div>
              <div className="face right"></div>
              <div className="face left"></div>
              <div className="face top"></div>
              <div className="face bottom"></div>
            </div>
          </div>
        </div>

        <p className="fefo-desc">
          First Expired, First Out (Premier périmé, premier sorti)
        </p>
      </header>

      <section className="product-search">
        <input
          placeholder="🔍 Nom, code-barres, lot"
          value={search}
          onChange={
            e => setSearch(e.target.value)
          }
        />
      </section>

      <section className="product-actions">
        <button
          onClick={() =>
            setShowAddForm(true)}
        >
          <Plus />
          Ajouter
        </button>

        <button
          onClick={() =>
            setShowScanner(true)}
        >
          <ScanLine />
          Scanner
        </button>

        <button
          onClick={() =>
            setShowCsvModal(true)}
        >
          <FileSpreadsheet />
          CSV
        </button>
<button
  onClick={() => navigate("/entries")}
>
  <Boxes />
  Entrée
</button>
<button
  onClick={() => navigate("/outputs")}
>
  <ShoppingCart />
  Sortie
</button>

      </section>

      <div className="cards">
        <div className="card-fefo">
          <Package />
          <h3>Produits</h3>
          <strong>
            {stats.totalProduits}
          </strong>
        </div>

        <div className="card-fefo">
          <Boxes />
          <h3>Stock total</h3>
          <strong>
            {stats.stockTotal}
          </strong>
        </div>

        <div className="card-fefo">
          <CalendarX />
          <h3>Expirés</h3>
          <strong>
            {stats.produitsExpires}
          </strong>
        </div>

        <div className="card-fefo">
          <TriangleAlert />
          <h3>Alertes</h3>
          <strong>
            {stats.produitsUrgents}
          </strong>
        </div>

        <div className="card-fefo">
          <Layers />
          <h3>Lots</h3>
          <strong>
            {stats.totalLots}
          </strong>
        </div>

        <div className="card-fefo">
          <ArrowLeftRight />
          <h3>Mouvements</h3>
          <strong>
            {stats.mouvements}
          </strong>
        </div>
      </div>

      <div className="product-list">
        {produitsFiltres.map(product => {
          const jours =
            Math.ceil(
              (
                new Date(product.expiry_date)
                -
                new Date()
              )
              /
              (1000 * 60 * 60 * 24)
            );

          let statut = "OK";

          if (jours < 0)
            statut = "🔴 EXPIRÉ";
          else if (jours < 30)
            statut = "🟠 ALERTE";

          return (
            <div
              key={product.id}
              className="product-row"
            >
              <b>
                {product.name}
              </b>

              <span>
                Qté : {product.quantity}
              </span>

              <span>
                Exp :{" "}
                {new Date(
                  product.expiry_date
                )
                  .toLocaleDateString()}
              </span>

              <span>
                {statut}
              </span>

              <button
                onClick={() =>
                  supprimerProduit(product)}
              >
                🗑️
              </button>
            </div>
          );
        })}
      </div>

      {showAddForm && (
        <div className="modal">
          <div className="modal-box">
            <h2>
              Nouveau produit
            </h2>

            <input
              placeholder="Nom"
              value={name}
              onChange={
                e => setName(e.target.value)}
            />

            <input
              placeholder="Code-barres (optionnel)"
              value={barcode}
              onChange={
                e => setBarcode(e.target.value)}
            />

            <input
              placeholder="Lot"
              value={lot_number}
              onChange={
                e => setLotNumber(e.target.value)}
            />

            <input
              type="date"
              value={manufacture_date}
              onChange={
                e => setManufactureDate(e.target.value)}
            />

            <input
              type="date"
              value={expiry_date}
              onChange={
                e => setExpiryDate(e.target.value)}
            />

            <input
              type="number"
              placeholder="Quantité"
              value={quantity}
              onChange={
                e => setQuantity(e.target.value)}
            />

            <button
              onClick={enregistrerProduit}
            >
              ✅ Enregistrer
            </button>

            <button
              onClick={() =>
                setShowAddForm(false)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
      {showScanner && (
        <div className="modal">
          <div className="modal-box">

            <h2>📷 Scanner code-barres</h2>

            <BarcodeScanner
              onUpdate={(err, result) => {
                if (result) {
                  setBarcode(result.getText());
                  setShowScanner(false);
                  setShowAddForm(true);
                }
              }}
            />

            <button
              onClick={() => setShowScanner(false)}
            >
              Fermer
            </button>

          </div>
        </div>
      )}

      {showCsvModal && (
        <div className="modal">
          <div className="modal-box">
            <h2>
              Import CSV
            </h2>

            <input
              type="file"
              accept=".csv"
              onChange={
                e => setCsvFile(e.target.files[0])
              }
            />

            <button
              onClick={importerCSV}
            >
              🚀 Importer
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

    </div>
  );
}

export default Dashboard;
