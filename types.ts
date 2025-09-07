
export enum Page {
  Home,
  BlueprintOptions,
  BlueprintResults,
  Architecture,
  InteriorDesign,
  Gallery,
}

export type Theme = 'light' | 'dark';

export interface BlueprintOptions {
  goal: string;
  plotWidth: number;
  plotDepth: number;
  units: 'Feet' | 'Meters';
  floors: number;
  variations: number;
}

export interface Blueprint {
  id: string;
  imageDataUrl: string;
}

export interface RoomComponent {
  id: string;
  name: string;
  architectureImageUrl?: string;
  interiorImageUrl?: string;
  interiorStyle?: string;
}

export interface Gallery {
    blueprint: Blueprint | null;
    isometricView?: RoomComponent;
    architecture: RoomComponent[];
    interior: RoomComponent[];
}