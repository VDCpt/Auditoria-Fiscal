/**
 * Auditoria Fiscal TVDE - Motor de Cálculo e Autenticação
 * Autor: Eduardo (Metodologia VDC)
 * CORREÇÃO V2: Garantir que os cálculos são executados em todos os inputs.
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
    return value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
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
    // 1. Inputs da Coluna 4 (Operacional)
    // Usamos parseFloat e fallback para 0 para evitar NaN
    const comissaoRetida = parseFloat(document.getElementById('comissaoPlataformaOperacionais').value) || 0;
    const taxasReservaDed = parseFloat(document.getElementById('taxasReservaDeducoes').value) || 0;
    const ganhosLiquidos = parseFloat(document.getElementById('ganhosLiquidosInput').value) || 0;

    // 2. Cálculo da Base Tributável Operacional Retida (BTOR)
    const btor = comissaoRetida + taxasReservaDed;
    
    // Atualiza interface da Coluna 4
    document.getElementById('btOperacionalResultado').textContent = formatCurrency(btor);
    document.getElementById('baseTributavelOperacional').value = btor;
    document.getElementById('btorFinal').textContent = formatCurrency(btor);
    document.getElementById('ganhosLiquidosPrint').textContent = formatCurrency(ganhosLiquidos);

    // 3. Inputs da Coluna 5 (Fiscal)
    const btf = parseFloat(document.getElementById('baseTributavelFaturada').value) || 0;
    document.getElementById('btFaturadaResultado').textContent = formatCurrency(btf);
    document.getElementById('btfFinal').textContent = formatCurrency(btf);

    // 4. Cálculo da Discrepância (Omissão)
    const discrepancia = btor - btf;
    const omissaoEfetiva = Math.max(0, discrepancia);
    
    const discElement = document.getElementById('discrepanciaResultado');
    discElement.textContent = formatCurrency(discrepancia);
    
    // Alerta visual se houver omissão
    discElement.style.color = discrepancia > 0 ? "#d9534f" : "#28a745";

    // 5. Percentagem e IVA
    let percentagem = 0;
    if (btor > 0) percentagem = (discrepancia / btor) * 100;
    document.getElementById('percentagemOmissao').textContent = percentagem.toFixed(2) + ' %';
    
    const ivaOmitido = omissaoEfetiva * IVA_TAXA;
    document.getElementById('ivaPotencialResultado').textContent = formatCurrency(ivaOmitido);

    // 6. Projeção de Mercado
    const motoristasAtivos = parseFloat(document.getElementById('motoristasAtivos').value) || 0;
    const omissaoMensalMercado = omissaoEfetiva * motoristasAtivos;
    const omissaoAnualMercado = omissaoMensalMercado * MESES_ANO;

    // Atualiza os inputs de contexto (viaturas/motoristas)
    const viaturasAtivas = parseFloat(document.getElementById('viaturasAtivas').value) || 0;
    document.getElementById('viaturasAtivas').value = viaturasAtivas; // Apenas para garantir que o input é tratado como número
    
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
    // Campos principais
    const fields = [
        'nomeEmpresa', 'nifEmpresa', 'idProcesso', 'mes', 'ano', 
        'autor', 'dataEmissao'
    ];
    
    // CAMPOS DE CADEIA DE CUSTÓDIA
    const custodyFields = [
        'chaveUnicaItem', 'dataHoraRecolha', 'hashSha256'
    ];
    
    // CAMPOS NUMÉRICOS (Operacional / Projeção)
    const numericFields = [
        'ganhosBrutos', 'pagamentosApp', 'campanhas', 'taxasCancelamento', 'gorjetasOperacionais', 
        'portagensOperacionais', 'taxasReservaOperacionaisBruto', 'taxasReservaDeducoes', 
        'comissaoPlataformaOperacionais', 'baseTributavelFaturada', 'viaturasAtivas', 'motoristasAtivos'
    ];


    fields.concat(custodyFields).forEach(id => {
        const input = document.getElementById(id);
        const span = document.getElementById(id + 'Print');
        if (input && span) {
            // Se for o campo da HASH, garantimos quebra de linha para impressão
            if (id === 'hashSha256') {
                span.style.wordBreak = 'break-all'; 
            }
            span.innerText = input.value;
        }
    });
    
    // Sincronizar SELECTs (para impressão)
    ['nomeEmpresa', 'iva6', 'reverseCharge'].forEach(id => {
        const select = document.getElementById(id);
        const span = document.getElementById(id + 'Print');
        if (select && span) {
            span.innerText = select.value;
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
    // 1. Configurar datas iniciais (Apenas para o frontend/relatório de análise)
    const now = new Date();
    const dataEmissao = document.getElementById('dataEmissao');
    if (dataEmissao) dataEmissao.value = now.toISOString().split('T')[0];

    // 2. Adicionar Event Listeners em todos os inputs e selects para cálculo automático
    // Selecionamos APENAS os inputs que realmente causam uma alteração no cálculo.
    const inputsToListen = [
        // Ganhos Operacionais
        'ganhosBrutos', 'pagamentosApp', 'campanhas', 'taxasCancelamento', 'gorjetasOperacionais', 
        'portagensOperacionais', 'taxasReservaOperacionaisBruto', 'taxasReservaDeducoes', 
        'comissaoPlataformaOperacionais', 'ganhosLiquidosInput',
        // Fatura Fiscal
        'baseTributavelFaturada',
        // Projeção
        'viaturasAtivas', 'motoristasAtivos',
        // Cabeçalho (para o nome do ficheiro)
        'ano', 'mes', 'idProcesso', 'nomeEmpresa'
    ];
    
    inputsToListen.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', executarCalculos);
        }
    });
    
    // Adicionar listener aos selects que afetam o cálculo
    document.getElementById('iva6').addEventListener('change', executarCalculos);
    document.getElementById('reverseCharge').addEventListener('change', executarCalculos);
    document.getElementById('nomeEmpresa').addEventListener('change', executarCalculos);
    
    // 3. Configurar botões
    document.getElementById('calculateButton').addEventListener('click', executarCalculos);
    document.getElementById('printButton').addEventListener('click', () => {
        executarCalculos();
        window.print();
    });

    // 4. Cálculo inicial
    executarCalculos();
});
