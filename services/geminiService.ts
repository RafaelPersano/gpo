
import { GoogleGenAI, Type } from "@google/genai";
import type { ConstructionPlan, MarketingMaterials, ProjectDetails } from '../types.ts';

let ai: GoogleGenAI | null = null;
const getAiClient = (): GoogleGenAI => {
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

const projectDetailsSchema = {
    type: Type.OBJECT,
    properties: {
        totalArea: { type: Type.NUMBER, description: "A área total construída em metros quadrados (soma de todas as unidades)." },
        unitArea: { type: Type.NUMBER, description: "A área de UMA ÚNICA unidade em metros quadrados. Se for uma unidade única, este valor deve ser igual a 'totalArea'." },
        numberOfUnits: { type: Type.INTEGER, description: "O número de unidades idênticas no projeto. Se for uma unidade única, o valor deve ser 1." },
        unitType: { type: Type.STRING, description: "O tipo de unidade (ex: 'casa', 'apartamento', 'sobrado')." },
        bedrooms: { type: Type.INTEGER, description: "O número de quartos (dormitórios) POR UNIDADE." },
        suites: { type: Type.INTEGER, description: "O número de suítes POR UNIDADE." },
        bathrooms: { type: Type.INTEGER, description: "O número TOTAL de banheiros POR UNIDADE (incluindo lavabos e suítes). Por exemplo, 1 suíte e 1 banheiro social totalizam 2 banheiros." },
        floors: { type: Type.INTEGER, description: "O número de andares/pavimentos POR UNIDADE." },
        style: { type: Type.STRING, description: "O estilo arquitetônico principal (ex: 'Moderno', 'Contemporâneo', 'Industrial')." },
        roomDimensions: {
            type: Type.ARRAY,
            description: "Uma lista com o dimensionamento (área em m²) de cada cômodo principal da unidade. Inclua quartos, suítes, banheiros, cozinha e sala. Ex: [{ name: 'Quarto 1', area: 12.5 }, { name: 'Cozinha', area: 10.0 }]",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "O nome do cômodo (ex: 'Suíte Master', 'Cozinha', 'Sala de Estar')." },
                    area: { type: Type.NUMBER, description: "A área do cômodo em metros quadrados." },
                },
                required: ["name", "area"]
            }
        },
    },
    required: ["totalArea", "unitArea", "numberOfUnits", "style"]
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


