/**
 * Auditoria Fiscal TVDE - Motor de Cálculo e Autenticação
 * Autor: Eduardo (Metodologia VDC)
 * CORREÇÃO V3: Garantia da execução de cálculos e listeners.
 */

const IVA_TAXA = 0.06;
const MESES_ANO = 12;

/**
 * Formata valores para a moeda local (EUR)
 */
function formatCurrency(value) {
    if (isNaN(value) || value === null) {
        value = 0;
    }
    // Adicionei um tratamento para arredondar a 2 casas decimais antes de formatar.
    const roundedValue = Math.round(value * 100) / 100;
    return roundedValue.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
}

/**
 * Obtém o valor numérico de um elemento, ou 0 se for inválido/vazio.
 */
function getNumericValue(id) {
    const element = document.getElementById(id);
    if (element) {
        return parseFloat(element.value) || 0;
    }
    return 0;
}

/**
 * Atualiza o nome do ficheiro sugerido no cabeçalho
 */
function updateFilenameTitle() {
    const ano = document.getElementById('ano').value || 'AAAA';
    const mes = (document.getElementById('mes').value || 'MM').toUpperCase();
    const plataforma = document.getElementById('nomeEmpresa').value || 'PLATAFORMA';
    const idProcesso = (document.getElementById('idProcesso').value || 'ID').toUpperCase();

    const filenameElement = document.getElementById('filenameTitle');
    if (filenameElement) {
        filenameElement.innerText = `NOME DO FICHEIRO: ${ano}_${mes}_${plataforma}_${idProcesso}_ANALISE.pdf`;
    }
}

/**
 * Executa toda a cascata de cálculos periciais
 */
function executarCalculos() {
    // 1. Inputs da Coluna 4 (Operacional) - Usando a função robusta
    const comissaoRetida = getNumericValue('comissaoPlataformaOperacionais');
    const taxasReservaDed = getNumericValue('taxasReservaDeducoes');
    const ganhosLiquidos = getNumericValue('ganhosLiquidosInput');
    
    // Ganhos brutos para fins de projeção/contexto, se necessário
    const motoristasAtivos = getNumericValue('motoristasAtivos');

    // 2. Cálculo da Base Tributável Operacional Retida (BTOR)
    const btor = comissaoRetida + taxasReservaDed;
    
    // Atualiza interface da Coluna 4
    document.getElementById('btOperacionalResultado').textContent = formatCurrency(btor);
    document.getElementById('baseTributavelOperacional').value = btor; // Hidden field para ponte
    document.getElementById('btorFinal').textContent = formatCurrency(btor);
    document.getElementById('ganhosLiquidosPrint').textContent = formatCurrency(ganhosLiquidos);

    // 3. Inputs da Coluna 5 (Fiscal)
    const btf = getNumericValue('baseTributavelFaturada');
    document.getElementById('btFaturadaResultado').textContent = formatCurrency(btf);
    document.getElementById('btfFinal').textContent = formatCurrency(btf);

    // 4. Cálculo da Discrepância (Omissão)
    const discrepancia = btor - btf;
    const omissaoEfetiva = Math.max(0, discrepancia);
    
    const discElement = document.getElementById('discrepanciaResultado');
    discElement.textContent = formatCurrency(discrepancia);
    
    // Alerta visual se houver omissão
    discElement.style.color = discrepancia > 0.01 ? "#d9534f" : "#28a745"; // Corrigido para > 0.01
    discElement.closest('.discrepancy').style.backgroundColor = discrepancia > 0.01 ? "#fdd" : "#e6ffe6";

    // 5. Percentagem e IVA
    let percentagem = 0;
    if (btor > 0) percentagem = (discrepancia / btor) * 100;
    document.getElementById('percentagemOmissao').textContent = percentagem.toFixed(2) + ' %';
    
    const ivaOmitido = omissaoEfetiva * IVA_TAXA;
    document.getElementById('ivaPotencialResultado').textContent = formatCurrency(ivaOmitido);

    // 6. Projeção de Mercado
    const omissaoMensalMercado = omissaoEfetiva * motoristasAtivos;
    const omissaoAnualMercado = omissaoMensalMercado * MESES_ANO;
    
    // Atualiza contexto
    document.getElementById('motoristasAtivosContexto').textContent = motoristasAtivos.toLocaleString('pt-PT');
    document.getElementById('omissaoPorMotorista').textContent = formatCurrency(omissaoEfetiva);
    document.getElementById('valorOmitidoMensal').textContent = formatCurrency(omissaoMensalMercado);
    document.getElementById('valorOmitidoAnual').textContent = formatCurrency(omissaoAnualMercado);

    // 7. Sincronizar campos de texto para o modo de impressão (Spans)
    syncPrintSpans();
    updateFilenameTitle();
}

/**
 * Sincroniza o conteúdo dos inputs com os spans de impressão, incluindo a Custódia
 */
function syncPrintSpans() {
    // Todos os elementos input, select, e textarea dentro do container (exceto botões)
    const elementsToSync = document.querySelectorAll('.container input, .container select, .container textarea');
    
    elementsToSync.forEach(input => {
        // Ignorar inputs de tipo hidden ou button
        if (input.type === 'hidden' || input.type === 'button') {
            return;
        }

        const id = input.id;
        const span = document.getElementById(id + 'Print');
        
        if (span) {
            span.innerText = input.value;
            // Se for o campo da HASH, garantimos quebra de linha para impressão
            if (id === 'hashSha256') {
                span.style.wordBreak = 'break-all';
            }
        }
    });

    // Especial para o nome no rodapé
    const autorAssinatura = document.getElementById('autorAssinatura');
    if (autorAssinatura) autorAssinatura.innerText = document.getElementById('autor').value;
}

/**
 * Inicialização e Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Configurar data inicial
    const dataEmissao = document.getElementById('dataEmissao');
    if (dataEmissao) dataEmissao.value = new Date().toISOString().split('T')[0];
    
    // Preenchimento de Custódia (Estes campos devem ser preenchidos pelo backend no ambiente real)
    const hashSha256 = document.getElementById('hashSha256');
    if (hashSha256 && hashSha256.value === "[INSERIR HASH GERADO PELO BACKEND]") {
         hashSha256.value = "SIMULADOR: Preencher com HASH de 64 chars"; // Valor de simulação para debug
    }

    // 2. Adicionar Event Listeners (Gatilhos) - Solução robusta
    // Selecionamos todos os elementos de input e select dentro da área de cálculo
    const calculateContainer = document.querySelector('.container');
    if (calculateContainer) {
        const inputsAndSelects = calculateContainer.querySelectorAll('input, select');
        
        inputsAndSelects.forEach(el => {
            // Se for um input de cálculo, adicionamos o listener 'input' (para mudanças ao escrever)
            if (el.type !== 'button' && el.type !== 'submit') {
                el.addEventListener('input', executarCalculos);
                el.addEventListener('change', executarCalculos); // Adicionado 'change' para selects
            }
        });
    }

    // 3. Configurar botões
    document.getElementById('calculateButton').addEventListener('click', executarCalculos);
    document.getElementById('printButton').addEventListener('click', () => {
        // Garante que o cálculo final e a sincronização para impressão acontecem
        executarCalculos(); 
        window.print();
    });

    // 4. Executar cálculo inicial (para preencher os resultados)
    executarCalculos();
});
