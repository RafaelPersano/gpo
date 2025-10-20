import { GoogleGenAI, Type } from "@google/genai";
import type { ConstructionPlan, MarketingMaterials } from '../types';

// Lazy initialization for the Gemini AI client
let ai: GoogleGenAI | null = null;
const getAiClient = (): GoogleGenAI => {
    if (!ai) {
        // This might fail if process.env.API_KEY is not available,
        // but it will fail on-demand instead of at module load time.
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};


const planSchema = {
    type: Type.OBJECT,
    properties: {
        projectStartDate: { type: Type.STRING, description: "A data de início geral do projeto, correspondente à data de início mais antiga de todas as tarefas. Formato YYYY-MM-DD." },
        projectEndDate: { type: Type.STRING, description: "A data de término geral do projeto, correspondente à data de término mais recente de todas as tarefas. Formato YYYY-MM-DD." },
        budget: {
            type: Type.OBJECT,
            properties: {
                total: { type: Type.NUMBER, description: "O custo total da obra, igual à verba informada pelo usuário." },
                materials: { type: Type.NUMBER, description: "O custo total estimado para todos os materiais." },
                labor: { type: Type.NUMBER, description: "O custo total estimado para toda a mão de obra." },
                managerFee: { type: Type.NUMBER, description: "O valor calculado para a taxa do gestor da obra." },
            },
            required: ["total", "materials", "labor", "managerFee"],
        },
        tasks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.INTEGER, description: "Identificador numérico único para a tarefa." },
                    phase: { type: Type.STRING, description: "A fase da construção a que esta tarefa pertence (ex: Fundação, Estrutura, Acabamento)." },
                    taskName: { type: Type.STRING, description: "O nome específico da tarefa." },
                    description: { type: Type.STRING, description: "Uma breve descrição do que a tarefa envolve." },
                    assignee: { type: Type.STRING, description: "A equipe ou pessoa responsável pela tarefa (ex: 'Equipe de Alvenaria', 'Eletricista')." },
                    startDate: { type: Type.STRING, description: "Data de início da tarefa no formato YYYY-MM-DD." },
                    endDate: { type: Type.STRING, description: "Data de término da tarefa no formato YYYY-MM-DD." },
                    status: { type: Type.STRING, description: "O estado atual da tarefa. O valor inicial deve ser 'Não Iniciado'." },
                    dependencies: { type: Type.STRING, description: "IDs de tarefas que precisam ser concluídas antes desta, separadas por vírgula (ex: '1, 2') ou 'Nenhuma'." },
                    costMaterials: { type: Type.NUMBER, description: "Custo estimado dos materiais para esta tarefa específica." },
                    costLabor: { type: Type.NUMBER, description: "Custo estimado da mão de obra para esta tarefa específica." },
                    notes: { type: Type.STRING, description: "Quaisquer notas ou observações adicionais sobre a tarefa." },
                },
                required: ["id", "phase", "taskName", "description", "assignee", "startDate", "endDate", "status", "dependencies", "costMaterials", "costLabor", "notes"],
            },
        },
        materialDeliveries: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.INTEGER },
                    materialName: { type: Type.STRING, description: "Nome do material ou grupo de materiais a ser entregue." },
                    relatedTaskId: { type: Type.INTEGER, description: "O ID da primeira tarefa que usará este material." },
                    deliveryDate: { type: Type.STRING, description: "Data em que o material deve ser entregue na obra (formato YYYY-MM-DD)." },
                    supplier: { type: Type.STRING, description: "Fornecedor sugerido ou tipo de fornecedor." },
                    status: { type: Type.STRING, description: "Status inicial da entrega, sempre 'Pendente'." },
                },
                required: ["id", "materialName", "relatedTaskId", "deliveryDate", "supplier", "status"],
            }
        },
        paymentSchedule: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.INTEGER },
                    description: { type: Type.STRING, description: "Descrição da parcela de pagamento (ex: 'Pagamento - Conclusão da Fundação', 'Pagamento - Materiais de Acabamento')." },
                    dueDate: { type: Type.STRING, description: "Data de vencimento do pagamento (formato YYYY-MM-DD)." },
                    amount: { type: Type.NUMBER, description: "Valor da parcela." },
                    status: { type: Type.STRING, description: "Status inicial do pagamento, sempre 'Pendente'." },
                    category: { type: Type.STRING, description: "A categoria do pagamento. Deve ser 'Mão de Obra' ou 'Material'." },
                },
                required: ["id", "description", "dueDate", "amount", "status", "category"],
            }
        },
    },
    required: ["projectStartDate", "projectEndDate", "budget", "tasks", "materialDeliveries", "paymentSchedule"],
};