export async function generateTechnicalDrawings(projectSummary: string, projectDetails: ProjectDetails): Promise<{ mainImage: string | null; planView: string | null; interiorKitchen: string | null; interiorLiving: string | null; }> {
    try {
        const ai = getAiClient();
        const generate = async (prompt: string, aspectRatio: '16:9' | '1:1' = '16:9') => {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio },
            });
            if (response.generatedImages && response.generatedImages.length > 0) {
                const base64: string = response.generatedImages[0].image.imageBytes;
                return `data:image/jpeg;base64,${base64}`;
            }
            return null;
        }

        const isMultiUnit = projectDetails.numberOfUnits > 1;
        const floorDescription = projectDetails.floors ? (projectDetails.floors === 1 ? 'A construção é TÉRREA (1 andar).' : `A construção tem ${projectDetails.floors} andares (sobrado).`) : 'O número de andares não foi especificado.';
        const roomDescription = `A unidade tem EXATAMENTE ${projectDetails.bedrooms || 1} quarto(s)${projectDetails.suites ? `, sendo ${projectDetails.suites} suíte(s)` : ''}, e um TOTAL de ${projectDetails.bathrooms || 1} banheiro(s) (incluindo suítes).`;
        const roomDefinitions = projectDetails.roomDimensions?.map(r => `- ${r.name}: ${r.area.toFixed(1)}m²`).join('\n') || 'N/A';


        const mainImagePrompt = isMultiUnit
        ? `Create an ultra-photorealistic, high-end architectural visualization of the **exterior of a housing complex/condominium** featuring several identical **${projectDetails.unitType}s**. The project is: ${projectSummary}.
           CRITICAL INSTRUCTION: Each unit in the complex must be consistent with the number of floors. ${floorDescription}
           Art Direction: The architectural style is strictly **${projectDetails.style}**. This should be reflected in all aspects of the design. Create a cover shot for a prestigious architecture magazine. Show the relationship between the units, common areas, and landscaping. The lighting should be a dramatic 'golden hour' or 'blue hour', casting long shadows and highlighting textures. Materials must be hyper-realistic and consistent with the **${projectDetails.style}** style (e.g., for a 'Modern' style, use raw concrete, dark wood, and expansive glass). Convey a sense of luxury, community, and modern living.`
        : `Create an ultra-photorealistic, high-end architectural visualization of the **external facade** of: ${projectSummary}.
           CRITICAL INSTRUCTION: The building's structure must be consistent with the number of floors. ${floorDescription} The facade must clearly represent this.
           Art Direction: The architectural style is strictly **${projectDetails.style}**. Create a cover shot for a prestigious architecture magazine. Lighting should be dramatic and cinematic, such as 'golden hour' or 'blue hour', to create depth and mood. Materials must be hyper-realistic and characteristic of the **${projectDetails.style}** style (e.g., for an 'Industrial' style, use exposed brick, black steel frames, and large factory-style windows). Use a powerful, slightly low-angle shot to emphasize the geometry. Include realistic, complementary landscaping.`;

        const planViewPrompt = `
            Create a **clean, minimalist, schematic wireframe floor plan** of a single ${projectDetails.unitType || 'unit'} with a total area of **${projectDetails.unitArea}m²**. This is NOT a realistic architectural drawing. Represent each room as a simple, clearly outlined rectangle (a block diagram).

            **CRITICAL INSTRUCTION 1: TEXT INSIDE BLOCKS**
            Inside EACH room's block, you MUST write two lines of text:
            1. The room's name (e.g., 'Sala de Estar', 'Suíte 1', 'Banheiro da Suíte 1').
            2. The room's area in square meters (e.g., '25.0 m²').
            The text must be centered, clear, and perfectly legible, not truncated or garbled.

            **CRITICAL INSTRUCTION 2: ROOM COUNT AND NAMES**
            The floor plan MUST contain EXACTLY these rooms with these EXACT names and areas:
            ${roomDefinitions}
            The plan must have EXACTLY ${projectDetails.bedrooms || 1} bedroom(s)/suite(s) and a TOTAL of ${projectDetails.bathrooms || 1} bathroom(s)/lavabo(s), according to the room list above.
            - A suíte é um conjunto de quarto + banheiro. Se a lista de cômodos contém "Suíte 1" e "Banheiro da Suíte 1", desenhe-os como cômodos adjacentes.
            - Não adicione cômodos extras. Siga a lista de 'roomDefinitions' à risca.
            
            **CRITICAL INSTRUCTION 3: STYLE**
            - Style: Top-down 2D view. Black lines on a pure white background.
            - Content: ONLY include room outlines, room name labels, and area labels.
            - **DO NOT INCLUDE**: Furniture, textures, colors, shading, doors, windows, or any other architectural details. This is a simple block diagram.
            - Layout: The layout must be functional and logical, with rooms correctly sized relative to their specified areas.
            - Title: Include a title at the top: 'Planta Esquemática - ${projectDetails.unitArea.toFixed(0)}m²'.
        `;
        
        const interiorKitchenPrompt = `
            Create an ultra-photorealistic interior visualization of the **kitchen inside a single ${projectDetails.unitType || 'unit'} of ${projectDetails.unitArea}m²** for the project: ${projectSummary}.
            Art Direction: CRITICAL: The style must be **strictly ${projectDetails.style}** and absolutely coherent with the external facade's materials and lighting mood. The design should feel like a natural extension of the exterior. Focus on high-end finishes, realistic materials (e.g., if the facade uses natural wood, incorporate similar tones in the cabinetry). The lighting should be bright and appear natural, but with a sophisticated, layered quality that complements the exterior's dramatic lighting (e.g., soft under-cabinet LEDs, a designer pendant light, and diffuse daylight from a window).
        `;

        const interiorLivingPrompt = `
            Create an ultra-photorealistic interior visualization of the **living room inside a single ${projectDetails.unitType || 'unit'} of ${projectDetails.unitArea}m²** for the project: ${projectSummary}.
            Art Direction: CRITICAL: The style must be **strictly ${projectDetails.style}**, visually connected to the kitchen view, and perfectly coherent with the exterior facade. The color palette, material choices (fabrics, woods, metals), and overall atmosphere must align with the other generated images. Emphasize comfortable yet sophisticated furniture that fits the **${projectDetails.style}** aesthetic. The lighting should be warm and inviting, using a mix of natural light and well-placed artificial sources to create a layered, high-end feel consistent with the kitchen and exterior scenes.
        `;


        const [mainImage, planView, interiorKitchen, interiorLiving] = await Promise.all([
            generate(mainImagePrompt, '16:9'),
            generate(planViewPrompt, '1:1'),
            generate(interiorKitchenPrompt, '16:9'),
            generate(interiorLivingPrompt, '16:9')
        ]);

        return { mainImage, planView, interiorKitchen, interiorLiving };

    } catch (imageError) {
        console.warn("A geração de imagem falhou.", imageError);
        return { mainImage: null, planView: null, interiorKitchen: null, interiorLiving: null };
    }
}


