document.addEventListener('DOMContentLoaded', () => {
    const calcBtn = document.getElementById('calculateButton');
    const printBtn = document.getElementById('printButton');

    function formatEuro(val) {
        return val.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
    }

    function calculate() {
        // 1. CAPTURA DOS INPUTS (OPERACIONAL)
        const comissaoRetida = parseFloat(document.getElementById('comissaoPlataformaOperacionais').value) || 0;
        const taxasReserva = parseFloat(document.getElementById('taxasReservaDeducoes').value) || 0;
        
        // CÁLCULO DA BTOR (Base Tributável Operacional Retida)
        // No contexto TVDE, a base de incidência fiscal da plataforma é a soma da comissão e taxas retidas.
        const btor = comissaoRetida + taxasReserva;

        // 2. CAPTURA DOS INPUTS (FISCAL)
        const btf = parseFloat(document.getElementById('baseTributavelFaturada').value) || 0;

        // 3. ANÁLISE DE DISCREPÂNCIA
        const discrepancia = btor - btf;
        const percentagem = btor > 0 ? (discrepancia / btor) * 100 : 0;
        const ivaOmitido = discrepancia * 0.06;

        // 4. EXTRAPOLAÇÃO DE MERCADO
        const motoristasAtivos = parseInt(document.getElementById('motoristasAtivos').value) || 0;
        const omissaoMensal = discrepancia * motoristasAtivos;
        const omissaoAnual = omissaoMensal * 12;

        // 5. ATUALIZAÇÃO DOS CAMPOS DE RESULTADO (IDs ORIGINAIS)
        document.getElementById('btOperacionalResultado').innerText = formatEuro(btor);
        document.getElementById('baseTributavelOperacional').value = btor; // Input hidden
        document.getElementById('btFaturadaResultado').innerText = formatEuro(btf);
        
        // Secção de Auditoria
        document.getElementById('btorFinal').innerText = formatEuro(btor);
        document.getElementById('btfFinal').innerText = formatEuro(btf);
        document.getElementById('discrepanciaResultado').innerText = formatEuro(discrepancia);
        document.getElementById('percentagemOmissao').innerText = percentagem.toFixed(2) + " %";
        document.getElementById('ivaPotencialResultado').innerText = formatEuro(ivaOmitido);
        
        // Contexto de Mercado
        document.getElementById('omissaoPorMotorista').innerText = formatEuro(discrepancia);
        document.getElementById('motoristasAtivosContexto').innerText = motoristasAtivos.toLocaleString('pt-PT');
        document.getElementById('valorOmitidoMensal').innerText = formatEuro(omissaoMensal);
        document.getElementById('valorOmitidoAnual').innerText = formatEuro(omissaoAnual);

        // 6. PREPARAÇÃO PARA IMPRESSÃO (Sincronizar Spans)
        syncSpans();
    }

    function syncSpans() {
        // Mapeia cada input/select para o respetivo span de impressão
        const mappings = [
            ['nomeEmpresa', 'nomeEmpresaPrint'],
            ['nifEmpresa', 'nifEmpresaPrint'],
            ['idProcesso', 'idProcessoPrint'],
            ['mes', 'mesPrint'],
            ['ano', 'anoPrint'],
            ['autor', 'autorPrint'],
            ['dataEmissao', 'dataEmissaoPrint'],
            ['ganhosLiquidosInput', 'ganhosLiquidosPrint'],
            ['chaveUnicaItem', 'chaveUnicaItemPrint'],
            ['dataHoraRecolha', 'dataHoraRecolhaPrint'],
            ['hashSha256', 'hashSha256Print']
        ];

        mappings.forEach(([inputId, spanId]) => {
            const input = document.getElementById(inputId);
            const span = document.getElementById(spanId);
            if (input && span) {
                span.innerText = input.value + (inputId === 'ganhosLiquidosInput' ? ' €' : '');
            }
        });

        // Atualiza o nome na assinatura e o cabeçalho do ficheiro
        const autor = document.getElementById('autor').value;
        document.getElementById('autorAssinatura').innerText = autor;
        
        const filename = `${document.getElementById('ano').value}_${document.getElementById('mes').value}_${document.getElementById('nomeEmpresa').value}_${document.getElementById('idProcesso').value}.pdf`;
        document.getElementById('filenameTitle').innerText = "NOME DO FICHEIRO: " + filename.toUpperCase();
    }

    calcBtn.addEventListener('click', (e) => {
        e.preventDefault();
        calculate();
    });

    printBtn.addEventListener('click', () => {
        calculate();
        window.print();
    });

    // Inicialização
    calculate();
});
