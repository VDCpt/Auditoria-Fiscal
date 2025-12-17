/**
 * MOTOR DE AUDITORIA FISCAL - Eduardo
 * Versão: 2.0 (Blindada)
 */

document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input, select');
    const btnCalc = document.getElementById('btnCalcular');

    // Função para limpar e converter números (Lida com vírgulas e pontos)
    function parseValue(id) {
        const el = document.getElementById(id);
        if (!el) return 0;
        let val = el.value.toString().replace(/\s/g, '').replace(',', '.');
        return parseFloat(val) || 0;
    }

    // Função para formatar Moeda (Padrão PT-PT)
    function formatEuro(val) {
        return val.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
    }

    function executarCalculos() {
        // 1. Obter valores das entradas
        const comissaoRetida = parseValue('comissaoRetida');
        const taxasDeducoes = parseValue('taxasDeducoes');
        const btf = parseValue('btfInput');
        const motoristas = parseValue('motoristasUniverso');

        // 2. Lógica de Auditoria
        // BTOR = O que a plataforma efetivamente tirou ao motorista
        const btor = comissaoRetida + taxasDeducoes;
        
        // Discrepância = O que foi retido vs O que foi faturado
        const discrepancia = btor - btf;
        const percentual = btor > 0 ? (discrepancia / btor) * 100 : 0;
        const ivaOmitido = Math.max(0, discrepancia) * 0.06;

        // Projeção de Mercado
        const impactoMensal = discrepancia * motoristas;
        const impactoAnual = impactoMensal * 12;

        // 3. Atualizar Interface (Resultados Visíveis)
        document.getElementById('btorResultado').innerText = formatEuro(btor);
        document.getElementById('btfResultado').innerText = formatEuro(btf);
        document.getElementById('discrepanciaValor').innerText = formatEuro(discrepancia);
        document.getElementById('ivaOmitido').innerText = formatEuro(ivaOmitido);
        document.getElementById('percentualDesvio').innerText = percentual.toFixed(2) + ' %';
        
        document.getElementById('impactoMensal').innerText = formatEuro(impactoMensal);
        document.getElementById('impactoAnual').innerText = formatEuro(impactoAnual);

        // 4. Sincronizar Spans de Impressão (Espelhamento)
        inputs.forEach(input => {
            const printSpan = document.getElementById(input.id + 'Print');
            if (printSpan) {
                if (input.tagName === 'SELECT') {
                    printSpan.innerText = input.options[input.selectedIndex].text;
                } else {
                    printSpan.innerText = input.value;
                }
            }
        });

        // 5. Nome do Ficheiro Dinâmico
        const ano = document.getElementById('ano').value || '2025';
        const mes = document.getElementById('mes').value || 'MES';
        const plat = document.getElementById('nomeEmpresa').value;
        const idProc = document.getElementById('idProcesso').value || 'ID';
        
        const fileName = `${ano}_${mes}_${plat}_${idProc}_ANALISE`.toUpperCase();
        document.getElementById('filenameTitle').innerText = "NOME DO FICHEIRO: " + fileName + ".pdf";
    }

    // Eventos: Calcular ao digitar ou ao clicar no botão
    inputs.forEach(input => {
        input.addEventListener('input', executarCalculos);
    });

    if (btnCalc) {
        btnCalc.addEventListener('click', (e) => {
            e.preventDefault();
            executarCalculos();
        });
    }

    // Inicialização
    executarCalculos();
});
