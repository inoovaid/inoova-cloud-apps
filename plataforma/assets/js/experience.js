AOS.init();

//  Work experience cards

const experiencecards = document.querySelector(".experience-cards");
const exp = [
  {
    title: "Analista de Redes",
    cardImage: "assets/images/experience-page/alloha.jpg",
    place: "Alloha Telecom",
    time: "(04/2025 a 09/2025)",
    desp: "<li>Atuação em suporte B2B e monitoramento de infraestrutura com Zabbix, Grafana e PRTG, garantindo alta disponibilidade e cumprimento de SLA.</li> <li>Experiência em redes GPON/EPON (Huawei, Nokia, Fiberhome) e troubleshooting multivendor (Cisco, Juniper, Mikrotik).</li> <li>Responsável por escalonamento N2, gestão de ativos e melhoria contínua de processos operacionais.</li>",
  },
  {
    title: "Consultor Técnico NOC",
    cardImage: "assets/images/experience-page/Tim.png",
    place: "TIM Telecomunicações S.A.",
    time: "(12/2022 a 05/2024)",
    desp: "<li>Monitoramento da infraestrutura de rede fixa e móvel com análise e escalonamento de incidentes críticos.</li><li>Desenvolvimento de dashboards estratégicos em Power BI com dados de SQL Server, Oracle e MicroStrategy.</li><li>Suporte orientado a indicadores, performance e estabilidade operacional.</li>",
  },
  {
    title: "Técnico em Telecomunicações",
    cardImage: "assets/images/experience-page/Tim.png",
    place: "TIM Telecomunicações S.A.",
    time: "(06/2017 a 12/2022)",
    desp: "<li>Suporte N1 para serviços M2M/IoT, VPN, Links Dedicados e soluções corporativas.</li><li>Atuação completa no ciclo de incidentes, incluindo análise técnica e identificação de causa raiz.</li><li>Integração com áreas CORE, Firewall e Engenharia para garantir continuidade dos serviços.</li>",
  },
  {
    title: "Consultor de Relacionamento Especializado",
    cardImage: "assets/images/experience-page/Tim.png",
    place: "TIM Telecomunicações S.A.",
    time: "(08/2013 a 09/2017)",
    desp: "<li>Suporte técnico para clientes Live TIM com análise de lentidão e indisponibilidade.</li><li>Diagnóstico remoto e configuração de roteadores, garantindo estabilidade da conexão.</li><li>Foco em resolução eficiente e experiência do cliente.</li>",
  },
  {
    title: "Analista de Suporte",
    cardImage: "assets/images/experience-page/Cadmus.jpg",
    place: "Cadmus TI Services",
    time: "(12/2012 a 07/2013)",
    desp: "<li>Suporte técnico a usuários internos com manutenção de hardware e software.</li><li>Atuação presencial e remota em ambientes Windows e Linux.</li><li>Garantia de disponibilidade dos recursos tecnológicos corporativos.</li>",
  },
  {
    title: "Técnico de Suporte",
    cardImage: "assets/images/experience-page/Atento.jpg",
    place: "Atento Brasil Teleserviços, S.A.",
    time: "(06/2012 a 12/2012)",
    desp: "<li>Suporte técnico para clientes Vivo Speed com diagnóstico de falhas de conectividade.</li><li>Análise de parâmetros de rede e resolução de incidentes de primeiro nível.</li><li>Foco em agilidade e qualidade no atendimento.</li>",
  },
];

const showCards2 = () => {
  let output = "";
  exp.forEach(
    ({ title, cardImage, place, time, desp }) =>
      (output += `        
    <div class="col gaap" data-aos="fade-up" data-aos-easing="linear" data-aos-delay="100" data-aos-duration="400"> 
      <div class="card card1">
        <img src="${cardImage}" class="featured-image"/>
        <article class="card-body">
          <header>
            <div class="title">
              <h3>${title}</h3>
            </div>
            <p class="meta">
              <span class="pre-heading">${place}</span><br>
              <span class="author">${time}</span>
            </p>
            <ol>
              ${desp}
            </ol>
          </header>
        </article>
      </div>
    </div>
      `)
  );
  experiencecards.innerHTML = output;
};
document.addEventListener("DOMContentLoaded", showCards2);

// Volunteership Cards

