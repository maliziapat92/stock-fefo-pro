import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Package, Boxes, CalendarX, TriangleAlert, Layers, ScanLine, Plus, FileSpreadsheet, FileText, ShoppingCart } from "lucide-react";
import BarcodeScanner from 'react-qr-barcode-scanner';
import "../App.css";

function Dashboard() {
    const [showCsvModal, setShowCsvModal] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [stats, setStats] = useState({ totalProduits: 0, stockTotal: 0, produitsExpires: 0, produitsUrgents: 0, totalLots: 0, mouvements: 0 });
    const [produits, setProduits] = useState([]);
    const [popup, setPopup] = useState({ show: false, type: "", message: "" });
    const [apiStatus, setApiStatus] = useState("Connexion...");
    const [search, setSearch] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [message, setMessage] = useState("");
    const [showScanner, setShowScanner] = useState(false);
    const [alarmeCoupee, setAlarmeCoupee] = useState(false);

    // États pour la Caisse / Vente Générale
    const [showVenteModal, setShowVenteModal] = useState(false);
    const [rechercheVente, setRechercheVente] = useState("");
    const [produitSelectionne, setProduitSelectionne] = useState(null);
    const [quantiteVendu, setQuantiteVendu] = useState(1);
    const [loadingVente, setLoadingVente] = useState(false);

    // Formulaire d'ajout
    const [nomProduit, setNomProduit] = useState("");
    const [codeBarre, setCodeBarre] = useState("");
    const [numeroLot, setNumeroLot] = useState("");
    const [dateFabrication, setDateFabrication] = useState("");
    const [dateExpiration, setDateExpiration] = useState("");
    const [quantite, setQuantite] = useState("");

    const inputStyle = {
        width: "100%",
        padding: "14px",
        marginBottom: 12,
        borderRadius: 12,
        border: "1px solid #333",
        background: "#222",
        color: "white",
        fontSize: 16,
        boxSizing: "border-box"
    };

    // Helper pour rafraîchir les données
    const refreshData = async () => {
        try {
            const [prodRes, statRes] = await Promise.all([
                axios.get("http://localhost:5000/api/products"),
                axios.get("http://localhost:5000/api/dashboard")
            ]);
            setProduits(prodRes.data);
            setStats(statRes.data);
        } catch (err) {
            console.error("Erreur refreshData", err);
        }
    };

    const showPopup = (type, message) => {
        setPopup({ show: true, type, message });
        setTimeout(() => setPopup({ show: false, type: "", message: "" }), 3000);
    };

    const arreterAlarme = () => {
        if (window.alerteAudio) {
            window.alerteAudio.pause();
            window.alerteAudio.currentTime = 0;
            window.alerteAudio = null;
        }
        setAlarmeCoupee(true);
        setPopup({ show: false, type: "", message: "" });
    };

    // ===== FONCTION PÉRÉMPTION ROBUSTE =====
    const verifierPeremption = () => {
        const aujourdhui = new Date();
        const produitPerime = produits.find(p => {
            if (!p.dateExpiration) return false;
            const exp = new Date(p.dateExpiration);
            return exp < aujourdhui;
        });

        if (produitPerime) {
            if (!window.alerteAudio && !alarmeCoupee) {
                const audio = new Audio("/alert.mp3");
                audio.loop = true;
                audio.play()
                    .then(() => console.log("🔊 Son joué"))
                    .catch((err) => console.log("❌ Son bloqué :", err.message));
                window.alerteAudio = audio;
            }
            showPopup("error", `⚠️ Produit périmé : ${produitPerime.nom}`);
        } else {
            if (window.alerteAudio) {
                window.alerteAudio.pause();
                window.alerteAudio.currentTime = 0;
                window.alerteAudio = null;
            }
            setAlarmeCoupee(false);
        }
    };

    useEffect(() => {
        verifierPeremption();
        const interval = setInterval(verifierPeremption, 60000);
        return () => clearInterval(interval);
    }, [produits]);

    const gererSuppression = async (produit) => {
        if (!produit) return;
        if (!window.confirm(`Confirmez-vous la suppression de (${produit.nom}) ?`)) return;

        try {
            await axios.post("http://localhost:5000/api/history", {
                type: "SUPPRESSION",
                produit: produit.nom,
                codeBarre: produit.codeBarre,
                numeroLot: produit.numeroLot,
                quantite: produit.quantite,
                motif: "supprime",
                date: new Date().toISOString()
            });

            const identifiant = produit._id || produit.id || produit.codeBarre;
            await axios.delete(`http://localhost:5000/api/products/${identifiant}`);

            showPopup("success", "Produit supprimé avec succès 🗑️");
            await refreshData();
        } catch (err) {
            console.error(err);
            showPopup("error", "Échec de la suppression");
        }
    };


// ===== FONCTION VENTE =====
const validerVenteGenerale = async () => {
    if (!produitSelectionne) {
        showPopup("error", "Veuillez sélectionner un produit");
        return;
    }

    const qte = Number(quantiteVendu);
    if (!qte || qte < 1) {
        showPopup("error", "Quantité invalide");
        return;
    }

    if (qte > produitSelectionne.quantite) {
        showPopup("error", `Stock insuffisant (max: ${produitSelectionne.quantite})`);
        return;
    }

    setLoadingVente(true);

    try {
        // 1. Enregistrer dans l'historique
        await axios.post("http://localhost:5000/api/history", {
            type: "VENTE",
            produit: produitSelectionne.nom,
            codeBarre: produitSelectionne.codeBarre,
            numeroLot: produitSelectionne.numeroLot,
            quantite: qte,
            motif: "vente",
            date: new Date().toISOString()
        });

        const identifiant = produitSelectionne._id || produitSelectionne.id || produitSelectionne.codeBarre;
        const nouvelleQuantite = produitSelectionne.quantite - qte;

        // 2. Supprimer l'ancien produit
        await axios.delete(`http://localhost:5000/api/products/${identifiant}`);

        // 3. S'il reste du stock, on le recrée
        if (nouvelleQuantite > 0) {
            await axios.post("http://localhost:5000/api/products", {
                nom: produitSelectionne.nom,
                codeBarre: produitSelectionne.codeBarre,
                numeroLot: produitSelectionne.numeroLot,
                dateFabrication: produitSelectionne.dateFabrication,
                dateExpiration: produitSelectionne.dateExpiration,
                quantite: nouvelleQuantite
            });
        }

        showPopup("success", `Vente enregistrée : ${qte} × ${produitSelectionne.nom}`);
        setShowVenteModal(false);
        setProduitSelectionne(null);
        setRechercheVente("");
        setQuantiteVendu(1);
        await refreshData();
    } catch (err) {
        console.error(err);
        showPopup("error", "Échec de la vente : " + (err.response?.data?.message || err.message));
    } finally {
        setLoadingVente(false);
    }
};



    // FILTRES avec useMemo
    const produitsFiltres = useMemo(() => {
        return produits
            .filter(p => p.nom)
            .filter(produit =>
                produit.nom?.toLowerCase().includes(search.toLowerCase()) ||
                produit.codeBarre?.toLowerCase().includes(search.toLowerCase()) ||
                produit.numeroLot?.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) => new Date(a.dateExpiration) - new Date(b.dateExpiration));
    }, [produits, search]);

    const produitsModalFiltres = useMemo(() => {
        if (!rechercheVente.trim()) {
            return produits;
        }
        const term = rechercheVente.toLowerCase();
        return produits.filter(produit =>
            produit.nom?.toLowerCase().includes(term) ||
            produit.codeBarre?.toLowerCase().includes(term) ||
            produit.numeroLot?.toLowerCase().includes(term)
        );
    }, [produits, rechercheVente]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/dashboard").then((response) => {
            setStats(response.data);
            setApiStatus("Serveur connecté ✅");
        }).catch(() => setApiStatus("Mode local - serveur indisponible ❌"));

        axios.get("http://localhost:5000/api/products").then((response) => {
            setProduits(response.data);
        }).catch(() => setProduits([]));
    }, []);

    const enregistrerProduit = () => {
        if (!nomProduit.trim()) {
            setMessage("❌ Le nom du produit est obligatoire");
            return;
        }

        axios.post("http://localhost:5000/api/products", {
            nom: nomProduit,
            codeBarre: codeBarre.trim() || "N/A",
            numeroLot,
            dateFabrication,
            dateExpiration,
            quantite: Number(quantite) || 0,
        }).then(() => {
            setMessage("✅ Produit enregistré avec succès");
            setTimeout(() => setMessage(""), 3000);
            setShowAddForm(false);
            setNomProduit("");
            setCodeBarre("");
            setNumeroLot("");
            setDateFabrication("");
            setDateExpiration("");
            setQuantite("");
            refreshData();
        }).catch((err) => {
            console.error("Erreur complète :", err.response?.data);
            setMessage("❌ Échec : " + (err.response?.data?.error || err.message));
        });
    };

    const importerCsvBackend = async () => {
        if (!csvFile) {
            showPopup("error", "Sélectionne d'abord un fichier CSV !");
            return;
        }
        const formData = new FormData();
        formData.append("file", csvFile);

        try {
            await axios.post("http://localhost:5000/api/upload-csv", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            showPopup("success", "Import CSV réussi ✅");
            setShowCsvModal(false);
            setCsvFile(null);
            refreshData();
        } catch (err) {
            console.error(err);
            showPopup("error", "Échec de l'import: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="dashboard-dark">
            {/* ========== POP UP ========== */}
            {popup.show && (
                <div style={{
                    position: "fixed",
                    top: "20px",
                    right: "20px",
                    padding: "15px",
                    background: popup.type === "success" ? "#00c853" : "#ff3333",
                    color: "white",
                    borderRadius: "10px",
                    zIndex: 9999
                }}>
                    <div>{popup.message}</div>
                    {popup.type === "error" && (
                        <button onClick={arreterAlarme} style={{ marginTop: 8, background: "#222", color: "white", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>
                            🔇 Arrêter l'alarme
                        </button>
                    )}
                </div>
            )}

            {/* ========== BANNER ========== */}
            <header className="fefo-banner">
                <div className="brand-title">
                    <h1>GESTION DE<br />STOCK FEFO</h1>
                    <div className="box-3d">📦</div>
                </div>
                <p className="fefo-desc">First Expired, First Out (Premier périmé, premier sorti)</p>
            </header>

            {/* ========== RECHERCHE TEMPS RÉEL ========== */}
            <section className="product-search">
                <div className="search-box" style={{ display: "block", padding: "15px 20px" }}>
                    <input
                        type="text"
                        placeholder="🔍 Nom, code-barres ou numéro de lot"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </section>

            {/* ========== ACTIONS ========== */}
            <section className="product-actions" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
                <div className="action-card" onClick={() => setShowAddForm(!showAddForm)}>
                    <Plus size={30} /> <h3>Ajouter</h3> <p>Nouveau lot</p>
                </div>
                <div className="action-card" onClick={() => setShowVenteModal(true)} style={{ background: "rgba(0,200,83,0.15)", border: "1px solid #00c853" }}>
                    <ShoppingCart size={30} color="#00c853" /> <h3 style={{ color: "#00c853" }}>Caisse</h3> <p>Enregistrer vente</p>
                </div>
                <div className="action-card" onClick={() => setShowCsvModal(true)}>
                    <FileSpreadsheet size={30} />
                    <h3>CSV</h3>
                    <p>Importer</p>
                </div>
                <div className="action-card" onClick={() => setShowScanner(true)}>
                    <ScanLine size={30} />
                    <h3>Scanner</h3>
                    <p>Code-barres</p>
                </div>
            </section>

            {/* ========== CARTES STATS ========== */}
            <div className="cards">
                <div className="card-fefo"><Package size={28} color="#00ff88" /><h3>Produits</h3><strong>{stats.totalProduits}</strong></div>
                <div className="card-fefo"><Boxes size={28} color="#00ff88" /><h3>Stock total</h3><strong>{stats.stockTotal}</strong></div>
                <div className="card-fefo"><CalendarX size={28} color="#00ff88" /><h3>Expirés</h3><strong>{stats.produitsExpires}</strong></div>
                <div className="card-fefo"><TriangleAlert size={28} color="#00ff88" /><h3>Alertes urgentes</h3><strong>{stats.produitsUrgents}</strong></div>
            </div>

            {/* ========== LISTE PRODUITS COMPACTE FEFO ========== */}
            <div className="products-list" style={{ marginTop: 40 }}>
                <h2 style={{ marginBottom: 20 }}>📦 Stock FEFO - {produitsFiltres.length} résultats</h2>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr 100px", gap: "15px", padding: "10px 18px", color: "#aaa", fontSize: 12, fontWeight: 600, borderBottom: "1px solid #333" }}>
                    <span>PRODUIT / LOT</span><span>QTÉ</span><span>EXPIRATION</span><span>STATUT</span><span>ACTION</span>
                </div>
                {produitsFiltres.length === 0 ? (
                    <p style={{ color: "#888", padding: 20 }}>Aucun produit trouvé</p>
                ) : (
                    produitsFiltres.map((produit) => {
                        const aujourdhui = new Date();
                        const exp = new Date(produit.dateExpiration);
                        const joursRestants = Math.ceil((exp - aujourdhui) / (1000 * 60 * 60 * 24));
                        let statut = { text: "OK", color: "#00ff88" };
                        if (joursRestants < 0) statut = { text: "EXPIRÉ", color: "#ff0044" };
                        else if (joursRestants < 7) statut = { text: `URGENT ${joursRestants}j`, color: "#ff8800" };
                        else if (joursRestants < 30) statut = { text: `ALERTE ${joursRestants}j`, color: "#ffcc00" };

                        return (
                            <div
                                key={(produit._id || produit.id || produit.codeBarre) + (produit.numeroLot || "")}
                                style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr 100px", gap: "15px", padding: "15px 18px", borderBottom: "1px solid #222", alignItems: "center" }}
                            >
                                <div>
                                    <strong>{produit.nom}</strong><br />
                                    <span style={{ fontSize: 12, color: "#aaa" }}>{produit.codeBarre} - Lot: {produit.numeroLot}</span>
                                </div>
                                <div><strong>{produit.quantite}</strong></div>
                                <div>{new Date(produit.dateExpiration).toLocaleDateString()}</div>
                                <div style={{ color: statut.color, fontWeight: 700 }}>{statut.text}</div>
                                <div>
                                    <button
                                        onClick={() => gererSuppression(produit)}
                                        style={{ background: "#ff0044", color: "white", border: "none", padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ========== MODALE CAISSE / VENTE GÉNÉRALE ========== */}
            {showVenteModal && (
                <div
                    style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
                    onClick={() => setShowVenteModal(false)}
                >
                    <div
                        style={{ background: "#161616", border: "1px solid #00c853", borderRadius: 18, padding: 25, width: "100%", maxWidth: "480px", color: "white", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ marginBottom: 15, textAlign: "center", color: "#00c853" }}>🛒 Caisse - Enregistrer une Vente</h2>

                        <label style={{ display: "block", marginBottom: 6, color: "#aaa", fontSize: 13 }}>1. Rechercher un produit</label>
                        <input
                            type="text"
                            placeholder="🔍 Tapez nom ou code-barres..."
                            value={rechercheVente}
                            onChange={(e) => setRechercheVente(e.target.value)}
                            style={inputStyle}
                        />

                        <label style={{ display: "block", marginBottom: 6, color: "#aaa", fontSize: 13 }}>2. Choisir le produit dans la liste ({produitsModalFiltres.length})</label>
                        <div style={{ maxHeight: "160px", overflowY: "auto", border: "1px solid #333", borderRadius: 8, marginBottom: 15, background: "#111" }}>
                            {produits.length === 0 ? (
                                <p style={{ padding: 12, color: "#666", fontSize: 13, textAlign: "center" }}>Aucun stock disponible</p>
                            ) : produitsModalFiltres.length === 0 ? (
                                <p style={{ padding: 12, color: "#666", fontSize: 13, textAlign: "center" }}>Aucun produit ne correspond à la recherche</p>
                            ) : (
                                produitsModalFiltres.map((p) => (
                                    <div
                                        key={(p._id || p.id || p.codeBarre) + (p.numeroLot || "")}
                                        onClick={() => setProduitSelectionne(p)}
                                        style={{
                                            padding: "10px 12px",
                                            borderBottom: "1px solid #222",
                                            cursor: "pointer",
                                            background: (produitSelectionne?._id || produitSelectionne?.id || produitSelectionne?.codeBarre) === (p._id || p.id || p.codeBarre) ? "rgba(0,200,83,0.25)" : "transparent",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}
                                    >
                                        <div>
                                            <strong style={{ fontSize: 14, color: (produitSelectionne?._id || produitSelectionne?.id || produitSelectionne?.codeBarre) === (p._id || p.id || p.codeBarre) ? "#00ff88" : "white" }}>
                                                {p.nom}
                                            </strong>
                                            <div style={{ fontSize: 11, color: "#aaa" }}>Lot: {p.numeroLot} | Barre: {p.codeBarre}</div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <span style={{ fontSize: 12, color: "#00ff88", fontWeight: "bold", background: "#052e16", padding: "4px 8px", borderRadius: 4 }}>
                                                Stock: {p.quantite}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {produitSelectionne && (
                            <div style={{ background: "#222", padding: "10px 12px", borderRadius: 8, marginBottom: 15, border: "1px solid #00c853", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <span style={{ fontSize: 11, color: "#aaa", display: "block" }}>Sélectionné :</span>
                                    <strong style={{ color: "#00ff88", fontSize: 14 }}>{produitSelectionne.nom}</strong>
                                </div>
                                <span style={{ fontSize: 12, color: "#ccc" }}>Max : {produitSelectionne.quantite}</span>
                            </div>
                        )}

                        <label style={{ display: "block", marginBottom: 6, color: "#aaa", fontSize: 13 }}>3. Quantité à vendre</label>
                        <input
                            type="number"
                            min="1"
                            max={produitSelectionne ? produitSelectionne.quantite : 999}
                            value={quantiteVendu}
                            onChange={(e) => setQuantiteVendu(e.target.value)}
                            style={inputStyle}
                        />

                        <button
                            onClick={validerVenteGenerale}
                            disabled={loadingVente}
                            style={{
                                marginTop: 10,
                                width: "100%",
                                height: 50,
                                background: loadingVente ? "#555" : "#00c853",
                                border: "none",
                                borderRadius: 12,
                                color: "white",
                                fontWeight: 700,
                                fontSize: 16,
                                cursor: loadingVente ? "not-allowed" : "pointer"
                            }}
                        >
                            {loadingVente ? "Traitement..." : "✅ Valider la vente"}
                        </button>

                        <button
                            onClick={() => {
                                setShowVenteModal(false);
                                setProduitSelectionne(null);
                                setRechercheVente("");
                            }}
                            style={{ marginTop: 8, width: "100%", height: 40, background: "#333", border: "none", borderRadius: 12, color: "white", fontWeight: 600, cursor: "pointer" }}
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}

            {/* ========== FORMULAIRE AJOUT POPUP ========== */}
            {showAddForm && (
                <div
                    style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
                    onClick={() => setShowAddForm(false)}
                >
                    <div
                        className="add-product-box"
                        style={{ background: "#161616", border: "1px solid #00ff88", borderRadius: 18, padding: 25, width: "100%", maxWidth: "500px", color: "white" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ marginBottom: 20, textAlign: "center" }}>Nouveau produit</h2>
                        <input placeholder="Nom produit" value={nomProduit} onChange={(e) => setNomProduit(e.target.value)} style={inputStyle} />
                        <input placeholder="Code-barres" value={codeBarre} onChange={(e) => setCodeBarre(e.target.value)} style={inputStyle} />
                        <input placeholder="Numéro lot" value={numeroLot} onChange={(e) => setNumeroLot(e.target.value)} style={inputStyle} />
                        <label style={{ display: "block", margin: "12px 0 6px", color: "#aaa" }}>Date fabrication</label>
                        <input type="date" value={dateFabrication} onChange={(e) => setDateFabrication(e.target.value)} style={inputStyle} />
                        <label style={{ display: "block", margin: "12px 0 6px", color: "#aaa" }}>Date expiration</label>
                        <input type="date" value={dateExpiration} onChange={(e) => setDateExpiration(e.target.value)} style={inputStyle} />
                        <input placeholder="Quantité" type="number" value={quantite} onChange={(e) => setQuantite(e.target.value)} style={inputStyle} />
                        <button
                            className="action-btn"
                            onClick={enregistrerProduit}
                            style={{ marginTop: 20, width: "100%", height: 55, background: "#00c853", border: "none", borderRadius: 12, color: "white", fontWeight: 700, fontSize: 16, cursor: "pointer" }}
                        >
                            ✅ Enregistrer
                        </button>
                        <button
                            onClick={() => setShowAddForm(false)}
                            style={{ marginTop: 10, width: "100%", height: 45, background: "#333", border: "none", borderRadius: 12, color: "white", fontWeight: 600, cursor: "pointer" }}
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* ========== SCANNER POPUP ========== */}
            {showScanner && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.95)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                    <h2 style={{ color: "white", marginBottom: 20 }}>Scanner un code</h2>
                    <div style={{ width: "100%", maxWidth: "400px", height: "300px", borderRadius: 12, overflow: "hidden", background: "#000" }}>
                        <BarcodeScanner
                            onUpdate={(err, result) => {
                                if (err) console.error(err);
                                if (result) {
                                    setCodeBarre(result.getText());
                                    setShowScanner(false);
                                    setShowAddForm(true);
                                    showPopup("success", "Code scanné: " + result.getText());
                                }
                            }}
                            style={{ width: "100%", height: "100%" }}
                        />
                    </div>
                    <button
                        onClick={() => setShowScanner(false)}
                        style={{ marginTop: 20, padding: "12px 24px", background: "#ff0044", border: "none", borderRadius: 12, color: "white", fontWeight: 700, cursor: "pointer" }}
                    >
                        Fermer
                    </button>
                </div>
            )}

            {/* ========== MESSAGE ========== */}
            {message && (
                <div className="success-message" style={{ marginTop: 20, padding: 14, background: message.includes("✅") ? "#052e16" : "#450a0a", borderRadius: 12, textAlign: "center", fontWeight: 600 }}>
                    {message}
                </div>
            )}

            {/* ========== MODALE IMPORT CSV ========== */}
            {showCsvModal && (
                <div
                    style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
                    onClick={() => setShowCsvModal(false)}
                >
                    <div
                        style={{ background: "#161616", border: "1px solid #00ff88", borderRadius: 18, padding: 25, width: "100%", maxWidth: "500px", color: "white" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ marginBottom: 20, textAlign: "center" }}>📁 Importer un stock CSV</h2>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setCsvFile(e.target.files[0])}
                            style={{ ...inputStyle, padding: "10px", cursor: "pointer" }}
                        />
                        {csvFile && (
                            <p style={{ color: "#00ff88", fontSize: 14, margin: "10px 0" }}>
                                Fichier sélectionné : <strong>{csvFile.name}</strong>
                            </p>
                        )}
                        <button
                            onClick={importerCsvBackend}
                            style={{ marginTop: 20, width: "100%", height: 55, background: "#00c853", border: "none", borderRadius: 12, color: "white", fontWeight: 700, fontSize: 16, cursor: "pointer" }}
                        >
                            🚀 Lancer l'import
                        </button>
                        <button
                            onClick={() => setShowCsvModal(false)}
                            style={{ marginTop: 10, width: "100%", height: 45, background: "#333", border: "none", borderRadius: 12, color: "white", fontWeight: 600, cursor: "pointer" }}
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
