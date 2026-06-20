export class ProductRanking {
  constructor(
    public readonly productId: string,
    public readonly productCategory: string,
    public readonly totalSold: number,
    public readonly revenue: number,
  ) {}
}
