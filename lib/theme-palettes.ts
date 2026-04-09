export type ThemePalette = {
  id: string;
  name: string;
  primary: string;
  surface: string;
  accent: string;
  secondary: string;
  highlight: string;
};

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: 'sun-bloom',
    name: 'Sun Bloom',
    primary: '#F6BD60',
    surface: '#F7EDE2',
    accent: '#F5CAC3',
    secondary: '#84A59D',
    highlight: '#F28482',
  },
  {
    id: 'peach-sage',
    name: 'Peach Sage',
    primary: '#F5CAC3',
    surface: '#F7EDE2',
    accent: '#84A59D',
    secondary: '#F6BD60',
    highlight: '#F28482',
  },
  {
    id: 'sage-coral',
    name: 'Sage Coral',
    primary: '#84A59D',
    surface: '#F7EDE2',
    accent: '#F28482',
    secondary: '#F6BD60',
    highlight: '#F5CAC3',
  },
  {
    id: 'coral-dune',
    name: 'Coral Dune',
    primary: '#F28482',
    surface: '#F7EDE2',
    accent: '#F6BD60',
    secondary: '#84A59D',
    highlight: '#F5CAC3',
  },
  {
    id: 'cream-grove',
    name: 'Cream Grove',
    primary: '#F7EDE2',
    surface: '#F6BD60',
    accent: '#F5CAC3',
    secondary: '#84A59D',
    highlight: '#F28482',
  },
  {
    id: 'electric-indigo',
    name: 'Electric Indigo',
    primary: '#5B4BFF',
    surface: '#EDEBFF',
    accent: '#00C2FF',
    secondary: '#1F2A44',
    highlight: '#FF6B6B',
  },
  {
    id: 'aurora-jade',
    name: 'Aurora Jade',
    primary: '#00A878',
    surface: '#E8FFF6',
    accent: '#2D5BFF',
    secondary: '#173B2E',
    highlight: '#FFB703',
  },
  {
    id: 'ruby-ocean',
    name: 'Ruby Ocean',
    primary: '#D72663',
    surface: '#FFEAF2',
    accent: '#1E88E5',
    secondary: '#2A1B3D',
    highlight: '#00BFA6',
  },
  {
    id: 'copper-violet',
    name: 'Copper Violet',
    primary: '#FF7A00',
    surface: '#FFF1E6',
    accent: '#6A00F4',
    secondary: '#173B5E',
    highlight: '#00C9A7',
  },
];

export const DEFAULT_THEME_PALETTE = THEME_PALETTES[0];
