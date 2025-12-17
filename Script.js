document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculateButton');
    const printBtn = document.getElementById('printButton');

    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
    }

    function calculate() {
        // --- 1. CAPTURA DE DADOS OPERACIONAIS (APP) ---
        const ganhosBrutos = parseFloat(document.getElementById('ganhosBrutos').value) || 0;
        const taxasReservaDeducoes = parseFloat(document.getElementById('taxasReservaDeducoes').value) || 0;
        const comissaoPlataforma = parseFloat(document.getElementById('comissaoPlataformaOperacionais').value) || 0;
        const taxasCancelamento = parseFloat(document.getElementById('taxasCancelamento').value) || 0;

        // CÁLCULO DA BTOR (Base Tributável Operacional Retida)
        // Definição: Valor total que a plataforma reteve e que deveria ser objeto de faturação/IVA
        const btor = comissaoPlataforma + taxasReservaDeducoes;

        // --- 2. CAPTURA DE DADOS FISCAIS (FATURA) ---
        const btf = parseFloat(document.getElementById('baseTributavelFaturada').value) || 0;

        // --- 3. ANÁLISE DE DISCREPÂNCIA ---
        const discrepancia = btor - btf;
        const percentagemOmissao = btor > 0 ? (discrepancia / btor) * 100 : 0;
        const ivaPotencial = discrepancia * 0.06; // IVA 6% (Taxa reduzida transporte)

        // --- 4. EXTRAPOLAÇÃO DE MERCADO (BIG DATA/ESTATÍSTICA) ---
        const motoristasAtivos = parseInt(document.getElementById('motoristasAtivos').value) || 0;
        const omissaoMensalMercado = discrepancia * motoristasAtivos;
        const omissaoAnualMercado = omissaoMensalMercado * 12;

        // --- 5. ATUALIZAÇÃO DA INTERFACE (ECRÃ) ---
        document.getElementById('btOperacionalResultado').innerText = formatCurrency(btor);
        document.getElementById('btFaturadaResultado').innerText = formatCurrency(btf);
        document.getElementById('btorFinal').innerText = formatCurrency(btor);
        document.getElementById('btfFinal').innerText = formatCurrency(btf);
        
        const discElement = document.getElementById('discrepanciaResultado');
        discElement.innerText = formatCurrency(discrepancia);
        
        document.getElementById('percentagemOmissao').innerText = percentagemOmissao.toFixed(2) + " %";
        document.getElementById('ivaPotencialResultado').innerText = formatCurrency(ivaPotencial);
        document.getElementById('omissaoPorMotorista').innerText = formatCurrency(discrepancia);
        document.getElementById('motoristasAtivosContexto').innerText = motoristasAtivos.toLocaleString('pt-PT');
        document.getElementById('valorOmitidoMensal').innerText = formatCurrency(omissaoMensalMercado);
        document.getElementById('valorOmitidoAnual').innerText = formatCurrency(omissaoAnualMercado);

        // --- 6. SINCRONIZAÇÃO PARA IMPRESSÃO (PDF) ---
        // Transcreve os valores dos inputs para os spans de impressão
        syncPrintData();
    }

    function syncPrintData() {
        const fields = [
            'nomeEmpresa', 'nifEmpresa', 'idProcesso', 'mes', 'ano', 
            'autor', 'dataEmissao', 'ganhosLiquidosInput', 'chaveUnicaItem', 
            'dataHoraRecolha', 'hashSha256'
        ];

        fields.forEach(id => {
            const input = document.getElementById(id);
            const printSpan = document.getElementById(id + 'Print');
            if (input && printSpan) {
                printSpan.innerText = input.value;
            }
        });

        // Atualiza a assinatura e o título do ficheiro
        const autorNome = document.getElementById('autor').value;
        document.getElementById('autorAssinatura').innerText = autorNome;
        
        const fName = `${document.getElementById('ano').value}_${document.getElementById('mes').value}_${document.getElementById('nomeEmpresa').value}_ANALISE.pdf`;
        document.getElementById('filenameTitle').innerText = "NOME DO FICHEIRO: " + fName.toUpperCase();
    }

    // Listeners
    calculateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        calculate();
    });

    printBtn.addEventListener('click', () => {
        calculate(); // Garante que está atualizado antes de imprimir
        window.print();
    });

    // Cálculo Inicial
    calculate();
});
