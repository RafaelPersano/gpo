export const brazilianStates = {
  'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia',
  'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás',
  'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais',
  'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco', 'PI': 'Piauí',
  'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte', 'RS': 'Rio Grande do Sul',
  'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina', 'SP': 'São Paulo',
  'SE': 'Sergipe', 'TO': 'Tocantins'
};

export type CubStandardCode = 'R1-N' | 'R8-N' | 'R16-N' | 'R1-A' | 'R8-A' | 'R16-A' | 'CAL-8N' | 'CSL-8N' | 'CSL-16N' | 'CAL-8A' | 'CSL-8A' | 'CSL-16A' | 'RP1Q' | 'GI' | 'R1-B';

export type CubCategory = 'Residencial' | 'Comercial' | 'Industrial';

export interface CubStandardInfo {
    code: CubStandardCode;
    description: string;
    category: CubCategory;
}

export const cubStandardTypes: CubStandardInfo[] = [
    { code: 'R1-B', description: 'Residência Unifamiliar - Padrão Baixo', category: 'Residencial' },
    { code: 'R1-N', description: 'Residência Unifamiliar - Padrão Médio', category: 'Residencial' },
    { code: 'R1-A', description: 'Residência Unifamiliar - Padrão Alto', category: 'Residencial' },
    { code: 'RP1Q', description: 'Residência Popular - 1 Quarto', category: 'Residencial' },
    { code: 'R8-N', description: 'Prédio Residencial 8 Pav. - Padrão Normal', category: 'Residencial' },
    { code: 'R16-N', description: 'Prédio Residencial 16 Pav. - Padrão Normal', category: 'Residencial' },
    { code: 'R8-A', description: 'Prédio Residencial 8 Pav. - Padrão Alto', category: 'Residencial' },
    { code: 'R16-A', description: 'Prédio Residencial 16 Pav. - Padrão Alto', category: 'Residencial' },
    { code: 'CAL-8N', description: 'Comercial Andar Livre 8 Pav. - Padrão Normal', category: 'Comercial' },
    { code: 'CSL-8N', description: 'Comercial Salas/Lojas 8 Pav. - Padrão Normal', category: 'Comercial' },
    { code: 'CSL-16N', description: 'Comercial Salas/Lojas 16 Pav. - Padrão Normal', category: 'Comercial' },
    { code: 'CAL-8A', description: 'Comercial Andar Livre 8 Pav. - Padrão Alto', category: 'Comercial' },
    { code: 'CSL-8A', description: 'Comercial Salas/Lojas 8 Pav. - Padrão Alto', category: 'Comercial' },
    { code: 'CSL-16A', description: 'Comercial Salas/Lojas 16 Pav. - Padrão Alto', category: 'Comercial' },
    { code: 'GI', description: 'Galpão Industrial', category: 'Industrial' },
];

