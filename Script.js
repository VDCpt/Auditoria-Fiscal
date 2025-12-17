// Constantes de Auditoria
const IVA_TAXA = 0.06;
const MESES_ANO = 12;
const DEFAULT_MOTORISTAS = 38638;

/**
 * Formatação de Moeda (Padrão Contabilístico)
 */
function formatCurrency(value, allowNegative = false) {
    const finalValue = allowNegative ? value : Math.max(0, value);
    return finalValue.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
}

/**
 * CÁLCULO CORE: A cascata de Auditoria (BTOR -> BTF -> Discrepância)
 */
function processarAuditoria() {
    // 1. Inputs Operacionais
    const taxasReservaDeducoes = parseFloat(document.getElementById('taxasReservaDeducoes').value) || 0;
    const comissaoPlataformaOperacionais = parseFloat(document.getElementById('comissaoPlataformaOperacionais').value) || 0;
    const ganhosLiquidos = parseFloat(document.getElementById('ganhosLiquidosInput').value) || 0;

    // 2. Cálculo BTOR (A essência da prova pericial)
    const btor = comissaoPlataformaOperacionais + taxasReservaDeducoes;
    
    // Atualizar UI Operacional
    document.getElementById('btOperacionalResultado').textContent = btor.toFixed(2) + ' €';
    document.getElementById('baseTributavelOperacional').value = btor; // Hidden input para persistência
    document.getElementById('btorFinal').textContent = btor.toFixed(2) + ' €';
    document.getElementById('ganhosLiquidosPrint').textContent = ganhosLiquidos.toFixed(2) + ' €';

    // 3. Input Fiscal (BTF)
    const btf = parseFloat(document.getElementById('baseTributavelFaturada').value) || 0;
    document.getElementById('btFaturadaResultado').textContent = btf.toFixed(2) + ' €';
    document.getElementById('btfFinal').textContent = btf.toFixed(2) + ' €';

    // 4. Cálculo da Discrepância (Omissão)
    const discrepancia = btor - btf;
    const omissaoAmostra = Math.max(0, discrepancia);
    let percentagemOmissao = btor !== 0 ? (discrepancia / btor) * 100 : 0;

    // 5. Projeção de Mercado e IVA
    const motoristasAtivos = parseFloat(document.getElementById('motoristasAtivos').value) || DEFAULT_MOTORISTAS;
    const ivaPotencial = omissaoAmostra * IVA_TAXA;
    const valorOmitidoMensal = omissaoAmostra * motoristasAtivos;
    const valorOmitidoAnual = valorOmitidoMensal * MESES_ANO;

    // 6. Atualizar UI de Resultados Finais
    document.getElementById('discrepanciaResultado').textContent = formatCurrency(discrepancia, true);
    document.getElementById('percentagemOmissao').textContent = percentagemOmissao.toFixed(2) + ' %';
    document.getElementById('ivaPotencialResultado').textContent = formatCurrency(ivaPotencial);
    document.getElementById('motoristasAtivosContexto').textContent = motoristasAtivos.toLocaleString('pt-PT');
    document.getElementById('omissaoPorMotorista').textContent = formatCurrency(omissaoAmostra);
    document.getElementById('valorOmitidoMensal').textContent = formatCurrency(valorOmitidoMensal);
    document.getElementById('valorOmitidoAnual').textContent = formatCurrency(valorOmitidoAnual);

    updateFilenameTitle();
}

/**
 * Atualização Dinâmica do Nome do Ficheiro (Metadados)
 */
function updateFilenameTitle() {
    const ano = document.getElementById('ano').value || 'AAAA';
    const mes = document.getElementById('mes').value || 'MM';
    const plataforma = document.getElementById('nomeEmpresa').value || 'PLATAFORMA';
    const idProcesso = document.getElementById('idProcesso').value || 'ID';
    
    const filename = `${ano}_${mes}_${plataforma}_${idProcesso}_ANALISE.pdf`;
    document.getElementById('filenameTitle').innerText = `NOME DO FICHEIRO: ${filename}`;
}

/**
 * Setup Inicial e Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    // Definir data de emissão automática
    const dataEmissaoInput = document.getElementById('dataEmissao');
    if (dataEmissaoInput) dataEmissaoInput.value = new Date().toISOString().split('T')[0];

    // Selecionar TODOS os inputs e selects para automação real-time
    const allInputs = document.querySelectorAll('input, select');
    
    allInputs.forEach(el => {
        el.addEventListener('input', () => {
            processarAuditoria();
            // Espelhamento para spans de impressão
            const printSpan = document.getElementById(el.id + 'Print');
            if (printSpan) {
                printSpan.innerText = el.tagName === 'SELECT' ? el.options[el.selectedIndex].text : el.value;
            }
        });
    });

    // Botão Imprimir
    document.getElementById('printButton').addEventListener('click', () => window.print());
    
    // Execução inicial
    processarAuditoria();
});