const volunteership = document.querySelector(".volunteership");
const volunteershipcards = [
  {
    title: "Lab ISP - Ambiente Simulado de Provedor",
    cardImage: "assets/images/experience-page/11.jpg",
    description:
      "Topologia simulada em EVE-NG com Mikrotik, Fortinet, Cisco e Huawei, incluindo BGP, VLANs, Firewall e monitoramento com Zabbix.",
  },
  {
    title: "Projeto Monitoramento NOC",
    cardImage: "assets/images/experience-page/22.png",
    description:
      "Implantação de monitoramento com Zabbix + Grafana e integração com abertura automática de chamados.",
  },
  {
    title: "Automação de Rede",
    cardImage: "assets/images/experience-page/33.png",
    description:
      "Estudos e implementação de automação utilizando scripts para validação de conectividade e coleta de logs.",
  },
  {
    title: "Dashboard Operacional",
    cardImage: "assets/images/experience-page/44.png",
    description:
      "Desenvolvimento de dashboards em Power BI para análise de incidentes, SLA e performance de rede.",
  },
];

const showCards = () => {
  let output = "";
  volunteershipcards.forEach(
    ({ title, cardImage, description }) =>
      (output += `        
      <div class="card volunteerCard" data-aos="fade-down" data-aos-easing="linear" data-aos-delay="100" data-aos-duration="600" style="height: 550px;width:400px">
      
      <img src="${cardImage}" height="250" width="65" class="card-img" style="border-radius:10px">
      <div class="content">
          <h2 class="volunteerTitle">${title}</h2><br>
          <p class="copy">${description}</p></div>
      
      </div>
      `)
  );
  volunteership.innerHTML = output;
};
document.addEventListener("DOMContentLoaded", showCards);

// Hackathon Section

const hackathonsection = document.querySelector(".hackathon-section");
const mentor = [
  {
    title: "Monitoramento 24x7",
    subtitle: "",
    image: "assets/images/experience-page/NOC.jpg",
    desp: "Experiência sólida em monitoramento proativo de ambientes críticos garantindo alta disponibilidade.",
    href: "assets/images/experience-page/Monitoramento_24x7.jpg",
  },
  {
    title: "Ambiente Multivendor",
    subtitle: "",
    image: "assets/images/experience-page/vendor.png",
    desp: "Atuação com Cisco, Huawei, Juniper, Mikrotik e Nokia em ambientes corporativos.",
    href: "assets/images/experience-page/Ambiente_Multivendor.jpg",
  },
  {
    title: "Análise de Incidentes",
    subtitle: "",
    image: "assets/images/experience-page/pdca.jpg",
    desp: "Experiência em troubleshooting avançado, identificação de causa raiz e escalonamento estratégico.",
    href: "assets/images/experience-page/Análise_Incidentes.jpg",
  },
  {
    title: "Automação de Incidentes",
    subtitle: "",
    image: "assets/images/experience-page/itsm.png",
    desp: "Projeto de integração para abertura automática de chamados a partir de eventos críticos, reduzindo tempo de resposta e aumentando controle operacional.",
    href: "assets/images/experience-page/Automação_Incidentes.jpg",
  },
  {
    title: "Dashboard Executivo de SLA",
    subtitle: "",
    image: "assets/images/experience-page/Dashboard.png",
    desp: "Desenvolvimento de relatórios estratégicos para análise de incidentes, disponibilidade e performance de rede utilizando Power BI e banco de dados SQL.",
    href: "assets/images/experience-page/Dashboard_Executivo.jpg",
  },
];

const showCards3 = () => {
  let output = "";
  mentor.forEach(
    ({ title, image, subtitle, desp, href }) =>
      (output += `  
      <div class="blog-slider__item swiper-slide">
        <div class="blog-slider__img">
            <img src="${image}" alt="">
        </div>
        <div class="blog-slider__content">
          <div class="blog-slider__title">${title}</div>
          <span class="blog-slider__code">${subtitle}</span>
          <div class="blog-slider__text">${desp}</div>
          <a href="${href}" class="blog-slider__button">Veja Mais do Nosso Portifolio</a>   
        </div>
      </div>
      `)
  );
  hackathonsection.innerHTML = output;
};
document.addEventListener("DOMContentLoaded", showCards3);
