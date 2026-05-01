AOS.init();

//  Tech Stacks cards

const techStackCards = document.querySelector(".techstack-box");
const techStack = [

  {
    langImage: "assets/images/techstack-page/html.png",
    langName: "HyperText Markup Language",
    langDesc: "<li>A Linguagem de Marcação de Hipertexto, ou HTML, é a linguagem de marcação padrão para documentos projetados para serem exibidos em um navegador da web.</li>",
  },
  {
    langImage: "assets/images/techstack-page/css.png",
    langName: "Cascading Style Sheets",
    langDesc: "<li>Folhas de Estilo em Cascata (CSS) é uma linguagem de folhas de estilo usada para descrever a apresentação de um documento escrito em uma linguagem de marcação como HTML.</li>",
  },
  {
    langImage: "assets/images/techstack-page/javascript.png",
    langName: "JavaScript",
    langDesc: "<li>JavaScript, frequentemente abreviado como JS, é uma linguagem de programação que é uma das tecnologias fundamentais da World Wide Web, juntamente com HTML e CSS.</li>",
  },
  {
    langImage: "assets/images/techstack-page/node.png",
    langName: "Node",
    langDesc: "<li>Node.js é um ambiente de execução JavaScript de código aberto, multiplataforma e para back-end, que roda no mecanismo V8 e executa código JavaScript fora de um navegador web.</li>",
  },
  {
    langImage: "assets/images/techstack-page/python.png",
    langName: "Python",
    langDesc: "<li>Python é uma linguagem de programação interpretada de alto nível e propósito geral.</li>",
  },
  {
    langImage: "assets/images/techstack-page/cpp.png",
    langName: "C++",
    langDesc: "<li>C++ é uma linguagem de programação de propósito geral criada por Bjarne Stroustrup como uma extensão da linguagem de programação C, ou C com Classes.</li>",
  },
  {
    langImage: "assets/images/techstack-page/git.png",
    langName: "Git",
    langDesc: "<li>Git é um software para rastrear alterações em qualquer conjunto de arquivos, geralmente usado para coordenar o trabalho entre programadores que desenvolvem código-fonte colaborativamente durante o desenvolvimento de software.</li>",
  },
  {
    langImage: "assets/images/techstack-page/bootstrap.png",
    langName: "Bootstrap",
    langDesc: "<li>Bootstrap é um framework CSS gratuito e de código aberto voltado para o desenvolvimento web front-end responsivo e com foco em dispositivos móveis.</li>",
  },
  {
    langImage: "assets/images/techstack-page/react.png",
    langName: "React",
    langDesc: "<li>React é uma biblioteca JavaScript gratuita e de código aberto para o desenvolvimento de interfaces de usuário baseadas em componentes de UI (Interface do Usuário).</li>",
  },
  {
    langImage: "assets/images/techstack-page/vue.png",
    langName: "Vue",
    langDesc: "<li>Vue.js é um framework JavaScript progressivo utilizado para desenvolver interfaces web modernas, reativas e baseadas em componentes.</li>",
  },
  {
  langImage:"assets/images/techstack-page/docker.png",
  langName:"Docker",
  langDesc:"<li>Docker permite empacotar aplicações e dependências em containers portáveis, garantindo consistência entre ambientes de desenvolvimento, testes e produção.</li>"
},
  {
    langImage:"assets/images/techstack-page/kubernetes.png",
    langName:"Kubernetes",
    langDesc:"<li>Kubernetes é uma plataforma de orquestração de containers que automatiza implantação, escalabilidade e gerenciamento de aplicações distribuídas.</li>"
  },
  {
    langImage:"assets/images/techstack-page/linux2.png",
    langName:"Linux",
    langDesc:"<li>Linux é um sistema operacional robusto amplamente utilizado em servidores, infraestrutura cloud e automação de ambientes de produção.</li>"
  },
  {
    langImage:"assets/images/techstack-page/n8n.png",
    langName:"n8n",
    langDesc:"<li>n8n é uma ferramenta de automação de workflows que integra APIs, sistemas e serviços para automatizar processos e fluxos operacionais.</li>"
  },
  {
    langImage:"assets/images/techstack-page/zabbix.png",
    langName:"Zabbix",
    langDesc:"<li>Zabbix é uma plataforma de monitoramento que permite acompanhar disponibilidade, desempenho e métricas de infraestrutura e aplicações.</li>"
  },
  {
    langImage:"assets/images/techstack-page/grafana.png",
    langName:"Grafana",
    langDesc:"<li>Grafana é uma ferramenta de visualização de dados utilizada para criar dashboards e analisar métricas de monitoramento em tempo real.</li>"
  },
  {
    langImage:"assets/images/techstack-page/postgresql.png",
    langName:"PostgreSQL",
    langDesc:"<li>PostgreSQL é um sistema de gerenciamento de banco de dados relacional avançado, conhecido por sua robustez, segurança e suporte a consultas complexas.</li>"
  },
  {
    langImage:"assets/images/techstack-page/mysql.png",
    langName:"MySQL",
    langDesc:"<li>MySQL é um banco de dados relacional amplamente utilizado em aplicações web e sistemas corporativos devido à sua performance e confiabilidade.</li>"
  },
  {
    langImage:"assets/images/techstack-page/net.png",
    langName:"Networking",
    langDesc:"<li>Networking envolve o projeto, configuração e gerenciamento de redes de computadores, incluindo protocolos, roteamento, segurança e alta disponibilidade.</li>"
  },
  {
    langImage:"assets/images/techstack-page/vendor.png",
    langName:"Multi Vendor",
    langDesc:"<li>Ambientes multi-vendor envolvem a integração e gestão de equipamentos e soluções de diferentes fabricantes, garantindo interoperabilidade, flexibilidade e alta disponibilidade na infraestrutura de rede.</li>"
  },
];

const displayTechStacksCards = () => {
  const entireCardTemplate =
  techStack.map((stack)=> {
      return `        
    <div class="row page-content techstackcards" data-aos="fade-up" data-aos-easing="linear" data-aos-delay="0" data-aos-duration="400"> 
        <div class="tech_card">
            <div class="card_img">
                <img src ="${stack.langImage}" class="featured_image">
            </div>
            <div class="card_header">
                <header>
                    <div class="text-center langName">
                        <h4>${stack.langName}</h4>
                    </div>
                </header>
                <ul class="description">
                ${stack.langDesc}
            </ul>
            </div>
        </div>
    </div>
      `}).join('');
  techStackCards.innerHTML = entireCardTemplate;
};
// displayTechStacksCards(techStack)
document.addEventListener("DOMContentLoaded", displayTechStacksCards);