const marketingMaterialsSchema = {
    type: Type.OBJECT,
    properties: {
        commercialNames: {
            type: Type.ARRAY,
            description: "Uma lista de 3 a 5 nomes comerciais criativos e profissionais para este projeto específico ou para o serviço de construção oferecido.",
            items: { type: Type.STRING }
        },
        instagramPost: {
            type: Type.STRING,
            description: "Um texto de post para Instagram, com linguagem visual e direta, incluindo emojis e hashtags relevantes. O post deve ser focado em atrair o cliente final."
        },
        linkedInPost: {
            type: Type.STRING,
            description: "Um texto de post para LinkedIn, com linguagem mais profissional e focada nos benefícios técnicos e de gerenciamento do projeto. Deve incluir hashtags profissionais."
        },
        ctas: {
            type: Type.ARRAY,
            description: "Uma lista de 3 a 5 frases de 'Call to Action' (CTA) persuasivas para usar em botões ou final de textos.",
            items: { type: Type.STRING }
        },
        landingPageContent: {
            type: Type.OBJECT,
            properties: {
                headline: { type: Type.STRING, description: "Um título principal (headline) impactante para uma seção de landing page." },
                subheadline: { type: Type.STRING, description: "Um subtítulo que complementa o headline, abordando a dor do cliente." },
                benefits: {
                    type: Type.ARRAY,
                    description: "Uma lista de 3 benefícios principais do projeto, cada um com um título e uma breve descrição.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING }
                        },
                        required: ["title", "description"]
                    }
                },
                finalCta: { type: Type.STRING, description: "A frase final para o botão principal de CTA da landing page." },
                imageSuggestion: { type: Type.STRING, description: "Uma sugestão detalhada para uma imagem de herói (hero image), incluindo estilo, assunto e iluminação. Ex: 'Foto de uma cozinha moderna com ilha de mármore, inundada de luz natural, transmitindo uma sensação de amplitude e limpeza'." }
            },
            required: ["headline", "subheadline", "benefits", "finalCta", "imageSuggestion"]
        }
    },
    required: ["commercialNames", "instagramPost", "linkedInPost", "ctas", "landingPageContent"]
};

const fullReportSchema = {
    type: Type.OBJECT,
    properties: {
        plan: planSchema,
        proposalText: {
            type: Type.STRING,
            description: "O texto completo da proposta comercial, formatado como texto puro, sem markdown, seguindo todas as instruções de estilo e conteúdo."
        },
        projectSummary: {
            type: Type.STRING,
            description: "Um resumo conciso e profissional do projeto, com um único parágrafo."
        },
        marketingMaterials: marketingMaterialsSchema
    },
    required: ["plan", "proposalText", "projectSummary", "marketingMaterials"]
};

const excelSchema = {
    type: Type.OBJECT,
    properties: {
        rows: {
            type: Type.ARRAY,
            description: "Uma lista de tarefas ou itens para a planilha de gerenciamento de obras.",
            items: {
                type: Type.OBJECT,
                properties: {
                    Etapa: { type: Type.STRING, description: "A fase da construção (ex: Fundação, Estrutura)." },
                    "Descrição da Tarefa": { type: Type.STRING, description: "Descrição detalhada da tarefa a ser executada." },
                    Unidade: { type: Type.STRING, description: "Unidade de medida (ex: m², m³, un)." },
                    Quantidade: { type: Type.NUMBER, description: "Quantidade do serviço." },
                    "Custo Unitário": { type: Type.NUMBER, description: "Custo por unidade do serviço." },
                    "Custo Total": { type: Type.NUMBER, description: "Custo total (Quantidade * Custo Unitário)." },
                    "Data de Início": { type: Type.STRING, description: "Data de início da tarefa (YYYY-MM-DD)." },
                    "Data de Término": { type: Type.STRING, description: "Data de término da tarefa (YYYY-MM-DD)." },
                    Responsável: { type: Type.STRING, description: "Equipe ou pessoa responsável." },
                    Status: { type: Type.STRING, description: "Status inicial (ex: Não Iniciado)." },
                    Notas: { type: Type.STRING, description: "Observações adicionais." },
                },
                required: ["Etapa", "Descrição da Tarefa", "Unidade", "Quantidade", "Custo Unitário", "Custo Total", "Data de Início", "Data de Término", "Responsável", "Status", "Notas"],
            }
        }
    },
    required: ["rows"],
};


