export class RevenueTrend {
  constructor(
    public readonly period: string,
    public readonly revenue: number,
    public readonly orderCount: number,
  ) {}
}
