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
