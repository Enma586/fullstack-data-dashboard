export class FilterParamsDto {
  public readonly from?: Date;
  public readonly to?: Date;
  public readonly customerState?: string;
  public readonly paymentType?: string;

  protected constructor(params: Record<string, string | undefined>) {
    const from = params.from ?? params['from'];
    const to = params.to ?? params['to'];
    const customerState = params.customer_state ?? params.customerState;
    const paymentType = params.payment_type ?? params.paymentType;

    if (from) {
      const d = new Date(from);
      if (isNaN(d.getTime())) {
        throw new Error('Parametro invalido: from debe ser una fecha YYYY-MM-DD');
      }
      this.from = d;
    }

    if (to) {
      const d = new Date(to);
      if (isNaN(d.getTime())) {
        throw new Error('Parametro invalido: to debe ser una fecha YYYY-MM-DD');
      }
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      this.to = nextDay;
    }

    if (customerState) {
      if (!/^[A-Z]{2}$/.test(customerState.toUpperCase())) {
        throw new Error(
          'Parametro invalido: customer_state debe ser un codigo de estado de 2 letras (ej. SP)',
        );
      }
      this.customerState = customerState.toUpperCase();
    }

    if (paymentType) {
      const validTypes = ['credit_card', 'boleto', 'voucher', 'debit_card'];
      const normalized = paymentType.toLowerCase();
      if (!validTypes.includes(normalized)) {
        throw new Error(
          `Parametro invalido: payment_type debe ser uno de: ${validTypes.join(', ')}`,
        );
      }
      this.paymentType = normalized;
    }
  }

  static fromQuery(
    query: Record<string, string | undefined>,
  ): FilterParamsDto {
    return new FilterParamsDto(query);
  }

  toFilters() {
    return {
      from: this.from,
      to: this.to,
      customerState: this.customerState,
      paymentType: this.paymentType,
    };
  }
}
