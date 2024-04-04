export interface BedGroup {
  id: string;
  label: string;
  count: number;
  spacingInCentimeters: number;
  widthInCentimeters: number;
  lengthInMeters: number;
}

export interface BedGroupPosition {
  id: string;
  latitude: number;
  longitude: number;
  x: number;
  y: number;
  bearing: number;
}

export const DEFAULT_BED_GROUP: BedGroup = {
  id: '',
  label: '',
  lengthInMeters: 10,
  count: 1,
  spacingInCentimeters: 30,
  widthInCentimeters: 60,
};
