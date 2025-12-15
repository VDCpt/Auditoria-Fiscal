// Constante para o IVA (6%)
const IVA_TAXA = 0.06;
const MESES_ANO = 12;
const DEFAULT_MOTORISTAS = 38638; // Valor padrão para projeção de mercado.

/**
 * Função utilitária para formatar valores monetários em EUR.
 * Garante que a projeção de omissão é sempre não-negativa se allowNegative=false.
 * @param {number} value O valor a ser formatado.
 * @param {boolean} allowNegative Se negativo deve ser permitido (Usado para a Discrepância de Amostra, mas não para a Projeção de Mercado).
 * @returns {string} O valor formatado.
 */
function formatCurrency(value, allowNegative = false) {
    const finalValue = allowNegative ? value : Math.max(0, value);
    return finalValue.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
}

// --- Função para Atualizar o Nome do Ficheiro (CORRIGIDA) ---
function updateFilenameTitle() {
    const ano = document.getElementById('ano').value || 'AAAA';
    const mes = document.getElementById('mes').value || 'MM';
    
    // Obter o texto do select da plataforma
    const nomeEmpresaSelect = document.getElementById('nomeEmpresa');
    const plataforma = nomeEmpresaSelect.value || 'PLATAFORMA'; 
    
    const idProcesso = document.getElementById('idProcesso').value || 'ID';
    
    const filenameElement = document.getElementById('filenameTitle');
    
    // Formato: AAAA_MM_PLATAFORMA_ID_ANALISE.pdf
    filenameElement.innerText = `NOME DO FICHEIRO: ${ano}_${mes}_${plataforma}_${idProcesso}_ANALISE.pdf`;
}


function calcularBaseTributavelOperacional() {
    // --- Ganhos Brutos e Aditivos (Entrada do Motorista) ---
    // Apenas a BTOR é calculada aqui; Ganhos Líquidos é input manual.
    const taxasReservaDeducoes = parseFloat(document.getElementById('taxasReservaDeducoes').value) || 0;
    const comissaoPlataformaOperacionais = parseFloat(document.getElementById('comissaoPlataformaOperacionais').value) || 0;

    // --- CÁLCULO BASE TRIBUTÁVEL OPERACIONAL RETIDA (BTOR) ---
    // Manter a fórmula BTOR = Comissão da Plataforma + Taxas de Reserva Deduzidas
    const btor = comissaoPlataformaOperacionais + taxasReservaDeducoes;

    // --- Ganhos Líquidos (INPUT MANUAL) ---
    const ganhosLiquidos = parseFloat(document.getElementById('ganhosLiquidosInput').value) || 0;

    // Atualizar o HTML
    document.getElementById('btOperacionalResultado').textContent = btor.toFixed(2) + ' €';
    document.getElementById('baseTributavelOperacional').value = btor;
    document.getElementById('btorFinal').textContent = btor.toFixed(2) + ' €';
    
    // Atualiza o valor dos Ganhos Líquidos para impressão
    document.getElementById('ganhosLiquidosPrint').textContent = ganhosLiquidos.toFixed(2) + ' €';

    // Chama o cálculo da Discrepância sempre que a BTOR muda
    calcularDiscrepancia();
}

function calcularDiscrepancia() {
    // Obter a BTOR (calculada na função anterior)
    const btor = parseFloat(document.getElementById('baseTributavelOperacional').value) || 0;
    
    // Obter a Base Tributável Faturada (BTF) da Coluna 2
    const btf = parseFloat(document.getElementById('baseTributavelFaturada').value) || 0;
    
    // Obter o contexto do mercado (usando Motoristas Ativos)
    const motoristasAtivos = parseFloat(document.getElementById('motoristasAtivos').value) || DEFAULT_MOTORISTAS; 

    // --- CÁLCULO DA DISCREPÂNCIA ---
    const discrepancia = btor - btf; // Permite valor negativo

    // --- CÁLCULO DA PERCENTAGEM DE OMISSÃO ---
    let percentagemOmissao = 0;
    if (btor !== 0) {
        percentagemOmissao = (discrepancia / btor) * 100;
    }
    
    // Omissão da Amostra (só é positiva se houver discrepância)
    const omissaoAmostra = Math.max(0, discrepancia); 
    
    // --- CÁLCULO DO IVA POTENCIAL OMITIDO ---
    const ivaPotencial = omissaoAmostra * IVA_TAXA;
    
    // --- PROJEÇÃO DE MERCADO ---
    // Apenas a omissão positiva é projetada no mercado
    const omissaoPorMotorista = omissaoAmostra; 
    const valorOmitidoMensal = omissaoPorMotorista * motoristasAtivos;
    const valorOmitidoAnual = valorOmitidoMensal * MESES_ANO;


    // --- Atualizar Resultados na Secção de Auditoria ---
    document.getElementById('btfFinal').textContent = btf.toFixed(2) + ' €';
    document.getElementById('discrepanciaResultado').textContent = discrepancia.toFixed(2) + ' €';
    document.getElementById('percentagemOmissao').textContent = percentagemOmissao.toFixed(2) + ' %';
    document.getElementById('ivaPotencialResultado').textContent = ivaPotencial.toFixed(2) + ' €';

    // Projeção no Contexto de Mercado
    document.getElementById('motoristasAtivosContexto').textContent = motoristasAtivos.toLocaleString('pt-PT');
    document.getElementById('omissaoPorMotorista').textContent = omissaoAmostra.toFixed(2) + ' €';
    
    // Projeções usam formatCurrency para garantir que são sempre não-negativas
    document.getElementById('valorOmitidoMensal').textContent = formatCurrency(valorOmitidoMensal);
    document.getElementById('valorOmitidoAnual').textContent = formatCurrency(valorOmitidoAnual);
}

