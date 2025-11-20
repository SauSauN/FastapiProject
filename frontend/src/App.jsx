import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  LayoutDashboard, Users, Package, ShoppingCart, 
  PlusCircle, List, Search, Loader2, CheckCircle, XCircle 
} from 'lucide-react'

const API_URL = "http://127.0.0.22:8000";

function App() {
  // --- ETATS ---
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', message: '' }

  // Données
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [commandes, setCommandes] = useState([]);

  // Formulaires
  const [newClient, setNewClient] = useState({ nom: '', email: '', ville: '' });
  const [newProduit, setNewProduit] = useState({ nom: '', prix: '', stock: '' });
  const [newCommande, setNewCommande] = useState({ id_client: '', id_produit: '', quantite: 1 });

  // --- UTILITAIRES ---
  
  // Affiche une notification temporaire
  const showNotify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Wrapper pour les appels API avec gestion du loading et erreurs
  const handleApiCall = async (callFn, successMsg) => {
    setIsLoading(true);
    try {
      await callFn();
      if(successMsg) showNotify('success', successMsg);
    } catch (err) {
      console.error(err);
      showNotify('error', "Une erreur est survenue. Vérifiez la console.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- FONCTIONS DE CHARGEMENT (GET) ---

  const fetchClients = () => handleApiCall(async () => {
    const res = await axios.get(`${API_URL}/clients`);
    setClients(res.data);
    setCurrentView('show_clients');
  });

  const fetchProduits = () => handleApiCall(async () => {
    const res = await axios.get(`${API_URL}/produits`);
    setProduits(res.data);
    setCurrentView('show_produits');
  });

  const fetchCommandes = () => handleApiCall(async () => {
    const [resCmd, resCli, resProd] = await Promise.all([
      axios.get(`${API_URL}/commandes`),
      axios.get(`${API_URL}/clients`),
      axios.get(`${API_URL}/produits`)
    ]);
    setCommandes(resCmd.data);
    setClients(resCli.data);
    setProduits(resProd.data);
    setCurrentView('show_commandes');
  });

  // Fonction spéciale pour le Dashboard (charge tout sans changer de vue)
  const refreshStats = () => handleApiCall(async () => {
    const [resCli, resProd, resCmd] = await Promise.all([
      axios.get(`${API_URL}/clients`),
      axios.get(`${API_URL}/produits`),
      axios.get(`${API_URL}/commandes`)
    ]);
    setClients(resCli.data);
    setProduits(resProd.data);
    setCommandes(resCmd.data);
  });

  // --- FONCTIONS DE CRÉATION (POST) ---

  const createClient = async (e) => {
    e.preventDefault();
    handleApiCall(async () => {
      await axios.post(`${API_URL}/clients`, newClient);
      setNewClient({ nom: '', email: '', ville: '' });
      const res = await axios.get(`${API_URL}/clients`); // Recharge auto
      setClients(res.data);
      setCurrentView('show_clients');
    }, "Client créé avec succès !");
  };

  const createProduit = async (e) => {
    e.preventDefault();
    handleApiCall(async () => {
      await axios.post(`${API_URL}/produits`, newProduit);
      setNewProduit({ nom: '', prix: '', stock: '' });
      const res = await axios.get(`${API_URL}/produits`);
      setProduits(res.data);
      setCurrentView('show_produits');
    }, "Produit ajouté au catalogue !");
  };

  const createCommande = async (e) => {
    e.preventDefault();
    handleApiCall(async () => {
      await axios.post(`${API_URL}/commandes`, newCommande);
      setNewCommande({ id_client: '', id_produit: '', quantite: 1 });
      // On recharge les commandes pour afficher la liste
      const [resCmd, resCli, resProd] = await Promise.all([
        axios.get(`${API_URL}/commandes`),
        axios.get(`${API_URL}/clients`),
        axios.get(`${API_URL}/produits`)
      ]);
      setCommandes(resCmd.data);
      setClients(resCli.data);
      setProduits(resProd.data);
      setCurrentView('show_commandes');
    }, "Commande validée !");
  };

  const goToCreateCommande = () => handleApiCall(async () => {
    const [resCli, resProd] = await Promise.all([
        axios.get(`${API_URL}/clients`),
        axios.get(`${API_URL}/produits`)
    ]);
    setClients(resCli.data);
    setProduits(resProd.data);
    setCurrentView('create_commande');
  });

  // --- COMPOSANTS UI INTERNES ---

  const StatCard = ({ title, count, icon: Icon, colorClass, onClick }) => (
    <div onClick={onClick} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{count}</p>
      </div>
      <div className={`p-3 rounded-full ${colorClass} bg-opacity-10`}>
        <Icon className={`w-8 h-8 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
    </div>
  );

  const SidebarItem = ({ label, icon: Icon, isActive, onClick, subAction, subIcon: SubIcon }) => (
    <div className="mb-2">
      <div className="flex items-center gap-2">
        <button 
          onClick={onClick}
          className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            isActive 
            ? 'bg-indigo-50 text-indigo-700' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Icon size={18} />
          {label}
        </button>
        {subAction && (
          <button 
            onClick={subAction} 
            title="Créer nouveau"
            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <SubIcon size={18} />
          </button>
        )}
      </div>
    </div>
  );

  // --- RENDU CONTENU ---
  const renderContent = () => {
    if (isLoading) return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-pulse">
        <Loader2 size={48} className="animate-spin mb-4 text-indigo-500"/>
        <p>Chargement des données...</p>
      </div>
    );

    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Tableau de bord</h2>
                <p className="text-gray-500 mt-2">Bienvenue dans votre interface d'administration.</p>
              </div>
              <button onClick={refreshStats} className="text-indigo-600 text-sm font-medium hover:underline">
                Actualiser les stats
              </button>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Clients" count={clients.length} icon={Users} colorClass="bg-blue-500" onClick={fetchClients} />
              <StatCard title="Produits" count={produits.length} icon={Package} colorClass="bg-emerald-500" onClick={fetchProduits} />
              <StatCard title="Commandes" count={commandes.length} icon={ShoppingCart} colorClass="bg-purple-500" onClick={fetchCommandes} />
            </div>

            {/* Empty State Hint */}
            {clients.length === 0 && produits.length === 0 && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 text-center">
                <p className="text-indigo-800 font-medium">Les données semblent vides.</p>
                <p className="text-sm text-indigo-600 mt-1">Cliquez sur "Actualiser" ou commencez par créer des données via le menu.</p>
              </div>
            )}
          </div>
        );

      case 'create_client':
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><PlusCircle className="text-blue-600"/> Nouveau Client</h2>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <form onSubmit={createClient} className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={newClient.nom} onChange={e=>setNewClient({...newClient, nom:e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={newClient.email} onChange={e=>setNewClient({...newClient, email:e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                    <input className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={newClient.ville} onChange={e=>setNewClient({...newClient, ville:e.target.value})} required />
                  </div>
                </div>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200">Enregistrer le client</button>
              </form>
            </div>
          </div>
        );

      case 'show_clients':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-gray-800">Liste des Clients</h2>
               <button onClick={() => setCurrentView('create_client')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"><PlusCircle size={16}/> Nouveau</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr><th className="p-4">ID</th><th className="p-4">Nom</th><th className="p-4">Ville</th><th className="p-4">Email</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clients.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-mono text-xs text-gray-400">#{c.id}</td>
                      <td className="p-4 font-medium text-gray-900">{c.nom}</td>
                      <td className="p-4 text-gray-600"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{c.ville}</span></td>
                      <td className="p-4 text-gray-500">{c.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {clients.length === 0 && <div className="p-8 text-center text-gray-400">Aucun client trouvé.</div>}
            </div>
          </div>
        );

      case 'create_produit':
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><PlusCircle className="text-emerald-600"/> Nouveau Produit</h2>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <form onSubmit={createProduit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                  <input className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" value={newProduit.nom} onChange={e=>setNewProduit({...newProduit, nom:e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                    <input type="number" step="0.01" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" value={newProduit.prix} onChange={e=>setNewProduit({...newProduit, prix:e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock initial</label>
                    <input type="number" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" value={newProduit.stock} onChange={e=>setNewProduit({...newProduit, stock:e.target.value})} required />
                  </div>
                </div>
                <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition shadow-lg shadow-emerald-200">Créer le produit</button>
              </form>
            </div>
          </div>
        );

      case 'show_produits':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-gray-800">Catalogue Produits</h2>
               <button onClick={() => setCurrentView('create_produit')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2"><PlusCircle size={16}/> Nouveau</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {produits.map(p => (
                <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition group-hover:bg-emerald-100"></div>
                  <div className="relative z-10">
                    <div className="font-bold text-lg text-gray-800 mb-1">{p.nom}</div>
                    <div className="text-2xl font-bold text-emerald-600 mb-4">{p.prix} €</div>
                    <div className="flex justify-between items-center text-sm">
                        <span className={`px-2 py-1 rounded font-medium ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {p.stock > 0 ? `${p.stock} en stock` : 'Rupture'}
                        </span>
                        <span className="text-gray-400">#{p.id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {produits.length === 0 && <div className="text-center text-gray-400 py-10">Catalogue vide.</div>}
          </div>
        );

      case 'create_commande':
        return (
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><ShoppingCart className="text-purple-600"/> Nouvelle Commande</h2>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <form onSubmit={createCommande} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <select className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white" value={newCommande.id_client} onChange={e=>setNewCommande({...newCommande, id_client:e.target.value})} required>
                    <option value="">-- Sélectionner un client --</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
                  <select className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white" value={newCommande.id_produit} onChange={e=>setNewCommande({...newCommande, id_produit:e.target.value})} required>
                    <option value="">-- Sélectionner un produit --</option>
                    {produits.map(p => <option key={p.id} value={p.id}>{p.nom} - {p.prix}€</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                  <input type="number" min="1" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500" value={newCommande.quantite} onChange={e=>setNewCommande({...newCommande, quantite:e.target.value})} required />
                </div>
                <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition shadow-lg shadow-purple-200">Valider la commande</button>
              </form>
            </div>
          </div>
        );

      case 'show_commandes':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-gray-800">Historique Commandes</h2>
               <button onClick={goToCreateCommande} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2"><PlusCircle size={16}/> Nouvelle</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <ul className="divide-y divide-gray-50">
                 {commandes.map(cmd => {
                    const clientName = clients.find(c => c.id === cmd.id_client)?.nom || 'Client Inconnu';
                    return (
                    <li key={cmd.id} className="p-4 hover:bg-purple-50 transition flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-100 text-purple-600 p-3 rounded-full">
                                <ShoppingCart size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-gray-800">Commande #{cmd.id}</div>
                                <div className="text-sm text-gray-500">Client : <span className="font-medium text-gray-700">{clientName}</span></div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-400">Produit Ref: {cmd.id_produit}</div>
                            <div className="font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-sm inline-block mt-1">x{cmd.quantite}</div>
                        </div>
                    </li>
                 )})}
               </ul>
               {commandes.length === 0 && <div className="p-8 text-center text-gray-400">Aucune commande enregistrée.</div>}
            </div>
          </div>
        );
      default: return null;
    }
  };

  // --- LAYOUT PRINCIPAL ---
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>
            {notification.type === 'success' ? <CheckCircle size={20}/> : <XCircle size={20}/> }
            {notification.message}
        </div>
      )}

      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <span className="font-bold text-xl text-gray-800 tracking-tight">AdminPanel</span>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="text-xs font-bold text-gray-400 uppercase mb-3 px-2 mt-2">Général</div>
          
          <SidebarItem 
            label="Dashboard" 
            icon={LayoutDashboard} 
            isActive={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')} 
          />

          <div className="text-xs font-bold text-gray-400 uppercase mb-3 px-2 mt-6">Gestion</div>
          
          <SidebarItem 
            label="Clients" 
            icon={Users} 
            isActive={currentView.includes('client')} 
            onClick={fetchClients}
            subAction={() => setCurrentView('create_client')}
            subIcon={PlusCircle}
          />
          
          <SidebarItem 
            label="Produits" 
            icon={Package} 
            isActive={currentView.includes('produit')} 
            onClick={fetchProduits}
            subAction={() => setCurrentView('create_produit')}
            subIcon={PlusCircle}
          />

          <SidebarItem 
            label="Commandes" 
            icon={ShoppingCart} 
            isActive={currentView.includes('commande')} 
            onClick={fetchCommandes}
            subAction={goToCreateCommande}
            subIcon={PlusCircle}
          />
        </div>

        <div className="p-4 border-t border-gray-100 text-xs text-center text-gray-400">
          v1.2.0 &copy; 2025
        </div>
      </div>

      {/* ZONE PRINCIPALE */}
      <div className="flex-1 flex flex-col">
        {/* Header simple */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
            <h1 className="text-lg font-medium text-gray-500 capitalize">
                {currentView.replace('_', ' ')}
            </h1>
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold cursor-pointer">U</div>
            </div>
        </header>

        {/* Contenu scrollable */}
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default App