// Dados de CUB/m² (R$) referentes a Março/2023, exceto onde indicado.
// O padrão R1-N (Médio) é uma média calculada entre R1-B (Baixo) e R1-A (Alto).
// Fonte: Imagem fornecida pelo usuário (SINDUSCON)
export const cubData: Record<string, Record<CubStandardCode, number>> = {
  AP: { 'R1-N': 2529.37, 'R8-N': 2103.76, 'R16-N': 2062.32, 'R1-A': 3028.62, 'R8-A': 2541.70, 'R16-A': 2878.33, 'CAL-8N': 2533.78, 'CSL-8N': 2153.59, 'CSL-16N': 2908.79, 'CAL-8A': 2696.02, 'CSL-8A': 2347.81, 'CSL-16A': 3157.45, 'RP1Q': 2121.76, 'GI': 1214.95, 'R1-B': 2030.11 },
  AM: { 'R1-N': 2621.98, 'R8-N': 2031.79, 'R16-N': 1945.34, 'R1-A': 3191.95, 'R8-A': 2555.04, 'R16-A': 2653.39, 'CAL-8N': 2361.33, 'CSL-8N': 2042.27, 'CSL-16N': 2710.53, 'CAL-8A': 2514.25, 'CSL-8A': 2208.95, 'CSL-16A': 2929.76, 'RP1Q': 2031.28, 'GI': 1177.06, 'R1-B': 2052.00 },
  BA: { 'R1-N': 2461.46, 'R8-N': 1914.88, 'R16-N': 1860.91, 'R1-A': 2935.26, 'R8-A': 2337.57, 'R16-A': 2409.27, 'CAL-8N': 2211.53, 'CSL-8N': 1900.00, 'CSL-16N': 2524.59, 'CAL-8A': 2347.10, 'CSL-8A': 2058.78, 'CSL-16A': 2734.84, 'RP1Q': 1918.94, 'GI': 1064.33, 'R1-B': 1987.66 },
  CE: { 'R1-N': 2078.76, 'R8-N': 1710.79, 'R16-N': 1663.22, 'R1-A': 2524.94, 'R8-A': 2078.44, 'R16-A': 2216.23, 'CAL-8N': 2029.69, 'CSL-8N': 1730.87, 'CSL-16N': 2319.24, 'CAL-8A': 2177.42, 'CSL-8A': 1879.25, 'CSL-16A': 2516.39, 'RP1Q': 1734.93, 'GI': 980.22, 'R1-B': 1632.57 },
  DF: { 'R1-N': 2469.90, 'R8-N': 1975.01, 'R16-N': 1902.55, 'R1-A': 2978.64, 'R8-A': 2396.79, 'R16-A': 2478.53, 'CAL-8N': 2231.75, 'CSL-8N': 1946.55, 'CSL-16N': 2596.89, 'CAL-8A': 2403.86, 'CSL-8A': 2155.04, 'CSL-16A': 2868.27, 'RP1Q': 2076.29, 'GI': 1114.64, 'R1-B': 1961.16 },
  ES: { 'R1-N': 2776.19, 'R8-N': 2145.93, 'R16-N': 2078.86, 'R1-A': 3309.49, 'R8-A': 2654.94, 'R16-A': 2717.37, 'CAL-8N': 2437.03, 'CSL-8N': 2090.00, 'CSL-16N': 2784.66, 'CAL-8A': 2648.92, 'CSL-8A': 2321.83, 'CSL-16A': 3085.77, 'RP1Q': 2221.01, 'GI': 1173.54, 'R1-B': 2242.89 },
  GO: { 'R1-N': 2283.95, 'R8-N': 1797.33, 'R16-N': 1743.62, 'R1-A': 2743.68, 'R8-A': 2212.84, 'R16-A': 2301.85, 'CAL-8N': 2050.91, 'CSL-8N': 1787.63, 'CSL-16N': 2387.92, 'CAL-8A': 2191.57, 'CSL-8A': 1949.14, 'CSL-16A': 2599.22, 'RP1Q': 1787.15, 'GI': 1013.34, 'R1-B': 1824.21 },
  MA: { 'R1-N': 2022.51, 'R8-N': 1618.57, 'R16-N': 1570.27, 'R1-A': 2352.05, 'R8-A': 1953.46, 'R16-A': 2056.41, 'CAL-8N': 1902.80, 'CSL-8N': 1620.10, 'CSL-16N': 2165.78, 'CAL-8A': 2031.26, 'CSL-8A': 1762.48, 'CSL-16A': 2344.47, 'RP1Q': 1645.02, 'GI': 900.89, 'R1-B': 1692.97 },
  MT: { 'R1-N': 3260.74, 'R8-N': 2641.52, 'R16-N': 2549.29, 'R1-A': 3809.69, 'R8-A': 3173.24, 'R16-A': 3337.93, 'CAL-8N': 3119.48, 'CSL-8N': 2643.78, 'CSL-16N': 3545.63, 'CAL-8A': 3352.59, 'CSL-8A': 2880.06, 'CSL-16A': 3845.46, 'RP1Q': 2566.08, 'GI': 1423.67, 'R1-B': 2711.79 },
  MS: { 'R1-N': 1948.23, 'R8-N': 1613.63, 'R16-N': 1570.44, 'R1-A': 2298.54, 'R8-A': 1942.54, 'R16-A': 2080.45, 'CAL-8N': 1915.00, 'CSL-8N': 1636.78, 'CSL-16N': 2197.42, 'CAL-8A': 2045.50, 'CSL-8A': 1789.71, 'CSL-16A': 2396.45, 'RP1Q': 1585.27, 'GI': 902.83, 'R1-B': 1597.92 },
  MG: { 'R1-N': 2715.92, 'R8-N': 2154.34, 'R16-N': 2086.89, 'R1-A': 3254.85, 'R8-A': 2637.46, 'R16-A': 2734.75, 'CAL-8N': 2491.12, 'CSL-8N': 2131.05, 'CSL-16N': 2844.80, 'CAL-8A': 2686.28, 'CSL-8A': 2334.26, 'CSL-16A': 3114.61, 'RP1Q': 2204.40, 'GI': 1157.35, 'R1-B': 2176.98 },
  PA: { 'R1-N': 2378.54, 'R8-N': 1930.49, 'R16-N': 1869.32, 'R1-A': 2900.50, 'R8-A': 2378.15, 'R16-A': 2486.90, 'CAL-8N': 2197.08, 'CSL-8N': 1915.57, 'CSL-16N': 2562.43, 'CAL-8A': 2334.98, 'CSL-8A': 2075.16, 'CSL-16A': 2776.42, 'RP1Q': 1955.73, 'GI': 1079.47, 'R1-B': 1856.58 },
  PB: { 'R1-N': 2010.41, 'R8-N': 1542.76, 'R16-N': 1484.52, 'R1-A': 2392.51, 'R8-A': 1888.88, 'R16-A': 2002.65, 'CAL-8N': 1772.99, 'CSL-8N': 1548.34, 'CSL-16N': 2072.22, 'CAL-8A': 1887.68, 'CSL-8A': 1669.93, 'CSL-16A': 2235.30, 'RP1Q': 1624.64, 'GI': 935.25, 'R1-B': 1628.30 },
  PR: { 'R1-N': 2778.29, 'R8-N': 2226.95, 'R16-N': 2156.01, 'R1-A': 3357.61, 'R8-A': 2710.35, 'R16-A': 2763.34, 'CAL-8N': 2541.11, 'CSL-8N': 2196.38, 'CSL-16N': 2930.48, 'CAL-8A': 2720.80, 'CSL-8A': 2420.62, 'CSL-16A': 3229.42, 'RP1Q': 2334.76, 'GI': 1224.13, 'R1-B': 2198.96 },
  PE: { 'R1-N': 2435.60, 'R8-N': 1882.00, 'R16-N': 1837.69, 'R1-A': 2898.61, 'R8-A': 2327.69, 'R16-A': 2394.14, 'CAL-8N': 2217.62, 'CSL-8N': 1879.12, 'CSL-16N': 2501.90, 'CAL-8A': 2383.83, 'CSL-8A': 2081.42, 'CSL-16A': 2761.90, 'RP1Q': 1878.17, 'GI': 1053.95, 'R1-B': 1972.59 },
  PI: { 'R1-N': 2784.19, 'R8-N': 2058.79, 'R16-N': 2008.94, 'R1-A': 3449.38, 'R8-A': 2693.05, 'R16-A': 2582.83, 'CAL-8N': 2367.19, 'CSL-8N': 2001.83, 'CSL-16N': 2657.45, 'CAL-8A': 2552.40, 'CSL-8A': 2190.06, 'CSL-16A': 2911.78, 'RP1Q': 2014.62, 'GI': 1155.97, 'R1-B': 2119.00 }, // Jan/23
  RJ: { 'R1-N': 2648.97, 'R8-N': 2115.18, 'R16-N': 2053.27, 'R1-A': 3186.66, 'R8-A': 2550.38, 'R16-A': 2698.80, 'CAL-8N': 2466.87, 'CSL-8N': 2110.66, 'CSL-16N': 2811.77, 'CAL-8A': 2633.44, 'CSL-8A': 2297.41, 'CSL-16A': 3057.85, 'RP1Q': 2213.10, 'GI': 1184.66, 'R1-B': 2111.27 },
  RN: { 'R1-N': 2416.57, 'R8-N': 1902.11, 'R16-N': 1841.38, 'R1-A': 2865.61, 'R8-A': 2384.63, 'R16-A': 2431.58, 'CAL-8N': 2241.47, 'CSL-8N': 1918.15, 'CSL-16N': 2547.94, 'CAL-8A': 2387.00, 'CSL-8A': 2077.25, 'CSL-16A': 2761.71, 'RP1Q': 1808.51, 'GI': 1089.95, 'R1-B': 1967.53 }, // Fev/23
  RS: { 'R1-N': 2930.64, 'R8-N': 2366.53, 'R16-N': 2317.34, 'R1-A': 3713.51, 'R8-A': 3008.51, 'R16-A': 3065.62, 'CAL-8N': 3038.16, 'CSL-8N': 2362.85, 'CSL-16N': 3178.46, 'CAL-8A': 3449.92, 'CSL-8A': 2716.29, 'CSL-16A': 3653.28, 'RP1Q': 2192.42, 'GI': 1207.77, 'R1-B': 2147.76 },
  RO: { 'R1-N': 2295.11, 'R8-N': 1837.70, 'R16-N': 1804.66, 'R1-A': 2703.33, 'R8-A': 2214.00, 'R16-A': 2363.42, 'CAL-8N': 2262.83, 'CSL-8N': 1876.20, 'CSL-16N': 2512.42, 'CAL-8A': 2404.68, 'CSL-8A': 2027.77, 'CSL-16A': 2695.05, 'RP1Q': 1809.63, 'GI': 1047.66, 'R1-B': 1886.88 },
  RR: { 'R1-N': 2893.59, 'R8-N': 2160.62, 'R16-N': 2091.32, 'R1-A': 3570.07, 'R8-A': 2886.12, 'R16-A': 2827.91, 'CAL-8N': 2621.92, 'CSL-8N': 2200.68, 'CSL-16N': 2936.14, 'CAL-8A': 2867.74, 'CSL-8A': 2488.90, 'CSL-16A': 3297.01, 'RP1Q': 1915.40, 'GI': 1273.66, 'R1-B': 2217.11 },
  SC: { 'R1-N': 2934.58, 'R8-N': 2388.98, 'R16-N': 2306.07, 'R1-A': 3466.60, 'R8-A': 2817.71, 'R16-A': 2995.80, 'CAL-8N': 2759.95, 'CSL-8N': 2405.82, 'CSL-16N': 3218.86, 'CAL-8A': 2918.39, 'CSL-8A': 2604.53, 'CSL-16A': 3474.17, 'RP1Q': 2565.06, 'GI': 1354.63, 'R1-B': 2402.56 },
  SP: { 'R1-N': 2331.52, 'R8-N': 1909.14, 'R16-N': 1852.07, 'R1-A': 2793.65, 'R8-A': 2257.89, 'R16-A': 2427.94, 'CAL-8N': 2212.87, 'CSL-8N': 1918.87, 'CSL-16N': 2556.11, 'CAL-8A': 2338.97, 'CSL-8A': 2063.44, 'CSL-16A': 2700.41, 'RP1Q': 2023.69, 'GI': 1094.10, 'R1-B': 1869.38 },
  SE: { 'R1-N': 2208.32, 'R8-N': 1802.19, 'R16-N': 1756.07, 'R1-A': 2740.22, 'R8-A': 2243.89, 'R16-A': 2329.14, 'CAL-8N': 2008.40, 'CSL-8N': 1720.99, 'CSL-16N': 2366.09, 'CAL-8A': 2124.28, 'CSL-8A': 1885.36, 'CSL-16A': 2584.17, 'RP1Q': 1758.09, 'GI': 997.83, 'R1-B': 1676.42 },
  TO: { 'R1-N': 1814.00, 'R8-N': 1358.38, 'R16-N': 1307.53, 'R1-A': 2159.24, 'R8-A': 1644.94, 'R16-A': 1709.93, 'CAL-8N': 1557.23, 'CSL-8N': 1330.11, 'CSL-16N': 1757.34, 'CAL-8A': 1666.07, 'CSL-8A': 1450.78, 'CSL-16A': 1918.08, 'RP1Q': 1324.05, 'GI': 709.5, 'R1-B': 1468.75 }, // Maio/19
};

export const availableStates = Object.keys(cubData);