/**
 * Função genérica para espelhar o valor de um input para o seu span de impressão correspondente.
 * @param {string} idBase O ID base do elemento (sem o 'Print').
 */
function setupMirroring(idBase) {
    const inputElement = document.getElementById(idBase);
    const printElement = document.getElementById(idBase + 'Print');

    if (inputElement && printElement) {
        const updateMirror = () => {
            let value = inputElement.value;
            if (inputElement.tagName === 'SELECT') {
                value = inputElement.options[inputElement.selectedIndex].text;
            }
            
            // Adicionar uma lógica para formatar a data/hora
            if (inputElement.type === 'datetime-local' && value) {
                try {
                    const date = new Date(value);
                    value = date.toLocaleString('pt-PT', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                } catch (e) {
                    console.error("Erro ao formatar data/hora:", e);
                }
            }
            
            printElement.innerText = value;
            
            // Lógica específica para atualização do nome do ficheiro (apenas para campos relevantes)
            if (['nomeEmpresa', 'idProcesso', 'mes', 'ano'].includes(idBase)) {
                updateFilenameTitle(); 
            }
        };
        
        inputElement.addEventListener('input', updateMirror);
        inputElement.addEventListener('change', updateMirror);
        updateMirror(); // Inicializar
    }
}


// --- Funções de Inicialização e Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicialização de Campos de Data/Hora (Comunicação e Autenticação)
    const dataEmissaoInput = document.getElementById('dataEmissao');
    const dataRecolhaInput = document.getElementById('dataRecolha');
    const now = new Date();
    
    // Preenchimento de Data de Emissão (apenas data)
    const today = now.toISOString().split('T')[0];
    if (dataEmissaoInput) {
        dataEmissaoInput.value = today;
        document.getElementById('dataEmissaoPrint').innerText = today;
    }
    
    // Preenchimento de Data/Hora de Recolha (datetime-local)
    // Formato YYYY-MM-DDTHH:MM
    const isoDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    if (dataRecolhaInput) {
        dataRecolhaInput.value = isoDateTime;
        // O espelhamento será tratado pela função setupMirroring
    }

    // 2. Setup dos campos que precisam de espelhamento (incluindo os novos)
    const fieldsToMirror = [
        'nomeEmpresa', 'nifEmpresa', 'idProcesso', 'mes', 'ano', 'autor', 
        'dataEmissao', 
        // Novos campos de Autenticação
        'itemAuditado', 'dataRecolha', 'hashOriginal' 
    ];
    fieldsToMirror.forEach(setupMirroring);

    // 3. Inicialização dos Cálculos e Nome do Ficheiro
    calcularBaseTributavelOperacional();
    updateFilenameTitle(); 
    
    // 4. Setup dos botões de Ação
    document.getElementById('calculateButton').addEventListener('click', calcularBaseTributavelOperacional);
    document.getElementById('printButton').addEventListener('click', () => {
        // Assegurar que os valores mais recentes são calculados antes de imprimir
        calcularBaseTributavelOperacional(); 
        window.print();
    });
});


// --- Associações de Eventos (Otimizadas) ---

// Inputs Operacionais (afetam BTOR) e Ganhos Líquidos (agora input)
const inputsOperacionais = ['ganhosBrutos', 'pagamentosApp', 'campanhas', 'taxasCancelamento', 'gorjetasOperacionais', 'portagensOperacionais', 'taxasReservaOperacionaisBruto', 'taxasReservaDeducoes', 'comissaoPlataformaOperacionais', 'ganhosLiquidosInput'];
inputsOperacionais.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener('input', calcularBaseTributavelOperacional);
    }
});

// Inputs Fiscais e Mercado (afetam Discrepância)
const inputsDiscrepancia = ['baseTributavelFaturada', 'motoristasAtivos', 'viaturasAtivas', 'iva6', 'reverseCharge'];
inputsDiscrepancia.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener('input', calcularDiscrepancia);
        element.addEventListener('change', calcularDiscrepancia); // Para selects
    }
});

// Atualizar resultado da BTF em tempo real
document.getElementById('baseTributavelFaturada').addEventListener('input', () => {
    const btf = parseFloat(document.getElementById('baseTributavelFaturada').value) || 0;
    document.getElementById('btFaturadaResultado').textContent = btf.toFixed(2) + ' €';
});
