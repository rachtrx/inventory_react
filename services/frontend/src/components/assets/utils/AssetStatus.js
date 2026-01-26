export class AssetStatus {
  static AVAILABLE = 'Available';
  static LOANED = 'On Loan';
  static RESERVED = 'Reserved';
  static DELETED = 'Condemned';

  static getAllValues() {
      return Object.values(this);
  }

  static toString(status) {
    return this[status] || 'Unknown Status';
  }
}