async function _generateProjectDetails(userInput: string): Promise<ProjectDetails> {
    const ai = getAiClient();
    const prompt = `
        Analise a seguinte descrição de projeto de construção e extraia os detalhes estruturados. PRESTE MUITA ATENÇÃO a projetos com múltiplas unidades (ex: '10 casas', 'prédio com 20 apartamentos').
        - **numberOfUnits**: Identifique o número de unidades. Se for uma única casa/reforma, o valor é 1.
        - **unitArea**: Identifique a área de UMA ÚNICA unidade. Se não especificado para múltiplas unidades, estime.
        - **totalArea**: Calcule a área total (numberOfUnits * unitArea). DEVE ser preciso.
        - **unitType**: Descreva o tipo de unidade (ex: 'casa', 'sobrado', 'apartamento').
        - **bedrooms, suites, floors**: Devem ser referentes a UMA ÚNICA unidade. Siga a descrição do usuário à risca.
        - **bathrooms**: Identifique o NÚMERO TOTAL de banheiros por unidade. IMPORTANTE: Some todos os banheiros, incluindo suítes e lavabos. Se a descrição diz "2 quartos, sendo 1 suíte, e 1 banheiro social", o total de banheiros é 2.
        - **style**: O estilo arquitetônico geral.
        - **roomDimensions**: Forneça uma estimativa de área para cada cômodo principal.
            - **CRÍTICO:** A lista de cômodos e seus nomes devem corresponder EXATAMENTE à descrição.
            - Se a descrição pede 2 quartos, a lista DEVE conter dois cômodos nomeados como "Quarto 1" e "Quarto 2" (ou "Suíte 1", "Quarto 2", etc.).
            - Se a descrição pede 3 banheiros (2 suítes, 1 lavabo), a lista DEVE conter cômodos como "Banheiro da Suíte 1", "Banheiro da Suíte 2", e "Lavabo". NÃO omita nem nomeie cômodos incorretamente.
            - A soma das áreas dos cômodos deve ser coerente com a 'unitArea'.
        
        Descrição: "${userInput}"
    `;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: projectDetailsSchema,
        },
    });
    const jsonText = response.text?.trim();
    if (!jsonText) throw new Error("A API não retornou os detalhes do projeto. A resposta estava vazia.");
    try {
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Falha ao parsear JSON dos detalhes do projeto:", jsonText);
        throw new Error("A API retornou um formato inválido para os detalhes do projeto.");
    }
}

