export interface BedGroup {
  id: string;
  label: string;
  count: number;
  spacingInCentimeters: number;
  widthInCentimeters: number;
  lengthInMeters: number;
}

export interface BedGroupGuiPosition {
  x: number;
  y: number;
  rotation: number;
}

export const DEFAULT_BED_GROUP: BedGroup = {
  id: '',
  label: '',
  lengthInMeters: 10,
  count: 1,
  spacingInCentimeters: 30,
  widthInCentimeters: 60,
};
