/*Research Details Table*/

const researchTable = document.querySelector(".main");

const research = [
  {
    title: "InoovaID Sua Inoovação Digital",
    authors:
      "Transformamos negócios em potências digitais",
    conferences:
      "Unimos tecnologia, estratégia e criatividade para gerar crescimento real, autoridade de marca e resultados mensuráveis no ambiente digital",
    researchYr: 2020,
    citebox: "popup1",
    image: "assets/images/research-page/inoovaid.jpg",
    href: "https://inoovaid.com.br/",
  },

  {
    title:
      "Gestão inteligente para empresas que querem crescer.",
    authors:
      "Todos os processos da sua empresa, em um só sistema.",
    conferences:
      "Com o CRM, você automatiza rotinas, centraliza informações e ganha controle total da gestão empresarial com tecnologia moderna e flexível.",
    researchYr: 2020,
    citebox: "popup4",
    image: "assets/images/research-page/odoo.jpg",
    href: "https://odoo.dnn.lat/",
  },

  {
    title: "Gestão de chamados e infraestrutura inteligente e estruturada",
    authors: "Controle total da sua infraestrutura de TI em uma única plataforma",
    conferences:
      "O CRM centraliza chamados, ativos, inventário e gestão de serviços, garantindo organização, rastreabilidade e eficiência operacional.",
    researchYr: 2020,
    citebox: "popup5",
    image: "assets/images/research-page/glpi.jpg",
    href: "https://itsm.dnn.lat/",
  },

  {
    title: "Syncwave Moderna e tecnológica",
    authors: "Conectando dados, sistemas e pessoas em tempo real.",
    conferences:
      "O SyncWave integra, automatiza e sincroniza informações para transformar processos digitais em eficiência, controle e inteligência estratégica",
    researchYr: 2020,
    citebox: "popup6",
    image: "assets/images/research-page/syncwave.jpg",
    href: "https://syncwave.dnn.lat/",
  },

  {
    title:
      "Inoovanet Conectividade inteligente para um mundo digital sem limites",
    authors: "Infraestrutura sólida para operações digitais de alto desempenho.",
    conferences:
      "A InoovaNet entrega soluções de rede, infraestrutura e tecnologia com estabilidade, segurança e alta performance para empresas que precisam crescer conectadas",
    researchYr: 2020,
    citebox: "popup7",
    image: "assets/images/research-page/inoovanet.jpg",
    href: "https://inoovanet.dnn.lat/",
  },
  {
    title:
      "MasterClass Conhecimento que impulsiona sua próxima conquista",
    authors:
      "Aprenda com profundidade. Evolua com estratégia.",
    conferences:
      "Cursos, treinamentos e conteúdos especializados para quem quer se destacar no mercado de tecnologia e oportunidades digitais.",
    researchYr: 2020,
    citebox: "popup8",
    image: "assets/images/research-page/masterclass.jpg",
    href: "https://masterclass.dnn.lat/",
  },

  {
    title: "DNN - Diário Notícias Nacionais",
    authors:
      "Informação que conecta você ao presente e prepara para o futuro",
    conferences:
      "Notícias, tecnologia, inteligência artificial, mercado de trabalho e tendências explicadas com clareza, profundidade e atualização constante",
    researchYr: 2020,
    citebox: "popup2",
    image: "assets/images/research-page/dnn.jpg",
    href: "https://dnn.lat/",
  },

  {
    title:
      "PNN - Panorama Nacional de Notícias",
    authors: "Conteúdo relevante para quem quer estar sempre um passo à frente",
    conferences:
      "Do universo da tecnologia e inteligência artificial às oportunidades de carreira e atualidades que impactam o Brasil e o mundo.",
    researchYr: 2020,
    citebox: "popup3",
    image: "assets/images/research-page/pnn.jpg",
    href: "https://pnn.lat/",
  },

  
];
AOS.init();
const fillData = () => {
  let output = "";
  research.forEach(
    ({
      image,
      title,
      authors,
      conferences,
      researchYr,
      citebox,
      citation,
      absbox,
      abstract,
      href,
    }) =>
      (output += `
            <tr data-aos="zoom-in-left"> 
                <td class="imgCol"><img src="${image}" class="rImg"></td>
                <td class = "researchTitleName">
                    <div class="img-div">
                        <span class="imgResponsive">
                            <img src="${image}" class="imgRes">
                        </span>
                    </div>
                    <a href="#0" class="paperTitle"> ${title} </a> 
                    <div class = "authors"> ${authors} </div> 
                    
                    <div class="rConferences"> ${conferences} 
                        
                    </div>
                    
                    <div style="margin-top:10px;">
                        <a href="${href}" class="button button-accent button-small">
                            Veja aqui
                        </a>
                    </div>
                </td>
            </tr>`)
  );
  researchTable.innerHTML = output;
};
document.addEventListener("DOMContentLoaded", fillData);
