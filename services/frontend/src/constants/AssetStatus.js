export class AssetStatus {
    static AVAILABLE = 'AVAILABLE';
    static LOANED = 'LOANED';
    static RESERVED = 'RESERVED';
    static DELETED = 'DELETED';
  
    // Convert a string to enum (e.g., 'available' -> StatusEnum.AVAILABLE)
    static fromString(status) {
      return Object.values(AssetStatus).includes(status) ? status : null;
    }
  
    // Convert an enum to string (if needed)
    static toString(enumValue) {
      return Object.values(AssetStatus).includes(enumValue) ? enumValue : null;
    }
}