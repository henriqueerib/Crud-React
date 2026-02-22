import { useState, useEffect } from 'react'

function App() {
  const [lista, setLista] = useState(() => {
    const salvo = localStorage.getItem('meu_crud');
    return salvo ? JSON.parse(salvo) : [];
  });
  
  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [idEmEdicao, setIdEmEdicao] = useState(null);

  // Sincroniza com o LocalStorage sempre que a lista mudar
  useEffect(() => {
    localStorage.setItem('meu_crud', JSON.stringify(lista));
  }, [lista]);

  const salvarTarefa = (e) => {
    e.preventDefault();
    if (!texto.trim()) return;

    if (idEmEdicao) {
      setLista(lista.map(item => item.id === idEmEdicao ? { ...item, nome: texto } : item));
      setIdEmEdicao(null);
    } else {
      setLista([...lista, { id: Date.now(), nome: texto, ativo: true, concluida: false }]);
    }
    setTexto("");
  };

  const alternarConcluida = (id) => {
    setLista(lista.map(item => item.id === id ? { ...item, concluida: !item.concluida } : item));
  };

  const deleteSuave = (id) => {
    if (window.confirm("Deseja remover do sistema?")) {
      setLista(lista.map(item => item.id === id ? { ...item, ativo: false } : item));
    }
  };

  // NOVA FUNÇÃO: Limpa apenas as concluídas (Histórico)
  const limparHistorico = () => {
    if (window.confirm("Deseja apagar permanentemente o histórico de tarefas concluídas?")) {
      setLista(lista.filter(item => !item.concluida));
    }
  };

  const listaFiltrada = lista.filter(item => {
    const correspondeAtivo = item.ativo;
    const correspondeBusca = item.nome.toLowerCase().includes(busca.toLowerCase());
    if (filtro === "pendentes") return correspondeAtivo && correspondeBusca && !item.concluida;
    if (filtro === "concluidas") return correspondeAtivo && correspondeBusca && item.concluida;
    return correspondeAtivo && correspondeBusca;
  });

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Meu Crud 🏆</h1>
        
        <div style={styles.tabs}>
          <button onClick={() => setFiltro("todas")} style={filtro === "todas" ? styles.tabActive : styles.tab}>Gerencia</button>
          <button onClick={() => setFiltro("pendentes")} style={filtro === "pendentes" ? styles.tabActive : styles.tab}>Pendencias</button>
          <button onClick={() => setFiltro("concluidas")} style={filtro === "concluidas" ? styles.tabActive : styles.tab}>Realizadas</button>
        </div>

        <input 
          style={styles.searchInput}
          placeholder="🔍 Buscar..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        {/* BOTÃO LIMPAR: Agora visível sempre que estiver na aba Realizadas */}
          {filtro === "concluidas" && (
            <button 
              onClick={limparHistorico} 
              style={lista.filter(i => i.concluida).length > 0 ? styles.btnClear : styles.btnClearDisabled}
              disabled={lista.filter(i => i.concluida).length === 0}
            >
              🧹 Limpar Histórico
            </button>
          )}

        {filtro === "todas" && (
          <form onSubmit={salvarTarefa} style={styles.inputGroup}>
            <input 
              style={styles.input}
              value={texto} 
              onChange={(e) => setTexto(e.target.value)} 
              placeholder={idEmEdicao ? "Alterando nome..." : "Nova tarefa..."} 
            />
            <button type="submit" style={idEmEdicao ? styles.btnEdit : styles.btnAdd}>
              {idEmEdicao ? "OK" : "+"}
            </button>
          </form>
        )}

        <div style={styles.list}>
          {listaFiltrada.length === 0 ? (
            <p style={styles.emptyText}>Nada para mostrar aqui... </p>
          ) : (
            listaFiltrada.map(item => (
              <div key={item.id} style={styles.item}>
                {filtro === "pendentes" && (
                  <button onClick={() => alternarConcluida(item.id)} style={styles.checkBtn}>⚪</button>
                )}

                <span style={{ 
                  flex: 1, 
                  textDecoration: item.concluida ? 'line-through' : 'none',
                  color: item.concluida ? '#94a3b8' : 'white'
                }}>
                  {item.nome}
                </span>

                {filtro === "todas" && (
                  <div style={{display: 'flex', gap: '5px'}}>
                    <button onClick={() => {setTexto(item.nome); setIdEmEdicao(item.id)}} style={styles.iconBtn}>✏️</button>
                    <button onClick={() => deleteSuave(item.id)} style={styles.iconBtn}>🗑️</button>
                  </div>
                )}

                {filtro === "concluidas" && (
                   <span style={{fontSize: '0.8rem', color: '#10b981'}}>Concluído ✅</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { width: '100vw', height: '100vh', backgroundColor: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, fontFamily: 'sans-serif' },
  card: { backgroundColor: '#1e293b', padding: '25px', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', width: '90%', maxWidth: '400px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' },
  title: { color: '#38bdf8', textAlign: 'center', marginBottom: '15px', fontSize: '1.4rem' },
  tabs: { display: 'flex', gap: '5px', marginBottom: '15px' },
  tab: { flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#334155', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', transition: '0.3s' },
  tabActive: { flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#38bdf8', color: '#0f172a', cursor: 'pointer', fontWeight: 'bold' },
  searchInput: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#334155', color: 'white', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' },
  inputGroup: { display: 'flex', gap: '8px', marginBottom: '15px' },
  input: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', outline: 'none' },
  btnAdd: { backgroundColor: '#38bdf8', border: 'none', borderRadius: '8px', width: '45px', cursor: 'pointer', fontWeight: 'bold' },
  btnEdit: { backgroundColor: '#fbbf24', border: 'none', borderRadius: '8px', width: '45px', cursor: 'pointer', fontWeight: 'bold' },
  list: { flex: 1, overflowY: 'auto', paddingRight: '5px' },
  item: { display: 'flex', alignItems: 'center', backgroundColor: '#334155', padding: '15px', borderRadius: '12px', marginBottom: '8px', color: 'white' },
  checkBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', marginRight: '10px' },
  iconBtn: { background: '#1e293b', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '6px' },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: '20px' }, // Coloquei a vírgula aqui
  btnClear: { 
    width: '100%', 
    padding: '12px', 
    backgroundColor: '#ef4444', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    marginBottom: '15px', 
    fontWeight: 'bold',
    transition: '0.3s'
  },
  btnClearDisabled: { 
    width: '100%', 
    padding: '12px', 
    backgroundColor: '#334155', 
    color: '#64748b', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'not-allowed', 
    marginBottom: '15px', 
    fontWeight: 'bold'
  }
}

export default App