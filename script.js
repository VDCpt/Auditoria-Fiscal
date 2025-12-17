document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculateButton');
    const printBtn = document.getElementById('printButton');

    function fmt(val) {
        return val.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
    }

    function runAudit() {
        // --- 1. CAPTURA DE DADOS OPERACIONAIS (COLUNA 1) ---
        const gBrutos = parseFloat(document.getElementById('ganhosBrutos').value) || 0;
        const pApp = parseFloat(document.getElementById('pagamentosApp').value) || 0;
        const camp = parseFloat(document.getElementById('campanhas').value) || 0;
        const tCanc = parseFloat(document.getElementById('taxasCancelamento').value) || 0;
        const gorjetas = parseFloat(document.getElementById('gorjetasOperacionais').value) || 0;
        const portagens = parseFloat(document.getElementById('portagensOperacionais').value) || 0;
        
        const tReservaDed = parseFloat(document.getElementById('taxasReservaDeducoes').value) || 0;
        const comissaoOp = parseFloat(document.getElementById('comissaoPlataformaOperacionais').value) || 0;

        // CÁLCULO DOS GANHOS LÍQUIDOS (O que o motorista recebeu)
        const gLiquidos = (gBrutos + pApp + camp + tCanc + gorjetas + portagens) - (tReservaDed + comissaoOp);
        document.getElementById('ganhosLiquidosInput').value = gLiquidos.toFixed(2);

        // CÁLCULO DA BTOR (Base Tributável Operacional Retida - O que a plataforma faturou de facto)
        const btor = comissaoOp + tReservaDed;
        document.getElementById('btOperacionalResultado').innerText = fmt(btor);
        document.getElementById('baseTributavelOperacional').value = btor; // Hidden field

        // --- 2. CAPTURA DE DADOS FISCAIS (COLUNA 2) ---
        const btf = parseFloat(document.getElementById('baseTributavelFaturada').value) || 0;
        document.getElementById('btFaturadaResultado').innerText = fmt(btf);

        // --- 3. RESULTADO DA AUDITORIA (SECÇÃO 5) ---
        const discrepancia = btor - btf;
        const percentagem = btor > 0 ? (discrepancia / btor) * 100 : 0;
        const ivaOmitido = discrepancia * 0.06; // Assume-se 6% conforme lógica TVDE

        document.getElementById('btorFinal').innerText = fmt(btor);
        document.getElementById('btfFinal').innerText = fmt(btf);
        document.getElementById('discrepanciaResultado').innerText = fmt(discrepancia);
        document.getElementById('percentagemOmissao').innerText = percentagem.toFixed(2) + " %";
        document.getElementById('ivaPotencialResultado').innerText = fmt(ivaOmitido);

        // --- 4. EXTRAPOLAÇÃO DE MERCADO ---
        const motoristas = parseInt(document.getElementById('motoristasAtivos').value) || 0;
        const omissaoMensal = discrepancia * motoristas;
        const omissaoAnual = omissaoMensal * 12;

        document.getElementById('omissaoPorMotorista').innerText = fmt(discrepancia);
        document.getElementById('motoristasAtivosContexto').innerText = motoristas.toLocaleString('pt-PT');
        document.getElementById('valorOmitidoMensal').innerText = fmt(omissaoMensal);
        document.getElementById('valorOmitidoAnual').innerText = fmt(omissaoAnual);

        // --- 5. SINCRONIZAÇÃO PARA IMPRESSÃO ---
        preparePrint();
    }

    function preparePrint() {
        // Atualiza todos os SPANS de impressão com os valores atuais dos INPUTS
        const inputs = [
            'nomeEmpresa', 'nifEmpresa', 'idProcesso', 'mes', 'ano', 'autor', 
            'dataEmissao', 'ganhosLiquidosInput', 'chaveUnicaItem', 
            'dataHoraRecolha', 'hashSha256'
        ];

        inputs.forEach(id => {
            const val = document.getElementById(id).value;
            const printSpan = document.getElementById(id + 'Print');
            if (printSpan) {
                printSpan.innerText = (id === 'ganhosLiquidosInput') ? val + " €" : val;
            }
        });

        // Assinatura e Nome do Ficheiro
        const autor = document.getElementById('autor').value;
        document.getElementById('autorAssinatura').innerText = autor;
        
        const fName = `${document.getElementById('ano').value}_${document.getElementById('mes').value}_${document.getElementById('nomeEmpresa').value}_${document.getElementById('idProcesso').value}.pdf`;
        document.getElementById('filenameTitle').innerText = "NOME DO FICHEIRO: " + fName.toUpperCase();
    }

    calculateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        runAudit();
    });

    printBtn.addEventListener('click', () => {
        runAudit();
        window.print();
    });

    // Executa o primeiro cálculo com os valores default
    runAudit();
});
