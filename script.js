document.addEventListener('DOMContentLoaded', () => {
  let userCoords = null;
  let marcadoresDestacados = [];

  const mapa = L.map('mapa').setView([-29.6871, -51.1324], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapa);

  const abrigos = [
    { nome: "Colégio Sinodal da Paz", endereco: "Avenida Pedro Adams Filho, 1974", coords: [-29.6994, -51.1300], bairro: "Centro" },
    { nome: "Fenac", endereco: "Pavilhões da Fenac", coords: [-29.6845, -51.1281], bairro: "Ideal" },
    { nome: "Paróquia Santo Antônio", endereco: "Rua Rio dos Sinos, 10 - Liberdade", coords: [-29.6942, -51.1430], bairro: "Liberdade" },
    { nome: "Paróquia São José", endereco: "R. Osvaldo Cruz, 585 - Primavera", coords: [-29.6825, -51.1310], bairro: "Primavera" },
    { nome: "Sagrada Família", endereco: "R. Alemanha, 125 - Rincão", coords: [-29.6957, -51.1380], bairro: "Rincão" },
    { nome: "Igreja Ascensão", endereco: "Rua Bento Gonçalves, 2394, Centro, Novo Hamburgo", coords: [-29.6855, -51.1305], bairro: "Centro" },
    { nome: "Estação Rio dos Sinos (Trensurb)", endereco: "Avenida Mauá, 900, Santos Dumont, São Leopoldo", coords: [-29.7547, -51.1444], bairro: "Santos Dumont" },
    { nome: "Estação Santo Afonso (Trensurb)", endereco: "Rua Santo Afonso, 100, Santo Afonso, Novo Hamburgo", coords: [-29.6889, -51.1322], bairro: "Santo Afonso" },
    { nome: "Estação Industrial (Trensurb)", endereco: "Avenida Nações Unidas, 2000, Industrial, Novo Hamburgo", coords: [-29.6880, -51.1280], bairro: "Industrial" },
    { nome: "Paróquia Santo Inácio de Loyola", endereco: "Rua da Estação, 270, Rio dos Sinos, São Leopoldo", coords: [-29.7540, -51.1440], bairro: "Rio dos Sinos" },
    { nome: "Salão Paroquial São Roque", endereco: "Rua Veranópolis, 347, Parque Mauá, São Leopoldo", coords: [-29.7480, -51.1330], bairro: "Parque Mauá" },
    { nome: "Escola Municipal Santa Marta", endereco: "Rua Eva Moreira dos Santos, 48, Arroio da Manteiga, São Leopoldo", coords: [-29.7560, -51.1350], bairro: "Arroio da Manteiga" },
    { nome: "Salão Paroquial da Vila Elza", endereco: "Rua Amaro Cavalcante, 16, Vila Elza, São Leopoldo", coords: [-29.7580, -51.1370], bairro: "Vila Elza" },
    { nome: "CTG Tropeiros das Coxilhas", endereco: "Rua Marinho da Silva Silveira, 480, Santa Teresa, São Leopoldo", coords: [-29.7590, -51.1380], bairro: "Santa Teresa" },
    { nome: "Escola Estadual Dr. João Daniel Hillebrand", endereco: "Rua Otto José Boll, s/n, Feitoria, São Leopoldo", coords: [-29.7600, -51.1390], bairro: "Feitoria" },
    { nome: "Ginásio da Aliança Esportiva Botafogo", endereco: "Avenida Padre Santini, 760, Jardim América, São Leopoldo", coords: [-29.7610, -51.1400], bairro: "Jardim América" },
    { nome: "Sociedade Recreativa do Bangu", endereco: "Rua Carioca, 345, São João Batista, São Leopoldo", coords: [-29.7620, -51.1410], bairro: "São João Batista" }
  ];

  function calcularDistancia(coord1, coord2) {
    const R = 6371;
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
    const lat1 = coord1[0] * Math.PI / 180;
    const lat2 = coord2[0] * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function atualizarListaAbrigos() {
    const lista = document.getElementById('abrigos-lista');
    lista.innerHTML = "";

    marcadoresDestacados.forEach(m => mapa.removeLayer(m));
    marcadoresDestacados = [];

    let abrigosOrdenados = [...abrigos];

    if (userCoords) {
      abrigosOrdenados.sort((a, b) => calcularDistancia(userCoords, a.coords) - calcularDistancia(userCoords, b.coords));
    }

    abrigosOrdenados.forEach(abrigo => {
      const distancia = userCoords ? calcularDistancia(userCoords, abrigo.coords).toFixed(2) + " km" : "Distância indisponível";

      const item = document.createElement("li");
      item.innerHTML = `
        <strong>${abrigo.nome}</strong><br>
        ${abrigo.endereco} (${abrigo.bairro})<br>
        Distância: ${distancia}<br>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${abrigo.coords[0]},${abrigo.coords[1]}" target="_blank">Ver rota</a>
      `;
      lista.appendChild(item);

      const marcador = L.circleMarker(abrigo.coords, {
        color: "blue",
        radius: 8
      }).addTo(mapa).bindPopup(`<strong>${abrigo.nome}</strong><br>${abrigo.endereco}`);
      marcadoresDestacados.push(marcador);
    });

    if (userCoords) {
      const proximos = abrigosOrdenados.filter(a => calcularDistancia(userCoords, a.coords) <= 5);
      if (proximos.length === 0) {
        lista.innerHTML = "<li>Nenhum abrigo encontrado num raio de 5 km.</li>";
      }
    }
  }

  window.buscarAbrigos = function () {
    const local = document.getElementById('localizacao').value.trim();
    const resultado = document.getElementById('resultado');

    if (!local) {
      resultado.innerText = "Por favor, digite sua localização.";
      return;
    }

    resultado.innerText = `Buscando abrigos próximos de "${local}"...`;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(local)}`)
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) {
          resultado.innerText = "Localização não encontrada.";
          return;
        }

        userCoords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        mapa.setView(userCoords, 14);
        resultado.innerText = "Abrigos encontrados próximos:";
        atualizarListaAbrigos();
      })
      .catch(() => {
        resultado.innerText = "Erro ao buscar localização.";
      });
  };

  window.filtrarAbrigos = function () {
    const filtro = document.getElementById('filtroAbrigos').value.toLowerCase();
    const lista = document.getElementById('abrigos-lista');
    lista.innerHTML = "";

    abrigos
      .filter(abrigo =>
        abrigo.nome.toLowerCase().includes(filtro) ||
        abrigo.bairro.toLowerCase().includes(filtro)
      )
      .forEach(abrigo => {
        const distancia = userCoords ? calcularDistancia(userCoords, abrigo.coords).toFixed(2) + " km" : "Distância indisponível";

        const item = document.createElement("li");
        item.innerHTML = `
          <strong>${abrigo.nome}</strong><br>
          ${abrigo.endereco} (${abrigo.bairro})<br>
          Distância: ${distancia}<br>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${abrigo.coords[0]},${abrigo.coords[1]}" target="_blank">Ver rota</a>
        `;
        lista.appendChild(item);
      });
  };
});

// Mostra a aba com o ID fornecido e oculta as demais
function mostrarAba(id) {
  const abas = document.querySelectorAll('.aba');
  abas.forEach(aba => aba.style.display = 'none'); // Oculta todas as abas

  document.getElementById(id).style.display = 'block'; // Mostra aba desejada

  const botoes = document.querySelectorAll('nav button');
  botoes.forEach(btn => btn.classList.remove('active')); // Remove destaque dos botões

  const btnAtivo = Array.from(botoes).find(b => b.getAttribute('onclick')?.includes(`mostrarAba('${id}')`));
  if (btnAtivo) btnAtivo.classList.add('active'); // Destaca botão ativo
}


// Exibe uma mensagem informando que é um protótipo de contato
function simularContato(servico) {
  alert("Este é um protótipo. No futuro, esse botão poderá iniciar uma chamada ou abrir o WhatsApp para o serviço: " + servico + ".");
}

function mostrarCampos() {
  const tipoAjuda = document.getElementById("tipoAjuda").value;
  document.getElementById("blocoPrecisa").style.display = tipoAjuda === "precisa" ? "block" : "none";
  document.getElementById("blocoOferece").style.display = tipoAjuda === "oferece" ? "block" : "none";

  const mensagemAjuda = document.getElementById("mensagemAjuda");
  if (tipoAjuda === "precisa") {
    mensagemAjuda.innerText = "Você está solicitando ajuda. Preencha os dados da situação.";
  } else if (tipoAjuda === "oferece") {
    mensagemAjuda.innerText = "Você está oferecendo ajuda. Informe o que pode contribuir.";
  } else {
    mensagemAjuda.innerText = "";
  }
}

function enviarCadastro(event) {
  event.preventDefault();

  const tipo = document.getElementById('tipoAjuda').value;
  const nome = document.getElementById('nome').value.trim();
  const contato = document.getElementById('contato').value.trim();
  const descricao = document.getElementById('descricao').value.trim();

  let mensagemFinal = `Obrigado, ${nome}!\nTipo de ajuda: ${tipo}\nContato: ${contato}\n`;

  if (tipo === "precisa") {
    const bairro = document.getElementById('bairro').value.trim();
    const urgencia = document.getElementById('urgencia').value;
    const quantidade = document.getElementById('quantidadePessoas').value;
    mensagemFinal += `Bairro: ${bairro}\nUrgência: ${urgencia}\nPessoas afetadas: ${quantidade}\n`;
  }

  if (tipo === "oferece") {
    const recurso = document.getElementById('tipoRecurso').value.trim();
    const disponibilidade = document.getElementById('disponibilidade').value.trim();
    mensagemFinal += `Recurso oferecido: ${recurso}\nDisponibilidade: ${disponibilidade}\n`;
  }

  mensagemFinal += `Descrição: ${descricao}`;

  const divMsg = document.getElementById("mensagem");
  divMsg.innerText = mensagemFinal;
  divMsg.style.display = "block";

  setTimeout(() => {
    divMsg.style.display = "none";
  }, 7000);

  event.target.reset();
  mostrarCampos(); // Reseta visual após envio
}



  function abrirAjudaRapida() {
    document.getElementById('ajudaRapida').style.display = 'block';
  }

  function fecharAjudaRapida() {
    document.getElementById('ajudaRapida').style.display = 'none';
  }

  function enviarAjudaRapida() {
    const mensagem = document.getElementById('msgAjudaRapida').value;
    const contato = document.getElementById('contatoAjudaRapida').value;

    if (mensagem.trim() === "") {
      alert("Por favor, descreva sua situação.");
      return;
    }

    // Como não há backend, simula envio:
    alert("Sua solicitação foi enviada para a equipe de ajuda voluntária.\n\nMensagem: " + mensagem + (contato ? ("\nContato: " + contato) : ""));
    fecharAjudaRapida();
    document.getElementById('msgAjudaRapida').value = "";
    document.getElementById('contatoAjudaRapida').value = "";
  }

  function abrirCadastroAjuda() {
    alert("Função de cadastro ainda não disponível neste protótipo.");
  }