async function _generateConstructionPlan(
    userInput: string,
    projectDetails: ProjectDetails,
    totalBudget: number,
    managerFeePercent: number | null,
    startDate: string | undefined,
    endDate: string | undefined,
    payMaterialsWithCard: boolean
): Promise<ConstructionPlan> {
    
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
               * A data de vencimento ('dueDate') de cada pagamento de material deve ser alguns dias (ex: 3-5 dias) ANTES da data de entrega do material ('deliveryDate') correspondente. Isso garante que os fundos estejam disponíveis para pagar o fornecedor.
               * A descrição deve ser específica, como "Pagamento - Materiais de Fundação" ou "Pagamento - Acabamentos Hidráulicos".
               * A categoria ('category') para todos estes pagamentos DEVE ser 'Material'.`
        }

    3.  **Validação Final:** A soma de TODAS as parcelas no 'paymentSchedule' (Mão de Obra + Materiais) DEVE ser exatamente igual à 'budget.total'.
    `;

    const ai = getAiClient();
    const prompt = `
        Você é um planejador de construção sênior. Com base nos detalhes do projeto e restrições, crie um plano de construção detalhado.

        **Descrição do Projeto:** "${userInput}"
        **Detalhes Estruturados do Projeto:** ${JSON.stringify(projectDetails)}
        **Verba Total:** R$ ${totalBudget.toFixed(2)}

        **Instruções Específicas:**
        1.  **Cronograma de Tarefas:** ${dateConstraints} Para projetos multi-unidade, as tarefas devem refletir a construção de TODAS as unidades.
        2.  **Orçamento:** ${feeInstruction}
        3.  **Cronograma de Pagamentos:** Siga estritamente esta instrução:
            ---
            ${paymentInstruction}
            ---
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: planSchema,
        },
    });
    const jsonText = response.text?.trim();
    if (!jsonText) throw new Error("A API não retornou o plano de construção. A resposta estava vazia.");
    try {
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Falha ao parsear JSON do plano de construção:", jsonText);
        throw new Error("A API retornou um formato inválido para o plano de construção.");
    }
}

async function _generateMarketingAndProposal(
    userInput: string,
    projectDetails: ProjectDetails,
    projectStartDate: string,
    projectEndDate: string,
    totalBudget: number,
    responsibleProfessional: string,
    clientName: string
): Promise<{ proposalText: string; projectSummary: string; marketingMaterials: MarketingMaterials; }> {
    const professionalInfo = responsibleProfessional ? `Esta proposta foi preparada sob a supervisão de ${responsibleProfessional}.` : '';
    const greetingInstruction = clientName
        ? `Comece a proposta com uma saudação formal e personalizada para o cliente '${clientName}'. Use "Prezado" para nomes masculinos e "Prezada" para nomes femininos (por exemplo, "Prezado João da Silva," ou "Prezada Maria Oliveira,").`
        : `Como o nome do cliente não foi fornecido, omita a saudação pessoal (como "Prezado(a) Cliente,") e inicie a proposta diretamente com a introdução do projeto.`;

    const ai = getAiClient();
    const prompt = `
        Você é um especialista em marketing e comunicação para construção civil. Com base nos detalhes e no plano do projeto, crie os seguintes materiais: um resumo do projeto, uma proposta comercial completa e materiais de marketing.

        **Descrição Original do Cliente:** "${userInput}"
        **Detalhes Estruturados do Projeto:** ${JSON.stringify(projectDetails)}
        **Resumo do Plano Gerado:** O projeto inicia em ${projectStartDate} e termina em ${projectEndDate}, com um custo total de R$ ${totalBudget.toFixed(2)}.

        **PARTE 1: RESUMO DO PROJETO ('projectSummary')**
        Reescreva a descrição original em um resumo profissional e bem estruturado, em um único parágrafo. Se for um projeto multi-unidade, deixe isso claro.

        **PARTE 2: PROPOSTA COMERCIAL ('proposalText')**
        Escreva uma proposta comercial formal e clara (texto puro, sem markdown). Siga EXATAMENTE esta estrutura de seções, separadas por linhas em branco:
        - **Introdução:** ${greetingInstruction} Apresente o propósito da proposta. ${professionalInfo}
        - **Escopo do Projeto Detalhado:** Crie uma lista detalhada de entregáveis com asteriscos ('* ').
        - **Cronograma Previsto:** Informe as datas de início e término.
        - **Resumo do Orçamento:** Apresente o valor total e detalhe os custos de Materiais, Mão de Obra e Taxa de Gestão.
        - **Análise Financeira e BDI:** Insira EXATAMENTE o placeholder: [TABELA_BDI_ROI_PLACEHOLDER]
        - **Próximos Passos:** Sugira os próximos passos.
        - **Encerramento:** Despedida cordial e profissional.

        **PARTE 3: MATERIAIS DE MARKETING ('marketingMaterials')**
        Crie nomes comerciais, posts para Instagram e LinkedIn, CTAs e conteúdo para landing page.
    `;

    const marketingProposalSchema = {
        type: Type.OBJECT,
        properties: {
            proposalText: { type: Type.STRING, description: "O texto completo da proposta comercial, formatado como texto puro." },
            projectSummary: { type: Type.STRING, description: "Um resumo conciso e profissional do projeto, com um único parágrafo." },
            marketingMaterials: marketingMaterialsSchema
        },
        required: ["proposalText", "projectSummary", "marketingMaterials"]
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: marketingProposalSchema,
        },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) throw new Error("A API não retornou a proposta e os materiais de marketing. A resposta estava vazia.");
    try {
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Falha ao parsear JSON de marketing/proposta:", jsonText);
        throw new Error("A API retornou um formato inválido para os materiais de marketing.");
    }
}

async function _generateDescriptiveMemorial(
    projectDetails: ProjectDetails,
    userInput: string
): Promise<string> {
    const ai = getAiClient();
    const prompt = `
        Crie um "Memorial Descritivo" técnico e detalhado para um projeto de construção.

        **Descrição do Projeto:** "${userInput}"
        **Detalhes Estruturados:** ${JSON.stringify(projectDetails)}

        **Instruções:**
        O memorial deve ser um documento formal que descreve todos os materiais, acabamentos e sistemas a serem empregados na obra. Siga a estrutura abaixo, detalhando cada item com base no estilo e porte do projeto. Seja específico (ex: "Piso porcelanato acetinado 80x80cm" em vez de "piso de cerâmica"). Se a informação não estiver clara, use padrões de mercado para um projeto de estilo **${projectDetails.style}**.
        O texto final deve ser puro, sem formatação Markdown como '###'. Use apenas a estrutura de seções numeradas.

        **ESTRUTURA DO MEMORIAL:**

        **1. SERVIÇOS PRELIMINARES E GERAIS**
        - Descreva a limpeza do terreno, instalações provisórias (água, luz, canteiro) e locação da obra.

        **2. INFRAESTRUTURA E FUNDAÇÕES**
        - Especifique o tipo de fundação (ex: sapatas de concreto armado, radier, estacas) com base em uma casa de ${projectDetails.floors || 1} pavimento(s). Inclua detalhes sobre impermeabilização.

        **3. SUPRAESTRUTURA**
        - Detalhe a estrutura (ex: concreto armado com pilares, vigas e lajes pré-moldadas ou maciças).

        **4. PAREDES E VEDAÇÕES**
        - Especifique os materiais para paredes externas e internas (ex: blocos cerâmicos de 14cm e 9cm, respectivamente).

        **5. COBERTURA**
        - Descreva a estrutura do telhado (ex: estrutura de madeira ou metálica) e o tipo de telha (ex: telhas cerâmicas, de fibrocimento, laje impermeabilizada).

        **6. ESQUADRIAS**
        - Detalhe portas (internas e externa - material e acabamento) e janelas (material, tipo de vidro - ex: alumínio preto com vidro temperado de 8mm).

        **7. REVESTIMENTOS (PISOS E PAREDES)**
        - Especifique o acabamento para cada ambiente:
          - Quartos e Sala: (ex: Piso vinílico, Porcelanato)
          - Cozinha e Banheiros: (ex: Porcelanato no piso e paredes até o teto)
          - Áreas Externas: (ex: Piso cimentício antiderrapante)

        **8. PINTURA**
        - Detalhe a pintura interna (ex: massa corrida e tinta acrílica fosca na cor branca) e externa (ex: textura acrílica projetada e tinta emborrachada).

        **9. INSTALAÇÕES ELÉTRICAS**
        - Descreva o padrão de entrada, quadro de disjuntores, e tipos de tomadas e interruptores (ex: Linha Tramontina Liz). Prever pontos para ar condicionado nos quartos.

        **10. INSTALAÇÕES HIDRÁULICAS E SANITÁRIAS**
        - Especifique a tubulação (ex: PVC para água fria e esgoto), metais (torneiras e registros - ex: padrão Deca/Docol), e louças sanitárias (vasos com caixa acoplada). Prever sistema de aquecimento de água (ex: aquecedor a gás de passagem).

        **11. SERVIÇOS COMPLEMENTARES**
        - Inclua detalhes sobre bancadas (cozinha e banheiros - ex: granito São Gabriel), soleiras e peitoris.

        O texto deve ser contínuo, usando as seções como títulos com numeração (ex: "1. SERVIÇOS PRELIMINARES").
    `;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return response.text;
}


export async function generateFullProjectReport(
    userInput: string, 
    totalBudget: number,
    managerFeePercent: number | null,
    startDate: string | undefined, 
    endDate: string | undefined,
    payMaterialsWithCard: boolean,
    responsibleProfessional: string,
    clientName: string,
    onProgress: (stepIndex: number) => void
): Promise<{ plan: ConstructionPlan; projectDetails: ProjectDetails; proposalText: string; projectSummary: string; marketingMaterials: MarketingMaterials; descriptiveMemorial: string; }> {
    try {
        onProgress(1); // "Gerando o cronograma de tarefas detalhado..."
        const projectDetails = await _generateProjectDetails(userInput);
        
        onProgress(2); // "Calculando a distribuição do orçamento..."
        const plan = await _generateConstructionPlan(
            userInput, projectDetails, totalBudget, managerFeePercent, startDate, endDate, payMaterialsWithCard
        );
        
        onProgress(3); // "Elaborando a proposta comercial e financeira..."
        const { proposalText, projectSummary, marketingMaterials } = await _generateMarketingAndProposal(
            userInput, 
            projectDetails, 
            plan.projectStartDate, 
            plan.projectEndDate, 
            plan.budget.total, 
            responsibleProfessional, 
            clientName
        );

        const descriptiveMemorial = await _generateDescriptiveMemorial(projectDetails, userInput);


        return { plan, projectDetails, proposalText, projectSummary, marketingMaterials, descriptiveMemorial };

    } catch (error) {
        console.error("Erro ao gerar relatório completo:", error);
        if (error instanceof Error) {
            throw new Error(`Falha na geração do relatório: ${error.message}`);
        }
        throw new Error("Falha ao gerar o plano de construção. A resposta da API pode ser inválida ou a solicitação falhou.");
    }
}