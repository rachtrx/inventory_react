export class AssetStatus {
  static AVAILABLE = 'Available';
  static ON_LOAN = 'On Loan';
  static RESERVED = 'Reserved';
  static CONDEMNED = 'Condemned';

  static getAllValues() {
      return Object.values(this);
  }
}