export async function generateExcelData(prompt: string): Promise<any[]> {
    const ai = getAiClient();
    const fullPrompt = `
        Com base na descrição de projeto a seguir, crie uma lista de tarefas detalhadas para uma planilha de gerenciamento de obras.
        A resposta deve ser um objeto JSON contendo uma chave "rows", que é um array de objetos, cada um representando uma linha da planilha.
        Siga estritamente o schema fornecido, preenchendo todas as colunas para cada tarefa.
        
        Descrição do Projeto:
        ---
        ${prompt}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: excelSchema,
            },
        });
        
        const jsonText = response.text?.trim();
        if (!jsonText) {
            throw new Error("A API não retornou dados.");
        }
        
        const result = JSON.parse(jsonText);
        return result.rows || [];

    } catch (error) {
        console.error("Erro ao gerar dados para o Excel:", error);
        throw new Error("Falha ao gerar a planilha. A resposta da API pode ser inválida ou a solicitação falhou.");
    }
}


const createExteriorArtDirectedPrompt = (description: string): string => `
Create an ultra-photorealistic, high-end architectural visualization of: ${description}.

**Core Objective:** The final image must convey sophistication, solidity, and modernity, even if the project itself is simple or low-budget. The goal is a cover shot for a prestigious architecture magazine.

**Art Direction & Style Guide:**
1.  **Lighting:** Use dramatic and cinematic lighting. Emphasize light and shadow to create depth and mood. Consider using 'golden hour' (late afternoon) or dusk lighting to highlight the building's form. Avoid flat, midday lighting.
2.  **Textures & Materials:** Render materials with hyper-realistic, high-quality textures. Showcase the texture of concrete, the grain of wood, the reflection on glass, and the finish of metal. Materials should look premium and well-finished.
3.  **Composition:** The camera angle should be powerful, making the structure feel solid and well-grounded. Use strong leading lines and a composition that emphasizes modern, clean geometry.
4.  **Atmosphere:** Create a professional and polished atmosphere. AVOID any rustic, unfinished, cluttered, or dated look.
`;

const createInteriorArtDirectedPrompt = (description: string): string => `
Create an ultra-photorealistic, high-end interior design visualization of: ${description}.

**Core Objective:** The final image must convey sophistication, comfort, and modernity. The goal is a feature shot for a prestigious interior design magazine.

**Art Direction & Style Guide:**
1.  **Lighting:** Use natural and ambient lighting to create a welcoming and well-lit space. Emphasize how light interacts with surfaces. Avoid harsh, artificial lighting unless it's a design feature.
2.  **Textures & Materials:** Render materials with hyper-realistic, high-quality textures. Showcase the texture of fabrics, the grain of wood, the reflection on countertops, and the finish of fixtures. Materials should look premium and well-finished.
3.  **Composition:** The camera angle should create a sense of space and flow. Use a composition that highlights the key features of the room and its layout.
4.  **Atmosphere:** Create a professional, polished, and inviting atmosphere. The space should feel lived-in but tidy. AVOID any cluttered or dated look.
`;


export async function generateProjectImages(projectSummary: string): Promise<Record<string, string>> {
    const ai = getAiClient();

    const imageAreas = {
        facade: `A fachada principal de: ${projectSummary}`,
        kitchen: `A cozinha de: ${projectSummary}`,
        livingRoom: `A sala de estar de: ${projectSummary}`,
        bedroom: `O quarto principal de: ${projectSummary}`,
        bathroom: `O banheiro principal de: ${projectSummary}`,
    };

    const imagePromises = Object.entries(imageAreas).map(async ([key, description]) => {
        try {
            const isInterior = key !== 'facade';
            const imagePrompt = isInterior
                ? createInteriorArtDirectedPrompt(description)
                : createExteriorArtDirectedPrompt(description);
                
            const imageResponse = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: imagePrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '16:9',
                },
            });
            
            if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
                const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
                return [key, `data:image/jpeg;base64,${base64ImageBytes}`];
            }
        } catch (imageError) {
            console.warn(`A geração de imagem para "${key}" falhou.`, imageError);
        }
        return [key, null]; // Retorna nulo em caso de falha
    });

    const results = await Promise.all(imagePromises);
    return Object.fromEntries(results.filter(r => r[1] !== null)) as Record<string, string>;
}


export async function generateFullProjectReport(
    userInput: string, 
    totalBudget: number,
    managerFeePercent: number | null,
    startDate: string | undefined, 
    endDate: string | undefined,
    payMaterialsWithCard: boolean,
    responsibleProfessional: string,
    clientName: string
): Promise<{ plan: ConstructionPlan; proposalText: string; projectSummary: string; marketingMaterials: MarketingMaterials; }> {

  let dateConstraints = '';
  if (startDate && endDate) {
    dateConstraints = `O projeto deve preferencialmente começar em ${startDate} e terminar até ${endDate}. Se o escopo não couber nesse prazo de forma realista, ajuste as datas de início e término do projeto conforme necessário, mas tente se aproximar o máximo possível das datas fornecidas.`;
  } else if (startDate) {
    dateConstraints = `A data de início preferencial para o projeto é ${startDate}. Por favor, use esta data como o ponto de partida para o cronograma.`;
  } else if (endDate) {
    dateConstraints = `A data de término máxima para o projeto é ${endDate}. Planeje as tarefas para que a obra seja concluída até esta data, se for realista.`;
  }
  
  let feeInstruction = '';
  if (managerFeePercent !== null) {
      feeInstruction = `
      Uma taxa de gestão de ${managerFeePercent}% sobre a verba total da obra deve ser calculada e incluída no orçamento como 'managerFee'.
      O valor restante (Verba Total - Taxa de Gestão) deve ser distribuído entre os custos de materiais e mão de obra para todas as tarefas.
      A soma de 'materials', 'labor' e 'managerFee' DEVE ser igual à verba total.
      `;
  } else {
      feeInstruction = "Nenhuma taxa de gestão foi informada, então o valor para 'managerFee' no orçamento deve ser 0.";
  }

  const paymentInstruction = `
    Sua tarefa é criar um cronograma de pagamentos detalhado, separando claramente os custos de Mão de Obra/Gestão e os custos de Materiais.

    1.  **Pagamentos de Mão de Obra e Gestão (Pagamento por Etapa/Marco):**
        *   Crie um cronograma de pagamentos baseado nos marcos de execução do projeto, em vez de pagamentos semanais fixos.
        *   Analise todas as tarefas e agrupe-as em marcos de pagamento lógicos que representem uma entrega significativa (ex: Demolição, Fundação, Estrutura, Instalações, Acabamentos).
        *   Para cada um desses marcos, crie uma parcela de pagamento.
        *   **Descrição:** A descrição da parcela deve ser clara e refletir o serviço executado. Ex: "Pagamento - Conclusão da Demolição e Limpeza", "Pagamento - Finalização da Estrutura e Alvenaria".
        *   **Data de Vencimento:** A 'dueDate' de cada parcela deve coincidir com a data de término ('endDate') da última tarefa daquele marco.
        *   **Valor:** O valor ('amount') da parcela deve ser a soma dos 'costLabor' de todas as tarefas pertencentes àquele marco.
        *   **Taxa de Gestão:** Se houver uma 'managerFee', distribua seu valor proporcionalmente entre as parcelas de pagamento de mão de obra criadas. O valor final de cada parcela será a soma dos 'costLabor' do marco + a porção proporcional da 'managerFee'.
        *   **Categoria:** A 'category' para todos estes pagamentos DEVE ser 'Mão de Obra'.

    2.  **Pagamentos de Materiais:**
        ${payMaterialsWithCard 
            ? `* O cliente optou por pagar os materiais com cartão de crédito.
               * Crie UMA ÚNICA parcela de pagamento para o valor total de todos os materiais ('budget.materials').
               * A descrição deve ser 'Pagamento Total de Materiais (Cartão de Crédito)'.
               * A data de vencimento ('dueDate') pode ser a data de término do projeto ('projectEndDate').
               * A categoria ('category') para este pagamento DEVE ser 'Material'.`
            : `* O cliente pagará os materiais de forma faseada.
               * Para os principais grupos de materiais (ex: cimento, aço, tijolos, acabamentos), crie parcelas de pagamento individuais no 'paymentSchedule'.
               * O valor de cada parcela deve corresponder ao custo dos materiais para uma fase específica da obra (agrupe os 'costMaterials' de tarefas relacionadas).
               * A data de vencimento ('dueDate'
) de cada pagamento de material deve ser alguns dias (ex: 3-5 dias) ANTES da data de entrega do material ('deliveryDate') correspondente. Isso garante que os fundos estejam disponíveis para pagar o fornecedor.
               * A descrição deve ser específica, como "Pagamento - Materiais de Fundação" ou "Pagamento - Acabamentos Hidráulicos".
               * A categoria ('category') para todos estes pagamentos DEVE ser 'Material'.`
        }

    3.  **Validação Final:** A soma de TODAS as parcelas no 'paymentSchedule' (Mão de Obra + Materiais) DEVE ser exatamente igual à 'budget.total'.
    `;
    
  const professionalInfo = responsibleProfessional 
    ? `Esta proposta foi preparada sob la supervisão de ${responsibleProfessional}.`
    : '';

  const greetingInstruction = clientName
    ? `Comece a proposta com uma saudação formal e personalizada para o cliente '${clientName}'. Use "Prezado" para nomes masculinos e "Prezada" para nomes femininos (por exemplo, "Prezado João da Silva," ou "Prezada Maria Oliveira,").`
    : `Como o nome do cliente não foi fornecido, omita a saudação pessoal (como "Prezado(a) Cliente,") e inicie a proposta diretamente com a introdução do projeto.`;

  const prompt = `
    Você é um planejador de construção e engenheiro de custos sênior. Sua tarefa é criar um relatório de projeto completo e integrado, contendo um plano de gerenciamento de obras, um resumo do projeto, uma proposta comercial e materiais de marketing.

    **Verba Total da Obra:** R$ ${totalBudget.toFixed(2)}
    **Descrição do Projeto Fornecida pelo Usuário:**
    ---
    ${userInput}
    ---
    
    **INSTRUÇÕES GERAIS:**
    Analise a descrição do projeto e a verba para criar todos os artefatos solicitados. A resposta DEVE ser um único objeto JSON que corresponda estritamente ao esquema fornecido, contendo 'plan', 'proposalText', 'projectSummary' e 'marketingMaterials'.

    ---
    **PARTE 1: PLANO DE OBRAS (objeto 'plan')**
    Crie um plano de gerenciamento de obras completo, seguindo as diretrizes abaixo:
    1.  **Cronograma de Tarefas:** Crie um cronograma detalhado com durações e dependências realistas. ${dateConstraints} Com base nas tarefas, determine a data de início e término geral do projeto.
    2.  **Orçamento:** ${feeInstruction}
    3.  **Entregas de Materiais:** Crie um cronograma de entrega de materiais essenciais, alinhado com as datas de início das tarefas.
    4.  **Cronograma de Pagamentos:** Crie um cronograma de pagamentos detalhado, seguindo estritamente a instrução abaixo:
        ---
        ${paymentInstruction}
        ---

    ---
    **PARTE 2: RESUMO DO PROJETO (string 'projectSummary')**
    Reescreva a descrição do usuário em um resumo profissional e bem estruturado. O resumo deve ser um único parágrafo conciso, usando linguagem formal (português do Brasil) e destacando os principais objetivos e características da obra. Este resumo será usado na página de rosto de um relatório formal.

    ---
    **PARTE 3: PROPOSTA COMERCIAL (string 'proposalText')**
    Com base no plano de obras que você acabou de criar, escreva uma proposta comercial formal, clara e objetiva para o cliente. O texto deve ser bem redigido, com parágrafos claros, pontuação correta e excelente gramática.

    **Instruções Cruciais para a Proposta:**
    1.  **Formatação:** O texto de saída deve ser texto puro. Para garantir a legibilidade, insira uma linha em branco (um '\\n') entre parágrafos e também antes e depois dos títulos de seção. NÃO use formatação Markdown como '##' ou '**'.
    2.  **Linguagem:** Use português do Brasil formal, técnico e objetivo, com pontuação e gramática impecáveis.
    3.  **Listas:** Para a seção "Escopo do Projeto Detalhado", use asteriscos para criar uma lista de itens (ex: '* Construção de fundação').
    4.  **Estrutura da Proposta:** Siga EXATAMENTE esta estrutura de seções, usando os títulos em texto simples:
        - **Introdução:** ${greetingInstruction} Apresente o propósito desta proposta em um ou dois parágrafos bem definidos, fazendo referência direta ao projeto solicitado. ${professionalInfo}
        - **Escopo do Projeto Detalhado:** Crie uma lista detalhada de entregáveis (bullet points usando '*'), baseada nas fases e tarefas do plano. Seja **objetivo e foque na qualidade técnica e nos materiais**. Exemplo: '* Fundação: Execução de fundação do tipo sapata corrida, dimensionada conforme projeto estrutural, utilizando concreto usinado FCK 25MPa e aço CA-50/60, em conformidade com as normas ABNT.'
        - **Cronograma Previsto:** Em um parágrafo claro, informe as datas de início e término do projeto, conforme definido no plano.
        - **Resumo do Orçamento:** Em um parágrafo, apresente o valor total do investimento. Em seguida, detalhe os custos de Materiais, Mão de Obra e Taxa de Gestão, usando os valores exatos do plano.
        - **Análise Financeira e BDI:** Insira EXATAMENTE o seguinte placeholder nesta seção, sem modificá-lo: [TABELA_BDI_ROI_PLACEHOLDER]
        - **Matriz de Cenários de Investimento:** Insira EXATAMENTE o seguinte placeholder: [MATRIZ_INVESTIMENTO_PLACEHOLDER]
        - **Análise Tributária na Construção Civil:** Insira EXATAMENTE o seguinte placeholder: [ANALISE_TRIBUTARIA_PLACEHOLDER]
        - **Próximos Passos:** Em um parágrafo, sugira os próximos passos para o cliente, como o alinhamento de detalhes e a assinatura do contrato.
        - **Encerramento:** Termine com uma despedida cordial e profissional em um parágrafo final. Se um profissional responsável foi informado, inclua o nome dele na assinatura no final.
    
    ---
    **PARTE 4: MATERIAIS DE MARKETING (objeto 'marketingMaterials')**
    Agora, atue como um especialista em marketing para a construção civil. Com base em todos os detalhes do projeto, crie um conjunto de materiais de marketing para ajudar o profissional (usuário do app) a vender este projeto para o cliente final.
    1.  **Nomes Comerciais ('commercialNames'):** Sugira de 3 a 5 nomes criativos para este projeto, como se fosse um produto. Ex: "Residência dos Sonhos", "Projeto Harmonia", etc.
    2.  **Post para Instagram ('instagramPost'):** Crie um texto para um post no Instagram. Use uma linguagem visual, adicione emojis relevantes (✨, 🚀, 🏡) e inclua hashtags populares como #obra, #reforma, #construcaocivil, #sonhodacasapropria.
    3.  **Post para LinkedIn ('linkedInPost'):** Crie um texto mais formal para o LinkedIn. Foque nos aspectos de gerenciamento, eficiência, cumprimento de prazos e orçamento. Use hashtags profissionais como #EngenhariaCivil, #GestãoDeObras, #Construção.
    4.  **CTAs ('ctas'):** Gere de 3 a 5 frases curtas e impactantes de 'Call to Action' para usar em botões e links. Ex: "Transforme seu sonho em realidade", "Solicite um orçamento sem compromisso".
    5.  **Conteúdo para Landing Page ('landingPageContent'):** Crie o conteúdo para uma seção de CTA de uma landing page, seguindo a estrutura do schema: um headline forte, um subheadline que aborda um problema, 3 benefícios claros, uma frase para o botão de CTA final e uma sugestão de imagem ('imageSuggestion'). A sugestão de imagem deve ser uma descrição vívida e detalhada, como se estivesse instruindo um fotógrafo. Inclua o tipo de imagem (ex: foto, render 3D), o assunto principal, o estilo (ex: moderno, aconchegante, luxuoso), a iluminação (ex: luz natural, iluminação dramática) e o sentimento geral (ex: 'Foto de uma cozinha moderna com ilha de mármore, inundada de luz natural, transmitindo uma sensação de amplitude e limpeza.', 'Render 3D de uma fachada imponente ao entardecer, com iluminação quente, evocando sofisticação e segurança.').

    Seja criativo, persuasivo e profissional em todo o conteúdo de marketing.

    Agora, gere o objeto JSON completo com 'plan', 'projectSummary', 'proposalText' e 'marketingMaterials'.
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: fullReportSchema,
      },
    });
    
    const jsonText = response.text?.trim();

    if (!jsonText) {
      console.error("A API Gemini retornou uma resposta de texto vazia. Resposta completa:", JSON.stringify(response, null, 2));
      throw new Error("A API não retornou dados. Isso pode ocorrer devido a filtros de conteúdo ou a uma falha na geração. Tente ser menos específico ou reformular seu pedido.");
    }
    
    const report = JSON.parse(jsonText);
    
    if (!report.plan || !report.proposalText || !report.projectSummary || !report.marketingMaterials) {
      throw new Error("A resposta da API não contém a estrutura de relatório esperada.");
    }
    
    return report;

  } catch (error) {
    console.error("Erro ao chamar a API Gemini:", error);
    throw new Error("Falha ao gerar o plano de construção. A resposta da API pode ser inválida ou a solicitação falhou.");
  }
}