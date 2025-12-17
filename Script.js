// Constantes de Auditoria
const IVA_TAXA = 0.06;
const MESES_ANO = 12;

/**
 * Função para converter string de input em número decimal puro
 * Resolve o problema da vírgula (,) vs ponto (.)
 */
function parseInput(value) {
    if (!value) return 0;
    // Substitui vírgula por ponto e remove carateres não numéricos exceto o ponto
    let cleanValue = value.toString().replace(',', '.');
    return parseFloat(cleanValue) || 0;
}

/**
 * Formatação de Moeda (Padrão Contabilístico Português)
 */
function formatCurrency(value, allowNegative = false) {
    const finalValue = allowNegative ? value : Math.max(0, value);
    return finalValue.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
}

/**
 * MOTOR DE CÁLCULO - Executa a cascata de auditoria
 */
function executarAuditoria() {
    // 1. CAPTURA DE DADOS (OPERACIONAL)
    const taxasReservaDeducoes = parseInput(document.getElementById('taxasReservaDeducoes').value);
    const comissaoRetida = parseInput(document.getElementById('comissaoPlataformaOperacionais').value);
    const ganhosLiquidos = parseInput(document.getElementById('ganhosLiquidosInput').value);

    // 2. CÁLCULO DA BTOR (Base Tributável Operacional Retida)
    // Fórmula: O que a plataforma reteve na fonte (Comissão + Taxas)
    const btor = comissaoRetida + taxasReservaDeducoes;

    // 3. CAPTURA DE DADOS (FISCAL)
    const btf = parseInput(document.getElementById('baseTributavelFaturada').value);

    // 4. CÁLCULO DA DISCREPÂNCIA (Omissão)
    const discrepancia = btor - btf;
    const omissaoPositiva = Math.max(0, discrepancia);
    const percentagemOmissao = btor !== 0 ? (discrepancia / btor) * 100 : 0;

    // 5. PROJEÇÃO DE MERCADO
    const motoristasAtivos = parseInput(document.getElementById('motoristasAtivos').value) || 38638;
    const ivaOmitido = omissaoPositiva * IVA_TAXA;
    const valorOmitidoMensal = omissaoPositiva * motoristasAtivos;
    const valorOmitidoAnual = valorOmitidoMensal * MESES_ANO;

    // --- ATUALIZAÇÃO DA INTERFACE (DOM) ---

    // Coluna 4 - Resultados Operacionais
    document.getElementById('btOperacionalResultado').innerText = formatCurrency(btor);
    document.getElementById('baseTributavelOperacional').value = btor; // Hidden Field
    document.getElementById('ganhosLiquidosPrint').innerText = formatCurrency(ganhosLiquidos);

    // Coluna 5 - Resultado Fiscal
    document.getElementById('btFaturadaResultado').innerText = formatCurrency(btf);

    // Secção 6 - Resumo Final
    document.getElementById('btorFinal').innerText = formatCurrency(btor);
    document.getElementById('btfFinal').innerText = formatCurrency(btf);
    document.getElementById('discrepanciaResultado').innerText = formatCurrency(discrepancia, true);
    document.getElementById('percentagemOmissao').innerText = percentagemOmissao.toFixed(2) + ' %';
    document.getElementById('ivaPotencialResultado').innerText = formatCurrency(ivaOmitido);
    
    // Contexto de Mercado
    document.getElementById('motoristasAtivosContexto').innerText = motoristasAtivos.toLocaleString('pt-PT');
    document.getElementById('omissaoPorMotorista').innerText = formatCurrency(omissaoPositiva);
    document.getElementById('valorOmitidoMensal').innerText = formatCurrency(valorOmitidoMensal);
    document.getElementById('valorOmitidoAnual').innerText = formatCurrency(valorOmitidoAnual);

    // Atualizar Nome do Ficheiro
    atualizarNomeFicheiro();
}

/**
 * Atualiza o cabeçalho dinâmico do relatório
 */
function atualizarNomeFicheiro() {
    const ano = document.getElementById('ano').value || 'AAAA';
    const mes = document.getElementById('mes').value || 'MM';
    const plataforma = document.getElementById('nomeEmpresa').value || 'PLATAFORMA';
    const id = document.getElementById('idProcesso').value || 'ID';
    
    document.getElementById('filenameTitle').innerText = `NOME DO FICHEIRO: ${ano}_${mes}_${plataforma}_${id}_ANALISE.pdf`;
}

/**
 * INICIALIZAÇÃO E LISTENERS
 */
document.addEventListener('DOMContentLoaded', () => {
    // Seleciona todos os elementos de input e select
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        // Escuta qualquer mudança ou digitação
        input.addEventListener('input', executarAuditoria);
        
        // Espelhamento para spans de impressão
        const spanId = input.id + 'Print';
        const span = document.getElementById(spanId);
        if (span) {
            input.addEventListener('input', () => {
                span.innerText = input.tagName === 'SELECT' ? input.options[input.selectedIndex].text : input.value;
            });
        }
    });

    // Botão Calcular (Backup manual)
    const btnCalc = document.getElementById('calculateButton');
    if (btnCalc) btnCalc.addEventListener('click', executarAuditoria);

    // Botão Imprimir
    const btnPrint = document.getElementById('printButton');
    if (btnPrint) btnPrint.addEventListener('click', () => window.print());

    // Executa o cálculo inicial
    executarAuditoria();
});
